import { AppState, Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { nativeUsageAccess } from '@/modules/usage-access/src';

export type UsageStatus =
  | 'checking'
  | 'unsupported'
  | 'permission-required'
  | 'ready'
  | 'error';

export function useUsageStats() {
  const [status, setStatus] = useState<UsageStatus>('checking');
  const [todaySeconds, setTodaySeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (Platform.OS !== 'android' || !nativeUsageAccess) {
      setTodaySeconds(null);
      setStatus('unsupported');
      return;
    }

    setStatus('checking');
    setError(null);
    try {
      const permitted = nativeUsageAccess.hasUsageAccess();
      if (!permitted) {
        setTodaySeconds(null);
        setStatus('permission-required');
        return;
      }

      const seconds = await nativeUsageAccess.getTodayScreenTimeSeconds();
      setTodaySeconds(Math.max(0, Math.floor(seconds)));
      setStatus('ready');
    } catch {
      setTodaySeconds(null);
      setError('Android n’a pas pu lire les statistiques d’utilisation.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState === 'active') void refresh();
      },
    );

    return () => subscription.remove();
  }, [refresh]);

  return { status, todaySeconds, error, refresh };
}
