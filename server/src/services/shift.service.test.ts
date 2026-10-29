import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { aggregateShiftTotals, calcPistolFinancials } from './shift.service';

test('calcPistolFinancials returns zero sales when opening and closing indexes match', () => {
  assert.deepEqual(calcPistolFinancials(120, 120, 2.2, 1.8, 19), {
    volumeSold: 0,
    amountHT: 0,
    vatAmount: 0,
    amountTTC: 0,
    profit: 0,
  });
});

test('calcPistolFinancials calculates liters, HT, VAT, TTC, and profit from index difference', () => {
  assert.deepEqual(calcPistolFinancials(100, 110, 2.2, 1.8, 19), {
    volumeSold: 10,
    amountHT: 18.487,
    vatAmount: 3.513,
    amountTTC: 22,
    profit: 4,
  });
});

test('aggregateShiftTotals sums readings by product for the shift close', () => {
  const product = new mongoose.Types.ObjectId();
  const pump = new mongoose.Types.ObjectId();
  const pistolOne = new mongoose.Types.ObjectId();
  const pistolTwo = new mongoose.Types.ObjectId();

  const totals = aggregateShiftTotals([{
    pump,
    pumpNumber: '1',
    pistolReadings: [
      {
        pistolId: pistolOne,
        pistolNumber: 1,
        product,
        productName: 'Diesel',
        productCode: 'DSL',
        purchasePrice: 1.8,
        sellingPrice: 2.2,
        vatRate: 19,
        openingIndex: 100,
        closingIndex: 110,
        volumeSold: 10,
        amountHT: 18.487,
        vatAmount: 3.513,
        amountTTC: 22,
        profit: 4,
      },
      {
        pistolId: pistolTwo,
        pistolNumber: 2,
        product,
        productName: 'Diesel',
        productCode: 'DSL',
        purchasePrice: 1.8,
        sellingPrice: 2.2,
        vatRate: 19,
        openingIndex: 200,
        closingIndex: 205,
        volumeSold: 5,
        amountHT: 9.244,
        vatAmount: 1.756,
        amountTTC: 11,
        profit: 2,
      },
    ],
  }]);

  assert.equal(totals.totalSalesHT, 27.731);
  assert.equal(totals.totalVAT, 5.269);
  assert.equal(totals.totalSalesTTC, 33);
  assert.equal(totals.totalProfit, 6);
  assert.deepEqual(totals.totalVolumeByProduct, [{
    product,
    productName: 'Diesel',
    volumeSold: 15,
  }]);
});
