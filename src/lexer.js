export class Lexer {
  constructor(input) {
    this.input = input;
    this.index = 0;
    this.tokens = [];
  }

  tokenize() {
    while (this.index < this.input.length) {
      const char = this.input[this.index];

      // Ignore whitespace
      // \s matches - It matches : space, tab, newline
      if (/\s/.test(char)) {
        this.index++;
        continue;
      }

      // Identifier or keyword
      if (/[a-zA-Z_]/.test(char)) {
        this.readWord();
        continue;
      }

      // Number
      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }

      // String
      if (char === "'" || char === '"') {
        this.readString(char);
        continue;
      }

      // Symbols
      if ("(),;".includes(char)) {
        this.tokens.push({
          type: "SYMBOL",
          value: char,
        });

        this.index++;
        continue;
      }

      if (char === "*") {
        this.tokens.push({
          type: "SYMBOL",
          value: "*",
        });

        this.index++;
        continue;
      }

      // Operators
      if ("=<>!".includes(char)) {
        this.readOperator();
        continue;
      }

      throw new Error(`Unexpected character: '${char}'`);
    }

    this.tokens.push({
      type: "EOF",
      value: null,
    });

    return this.tokens;
  }

  readWord() {
    const start = this.index;
    while (
      this.index < this.input.length &&
      /[a-zA-Z0-9_]/.test(this.input[this.index])
    ) {
      this.index++;
    }

    const value = this.input.slice(start, this.index);
    const keywords = [
      "CREATE",
      "TABLE",
      "INSERT",
      "INTO",
      "VALUES",
      "SELECT",
      "FROM",
      "WHERE",
      "UPDATE",
      "DELETE",
      "INT",
      "FLOAT",
      "TEXT",
      "BOOLEAN",
      "TRUE",
      "FALSE",
      "AND",
      "OR",
      "ORDER",
      "BY",
      "ASC",
      "DESC",
      "LIMIT",
      "SET",
      "PRIMARY",
      "KEY",
      "UNIQUE",
      "NOT",
      "NULL",
      "DEFAULT",
    ];

    if (keywords.includes(value.toUpperCase())) {
      this.tokens.push({ type: "KEYWORD", value: value.toUpperCase() });
    } else {
      this.tokens.push({ type: "IDENTIFIER", value });
    }
  }

  readNumber() {
    const start = this.index;

    while (
      this.index < this.input.length &&
      /[0-9.]/.test(this.input[this.index])
    ) {
      this.index++;
    }

    const value = this.input.slice(start, this.index);
    this.tokens.push({ type: "NUMBER", value: Number(value) });
  }

  readString(quote) {
    this.index++;
    const start = this.index;

    while (this.index < this.input.length && this.input[this.index] !== quote) {
      this.index++;
    }

    if (this.index >= this.input.length) {
      throw new Error("Unterminated string");
    }

    const value = this.input.slice(start, this.index);
    this.tokens.push({ type: "STRING", value });
    this.index++;
  }

  readOperator() {
    const char = this.input[this.index];
    const next = this.input[this.index + 1];

    if ((char === ">" || char === "<" || char === "!") && next === "=") {
      this.tokens.push({
        type: "OPERATOR",
        value: char + next,
      });

      this.index += 2;
      return;
    }

    if (char === "=" || char === ">" || char === "<") {
      this.tokens.push({
        type: "OPERATOR",
        value: char,
      });

      this.index++;
      return;
    }

    throw new Error(`Invalid operator: '${char}'`);
  }
}
