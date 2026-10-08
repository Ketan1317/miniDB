export class Exporter {
  exportDatabase(database) {
    const data = {
      version: 1,
      database: "MiniDB",
      exportedAt: new Date().toISOString(),
      tables: database.serialize(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `minidb-${Date.now()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }
}