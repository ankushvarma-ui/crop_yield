/* CropAI — Classification (live, backed by /api/classification) */
(function () {
  const c = React.createElement;
  const { useState, useEffect } = React;
  const { Icon, Reveal, SectionHead, ModelIllus, RChart, DATA } = window;

  const fmt0 = (n) => DATA.fmt(Math.round(n));

  // Small fetch helper — resolves to null on any network/parse error so the
  // page can fall back to demo data when the backend isn't running.
  const api = async (path) => {
    try {
      const r = await fetch(path);
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  };

  function ClsCard({ m, i }) {
    return c(Reveal, { i, className: "card model-card hover" + (m.best ? " best" : "") },
      m.best && c("span", { className: "corner-badge badge-best" }, "🏆 BEST"),
      c("div", { className: "model-illus" }, c(ModelIllus, { kind: m.icon })),
      c("h3", null, m.name),
      c("p", { className: "desc" }, m.desc),
      c("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 4 } },
        [["Accuracy", m.acc], ["Precision", m.prec], ["Recall", m.rec]].map(([k, v], j) =>
          c("div", { key: j, className: "metric-row" },
            c("span", { className: "mk", style: { width: 64 } }, k),
            c("div", { className: "hbar", style: { flex: 1 } }, c("i", { style: { width: ((v || 0) * 100) + "%", background: j === 0 ? "var(--primary)" : j === 1 ? "var(--accent-teal)" : "var(--accent-blue)" } })),
            c("span", { className: "mv" }, ((v || 0) * 100).toFixed(1) + "%")))));
  }

  function ConfusionMatrix({ labels, m }) {
    const max = Math.max(...m.flat());
    const total = m.flat().reduce((a, b) => a + b, 0) || 1;
    const n = labels.length;
    const colFor = (v, diag) => {
      const a = max ? v / max : 0;
      return diag ? `rgba(46,125,50,${0.25 + a * 0.75})` : `rgba(139,149,161,${0.12 + a * 0.6})`;
    };
    return c("div", null,
      c("div", { style: { display: "grid", gridTemplateColumns: `auto repeat(${n}, 1fr)`, gap: 6, alignItems: "center" } },
        c("div", null),
        labels.map(l => c("div", { key: "p" + l, className: "cm-axis", style: { textAlign: "center" } }, "Pred " + l)),
        m.map((row, r) => c(React.Fragment, { key: r },
          c("div", { className: "cm-axis", style: { writingMode: "vertical-rl", transform: "rotate(180deg)", justifySelf: "center" } }, "True " + labels[r]),
          row.map((v, k) => c("div", { key: k, className: "cm-cell", style: { background: colFor(v, r === k), color: ((max && v / max > 0.4) || r === k) ? "#fff" : "var(--text-secondary)" } },
            c("div", { className: "c" }, DATA.fmt(v)),
            c("div", { className: "p" }, ((v / total) * 100).toFixed(1) + "%")))))));
  }

  // ── Offline fallbacks shaped exactly like the API response ──
  function fallback(type) {
    const best = DATA.CLASSIFIERS.find(m => m.best) || DATA.CLASSIFIERS[0];
    const withF1 = DATA.CLASSIFIERS.map(m => ({
      ...m,
      f1: m.prec + m.rec ? (2 * m.prec * m.rec) / (m.prec + m.rec) : 0,
      cm: null,
    }));
    if (type === "3class") {
      return {
        type: "3class", labels: DATA.CM_3CLASS.labels, models: withF1, best: best && best.name,
        q33: 25000, q67: 95000, testN: DATA.CM_3CLASS.m.flat().reduce((a, b) => a + b, 0),
        _cmBest: DATA.CM_3CLASS.m, _offline: true,
      };
    }
    return {
      type: "binary", labels: DATA.CM_BINARY.labels, models: withF1, best: best && best.name,
      threshold: DATA.STATS.trainMean, testN: DATA.CM_BINARY.m.flat().reduce((a, b) => a + b, 0),
      _cmBest: DATA.CM_BINARY.m, _offline: true,
    };
  }

  function bands(cur) {
    if (cur.type === "3class") {
      return [
        { icon: "trenddown", title: "Low Yield", rng: `< ${fmt0(cur.q33)} hg/ha` },
        { icon: "minus", title: "Medium Yield", rng: `${fmt0(cur.q33)} – ${fmt0(cur.q67)} hg/ha` },
        { icon: "trendup", title: "High Yield", rng: `> ${fmt0(cur.q67)} hg/ha` },
      ];
    }
    return [
      { icon: "trenddown", title: "Below Average", rng: `< ${fmt0(cur.threshold)} hg/ha` },
      { icon: "trendup", title: "Above Average", rng: `≥ ${fmt0(cur.threshold)} hg/ha` },
    ];
  }

  function Classification() {
    const [tab, setTab] = useState("binary");
    const [bin, setBin] = useState(null);
    const [three, setThree] = useState(null);

    useEffect(() => {
      let live = true;
      api("/api/classification?type=binary").then(d => { if (live && d && d.models) setBin(d); }).catch(() => {});
      api("/api/classification?type=3class").then(d => { if (live && d && d.models) setThree(d); }).catch(() => {});
      return () => { live = false; };
    }, []);

    const cur = tab === "binary" ? (bin || fallback("binary")) : (three || fallback("3class"));
    const best = cur.models.find(m => m.best) || cur.models[0] || {};
    const cm = best.cm || cur._cmBest; // live model carries its own cm; offline uses the best-model mock
    const tabLabel = tab === "binary" ? "Binary" : "3-class";

    return c("div", null,
      c(SectionHead, {
        crumb: ["Home", "Classification"],
        title: "Classification",
        sub: "Predict the yield category instead of an exact value",
      }),

      cur._offline && c(Reveal, {
        style: {
          marginBottom: 16, padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: "#FFF3E0", color: "var(--warning)", border: "1px solid rgba(0,0,0,.06)",
          display: "flex", alignItems: "center", gap: 8,
        },
      }, c(Icon, { name: "info", size: 16 }),
        "Showing demo values — start the backend (python backend_api.py) for live model results."),

      c("div", { style: { marginBottom: 24 } },
        c("div", { className: "tabs" },
          c("button", { className: "tab" + (tab === "binary" ? " active" : ""), onClick: () => setTab("binary") }, "Binary — Above / Below"),
          c("button", { className: "tab" + (tab === "3class" ? " active" : ""), onClick: () => setTab("3class") }, "3-Class — Low / Med / High"))),

      c("div", { className: tab === "binary" ? "grid g-2" : "grid g-3" }, bands(cur).map((cat, i) =>
        c(Reveal, { key: cat.title, i, className: "cat-badge" },
          c("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            c("div", { style: { width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.55)", display: "grid", placeItems: "center" } }, c(Icon, { name: cat.icon, size: 22 })),
            c("div", null, c("h4", null, cat.title), c("div", { className: "rng" }, cat.rng))))) ),

      c("div", { className: "grid g-4", style: { marginTop: 24 } },
        cur.models.map((m, i) => c(ClsCard, { key: m.name, m, i }))),

      cm && c(Reveal, { className: "card card-pad", style: { marginTop: 24 } },
        c("h3", { className: "card-title", style: { marginBottom: 4 } }, "Confusion Matrix — " + (best.name || "")),
        c("p", { style: { margin: "0 0 20px", color: "var(--text-muted)", fontSize: 13 } },
          `${tabLabel} target · test set of ${DATA.fmt(cur.testN)} samples`),
        c("div", { style: { maxWidth: tab === "binary" ? 520 : 640 } }, c(ConfusionMatrix, { labels: cur.labels, m: cm })),
        c("div", { style: { display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" } },
          [["Precision", best.prec], ["Recall", best.rec], ["F1", best.f1], ["Accuracy", best.acc]].map(([k, v]) =>
            c("div", { key: k, style: { flex: "1 1 120px", background: "#FAFBFC", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" } },
              c("div", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", fontWeight: 600 } }, k),
              c("div", { className: "tnum", style: { fontSize: 22, fontWeight: 700, color: "var(--primary-dark)", marginTop: 2 } }, (v == null ? "—" : v.toFixed(4))))))),

      c(Reveal, { className: "card card-pad", style: { marginTop: 24 } },
        c("h3", { className: "card-title", style: { marginBottom: 16 } }, "Classifier Comparison"),
        c(RChart, {
          type: "bar", height: 320,
          data: {
            labels: cur.models.map(m => m.name.replace(" Classifier", "")),
            datasets: [
              { label: "Accuracy", data: cur.models.map(m => m.acc), backgroundColor: "#2196F3", borderRadius: 4 },
              { label: "Precision", data: cur.models.map(m => m.prec), backgroundColor: "#4CAF50", borderRadius: 4 },
              { label: "Recall", data: cur.models.map(m => m.rec), backgroundColor: "#00ACC1", borderRadius: 4 },
            ],
          },
          options: {
            plugins: { legend: { position: "top", align: "end" }, tooltip: { callbacks: { label: (x) => x.dataset.label + ": " + (x.raw * 100).toFixed(1) + "%" } } },
            scales: { x: { grid: { display: false } }, y: { min: 0.5, max: 1, grid: RChart.grid, ticks: { callback: v => (v * 100) + "%" } } },
          },
        }))
    );
  }

  window.Classification = Classification;
})();
