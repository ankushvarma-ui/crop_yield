/* CropAI — Predictions */
(function () {
  const c = React.createElement;
  const { useState } = React;
  const { Icon, Reveal, SectionHead, CountUp, RChart, DATA } = window;

  function Field({ label, icon, hint, children }) {
    return c("div", { className: "field" },
      c("label", null, icon && c(Icon, { name: icon, size: 15, style: { color: "var(--accent-teal)" } }), label, hint && c("span", { className: "req" }, hint)),
      children);
  }

  function Slider({ value, onChange, min, max, step, unit }) {
    return c("div", { className: "slider-row" },
      c("input", { type: "range", className: "range", min, max, step, value, onChange: e => onChange(+e.target.value) }),
      c("input", { type: "number", className: "inp", min, max, step, value, onChange: e => onChange(+e.target.value) }));
  }

  // classifier names (hydrated from the backend; fall back to the known four)
  const classifierNames = () => {
    const live = (DATA.CLASSIFIERS || []).map(m => m.name).filter(Boolean);
    return live.length ? live : ["Random Forest Classifier", "K-Nearest Neighbors (k=5)", "Logistic Regression", "Naive Bayes"];
  };
  const defaultRegModel = () => {
    const r = (DATA.REGRESSION || []).filter(m => !m.baseline);
    return ((r.find(m => m.best) || r[0] || {}).name) || "Random Forest";
  };

  function Predictions() {
    const [task, setTask] = useState("regression");   // regression | classification
    const [ctype, setCtype] = useState("binary");       // binary | 3class
    const [f, setF] = useState({ country: "Albania", crop: "Maize", year: 2010, rain: 1485, pest: 121, temp: 16.4, model: "Random Forest" });
    const [state, setState] = useState("idle"); // idle | loading | done | error
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    // switch task → pick a sensible default model for that task
    const switchTask = (t) => {
      setTask(t);
      setState("idle"); setResult(null);
      set("model", t === "classification" ? classifierNames()[0] : defaultRegModel());
    };

    const predict = async () => {
      setState("loading");
      setErrMsg("");
      try {
        // ── Classification branch ──
        if (task === "classification") {
          const payload = { country: f.country, crop: f.crop, year: f.year, rain: f.rain, pest: f.pest, temp: f.temp, model: f.model, type: ctype };
          const res = await fetch("/api/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error((await res.json()).error || "Classification failed");
          const r = await res.json();
          setHistory(null);
          setResult({ kind: "classification", label: r.label, cls: r.class, ctype: r.type,
                      threshold: r.threshold, q33: r.q33, q67: r.q67, model: r.model });
          setState("done");
          return;
        }

        // ── Regression branch ──
        const payload = { country: f.country, crop: f.crop, year: f.year, rain: f.rain, pest: f.pest, temp: f.temp, model: f.model };
        const res = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error((await res.json()).error || "Prediction failed");
        const r = await res.json();

        let hist = null;
        try {
          const hres = await fetch(`/api/history?country=${encodeURIComponent(f.country)}&crop=${encodeURIComponent(f.crop)}`);
          if (hres.ok) {
            const hj = await hres.json();
            if (!hj.empty) hist = hj;
          }
        } catch (_) { /* historical chart is optional */ }
        setHistory(hist);

        setResult({
          kind: "regression",
          y: Math.round(r.yield),
          pct: r.percentDiff,
          above: r.above,
          conf: r.confidence,
          comparable: r.comparables,
          model: r.model,
        });
        setState("done");

        // Record this prediction so it shows up in the dashboard's "Latest Predictions"
        try {
          const entry = { ts: Date.now(), country: f.country, crop: f.crop,
                          yield: Math.round(r.yield), status: r.above ? "above" : "below" };
          const prev = JSON.parse(localStorage.getItem("cropai:recent") || "[]");
          const next = [entry, ...prev].slice(0, 10);
          localStorage.setItem("cropai:recent", JSON.stringify(next));
          window.dispatchEvent(new CustomEvent("cropai:prediction", { detail: entry }));
        } catch (_) { /* storage optional */ }
      } catch (e) {
        setErrMsg(e.message || "Prediction failed");
        setState("error");
      }
    };

    return c("div", null,
      c(SectionHead, { crumb: ["Home", "Predictions"], title: "Predict Crop Yield", sub: "AI-powered forecast from climate & agricultural inputs" }),

      c("div", { className: "grid", style: { gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 24, alignItems: "start" } },
        // LEFT — form
        c(Reveal, { i: 0, className: "grad-border" },
          c("h3", { className: "card-title", style: { marginBottom: 14 } }, "Scenario Inputs"),
          // Prediction task toggle
          c("div", { className: "tabs", style: { marginBottom: 18 } },
            c("button", { className: "tab" + (task === "regression" ? " active" : ""), onClick: () => switchTask("regression") }, "📈 Regression — exact yield"),
            c("button", { className: "tab" + (task === "classification" ? " active" : ""), onClick: () => switchTask("classification") }, "🏷️ Classification — category")),
          c(Field, { label: "Country", icon: "mapPin" },
            c("select", { className: "inp", value: f.country, onChange: e => set("country", e.target.value) }, DATA.COUNTRIES.map(x => c("option", { key: x }, x)))),
          c(Field, { label: "Crop Type", icon: "wheat" },
            c("select", { className: "inp", value: f.crop, onChange: e => set("crop", e.target.value) }, DATA.CROPS.map(x => c("option", { key: x }, x)))),
          c(Field, { label: "Year", icon: "calendar" },
            c("input", { type: "number", className: "inp", min: 1990, max: 2030, value: f.year, onChange: e => set("year", +e.target.value) })),
          c(Field, { label: "Average Rainfall", icon: "droplet", hint: f.rain + " mm/yr" },
            c(Slider, { value: f.rain, onChange: v => set("rain", v), min: 0, max: 5000, step: 1 })),
          c(Field, { label: "Pesticides", icon: "flask", hint: DATA.fmt(f.pest) + " t" },
            c(Slider, { value: f.pest, onChange: v => set("pest", v), min: 0, max: 500000, step: 1 })),
          c(Field, { label: "Average Temperature", icon: "thermo", hint: f.temp + " °C" },
            c(Slider, { value: f.temp, onChange: v => set("temp", v), min: -10, max: 50, step: 0.1 })),
          task === "classification" && c(Field, { label: "Category Type" },
            c("div", { className: "tabs" },
              c("button", { className: "tab" + (ctype === "binary" ? " active" : ""), onClick: () => setCtype("binary") }, "Binary — Above / Below"),
              c("button", { className: "tab" + (ctype === "3class" ? " active" : ""), onClick: () => setCtype("3class") }, "3-Class — Low / Med / High"))),
          c(Field, { label: task === "classification" ? "Classifier" : "Model" },
            c("select", { className: "inp", value: f.model, onChange: e => set("model", e.target.value) },
              task === "classification"
                ? classifierNames().map(n => c("option", { key: n, value: n }, n))
                : DATA.REGRESSION.filter(m => !m.baseline).map(m => c("option", { key: m.name, value: m.name }, m.name + (m.best ? "  ★ Recommended" : ""))))),
          c("button", { className: "btn btn-primary", style: { width: "100%", justifyContent: "center", marginTop: 8, padding: "15px" }, onClick: predict, disabled: state === "loading" },
            state === "loading" ? c(React.Fragment, null, c("span", { className: "spinner" }), "Analyzing…")
              : c(React.Fragment, null, c(Icon, { name: "sparkles", size: 18 }), task === "classification" ? "Classify Yield" : "Predict Yield"))),

        // RIGHT — result
        f.country && c("div", { style: { display: "flex", flexDirection: "column", gap: 24 } },
          c(ResultCard, { state, result, f }),
          state === "done" && c(Reveal, { className: "card card-pad" },
            c("h3", { className: "card-title", style: { marginBottom: 14 } }, "AI Recommendation"),
            c("ul", { className: "rec-list" },
              [["🌾", `Conditions favorable for ${f.crop} in ${f.country}`],
               ["💧", `Rainfall level (${f.rain} mm) is ${f.rain >= 800 && f.rain <= 2000 ? "optimal" : "outside the ideal band"} for this crop`],
               ["🌡️", `Temperature ${Math.abs(f.temp - 18) < 8 ? "within ideal range" : "may stress the crop"}`],
               ["🧪", "Consider monitoring pesticide efficiency to maintain yield"]].map((r, i) =>
                c("li", { key: i }, c("span", { className: "rico" }, r[0]), c("span", null, r[1])))))) ),

      // input summary + historical chart
      state === "done" && c("div", { className: "grid g-2", style: { marginTop: 24 } },
        c(Reveal, { className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 14 } }, "Input Summary"),
          c("table", { className: "data" }, c("tbody", null,
            [["Country", f.country], ["Crop", f.crop], ["Year", f.year], ["Rainfall", f.rain + " mm/yr"], ["Pesticides", DATA.fmt(f.pest) + " t"], ["Temperature", f.temp + " °C"], ["Model", f.model]].map(([k, v]) =>
              c("tr", { key: k }, c("td", { style: { color: "var(--text-muted)" } }, k), c("td", { className: "strong", style: { textAlign: "right" } }, String(v))))))),
        c(Reveal, { className: "card card-pad" },
          c("h3", { className: "card-title", style: { marginBottom: 14 } }, `Historical Yield · ${f.country} × ${f.crop}`),
          (() => {
            const histYears = history ? history.years : DATA.HIST_COMBO.years;
            const histVals  = history ? history.yields : DATA.HIST_COMBO.vals;
            const predYear  = f.year;
            return c(RChart, {
              type: "line", height: 280,
              data: { labels: histYears, datasets: [
                { label: "Historical", data: histVals, borderColor: "#2E7D32", borderWidth: 2.5, tension: 0.4, pointRadius: 0, fill: true,
                  backgroundColor: ctx => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280); g.addColorStop(0, "rgba(76,175,80,0.25)"); g.addColorStop(1, "rgba(76,175,80,0)"); return g; } },
                { label: "Prediction", data: histYears.map(y => y === predYear && result && result.kind === "regression" ? result.y : null), borderColor: "#00ACC1", pointBackgroundColor: "#00ACC1", pointRadius: 7, pointHoverRadius: 9, showLine: false },
              ] },
              options: { plugins: { legend: { position: "top", align: "end" }, tooltip: { callbacks: { label: x => x.dataset.label + ": " + DATA.fmt(x.raw) + " hg/ha" } } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }, y: { grid: RChart.grid, ticks: { callback: v => (v / 1000) + "k" } } } },
            });
          })()))
    );
  }

  function ResultCard({ state, result, f }) {
    if (state === "idle") return c("div", { className: "result-card" },
      c("div", { className: "result-empty" },
        c("div", { className: "orb" }, c(Icon, { name: "sparkles", size: 38 })),
        c("p", { style: { maxWidth: 240 } }, "Enter inputs and click Predict to see the AI forecast")));
    if (state === "loading") return c("div", { className: "result-card" },
      c("div", { className: "result-empty" },
        c("span", { className: "spinner big" }),
        c("p", null, "Running ", f.model, " on your scenario…")));
    if (state === "error") return c("div", { className: "result-card" },
      c("div", { className: "result-empty" },
        c("div", { className: "orb", style: { background: "rgba(229,57,53,0.12)", color: "#E53935" } }, c(Icon, { name: "info", size: 38 })),
        c("p", { style: { color: "var(--text-secondary)" } }, "Prediction failed. Make sure the backend is running on port 5000.")));

    // ── Classification result ──
    if (result && result.kind === "classification") {
      const tone = result.ctype === "binary"
        ? (result.cls === 1 ? "badge-above" : "badge-below")
        : (result.cls === 2 ? "badge-above" : result.cls === 0 ? "badge-below" : "");
      const emoji = result.ctype === "binary"
        ? (result.cls === 1 ? "🌱" : "🍂")
        : (result.cls === 2 ? "🌱" : result.cls === 1 ? "🌾" : "🍂");
      const band = result.ctype === "binary"
        ? `Split at training mean ≈ ${DATA.fmt(Math.round(result.threshold))} hg/ha`
        : `Low < ${DATA.fmt(Math.round(result.q33))}  ·  High > ${DATA.fmt(Math.round(result.q67))} hg/ha`;
      return c("div", { className: "result-card live" },
        c("span", { className: "pill", style: { background: "var(--bg-soft)", color: "var(--primary-dark)" } }, "🏷️ Classification Complete"),
        c("div", { style: { marginTop: 18 } },
          c("div", { className: "big-metric", style: { fontSize: 34 } }, emoji + " " + result.label),
          c("div", { style: { color: "var(--text-secondary)", marginTop: 8, fontSize: 14 } }, band)),
        c("div", { style: { marginTop: 16 } },
          c("span", { className: "badge " + tone, style: { fontSize: 14, padding: "7px 14px" } }, "Predicted: " + result.label)),
        c("div", { className: "inline-stats" },
          c("div", { className: "is" }, c("div", { className: "k" }, "Type"), c("div", { className: "v", style: { fontSize: 14 } }, result.ctype === "binary" ? "Binary" : "3-Class")),
          c("div", { className: "is" }, c("div", { className: "k" }, "Classifier"), c("div", { className: "v", style: { fontSize: 13 } }, result.model || f.model))));
    }

    return c("div", { className: "result-card live" },
      c("span", { className: "pill", style: { background: "var(--bg-soft)", color: "var(--primary-dark)" } }, "✨ Prediction Complete"),
      c("div", { style: { marginTop: 18 } },
        c("div", { className: "big-metric" }, c(CountUp, { value: result.y, suffix: " hg/ha" })),
        c("div", { style: { color: "var(--text-secondary)", marginTop: 8, fontSize: 16 } }, "≈ ", (result.y / 10000).toFixed(2), " tonnes per hectare")),
      c("div", { style: { marginTop: 16 } },
        c("span", { className: "badge " + (result.above ? "badge-above" : "badge-below"), style: { fontSize: 14, padding: "7px 14px" } },
          result.above ? "🌱 Above Average" : "🍂 Below Average",
          c("span", { style: { opacity: .8, marginLeft: 4 } }, (result.pct >= 0 ? "+" : "") + result.pct.toFixed(1) + "% vs mean"))),
      c("div", { className: "inline-stats" },
        c("div", { className: "is" }, c("div", { className: "k" }, "Confidence"), c("div", { className: "v" }, result.conf + "%")),
        c("div", { className: "is" }, c("div", { className: "k" }, "Model"), c("div", { className: "v", style: { fontSize: 14 } }, result.model || f.model)),
        c("div", { className: "is" }, c("div", { className: "k" }, "Comparables"), c("div", { className: "v" }, result.comparable))));
  }

  window.Predictions = Predictions;
})();
