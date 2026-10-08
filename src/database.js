import { Table } from "./table.js";

export class Database {
  constructor() {
    this.tables = new Map();
  }

  createTable(name, schema) {
    if (this.tables.has(name)) {
      throw new Error(`Table '${name}' already exists`);
    }

    // Table Class
    const table = new Table(name, schema);
    this.tables.set(name, table);

    return table;
  }

  getTable(name) {
    const table = this.tables.get(name);

    if (!table) {
      throw new Error(`Table ${name} does not exists`);
    }

    return table;
  }

  insert(tableName, columns, values) {
    const table = this.getTable(tableName);
    table.insert(columns, values);
  }

  selectAll(tableName) {
    const table = this.getTable(tableName);
    return table.selectAll();
  }

  select(
    tableName,
    columns,
    condition = null,
    groupBy = null,
    having = null,
    orderBy = null,
    limit = null,
  ) {
    return this.getTable(tableName).select(
      columns,
      condition,
      groupBy,
      having,
      orderBy,
      limit,
    );
  }

  update(tableName, updates, conditions = null) {
    const table = this.getTable(tableName);
    return table.update(updates, conditions);
  }

  delete(tableName, conditions = null) {
    const table = this.getTable(tableName);
    return table.delete(conditions);
  }

  dropTable(tableName) {
    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist`);
    }
    this.tables.delete(tableName);
  }

  serialize() {
    return {
      tables: Array.from(this.tables.values()).map((table) => ({
        name: table.name,
        schema: table.schema,
        rows: table.rows,
      })),
    };
  }

  load(data) {
    this.tables.clear();

    if (!data || !data.tables) {
      return;
    }

    for (let tableData of data.tables) {
      const table = new Table(tableData.name, tableData.schema);
      table.rows = tableData.rows;
      this.tables.set(table.name, table);
    }
  }

  describeTable(tableName) {
    const table = this.getTable(tableName);

    return {
      columns: ["Field", "Type", "Length", "Null", "Key", "Default"],

      rows: table.schema.map((col) => [
        col.name,
        col.type,
        col.length ?? null,
        col.notNull ? "NO" : "YES",
        col.primaryKey ? "PRI" : col.unique ? "UNI" : null,
        col.defaultValue,
      ]),
    };
  }
}
