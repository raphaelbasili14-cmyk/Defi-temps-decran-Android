import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'pause-active-settings-v1';

export type AppData = {
  dailyLimitMinutes: number;
  bonusMinutes: number;
  extraMinutesToday: number;
  challengesToday: number;
  dayKey: string;
};

type AppDataContextValue = {
  data: AppData;
  isReady: boolean;
  storageError: string | null;
  adjustDailyLimit: (delta: number) => Promise<void>;
  adjustBonusMinutes: (delta: number) => Promise<void>;
  addChallengeBonus: () => Promise<void>;
};

const getDayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDefaults = (): AppData => ({
  dailyLimitMinutes: 180,
  bonusMinutes: 10,
  extraMinutesToday: 0,
  challengesToday: 0,
  dayKey: getDayKey(),
});

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = useState<AppData>(createDefaults);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<AppData>;
          const defaults = createDefaults();
          const sameDay = parsed.dayKey === defaults.dayKey;
          setData({
            dailyLimitMinutes:
              typeof parsed.dailyLimitMinutes === 'number'
                ? Math.min(600, Math.max(30, parsed.dailyLimitMinutes))
                : defaults.dailyLimitMinutes,
            bonusMinutes:
              typeof parsed.bonusMinutes === 'number'
                ? Math.min(30, Math.max(5, parsed.bonusMinutes))
                : defaults.bonusMinutes,
            extraMinutesToday:
              sameDay && typeof parsed.extraMinutesToday === 'number'
                ? Math.max(0, parsed.extraMinutesToday)
                : 0,
            challengesToday:
              sameDay && typeof parsed.challengesToday === 'number'
                ? Math.max(0, parsed.challengesToday)
                : 0,
            dayKey: defaults.dayKey,
          });
        }
        setIsReady(true);
      })
      .catch(() => {
        if (!active) return;
        setStorageError(
          'Les réglages locaux n’ont pas pu être chargés. Ils seront réessayés lors de la prochaine ouverture.',
        );
        setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback(async (nextData: AppData) => {
    setData(nextData);
    setStorageError(null);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch {
      setStorageError(
        'La sauvegarde locale a échoué. Vérifiez l’espace disponible sur votre téléphone.',
      );
    }
  }, []);

  const adjustDailyLimit = useCallback(
    async (delta: number) => {
      const next = Math.min(600, Math.max(30, data.dailyLimitMinutes + delta));
      await commit({ ...data, dailyLimitMinutes: next });
    },
    [commit, data],
  );

  const adjustBonusMinutes = useCallback(
    async (delta: number) => {
      const next = Math.min(30, Math.max(5, data.bonusMinutes + delta));
      await commit({ ...data, bonusMinutes: next });
    },
    [commit, data],
  );

  const addChallengeBonus = useCallback(async () => {
    const currentDay = getDayKey();
    const current =
      data.dayKey === currentDay
        ? data
        : { ...data, extraMinutesToday: 0, challengesToday: 0, dayKey: currentDay };
    await commit({
      ...current,
      extraMinutesToday: current.extraMinutesToday + current.bonusMinutes,
      challengesToday: current.challengesToday + 1,
    });
  }, [commit, data]);

  const value = useMemo(
    () => ({
      data,
      isReady,
      storageError,
      adjustDailyLimit,
      adjustBonusMinutes,
      addChallengeBonus,
    }),
    [
      data,
      isReady,
      storageError,
      adjustDailyLimit,
      adjustBonusMinutes,
      addChallengeBonus,
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider.');
  }
  return context;
}
