import { Database } from "./database.js";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { Executor } from "./executor.js";

const db = new Database();
const executor = new Executor(db);

function executeSQL(sql) {
    console.log("\nSQL:");
    console.log(sql.trim());

    const lexer = new Lexer(sql);
    const tokens = lexer.tokenize();

    console.log("TOKENS:");
    console.log(tokens);

    const parser = new Parser(tokens);
    const ast = parser.parse();

    console.log("AST:");
    console.log(ast);

    const result = executor.execute(ast);

    console.log("RESULT:");
    console.log(result);

    return result;
}


// ========================================
// 1. CREATE TABLE
// ========================================

executeSQL(`
    CREATE TABLE users (
        id INT,
        name TEXT,
        age INT
    );
`);


// ========================================
// 2. INSERT
// ========================================

executeSQL(`
    INSERT INTO users VALUES (1, 'Ketan', 21);
`);

executeSQL(`
    INSERT INTO users VALUES (2, 'Rahul', 24);
`);

executeSQL(`
    INSERT INTO users VALUES (3, 'Aman', 19);
`);


// ========================================
// 3. SELECT *
// ========================================

executeSQL(`
    SELECT * FROM users;
`);

executeSQL(`
    SELECT name FROM users;
`);

executeSQL(`
    SELECT name, age FROM users;
`);
executeSQL(`
    SELECT * FROM users
    WHERE age > 20;
`);

executeSQL(`
    SELECT * FROM users
    WHERE age > 20 AND name = 'Ketan';
`);
