const identifier = (value) => {
  if (typeof value !== 'string' || !/^[a-z][a-z\d_]*$/i.test(value)) {
    throw new Error(`Invalid MySQL table/column identifier returned for foreign-key validation: ${value}`);
  }
  return `\`${value}\``;
};

function groupForeignKeys(constraints) {
  const grouped = new Map();
  for (const fk of constraints) {
    const key = `${fk.tableName}.${fk.constraintName}`;
    if (!grouped.has(key)) {
      grouped.set(key, { child: fk.tableName, parent: fk.parentTable, parts: [] });
    }
    grouped.get(key).parts.push([fk.columnName, fk.parentColumn]);
  }
  return grouped.values();
}

export async function validateDatabaseForeignKeys(connection) {
  const [constraints] = await connection.query(
    `SELECT table_name AS tableName, constraint_name AS constraintName,
            column_name AS columnName, referenced_table_name AS parentTable,
            referenced_column_name AS parentColumn, ordinal_position AS ordinalPosition
       FROM information_schema.key_column_usage
      WHERE constraint_schema = DATABASE() AND referenced_table_name IS NOT NULL
      ORDER BY table_name, constraint_name, ordinal_position`,
  );
  for (const fk of groupForeignKeys(constraints)) {
    const join = fk.parts.map(([child, parent]) =>
      `c.${identifier(child)} = p.${identifier(parent)}`).join(' AND ');
    const populated = fk.parts.map(([child]) => `c.${identifier(child)} IS NOT NULL`).join(' AND ');
    const [[result]] = await connection.query(
      `SELECT COUNT(*) AS count FROM ${identifier(fk.child)} c
       LEFT JOIN ${identifier(fk.parent)} p ON ${join}
       WHERE ${populated} AND p.${identifier(fk.parts[0][1])} IS NULL`,
    );
    if (Number(result.count) !== 0) {
      throw new Error(`${fk.child}.${fk.parts.map(([column]) => column).join(',')} has ${result.count} orphan foreign-key row(s)`);
    }
  }
}
