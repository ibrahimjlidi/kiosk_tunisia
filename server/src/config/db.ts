import { readFile } from 'fs/promises';
import path from 'path';
import type { ExecuteValues } from 'mysql2';
import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { config } from './env';
import { seedAdminUser } from '../utils/seedAdmin';
import { seedStationData } from '../utils/seedStationData';

export const pool: Pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl
    ? { rejectUnauthorized: true, ...(config.database.sslCa ? { ca: config.database.sslCa } : {}) }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: 'Z',
});

let isConnected = false;
let isConnecting = false;
let reconnectTimer: NodeJS.Timeout | undefined;

const schemaPath = path.resolve(__dirname, '../../migrations/mysql-schema.sql');

const quoteIdentifier = (identifier: string): string => {
  if (!/^[a-z][a-z\d_]*$/i.test(identifier)) {
    throw new Error(`Invalid schema identifier: ${identifier}`);
  }
  return `\`${identifier}\``;
};

const ensureSchema = async (): Promise<void> => {
  const schema = await readFile(schemaPath, 'utf8');
  const foreignKeys: {
    table: string;
    name: string;
    columns: string;
    referencedTable: string;
    referencedColumns: string;
  }[] = [];

  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
    const create = statement.match(/^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+([a-z][a-z\d_]*)/i);
    const alter = statement.match(/^ALTER\s+TABLE\s+([a-z][a-z\d_]*)/i);
    const table = create?.[1] ?? alter?.[1];

    if (table) {
      for (const match of statement.matchAll(
        /CONSTRAINT\s+([a-z][a-z\d_]*)\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+([a-z][a-z\d_]*)\s*\(([^)]+)\)/gi,
      )) {
        foreignKeys.push({
          table,
          name: match[1],
          columns: match[2],
          referencedTable: match[3],
          referencedColumns: match[4],
        });
      }
    }

    if (create) {
      await pool.query(statement);
    }
  }

  for (const foreignKey of foreignKeys) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM information_schema.table_constraints
       WHERE constraint_schema = DATABASE()
         AND table_name = ?
         AND constraint_name = ?`,
      [foreignKey.table, foreignKey.name],
    );
    const existing = rows[0] as RowDataPacket & { count: number };

    if (Number(existing.count) > 0) continue;

    const columns = foreignKey.columns
      .split(',')
      .map((column) => quoteIdentifier(column.trim()))
      .join(', ');
    const referencedColumns = foreignKey.referencedColumns
      .split(',')
      .map((column) => quoteIdentifier(column.trim()))
      .join(', ');

    await pool.query(
      `ALTER TABLE ${quoteIdentifier(foreignKey.table)}
       ADD CONSTRAINT ${quoteIdentifier(foreignKey.name)}
       FOREIGN KEY (${columns})
       REFERENCES ${quoteIdentifier(foreignKey.referencedTable)} (${referencedColumns})`,
    );
  }
};

export const query = async <T extends object = Record<string, unknown>>(
  sql: string,
  values: ExecuteValues[] = [],
): Promise<T[]> => {
  const [rows] = await pool.execute(sql, values);
  return rows as T[];
};

export const withTransaction = async <T>(
  work: (connection: PoolConnection) => Promise<T>,
): Promise<T> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const isDatabaseConnected = (): boolean => isConnected;

const scheduleReconnect = (): void => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    void connectDB();
  }, 5000);
};

export const connectDB = async (): Promise<void> => {
  if (isConnected || isConnecting) return;

  isConnecting = true;
  try {
    await pool.query('SELECT 1');
    await ensureSchema();
    isConnected = true;
    console.log(`[MySQL] Connected successfully to ${config.database.host}:${config.database.port}/${config.database.name}`);
    await seedAdminUser();
    if (config.nodeEnv !== 'production') {
      await seedStationData();
    }
  } catch (error) {
    isConnected = false;
    console.error(`[MySQL Error] Could not connect to ${config.database.host}:${config.database.port}/${config.database.name}: ${(error as Error).message}`);
    console.warn('[MySQL Notice] ERP API will automatically retry connecting every 5 seconds.');
    scheduleReconnect();
  } finally {
    isConnecting = false;
  }
};

pool.pool.on('error', (error) => {
  isConnected = false;
  console.error('[MySQL Error] Database connection was lost:', error);
  scheduleReconnect();
});
