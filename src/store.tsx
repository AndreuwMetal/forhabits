import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayLog, Habit, Logs } from './types';

const HABITS_KEY = 'forhabits.habits.v1';
const LOGS_KEY = 'forhabits.logs.v1';
const FIRST_USE_KEY = 'forhabits.firstUse.v1';

interface Store {
  ready: boolean;
  habits: Habit[];
  logs: Logs;
  /** ISO del día en que se abrió la app por primera vez */
  firstUse: string;
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

  useEffect(() => {
    (async () => {
      try {
        const [h, l, f] = await Promise.all([
          AsyncStorage.getItem(HABITS_KEY),
          AsyncStorage.getItem(LOGS_KEY),
          AsyncStorage.getItem(FIRST_USE_KEY),
        ]);
        if (h) setHabits(JSON.parse(h));
        if (l) setLogs(JSON.parse(l));
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
      }
    })();
  }, []);

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
      value={{ ready, habits, logs, firstUse, addHabit, updateHabit, removeHabit, saveDayLog }}
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
