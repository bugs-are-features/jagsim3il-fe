import * as FileSystem from 'expo-file-system';

// 인증 첨부파일(이미지/영상) 디스크 캐시
// 파일명은 해시(UUID)로 전역 고유 → 파일명이 같으면 동일 파일로 취급한다.
const CACHE_DIR = `${FileSystem.cacheDirectory}cert-files/`;

// 동일 파일명 동시 다운로드 dedupe
const inflight = new Map();

// URL 경로에서 파일명 추출 (쿼리스트링 제외)
export function extractCertFileName(url) {
  if (!url) return null;
  const path = String(url).split('?')[0];
  const name = path.split('/').filter(Boolean).pop();
  return name || null;
}

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

function localCacheUri(fileName) {
  return `${CACHE_DIR}${fileName}`;
}

function isLocalUri(uri) {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}

// Bearer 토큰이 필요한 원격 URL → 캐시 hit 시 로컬 file:// URI, miss 시 다운로드 후 반환
export async function getCachedAuthFileUri(remoteUrl, token) {
  if (!remoteUrl) return null;
  if (isLocalUri(remoteUrl)) return remoteUrl;

  const fileName = extractCertFileName(remoteUrl);
  if (!fileName) return remoteUrl;

  await ensureCacheDir();
  const cachedUri = localCacheUri(fileName);

  const info = await FileSystem.getInfoAsync(cachedUri);
  if (info.exists) {
    return cachedUri;
  }

  if (inflight.has(fileName)) {
    return inflight.get(fileName);
  }

  const task = (async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const result = await FileSystem.downloadAsync(remoteUrl, cachedUri, { headers });

      if (result.status < 200 || result.status >= 300) {
        await FileSystem.deleteAsync(cachedUri, { idempotent: true });
        throw new Error(`인증 파일을 불러오지 못했어요. (${result.status})`);
      }

      return result.uri ?? cachedUri;
    } catch (e) {
      await FileSystem.deleteAsync(cachedUri, { idempotent: true });
      throw e;
    } finally {
      inflight.delete(fileName);
    }
  })();

  inflight.set(fileName, task);
  return task;
}
