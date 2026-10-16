/* CropAI — Regression Models */
(function () {
  const c = React.createElement;
  const { useState } = React;
  const { Icon, Reveal, SectionHead, ModelIllus, RChart, DATA } = window;

  const maxMae = 56892, maxRmse = 87143;

  function Metric({ k, v, pct, color }) {
    return c("div", { className: "metric-row" },
      c("span", { className: "mk" }, k),
      c("div", { className: "hbar", style: { flex: 1 } }, c("i", { style: { width: Math.max(3, pct) + "%", background: color } })),
      c("span", { className: "mv" }, v));
  }

  function ModelCard({ m, i }) {
    return c(Reveal, { i, className: "card model-card hover" + (m.best ? " best" : "") + (m.baseline ? " muted" : "") },
      m.best && c("span", { className: "corner-badge badge-best" }, "🏆 BEST MODEL"),
      m.baseline && c("span", { className: "corner-badge", style: { background: "#EEF2F6", color: "var(--text-muted)" } }, "Reference"),
      c("div", { className: "model-illus" }, c(ModelIllus, { kind: m.icon })),
      c("h3", null, m.name),
      c("p", { className: "desc" }, m.desc),
      c("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 } },
        c(Metric, { k: "R²", v: m.baseline ? "—" : m.r2.toFixed(4), pct: m.r2 * 100, color: m.best ? "var(--grad-button)" : "var(--primary)" }),
        c(Metric, { k: "MAE", v: DATA.fmt(m.mae), pct: (1 - m.mae / maxMae) * 100, color: "var(--accent-teal)" }),
        c(Metric, { k: "RMSE", v: DATA.fmt(m.rmse), pct: (1 - m.rmse / maxRmse) * 100, color: "var(--accent-blue)" })));
  }

  function Regression() {
    const [sort, setSort] = useState("r2");
    const [view, setView] = useState("card");
    const rows = [...DATA.REGRESSION].sort((a, b) => sort === "r2" ? b.r2 - a.r2 : sort === "mae" ? a.mae - b.mae : a.rmse - b.rmse);

    return c("div", null,
      c(SectionHead, {
        crumb: ["Home", "Regression Models"],
        title: "Regression Models",
        sub: "Predict the exact yield value · 8 models benchmarked",
        right: [
          c("div", { key: "sort", style: { display: "flex", alignItems: "center", gap: 8 } },
            c("span", { style: { fontSize: 13, color: "var(--text-muted)" } }, "Sort"),
            c("select", { className: "inp", style: { width: "auto", padding: "8px 30px 8px 12px" }, value: sort, onChange: e => setSort(e.target.value) },
              c("option", { value: "r2" }, "R² ↓"), c("option", { value: "mae" }, "MAE ↑"), c("option", { value: "rmse" }, "RMSE ↑"))),
          c("div", { key: "view", className: "tabs" },
            c("button", { className: "tab" + (view === "card" ? " active" : ""), onClick: () => setView("card") }, "Cards"),
            c("button", { className: "tab" + (view === "table" ? " active" : ""), onClick: () => setView("table") }, "Table")),
        ],
      }),

      view === "card"
        ? c("div", { className: "grid g-3" }, rows.map((m, i) => c(ModelCard, { key: m.name, m, i })))
        : c(Reveal, { className: "card" },
            c("div", { className: "tbl-wrap" },
              c("table", { className: "data" },
                c("thead", null, c("tr", null, ["Model", "R²", "MAE (hg/ha)", "RMSE (hg/ha)", "Rating"].map(h => c("th", { key: h }, h)))),
                c("tbody", null, rows.map((m) => c("tr", { key: m.name },
                  c("td", null, c("span", { className: "strong" }, m.name), m.best && c("span", { className: "badge badge-best", style: { marginLeft: 8 } }, "Best")),
                  c("td", { className: "tnum strong" }, m.baseline ? "—" : m.r2.toFixed(4)),
                  c("td", { className: "tnum" }, DATA.fmt(m.mae)),
                  c("td", { className: "tnum" }, DATA.fmt(m.rmse)),
                  c("td", null, c("span", { className: "badge", style: ratingStyle(m.r2, m.baseline) }, rating(m.r2, m.baseline))))))))),

      // comparison chart
      c(Reveal, { className: "card card-pad", style: { marginTop: 24 } },
        c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Model Comparison — R² Score"),
        c(RChart, {
          type: "bar", height: 340,
          data: {
            labels: [...DATA.REGRESSION].sort((a, b) => b.r2 - a.r2).map(m => m.name),
            datasets: [{
              data: [...DATA.REGRESSION].sort((a, b) => b.r2 - a.r2).map(m => m.r2),
              backgroundColor: [...DATA.REGRESSION].sort((a, b) => b.r2 - a.r2).map(m => m.best ? "#2E7D32" : m.r2 >= 0.9 ? "#4CAF50" : m.r2 >= 0.7 ? "#26A69A" : "#90A4AE"),
              borderRadius: 5,
            }],
          },
          options: {
            indexAxis: "y",
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => "R² = " + x.raw.toFixed(4) } } },
            scales: { x: { min: 0, max: 1, grid: RChart.grid }, y: { grid: { display: false } } },
          },
        }),
        c("div", { style: { display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: "var(--text-muted)" } },
          c("span", null, "▬ 0.90 Excellent threshold"),
          c("span", null, "▬ 0.70 Good threshold")))
    );
  }

  function rating(r2, base) { if (base) return "Baseline"; if (r2 > 0.9) return "Excellent"; if (r2 >= 0.7) return "Good"; if (r2 > 0) return "Average"; return "Poor"; }
  function ratingStyle(r2, base) {
    if (base) return { background: "#EEF2F6", color: "var(--text-muted)" };
    if (r2 > 0.9) return { background: "var(--bg-soft)", color: "var(--primary-dark)" };
    if (r2 >= 0.7) return { background: "rgba(0,172,193,.12)", color: "var(--accent-teal)" };
    return { background: "#FFF3E0", color: "var(--warning)" };
  }

  window.Regression = Regression;
})();
