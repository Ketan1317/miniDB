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
      case "UPDATE":
        return this.executeUpdate(ast);
      case "DELETE":
        return this.executeDelete(ast);
      case "DROP_TABLE":
        return this.executeDrop(ast);
      case "DESC":
        return this.executeDesc(ast);

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
    this.database.insert(ast.tableName, ast.columns, ast.values);

    return {
      type: "MESSAGE",
      message: "Row inserted successfully",
    };
  }

  executeSelect(ast) {
    return this.database.select(
      ast.tableName,
      ast.columns,
      ast.where,
      ast.groupBy,
      ast.having,
      ast.orderBy,
      ast.limit,
    );
  }

  executeUpdate(ast) {
    const updatedCount = this.database.update(
      ast.tableName,
      ast.updates,
      ast.where,
    );

    return {
      type: "MESSAGE",
      message: `${updatedCount} row(s) updated successfully`,
    };
  }

  executeDelete(ast) {
    const deletedCount = this.database.delete(ast.tableName, ast.where);

    return {
      type: "MESSAGE",
      message: `${deletedCount} row(s) deleted successfully`,
    };
  }

  executeDrop(ast) {
    this.database.dropTable(ast.tableName);

    return {
      message: `Table '${ast.tableName}' dropped successfully`,
    };
  }

  executeDesc(ast) {
    return this.database.describeTable(ast.tableName);
  }
}
