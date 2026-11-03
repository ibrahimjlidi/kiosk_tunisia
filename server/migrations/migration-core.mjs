export const SOURCE_COLLECTIONS = {
  users: 'users',
  stations: 'stations',
  products: 'products',
  suppliers: 'suppliers',
  customers: 'customers',
  teams: 'teams',
  pumps: 'pumps',
  tanks: 'tanks',
  shifts: 'shifts',
  sales: 'sales',
  purchaseOrders: 'purchaseorders',
  expenses: 'expenses',
  kifReturns: 'kifreturns',
  tankGauging: 'tankgaugings',
  dailyClosures: 'dailyclosures',
  dayClosures: 'dayclosures',
  productPurchases: 'productpurchases',
  creditTransactions: 'credittransactions',
  refreshTokens: 'refreshtokens',
  auditLogs: 'auditlogs',
  settings: 'settings',
};

const TABLES = [
  'users', 'stations', 'products', 'suppliers', 'customers', 'teams', 'team_members',
  'pumps', 'pump_pistols', 'tanks', 'shifts', 'shift_employees', 'shift_pump_readings',
  'shift_pistol_readings', 'shift_product_volumes', 'sales', 'purchase_orders',
  'purchase_order_items', 'expenses', 'kif_returns', 'tank_gaugings', 'daily_closures',
  'day_closures', 'product_purchases', 'credit_transactions', 'refresh_tokens',
  'audit_logs', 'settings',
];

export function objectId(value, label = 'ObjectId') {
  if (value == null) return null;
  const hex = typeof value === 'string'
    ? value
    : typeof value.toHexString === 'function'
      ? value.toHexString()
      : null;
  if (!hex || !/^[a-f\d]{24}$/i.test(hex)) {
    throw new Error(`${label} must be a 24-character MongoDB ObjectId`);
  }
  return hex.toLowerCase();
}

function documentId(document, label) {
  return objectId(document?._id, `${label}._id`);
}

function date(value) {
  if (value == null) return null;
  const result = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(result.getTime())) throw new Error(`Invalid date value: ${value}`);
  return result;
}

function bool(value) {
  return Boolean(value);
}

function row(id, columns, document) {
  return document ? { id, ...columns, mongo_version: document.__v ?? null } : { id, ...columns };
}

export function createMigrationPlan(collections) {
  const plan = Object.fromEntries(TABLES.map((table) => [table, []]));
  const ids = Object.fromEntries(Object.keys(SOURCE_COLLECTIONS).map((key) => [
    key,
    new Set((collections[key] ?? []).map((document) => documentId(document, key))),
  ]));
  ids.pistols = new Set((collections.pumps ?? []).flatMap((pump, pumpIndex) =>
    (pump.pistols ?? []).map((pistol, position) => {
      if (pistol._id != null) return objectId(pistol._id, `pumps[${pumpIndex}].pistols[${position}]._id`);
      return null;
    }).filter(Boolean)));

  const requireReference = (value, target, label, required = false) => {
    if (value == null) {
      if (required) throw new Error(`${label} is required`);
      return null;
    }
    const ref = objectId(value, label);
    if (!ids[target]?.has(ref)) throw new Error(`${label} references missing ${target} document ${ref}`);
    return ref;
  };
  const required = (document, field, target, label) =>
    requireReference(document[field], target, `${label}.${field}`, true);
  const optional = (document, field, target, label) =>
    requireReference(document[field], target, `${label}.${field}`);

  for (const doc of collections.users ?? []) {
    plan.users.push(row(documentId(doc, 'users'), {
      username: doc.username, email: doc.email, password_hash: doc.password ?? null, role: doc.role,
      first_name: doc.firstName, last_name: doc.lastName, phone: doc.phone ?? null,
      active: bool(doc.active), station_id: optional(doc, 'station', 'stations', 'users'),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.stations ?? []) {
    plan.stations.push(row(documentId(doc, 'stations'), {
      name: doc.name, code: doc.code, address: doc.address, city: doc.city ?? null,
      phone: doc.phone ?? null, tax_id: doc.taxId ?? null,
      manager_id: optional(doc, 'manager', 'users', 'stations'), active: bool(doc.active),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.products ?? []) {
    plan.products.push(row(documentId(doc, 'products'), {
      name: doc.name, code: doc.code, category: doc.category, purchase_price: doc.purchasePrice,
      selling_price: doc.sellingPrice, vat_rate: doc.vatRate, unit_of_measure: doc.unitOfMeasure,
      min_stock_alert: doc.minStockAlert, current_stock: doc.currentStock, active: bool(doc.active),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.suppliers ?? []) {
    plan.suppliers.push(row(documentId(doc, 'suppliers'), {
      name: doc.name, code: doc.code ?? null, contact_person: doc.contactPerson ?? null,
      phone: doc.phone ?? null, email: doc.email ?? null, address: doc.address ?? null,
      tax_id: doc.taxId ?? null, active: bool(doc.active), created_at: date(doc.createdAt),
      updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.customers ?? []) {
    plan.customers.push(row(documentId(doc, 'customers'), {
      name: doc.name, phone: doc.phone ?? null, email: doc.email ?? null, address: doc.address ?? null,
      credit_balance: doc.creditBalance, created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.teams ?? []) {
    const teamId = documentId(doc, 'teams');
    plan.teams.push(row(teamId, {
      name: doc.name, station_id: optional(doc, 'station', 'stations', 'teams'),
      leader_id: optional(doc, 'leader', 'users', 'teams'), active: bool(doc.active),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
    (doc.members ?? []).forEach((member, position) => {
      plan.team_members.push({
        team_id: teamId, position, user_id: requireReference(member, 'users', `teams.members[${position}]`, true),
      });
    });
  }

  for (const doc of collections.pumps ?? []) {
    const pumpId = documentId(doc, 'pumps');
    plan.pumps.push(row(pumpId, {
      station_id: required(doc, 'station', 'stations', 'pumps'), pump_number: doc.pumpNumber,
      active: bool(doc.active), created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
    (doc.pistols ?? []).forEach((pistol, position) => {
      const pistolId = pistol._id == null
        ? `${pumpId.slice(0, 16)}${position.toString(16).padStart(8, '0')}`
        : objectId(pistol._id, `pumps.pistols[${position}]._id`);
      plan.pump_pistols.push({
        pump_id: pumpId, position, pistol_id: pistolId, pistol_number: pistol.pistolNumber,
        product_id: requireReference(pistol.product, 'products', `pumps.pistols[${position}].product`, true),
        current_closing_index: pistol.currentClosingIndex, active: bool(pistol.active),
      });
      ids.pistols.add(pistolId);
    });
  }

  for (const doc of collections.tanks ?? []) {
    plan.tanks.push(row(documentId(doc, 'tanks'), {
      station_id: required(doc, 'station', 'stations', 'tanks'),
      product_id: required(doc, 'product', 'products', 'tanks'), tank_number: doc.tankNumber,
      capacity: doc.capacity, current_stock: doc.currentStock, min_level_alert: doc.minLevelAlert,
      active: bool(doc.active), created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.shifts ?? []) {
    const shiftId = documentId(doc, 'shifts');
    plan.shifts.push(row(shiftId, {
      station_id: required(doc, 'station', 'stations', 'shifts'),
      shift_type: doc.shiftType, shift_date: date(doc.shiftDate), shift_number: doc.shiftNumber,
      status: doc.status, opened_by_id: required(doc, 'openedBy', 'users', 'shifts'),
      closed_by_id: optional(doc, 'closedBy', 'users', 'shifts'),
      team_id: optional(doc, 'team', 'teams', 'shifts'),
      total_sales_ht: doc.totalSalesHT, total_vat: doc.totalVAT, total_sales_ttc: doc.totalSalesTTC,
      total_profit: doc.totalProfit, cash_amount: doc.cashAmount, bank_card_amount: doc.bankCardAmount,
      fuel_card_amount: doc.fuelCardAmount, bank_transfer_amount: doc.bankTransferAmount,
      credit_amount: doc.creditAmount, total_payments: doc.totalPayments, balance: doc.balance,
      is_balanced: bool(doc.isBalanced), total_expenses: doc.totalExpenses,
      opened_at: date(doc.openedAt), closed_at: date(doc.closedAt), notes: doc.notes ?? null,
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
    (doc.employees ?? []).forEach((employee, position) => {
      plan.shift_employees.push({
        shift_id: shiftId, position,
        user_id: requireReference(employee, 'users', `shifts.employees[${position}]`, true),
      });
    });
    (doc.pumpReadings ?? []).forEach((reading, pumpPosition) => {
      plan.shift_pump_readings.push({
        shift_id: shiftId, position: pumpPosition,
        pump_id: requireReference(reading.pump, 'pumps', `shifts.pumpReadings[${pumpPosition}].pump`, true),
        pump_number: reading.pumpNumber,
      });
      (reading.pistolReadings ?? []).forEach((pistolReading, pistolPosition) => {
        plan.shift_pistol_readings.push({
          shift_id: shiftId, pump_position: pumpPosition, position: pistolPosition,
          pistol_id: requireReference(pistolReading.pistolId, 'pistols', `shifts.pumpReadings[${pumpPosition}].pistolReadings[${pistolPosition}].pistolId`, true),
          pistol_number: pistolReading.pistolNumber,
          product_id: requireReference(pistolReading.product, 'products', `shifts.pumpReadings[${pumpPosition}].pistolReadings[${pistolPosition}].product`, true),
          product_name: pistolReading.productName, product_code: pistolReading.productCode,
          purchase_price: pistolReading.purchasePrice, selling_price: pistolReading.sellingPrice,
          vat_rate: pistolReading.vatRate, opening_index: pistolReading.openingIndex,
          closing_index: pistolReading.closingIndex, volume_sold: pistolReading.volumeSold,
          amount_ht: pistolReading.amountHT, vat_amount: pistolReading.vatAmount,
          amount_ttc: pistolReading.amountTTC, profit: pistolReading.profit,
        });
      });
    });
    (doc.totalVolumeByProduct ?? []).forEach((volume, position) => {
      plan.shift_product_volumes.push({
        shift_id: shiftId, position,
        volume_id: objectId(volume._id, `shifts.totalVolumeByProduct[${position}]._id`)
          ?? `${shiftId.slice(0, 16)}${position.toString(16).padStart(8, '0')}`,
        product_id: optional(volume, 'product', 'products', `shifts.totalVolumeByProduct[${position}]`),
        product_name: volume.productName ?? null, volume_sold: volume.volumeSold,
      });
    });
  }

  for (const doc of collections.sales ?? []) {
    plan.sales.push(row(documentId(doc, 'sales'), {
      station_id: required(doc, 'station', 'stations', 'sales'),
      shift_id: optional(doc, 'shift', 'shifts', 'sales'),
      pump_id: optional(doc, 'pump', 'pumps', 'sales'),
      pistol_id: optional(doc, 'pistol', 'pistols', 'sales'),
      product_id: required(doc, 'product', 'products', 'sales'),
      customer_id: optional(doc, 'customer', 'customers', 'sales'),
      product_name: doc.productName, product_code: doc.productCode,
      employee_id: optional(doc, 'employee', 'users', 'sales'), quantity: doc.quantity,
      purchase_price: doc.purchasePrice, selling_price: doc.sellingPrice, vat_rate: doc.vatRate,
      amount_ht: doc.amountHT, vat_amount: doc.vatAmount, amount_ttc: doc.amountTTC,
      profit: doc.profit, payment_method: doc.paymentMethod, created_at: date(doc.createdAt),
    }, doc));
  }

  for (const doc of collections.purchaseOrders ?? []) {
    const orderId = documentId(doc, 'purchaseOrders');
    plan.purchase_orders.push(row(orderId, {
      supplier_id: required(doc, 'supplier', 'suppliers', 'purchaseOrders'),
      station_id: required(doc, 'station', 'stations', 'purchaseOrders'),
      order_number: doc.orderNumber, order_date: date(doc.orderDate), delivery_date: date(doc.deliveryDate),
      status: doc.status, total_amount: doc.totalAmount, notes: doc.notes ?? null,
      created_by_id: required(doc, 'createdBy', 'users', 'purchaseOrders'),
      delivered_by: doc.deliveredBy ?? null, created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
    (doc.items ?? []).forEach((item, position) => {
      plan.purchase_order_items.push({
        purchase_order_id: orderId, position,
        product_id: requireReference(item.product, 'products', `purchaseOrders.items[${position}].product`, true),
        quantity: item.quantity, unit_price: item.unitPrice, total_price: item.totalPrice,
        tank_id: optional(item, 'tank', 'tanks', `purchaseOrders.items[${position}]`),
      });
    });
  }

  for (const doc of collections.expenses ?? []) {
    plan.expenses.push(row(documentId(doc, 'expenses'), {
      station_id: optional(doc, 'station', 'stations', 'expenses'),
      supplier_id: optional(doc, 'supplier', 'suppliers', 'expenses'),
      type: doc.type, description: doc.description, amount: doc.amount, paid: bool(doc.paid),
      notes: doc.notes ?? null, created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.kifReturns ?? []) {
    plan.kif_returns.push(row(documentId(doc, 'kifReturns'), {
      station_id: required(doc, 'station', 'stations', 'kifReturns'),
      shift_id: optional(doc, 'shift', 'shifts', 'kifReturns'),
      return_date: date(doc.date), product_id: optional(doc, 'product', 'products', 'kifReturns'),
      quantity: doc.quantity, reason: doc.reason, notes: doc.notes ?? null,
      operator_id: required(doc, 'operator', 'users', 'kifReturns'),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.tankGauging ?? []) {
    plan.tank_gaugings.push(row(documentId(doc, 'tankGauging'), {
      tank_id: required(doc, 'tank', 'tanks', 'tankGauging'),
      station_id: required(doc, 'station', 'stations', 'tankGauging'),
      gauged_at: date(doc.gaugedAt), dip_reading: doc.dipReading,
      calculated_volume: doc.calculatedVolume, water_level: doc.waterLevel,
      temperature: doc.temperature, theoretical_stock: doc.theoreticalStock, variance: doc.variance,
      operator_id: required(doc, 'operator', 'users', 'tankGauging'),
      notes: doc.notes ?? null, created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const [source, target] of [['dailyClosures', 'daily_closures'], ['dayClosures', 'day_closures']]) {
    for (const doc of collections[source] ?? []) {
      plan[target].push(row(documentId(doc, source), {
        station_id: required(doc, 'station', 'stations', source), closure_date: date(doc.closureDate),
        status: doc.status, ...(source === 'dailyClosures' ? {
          sales_ttc: doc.salesTTC, total_payments: doc.totalPayments, total_expenses: doc.totalExpenses,
          total_purchases: doc.totalPurchases, total_kif_quantity: doc.totalKifQuantity,
          variance: doc.variance, is_balanced: bool(doc.isBalanced),
        } : {}),
        ...(source === 'dailyClosures' ? {
          notes: doc.notes ?? null, closed_by_id: optional(doc, 'closedBy', 'users', source),
          closed_at: date(doc.closedAt),
        } : {
          closed_by_id: optional(doc, 'closedBy', 'users', source),
          reopened_by_id: optional(doc, 'reopenedBy', 'users', source), notes: doc.notes ?? null,
        }),
        created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
      }, doc));
    }
  }

  for (const doc of collections.productPurchases ?? []) {
    plan.product_purchases.push(row(documentId(doc, 'productPurchases'), {
      product_id: required(doc, 'product', 'products', 'productPurchases'),
      station_id: optional(doc, 'station', 'stations', 'productPurchases'),
      supplier: doc.supplier ?? null, quantity: doc.quantity, unit_cost: doc.unitCost,
      total_cost: doc.totalCost, notes: doc.notes ?? null, created_at: date(doc.createdAt),
    }, doc));
  }

  for (const doc of collections.creditTransactions ?? []) {
    plan.credit_transactions.push(row(documentId(doc, 'creditTransactions'), {
      customer_id: required(doc, 'customer', 'customers', 'creditTransactions'),
      station_id: optional(doc, 'station', 'stations', 'creditTransactions'),
      type: doc.type, reference_id: objectId(doc.referenceId, 'creditTransactions.referenceId'),
      amount: doc.amount, notes: doc.notes ?? null, created_at: date(doc.createdAt),
    }, doc));
  }

  for (const doc of collections.refreshTokens ?? []) {
    plan.refresh_tokens.push(row(documentId(doc, 'refreshTokens'), {
      user_id: required(doc, 'user', 'users', 'refreshTokens'),
      token: doc.token, expires_at: date(doc.expiresAt), revoked: bool(doc.revoked),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.auditLogs ?? []) {
    plan.audit_logs.push(row(documentId(doc, 'auditLogs'), {
      user_id: optional(doc, 'user', 'users', 'auditLogs'), action: doc.action, status: doc.status,
      message: doc.message ?? null, metadata: doc.metadata ?? null,
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  for (const doc of collections.settings ?? []) {
    if (!Object.hasOwn(doc, 'value')) throw new Error(`settings.${documentId(doc, 'settings')} is missing value`);
    plan.settings.push(row(documentId(doc, 'settings'), {
      setting_key: doc.key, value: doc.value, type: doc.type, category: doc.category,
      description: doc.description ?? null, updated_by_id: optional(doc, 'updatedBy', 'users', 'settings'),
      created_at: date(doc.createdAt), updated_at: date(doc.updatedAt),
    }, doc));
  }

  return plan;
}

export function countRows(plan) {
  return Object.fromEntries(Object.entries(plan).map(([table, rows]) => [table, rows.length]));
}

export function toJsonValue(value) {
  return JSON.stringify(value, (_key, nested) => {
    if (nested && typeof nested.toHexString === 'function') return nested.toHexString();
    if (nested instanceof Date) return nested.toISOString();
    if (typeof nested === 'bigint') return nested.toString();
    return nested;
  });
}
