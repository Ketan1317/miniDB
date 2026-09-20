import { Database } from "./database.js";

const db = new Database();

console.log("=== MiniDB Stage 1 Tests ===");

// 1. Create table
console.log("\n1. Creating users table...");

db.createTable("users", [
    { name: "id", type: "INT" },
    { name: "name", type: "TEXT" },
    { name: "age", type: "INT" }
]);

console.log("Table created successfully");

// 2. Insert valid rows
console.log("\n2. Inserting valid rows...");

db.insert("users", [1, "Ketan", 21]);
db.insert("users", [2, "Rahul", 24]);
db.insert("users", [3, "Aman", 19]);

console.log("Rows inserted successfully");

// 3. Select all
console.log("\n3. SELECT * FROM users");

const rows = db.selectAll("users");

console.table(rows);

// 4. Wrong number of values
console.log("\n4. Testing wrong number of values...");

try {
    db.insert("users", [4, "John"]);
} catch (error) {
    console.log("Error caught:", error.message);
}

// 5. Wrong type
console.log("\n5. Testing wrong data type...");

try {
    db.insert("users", [4, 100, 25]);
} catch (error) {
    console.log("Error caught:", error.message);
}

// 6. Duplicate table
console.log("\n6. Testing duplicate table...");

try {
    db.createTable("users", [
        { name: "id", type: "INT" }
    ]);
} catch (error) {
    console.log("Error caught:", error.message);
}

// 7. Non-existent table
console.log("\n7. Testing non-existent table...");

try {
    db.selectAll("products");
} catch (error) {
    console.log("Error caught:", error.message);
}

// 8. Final database
console.log("\n8. Final database:");

console.log(db);