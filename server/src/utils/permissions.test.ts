import test from 'node:test';
import assert from 'node:assert/strict';
import { getRolePermissions } from './permissions';

test('ADMIN role contains users.manage permission', () => {
  const permissions = getRolePermissions('ADMIN');
  assert.ok(permissions.includes('users.manage'));
});
