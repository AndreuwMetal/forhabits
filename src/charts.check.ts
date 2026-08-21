// Self-check de src/charts.ts. Sin frameworks: solo node:assert/strict.
import assert from './assert.ts';
import { type Habit, type Logs, addDays, toKey } from './types.ts';
import { averagePct, dailySeries, habitCompletion, rangeAverage, weekdayCompletion } from './charts.ts';

export function checkCharts() {
  const today = new Date(2026, 7, 21); // viernes 21/08/2026
  const dk = (n: number) => toKey(addDays(today, n)); // fecha n días desde hoy (n negativo = pasado)

  // ── 1. Días sin hábitos programados (due === 0) no cuentan en las medias ──
  {
    const mondayOnly: Habit = {
      id: 'gym',
      name: 'Gimnasio',
      emoji: '🏋️',
      periodicity: { type: 'weekdays', days: [1] }, // solo lunes
      createdAt: addDays(today, -60).toISOString(),
    };
    const logs: Logs = { [dk(-4)]: { gym: true } }; // lunes anterior (hoy-4 = lunes 17/08)
    const series = dailySeries([mondayOnly], logs, 7, today);
    assert.equal(series.length, 7);

    const withHabit = series.filter((p) => p.due > 0);
    assert.equal(withHabit.length, 1, 'solo un lunes en el rango de 7 días');
    assert.equal(withHabit[0].dateKey, dk(-4));
    assert.equal(withHabit[0].done, 1);
    assert.equal(withHabit[0].pct, 100);

    const withoutHabit = series.filter((p) => p.due === 0);
    assert.equal(withoutHabit.length, 6);
    for (const p of withoutHabit) assert.equal(p.pct, null, 'sin due, pct debe ser null, no 0');

    // la media debe ignorar los 6 días sin datos, no promediarlos como 0%
    assert.equal(averagePct(series), 100);
  }

  // ── 2. Rango que empieza antes de createdAt del hábito ──
  {
    const recent: Habit = {
      id: 'agua',
      name: 'Beber agua',
      emoji: '💧',
      periodicity: { type: 'daily' },
      createdAt: addDays(today, -2).toISOString(), // creado hace 2 días
    };
    const logs: Logs = {
      [dk(-2)]: { agua: true },
      [dk(-1)]: { agua: false },
      [dk(0)]: { agua: true },
    };
    // rango de 5 días: hoy-4 .. hoy, pero el hábito solo existe desde hoy-2
    const series = dailySeries([recent], logs, 5, today);
    assert.equal(series.length, 5);
    assert.equal(series[0].dateKey, dk(-4));
    // los 2 días previos a la creación no cuentan como incumplidos: due 0, pct null
    assert.equal(series[0].due, 0);
    assert.equal(series[0].pct, null);
    assert.equal(series[1].due, 0);
    assert.equal(series[1].pct, null);
    // desde la creación sí cuentan
    assert.equal(series[2].due, 1);
    assert.equal(series[2].done, 1);

    const [stat] = habitCompletion([recent], logs, 5, today);
    assert.equal(stat.due, 3, 'solo los 3 días desde createdAt, no los 5 del rango');
    assert.equal(stat.done, 2);
    assert.equal(stat.pct, 67);
  }

  // ── 3. Porcentajes y medias con due variable entre días (avg no ponderada vs ponderada) ──
  {
    const daily: Habit = {
      id: 'daily',
      name: 'Diario',
      emoji: '⭐',
      periodicity: { type: 'daily' },
      createdAt: addDays(today, -100).toISOString(),
    };
    const mondayOnly: Habit = {
      id: 'gym',
      name: 'Gimnasio',
      emoji: '🏋️',
      periodicity: { type: 'weekdays', days: [1] },
      createdAt: addDays(today, -100).toISOString(),
    };
    // rango de 5 días (hoy-4 = lunes .. hoy = viernes): el lunes tiene due=2, el resto due=1
    const logs: Logs = {
      [dk(-4)]: { daily: true, gym: true }, // lunes: due=2, done=2 -> 100%
      [dk(-3)]: { daily: true }, // martes: due=1, done=1 -> 100%
      [dk(-2)]: { daily: false }, // miércoles: due=1, done=0 -> 0%
      [dk(-1)]: { daily: true }, // jueves: due=1, done=1 -> 100%
      [dk(0)]: { daily: true }, // viernes: due=1, done=1 -> 100%
    };
    const series = dailySeries([daily, mondayOnly], logs, 5, today);
    assert.equal(series.length, 5);
    // lunes (hoy-4): due=2, done=2, pct=100
    assert.equal(series[0].due, 2);
    assert.equal(series[0].done, 2);
    assert.equal(series[0].pct, 100);
    // resto de días: due=1 (solo el hábito diario)
    assert.equal(series[1].pct, 100);
    assert.equal(series[2].pct, 0);
    assert.equal(series[3].pct, 100);
    assert.equal(series[4].pct, 100);

    // media no ponderada de los % diarios (100+100+0+100+100)/5 = 80
    assert.equal(averagePct(series), 80);
    // media ponderada global: done total 5 / due total 6 = 83% (redondeado), distinta de la anterior
    assert.equal(rangeAverage([daily, mondayOnly], logs, 5, today), 83);
    assert.notEqual(averagePct(series), rangeAverage([daily, mondayOnly], logs, 5, today));
  }

  // ── 4. Series vacías: sin hábitos, todo son días sin datos ──
  {
    const series = dailySeries([], {}, 7, today);
    assert.equal(series.length, 7);
    assert.ok(series.every((p) => p.due === 0 && p.done === 0 && p.pct === null));
    assert.equal(averagePct(series), null, 'sin datos, la media es null, no 0');
    assert.equal(rangeAverage([], {}, 7, today), null);
    assert.deepEqual(habitCompletion([], {}, 7, today), []);

    const byDay = weekdayCompletion([], {}, 7, today);
    assert.equal(byDay.length, 7);
    assert.ok(byDay.every((p) => p.pct === null));
  }

  // ── 5. Agregación por día de la semana: índice 0 = lunes (coherente con WEEKDAY_LETTERS) ──
  {
    const daily: Habit = {
      id: 'daily',
      name: 'Diario',
      emoji: '⭐',
      periodicity: { type: 'daily' },
      createdAt: addDays(today, -100).toISOString(),
    };
    // hoy-4 = lunes 17/08/2026, único día completado en un rango de 7 (hoy-6..hoy)
    const monday = dk(-4);
    assert.equal(new Date(2026, 7, 17).getDay(), 1, 'fijamos que hoy-4 sea lunes');
    const logs: Logs = { [monday]: { daily: true } };
    const byDay = weekdayCompletion([daily], logs, 7, today);
    assert.equal(byDay.length, 7);
    assert.equal(byDay[0].weekday, 0);
    assert.equal(byDay[0].due, 1);
    assert.equal(byDay[0].done, 1, 'el lunes agregado debe caer en el índice 0');
    for (let i = 1; i < 7; i++) {
      assert.equal(byDay[i].due, 1);
      assert.equal(byDay[i].done, 0);
    }
  }
}
