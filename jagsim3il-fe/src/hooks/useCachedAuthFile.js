import { useEffect, useState } from 'react';
import { getCachedAuthFileUri } from '../utils/authFileCache';

// 인증 보호 원격 파일 source → 캐시된 로컬 file:// URI
// source: { uri, headers?: { Authorization } } | null
export function useCachedAuthFile(source) {
  const [uri, setUri] = useState(null);
  const [loading, setLoading] = useState(!!source?.uri);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!source?.uri) {
      setUri(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;

    const resolve = async () => {
      setLoading(true);
      setError(null);

      try {
        const authHeader = source.headers?.Authorization;
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.slice(7)
          : authHeader ?? null;

        const localUri = authHeader
          ? await getCachedAuthFileUri(source.uri, token)
          : source.uri;

        if (!cancelled) {
          setUri(localUri);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setUri(null);
          setLoading(false);
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [source?.uri, source?.headers?.Authorization]);

  return { uri, loading, error };
}
