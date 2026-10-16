/* CropAI — Data Exploration */
(function () {
  const c = React.createElement;
  const { useState, useEffect } = React;
  const { Icon, CountUp, Reveal, SectionHead, RChart, DATA } = window;

  function MiniDonut() {
    // 10 crop slices donut
    const colors = ["#2E7D32", "#43A047", "#4CAF50", "#66BB6A", "#26A69A", "#00ACC1", "#29B6F6", "#42A5F5", "#5C6BC0", "#7E8AA0"];
    let acc = 0;
    const segs = DATA.YIELD_BY_CROP.map((d, i) => {
      const frac = 1 / 10;
      const seg = c("circle", {
        key: i, cx: 18, cy: 18, r: 14, fill: "none",
        stroke: colors[i], strokeWidth: 6,
        strokeDasharray: `${frac * 88} ${88}`, strokeDashoffset: -acc * 88,
        transform: "rotate(-90 18 18)",
      });
      acc += frac;
      return seg;
    });
    return c("svg", { width: 36, height: 36, viewBox: "0 0 36 36" }, segs);
  }

  function DataExploration() {
    const cards = [
      { label: "Total Records", value: 28242, fmt: true, visual: "spark" },
      { label: "Countries Covered", value: 101, visual: "bar" },
      { label: "Crop Categories", value: 10, visual: "donut" },
      { label: "Missing Values", value: 0, visual: "clean" },
    ];
    const sparkH = [40, 52, 48, 60, 55, 72, 68, 85, 80, 100];

    // ── Live record search (powered by /api/records) ──
    const [query, setQuery]   = useState("");
    const [rows, setRows]     = useState(DATA.PREVIEW);
    const [total, setTotal]   = useState((DATA.STATS && DATA.STATS.records) || 28242);
    const [busy, setBusy]     = useState(false);

    useEffect(() => {
      let cancelled = false;
      const t = setTimeout(async () => {
        setBusy(true);
        try {
          const r = await fetch(`/api/records?q=${encodeURIComponent(query.trim())}&limit=25`);
          if (r.ok) {
            const j = await r.json();
            if (!cancelled) { setRows(j.rows); setTotal(j.total); }
          }
        } catch (_) {
          // backend offline → keep the static preview, just filter it locally
          if (!cancelled && query.trim()) {
            const q = query.trim().toLowerCase();
            const f = DATA.PREVIEW.filter(r =>
              String(r[0]).toLowerCase().includes(q) ||
              String(r[1]).toLowerCase().includes(q) ||
              String(r[2]).includes(q));
            setRows(f); setTotal(f.length);
          } else if (!cancelled) { setRows(DATA.PREVIEW); }
        } finally {
          if (!cancelled) setBusy(false);
        }
      }, 250);
      return () => { cancelled = true; clearTimeout(t); };
    }, [query]);

    const exportCSV = () => {
      const head = ["Area", "Item", "Year", "Rainfall_mm", "Pesticides_t", "Temp_C", "Yield_hg_ha"];
      const body = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([head.join(",") + "\n" + body], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cropai_records.csv";
      a.click();
      URL.revokeObjectURL(a.href);
    };

    return c("div", null,
      c(SectionHead, {
        crumb: ["Home", "Data Exploration"],
        title: "Data Exploration",
        sub: "Statistical overview of the agricultural dataset",
        right: [
          c("div", { key: "s", style: { position: "relative" } },
            c(Icon, { name: "search", size: 16, style: { position: "absolute", left: 12, top: 11, color: "var(--text-muted)" } }),
            c("input", { className: "inp", placeholder: "Search country, crop or year…", value: query,
              onChange: e => setQuery(e.target.value), style: { paddingLeft: 34, width: 230 } })),
          c("button", { key: "e", className: "btn btn-primary btn-sm", onClick: exportCSV }, c(Icon, { name: "download", size: 16 }), "Export CSV"),
        ],
      }),

      // metric cards
      c("div", { className: "grid g-4" }, cards.map((m, i) =>
        c(Reveal, { key: m.label, i, className: "card card-pad hover" },
          c("div", { className: "label", style: { fontSize: 13, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)" } }, m.label),
          c("div", { className: "metric-val", style: { margin: "8px 0 14px" } }, c(CountUp, { value: m.value, fmt: m.fmt ? (n) => n.toLocaleString("en-US") : undefined })),
          m.visual === "spark" && c("div", { className: "spark" }, sparkH.map((h, j) => c("span", { key: j, style: { height: h + "%" } }))),
          m.visual === "bar" && c("div", { className: "hbar" }, c("i", { style: { width: "84%" } })),
          m.visual === "donut" && c(MiniDonut),
          m.visual === "clean" && c("span", { className: "pill", style: { background: "var(--bg-soft)", color: "var(--primary-dark)" } }, c(Icon, { name: "checkCircle", size: 15 }), "Clean Dataset"))) ),

      // preview table
      c(Reveal, { i: 4, className: "card", style: { marginTop: 24 } },
        c("div", { className: "card-pad", style: { paddingBottom: 8 } },
          c("h3", { className: "card-title" }, "Dataset Preview"),
          c("p", { style: { margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 } },
            query.trim() ? `Search results for “${query.trim()}”` : "Sample rows from yield_df.csv")),
        c("div", { className: "tbl-wrap", style: { maxHeight: 420 } },
          c("table", { className: "data" },
            c("thead", null, c("tr", null,
              ["Area", "Item", "Year", "Rainfall (mm)", "Pesticides (t)", "Temp (°C)", "Yield (hg/ha)"].map(h =>
                c("th", { key: h }, h)))),
            c("tbody", null,
              rows.length === 0
                ? c("tr", null, c("td", { colSpan: 7, style: { textAlign: "center", padding: 24, color: "var(--text-muted)" } },
                    busy ? "Searching…" : "No records match your search"))
                : rows.map((r, i) => c("tr", { key: i },
                    c("td", null, c("span", { className: "strong" }, r[0])),
                    c("td", null, r[1]),
                    c("td", { className: "tnum" }, r[2]),
                    c("td", { className: "tnum" }, DATA.fmt(r[3])),
                    c("td", { className: "tnum" }, DATA.fmt(r[4])),
                    c("td", { className: "tnum" }, r[5].toFixed(1)),
                    c("td", { className: "tnum strong" }, DATA.fmt(r[6]))))))),
        c("div", { className: "tbl-foot" },
          c("span", null, `Showing ${rows.length} of ${DATA.fmt(total)}` + (busy ? " · searching…" : "")))),

      // two charts
      c("div", { className: "grid g-2", style: { marginTop: 24 } },
        c(Reveal, { i: 5, className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Yield Distribution"),
          c(RChart, {
            type: "bar", height: 280,
            data: {
              labels: DATA.HIST.labels,
              datasets: [{ data: DATA.HIST.counts, backgroundColor: DATA.HIST.labels.map((_, i) => i <= 2 ? "#4CAF50" : "#A5D6A7"), borderRadius: 6, barPercentage: 0.92, categoryPercentage: 0.9 }],
            },
            options: {
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => DATA.fmt(x.raw) + " records" } } },
              scales: { x: { grid: { display: false } }, y: { grid: RChart.grid, ticks: { callback: (v) => (v / 1000) + "k" } } },
            },
          }),
          c("div", { style: { display: "flex", gap: 18, marginTop: 12, fontSize: 12, color: "var(--text-muted)" } },
            c("span", null, "▬ Mean ≈ " + DATA.fmt(Math.round((DATA.STATS && DATA.STATS.mean) || 77000))),
            c("span", null, "▬ Median ≈ " + DATA.fmt(Math.round((DATA.STATS && DATA.STATS.median) || 38000))))),
        c(Reveal, { i: 6, className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Average Yield by Crop"),
          c(RChart, {
            type: "bar", height: 280,
            data: {
              labels: DATA.YIELD_BY_CROP.map(d => d.crop),
              datasets: [{ data: DATA.YIELD_BY_CROP.map(d => d.val), backgroundColor: "#26A69A", borderRadius: 5 }],
            },
            options: {
              indexAxis: "y",
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => DATA.fmt(x.raw) + " hg/ha" } } },
              scales: { x: { grid: RChart.grid, ticks: { callback: (v) => (v / 1000) + "k" } }, y: { grid: { display: false } } },
            },
          }))),

      // correlation heatmap
      c(Reveal, { i: 7, className: "card card-pad", style: { marginTop: 24 } },
        c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Correlation Heatmap"),
        c(Heatmap)),

      // categorical insights
      c("div", { className: "grid g-2", style: { marginTop: 24 } },
        c(Reveal, { i: 8, className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Top 10 Countries by Average Yield"),
          c("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            DATA.TOP_COUNTRIES.map((d, i) => c("div", { key: d.c, style: { display: "flex", alignItems: "center", gap: 12 } },
              c("span", { style: { width: 22, fontWeight: 700, color: "var(--text-muted)", fontSize: 13 } }, i + 1),
              c("span", { style: { width: 130, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 } }, d.c),
              c("div", { className: "hbar", style: { flex: 1 } }, c("i", { style: { width: (d.v / 251000 * 100) + "%" } })),
              c("span", { className: "tnum", style: { width: 70, textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" } }, DATA.fmt(d.v)))))),
        c(Reveal, { i: 9, className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Year-over-Year Yield Trend"),
          c(RChart, {
            type: "line", height: 300,
            data: {
              labels: DATA.YOY.years,
              datasets: [{ data: DATA.YOY.vals, borderColor: "#2E7D32", borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 0,
                backgroundColor: (ctx) => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300); g.addColorStop(0, "rgba(76,175,80,0.28)"); g.addColorStop(1, "rgba(76,175,80,0)"); return g; } }],
            },
            options: {
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: (x) => DATA.fmt(x.raw) + " hg/ha" } } },
              scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { grid: RChart.grid, ticks: { callback: (v) => (v / 1000) + "k" } } },
            },
          })))
    );
  }

  function Heatmap() {
    const L = DATA.CORR_LABELS, M = DATA.CORR;
    const colFor = (v) => {
      // teal-to-green scale by magnitude; negatives lean grey
      if (v >= 0.999) return "#2E7D32";
      const a = Math.abs(v);
      if (v >= 0) return `rgba(38,166,154,${0.15 + a * 0.8})`;
      return `rgba(139,149,161,${0.12 + a * 0.55})`;
    };
    const grid = { gridTemplateColumns: `90px repeat(${L.length}, 1fr)` };
    // strongest correlation with Yield (last row, excluding self)
    const yieldRow = M[M.length - 1] || [];
    let bi = 0, bv = 0;
    yieldRow.forEach((v, i) => { if (i < L.length - 1 && Math.abs(v) > Math.abs(bv)) { bv = v; bi = i; } });
    const sign = bv >= 0 ? "+" : "";

    return c("div", null,
      c("div", { className: "heat", style: grid },
        c("div", null),
        L.map(l => c("div", { key: "h" + l, className: "hlabel" }, l)),
        M.map((row, r) => c(React.Fragment, { key: r },
          c("div", { className: "hlabel", style: { justifyContent: "flex-end", paddingRight: 8 } }, L[r]),
          row.map((v, k) => c("div", { key: k, className: "hcell", style: { background: colFor(v), color: Math.abs(v) > 0.5 ? "#fff" : "var(--text-secondary)" } }, v.toFixed(2)))))),
      c("p", { style: { marginTop: 14, fontSize: 13, color: "var(--text-muted)" } },
        "Strongest signal: ", c("strong", { style: { color: "var(--primary-dark)" } },
          (L[bi] || "") + " ↔ Yield = " + sign + bv.toFixed(2))));
  }

  window.DataExploration = DataExploration;
})();
