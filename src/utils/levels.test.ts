import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAllLevels, levelFor, levelOf, XP_RULES } from './levels';

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
