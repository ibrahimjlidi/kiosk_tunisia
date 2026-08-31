import assert from 'node:assert/strict';
import test from 'node:test';

import { comparePassword, hashPassword } from './password';

test('hashPassword and comparePassword work for a plain password', async () => {
  const password = 'Admin@123';
  const hashed = await hashPassword(password);

  assert.ok(typeof hashed === 'string' && hashed.length > 0);
  assert.equal(await comparePassword(password, hashed), true);
  assert.equal(await comparePassword('wrong-password', hashed), false);
});
