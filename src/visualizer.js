export class Visualizer {
  constructor() {
    this.history = [];
  }

  addQuery(executionTime) {
    this.history.push({
      query: this.history.length + 1,
      time: executionTime,
    });

    // Keeping the graph readable
    if (this.history.length > 20) {
      this.history.shift();
    }

    this.renderCurrent(executionTime);
    this.renderHistory();
  }

  renderCurrent(executionTime) {
    const container = document.getElementById("execution-chart");

    container.innerHTML = "";

    const width = container.clientWidth || 500;

    const height = 250;

    const margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 50,
    };

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(["Current Query"])
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(executionTime * 1.2, 1)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#71717a");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#71717a");

    svg
      .append("rect")
      .attr("x", x("Current Query"))
      .attr("y", y(executionTime))
      .attr("width", x.bandwidth())
      .attr("height", y(0) - y(executionTime))
      .attr("fill", "#71717a")
      .attr("rx", 4);

    svg
      .append("text")
      .attr("x", x("Current Query") + x.bandwidth() / 2)
      .attr("y", y(executionTime) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")
      .text(`${executionTime.toFixed(2)} ms`);
  }

  renderHistory() {
    const container = document.getElementById("history-chart");

    container.innerHTML = "";

    if (this.history.length === 0) {
      return;
    }

    const width = container.clientWidth || 500;

    const height = 250;

    const margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 50,
    };

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleLinear()
      .domain([1, Math.max(this.history.length, 2)])
      .range([margin.left, width - margin.right]);

    const maxTime = d3.max(this.history, (item) => item.time);

    const y = d3
      .scaleLinear()
      .domain([0, Math.max(maxTime * 1.2, 1)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(this.history.length, 8)))
      .selectAll("text")
      .attr("fill", "#71717a");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#71717a");

    const line = d3
      .line()
      .x((item) => x(item.query))
      .y((item) => y(item.time));

    svg
      .append("path")
      .datum(this.history)
      .attr("fill", "none")
      .attr("stroke", "#a1a1aa")
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .selectAll("circle")
      .data(this.history)
      .enter()
      .append("circle")
      .attr("cx", (item) => x(item.query))
      .attr("cy", (item) => y(item.time))
      .attr("r", 3)
      .attr("fill", "#d4d4d8");
  }
}
