const COLORS = {
  axis: "#3f3f46",
  grid: "#18181b",
  text: "#71717a",
  label: "#e4e4e7",
  bar: "#ffffff",
  line: "#a1a1aa",
  dot: "#d4d4d8",
  latest: "#ffffff",
};

const HEIGHT = 180;
const MARGIN = { top: 20, right: 16, bottom: 34, left: 52 };
const MAX_HISTORY = 20;

export class Visualizer {
  constructor() {
    this.history = [];
    this.counter = 0;
    this.lastTime = null;

    this.currentContainer = document.getElementById("execution-chart");
    this.historyContainer = document.getElementById("history-chart");

    this.showEmpty(this.currentContainer);
    this.showEmpty(this.historyContainer);

    // The Performance panel starts hidden, so the charts have no width until
    // it is shown. Re-render whenever a container's width actually changes.
    this.widths = new Map();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        if (width === 0 || this.widths.get(entry.target) === width) continue;
        this.widths.set(entry.target, width);

        if (entry.target === this.currentContainer && this.lastTime !== null) {
          this.renderCurrent(this.lastTime);
        } else if (entry.target === this.historyContainer) {
          this.renderHistory();
        }
      }
    });
    observer.observe(this.currentContainer);
    observer.observe(this.historyContainer);
  }

  addQuery(executionTime) {
    this.counter += 1;
    this.lastTime = executionTime;

    this.history.push({
      query: this.counter,
      time: executionTime,
    });

    // Keeping the graph readable
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }

    this.renderCurrent(executionTime);
    this.renderHistory();
  }

  showEmpty(container) {
    container.innerHTML = `
      <div class="h-full flex items-center justify-center text-sm text-zinc-600">
        Run a query to see timing data.
      </div>
    `;
  }

  createSvg(container) {
    container.innerHTML = "";

    const width = container.clientWidth || 500;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", HEIGHT)
      .style("display", "block")
      .style("font-family", "Inter, ui-sans-serif, system-ui, sans-serif");

    return { svg, width };
  }

  styleAxis(group) {
    group.select(".domain").attr("stroke", COLORS.axis);
    group.selectAll(".tick line").attr("stroke", COLORS.axis);
    group
      .selectAll("text")
      .attr("fill", COLORS.text)
      .attr("font-size", "11px");
  }

  drawGrid(svg, y, width) {
    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-(width - MARGIN.left - MARGIN.right))
          .tickFormat("")
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").attr("stroke", COLORS.grid));
  }

  drawYAxis(svg, y) {
    const axis = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat((d) => `${d} ms`));

    this.styleAxis(axis);
  }

  renderCurrent(executionTime) {
    const { svg, width } = this.createSvg(this.currentContainer);

    const x = d3
      .scaleBand()
      .domain(["Current query"])
      .range([MARGIN.left, width - MARGIN.right])
      .padding(0.6);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(executionTime * 1.2, 1)])
      .nice()
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    this.drawGrid(svg, y, width);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));
    this.styleAxis(xAxis);

    this.drawYAxis(svg, y);

    svg
      .append("rect")
      .attr("x", x("Current query"))
      .attr("y", y(executionTime))
      .attr("width", x.bandwidth())
      .attr("height", Math.max(y(0) - y(executionTime), 1))
      .attr("fill", COLORS.bar)
      .attr("rx", 4)
      .append("title")
      .text(`${executionTime.toFixed(2)} ms`);

    svg
      .append("text")
      .attr("x", x("Current query") + x.bandwidth() / 2)
      .attr("y", y(executionTime) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", COLORS.label)
      .attr("font-size", "12px")
      .attr("font-weight", 600)
      .text(`${executionTime.toFixed(2)} ms`);
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.showEmpty(this.historyContainer);
      return;
    }

    const { svg, width } = this.createSvg(this.historyContainer);

    // Query numbers keep counting up after old entries drop off,
    // so the x-axis follows the first and last visible query.
    const first = this.history[0].query;
    const last = this.history[this.history.length - 1].query;

    const x = d3
      .scaleLinear()
      .domain([first, Math.max(last, first + 1)])
      .range([MARGIN.left + 8, width - MARGIN.right - 8]);

    const maxTime = d3.max(this.history, (item) => item.time);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(maxTime * 1.2, 1)])
      .nice()
      .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

    this.drawGrid(svg, y, width);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(Math.min(this.history.length, 8))
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
      );
    this.styleAxis(xAxis);

    this.drawYAxis(svg, y);

    svg
      .append("text")
      .attr("x", (MARGIN.left + width - MARGIN.right) / 2)
      .attr("y", HEIGHT - 4)
      .attr("text-anchor", "middle")
      .attr("fill", COLORS.text)
      .attr("font-size", "11px")
      .text("Query number");

    const line = d3
      .line()
      .curve(d3.curveMonotoneX)
      .x((item) => x(item.query))
      .y((item) => y(item.time));

    svg
      .append("path")
      .datum(this.history)
      .attr("fill", "none")
      .attr("stroke", COLORS.line)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    svg
      .selectAll("circle")
      .data(this.history)
      .enter()
      .append("circle")
      .attr("cx", (item) => x(item.query))
      .attr("cy", (item) => y(item.time))
      .attr("r", (item) => (item.query === last ? 5 : 3))
      .attr("fill", (item) => (item.query === last ? COLORS.latest : COLORS.dot))
      .append("title")
      .text((item) => `Query ${item.query}: ${item.time.toFixed(2)} ms`);
  }
}