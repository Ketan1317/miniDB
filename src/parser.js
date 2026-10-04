export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  parse() {
    const token = this.currToken();

    switch (token.value) {
      case "CREATE":
        return this.parseCreateTable();
      case "INSERT":
        return this.parseInsert();
      case "SELECT":
        return this.parseSelect();
      case "UPDATE":
        return this.parseUpdate();
      case "DELETE":
        return this.parseDelete();

      default:
        throw new Error(`Unexpected token: ${token.value}`);
    }
  }

  currToken() {
    return this.tokens[this.index];
  }

  moveAhead() {
    const token = this.currToken();
    this.index++;
    return token;
  }

  expect(type, value = null) {
    const token = this.currToken();

    if (token.type !== type) {
      throw new Error(`Expected ${type}, got ${token.type}`);
    }
    if (value !== null && token.value !== value) {
      throw new Error(`Expected '${value}', got '${token.value}'`);
    }

    this.index++;
    return token;
  }

  parseCreateTable() {
    this.expect("KEYWORD", "CREATE");
    this.expect("KEYWORD", "TABLE");

    const tableName = this.expect("IDENTIFIER").value;
    this.expect("SYMBOL", "(");

    const columns = [];

    while (this.currToken().value !== ")") {
      const name = this.expect("IDENTIFIER").value;
      const type = this.expect("KEYWORD").value;

      const column = {
        name,
        type,
        primaryKey: false,
        unique: false,
        notNull: false,
        defaultValue: null,
      };

      while (this.currToken().value !== "," && this.currToken().value !== ")") {
        if (this.currToken().value === "PRIMARY") {
          this.moveAhead();
          this.expect("KEYWORD", "KEY");

          column.primaryKey = true;
          column.unique = true;
          column.notNull = true;
        } else if (this.currToken().value === "UNIQUE") {
          this.moveAhead();

          column.unique = true;
        } else if (this.currToken().value === "NOT") {
          this.moveAhead();
          this.expect("KEYWORD", "NULL");

          column.notNull = true;
        } else if (this.currToken().value === "DEFAULT") {
          this.moveAhead();

          column.defaultValue = this.parseValue();
        } else {
          throw new Error(`Unexpected constraint: ${this.currToken().value}`);
        }
      }

      columns.push(column);
      if (this.currToken().value === ",") {
        this.moveAhead();
      }
    }

    this.expect("SYMBOL", ")");
    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return { type: "CREATE_TABLE", tableName, columns };
  }

  parseInsert() {
    this.expect("KEYWORD", "INSERT");
    this.expect("KEYWORD", "INTO");

    const tableName = this.expect("IDENTIFIER").value;

    let cols = null;
    // Optional col list
    if (this.currToken().value === "(") {
      this.moveAhead();

      cols = [];

      while (this.currToken().value !== ")") {
        cols.push(this.expect("IDENTIFIER").value);

        if (this.currToken().value === ",") {
          this.moveAhead();
        }
      }

      this.expect("SYMBOL", ")");
    }

    this.expect("KEYWORD", "VALUES");
    this.expect("SYMBOL", "(");

    const values = [];

    while (this.currToken().value !== ")") {
      values.push(this.parseValue());

      if (this.currToken().value === ",") {
        this.moveAhead();
      }
    }

    this.expect("SYMBOL", ")");

    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return { type: "INSERT", tableName, values, columns: cols };
  }

  parseSelect() {
    this.expect("KEYWORD", "SELECT");

    const cols = [];

    while (true) {
      cols.push(this.parseSelectCols());
      if (this.currToken().value !== ",") {
        break;
      }
      this.moveAhead();
    }

    console.log(this.currToken());
    this.expect("KEYWORD", "FROM");
    const tableName = this.expect("IDENTIFIER").value;

    let where = null;
    if (this.currToken().value === "WHERE") {
      where = this.parseWhere();
    }

    let orderBy = null;
    if (this.currToken().value === "ORDER") {
      orderBy = this.parseOrderBy();
    }

    let limit = null;
    if (this.currToken().value === "LIMIT") {
      limit = this.parseLimit();
    }

    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return { type: "SELECT", tableName, columns : cols, where, orderBy, limit };
  }

  parseSelectCols() {
    const aggFunc = ["COUNT", "SUM", "AVG", "MIN", "MAX"];

    const token = this.currToken();
    if (aggFunc.includes(token.value.toUpperCase())) {
      const funcName = this.moveAhead().value.toUpperCase();
      this.expect("SYMBOL", "(");

      let col;
      if (this.currToken().value === "*") {
        col = "*";
        this.moveAhead();
      } else {
        col = this.expect("IDENTIFIER").value;
      }
      this.expect("SYMBOL", ")");

      return {
        type: "AGGREGATE",
        function: funcName,
        column : col,
      };
    }
    if (token.value === "*") {
      this.moveAhead();
      return "*";
    }

    return this.expect("IDENTIFIER").value;
  }

  parseUpdate() {
    this.expect("KEYWORD", "UPDATE");
    const tableName = this.expect("IDENTIFIER").value;
    this.expect("KEYWORD", "SET");

    const updates = [];

    while (true) {
      const col = this.expect("IDENTIFIER").value;
      this.expect("OPERATOR", "=");
      const val = this.parseValue();

      updates.push({ column: col, value: val });
      if (this.currToken().value !== ",") {
        break;
      }

      this.moveAhead();
    }

    let where = null;

    if (this.currToken().value === "WHERE") {
      where = this.parseWhere();
    }

    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return {
      type: "UPDATE",
      tableName,
      updates,
      where,
    };
  }

  parseDelete() {
    this.expect("KEYWORD", "DELETE");
    this.expect("KEYWORD", "FROM");

    const tableName = this.expect("IDENTIFIER").value;

    let where = null;

    if (this.currToken().value === "WHERE") {
      where = this.parseWhere();
    }

    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return {
      type: "DELETE",
      tableName,
      where,
    };
  }

  parseWhere() {
    this.expect("KEYWORD", "WHERE");

    const conditions = [];
    conditions.push(this.parseCondition());

    while (
      this.currToken().value === "AND" ||
      this.currToken().value === "OR"
    ) {
      const logicalOp = this.moveAhead().value;
      const condition = this.parseCondition();
      conditions.push({ operator: logicalOp, condition });
    }

    return conditions;
  }

  parseCondition() {
    const column = this.expect("IDENTIFIER").value;
    const operator = this.expect("OPERATOR").value;
    const value = this.parseValue();

    return { column, operator, value };
  }

  parseValue() {
    const token = this.currToken();

    if (token.type === "NUMBER" || token.type === "STRING") {
      this.moveAhead();
      return token.value;
    }

    if (token.value === "TRUE") {
      this.moveAhead();
      return true;
    }

    if (token.value === "FALSE") {
      this.moveAhead();
      return false;
    }

    if (token.value === "NULL") {
      this.moveAhead();
      return null;
    }

    throw new Error(`Invalid value: ${token.value}`);
  }

  parseOrderBy() {
    this.expect("KEYWORD", "ORDER");
    this.expect("KEYWORD", "BY");

    const column = this.expect("IDENTIFIER").value;
    let direction = "ASC";

    if (this.currToken().value === "ASC" || this.currToken().value === "DESC") {
      direction = this.moveAhead().value;
    }

    return {
      column,
      direction,
    };
  }

  parseLimit() {
    this.expect("KEYWORD", "LIMIT");
    const token = this.expect("NUMBER");

    if (!Number.isInteger(token.value)) {
      throw new Error("LIMIT must be an integer");
    }

    if (token.value < 0) {
      throw new Error("LIMIT cannot be negative");
    }

    return token.value;
  }
}
