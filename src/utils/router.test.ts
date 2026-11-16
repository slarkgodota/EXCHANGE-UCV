import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, profileHash } from './routes';

test('rutas de la página', () => {
  assert.deepEqual(parseHash('#catalogo'), { view: 'catalogo' });
  assert.deepEqual(parseHash('#ranking'), { view: 'ranking' });
  assert.deepEqual(parseHash(''), { view: 'inicio' });
  assert.deepEqual(parseHash('#otra-cosa'), { view: 'inicio' });
  assert.deepEqual(parseHash('#perfil/u_123'), { view: 'perfil', param: 'u_123' });
  assert.deepEqual(parseHash('#perfil/u%20x'), { view: 'perfil', param: 'u x' });
  assert.deepEqual(parseHash('#perfil/'), { view: 'inicio' });
  assert.deepEqual(parseHash('#perfil/%E0%A4%A'), { view: 'inicio' });
});

test('pestañas del perfil', () => {
  assert.deepEqual(parseHash('#perfil/u_1/logros'), { view: 'perfil', param: 'u_1', tab: 'logros' });
  assert.deepEqual(parseHash('#perfil/u_1/otra'), { view: 'perfil', param: 'u_1' });
  assert.equal(profileHash('u 1', 'acerca'), 'perfil/u%201/acerca');
  assert.equal(profileHash('u1', 'publicaciones'), 'perfil/u1');
});
