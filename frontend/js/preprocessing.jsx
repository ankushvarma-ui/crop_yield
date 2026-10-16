/* CropAI — Preprocessing pipeline */
(function () {
  const c = React.createElement;
  const { Icon, Reveal, SectionHead } = window;

  const STEPS = [
    { icon: "folder", title: "Raw Dataset", d: "28,242 rows · 7 columns loaded" },
    { icon: "tag", title: "OneHot Encoding", d: "2 categoricals → 111 binary columns" },
    { icon: "scale", title: "Standard Scaling", d: "4 numerical features normalized" },
    { icon: "scissors", title: "Train / Test Split", d: "80% train · 20% test" },
    { icon: "checkCircle", title: "Model Ready", d: "Pipeline fitted & cached" },
  ];

  function Preprocessing() {
    return c("div", null,
      c(SectionHead, {
        crumb: ["Home", "Preprocessing"],
        title: "Preprocessing",
        sub: "The ML pipeline applied before every model is trained",
      }),

      c(Reveal, { i: 0, className: "card card-pad" },
        c("div", { className: "eyebrow", style: { marginBottom: 16 } }, "Pipeline · data flows left to right"),
        c("div", { className: "pipeline" },
          STEPS.map((s, i) => c(React.Fragment, { key: s.title },
            c("div", { className: "pipe-card" },
              c("div", { className: "pico" }, c(Icon, { name: s.icon, size: 26 })),
              c("h4", null, s.title),
              c("p", null, s.d),
              c("span", { className: "pipe-status" }, c("span", { className: "dot" }), "Complete")),
            i < STEPS.length - 1 && c("div", { className: "connector" },
              c("div", { className: "line" }),
              c(Icon, { name: "arrowRight", size: 16, cls: "arrow-tip" })))))),

      // 3 info cards
      c("div", { className: "grid g-3", style: { marginTop: 24 } },
        c(Reveal, { i: 1, className: "card card-pad" },
          c("div", { className: "icon-chip teal", style: { marginBottom: 14 } }, c(Icon, { name: "tag", size: 22 })),
          c("h3", { className: "card-title" }, "Categorical Encoding"),
          c("p", { style: { color: "var(--text-secondary)", margin: "8px 0 16px" } }, "OneHotEncoder transforms 2 categorical columns into 111 binary columns."),
          c("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            c(EncRow, { label: "Area", from: 101, to: "101 binary cols" }),
            c(EncRow, { label: "Item", from: 10, to: "10 binary cols" }))),

        c(Reveal, { i: 2, className: "card card-pad" },
          c("div", { className: "icon-chip", style: { marginBottom: 14 } }, c(Icon, { name: "scale", size: 22 })),
          c("h3", { className: "card-title" }, "Feature Scaling"),
          c("p", { style: { color: "var(--text-secondary)", margin: "8px 0 16px" } }, "StandardScaler normalizes 4 numerical features. OHE columns remain unscaled."),
          c("div", { style: { background: "#F4F6F9", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 15, color: "var(--text-primary)", textAlign: "center" } },
            "x", c("sub", null, "scaled"), " = (x − μ) / σ")),

        c(Reveal, { i: 3, className: "card card-pad" },
          c("div", { className: "icon-chip blue", style: { marginBottom: 14 } }, c(Icon, { name: "scissors", size: 22 })),
          c("h3", { className: "card-title" }, "Train / Test Split"),
          c("p", { style: { color: "var(--text-secondary)", margin: "8px 0 16px" } }, "80% training (22,594 samples) · 20% testing (5,648 samples)."),
          c("div", { style: { display: "flex", height: 38, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" } },
            c("div", { style: { width: "80%", background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600 } }, "Train 80%"),
            c("div", { style: { width: "20%", background: "var(--accent-teal)", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 } }, "20%"))))
    );
  }

  function EncRow({ label, from, to }) {
    return c("div", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 13 } },
      c("span", { style: { fontWeight: 600, color: "var(--text-primary)", width: 56 } }, label),
      c("span", { className: "pill", style: { background: "#F4F6F9", color: "var(--text-muted)", padding: "3px 9px" } }, from, " values"),
      c(Icon, { name: "arrowRight", size: 14, style: { color: "var(--accent-teal)" } }),
      c("span", { style: { color: "var(--primary-dark)", fontWeight: 600 } }, to));
  }

  window.Preprocessing = Preprocessing;
})();
