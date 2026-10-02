export class Executor {
  constructor(database) {
    this.database = database;
  }

  execute(ast) {
    switch (ast.type) {
      case "CREATE_TABLE":
        return this.executeCreateTable(ast);

      case "INSERT":
        return this.executeInsert(ast);

      case "SELECT":
        return this.executeSelect(ast);

      default:
        throw new Error(`Unsupported AST type: ${ast.type}`);
    }
  }

  executeCreateTable(ast) {
    this.database.createTable(ast.tableName, ast.columns);

    return {
      type: "MESSAGE",
      message: `Table '${ast.tableName}' created successfully`,
    };
  }

  executeInsert(ast) {
    this.database.insert(ast.tableName, ast.values);

    return {
      type: "MESSAGE",
      message: "Row inserted successfully",
    };
  }

  executeSelect(ast) {
    return this.database.select(ast.tableName, ast.columns, ast.where);
  }
}
