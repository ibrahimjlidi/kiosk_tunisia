import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from './apiResponse';

test('ApiError carries status code and errors', () => {
  const err = new ApiError('Validation failed', 422, [
    { field: 'email', message: 'Email is invalid' },
  ]);

  assert.equal(err.message, 'Validation failed');
  assert.equal(err.statusCode, 422);
  assert.deepEqual(err.errors, [{ field: 'email', message: 'Email is invalid' }]);
});
