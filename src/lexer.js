export class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.tokens = [];
    }

    tokenize() {
        while (this.position < this.input.length) {
            const char = this.input[this.position];

            // Ignore whitespace
            if (/\s/.test(char)) {
                this.position++;
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
                    value: char
                });

                this.position++;
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
            value: null
        });

        return this.tokens;
    }

    readWord() {
        const start = this.position;

        while (
            this.position < this.input.length &&
            /[a-zA-Z0-9_]/.test(this.input[this.position])
        ) {
            this.position++;
        }

        const value = this.input.slice(start, this.position);

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
            "AND",
            "OR",
            "ORDER",
            "BY",
            "ASC",
            "DESC",
            "LIMIT"
        ];

        if (keywords.includes(value.toUpperCase())) {
            this.tokens.push({
                type: "KEYWORD",
                value: value.toUpperCase()
            });
        } else {
            this.tokens.push({
                type: "IDENTIFIER",
                value
            });
        }
    }

    readNumber() {
        const start = this.position;

        while (
            this.position < this.input.length &&
            /[0-9.]/.test(this.input[this.position])
        ) {
            this.position++;
        }

        const value = this.input.slice(start, this.position);

        this.tokens.push({
            type: "NUMBER",
            value: Number(value)
        });
    }

    readString(quote) {
        this.position++;

        const start = this.position;

        while (
            this.position < this.input.length &&
            this.input[this.position] !== quote
        ) {
            this.position++;
        }

        if (this.position >= this.input.length) {
            throw new Error("Unterminated string");
        }

        const value = this.input.slice(start, this.position);

        this.tokens.push({
            type: "STRING",
            value
        });

        this.position++;
    }

    readOperator() {
        const char = this.input[this.position];
        const next = this.input[this.position + 1];

        if (
            (char === ">" || char === "<" || char === "!") &&
            next === "="
        ) {
            this.tokens.push({
                type: "OPERATOR",
                value: char + next
            });

            this.position += 2;
            return;
        }

        if (char === "=" || char === ">" || char === "<") {
            this.tokens.push({
                type: "OPERATOR",
                value: char
            });

            this.position++;
            return;
        }

        throw new Error(`Invalid operator: '${char}'`);
    }
}