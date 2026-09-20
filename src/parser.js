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

      columns.push({ name, type });
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

    return { type: "INSERT", tableName, values };
  }

  parseSelect() {
    this.expect("KEYWORD", "SELECT");

    const columns = [];
    if (this.currToken().value === "*") {
      columns.push("*");
      this.moveAhead();
    } else {
      while (true) {
        columns.push(this.expect("IDENTIFIER").value);
        if (this.currToken().value !== ",") {
          break;
        }
        this.moveAhead();
      }
    }

    this.expect("KEYWORD", "FROM");
    const tableName = this.expect("IDENTIFIER").value;

    let where = null;
    if (this.currToken().value === "WHERE") {
      where = this.parseWhere();
    }

    if (this.currToken().value === ";") {
      this.moveAhead();
    }

    return { type: "SELECT", tableName, columns, where };
  }

  parseWhere() {
    this.expect("KEYWORD", "WHERE");

    const conditions = [];
    conditions.push(this.parseCondition());

    while (this.currToken().value === "AND" || this.currToken().value == "OR") {
      const logicalOp = this.moveAhead().value;
      const condition = this.parseCondition();
      conditions.push({operator:logicalOp, condition})
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

    throw new Error(`Invalid value: ${token.value}`);
  }
}
