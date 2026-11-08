import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickRoom, roomForCareer, ROOMS } from './rooms';
import { CAREERS } from './ucv';

test('cada carrera (menos General) tiene su cuarto', () => {
  for (const c of CAREERS) {
    if (c.startsWith('General')) continue;
    assert.ok(roomForCareer(c), `falta cuarto para ${c}`);
  }
  assert.equal(new Set(ROOMS.map((r) => r.id)).size, ROOMS.length);
});

test('la búsqueda elige el cuarto correcto', () => {
  assert.equal(pickRoom({ searchQuery: 'curso de Derecho Penal' }), 'derecho');
  assert.equal(pickRoom({ searchQuery: 'derecho civil' }), 'derecho'); // no Ingeniería Civil
  assert.equal(pickRoom({ searchQuery: 'Concreto armado' }), 'civil');
  assert.equal(pickRoom({ searchQuery: 'programación en Java' }), 'sistemas');
  assert.equal(pickRoom({ searchQuery: 'anatomía humana' }), 'medicina');
  assert.equal(pickRoom({ searchQuery: 'psicología del desarrollo' }), 'psicologia');
  assert.equal(pickRoom({ searchQuery: 'tributación y SUNAT' }), 'contabilidad');
});

test('sin búsqueda usa la carrera, luego la sección, y si no la biblioteca', () => {
  assert.equal(pickRoom({ searchQuery: '', career: 'Enfermería' }), 'enfermeria');
  assert.equal(pickRoom({ searchQuery: '', career: 'todas', category: 'investigacion' }), 'investigacion');
  assert.equal(pickRoom({ searchQuery: '', career: 'todas', category: 'conocimientos' }), 'tutoria');
  assert.equal(pickRoom({ searchQuery: '', career: 'todas', category: 'todas' }), 'biblioteca');
  assert.equal(pickRoom({ searchQuery: 'zz', career: 'todas' }), 'biblioteca');
});
