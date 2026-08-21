// Self-check de la lógica del podio, sin frameworks: solo node:assert.
// Todas las fechas se calculan relativas a "hoy" para que el check sea
// determinista sin importar el día en que se ejecute.
import assert from './assert.ts';
import { type Habit, type Logs, addDays, toKey } from './types.ts';
import { bestStreak, habitStreak, podium } from './podium.ts';

function makeHabit(id: string, name: string, createdAtOffsetDays: number, days?: number[]): Habit {
  return {
    id,
    name,
    emoji: '🔥',
    periodicity: days ? { type: 'weekdays', days } : { type: 'daily' },
    createdAt: addDays(new Date(), -createdAtOffsetDays).toISOString(),
  };
}

/** Marca el log de un hábito en el día "hoy - offset" días. */
function log(logs: Logs, habit: Habit, offset: number, done: boolean) {
  const key = toKey(addDays(new Date(), -offset));
  logs[key] = { ...(logs[key] ?? {}), [habit.id]: done };
}

export function checkPodium() {
  // 1. Racha actual básica: hoy y los 2 días previos completados.
  {
    const h = makeHabit('a', 'Racha básica', 5);
    const logs: Logs = {};
    log(logs, h, 0, true);
    log(logs, h, 1, true);
    log(logs, h, 2, true);
    log(logs, h, 3, false);
    assert.equal(habitStreak(h, logs), 3, 'racha actual debe contar hoy + 2 días previos');
  }

  // 2. Hoy programado y sin registrar: la racha empieza a contar desde ayer,
  // y que hoy esté explícitamente incompleto no rompe el conteo de ayer hacia atrás.
  {
    const h = makeHabit('b', 'Sin registrar hoy', 5);
    const logs: Logs = {};
    log(logs, h, 1, true);
    log(logs, h, 2, true);
    log(logs, h, 3, true);
    // hoy (offset 0) no se registra en absoluto
    assert.equal(habitStreak(h, logs), 3, 'racha debe empezar en ayer si hoy no está registrado');

    const h2 = makeHabit('b2', 'Hoy incompleto', 5);
    const logs2: Logs = {};
    log(logs2, h2, 0, false); // hoy marcado explícitamente como no hecho
    log(logs2, h2, 1, true);
    log(logs2, h2, 2, true);
    assert.equal(
      habitStreak(h2, logs2),
      2,
      'hoy incompleto no debe romper el conteo de ayer hacia atrás'
    );
  }

  // 3. Mejor racha histórica distinta de la racha actual: una racha de 5 días
  // en el pasado, rota, y solo 1 día de racha actual.
  {
    const h = makeHabit('c', 'Mejor racha pasada', 10);
    const logs: Logs = {};
    // racha antigua de 5 días (offsets 10..6)
    for (let off = 10; off >= 6; off--) log(logs, h, off, true);
    log(logs, h, 5, false); // rotura
    log(logs, h, 4, false);
    log(logs, h, 3, false);
    log(logs, h, 2, false);
    log(logs, h, 1, false); // ayer no completado -> racha actual corta
    log(logs, h, 0, true); // hoy sí

    assert.equal(habitStreak(h, logs), 1, 'racha actual debe ser 1 (solo hoy)');
    assert.equal(bestStreak(h, logs), 5, 'mejor racha histórica debe ser 5');
  }

  // 4. Periodicidad por días concretos + días no programados que no rompen
  // la racha: hábito que no toca un día concreto de la semana. En una
  // ventana de 7 días consecutivos ese día aparece exactamente una vez, así
  // que hay 6 días programados; si todos están completados, la racha es 6
  // aunque el día no programado esté (incorrectamente) marcado como falso.
  {
    const todayDow = new Date().getDay();
    const excludedDow = (todayDow + 1) % 7; // día que nunca toca
    const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== excludedDow);
    const h = makeHabit('d', 'Días concretos', 6, days);
    const logs: Logs = {};
    for (let off = 0; off <= 6; off++) {
      const date = addDays(new Date(), -off);
      const dow = date.getDay();
      log(logs, h, off, dow !== excludedDow); // día no programado: false, no debería importar
    }
    assert.equal(
      habitStreak(h, logs),
      6,
      'días no programados no deben romper ni sumar a la racha'
    );
    assert.equal(bestStreak(h, logs), 6, 'mejor racha debe coincidir con los 6 días programados');
  }

  // 5. Empates: mismo current y mismo best -> desempate por nombre.
  {
    const high = makeHabit('h', 'Con más racha', 5);
    const zebra = makeHabit('z', 'Zebra', 3);
    const ana = makeHabit('n', 'Ana', 3);
    const logs: Logs = {};
    log(logs, high, 0, true);
    log(logs, high, 1, true);
    log(logs, high, 2, true);
    log(logs, high, 3, true);
    log(logs, high, 4, true); // racha de 5, la más alta

    for (const h of [zebra, ana]) {
      log(logs, h, 0, true);
      log(logs, h, 1, true); // racha de 2 para ambos, mismo best
    }

    const result = podium([zebra, high, ana], logs);
    assert.equal(result[0].habit.id, 'h', 'la racha más alta debe ir primero');
    assert.equal(result[1].habit.id, 'n', 'en empate, Ana debe ir antes que Zebra');
    assert.equal(result[2].habit.id, 'z', 'Zebra debe quedar última en el empate');
  }

  // 6. Sin hábitos: podio vacío.
  {
    assert.deepEqual(podium([], {}), []);
  }
}
