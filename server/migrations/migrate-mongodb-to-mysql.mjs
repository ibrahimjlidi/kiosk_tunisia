import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import { countRows, createMigrationPlan, SOURCE_COLLECTIONS, toJsonValue } from './migration-core.mjs';
import { validateDatabaseForeignKeys } from './mysql-import.mjs';

const migrationDir = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(migrationDir, '..');
dotenv.config({ path: path.join(serverDir, '.env') });

const schemaPath = path.join(migrationDir, 'mysql-schema.sql');
const identifier = (value) => {
  if (!/^[a-z][a-z\d_]*$/i.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return `\`${value}\``;
};

function parseArgs(args) {
  const parsed = { apply: false, dryRun: false };
  for (const arg of args) {
    if (arg === '--apply') parsed.apply = true;
    else if (arg === '--dry-run') parsed.dryRun = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  if (parsed.apply === parsed.dryRun) {
    throw new Error('Choose exactly one mode: --dry-run or --apply');
  }
  return parsed;
}

async function loadMongoCollections(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const database = mongoose.connection.db;
  if (!database) throw new Error('MongoDB connection did not select a database');
  const collections = {};
  for (const [name, collectionName] of Object.entries(SOURCE_COLLECTIONS)) {
    collections[name] = await database.collection(collectionName).find({}).toArray();
  }
  return collections;
}

async function applySchema(connection) {
  const sql = await readFile(schemaPath, 'utf8');
  const foreignKeys = [];
  for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) {
    const create = statement.match(/^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z][a-z\d_]*)/i);
    const alter = statement.match(/^ALTER\s+TABLE\s+([a-z][a-z\d_]*)/i);
    const table = create?.[1] ?? alter?.[1];
    if (table) {
      for (const match of statement.matchAll(
        /CONSTRAINT\s+([a-z][a-z\d_]*)\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-z][a-z\d_]*)\s*\(([^)]+)\)/gi,
      )) {
        foreignKeys.push({
          table, name: match[1], columns: match[2], parent: match[3], parentColumns: match[4],
        });
      }
    }
    if (alter) continue;
    await connection.query(statement);
  }

  const [[pistolIndex]] = await connection.query(
    `SELECT COUNT(*) AS count FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'pump_pistols'
       AND index_name = 'uq_pump_pistols_id'`,
  );
  if (Number(pistolIndex.count) === 0) {
    await connection.query(
      `ALTER TABLE pump_pistols ADD UNIQUE KEY uq_pump_pistols_id (pistol_id)`,
    );
  }

  for (const fk of foreignKeys) {
    const [[existing]] = await connection.query(
      `SELECT COUNT(*) AS count FROM information_schema.table_constraints
       WHERE constraint_schema = DATABASE() AND table_name = ? AND constraint_name = ?`,
      [fk.table, fk.name],
    );
    if (Number(existing.count) > 0) continue;
    await connection.query(
      `ALTER TABLE ${identifier(fk.table)} ADD CONSTRAINT ${identifier(fk.name)}
       FOREIGN KEY (${fk.columns.split(',').map((column) => identifier(column.trim())).join(', ')})
       REFERENCES ${identifier(fk.parent)} (${fk.parentColumns.split(',').map((column) => identifier(column.trim())).join(', ')})`,
    );
  }
}

function sqlValue(column, value) {
  return column === 'metadata' || column === 'value'
    ? value == null ? null : toJsonValue(value)
    : value;
}

async function upsertRows(connection, table, rows) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const primaryKeyColumns = table === 'team_members' || table === 'shift_employees'
    ? ['team_id', 'position']
    : table === 'pump_pistols' ? ['pump_id', 'position']
    : table === 'shift_pump_readings' ? ['shift_id', 'position']
      : table === 'shift_pistol_readings' ? ['shift_id', 'pump_position', 'position']
        : table === 'shift_product_volumes' ? ['shift_id', 'position']
          : table === 'purchase_order_items' ? ['purchase_order_id', 'position']
            : ['id'];
  const updateColumns = columns.filter((column) => !primaryKeyColumns.includes(column));
  const placeholders = `(${columns.map(() => '?').join(', ')})`;

  for (let offset = 0; offset < rows.length; offset += 100) {
    const batch = rows.slice(offset, offset + 100);
    const values = batch.flatMap((item) => columns.map((column) => sqlValue(column, item[column])));
    const onDuplicate = updateColumns.length
      ? ` ON DUPLICATE KEY UPDATE ${updateColumns.map((column) =>
        `${identifier(column)} = VALUES(${identifier(column)})`).join(', ')}`
      : '';
    await connection.execute(
      `INSERT INTO ${identifier(table)} (${columns.map(identifier).join(', ')}) VALUES ${
        batch.map(() => placeholders).join(', ')
      }${onDuplicate}`,
      values,
    );
  }
}

async function importPlan(connection, plan) {
  const expected = countRows(plan);
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    await connection.beginTransaction();
    for (const [table, rows] of Object.entries(plan)) await upsertRows(connection, table, rows);
    await validateDatabaseForeignKeys(connection);
    for (const [table, expectedCount] of Object.entries(expected)) {
      const [[result]] = await connection.query(`SELECT COUNT(*) AS count FROM ${identifier(table)}`);
      if (Number(result.count) !== expectedCount) {
        throw new Error(`${table} count mismatch: expected ${expectedCount}, found ${result.count}`);
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  }
  return expected;
}

async function main() {
  const { apply, dryRun } = parseArgs(process.argv.slice(2));
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('Set MONGO_URI to the existing MongoDB source explicitly');

  let mysqlConnection;
  try {
    const collections = await loadMongoCollections(mongoUri);
    const plan = createMigrationPlan(collections);
    const expected = countRows(plan);
    const sourceCounts = Object.fromEntries(
      Object.entries(SOURCE_COLLECTIONS).map(([name]) => [name, collections[name].length]),
    );
    console.log(`MongoDB source database: ${mongoose.connection.name}`);
    console.log(`Source documents: ${JSON.stringify(sourceCounts)}`);
    console.log(`Relational rows: ${JSON.stringify(expected)}`);

    if (dryRun) {
      console.log('Dry run complete; MySQL was not connected and no data was written.');
      return;
    }

    const database = process.env.DB_NAME || 'kiosk_tunisia';
    mysqlConnection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database,
      charset: 'utf8mb4',
      timezone: 'Z',
      decimalNumbers: true,
    });
    await applySchema(mysqlConnection);
    const counts = await importPlan(mysqlConnection, plan);
    console.log(`Imported and verified ${Object.values(counts).reduce((sum, count) => sum + count, 0)} rows into MySQL database ${database}.`);
    console.log('MongoDB source collections were read only and were not modified.');
  } finally {
    await mongoose.disconnect();
    if (mysqlConnection) await mysqlConnection.end();
  }
}

main().catch((error) => {
  console.error(`MongoDB to MySQL migration failed: ${error.message}`);
  process.exitCode = 1;
});
