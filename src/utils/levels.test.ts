import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAllLevels, levelFor, levelOf, XP_RULES, parseWhen, periodStart, periodEnd, rankUsers } from './levels';

const pub = (id: string, authorId: string, ratings: [string, number][] = [], status = 'aprobado') =>
  ({
    id,
    status,
    author: { id: authorId },
    reviews: ratings.map(([by, rating], i) => ({ id: `${id}-r${i}`, authorId: by, rating })),
  }) as any;

test('niveles por EXP', () => {
  assert.equal(levelFor(0).level, 1);
  assert.equal(levelFor(59).level, 1);
  assert.equal(levelFor(60).level, 2);
  assert.equal(levelFor(1200).name, 'Leyenda UCV');
  assert.equal(levelFor(5000).nextMin, null);
  assert.equal(levelFor(105).progress, 0.5); // a mitad entre 60 y 150
});

test('publicar y recibir buenas estrellas da más EXP que estrellas bajas', () => {
  const lv = computeAllLevels([pub('p1', 'ana', [['luis', 5]]), pub('p2', 'beto', [['luis', 1]])], [], []);
  assert.equal(lv.ana.xp, XP_RULES.publicacion + 4 * XP_RULES.porEstrella);
  assert.equal(lv.beto.xp, XP_RULES.publicacion); // 1★ no suma
  assert.equal(lv.ana.stats.avgRating, 5);
  assert.equal(lv.luis.xp, 2 * XP_RULES.resenaEscrita);
});

test('publicaciones reportadas no suman y nadie gana por valorarse', () => {
  const lv = computeAllLevels([pub('p1', 'ana', [['ana', 5]], 'reportado'), pub('p2', 'ana', [['ana', 5]])], [], []);
  assert.equal(lv.ana.xp, XP_RULES.publicacion);
  assert.equal(lv.ana.stats.ratingsReceived, 0);
});

test('intercambios y respuestas (con tope)', () => {
  const reqs = [
    { senderId: 'luis', receiverId: 'ana', status: 'completada' },
    { senderId: 'beto', receiverId: 'ana', status: 'aceptada' },
    { senderId: 'beto', receiverId: 'ana', status: 'rechazada' },
  ] as any;
  const replies = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, authorId: 'luis' })) as any;
  const lv = computeAllLevels([], reqs, replies);
  assert.equal(lv.ana.xp, 2 * XP_RULES.intercambioAceptado + XP_RULES.intercambioCompletado);
  assert.equal(lv.luis.xp, XP_RULES.intercambioCompletado + XP_RULES.maxRespuestas * XP_RULES.respuesta);
  assert.equal(levelOf(lv, 'nadie').level, 1);
});

test('lee los formatos de fecha que guarda la app', () => {
  assert.equal(parseWhen('2026-11-16 14:30'), Date.UTC(2026, 10, 16, 14, 30));
  assert.equal(parseWhen('2026-11-16T14:30:00.000Z'), Date.UTC(2026, 10, 16, 14, 30));
  assert.equal(parseWhen('2026-11-16'), new Date(2026, 10, 16, 12).getTime());
  assert.ok(Number.isNaN(parseWhen('ayer')));
  assert.ok(Number.isNaN(parseWhen(undefined)));
});

test('la semana empieza el lunes y el mes el día 1', () => {
  const wed = new Date(2026, 10, 18, 15, 0); // miércoles 18/11/2026
  assert.equal(periodStart('semana', wed), new Date(2026, 10, 16).getTime());
  assert.equal(periodEnd('semana', wed), new Date(2026, 10, 23).getTime());
  const sun = new Date(2026, 10, 22, 23, 0); // domingo sigue en la misma semana
  assert.equal(periodStart('semana', sun), new Date(2026, 10, 16).getTime());
  assert.equal(periodStart('mes', wed), new Date(2026, 10, 1).getTime());
  assert.equal(periodEnd('mes', new Date(2026, 11, 5)), new Date(2027, 0, 1).getTime());
  assert.equal(periodStart('total', wed), -Infinity);
});

test('la clasificación semanal solo cuenta lo de la semana', () => {
  const now = new Date(2026, 10, 18, 12);
  const since = periodStart('semana', now);
  const pubs = [
    { ...pub('p1', 'ana', []), createdAt: '2026-11-17' },
    { ...pub('p2', 'ana', []), createdAt: '2026-10-02' },
    {
      ...pub('p3', 'beto', []),
      createdAt: '2026-10-01',
      reviews: [
        { id: 'r1', authorId: 'luis', rating: 5, createdAt: '2026-11-17 10:00' },
        { id: 'r2', authorId: 'ana', rating: 5, createdAt: '2026-10-03 10:00' },
      ],
    },
  ] as any;
  const reqs = [
    { senderId: 'luis', receiverId: 'beto', status: 'completada', createdAt: '2026-10-20 10:00', respondedAt: '2026-11-17T10:00:00Z' },
    { senderId: 'ana', receiverId: 'beto', status: 'completada', createdAt: '2026-10-20 10:00' },
  ] as any;
  const replies = [{ authorId: 'luis', createdAt: '2026-11-16T09:00:00Z' }, { authorId: 'luis', createdAt: '2026-11-01T09:00:00Z' }] as any;

  const total = computeAllLevels(pubs, reqs, replies);
  const week = computeAllLevels(pubs, reqs, replies, since);
  assert.equal(total.ana.xp, 2 * XP_RULES.publicacion + XP_RULES.resenaEscrita + XP_RULES.intercambioCompletado);
  assert.equal(week.ana.xp, XP_RULES.publicacion);
  assert.equal(week.beto.xp, 4 * XP_RULES.porEstrella + XP_RULES.intercambioAceptado + XP_RULES.intercambioCompletado);
  assert.equal(week.luis.xp, XP_RULES.resenaEscrita + XP_RULES.intercambioCompletado + XP_RULES.respuesta);
});

test('ranking ordenado, con empates compartiendo puesto y sin usuarios en 0', () => {
  const lv: any = {
    a: { xp: 100, stats: { avgRating: 4, publications: 2 } },
    b: { xp: 150, stats: { avgRating: 3, publications: 1 } },
    c: { xp: 100, stats: { avgRating: 4, publications: 2 } },
    d: { xp: 100, stats: { avgRating: 5, publications: 1 } },
    e: { xp: 0, stats: { avgRating: 0, publications: 0 } },
  };
  const r = rankUsers(lv);
  assert.deepEqual(r.map((x) => [x.userId, x.rank]), [['b', 1], ['d', 2], ['a', 3], ['c', 3]]);
  assert.deepEqual(rankUsers(lv, ['a', 'e']).map((x) => x.userId), ['a']);
});
