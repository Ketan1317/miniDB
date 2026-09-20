import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";

const sql = `
    CREATE TABLE users (
        id INT,
        name TEXT,
        age INT
    );
`;

const lexer = new Lexer(sql);

const tokens = lexer.tokenize();

console.log("TOKENS:");
console.log(tokens);

const parser = new Parser(tokens);

const ast = parser.parse();

console.log("AST:");
console.log(ast);