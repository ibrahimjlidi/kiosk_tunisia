import test from 'node:test';
import assert from 'node:assert/strict';
import { generateToken } from './token';

const dummyUser = {
  _id: '000000000000000000000000',
  email: 'secure@example.com',
  role: 'ADMIN' as const,
  username: 'secureadmin',
};

test('access token generation behaves correctly', () => {
  const accessToken = generateToken(dummyUser as any);

  assert.ok(accessToken, 'Access token should be produced');
});
