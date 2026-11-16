import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLink, linkLabel, cleanInterests, accentById } from './profile';

test('enlaces: agrega https y rechaza esquemas peligrosos', () => {
  assert.equal(normalizeLink('linkedin.com/in/ana'), 'https://linkedin.com/in/ana');
  assert.equal(normalizeLink('https://github.com/ana'), 'https://github.com/ana');
  assert.equal(normalizeLink('javascript:alert(1)'), null);
  assert.equal(normalizeLink('data:text/html,hola'), null);
  assert.equal(normalizeLink('hola'), null);
  assert.equal(normalizeLink('   '), null);
});

test('nombre corto de enlaces', () => {
  assert.equal(linkLabel('https://www.linkedin.com/in/ana'), 'LinkedIn');
  assert.equal(linkLabel('https://github.com/ana'), 'GitHub');
  assert.equal(linkLabel('https://mi-portafolio.pe/x'), 'mi-portafolio.pe');
});

test('intereses sin repetidos y con tope', () => {
  assert.deepEqual(cleanInterests([' AutoCAD ', 'autocad', '', 'Revit']), ['AutoCAD', 'Revit']);
  assert.equal(cleanInterests(Array.from({ length: 20 }, (_, i) => `t${i}`)).length, 8);
  assert.equal(cleanInterests(['x'.repeat(50)])[0].length, 24);
});

test('colores del perfil', () => {
  assert.equal(accentById('azul')?.from, '#2563eb');
  assert.equal(accentById('url(evil)'), undefined);
});
