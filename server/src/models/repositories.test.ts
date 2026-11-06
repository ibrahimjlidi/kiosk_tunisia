import assert from 'node:assert/strict';
import test from 'node:test';
import { Product, Shift } from './repositories';
import { model, omitUndefinedEntries, projectRelation } from './sqlModel';

test('repository field mappings keep uppercase acronyms together', () => {
  assert.equal(Product.definition.fields.vatRate, 'vat_rate');
  assert.equal(Shift.definition.fields.totalSalesHT, 'total_sales_ht');
  assert.equal(Shift.definition.fields.totalVAT, 'total_vat');
  assert.equal(Shift.definition.fields.totalSalesTTC, 'total_sales_ttc');
});

test('SQL persistence omits undefined values while preserving explicit nulls', () => {
  assert.deepEqual(omitUndefinedEntries([
    ['closed_by_id', undefined],
    ['closed_at', null],
  ]), [
    ['closed_at', null],
  ]);
});

test('nested relation projection keeps requested camelCase product fields', () => {
  assert.deepEqual(projectRelation({
    _id: 'product-id',
    name: 'Diesel',
    code: 'DSL',
    purchasePrice: 1.8,
    sellingPrice: 2.2,
    vatRate: 19,
    category: 'FUEL',
  }, 'name code purchasePrice sellingPrice vatRate'), {
    _id: 'product-id',
    name: 'Diesel',
    code: 'DSL',
    purchasePrice: 1.8,
    sellingPrice: 2.2,
    vatRate: 19,
  });
});

test('model projection preserves save and serialization methods', () => {
  const testModel = model<{ _id: string; name: string }>({
    table: 'test_records',
    fields: { name: 'name' },
  });
  const document = testModel.hydrate({ _id: 'record-id', name: 'record' });

  const projected = testModel.project(document, undefined, [], [], []);

  assert.equal(typeof projected.save, 'function');
  assert.equal(typeof projected.toJSON, 'function');
  assert.deepEqual(projected.toJSON(), { _id: 'record-id', name: 'record', id: 'record-id' });
});
