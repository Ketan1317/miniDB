export class UI {
    constructor() {
        this.editor = document.getElementById("sql-editor");
        this.runButton = document.getElementById("run-query");

        this.results = document.getElementById("results-panel");
        this.tableList = document.getElementById("table-list");

        this.executionTime = document.getElementById("execution-time");
        this.rowsReturned = document.getElementById("rows-returned");
        this.scanType = document.getElementById("scan-type");

        this.resultsTab = document.getElementById("results-tab");
        this.performanceTab = document.getElementById("performance-tab");

        this.resultsPanel = document.getElementById("results-panel");
        this.performancePanel = document.getElementById("performance-panel");

        this.setupTabs();
    }

    getQuery() {
        return this.editor.value.trim();
    }

    onRun(callback) {
        this.runButton.addEventListener("click", callback);
    }

    showResults(result) {
        if (!result || !result.rows || result.rows.length === 0) {
            this.results.innerHTML = `
                <div class="h-full flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-sm text-zinc-500">
                            Query executed successfully.
                        </div>
                        <div class="text-xs text-zinc-700 mt-1">
                            No rows returned.
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const table = document.createElement("table");
        table.className = "w-full text-sm border-collapse";

        const thead = document.createElement("thead");

        thead.innerHTML = `
            <tr class="border-b border-zinc-800 bg-zinc-900/40">
                ${result.columns
                    .map(
                        (column) => `
                            <th class="text-left px-4 py-3 text-xs font-medium text-zinc-400">
                                ${column}
                            </th>
                        `
                    )
                    .join("")}
            </tr>
        `;

        const tbody = document.createElement("tbody");

        for (const row of result.rows) {
            const tr = document.createElement("tr");

            tr.className =
                "border-b border-zinc-900 hover:bg-zinc-900/40 transition";

            for (const value of row) {
                const td = document.createElement("td");

                td.className =
                    "px-4 py-3 text-zinc-300 font-mono text-xs";

                td.textContent =
                    value === null || value === undefined
                        ? "NULL"
                        : value;

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        this.results.innerHTML = "";
        this.results.appendChild(table);
    }

    showMessage(message) {
        this.results.innerHTML = `
            <div class="h-full flex items-center justify-center">
                <div class="text-sm text-zinc-400">
                    ${message}
                </div>
            </div>
        `;
    }

    showError(message) {
        this.results.innerHTML = `
            <div class="border border-red-900/60 bg-red-950/20 rounded-lg p-4">
                <div class="text-xs uppercase tracking-wider text-red-500 mb-2">
                    Query Error
                </div>

                <div class="text-sm text-red-400 font-mono">
                    ${message}
                </div>
            </div>
        `;
    }

    updateStats(time, rows) {
        this.executionTime.textContent =
            `Execution: ${time.toFixed(2)} ms`;

        this.rowsReturned.textContent =
            `Rows: ${rows}`;

        this.scanType.textContent =
            "Scan: Sequential";
    }

    renderTables(database) {
        this.tableList.innerHTML = "";

        if (database.tables.size === 0) {
            this.tableList.innerHTML = `
                <div class="px-2 py-3 text-xs text-zinc-700">
                    No tables
                </div>
            `;
            return;
        }

        for (const [name, table] of database.tables) {
            const container = document.createElement("div");

            container.className =
                "rounded-md overflow-hidden";

            const tableHeader = document.createElement("div");

            tableHeader.className =
                "flex items-center gap-2 px-3 py-2 " +
                "text-sm text-zinc-400 " +
                "hover:bg-zinc-900 hover:text-zinc-200 " +
                "cursor-pointer";

            tableHeader.innerHTML = `
                <span class="text-zinc-600">▾</span>
                <span>${name}</span>
                <span class="ml-auto text-[10px] text-zinc-700">
                    ${table.rows.length}
                </span>
            `;

            const columnsContainer =
                document.createElement("div");

            columnsContainer.className =
                "ml-7 pb-2 space-y-1";

            for (const column of table.schema) {
                const columnElement =
                    document.createElement("div");

                columnElement.className =
                    "flex items-center justify-between pr-3";

                columnElement.innerHTML = `
                    <span class="text-[11px] text-zinc-600">
                        ${column.name}
                    </span>

                    <span class="text-[10px] text-zinc-700 font-mono">
                        ${column.type}
                    </span>
                `;

                columnsContainer.appendChild(columnElement);
            }

            container.appendChild(tableHeader);
            container.appendChild(columnsContainer);

            this.tableList.appendChild(container);
        }
    }

    setupTabs() {
        this.resultsTab.addEventListener("click", () => {
            this.resultsPanel.classList.remove("hidden");
            this.performancePanel.classList.add("hidden");

            this.resultsTab.classList.remove("text-zinc-600");
            this.resultsTab.classList.add("text-zinc-200");

            this.performanceTab.classList.remove("text-zinc-200");
            this.performanceTab.classList.add("text-zinc-600");
        });

        this.performanceTab.addEventListener("click", () => {
            this.resultsPanel.classList.add("hidden");
            this.performancePanel.classList.remove("hidden");

            this.performanceTab.classList.remove("text-zinc-600");
            this.performanceTab.classList.add("text-zinc-200");

            this.resultsTab.classList.remove("text-zinc-200");
            this.resultsTab.classList.add("text-zinc-600");
        });
    }
}