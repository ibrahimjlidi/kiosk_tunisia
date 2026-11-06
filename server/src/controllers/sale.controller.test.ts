import assert from 'node:assert/strict';
import test from 'node:test';
import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { createSale } from './sale.controller';

test('rejects manually-created sales linked to a shift', async () => {
  let statusCode = 0;
  let responseBody: unknown;
  const request = Object.create(null) as AuthRequest;
  request.body = {
    station: 'station-id',
    shift: 'shift-id',
    product: 'product-id',
    productName: 'Diesel',
    productCode: 'DIESEL',
    quantity: 1,
    purchasePrice: 1.5,
    sellingPrice: 2.2,
    vatRate: 19,
    amountHT: 1.849,
    vatAmount: 0.351,
    amountTTC: 2.2,
    profit: 0.7,
  };

  const response = Object.create(null) as Response;
  response.status = (code) => {
    statusCode = code;
    return response;
  };
  response.json = (body) => {
    responseBody = body;
    return response;
  };

  await createSale(request, response);

  assert.equal(statusCode, 409);
  assert.deepEqual(responseBody, {
    success: false,
    message: 'Sales for a shift are generated from saved pump readings when the shift closes. Record payment totals on the shift instead.',
  });
});
