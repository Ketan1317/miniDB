export class Table {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.rows = [];
  }

  insert(row) {
    if (row.length !== this.schema.length) {
      throw new Error(
        `Expected ${this.schema.length} values, got ${row.length}`,
      );
    }

    this.validateRow(row);
    this.rows.push(row);
  }

  validateRow(row) {
    for (let i = 0; i < this.schema.length; i++) {
      const column = this.schema[i];
      const value = row[i];

      if (!this.isValidType(value, column.type)) {
        throw new Error(
          `Invalid value for column '${column.name}'. Expected ${column.type}`,
        );
      }
    }
  }

  isValidType(value, type) {
    if (value == null) {
      return true;
    }

    switch (type) {
      case "INT":
        return Number.isInteger(value);
      case "FLOAT":
        return typeof value === "number";
      case "TEXT":
        return typeof value === "string";
      case "BOOLEAN":
        return typeof value === "boolean";

      default:
        return false;
    }
  }

  selectAll() {
    return this.rows;
  }
}
