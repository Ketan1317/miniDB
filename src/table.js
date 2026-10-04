export class Table {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.rows = [];
  }

  insert(columns, values) {
    let finalRow;
    // Normal way
    if (columns == null) {
      if (values.length !== this.schema.length) {
        throw new Error(
          `Expected ${this.schema.length} values, got ${values.length}`,
        );
      }

      finalRow = [...values];
    }
    // with specified columns
    else {
      if (columns.length !== values.length) {
        throw new Error(
          `Expected ${columns.length} values, got ${values.length}`,
        );
      }

      finalRow = new Array(this.schema.length).fill(null);

      for (let i = 0; i < columns.length; i++) {
        const colIdx = this.schema.findIndex(
          (column) => column.name === columns[i],
        );

        if (colIdx === -1) {
          throw new Error(`Column '${columns[i]}' does not exist`);
        }

        finalRow[colIdx] = values[i];
      }
    }

    this.applyDefaults(finalRow);
    this.validateRow(finalRow);
    this.validateConstraints(finalRow);

    this.validateAllUniqueConstraints([...this.rows, finalRow]);

    this.rows.push(finalRow);
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

  applyDefaults(row) {
    for (let i = 0; i < this.schema.length; i++) {
      const col = this.schema[i];

      if (row[i] === null && col.defaultValue !== null) {
        row[i] = col.defaultValue;
      }
    }
  }

  selectAll() {
    return this.rows;
  }

  select(columns, condition = null, orderBy = null, limit = null) {
    let rows = this.rows;

    if (condition) {
      rows = this.filterRows(condition);
    }

    if (orderBy) {
      rows = this.sortRows(rows, orderBy);
    }

    if (limit !== null) {
      rows = rows.slice(0, limit);
    }

    if (this.hasAggrFunc(columns)) {
      return this.executeAggregates(rows, columns);
    }

    let selectedColumns;

    if (columns.includes("*")) {
      selectedColumns = this.schema;
    } else {
      selectedColumns = columns.map((columnName) => {
        const column = this.schema.find((column) => column.name === columnName);

        if (!column) {
          throw new Error(`Column '${columnName}' does not exist`);
        }

        return column;
      });
    }

    const columnIndexes = selectedColumns.map((column) =>
      this.schema.findIndex(
        (schemaColumn) => schemaColumn.name === column.name,
      ),
    );

    const resultRows = rows.map((row) =>
      columnIndexes.map((index) => row[index]),
    );

    return {
      columns: selectedColumns.map((column) => column.name),
      rows: resultRows,
    };
  }

  hasAggrFunc(columns) {
  if (!Array.isArray(columns)) {
    return false;
  }

  return columns.some(
    (column) =>
      typeof column === "object" &&
      column.type === "AGGREGATE"
  );
}

  executeAggregates(rows, columns) {
    console.log("Aggregate columns:", columns);
    const resRow = [];
    const resCols = [];

    for (let col of columns) {
      const funcName = col.function;
      const colName = col.column;

      let values;

      if (colName === "*") {
        values = rows;
      } else {
        const colIdx = this.schema.findIndex((col) => col.name === colName);

        if (colIdx === -1) {
          throw new Error(`Column '${colName}' does not exist`);
        }

        values = rows
          .map((row) => row[colIdx])
          .filter((value) => value !== null);
      }

      const result = this.calculateAggr(funcName, colName, values);
      resCols.push(`${funcName}(${colName})`);

      resRow.push(result);
    }
    return {
      columns: resCols,
      rows: [resRow],
    };
  }

  calculateAggr(functionName, columnName, values) {
    switch (functionName) {
      case "COUNT":
        return values.length;

      case "SUM":
        this.validateNumVals(values, columnName);
        return values.reduce((sum, value) => sum + value, 0);

      case "AVG":
        this.validateNumVals(values, columnName);
        if (values.length === 0) {
          return null;
        }
        return values.reduce((sum, value) => sum + value, 0) / values.length;

      case "MIN":
        if (values.length === 0) {
          return null;
        }
        return Math.min(...values);

      case "MAX":
        if (values.length === 0) {
          return null;
        }
        return Math.max(...values);

      default:
        throw new Error(`Unsupported aggregate function: ${functionName}`);
    }
  }

  validateNumVals(values, columnName) {
    for (const value of values) {
      if (typeof value !== "number") {
        throw new Error(
          `Aggregate function requires a numeric column: '${columnName}'`,
        );
      }
    }
  }

  filterRows(conditions) {
    return this.rows.filter((row) => this.evaluateConditions(row, conditions));
  }

  update(updates, conditions = null) {
    const updatedRows = this.rows.map((row) => [...row]);
    for (let i = 0; i < updatedRows.length; i++) {
      const row = updatedRows[i];
      if (conditions && !this.evaluateConditions(row, conditions)) {
        continue;
      }

      for (let update of updates) {
        const colIdx = this.schema.findIndex(
          (col) => col.name === update.column,
        );
        if (colIdx == -1) {
          throw new Error(`Column ${update.column} does not exist`);
        }

        row[colIdx] = update.value;
      }
    }

    // // Validate all modified rows BEFORE changing this.rows
    for (let i = 0; i < updatedRows.length; i++) {
      const orgRow = this.rows[i];
      const updatedRow = updatedRows[i];

      if (conditions && !this.evaluateConditions(orgRow, conditions)) {
        continue;
      }
      this.validateRow(updatedRow);
      this.validateConstraints(updatedRow);
    }
    this.validateAllUniqueConstraints(updatedRows);
    let updateCnt = 0;

    for (let i = 0; i < this.rows.length; i++) {
      if (!conditions || this.evaluateConditions(this.rows[i], conditions)) {
        this.rows[i] = updatedRows[i];
        updateCnt++;
      }
    }

    return updateCnt;
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
  validateConstraints(row) {
    for (let i = 0; i < this.schema.length; i++) {
      const column = this.schema[i];
      const value = row[i];

      if (column.notNull && value === null) {
        throw new Error(`Column '${column.name}' cannot be NULL`);
      }
    }
  }

  validateAllUniqueConstraints(rows) {
    for (let i = 0; i < this.schema.length; i++) {
      const col = this.schema[i];

      if (!col.unique && !col.primaryKey) {
        continue;
      }

      const seen = new Set();
      for (let row of rows) {
        let val = row[i];
        if (val == null) {
          continue;
        }
        if (seen.has(val)) {
          throw new Error(`Duplicate value '${val}' for column '${col.name}'`);
        }
        seen.add(val);
      }
    }
  }

  delete(conditions = null) {
    if (!conditions) {
      const cnt = this.rows.length;
      this.rows = [];
      return cnt;
    }

    const orgLength = this.rows.length;

    this.rows = this.rows.filter(
      (row) => !this.evaluateConditions(row, conditions),
    );

    return orgLength - this.rows.length;
  }

  evaluateCondition(row, condition) {
    // return a boolean
    const colIdx = this.schema.findIndex(
      (column) => column.name === condition.column,
    );

    if (colIdx === -1) {
      throw new Error(`Column '${condition.column}' does not exist`);
    }

    const rowValue = row[colIdx];

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
        throw new Error(`Unsupported operator: ${condition.operator}`);
    }
  }

  evaluateConditions(row, conditions) {
    let res = this.evaluateCondition(row, conditions[0]);

    for (let i = 1; i < conditions.length; i++) {
      const logicalOp = conditions[i].operator;
      const currRes = this.evaluateCondition(row, conditions[i].condition);

      if (logicalOp === "AND") {
        res = res && currRes;
      }

      if (logicalOp === "OR") {
        res = res || currRes;
      }
    }
    return res;
  }

  sortRows(rows, orderBy) {
    const colIdx = this.schema.findIndex(
      (column) => column.name === orderBy.column,
    );

    if (colIdx === -1) {
      throw new Error(`Column '${orderBy.column}' does not exist`);
    }

    const sortedRows = [...rows];

    sortedRows.sort((a, b) => {
      const valueA = a[colIdx];
      const valueB = b[colIdx];

      if (valueA === valueB) {
        return 0;
      }

      if (valueA == null) {
        return 1;
      }

      if (valueB == null) {
        return -1;
      }

      if (valueA < valueB) {
        return orderBy.direction === "ASC" ? -1 : 1;
      }

      return orderBy.direction === "ASC" ? 1 : -1;
    });
    return sortedRows;
  }
}
