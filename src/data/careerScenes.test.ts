import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickScene, sceneForCareer, SCENES } from './careerScenes';
import { CAREERS } from './ucv';
import { activeCareerFor, themeVars, CAREER_THEMES } from './careerThemes';

test('cada carrera (menos General) tiene su escena 3D', () => {
  for (const c of CAREERS) {
    if (c.startsWith('General')) continue;
    assert.ok(sceneForCareer(c), `falta escena para ${c}`);
  }
  assert.equal(new Set(SCENES.map((r) => r.id)).size, SCENES.length);
});

test('la búsqueda elige la carrera correcta', () => {
  assert.equal(pickScene({ searchQuery: 'curso de Derecho Penal' }), 'derecho');
  assert.equal(pickScene({ searchQuery: 'derecho civil' }), 'derecho'); // no Ingeniería Civil
  assert.equal(pickScene({ searchQuery: 'Concreto armado' }), 'civil');
  assert.equal(pickScene({ searchQuery: 'programación en Java' }), 'sistemas');
  assert.equal(pickScene({ searchQuery: 'anatomía humana' }), 'medicina');
  assert.equal(pickScene({ searchQuery: 'psicología del desarrollo' }), 'psicologia');
  assert.equal(pickScene({ searchQuery: 'tributación y SUNAT' }), 'contabilidad');
});

test('sin búsqueda usa la carrera, luego la sección, y si no la biblioteca', () => {
  assert.equal(pickScene({ searchQuery: '', career: 'Enfermería' }), 'enfermeria');
  assert.equal(pickScene({ searchQuery: '', career: 'todas', category: 'investigacion' }), 'investigacion');
  assert.equal(pickScene({ searchQuery: '', career: 'todas', category: 'conocimientos' }), 'tutoria');
  assert.equal(pickScene({ searchQuery: '', career: 'todas', category: 'todas' }), 'biblioteca');
  assert.equal(pickScene({ searchQuery: 'zz', career: 'todas' }), 'biblioteca');
});

test('la página cambia de carrera solo cuando se elige algo', () => {
  assert.equal(activeCareerFor({ searchQuery: '', career: 'todas', category: 'todas' }), null);
  assert.equal(activeCareerFor({ searchQuery: '', career: 'Derecho', category: 'todas' }), 'derecho');
  assert.equal(activeCareerFor({ searchQuery: '', career: 'General / Interdisciplinario', category: 'todas' }), null);
  assert.equal(activeCareerFor({ searchQuery: '', career: 'todas', category: 'materiales' }), 'biblioteca');
  assert.equal(activeCareerFor({ searchQuery: 'curso de derecho', career: 'todas', category: 'todas' }), 'derecho');
});

test('cada carrera tiene tema completo en modo claro y oscuro', () => {
  for (const id of Object.keys(CAREER_THEMES) as (keyof typeof CAREER_THEMES)[]) {
    for (const dark of [false, true]) {
      const v = themeVars(id, dark);
      for (const k of ['--r-page', '--r-surface', '--r-ink', '--r-accent', '--r-accent-text', '--r-hero-1', '--r-font']) assert.ok(v[k], `${id} ${k}`);
    }
  }
});
