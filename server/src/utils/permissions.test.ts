import test from 'node:test';
import assert from 'node:assert/strict';
import { getRolePermissions } from './permissions';

test('ADMIN role contains users.manage permission', () => {
  const permissions = getRolePermissions('ADMIN');
  assert.ok(permissions.includes('users.manage'));
});

test('ADMIN and MANAGER expose settings and audit permissions for production readiness', () => {
  const adminPermissions = getRolePermissions('ADMIN');
  const managerPermissions = getRolePermissions('MANAGER');

  assert.ok(adminPermissions.includes('settings.read'));
  assert.ok(adminPermissions.includes('settings.manage'));
  assert.ok(adminPermissions.includes('audit.read'));
  assert.ok(managerPermissions.includes('settings.read'));
  assert.ok(managerPermissions.includes('audit.read'));
});
