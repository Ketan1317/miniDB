export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  parse() {
    const token = this.current();

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

  current() {
    return this.tokens[this.index];
  }

  advance() {
    const token = this.current();
    this.index++;
    return token;
  }

  expect(type, value = null) {
    const token = this.current();

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

    while (this.current().value !== ")") {
      const name = this.expect("IDENTIFIER").value;
      const type = this.expect("KEYWORD").value;

      columns.push({ name, type });
      if (this.current().value === ",") {
        this.advance();
      }
    }

    this.expect("SYMBOL", ")");
    if (this.current().value === ";") {
      this.advance();
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

    while (this.current().value !== ")") {
      values.push(this.parseValue());

      if (this.current().value === ",") {
        this.advance();
      }
    }

    this.expect("SYMBOL", ")");

    if (this.current().value === ";") {
      this.advance();
    }

    return { type: "INSERT", tableName, values };
  }

  parseSelect() {
    this.expect("KEYWORD", "SELECT");

    const columns = [];
    if (this.current().value === "*") {
      columns.push("*");
      this.advance();
    } else {
      while (true) {
        columns.push(this.expect("INDENTIFIER").value);
        if (this.current().value !== ",") {
          break;
        }
        this.advance();
      }
    }

    this.expect("KEYWORD", "FROM");
    const tableName = this.expect("IDENTIFIER").value;

    if (this.current().value === ";") {
      this.advance();
    }

    return { type: "SELECT", tableName, columns };
  }

  parseValue() {
    const token = this.current();

    if (token.type === "NUMBER" || token.type === "STRING") {
      this.advance();
      return token.value;
    }

    if (token.value === "TRUE") {
      this.advance();
      return true;
    }

    if (token.value === "FALSE") {
      this.advance();
      return false;
    }

    throw new Error(`Invalid value: ${token.value}`);
  }
}
