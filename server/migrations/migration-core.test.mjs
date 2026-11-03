import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { countRows, createMigrationPlan, objectId, SOURCE_COLLECTIONS, toJsonValue } from './migration-core.mjs';
import { validateDatabaseForeignKeys } from './mysql-import.mjs';

const ids = {
  user: '000000000000000000000001',
  station: '000000000000000000000002',
  product: '000000000000000000000003',
  pump: '000000000000000000000004',
  pistol: '000000000000000000000005',
  team: '000000000000000000000006',
  shift: '000000000000000000000007',
  volume: '000000000000000000000008',
};
const objectIdValue = (hex) => new mongoose.Types.ObjectId(hex);

test('preserves ObjectId values as lower-case 24-hex IDs', () => {
  assert.equal(objectId(objectIdValue(ids.user)), ids.user);
  assert.throws(() => objectId('not-an-object-id'), /24-character MongoDB ObjectId/);
});

test('normalizes membership and nested shift readings without losing array order', () => {
  const plan = createMigrationPlan({
    users: [{ _id: objectIdValue(ids.user), username: 'operator', __v: 2 }],
    stations: [{ _id: objectIdValue(ids.station), manager: objectIdValue(ids.user) }],
    products: [{ _id: objectIdValue(ids.product) }],
    teams: [{ _id: objectIdValue(ids.team), members: [objectIdValue(ids.user)] }],
    pumps: [{
      _id: objectIdValue(ids.pump),
      station: objectIdValue(ids.station),
      pistols: [{
        _id: objectIdValue(ids.pistol), product: objectIdValue(ids.product), pistolNumber: 1,
      }],
    }],
    shifts: [{
      _id: objectIdValue(ids.shift),
      station: objectIdValue(ids.station),
      openedBy: objectIdValue(ids.user),
      employees: [objectIdValue(ids.user)],
      pumpReadings: [{
        pump: objectIdValue(ids.pump),
        pumpNumber: 'P1',
        pistolReadings: [{
          pistolId: objectIdValue(ids.pistol),
          product: objectIdValue(ids.product),
          pistolNumber: 1,
          productName: 'Diesel',
          productCode: 'DSL',
        }],
      }],
      totalVolumeByProduct: [{
        _id: objectIdValue(ids.volume), product: objectIdValue(ids.product), productName: 'Diesel', volumeSold: 1,
      }],
    }],
  });

  assert.equal(plan.team_members[0].user_id, ids.user);
  assert.equal(plan.team_members[0].position, 0);
  assert.equal(plan.shift_employees[0].shift_id, ids.shift);
  assert.equal(plan.shift_pump_readings[0].position, 0);
  assert.equal(plan.shift_pistol_readings[0].pistol_id, ids.pistol);
  assert.equal(plan.shift_product_volumes[0].volume_id, ids.volume);
  assert.equal(plan.shift_product_volumes[0].volume_sold, 1);
  assert.equal(plan.users[0].mongo_version, 2);
  assert.equal(countRows(plan).pump_pistols, 1);
  assert.equal(SOURCE_COLLECTIONS.tankGauging, 'tankgaugings');
  assert.equal(JSON.parse(toJsonValue({ preserved: true })).preserved, true);
});

test('rejects references that cannot be enforced by relational foreign keys', () => {
  assert.throws(() => createMigrationPlan({
    users: [{ _id: objectIdValue(ids.user) }],
    pumps: [{ _id: objectIdValue(ids.pump), station: objectIdValue(ids.station) }],
  }), /references missing stations document/);
});

test('preserves the latest live sales and product-volume snapshot counts', () => {
  const sales = Array.from({ length: 12 }, (_, index) => ({
    _id: objectIdValue((index + 100).toString(16).padStart(24, '0')),
    station: objectIdValue(ids.station),
    product: objectIdValue(ids.product),
    productName: 'Diesel',
    productCode: 'DSL',
    quantity: 1,
    purchasePrice: 1,
    sellingPrice: 2,
    vatRate: 19,
    amountHT: 1,
    vatAmount: 0,
    amountTTC: 2,
    profit: 1,
    paymentMethod: 'CASH',
  }));
  const volumes = Array.from({ length: 10 }, (_, index) => ({
    _id: objectIdValue((index + 200).toString(16).padStart(24, '0')),
    product: objectIdValue(ids.product),
    productName: `Product ${index}`,
    volumeSold: index,
  }));
  const plan = createMigrationPlan({
    stations: [{ _id: objectIdValue(ids.station) }],
    products: [{ _id: objectIdValue(ids.product) }],
    sales,
    shifts: [{
      _id: objectIdValue(ids.shift),
      station: objectIdValue(ids.station),
      openedBy: objectIdValue(ids.user),
      totalVolumeByProduct: volumes,
    }],
    users: [{ _id: objectIdValue(ids.user) }],
  });

  assert.equal(countRows(plan).sales, 12);
  assert.equal(countRows(plan).shift_product_volumes, 10);
});

test('validates foreign keys using explicit metadata aliases instead of undefined table names', async () => {
  const statements = [];
  const connection = {
    async query(sql) {
      statements.push(sql);
      if (sql.includes('information_schema.key_column_usage')) {
        return [[{
          tableName: 'stations',
          constraintName: 'fk_stations_manager',
          columnName: 'manager_id',
          parentTable: 'users',
          parentColumn: 'id',
          ordinalPosition: 1,
        }], []];
      }
      return [[{ count: 0 }], []];
    },
  };

  await validateDatabaseForeignKeys(connection);

  assert.match(statements[0], /table_name AS tableName/);
  assert.match(statements[1], /FROM `stations` c/);
  assert.match(statements[1], /LEFT JOIN `users` p/);
  assert.doesNotMatch(statements[1], /undefined/);
});
