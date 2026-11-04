import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sha256Hex, hashPassword, verifyPassword, generateSalt, validateRegistration, getInitials } from './security';
import { INITIAL_USERS } from '../data/initialData';

test('sha256Hex coincide con node:crypto', () => {
  for (const s of ['', 'abc', 'ñandú 🎓', 'x'.repeat(200)]) {
    assert.equal(sha256Hex(s), createHash('sha256').update(s).digest('hex'));
  }
});

test('hash y verificación de contraseña', () => {
  const salt = generateSalt();
  const h = hashPassword('MiClave2026', salt);
  assert.equal(verifyPassword('MiClave2026', salt, h), true);
  assert.equal(verifyPassword('otra', salt, h), false);
  assert.notEqual(h, 'MiClave2026');
});

test('las cuentas iniciales no guardan contraseñas en texto plano', () => {
  for (const u of INITIAL_USERS) {
    assert.equal((u as any).password, undefined);
    assert.equal(u.passwordHash.length, 64);
    assert.equal(u.campus, 'Moyobamba');
  }
});

test('validateRegistration permite que cualquier persona cree su cuenta', () => {
  const base = {
    name: 'Lucía Paredes',
    email: 'lucia@gmail.com',
    password: 'Estudio2026',
    confirmPassword: 'Estudio2026',
    existingEmails: ['mdelgadoc@ucvvirtual.edu.pe'],
    acceptedTerms: true,
  };
  assert.equal(validateRegistration(base), null);
  assert.match(validateRegistration({ ...base, email: 'MDELGADOC@ucvvirtual.edu.pe' }) || '', /Ya existe/);
  assert.match(validateRegistration({ ...base, password: 'abc', confirmPassword: 'abc' }) || '', /8 caracteres/);
  assert.match(validateRegistration({ ...base, confirmPassword: 'Distinta2026' }) || '', /no coinciden/);
  assert.match(validateRegistration({ ...base, acceptedTerms: false }) || '', /política/);
});

test('getInitials', () => {
  assert.equal(getInitials('José Roly Gonzalez'), 'JR');
  assert.equal(getInitials('Ana'), 'AN');
});
