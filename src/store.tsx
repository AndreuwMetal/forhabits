import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog, Habit, Logs } from './types';
import { hasBackend } from './config';
import { fetchPremium } from './billing';

const HABITS_KEY = 'forhabits.habits.v1';
const LOGS_KEY = 'forhabits.logs.v1';
const FIRST_USE_KEY = 'forhabits.firstUse.v1';
const NOTIF_TIME_KEY = 'forhabits.notifTime.v1';
const PREMIUM_KEY = 'forhabits.premium.v1';

interface Store {
  ready: boolean;
  habits: Habit[];
  logs: Logs;
  /** ISO del día en que se abrió la app por primera vez */
  firstUse: string;
  /** hora "HH:MM" a la que se envía la notificación DailyLog */
  notifTime: string;
  setNotifTime: (t: string) => void;
  /**
   * Con backend configurado viene de Supabase (`profiles.is_premium`), cacheado
   * en AsyncStorage. Sin backend es el flag local de desarrollo de siempre.
   */
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  /** Repite la lectura del estado premium en el servidor; no-op sin backend */
  refreshPremium: () => Promise<void>;
  addHabit: (h: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  removeHabit: (id: string) => void;
  saveDayLog: (dateKey: string, log: DayLog) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Logs>({});
  const [firstUse, setFirstUse] = useState<string>(new Date().toISOString());
  const [notifTime, setNotifTimeState] = useState('21:00');
  const [isPremium, setIsPremium] = useState(false);

  const refreshPremium = useCallback(async () => {
    if (!hasBackend) return;
    try {
      const premium = await fetchPremium();
      setIsPremium(premium);
      AsyncStorage.setItem(PREMIUM_KEY, premium ? '1' : '0').catch(() => {});
    } catch (e) {
      // sin red o servidor caído: nos quedamos con el último valor cacheado
      console.warn('No se pudo comprobar el estado premium', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [h, l, f, nt, p] = await Promise.all([
          AsyncStorage.getItem(HABITS_KEY),
          AsyncStorage.getItem(LOGS_KEY),
          AsyncStorage.getItem(FIRST_USE_KEY),
          AsyncStorage.getItem(NOTIF_TIME_KEY),
          AsyncStorage.getItem(PREMIUM_KEY),
        ]);
        if (h) setHabits(JSON.parse(h));
        if (l) setLogs(JSON.parse(l));
        if (nt) setNotifTimeState(nt);
        if (p === '1') setIsPremium(true);
        if (f) {
          setFirstUse(f);
        } else {
          const now = new Date().toISOString();
          setFirstUse(now);
          AsyncStorage.setItem(FIRST_USE_KEY, now).catch(() => {});
        }
      } catch (e) {
        console.warn('No se pudieron cargar los datos', e);
      } finally {
        setReady(true);
        // valor cacheado ya pintado arriba; esto lo confirma contra el servidor
        refreshPremium();
      }
    })();
  }, [refreshPremium]);

  const persistHabits = useCallback((next: Habit[]) => {
    setHabits(next);
    AsyncStorage.setItem(HABITS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const persistLogs = useCallback((next: Logs) => {
    setLogs(next);
    AsyncStorage.setItem(LOGS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addHabit = useCallback(
    (h: Omit<Habit, 'id' | 'createdAt'>) => {
      const habit: Habit = {
        ...h,
        id: `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      persistHabits([...habits, habit]);
    },
    [habits, persistHabits]
  );

  const setNotifTime = useCallback((t: string) => {
    setNotifTimeState(t);
    AsyncStorage.setItem(NOTIF_TIME_KEY, t).catch(() => {});
  }, []);

  const setPremium = useCallback((v: boolean) => {
    setIsPremium(v);
    AsyncStorage.setItem(PREMIUM_KEY, v ? '1' : '0').catch(() => {});
  }, []);

  const updateHabit = useCallback(
    (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
      persistHabits(
        habits.map((h) => (h.id === id ? { ...h, ...data, id: h.id, createdAt: h.createdAt } : h))
      );
    },
    [habits, persistHabits]
  );

  const removeHabit = useCallback(
    (id: string) => {
      persistHabits(habits.filter((h) => h.id !== id));
    },
    [habits, persistHabits]
  );

  const saveDayLog = useCallback(
    (dateKey: string, log: DayLog) => {
      persistLogs({ ...logs, [dateKey]: { ...(logs[dateKey] ?? {}), ...log } });
    },
    [logs, persistLogs]
  );

  return (
    <StoreContext.Provider
      value={{
        ready,
        habits,
        logs,
        firstUse,
        notifTime,
        setNotifTime,
        isPremium,
        setPremium,
        refreshPremium,
        addHabit,
        updateHabit,
        removeHabit,
        saveDayLog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}
