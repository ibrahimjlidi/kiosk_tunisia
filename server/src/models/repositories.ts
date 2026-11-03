import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { query } from '../config/db';
import { hashPassword } from '../utils/password';
import { model, ModelDefinition, newId } from './sqlModel';

type Row = Record<string, any>;
const fields = (pairs: string): Record<string, string> => Object.fromEntries(
  pairs.split(/\s+/).filter(Boolean).map((field) => [field, field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)]),
);
const idFields = (pairs: string, ...references: string[]): Record<string, string> => {
  const result = fields(pairs);
  for (const reference of references) result[reference] = `${fields(reference)[reference]}_id`;
  return result;
};
const ref = (table: string, local: string, foreign = 'id'): { table: string; local: string; foreign: string } => ({ table, local, foreign });
const bool = (value: any) => Boolean(value);
const number = (value: any) => Number(value ?? 0);

function validRequired(value: Row, names: string[]): void {
  for (const name of names) if (value[name] === undefined || value[name] === null || value[name] === '') throw new Error(`${name} is required`);
}

function create(definition: ModelDefinition) { return model<any>(definition); }

export const User = create({
  table: 'users',
  fields: { ...idFields('username email role firstName lastName phone active station createdAt updatedAt', 'station'), password: 'password_hash' },
  defaults: { active: true, role: 'OPERATOR' },
  hiddenFields: ['password'],
  relations: { station: ref('stations', 'station_id') },
  validate(value) {
    validRequired(value, ['username', 'email', 'role', 'firstName', 'lastName']);
    if (value.username.length < 3) throw new Error('Username must be at least 3 characters');
    if (!/^\S+@\S+\.\S+$/.test(value.email)) throw new Error('Please use a valid email address');
    if (value.password && value.password.length < 6) throw new Error('Password must be at least 6 characters');
  },
  async beforeInsert(value) {
    value.username = String(value.username).trim().toLowerCase();
    value.email = String(value.email).trim().toLowerCase();
    value.firstName = String(value.firstName).trim();
    value.lastName = String(value.lastName).trim();
    if (value.password && !/^\$2[aby]\$/.test(value.password)) value.password = await hashPassword(value.password);
  },
  async beforeUpdate(value) {
    if (value.password && !/^\$2[aby]\$/.test(value.password)) value.password = await hashPassword(value.password);
  },
});

export const Station = create({
  table: 'stations',
  fields: idFields('name code address city phone taxId manager active createdAt updatedAt', 'manager'),
  defaults: { city: 'Tunis', active: true },
  relations: { manager: ref('users', 'manager_id') },
  validate: (v) => validRequired(v, ['name', 'code', 'address']),
  beforeInsert: async (value) => { value.code = String(value.code).trim().toUpperCase(); },
  beforeUpdate: async (value) => { value.code = String(value.code).trim().toUpperCase(); },
});

export const Product = create({
  table: 'products',
  fields: fields('name code category purchasePrice sellingPrice vatRate unitOfMeasure minStockAlert currentStock active createdAt updatedAt'),
  defaults: { category: 'FUEL', vatRate: 19, unitOfMeasure: 'LITER', minStockAlert: 1000, currentStock: 0, active: true },
  validate(value) {
    validRequired(value, ['name', 'code', 'category', 'purchasePrice', 'sellingPrice', 'unitOfMeasure']);
    if (!['FUEL', 'KIOSK', 'SERVICE'].includes(value.category)) throw new Error('Invalid product category');
    if (!['LITER', 'UNIT', 'SERVICE'].includes(value.unitOfMeasure)) throw new Error('Invalid unit of measure');
    if (value.purchasePrice < 0 || value.sellingPrice < 0) throw new Error('Prices cannot be negative');
    if (value.vatRate < 0 || value.vatRate > 100) throw new Error('VAT rate must be between 0 and 100');
  },
});

export const Supplier = create({
  table: 'suppliers',
  fields: fields('name code contactPerson phone email address taxId active createdAt updatedAt'),
  defaults: { active: true },
  validate: (v) => validRequired(v, ['name']),
  async beforeInsert(value) {
    value.name = String(value.name).trim();
    value.code = String(value.code || `SUP-${Date.now().toString().slice(-6)}`).trim().toUpperCase();
    if (value.email) {
      value.email = String(value.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(value.email)) throw new Error('Please use a valid email address');
    }
  },
  async beforeUpdate(value) {
    if (value.code) value.code = String(value.code).trim().toUpperCase();
    if (value.email) {
      value.email = String(value.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(value.email)) throw new Error('Please use a valid email address');
    }
  },
});

export const Customer = create({
  table: 'customers',
  fields: fields('name phone email address creditBalance createdAt updatedAt'),
  defaults: { creditBalance: 0 },
  validate: (v) => validRequired(v, ['name']),
});

export const Pump = create({
  table: 'pumps',
  fields: idFields('station pumpNumber active createdAt updatedAt', 'station'),
  defaults: { active: true },
  relations: { station: ref('stations', 'station_id') },
  nestedRelations: {
    'pistols.product': {
      collection: 'pistols',
      localProperty: 'product',
      table: 'products',
      fields: ['id', 'name', 'code', 'category', 'purchase_price', 'selling_price', 'vat_rate'],
    },
  },
  validate(value) {
    validRequired(value, ['station', 'pumpNumber']);
    if (Array.isArray(value.pistols) && value.pistols.length > 4) throw new Error('A pump may have at most four pistols');
    for (const pistol of value.pistols ?? []) {
      validRequired(pistol, ['pistolNumber', 'product']);
      pistol.currentClosingIndex ??= 0;
      pistol.active ??= true;
      if (pistol.currentClosingIndex < 0) throw new Error('Closing index cannot be negative');
    }
  },
  async loadChildren(value) {
    const rows = await query<Row & RowDataPacket>('SELECT * FROM pump_pistols WHERE pump_id = ? ORDER BY position', [value._id]);
    value.pistols = rows.map((row) => ({
      _id: String(row.pistol_id),
      pistolNumber: row.pistol_number,
      product: String(row.product_id),
      currentClosingIndex: number(row.current_closing_index),
      active: bool(row.active),
    }));
  },
  async saveChildren(value, connection) {
    await connection.execute('DELETE FROM pump_pistols WHERE pump_id = ?', [value._id]);
    for (let position = 0; position < (value.pistols ?? []).length; position += 1) {
      const pistol = value.pistols[position];
      await connection.execute(
        'INSERT INTO pump_pistols (pump_id, position, pistol_id, pistol_number, product_id, current_closing_index, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [value._id, position, pistol._id || (pistol._id = newId()), pistol.pistolNumber, pistol.product, pistol.currentClosingIndex ?? 0, pistol.active ?? true],
      );
    }
  },
});

export const Tank = create({
  table: 'tanks',
  fields: idFields('station product tankNumber capacity currentStock minLevelAlert active createdAt updatedAt', 'station', 'product'),
  defaults: { active: true, currentStock: 0, minLevelAlert: 2000 },
  relations: { station: ref('stations', 'station_id'), product: ref('products', 'product_id') },
  validate(value) {
    validRequired(value, ['station', 'product', 'tankNumber', 'capacity']);
    if (value.capacity < 100) throw new Error('Tank capacity must be at least 100 liters');
    if (value.currentStock < 0) throw new Error('Tank stock cannot be negative');
  },
});

export const Team = create({
  table: 'teams',
  fields: idFields('name station leader active createdAt updatedAt', 'station', 'leader'),
  defaults: { active: true },
  relations: { station: ref('stations', 'station_id'), leader: ref('users', 'leader_id') },
  collectionRelations: {
    members: { table: 'team_members', ownerColumn: 'team_id', itemColumn: 'user_id', targetTable: 'users', orderColumn: 'position' },
  },
  validate: (value) => validRequired(value, ['name']),
  async loadChildren(value) {
    const rows = await query<Row & RowDataPacket>('SELECT user_id FROM team_members WHERE team_id = ? ORDER BY position', [value._id]);
    value.members = rows.map((row) => String(row.user_id));
  },
  async saveChildren(value, connection) {
    await connection.execute('DELETE FROM team_members WHERE team_id = ?', [value._id]);
    for (let position = 0; position < (value.members ?? []).length; position += 1) {
      await connection.execute('INSERT INTO team_members (team_id, position, user_id) VALUES (?, ?, ?)', [value._id, position, value.members[position]]);
    }
  },
});

export const Shift = create({
  table: 'shifts',
  fields: idFields('station shiftType shiftDate shiftNumber status openedBy closedBy team totalSalesHT totalVAT totalSalesTTC totalProfit cashAmount bankCardAmount fuelCardAmount bankTransferAmount creditAmount totalPayments balance isBalanced totalExpenses openedAt closedAt notes createdAt updatedAt', 'station', 'openedBy', 'closedBy', 'team'),
  defaults: {
    status: 'OPEN', totalSalesHT: 0, totalVAT: 0, totalSalesTTC: 0, totalProfit: 0,
    cashAmount: 0, bankCardAmount: 0, fuelCardAmount: 0, bankTransferAmount: 0,
    creditAmount: 0, totalPayments: 0, balance: 0, isBalanced: false, totalExpenses: 0,
  },
  relations: {
    station: ref('stations', 'station_id'), openedBy: ref('users', 'opened_by_id'),
    closedBy: ref('users', 'closed_by_id'), team: ref('teams', 'team_id'),
  },
  collectionRelations: {
    employees: { table: 'shift_employees', ownerColumn: 'shift_id', itemColumn: 'user_id', targetTable: 'users', orderColumn: 'position' },
  },
  existsFilters: {
    employees: { table: 'shift_employees', parentColumn: 'shift_id', itemColumn: 'user_id' },
  },
  async loadChildren(value) {
    const [employees, pumps, readings, volumes] = await Promise.all([
      query<Row & RowDataPacket>('SELECT user_id FROM shift_employees WHERE shift_id = ? ORDER BY position', [value._id]),
      query<Row & RowDataPacket>('SELECT * FROM shift_pump_readings WHERE shift_id = ? ORDER BY position', [value._id]),
      query<Row & RowDataPacket>('SELECT * FROM shift_pistol_readings WHERE shift_id = ? ORDER BY pump_position, position', [value._id]),
      query<Row & RowDataPacket>('SELECT * FROM shift_product_volumes WHERE shift_id = ? ORDER BY position', [value._id]),
    ]);
    value.employees = employees.map((row) => String(row.user_id));
    value.pumpReadings = pumps.map((pump) => ({
      pump: String(pump.pump_id),
      pumpNumber: pump.pump_number,
      pistolReadings: readings.filter((reading) => reading.pump_position === pump.position).map((reading) => ({
        pistolId: String(reading.pistol_id), pistolNumber: reading.pistol_number, product: String(reading.product_id),
        productName: reading.product_name, productCode: reading.product_code, purchasePrice: number(reading.purchase_price),
        sellingPrice: number(reading.selling_price), vatRate: number(reading.vat_rate), openingIndex: number(reading.opening_index),
        closingIndex: number(reading.closing_index), volumeSold: number(reading.volume_sold), amountHT: number(reading.amount_ht),
        vatAmount: number(reading.vat_amount), amountTTC: number(reading.amount_ttc), profit: number(reading.profit),
      })),
    }));
    value.totalVolumeByProduct = volumes.map((item) => ({
      _id: String(item.volume_id), product: item.product_id ? String(item.product_id) : undefined,
      productName: item.product_name, volumeSold: number(item.volume_sold),
    }));
  },
  async saveChildren(value, connection) {
    for (const table of ['shift_employees', 'shift_pistol_readings', 'shift_pump_readings', 'shift_product_volumes']) {
      await connection.execute(`DELETE FROM ${table} WHERE shift_id = ?`, [value._id]);
    }
    for (let position = 0; position < (value.employees ?? []).length; position += 1) {
      await connection.execute('INSERT INTO shift_employees (shift_id, position, user_id) VALUES (?, ?, ?)', [value._id, position, value.employees[position]]);
    }
    for (let pumpPosition = 0; pumpPosition < (value.pumpReadings ?? []).length; pumpPosition += 1) {
      const pump = value.pumpReadings[pumpPosition];
      await connection.execute('INSERT INTO shift_pump_readings (shift_id, position, pump_id, pump_number) VALUES (?, ?, ?, ?)', [value._id, pumpPosition, pump.pump, pump.pumpNumber]);
      for (let position = 0; position < (pump.pistolReadings ?? []).length; position += 1) {
        const pistol = pump.pistolReadings[position];
        await connection.execute(
          `INSERT INTO shift_pistol_readings
           (shift_id, pump_position, position, pistol_id, pistol_number, product_id, product_name, product_code,
            purchase_price, selling_price, vat_rate, opening_index, closing_index, volume_sold, amount_ht, vat_amount, amount_ttc, profit)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [value._id, pumpPosition, position, pistol.pistolId, pistol.pistolNumber, pistol.product, pistol.productName, pistol.productCode,
            pistol.purchasePrice, pistol.sellingPrice, pistol.vatRate, pistol.openingIndex, pistol.closingIndex, pistol.volumeSold,
            pistol.amountHT, pistol.vatAmount, pistol.amountTTC, pistol.profit],
        );
      }
    }
    for (let position = 0; position < (value.totalVolumeByProduct ?? []).length; position += 1) {
      const volume = value.totalVolumeByProduct[position];
      await connection.execute(
        'INSERT INTO shift_product_volumes (shift_id, position, volume_id, product_id, product_name, volume_sold) VALUES (?, ?, ?, ?, ?, ?)',
        [value._id, position, volume._id || newId(), volume.product || null, volume.productName ?? null, volume.volumeSold ?? 0],
      );
    }
  },
});

export const Sale = create({
  table: 'sales',
  fields: idFields('station shift pump pistol product customer productName productCode employee quantity purchasePrice sellingPrice vatRate amountHT vatAmount amountTTC profit paymentMethod createdAt', 'station', 'shift', 'pump', 'pistol', 'product', 'customer', 'employee'),
  defaults: { paymentMethod: 'CASH', vatRate: 19 },
  relations: {
    station: ref('stations', 'station_id'), shift: ref('shifts', 'shift_id'), pump: ref('pumps', 'pump_id'),
    pistol: ref('pump_pistols', 'pistol_id', 'pistol_id'), product: ref('products', 'product_id'),
    customer: ref('customers', 'customer_id'), employee: ref('users', 'employee_id'),
  },
});

export const PurchaseOrder = create({
  table: 'purchase_orders',
  fields: idFields('supplier station orderNumber orderDate deliveryDate status totalAmount notes createdBy deliveredBy createdAt updatedAt', 'supplier', 'station', 'createdBy'),
  defaults: { status: 'PENDING', totalAmount: 0 },
  relations: {
    supplier: ref('suppliers', 'supplier_id'), station: ref('stations', 'station_id'), createdBy: ref('users', 'created_by_id'),
  },
  nestedRelations: {
    'items.product': { collection: 'items', localProperty: 'product', table: 'products', fields: ['id', 'name', 'code', 'category'] },
    'items.tank': { collection: 'items', localProperty: 'tank', table: 'tanks', fields: ['id', 'tank_number', 'capacity', 'current_stock'] },
  },
  async loadChildren(value) {
    const rows = await query<Row & RowDataPacket>('SELECT * FROM purchase_order_items WHERE purchase_order_id = ? ORDER BY position', [value._id]);
    value.items = rows.map((row) => ({
      product: String(row.product_id), quantity: number(row.quantity), unitPrice: number(row.unit_price),
      totalPrice: number(row.total_price), tank: row.tank_id ? String(row.tank_id) : undefined,
    }));
  },
  async saveChildren(value, connection) {
    await connection.execute('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [value._id]);
    for (let position = 0; position < (value.items ?? []).length; position += 1) {
      const item = value.items[position];
      const totalPrice = Number((item.quantity * item.unitPrice).toFixed(3));
      item.totalPrice = totalPrice;
      await connection.execute(
        'INSERT INTO purchase_order_items (purchase_order_id, position, product_id, quantity, unit_price, total_price, tank_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [value._id, position, item.product, item.quantity, item.unitPrice, totalPrice, item.tank || null],
      );
    }
    value.totalAmount = Number((value.items ?? []).reduce((total: number, item: Row) => total + item.totalPrice, 0).toFixed(3));
    await connection.execute('UPDATE purchase_orders SET total_amount = ? WHERE id = ?', [value.totalAmount, value._id]);
  },
});

export const Expense = create({
  table: 'expenses',
  fields: idFields('station supplier type description amount paid notes createdAt updatedAt', 'station', 'supplier'),
  defaults: { paid: false },
  relations: { station: ref('stations', 'station_id'), supplier: ref('suppliers', 'supplier_id') },
});

export const KifReturn = create({
  table: 'kif_returns',
  fields: { ...idFields('station shift date product quantity reason notes operator createdAt updatedAt', 'station', 'shift', 'product', 'operator'), date: 'return_date' },
  relations: {
    station: ref('stations', 'station_id'), shift: ref('shifts', 'shift_id'), product: ref('products', 'product_id'),
    operator: ref('users', 'operator_id'),
  },
});

export const TankGauging = create({
  table: 'tank_gaugings',
  fields: idFields('tank station gaugedAt dipReading calculatedVolume waterLevel temperature theoreticalStock variance operator notes createdAt updatedAt', 'tank', 'station', 'operator'),
  relations: { tank: ref('tanks', 'tank_id'), station: ref('stations', 'station_id'), operator: ref('users', 'operator_id') },
});

export const DailyClosure = create({
  table: 'daily_closures',
  fields: idFields('station closureDate status salesTTC totalPayments totalExpenses totalPurchases totalKifQuantity variance isBalanced notes closedBy closedAt createdAt updatedAt', 'station', 'closedBy'),
  defaults: { status: 'OPEN', salesTTC: 0, totalPayments: 0, totalExpenses: 0, totalPurchases: 0, totalKifQuantity: 0, variance: 0, isBalanced: false },
  relations: { station: ref('stations', 'station_id'), closedBy: ref('users', 'closed_by_id') },
});

export const DayClosure = create({
  table: 'day_closures',
  fields: idFields('station closureDate status closedBy reopenedBy notes createdAt updatedAt', 'station', 'closedBy', 'reopenedBy'),
  defaults: { status: 'OPEN' },
  relations: { station: ref('stations', 'station_id'), closedBy: ref('users', 'closed_by_id'), reopenedBy: ref('users', 'reopened_by_id') },
});

export const ProductPurchase = create({
  table: 'product_purchases',
  fields: idFields('product station supplier quantity unitCost totalCost notes createdAt', 'product', 'station'),
  relations: { product: ref('products', 'product_id'), station: ref('stations', 'station_id') },
});

export const CreditTransaction = create({
  table: 'credit_transactions',
  fields: idFields('customer station type referenceId amount notes createdAt', 'customer', 'station'),
  relations: { customer: ref('customers', 'customer_id'), station: ref('stations', 'station_id') },
});

export const RefreshToken = create({
  table: 'refresh_tokens',
  fields: idFields('user token expiresAt revoked createdAt updatedAt', 'user'),
  defaults: { revoked: false },
  relations: { user: ref('users', 'user_id') },
  validate: (value) => validRequired(value, ['user', 'token', 'expiresAt']),
});

export const AuditLog = create({
  table: 'audit_logs',
  fields: idFields('user action status message metadata createdAt updatedAt', 'user'),
  defaults: { status: 'success' },
  relations: { user: ref('users', 'user_id') },
});

export const Setting = create({
  table: 'settings',
  fields: { ...idFields('value type category description updatedBy createdAt updatedAt', 'updatedBy'), key: 'setting_key' },
  relations: { updatedBy: ref('users', 'updated_by_id') },
});
