/* CropAI — App shell, sidebar nav, routing */
(function () {
  const c = React.createElement;
  const { useState, useEffect } = React;
  const { Icon } = window;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", comp: "Dashboard" },
    { id: "exploration", label: "Data Exploration", icon: "bar", comp: "DataExploration" },
    { id: "preprocessing", label: "Preprocessing", icon: "workflow", comp: "Preprocessing" },
    { id: "regression", label: "Regression Models", icon: "trendup", comp: "Regression" },
    { id: "classification", label: "Classification", icon: "network", comp: "Classification" },
    { id: "visualizations", label: "Visualizations", icon: "line", comp: "Visualizations" },
    { id: "predictions", label: "Predictions", icon: "sparkles", comp: "Predictions" },
    { id: "about", label: "About", icon: "info", comp: "About" },
  ];

  function App() {
    const [active, setActive] = useState(() => (location.hash || "#dashboard").slice(1));
    const [open, setOpen] = useState(false);
    const [, setTick] = useState(0); // re-render when backend hydration completes

    const nav = (id) => { setActive(id); setOpen(false); location.hash = id; window.scrollTo({ top: 0, behavior: "auto" }); };
    useEffect(() => {
      const h = () => setActive((location.hash || "#dashboard").slice(1));
      const hyd = () => setTick(t => t + 1);
      window.addEventListener("hashchange", h);
      window.addEventListener("cropai:hydrated", hyd);
      return () => { window.removeEventListener("hashchange", h); window.removeEventListener("cropai:hydrated", hyd); };
    }, []);

    const item = NAV.find(n => n.id === active) || NAV[0];
    const Section = window[item.comp] || (() => null);

    return c("div", { className: "app" },
      // sidebar
      c("aside", { className: "sidebar" + (open ? " open" : "") },
        c("div", { className: "sidebar__brand" },
          c("span", { className: "leaf" }, c(Icon, { name: "leaf", size: 19 })),
          "CropAI"),
        c("nav", { className: "sidebar__nav" },
          c("div", { className: "nav-label" }, "Workspace"),
          NAV.map(n => c("button", {
            key: n.id, className: "nav-item" + (active === n.id ? " active" : ""), onClick: () => nav(n.id),
            "aria-current": active === n.id ? "page" : undefined,
          }, c(Icon, { name: n.icon, size: 18 }), n.label))),
        c("div", { className: "sidebar__profile" },
          c("div", { className: "avatar" }, "RM"),
          c("div", { className: "meta" },
            c("strong", null, "Research Mode"),
            c("span", null, c(Icon, { name: "leaf", size: 12 }), "Light theme")))),

      open && c("div", { className: "scrim show", onClick: () => setOpen(false) }),

      // main
      c("div", { className: "main" },
        c("div", { className: "topbar" },
          c("button", { className: "hamburger", onClick: () => setOpen(o => !o), "aria-label": "Open menu" }, c(Icon, { name: "menu", size: 20 })),
          c("div", { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--primary-dark)", fontFamily: "Poppins" } },
            c("span", { className: "leaf", style: { width: 28, height: 28, borderRadius: 8 } }, c(Icon, { name: "leaf", size: 16, style: { color: "#fff" } })), "CropAI")),
        c("main", { className: "main__inner" },
          c("div", { key: active }, c(Section, { nav })))));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(c(App));
})();
