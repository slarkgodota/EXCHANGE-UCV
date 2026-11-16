import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash } from './routes';

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
