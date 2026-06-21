import { useEffect, useState } from 'react';
import { getCachedAuthFileUri } from '../utils/authFileCache';

// 동일 URL 재조회·로딩 깜빡임 방지 (메모리 캐시)
const resolvedCache = new Map();

function cacheKey(source) {
  if (!source?.uri) return '';
  return `${source.uri}|${source.headers?.Authorization ?? ''}`;
}

// 인증 보호 원격 파일 source → 캐시된 로컬 file:// URI (실패 시 원격 URL + 헤더 fallback)
export function useCachedAuthFile(source) {
  const key = cacheKey(source);
  const hit = key ? resolvedCache.get(key) : null;

  const [uri, setUri] = useState(hit?.uri ?? null);
  const [remoteHeaders, setRemoteHeaders] = useState(hit?.remoteHeaders ?? null);
  const [loading, setLoading] = useState(!!source?.uri && !hit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source?.uri) {
      setUri(null);
      setRemoteHeaders(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const k = cacheKey(source);
    const cached = resolvedCache.get(k);
    if (cached) {
      setUri(cached.uri);
      setRemoteHeaders(cached.remoteHeaders);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    const resolve = async () => {
      setLoading(true);
      setError(null);

      const authHeader = source.headers?.Authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader ?? null;

      if (!authHeader) {
        const next = { uri: source.uri, remoteHeaders: null };
        resolvedCache.set(k, next);
        if (!cancelled) {
          setUri(next.uri);
          setRemoteHeaders(null);
          setLoading(false);
        }
        return;
      }

      try {
        const localUri = await getCachedAuthFileUri(source.uri, token);
        const next = localUri
          ? { uri: localUri, remoteHeaders: null }
          : { uri: source.uri, remoteHeaders: source.headers };
        resolvedCache.set(k, next);
        if (!cancelled) {
          setUri(next.uri);
          setRemoteHeaders(next.remoteHeaders);
          setLoading(false);
        }
      } catch (e) {
        const next = { uri: source.uri, remoteHeaders: source.headers };
        resolvedCache.set(k, next);
        if (!cancelled) {
          setUri(next.uri);
          setRemoteHeaders(next.remoteHeaders);
          setLoading(false);
          setError(e);
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [key, source?.uri, source?.headers?.Authorization]);

  const imageSource = uri
    ? remoteHeaders
      ? { uri, headers: remoteHeaders }
      : { uri }
    : null;

  return { uri, imageSource, loading, error };
}
