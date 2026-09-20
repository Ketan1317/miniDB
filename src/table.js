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

  select(columns, condition = null) {
    let rows = this.rows;
    if (condition) {
      rows = this.filterRows(condition);
    }
    if (columns.includes("*")) {
      return rows;
    }

    const colIndexes = columns.map((colName) => {
      const index = this.schema.findIndex((col) => col.name === colName);

      if (index === -1) {
        throw new Error(`Column '${colName}' does not exist`);
      }

      return index;
    });

    return rows.map((row) => {
      return colIndexes.map((idx) => row[idx]);
    });
  }

  filterRows(conditions) {
    return this.rows.filter((row) => {
        let res = this.evaluateCondition(row,conditions[0]);
        for(let i=1;i<conditions.length;i++){
            const logicalOp = conditions[i].operator;
            const currRes = this.evaluateCondition(row,conditions[i].condition);

            if(logicalOp === "AND"){
                res = res && currRes;
            }
            if(logicalOp === "OR"){
                res = res || currRes;
            }
        }
        return res;
    })
  }

  evaluateCondition(row, condition) {
    const columnIndex = this.schema.findIndex(
        (column) => column.name === condition.column
    );

    if (columnIndex === -1) {
        throw new Error(
            `Column '${condition.column}' does not exist`
        );
    }

    const rowValue = row[columnIndex];

    switch (condition.operator) {
        case "=":
            return rowValue === condition.value;

        case "!=":
            return rowValue !== condition.value;

        case ">":
            return rowValue > condition.value;

        case "<":
            return rowValue < condition.value;

        case ">=":
            return rowValue >= condition.value;

        case "<=":
            return rowValue <= condition.value;

        default:
            throw new Error(
                `Unsupported operator: ${condition.operator}`
            );
    }
}
}
