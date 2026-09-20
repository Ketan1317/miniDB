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

  insert(tableName, row) {
    const table = this.getTable(tableName);
    table.insert(row);
  }

  selectAll(tableName) {
    const table = this.getTable(tableName);
    return table.selectAll();
  }
}
