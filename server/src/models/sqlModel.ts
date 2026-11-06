import { randomBytes } from 'crypto';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { query, withTransaction } from '../config/db';

type Row = Record<string, any>;
type FieldMap = Record<string, string>;
type Relation = { table: string; local: string; foreign?: string; fields?: string[]; many?: boolean };
type CollectionRelation = { table: string; ownerColumn: string; itemColumn: string; targetTable: string; orderColumn?: string };
type NestedRelation = { collection: string; localProperty: string; table: string; targetId?: string; fields?: string[] };
type Child = {
  table: string;
  property: string;
  columns: FieldMap;
  key: string;
  parentKey: string;
  positionKey?: string;
};

export interface ModelDefinition {
  table: string;
  fields: FieldMap;
  defaults?: Row;
  relations?: Record<string, Relation>;
  collectionRelations?: Record<string, CollectionRelation>;
  nestedRelations?: Record<string, NestedRelation>;
  existsFilters?: Record<string, { table: string; parentColumn: string; itemColumn: string }>;
  children?: Child[];
  hiddenFields?: string[];
  validate?: (value: Row) => void;
  beforeInsert?: (value: Row) => Promise<void>;
  beforeUpdate?: (value: Row) => Promise<void>;
  loadChildren?: (value: Row) => Promise<void>;
  saveChildren?: (value: Row, connection: PoolConnection) => Promise<void>;
}

export const newId = (): string => randomBytes(12).toString('hex');
export const omitUndefinedEntries = <T extends readonly [string, unknown]>(entries: readonly T[]): T[] =>
  entries.filter(([, value]) => value !== undefined);
const camel = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const identifier = (key: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) throw new Error(`Invalid SQL identifier: ${key}`);
  return `\`${key}\``;
};

function mapRow(row: Row, definition: ModelDefinition): Row {
  const result: Row = {};
  const properties = Object.fromEntries(Object.entries(definition.fields).map(([property, column]) => [column, property]));
  for (const [key, value] of Object.entries(row)) {
    const name = properties[key] ?? key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const property = name === 'id' ? '_id' : name;
    result[property] = value != null && ['active', 'isBalanced', 'paid', 'revoked'].includes(property) ? Boolean(value) : value;
  }
  if (result._id != null) result._id = String(result._id);
  return result;
}

export function projectRelation(value: Row, select?: string): Row {
  if (!select) return value;
  const fields = select.split(/\s+/).filter((field) => field && !field.startsWith('+') && !field.startsWith('-'));
  const excluded = select.split(/\s+/).filter((field) => field.startsWith('-')).map((field) => field.slice(1));
  if (fields.length) {
    return Object.fromEntries(Object.entries(value).filter(([field]) => field === '_id' || fields.includes(field)));
  }
  for (const field of excluded) delete value[field];
  return value;
}

export function buildWhere(definition: ModelDefinition, filter: Row = {}): { sql: string; values: any[] } {
  const clauses: string[] = [];
  const values: unknown[] = [];
  for (const [property, condition] of Object.entries(filter)) {
    const column = property === '_id' ? 'id' : definition.fields[property];
    const existsFilter = definition.existsFilters?.[property];
    if (!column && existsFilter) {
      const field = identifier(existsFilter.itemColumn);
      const parent = identifier(existsFilter.parentColumn);
      if (condition && typeof condition === 'object' && !Array.isArray(condition) && '$in' in condition) {
        const ids = condition.$in;
        if (!Array.isArray(ids) || !ids.length) clauses.push('1 = 0');
        else {
          clauses.push(`EXISTS (SELECT 1 FROM ${identifier(existsFilter.table)} AS related WHERE related.${parent} = \`id\` AND related.${field} IN (${ids.map(() => '?').join(',')}))`);
          values.push(...ids);
        }
      } else {
        clauses.push(`EXISTS (SELECT 1 FROM ${identifier(existsFilter.table)} AS related WHERE related.${parent} = \`id\` AND related.${field} = ?)`);
        values.push(condition);
      }
      continue;
    }
    if (!column || condition === undefined) continue;
    const col = identifier(column);
    if (condition === null) {
      clauses.push(`${col} IS NULL`);
    } else if (typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
      for (const [operator, value] of Object.entries(condition)) {
        const sqlOperator: Record<string, string> = { $gte: '>=', $gt: '>', $lte: '<=', $lt: '<', $ne: '<>', $eq: '=', $like: 'LIKE' };
        if (operator === '$in' || operator === '$nin') {
          if (!Array.isArray(value) || value.length === 0) clauses.push(operator === '$in' ? '1 = 0' : '1 = 1');
          else {
            clauses.push(`${col} ${operator === '$in' ? 'IN' : 'NOT IN'} (${value.map(() => '?').join(',')})`);
            values.push(...value);
          }
        } else if (sqlOperator[operator]) {
          clauses.push(`${col} ${sqlOperator[operator]} ?`);
          values.push(value);
        }
      }
    } else {
      clauses.push(`${col} = ?`);
      values.push(condition);
    }
  }
  return { sql: clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '', values };
}

export function applyUpdates(current: Row, updates: Row): Row {
  const value = { ...current };
  const hasOperators = Object.keys(updates).some((key) => key.startsWith('$'));
  if (!hasOperators) return { ...value, ...updates };
  if (updates.$set) Object.assign(value, updates.$set);
  for (const [field, increment] of Object.entries(updates.$inc ?? {})) {
    value[field] = Number(value[field] ?? 0) + Number(increment);
  }
  for (const field of Object.keys(updates.$unset ?? {})) delete value[field];
  return value;
}

export function applyFieldSelection<T extends Row>(
  row: T,
  selected: string[] | undefined,
  excluded: string[],
  hidden: string[],
  includeHidden: string[],
): T {
  const result: Row = selected
    ? Object.fromEntries(Object.entries(row).filter(([field]) => field === '_id' || selected.includes(field)))
    : { ...row };
  for (const field of [...excluded, ...hidden.filter((field) => !includeHidden.includes(field))]) delete result[field];
  return result as T;
}

class SqlQuery<T extends Row> implements PromiseLike<T[]> {
  private sorts: Array<[string, 'ASC' | 'DESC']> = [];
  private maxRows?: number;
  private selected?: string[];
  private excluded: string[] = [];
  private includeHidden: string[] = [];
  private relations: Array<{ path: string; select?: string }> = [];
  private single = false;

  constructor(private model: SqlModel<T>, private filter: Row = {}) {}

  populate(path: string, select?: string): this { this.relations.push({ path, select }); return this; }
  sort(value: Row): this {
    this.sorts = Object.entries(value).map(([field, direction]) => [field, direction === -1 ? 'DESC' : 'ASC']);
    return this;
  }
  limit(count: number): this { this.maxRows = count; return this; }
  select(fields: string): this {
    const parts = fields.split(/\s+/).filter(Boolean);
    this.excluded = parts.filter((field) => field.startsWith('-')).map((field) => field.slice(1));
    const included = parts.filter((field) => !field.startsWith('-') && !field.startsWith('+'));
    if (included.length) this.selected = included;
    this.includeHidden = parts.filter((field) => field.startsWith('+')).map((field) => field.slice(1));
    return this;
  }
  lean(): this { return this; }
  asSingle(): this { this.single = true; return this; }
  exec(): Promise<any> { return this.execute(); }
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<any> {
    const { sql, values } = buildWhere(this.model.definition, this.filter);
    const orderBy = this.sorts.length
      ? ` ORDER BY ${this.sorts.map(([field, direction]) => `${identifier(this.model.column(field))} ${direction}`).join(', ')}`
      : '';
    const limit = this.maxRows === undefined ? '' : ` LIMIT ${Math.max(0, Math.floor(this.maxRows))}`;
    const rows = await query<Row & RowDataPacket>(
      `SELECT * FROM ${identifier(this.model.definition.table)}${sql}${orderBy}${limit}`,
      values,
    );
    let result: T[] = await Promise.all(rows.map(async (row) => {
      const value = this.model.hydrate(mapRow(row, this.model.definition));
      await this.model.loadChildren(value);
      return value;
    })) as T[];
    const hidden = this.model.definition.hiddenFields ?? [];
    result = result.map((row) => applyFieldSelection(row, this.selected, this.excluded, hidden, this.includeHidden));
    for (const relation of this.relations) {
      for (const row of result) await this.model.populate(row, relation.path, relation.select);
    }
    return this.single ? result[0] ?? null : result;
  }
}

export class SqlModel<T extends Row = Row> {
  constructor(readonly definition: ModelDefinition) {}

  column(field: string): string {
    if (field === '_id') return 'id';
    const baseField = field.split('.')[0];
    return this.definition.fields[baseField] ?? camel(baseField);
  }

  find(filter: Row = {}): SqlQuery<T> { return new SqlQuery<T>(this, filter); }
  findOne(filter: Row = {}): SqlQuery<T> { return new SqlQuery<T>(this, filter).limit(1).asSingle(); }
  findById(id: string): SqlQuery<T> { return this.findOne({ _id: id }); }

  async countDocuments(filter: Row = {}): Promise<number> {
    const { sql, values } = buildWhere(this.definition, filter);
    const rows = await query<RowDataPacket & { count: number }>(
      `SELECT COUNT(*) AS count FROM ${identifier(this.definition.table)}${sql}`,
      values,
    );
    return Number(rows[0]?.count ?? 0);
  }

  async exists(filter: Row = {}): Promise<{ _id: string } | null> {
    const row = await this.findOne(filter);
    return row ? { _id: row._id } : null;
  }

  async create(input: Row | Row[]): Promise<any> {
    if (Array.isArray(input)) return this.insertMany(input);
    return this.insert(input);
  }

  async insertMany(values: Row[]): Promise<T[]> {
    return withTransaction(async (connection) => Promise.all(values.map((value) => this.insertWithConnection(value, connection))));
  }

  async findByIdAndUpdate(id: string, updates: Row, _options: Row = {}): Promise<T | null> {
    const current = await this.findById(id);
    if (!current) return null;
    return withTransaction(async (connection) => {
      const value = applyUpdates(current, updates);
      value._id = id;
      this.definition.validate?.(value);
      await this.definition.beforeUpdate?.(value);
      await this.updateWithConnection(value, connection);
      return this.hydrate(value);
    });
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const current = await this.findById(id);
    if (!current) return null;
    await query(`DELETE FROM ${identifier(this.definition.table)} WHERE id = ?`, [id]);
    return current;
  }

  async findOneAndUpdate(filter: Row, updates: Row, _options: Row = {}): Promise<T | null> {
    const current = await this.findOne(filter);
    return current ? this.findByIdAndUpdate(current._id, updates) : null;
  }

  async updateOne(filter: Row, updates: Row): Promise<{ modifiedCount: number }> {
    const current = await this.findOne(filter);
    if (!current) return { modifiedCount: 0 };
    await this.findByIdAndUpdate(current._id, updates);
    return { modifiedCount: 1 };
  }

  async deleteMany(filter: Row = {}): Promise<{ deletedCount: number }> {
    const { sql, values } = buildWhere(this.definition, filter);
    const result: any = await query<any>(`DELETE FROM ${identifier(this.definition.table)}${sql}`, values);
    return { deletedCount: Number(result.affectedRows ?? 0) };
  }

  async updateDocument(value: Row): Promise<void> {
    this.definition.validate?.(value);
    await this.definition.beforeUpdate?.(value);
    await withTransaction((connection) => this.updateWithConnection(value, connection));
    Object.assign(value, await this.findById(value._id));
  }

  hydrate(value: Row): T {
    const model = this;
    Object.defineProperty(value, 'save', {
      enumerable: false,
      configurable: true,
      value: () => model.updateDocument(value),
    });
    Object.defineProperty(value, 'toJSON', {
      enumerable: false,
      configurable: true,
      value: () => {
        const result: Row = { ...value, id: value._id };
        for (const hidden of model.definition.hiddenFields ?? []) delete result[hidden];
        return result;
      },
    });
    if (this.definition.table === 'users') {
      Object.defineProperty(value, 'comparePassword', {
        enumerable: false,
        value: async (candidate: string) => {
          const { comparePassword } = await import('../utils/password');
          return value.password ? comparePassword(candidate, value.password) : false;
        },
      });
    }
    return value as T;
  }

  async loadChildren(value: Row): Promise<void> {
    await this.definition.loadChildren?.(value);
  }

  async populate(row: Row, path: string, select?: string): Promise<void> {
    const collectionRelation = this.definition.collectionRelations?.[path];
    if (collectionRelation && Array.isArray(row[path])) {
      const relation = collectionRelation;
      const targetColumns = relation.targetTable === 'users'
        ? '`id`, `username`, `email`, `role`, `first_name`, `last_name`, `phone`, `active`, `station_id`, `created_at`, `updated_at`'
        : 'target.*';
      const rows = await query<Row & RowDataPacket>(
        `SELECT ${targetColumns} FROM ${identifier(relation.table)} AS link
         JOIN ${identifier(relation.targetTable)} AS target ON target.id = link.${identifier(relation.itemColumn)}
         WHERE link.${identifier(relation.ownerColumn)} = ?
         ${relation.orderColumn ? `ORDER BY link.${identifier(relation.orderColumn)}` : ''}`,
        [row._id],
      );
      row[path] = rows.map((item) => projectRelation(
        mapRow(item, { table: relation.targetTable, fields: Object.fromEntries(Object.keys(item).map((column) => [column.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), column])) }),
        select,
      ));
      return;
    }
    const nestedRelation = this.definition.nestedRelations?.[path];
    if (nestedRelation) {
      const items = row[nestedRelation.collection];
      if (!Array.isArray(items)) return;
      const columns = nestedRelation.fields?.length
        ? nestedRelation.fields.map(identifier).join(', ')
        : nestedRelation.table === 'users'
          ? '`id`, `username`, `email`, `role`, `first_name`, `last_name`, `phone`, `active`, `station_id`, `created_at`, `updated_at`'
          : '*';
      for (const item of items) {
        const id = item[nestedRelation.localProperty];
        if (id == null) { item[nestedRelation.localProperty] = null; continue; }
        const rows = await query<Row & RowDataPacket>(
          `SELECT ${columns} FROM ${identifier(nestedRelation.table)} WHERE ${identifier(nestedRelation.targetId ?? 'id')} = ? LIMIT 1`,
          [id],
        );
        if (rows[0]) item[nestedRelation.localProperty] = projectRelation(
          mapRow(rows[0], { table: nestedRelation.table, fields: Object.fromEntries(Object.keys(rows[0]).map((column) => [column.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), column])) }),
          select,
        );
      }
      return;
    }
    const relation = this.definition.relations?.[path];
    if (!relation) return;
    const id = row[path];
    if (id == null) { row[path] = null; return; }
    const fields = relation.fields?.length
      ? relation.fields.map(identifier).join(', ')
      : relation.table === 'users'
        ? '`id`, `username`, `email`, `role`, `first_name`, `last_name`, `phone`, `active`, `station_id`, `created_at`, `updated_at`'
        : '*';
    const rows = await query<Row & RowDataPacket>(
      `SELECT ${fields} FROM ${identifier(relation.table)} WHERE ${identifier(relation.foreign ?? 'id')} = ? LIMIT 1`,
      [id],
    );
    if (rows[0]) {
      const foreignModelFields: FieldMap = Object.fromEntries(
        Object.keys(rows[0]).map((column) => [column.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), column]),
      );
      row[path] = projectRelation(mapRow(rows[0], { table: relation.table, fields: foreignModelFields }), select);
    } else row[path] = null;
  }

  private async insert(value: Row): Promise<T> {
    return withTransaction((connection) => this.insertWithConnection(value, connection));
  }

  private async insertWithConnection(value: Row, connection: PoolConnection): Promise<T> {
    const input = { ...this.definition.defaults, ...value };
    input._id = input._id || newId();
    input.createdAt = input.createdAt || new Date();
    if (this.definition.fields.updatedAt) input.updatedAt = input.updatedAt || new Date();
    this.definition.validate?.(input);
    await this.definition.beforeInsert?.(input);
    await this.persistMain(input, connection, true);
    await this.persistChildren(input, connection);
    return this.hydrate(input);
  }

  private async updateWithConnection(value: Row, connection: PoolConnection): Promise<void> {
    await this.persistMain(value, connection, false);
    await this.persistChildren(value, connection);
  }

  private async persistMain(value: Row, connection: PoolConnection, insert: boolean): Promise<void> {
    const entries = omitUndefinedEntries(
      Object.entries(this.definition.fields)
        .filter(([property]) => property in value)
        .map(([property, column]) => [column, value[property]] as const),
    );
    if (insert) entries.unshift(['id', value._id]);
    if (entries.length === 0) return;
    const names = entries.map(([column]) => identifier(column));
    const values = entries.map(([, item]) => item);
    if (insert) {
      await connection.execute(
        `INSERT INTO ${identifier(this.definition.table)} (${names.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`,
        values,
      );
    } else {
      const updates = entries.filter(([column]) => column !== 'id');
      if (updates.length) {
        await connection.execute(
          `UPDATE ${identifier(this.definition.table)} SET ${updates.map(([column]) => `${identifier(column)} = ?`).join(', ')} WHERE id = ?`,
          [...updates.map(([, item]) => item), value._id],
        );
      }
    }
  }

  private async persistChildren(value: Row, connection: PoolConnection): Promise<void> {
    if (this.definition.saveChildren) {
      await this.definition.saveChildren(value, connection);
      return;
    }
    for (const child of this.definition.children ?? []) {
      if (!Array.isArray(value[child.property])) continue;
      await connection.execute(`DELETE FROM ${identifier(child.table)} WHERE ${identifier(child.parentKey)} = ?`, [value._id]);
      const rows = value[child.property] as Row[];
      for (let index = 0; index < rows.length; index += 1) {
        await this.persistChild(child, rows[index], value._id, index, connection);
      }
    }
  }

  private async persistChild(child: Child, row: Row, parentId: string, position: number, connection: PoolConnection): Promise<void> {
    const entries: Array<[string, any]> = [[child.parentKey, parentId]];
    if (child.positionKey) entries.push([child.positionKey, position]);
    for (const [property, column] of Object.entries(child.columns)) {
      if (property in row && row[property] !== undefined) entries.push([column, row[property]]);
    }
    await connection.execute(
      `INSERT INTO ${identifier(child.table)} (${entries.map(([column]) => identifier(column)).join(', ')}) VALUES (${entries.map(() => '?').join(', ')})`,
      entries.map(([, value]) => value),
    );
  }
}

export const model = <T extends Row = Row>(definition: ModelDefinition): SqlModel<T> => new SqlModel<T>(definition);
