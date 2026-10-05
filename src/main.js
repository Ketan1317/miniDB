import { Database } from "./database.js";
import { Lexer } from "./lexer.js";
import { Parser } from "./parser.js";
import { Executor } from "./executor.js";
import { UI } from "./ui.js";
import { Visualizer } from "./visualizer.js";
import { Storage } from "./storage.js";
import { createEditor, getQuery } from "./editor.js";

const database = new Database();
const executor = new Executor(database);
const ui = new UI();
const visualizer = new Visualizer();
const storage = new Storage();

let editorReady = false;

function initializeEditor() {
  const editorContainer = document.querySelector("#sql-editor");

  if (!editorContainer) {
    throw new Error("SQL editor container not found");
  }

  createEditor(editorContainer);

  editorReady = true;
}

async function initialize() {
  try {
    await storage.open();

    const savedData = await storage.load();

    if (savedData) {
      database.load(savedData);
    }

    ui.renderTables(database);

    // Monaco is loaded separately in index.html
    if (window.monacoReady) {
      initializeEditor();
    } else {
      window.addEventListener("monaco-ready", initializeEditor, { once: true });
    }
  } catch (error) {
    console.error("MiniDB startup error:", error);
    ui.showError("Failed to load database: " + error.message);
  }
}

async function runQuery() {
  if (!editorReady) {
    ui.showError("SQL editor is not ready.");
    return;
  }

  const query = getQuery().trim();

  if (!query) {
    ui.showMessage("Enter a SQL query.");
    return;
  }

  const startTime = performance.now();

  try {
    const lexer = new Lexer(query);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const result = executor.execute(ast);

    if (
      ast.type === "CREATE_TABLE" ||
      ast.type === "INSERT" ||
      ast.type === "UPDATE" ||
      ast.type === "DELETE"
    ) {
      await storage.save(database.serialize());
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (result && result.rows && Array.isArray(result.rows)) {
      ui.showResults(result);
      ui.updateStats(executionTime, result.rows.length);
    } else {
      ui.showMessage(result?.message ?? "Query executed successfully.");

      ui.updateStats(executionTime, 0);
    }

    ui.renderTables(database);
    visualizer.addQuery(executionTime);
  } catch (error) {
    console.error("MiniDB Error:", error);
    ui.showError(error.message);
  }
}

ui.onRun(runQuery);

initialize();
