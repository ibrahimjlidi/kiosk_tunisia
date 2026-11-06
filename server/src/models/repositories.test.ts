import assert from 'node:assert/strict';
import test from 'node:test';
import { Product, Shift } from './repositories';

test('repository field mappings keep uppercase acronyms together', () => {
  assert.equal(Product.definition.fields.vatRate, 'vat_rate');
  assert.equal(Shift.definition.fields.totalSalesHT, 'total_sales_ht');
  assert.equal(Shift.definition.fields.totalVAT, 'total_vat');
  assert.equal(Shift.definition.fields.totalSalesTTC, 'total_sales_ttc');
});
