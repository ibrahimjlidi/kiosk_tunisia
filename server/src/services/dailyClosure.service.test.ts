import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyClosureSummary } from './dailyClosure.service';

test('buildDailyClosureSummary combines sales, payments, expenses, purchases and kif returns', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 1500,
    totalPayments: 1700,
    expenses: 200,
    purchases: 900,
    kifQuantity: 20,
  });

  assert.equal(summary.totalSalesTTC, 1500);
  assert.equal(summary.totalPayments, 1700);
  assert.equal(summary.totalExpenses, 200);
  assert.equal(summary.totalPurchases, 900);
  assert.equal(summary.totalKifQuantity, 20);
  assert.equal(summary.variance, 200);
  assert.equal(summary.isBalanced, false);
});
