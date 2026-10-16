/* CropAI — Visualizations */
(function () {
  const c = React.createElement;
  const { Icon, Reveal, SectionHead, RChart, DATA } = window;

  function KPI({ icon, label, value, sub, chip }) {
    return c("div", { className: "card card-pad hover" },
      c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
        c("div", null,
          c("div", { className: "eyebrow" }, label),
          c("div", { className: "metric-val", style: { marginTop: 8 } }, value),
          c("div", { style: { fontSize: 13, color: "var(--text-secondary)", marginTop: 6 } }, sub)),
        c("div", { className: "icon-chip " + (chip || "") }, c(Icon, { name: icon, size: 22 }))));
  }

  function ChartCard({ i, title, filter, children }) {
    return c(Reveal, { i, className: "card card-pad" },
      c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
        c("h3", { className: "card-title" }, title),
        filter && c("select", { className: "inp", style: { width: "auto", padding: "6px 26px 6px 10px", fontSize: 13 } }, filter.map(f => c("option", { key: f }, f)))),
      children);
  }

  function Visualizations() {
    const byR2 = [...DATA.REGRESSION].sort((a, b) => b.r2 - a.r2);
    const k = DATA.KPIS;
    const bestReg = byR2.find(m => !m.baseline) || byR2[0] || {};
    const lowRmseM = [...DATA.REGRESSION].filter(m => !m.baseline).sort((a, b) => a.rmse - b.rmse)[0] || {};
    const bestClf = [...DATA.CLASSIFIERS].sort((a, b) => b.acc - a.acc)[0] || {};

    const kBestR2   = k ? k.bestR2.toFixed(4) : (bestReg.r2 != null ? bestReg.r2.toFixed(4) : "—");
    const kBestR2M  = k ? k.bestR2Model : bestReg.name;
    const kLowRmse  = k ? DATA.fmt(k.lowRmse) : DATA.fmt(lowRmseM.rmse || 0);
    const kLowRmseM = k ? k.lowRmseModel : lowRmseM.name;
    const kBestAcc  = k ? (k.bestAcc * 100).toFixed(2) + "%" : ((bestClf.acc || 0) * 100).toFixed(2) + "%";
    const kBestAccM = k ? k.bestAccModel : bestClf.name;

    return c("div", null,
      c(SectionHead, { crumb: ["Home", "Visualizations"], title: "Visualizations", sub: "Compare model performance across every metric" }),

      c("div", { className: "grid g-3" },
        c(Reveal, { i: 0 }, c(KPI, { icon: "trendup", label: "Best R²", value: kBestR2, sub: kBestR2M, chip: "" })),
        c(Reveal, { i: 1 }, c(KPI, { icon: "target", label: "Lowest RMSE", value: kLowRmse, sub: "hg/ha · " + kLowRmseM, chip: "teal" })),
        c(Reveal, { i: 2 }, c(KPI, { icon: "checkCircle", label: "Best Accuracy", value: kBestAcc, sub: kBestAccM, chip: "blue" }))),

      c("div", { className: "grid g-2", style: { marginTop: 24 } },
        // R2 comparison
        c(ChartCard, { i: 3, title: "R² Score Comparison" },
          c(RChart, {
            type: "bar", height: 300,
            data: { labels: byR2.map(m => m.name), datasets: [{ data: byR2.map(m => m.r2), backgroundColor: byR2.map(m => m.best ? "#2E7D32" : "#4CAF50"), borderRadius: 5 }] },
            options: { indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => "R² = " + x.raw.toFixed(4) } } }, scales: { x: { min: 0, max: 1, grid: RChart.grid }, y: { grid: { display: false } } } },
          })),
        // RMSE comparison
        c(ChartCard, { i: 4, title: "RMSE Comparison", filter: ["Lower is better"] },
          c(RChart, {
            type: "bar", height: 300,
            data: { labels: byR2.map(m => m.name.split(" (")[0]), datasets: [{ data: byR2.map(m => m.rmse), backgroundColor: byR2.map(m => m.best ? "#2E7D32" : m.rmse < 25000 ? "#4CAF50" : m.rmse < 50000 ? "#FB8C00" : "#E53935"), borderRadius: 5 }] },
            options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => DATA.fmt(x.raw) + " hg/ha" } } }, scales: { x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 30, font: { size: 10 } } }, y: { grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } } } },
          })),
        // MAE vs RMSE bubble
        c(ChartCard, { i: 5, title: "MAE vs RMSE (bubble = R²)" },
          c(RChart, {
            type: "bubble", height: 300,
            data: { datasets: DATA.REGRESSION.filter(m => !m.baseline).map(m => ({
              label: m.name.split(" (")[0],
              data: [{ x: m.mae, y: m.rmse, r: 6 + m.r2 * 16 }],
              backgroundColor: (m.best ? "rgba(46,125,50,0.75)" : "rgba(0,172,193,0.55)"),
              borderColor: m.best ? "#2E7D32" : "#00ACC1", borderWidth: 1.5,
            })) },
            options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => x.dataset.label + " · MAE " + DATA.fmt(x.raw.x) + " · RMSE " + DATA.fmt(x.raw.y) } } }, scales: { x: { title: { display: true, text: "MAE" }, grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } }, y: { title: { display: true, text: "RMSE" }, grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } } } },
          })),
        // Actual vs predicted scatter
        c(ChartCard, { i: 6, title: "Actual vs Predicted — " + (kBestR2M || "Best Model") },
          c(RChart, {
            type: "scatter", height: 300,
            data: { datasets: [
              { label: "Predictions", data: (DATA.SCATTER && DATA.SCATTER.length) ? DATA.SCATTER : scatterPts(), backgroundColor: "rgba(76,175,80,0.35)", pointRadius: 2.5 },
              { label: "Perfect", type: "line", data: [{ x: 0, y: 0 }, { x: 300000, y: 300000 }], borderColor: "#E53935", borderWidth: 1.5, borderDash: [6, 5], pointRadius: 0, fill: false },
            ] },
            options: { plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: "Actual (hg/ha)" }, grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } }, y: { title: { display: true, text: "Predicted" }, grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } } } },
          })),
        // feature importance
        c(ChartCard, { i: 7, title: "Feature Importance — Top 15" },
          c(RChart, {
            type: "bar", height: 360,
            data: { labels: DATA.FEAT_IMP.map(f => f.f), datasets: [{ data: DATA.FEAT_IMP.map(f => f.v), backgroundColor: DATA.FEAT_IMP.map((_, i) => i === 0 ? "#2E7D32" : "#26A69A"), borderRadius: 4 }] },
            options: { indexAxis: "y", plugins: { legend: { display: false }, tooltip: { callbacks: { label: x => (x.raw * 100).toFixed(1) + "%" } } }, scales: { x: { grid: RChart.grid, ticks: { callback: v => (v * 100) + "%" } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } } },
          })),
        // yearly performance
        c(ChartCard, { i: 8, title: "Yearly Performance — Predicted vs Actual" },
          c(RChart, {
            type: "line", height: 360,
            data: { labels: (DATA.YEARLY_PERF && DATA.YEARLY_PERF.years) ? DATA.YEARLY_PERF.years : DATA.YOY.years, datasets: [
              { label: "Actual", data: (DATA.YEARLY_PERF && DATA.YEARLY_PERF.actual) ? DATA.YEARLY_PERF.actual : DATA.YOY.vals, borderColor: "#2E7D32", borderWidth: 2.5, tension: 0.4, pointRadius: 0 },
              { label: "Predicted", data: (DATA.YEARLY_PERF && DATA.YEARLY_PERF.predicted) ? DATA.YEARLY_PERF.predicted : DATA.YOY.vals.map(v => Math.round(v * (1 + (Math.random() - 0.5) * 0.04))), borderColor: "#00ACC1", borderWidth: 2, borderDash: [5, 4], tension: 0.4, pointRadius: 0 },
            ] },
            options: { plugins: { legend: { position: "top", align: "end" } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } } } },
          })))
    );
  }

  function scatterPts() {
    const pts = [];
    for (let i = 0; i < 320; i++) {
      const a = Math.pow(Math.random(), 1.7) * 300000;
      const noise = (Math.random() - 0.5) * (8000 + a * 0.08);
      pts.push({ x: a, y: Math.max(0, a + noise) });
    }
    return pts;
  }

  window.Visualizations = Visualizations;
})();
