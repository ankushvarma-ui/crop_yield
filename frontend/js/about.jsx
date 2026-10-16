/* CropAI — About */
(function () {
  const c = React.createElement;
  const { Icon, Reveal, DATA } = window;

  const TECH = [
    { abbr: "St", name: "Streamlit", role: "Web application framework" },
    { abbr: "Sk", name: "Scikit-learn", role: "Machine learning models" },
    { abbr: "Pd", name: "Pandas", role: "Data manipulation" },
    { abbr: "Np", name: "NumPy", role: "Numerical computing" },
  ];
  const FEATS = [
    ["trendup", "8 regression models", "Linear to ensemble methods"],
    ["network", "4 classification models", "Binary & 3-class targets"],
    ["database", "28,242 training records", "Clean, no missing values"],
    ["globe", "101 countries covered", "Global agricultural data"],
    ["upload", "Custom dataset upload", "Bring your own CSV / Excel"],
    ["zap", "Real-time predictions", "Instant yield forecasts"],
    ["bar", "Interactive visualizations", "Compare every metric"],
    ["info", "Decision support reports", "Plain-language guidance"],
  ];

  function About() {
    return c("div", null,
      c(Reveal, { i: 0, className: "about-hero" },
        c("span", { className: "pill", style: { background: "rgba(255,255,255,0.7)", color: "var(--primary-dark)" } }, c(Icon, { name: "leaf", size: 15 }), "About"),
        c("h2", { style: { marginTop: 16 } }, "About Crop Yield Prediction System"),
        c("p", null, "An AI-powered decision support platform for sustainable agriculture")),

      c(Reveal, { i: 1, className: "card card-pad", style: { marginTop: 24 } },
        c("h3", { className: "card-title", style: { marginBottom: 8 } }, "Our Mission"),
        c("p", { style: { fontSize: 16, color: "var(--text-secondary)", margin: 0, maxWidth: 760 } },
          "We leverage machine learning to help farmers, researchers, and policymakers make data-driven decisions that improve agricultural productivity and food security worldwide.")),

      c("h3", { className: "card-title", style: { margin: "32px 0 16px" } }, "Technology Stack"),
      c("div", { className: "grid g-4" }, TECH.map((t, i) =>
        c(Reveal, { key: t.name, i, className: "card tech-card hover" },
          c("div", { className: "ti" }, t.abbr),
          c("h4", null, t.name),
          c("p", null, t.role)))),

      c("h3", { className: "card-title", style: { margin: "32px 0 16px" } }, "Key Features"),
      c(Reveal, { className: "card card-pad" },
        c("div", { className: "grid g-2", style: { gap: 20 } }, FEATS.map((ft, i) =>
          c("div", { key: i, className: "feat-item" },
            c("div", { className: "fi" }, c(Icon, { name: ft[0], size: 18 })),
            c("div", null, c("h4", null, ft[1]), c("p", null, ft[2])))))),

      c(Reveal, { className: "sustain", style: { marginTop: 24 } },
        c("div", { style: { display: "flex", gap: 16, alignItems: "flex-start" } },
          c("div", { style: { fontSize: 32, lineHeight: 1 } }, "🌍"),
          c("p", { style: { margin: 0, fontSize: 16, color: "var(--text-secondary)" } },
            c("strong", { style: { color: "var(--primary-dark)" } }, "Sustainability — UN SDG #2: Zero Hunger. "),
            "This platform supports sustainable development by helping optimize agricultural production through climate-aware analytics."))),

      c("div", { className: "footer" },
        c("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
          c("div", { className: "leaf", style: { width: 30, height: 30, borderRadius: 9, background: "var(--grad-button)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-glow)" } }, c(Icon, { name: "leaf", size: 16, style: { color: "#fff" } })),
          c("div", null, c("strong", { style: { color: "var(--primary-dark)", fontFamily: "Poppins" } }, "CropAI"), c("div", { style: { fontSize: 12 } }, "AI for Agriculture"))),
        c("div", { className: "links" }, ["Dashboard", "Models", "Predictions", "GitHub"].map(l => c("a", { key: l, href: "#" }, l))),
        c("div", { style: { display: "flex", gap: 10, fontSize: 13 } }, "Python · Streamlit · Scikit-learn")),
      c("div", { className: "foot-base" }, "© 2026 Crop Yield Prediction System · Built with ❤️ for sustainable agriculture")
    );
  }
  window.About = About;
})();
