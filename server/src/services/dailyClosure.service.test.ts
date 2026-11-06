import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertDailyClosureReady,
  buildDailyClosureSummary,
} from './dailyClosure.service';

test('buildDailyClosureSummary combines sales, payments, expenses, purchases and kif returns', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 1500,
    shiftSalesLedgerTTC: 1500,
    totalPayments: 1700,
    expenses: 200,
    purchases: 900,
    kifQuantity: 20,
    openShiftCount: 0,
  });

  assert.equal(summary.totalSalesTTC, 1500);
  assert.equal(summary.totalPayments, 1700);
  assert.equal(summary.totalExpenses, 200);
  assert.equal(summary.totalPurchases, 900);
  assert.equal(summary.totalKifQuantity, 20);
  assert.equal(summary.variance, 200);
  assert.equal(summary.shiftSalesLedgerVariance, 0);
  assert.equal(summary.isBalanced, false);
});

test('daily closure is not balanced when shift sales differ from the sales ledger', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 2.2,
    shiftSalesLedgerTTC: 2.433,
    totalPayments: 2.2,
    expenses: 0,
    purchases: 0,
    kifQuantity: 0,
    openShiftCount: 0,
  });

  assert.equal(summary.shiftSalesLedgerVariance, 0.233);
  assert.equal(summary.isBalanced, false);
  assert.throws(() => assertDailyClosureReady(summary), {
    name: 'DailyClosureNotReadyError',
    message: 'Cannot finalize daily closure: shift sales differ from the sales ledger by 0.233 TND.',
  });
});

test('daily closure cannot be finalized while shifts remain open', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 0,
    shiftSalesLedgerTTC: 0,
    totalPayments: 0,
    expenses: 0,
    purchases: 0,
    kifQuantity: 0,
    openShiftCount: 1,
  });

  assert.throws(() => assertDailyClosureReady(summary), {
    name: 'DailyClosureNotReadyError',
    message: 'Cannot finalize daily closure while 1 shift(s) remain open.',
  });
});

test('daily closure cannot be finalized when payments do not match sales', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 2.2,
    shiftSalesLedgerTTC: 2.2,
    totalPayments: 2.1,
    expenses: 0,
    purchases: 0,
    kifQuantity: 0,
    openShiftCount: 0,
  });

  assert.throws(() => assertDailyClosureReady(summary), {
    name: 'DailyClosureNotReadyError',
    message: 'Cannot finalize daily closure with a payment variance of -0.100 TND.',
  });
});

test('daily closure is ready when all shifts and ledgers reconcile', () => {
  const summary = buildDailyClosureSummary({
    salesTTC: 6.6,
    shiftSalesLedgerTTC: 6.6,
    totalPayments: 6.6,
    expenses: 0,
    purchases: 0,
    kifQuantity: 0,
    openShiftCount: 0,
  });

  assert.equal(summary.isBalanced, true);
  assert.doesNotThrow(() => assertDailyClosureReady(summary));
});
