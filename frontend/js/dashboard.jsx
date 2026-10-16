/* CropAI — Dashboard (landing) */
(function () {
  const c = React.createElement;
  const { useState, useEffect } = React;
  const { Icon, CountUp, Reveal, DATA } = window;

  // "x min ago" relative time for stored predictions
  function ago(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    const m = Math.floor(s / 60); if (m < 60) return m + " min ago";
    const h = Math.floor(m / 60); if (h < 24) return h + " hr ago";
    return Math.floor(h / 24) + " d ago";
  }

  // Merge the user's own predictions (localStorage) on top of the backend sample
  function recentList() {
    let mine = [];
    try {
      mine = JSON.parse(localStorage.getItem("cropai:recent") || "[]")
        .map(e => ({ time: ago(e.ts), country: e.country, crop: e.crop, yield: e.yield, status: e.status }));
    } catch (_) { mine = []; }
    return [...mine, ...(DATA.RECENT || [])].slice(0, 8);
  }

  const STATS = [
    { icon: "database", label: "Total Records", value: 28242, fmt: true },
    { icon: "globe", label: "Countries", value: 101 },
    { icon: "wheat", label: "Crop Types", value: 10 },
    { icon: "calendar", label: "Years Tracked", text: "1990–2013" },
  ];

  function Dashboard({ nav }) {
    const [recent, setRecent] = useState(recentList);
    useEffect(() => {
      const refresh = () => setRecent(recentList());
      window.addEventListener("cropai:prediction", refresh);
      window.addEventListener("cropai:hydrated", refresh);
      return () => {
        window.removeEventListener("cropai:prediction", refresh);
        window.removeEventListener("cropai:hydrated", refresh);
      };
    }, []);

    return c("div", null,
      // HERO
      c(Reveal, { i: 0, as: "section", className: "hero", "data-screen-label": "Dashboard hero" },
        c("div", { className: "hero__bg", style: { backgroundImage: "url('assets/hero-drone.avif')" } }),
        c("div", { className: "hero__overlay" }),
        c("span", { className: "pill pill-glass" }, "🌾 AI-Powered Agriculture"),
        c("h1", { style: { marginTop: 16 } }, "Crop Yield Prediction System"),
        c("p", { className: "sub" }, "AI-Powered Agricultural Decision Support Platform"),
        c("p", { className: "body" }, "Predict crop yields with precision using machine learning models trained on 28,242 agricultural records spanning 101 countries and 24 years of climate data."),
        c("div", { className: "cta-row" },
          c("button", { className: "btn btn-light", onClick: () => nav("predictions") }, "Start Predicting", c(Icon, { name: "arrowRight", size: 18 })),
          c("button", { className: "btn btn-ghost", onClick: () => nav("regression") }, "Explore Models"))),

      // STATS STRIP
      c("div", { className: "grid g-4", style: { marginTop: 28 } },
        STATS.map((s, i) => c(Reveal, { key: s.label, i: i + 1, className: "card stat-card hover" },
          c("div", { className: "icon-chip" }, c(Icon, { name: s.icon, size: 22 })),
          c("div", { className: "label" }, s.label),
          c("div", { className: "val" }, s.text ? s.text : c(CountUp, { value: s.value, fmt: s.fmt ? (n) => n.toLocaleString("en-US") : undefined }))))),

      // QUICK ACTIONS
      c("div", { className: "grid g-2", style: { marginTop: 24 } },
        c(Reveal, { i: 5, className: "card qa-card grad hover", onClick: () => nav("predictions") },
          c("div", { className: "icon-chip" }, c(Icon, { name: "sparkles", size: 22 })),
          c("div", null,
            c("h3", null, "Make a Prediction"),
            c("p", null, "Forecast yield for any country, crop & climate scenario")),
          c(Icon, { name: "arrowRight", size: 20, cls: "arrow" })),
        c(Reveal, { i: 6, className: "card qa-card hover", onClick: () => nav("regression") },
          c("div", { className: "icon-chip teal" }, c(Icon, { name: "trendup", size: 22 })),
          c("div", null,
            c("h3", { style: { color: "var(--text-primary)" } }, "View Model Performance"),
            c("p", { style: { color: "var(--text-secondary)" } }, "Compare 8 regression models — R², MAE & RMSE")),
          c(Icon, { name: "arrowRight", size: 20, cls: "arrow", style: { color: "var(--text-muted)" } }))),

      // RECENT ACTIVITY
      c(Reveal, { i: 7, className: "card", style: { marginTop: 24 } },
        c("div", { className: "card-pad", style: { paddingBottom: 8 } },
          c("div", { className: "eyebrow" }, "Recent Activity"),
          c("h3", { className: "card-title", style: { marginTop: 4 } }, "Latest Predictions")),
        c("div", { className: "tbl-wrap" },
          c("table", { className: "data" },
            c("thead", null, c("tr", null,
              ["Time", "Country", "Crop", "Predicted Yield", "Status"].map(h => c("th", { key: h }, h)))),
            c("tbody", null, recent.map((r, i) => c("tr", { key: i },
              c("td", null, r.time),
              c("td", null, c("span", { className: "strong" }, r.country)),
              c("td", null, r.crop),
              c("td", { className: "tnum" }, DATA.fmt(r.yield) + " hg/ha"),
              c("td", null, c("span", { className: "badge " + (r.status === "above" ? "badge-above" : "badge-below") },
                c(Icon, { name: r.status === "above" ? "trendup" : "trenddown", size: 13 }),
                r.status === "above" ? "Above Average" : "Below Average"))))))))
    );
  }
  window.Dashboard = Dashboard;
})();
