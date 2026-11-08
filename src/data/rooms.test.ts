import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickRoom, roomForCareer, ROOMS } from './rooms';
import { CAREERS } from './ucv';
import { activeRoomFor, themeVars, ROOM_THEMES } from './roomThemes';

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

test('la página entra a un cuarto solo cuando se elige algo', () => {
  assert.equal(activeRoomFor({ searchQuery: '', career: 'todas', category: 'todas' }), null);
  assert.equal(activeRoomFor({ searchQuery: '', career: 'Derecho', category: 'todas' }), 'derecho');
  assert.equal(activeRoomFor({ searchQuery: '', career: 'General / Interdisciplinario', category: 'todas' }), null);
  assert.equal(activeRoomFor({ searchQuery: '', career: 'todas', category: 'materiales' }), 'biblioteca');
  assert.equal(activeRoomFor({ searchQuery: 'curso de derecho', career: 'todas', category: 'todas' }), 'derecho');
});

test('cada cuarto tiene tema completo en modo claro y oscuro', () => {
  for (const id of Object.keys(ROOM_THEMES) as (keyof typeof ROOM_THEMES)[]) {
    for (const dark of [false, true]) {
      const v = themeVars(id, dark);
      for (const k of ['--r-page', '--r-surface', '--r-ink', '--r-accent', '--r-accent-text', '--r-hero-1', '--r-font']) assert.ok(v[k], `${id} ${k}`);
    }
  }
});
