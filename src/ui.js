const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const TAB_ACTIVE = ["text-zinc-200", "bg-zinc-800"];
const TAB_INACTIVE = ["text-zinc-600"];

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

  // creates a table out of the object returned (cols + rows)
  showResults(result) {
    if (!result || !result.rows || result.rows.length === 0) {
      this.results.innerHTML = `
                <div class="h-full min-h-[140px] flex items-center justify-center">
                    <div class="text-center">
                        <div class="w-11 h-11 mx-auto rounded-full border border-zinc-800 flex items-center justify-center text-zinc-300">
                            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        </div>
                        <div class="mt-3 text-sm font-medium text-zinc-200">
                            Query executed successfully
                        </div>
                        <div class="text-xs text-zinc-500 mt-1">
                            No rows returned.
                        </div>
                    </div>
                </div>
            `;
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className =
      "border border-zinc-800 rounded-xl overflow-hidden bg-black";

    const scroller = document.createElement("div");
    scroller.className = "overflow-auto";

    const table = document.createElement("table");
    table.className = "w-full text-sm border-collapse";

    const thead = document.createElement("thead");

    thead.innerHTML = `
            <tr class="border-b border-zinc-800 bg-zinc-900">
                ${result.columns
                  .map(
                    (column) => `
                            <th class="text-left px-4 py-3 text-xs font-semibold text-zinc-300 whitespace-nowrap">
                                ${escapeHtml(column)}
                            </th>
                        `,
                  )
                  .join("")}
            </tr>
        `;

    const tbody = document.createElement("tbody");

    for (const row of result.rows) {
      const tr = document.createElement("tr");

      tr.className =
        "border-b border-zinc-900 last:border-b-0 hover:bg-zinc-900/60 transition";

      for (const value of row) {
        const td = document.createElement("td");
        const isNull = value === null || value === undefined;
        td.className =
          "px-4 py-3 font-mono text-xs whitespace-nowrap " +
          (isNull ? "text-zinc-600 italic" : "text-zinc-100");
        td.textContent = isNull ? "NULL" : value;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    scroller.appendChild(table);

    const count = result.rows.length;
    const summary = document.createElement("div");
    summary.className =
      "px-4 py-2.5 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500";
    summary.textContent = `${count} ${count === 1 ? "row" : "rows"} · ${result.columns.length} ${result.columns.length === 1 ? "column" : "columns"}`;

    wrapper.appendChild(scroller);
    wrapper.appendChild(summary);

    this.results.innerHTML = "";
    this.results.appendChild(wrapper);
  }

  showMessage(message) {
    this.results.innerHTML = `
            <div class="h-full min-h-[140px] flex items-center justify-center">
                <div class="flex items-center gap-3 border border-zinc-800 rounded-xl px-5 py-4">
                    <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
                    <div class="text-sm text-zinc-200">
                        ${escapeHtml(message)}
                    </div>
                </div>
            </div>
        `;
  }

  showError(message) {
    this.results.innerHTML = `
            <div class="border border-zinc-700 bg-zinc-900 rounded-xl p-5 max-w-3xl">
                <div class="flex items-center gap-2 mb-3">
                    <span class="w-5 h-5 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center" aria-hidden="true">!</span>
                    <span class="text-sm font-semibold text-zinc-100">Query error</span>
                </div>

                <div class="text-sm text-zinc-300 font-mono leading-6 break-words">
                    ${escapeHtml(message)}
                </div>

                <div class="text-xs text-zinc-500 mt-3">
                    Check the query for typos, then run it again.
                </div>
            </div>
        `;
  }

  // updates status bar
  updateStats(time, rows) {
    this.executionTime.textContent = `Execution: ${time.toFixed(2)} ms`;

    this.rowsReturned.textContent = `Rows: ${rows}`;

    this.scanType.textContent = "Scan: Sequential";
  }

  // updates left side bar after reading DB
  renderTables(database) {
    this.tableList.innerHTML = "";

    if (database.tables.size === 0) {
      this.tableList.innerHTML = `
      <div class="px-3 py-4 text-center">
        <div class="w-9 h-9 mx-auto rounded-lg border border-zinc-800
                    flex items-center justify-center text-zinc-600">
          <svg
            viewBox="0 0 24 24"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
            <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path>
            <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"></path>
          </svg>
        </div>

        <p class="mt-3 text-xs text-zinc-500">
          No tables yet
        </p>

        <p class="mt-1 text-[11px] text-zinc-700">
          Create a table to get started
        </p>
      </div>
    `;

      return;
    }

    for (const [name, table] of database.tables) {
      const container = document.createElement("div");

      container.className =
        "border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 mb-3";

      const tableHeader = document.createElement("button");

      tableHeader.type = "button";
      tableHeader.setAttribute("aria-expanded", "true");

      tableHeader.className =
        "w-full flex items-center gap-2.5 px-3.5 py-3 " +
        "text-left bg-zinc-900/60 hover:bg-zinc-900 " +
        "transition-colors";

      tableHeader.innerHTML = `
      <span
        class="chevron w-4 h-4 flex items-center justify-center
               text-zinc-500 text-[10px] transition-transform"
      >
        ▾
      </span>

      <span
        class="w-7 h-7 rounded-md border border-zinc-800
               bg-black flex items-center justify-center
               text-zinc-400"
      >
        <svg
          viewBox="0 0 24 24"
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
          <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path>
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"></path>
        </svg>
      </span>

      <div class="min-w-0 flex-1">
        <div class="text-sm font-medium text-zinc-200 truncate">
          ${escapeHtml(name)}
        </div>

        <div class="text-[10px] text-zinc-600 mt-0.5">
          ${table.schema.length}
          ${table.schema.length === 1 ? "column" : "columns"}
        </div>
      </div>

      <span
        class="shrink-0 text-[10px] font-mono text-zinc-500
               bg-black border border-zinc-800 rounded-md px-2 py-1"
      >
        ${table.rows.length} ${table.rows.length === 1 ? "row" : "rows"}
      </span>
    `;

      const columnsContainer = document.createElement("div");

      columnsContainer.className = "border-t border-zinc-800 bg-black";

      for (const column of table.schema) {
        const columnElement = document.createElement("div");

        columnElement.className =
          "group flex items-center gap-2.5 px-4 py-2.5 " +
          "border-b border-zinc-900 last:border-b-0 " +
          "hover:bg-zinc-950 transition-colors";

        let icon = `
        <span
          class="w-5 h-5 shrink-0 rounded border border-zinc-800
                 flex items-center justify-center text-zinc-600"
        >
          <span class="w-1 h-1 rounded-full bg-zinc-600"></span>
        </span>
      `;

        if (column.primaryKey) {
          icon = `
          <span
            class="w-5 h-5 shrink-0 rounded border border-zinc-700
                   flex items-center justify-center text-zinc-300"
            title="Primary key"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="7.5" cy="15.5" r="3.5"></circle>
              <path d="m10 13 8-8"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </span>
        `;
        }

        columnElement.innerHTML = `
        ${icon}

        <span
          class="text-xs text-zinc-300 truncate min-w-0 flex-1"
        >
          ${escapeHtml(column.name)}
        </span>

        <span
          class="text-[10px] font-mono text-zinc-600 shrink-0"
        >
          ${escapeHtml(column.type)}
          ${column.length ? `(${escapeHtml(column.length)})` : ""}
        </span>
      `;

        columnsContainer.appendChild(columnElement);
      }

      tableHeader.addEventListener("click", () => {
        const collapsed = columnsContainer.classList.toggle("hidden");

        tableHeader.setAttribute("aria-expanded", String(!collapsed));

        tableHeader.querySelector(".chevron").textContent = collapsed
          ? "▸"
          : "▾";
      });

      container.appendChild(tableHeader);
      container.appendChild(columnsContainer);

      this.tableList.appendChild(container);
    }
  }

  setActiveTab(active, inactive) {
    active.classList.remove(...TAB_INACTIVE);
    active.classList.add(...TAB_ACTIVE);

    inactive.classList.remove(...TAB_ACTIVE);
    inactive.classList.add(...TAB_INACTIVE);
  }

  setupTabs() {
    this.resultsTab.addEventListener("click", () => {
      this.resultsPanel.classList.remove("hidden");
      this.performancePanel.classList.add("hidden");

      this.setActiveTab(this.resultsTab, this.performanceTab);
    });

    this.performanceTab.addEventListener("click", () => {
      this.resultsPanel.classList.add("hidden");
      this.performancePanel.classList.remove("hidden");

      this.setActiveTab(this.performanceTab, this.resultsTab);
    });
  }
}
