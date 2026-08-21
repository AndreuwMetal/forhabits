import assert from './assert.ts';
import { type Logs, addDays, toKey } from './types.ts';
import {
  type ActiveChallenge,
  CHALLENGES,
  type ChallengeDef,
  DEMO_SUFFIX,
  type RankEntry,
  buildRanking,
  challengeDayIndex,
  compareEntries,
  daysBetween,
  elapsedDays,
  fillDayOf,
  findChallenge,
  hashString,
  isFinished,
  medalFor,
  parseActive,
  rivalCompletedDays,
  simulatedName,
  topWithUser,
  userCompletedDays,
  userPosition,
} from './challenges.ts';

/** Logs con el hábito marcado los `n` primeros días desde `start` */
function logsFrom(start: Date, habitId: string, n: number): Logs {
  const logs: Logs = {};
  for (let d = 0; d < n; d++) logs[toKey(addDays(start, d))] = { [habitId]: true };
  return logs;
}

export function checkChallenges(): void {
  // ── catálogo ──────────────────────────────────────────────────────────────
  assert.equal(CHALLENGES.length, 6);
  assert.equal(new Set(CHALLENGES.map((c) => c.id)).size, CHALLENGES.length);
  for (const c of CHALLENGES) {
    assert.ok(c.days > 0 && c.participants > 1, `catálogo inválido: ${c.id}`);
    assert.ok(c.title.es.length > 0 && c.title.en.length > 0);
  }
  assert.equal(findChallenge('read21')?.days, 21);
  assert.equal(findChallenge('no-existe'), undefined);

  // ── hash ──────────────────────────────────────────────────────────────────
  assert.equal(hashString('read21#0'), hashString('read21#0'));
  assert.notEqual(hashString('read21#0'), hashString('read21#1'));
  assert.ok(hashString('🦊 acentúa ñ') >= 0); // entero sin signo, sin NaN

  // ── cohorte determinista ──────────────────────────────────────────────────
  assert.equal(simulatedName('read21', 3), simulatedName('read21', 3));
  assert.notEqual(simulatedName('read21', 3), simulatedName('move30', 3));
  assert.ok(simulatedName('read21', 3).endsWith(DEMO_SUFFIX));

  // el progreso rival es monótono y nunca supera los días transcurridos
  for (let i = 0; i < 5; i++) {
    let prev = 0;
    for (let d = 0; d <= 30; d++) {
      const done = rivalCompletedDays('read21', i, d);
      assert.ok(done >= prev, 'el progreso rival no puede retroceder');
      assert.ok(done <= d, 'un rival no puede completar más días de los vividos');
      prev = done;
    }
  }
  assert.equal(rivalCompletedDays('read21', 0, 0), 0);
  assert.equal(rivalCompletedDays('read21', 0, -5), 0);
  assert.equal(rivalCompletedDays('read21', 2, 10), rivalCompletedDays('read21', 2, 10));

  // ── fechas ────────────────────────────────────────────────────────────────
  const start = new Date(2026, 0, 10);
  assert.equal(daysBetween(start, start), 0);
  assert.equal(daysBetween(start, addDays(start, 5)), 5);
  assert.equal(daysBetween(addDays(start, 5), start), -5);
  const startedAt = start.toISOString();
  assert.equal(elapsedDays(startedAt, start), 1, 'el día de entrada es el día 1');
  assert.equal(challengeDayIndex(startedAt, 21, start), 1);
  assert.equal(challengeDayIndex(startedAt, 21, addDays(start, 20)), 21);
  assert.equal(challengeDayIndex(startedAt, 21, addDays(start, 99)), 21, 'se recorta al total');
  assert.equal(isFinished(startedAt, 21, addDays(start, 20)), false);
  assert.equal(isFinished(startedAt, 21, addDays(start, 21)), true);

  // ── progreso del usuario ──────────────────────────────────────────────────
  const logs = logsFrom(start, 'h1', 4);
  assert.equal(userCompletedDays(logs, 'h1', startedAt, 21, addDays(start, 3)), 4);
  assert.equal(userCompletedDays(logs, 'h2', startedAt, 21, addDays(start, 3)), 0);
  assert.equal(userCompletedDays({}, 'h1', startedAt, 21, addDays(start, 3)), 0);
  // días previos al inicio no cuentan
  const withPast: Logs = { ...logs, [toKey(addDays(start, -1))]: { h1: true } };
  assert.equal(userCompletedDays(withPast, 'h1', startedAt, 21, addDays(start, 3)), 4);
  // días posteriores al final tampoco
  const long = logsFrom(start, 'h1', 30);
  assert.equal(userCompletedDays(long, 'h1', startedAt, 7, addDays(start, 29)), 7);

  // ── clasificación ─────────────────────────────────────────────────────────
  const def = findChallenge('read21') as ChallengeDef;
  const active: ActiveChallenge = { challengeId: def.id, habitId: 'h1', startedAt };
  const today = addDays(start, 6);
  const ranking = buildRanking(def, active, logs, today);
  assert.equal(ranking.length, def.participants);
  assert.equal(ranking.filter((e) => e.isUser).length, 1);
  for (let i = 1; i < ranking.length; i++) {
    assert.ok(ranking[i - 1].done >= ranking[i].done, 'ranking desordenado');
  }
  // mismo día, mismo ranking exacto
  assert.deepEqual(ranking, buildRanking(def, active, logs, today));
  assert.ok(userPosition(ranking) >= 1 && userPosition(ranking) <= def.participants);

  // empates: tú vas por delante y los rivales se ordenan por id
  const tie: RankEntry[] = [
    { id: 'read21#9', name: 'b', emoji: '🐼', done: 5, isUser: false },
    { id: 'you', name: '', emoji: '⭐', done: 5, isUser: true },
    { id: 'read21#1', name: 'a', emoji: '🦊', done: 5, isUser: false },
    { id: 'read21#2', name: 'c', emoji: '🦉', done: 9, isUser: false },
  ];
  const sorted = [...tie].sort(compareEntries);
  assert.deepEqual(sorted.map((e) => e.id), ['read21#2', 'you', 'read21#1', 'read21#9']);
  assert.equal(compareEntries(tie[0], tie[0]), 0);

  // un usuario perfecto encabeza la tabla el primer día
  const perfect = buildRanking(def, active, logsFrom(start, 'h1', 21), addDays(start, 20));
  assert.equal(perfect[0].isUser, true);
  assert.equal(perfect[0].done, 21);

  // topWithUser conserva tu fila aunque estés fuera del corte
  const cut = topWithUser(ranking, 3);
  assert.ok(cut.some((e) => e.isUser));
  assert.ok(cut.length === 3 || cut.length === 4);
  assert.deepEqual(topWithUser(perfect, 3), perfect.slice(0, 3));

  // ── medallas y textos ─────────────────────────────────────────────────────
  assert.deepEqual([0, 1, 2, 3].map(medalFor), ['🥇', '🥈', '🥉', '']);
  assert.equal(fillDayOf('Día {n} de {total}', 3, 21), 'Día 3 de 21');
  assert.equal(fillDayOf('Day {n} of {total}', 1, 7), 'Day 1 of 7');

  // ── persistencia ──────────────────────────────────────────────────────────
  assert.deepEqual(parseActive(null), []);
  assert.deepEqual(parseActive('no es json'), []);
  assert.deepEqual(parseActive('{"a":1}'), []);
  assert.deepEqual(parseActive('[{"challengeId":"borrado","habitId":"h1","startedAt":"x"}]'), []);
  assert.deepEqual(parseActive(JSON.stringify([active])), [active]);
}
