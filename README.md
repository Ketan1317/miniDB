# MiniDB

MiniDB is a small browser-based relational database engine built from scratch with Vanilla JavaScript.

The project is focused on understanding how a database works internally, from SQL tokenization and parsing to query execution, storage, indexing, and query visualization.

## Features

* SQL Lexer and Tokenizer
* Recursive Descent Parser
* Abstract Syntax Tree (AST)
* Query Executor
* `CREATE TABLE`
* `INSERT`, `SELECT`, `UPDATE`, `DELETE`
* `WHERE` with `AND` / `OR`
* Comparison operators
* Data types and constraints
* `ORDER BY` and `LIMIT`
* JOINs
* Subqueries
* Transactions with basic `BEGIN`, `COMMIT`, and `ROLLBACK`
* IndexedDB persistence
* Basic indexing and index lookup
* Sequential scan vs indexed lookup comparison
* Query execution statistics
* Query execution plan visualization
* Token and AST visualization
* Query history
* Database and table explorer
* JOIN visualization
* Browser-based SQL editor

## Architecture

```text
SQL Query
    ↓
Lexer
    ↓
Tokens
    ↓
Parser
    ↓
AST
    ↓
Executor
    ↓
Database
    ↓
Tables / Indexes
    ↓
Storage
```

## Tech Stack

* HTML
* Tailwind CSS
* Vanilla JavaScript
* ES Modules
* IndexedDB
* Monaco Editor
* D3.js / Cytoscape.js

## Why MiniDB?

MiniDB is a learning-focused project built to understand the internal flow of a relational database instead of treating a database as a black box.

It covers concepts such as lexical analysis, parsing, ASTs, query execution, filtering, joins, indexing, persistence, transactions, and basic query optimization.

## Status

The project is being developed incrementally, starting with an in-memory database and gradually adding SQL features, persistence, indexing, joins, transactions, and visualization.
