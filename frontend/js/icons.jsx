/* CropAI — icon set (Lucide-style, 1.5px stroke) + model illustrations */
(function () {
  const P = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    bar: '<path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx="1"/><rect x="12" y="7" width="3" height="10" rx="1"/><rect x="17" y="13" width="3" height="4" rx="1"/>',
    workflow: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><path d="M10 6.5h4a3 3 0 0 1 3 3V14"/>',
    trendup: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
    trenddown: '<path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/>',
    network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M10.5 7 6.5 16.7M13.5 7l4 9.7M7.5 19h9"/>',
    line: '<path d="M3 3v18h18"/><path d="M6 15l4-5 3 3 5-7"/>',
    sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.7 1.8L21.5 16.5 19.7 17.2 19 19l-.7-1.8L16.5 16.5 18.3 15.8z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-6-3.8-9S9.5 5.5 12 3z"/>',
    wheat: '<path d="M12 22V8"/><path d="M12 8c0-2 1.5-3.5 3.5-3.5C15.5 6.5 14 8 12 8zM12 8c0-2-1.5-3.5-3.5-3.5C8.5 6.5 10 8 12 8z"/><path d="M12 13c0-1.8 1.4-3 3.2-3C15.2 11.8 13.8 13 12 13zM12 13c0-1.8-1.4-3-3.2-3C8.8 11.8 10.2 13 12 13z"/><path d="M12 18c0-1.8 1.4-3 3.2-3C15.2 16.8 13.8 18 12 18zM12 18c0-1.8-1.4-3-3.2-3C8.8 16.8 10.2 18 12 18z"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
    minus: '<path d="M5 12h14"/>',
    droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
    thermo: '<path d="M14 14.5V5a2 2 0 1 0-4 0v9.5a4 4 0 1 0 4 0z"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.8 6.6 19.7l1.2-6L3.3 9.3l6.1-.7z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    mapPin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13C4 7 9 3 20 4c1 11-3 16-9 16z"/><path d="M4 20c4-5 7.5-7.5 12-9"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/>',
    github: '<path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.3 0C6.6 2.3 5.5 2.6 5.5 2.6a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    activity: '<path d="M3 12h4l3 8 4-16 3 8h4"/>',
    layers: '<path d="M12 3 2 8l10 5 10-5z"/><path d="M2 13l10 5 10-5M2 18l10 5 10-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    scale: '<path d="M12 3v18M7 21h10"/><path d="M5 7h14M5 7l-2.5 6a3 3 0 0 0 5 0zM19 7l-2.5 6a3 3 0 0 0 5 0z"/><path d="M5 7l7-2 7 2"/>',
    scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 10M8 16 20 6M8 12h2"/>',
    tag: '<path d="M3 3h7l11 11-7 7L3 10z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 4v4h-4"/>',
  };

  function Icon({ name, size = 20, sw = 1.5, style, cls }) {
    const inner = P[name] || P.info;
    return React.createElement("svg", {
      width: size, height: size, viewBox: "0 0 24 24", fill: "none",
      stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
      style, className: cls, "aria-hidden": "true",
      dangerouslySetInnerHTML: { __html: inner },
    });
  }

  // ---- Model illustrations (decorative SVG, ~140x70) ----
  function ModelIllus({ kind }) {
    const g = "#4CAF50", t = "#00ACC1", b = "#2196F3", muted = "#B6C2CE";
    const svg = (children) => React.createElement("svg", { width: 150, height: 78, viewBox: "0 0 150 78", fill: "none" }, children);
    const c = React.createElement;
    switch (kind) {
      case "forest":
        return svg([
          [30, 0], [75, 0], [120, 0],
        ].map(([x], i) => c("g", { key: i, transform: `translate(${x},10)` }, [
          c("circle", { key: "a", cx: 0, cy: 8, r: 6, fill: i === 1 ? g : t, opacity: .9 }),
          c("circle", { key: "b", cx: -12, cy: 32, r: 5, fill: muted }),
          c("circle", { key: "c", cx: 12, cy: 32, r: 5, fill: muted }),
          c("circle", { key: "d", cx: -20, cy: 54, r: 4, fill: i === 1 ? g : t, opacity: .55 }),
          c("circle", { key: "e", cx: -4, cy: 54, r: 4, fill: muted, opacity: .55 }),
          c("path", { key: "l", d: "M0 14v6M0 20l-12 6M0 20l12 6M-12 38l-8 12M-12 38l8 12", stroke: "#D5DEE6", strokeWidth: 1.5 }),
        ])));
      case "tree":
        return svg(c("g", { transform: "translate(75,8)" }, [
          c("circle", { key: 1, cx: 0, cy: 6, r: 7, fill: g }),
          c("circle", { key: 2, cx: -22, cy: 32, r: 6, fill: t }),
          c("circle", { key: 3, cx: 22, cy: 32, r: 6, fill: t }),
          c("circle", { key: 4, cx: -34, cy: 56, r: 5, fill: muted }),
          c("circle", { key: 5, cx: -10, cy: 56, r: 5, fill: muted }),
          c("circle", { key: 6, cx: 34, cy: 56, r: 5, fill: muted }),
          c("path", { key: 7, d: "M0 13l-22 13M0 13l22 13M-22 38l-12 13M-22 38l12 13M22 38l12 13", stroke: "#D5DEE6", strokeWidth: 1.5 }),
        ]));
      case "boost":
        return svg([0, 1, 2].map(i => c("g", { key: i, transform: `translate(${30 + i * 40},${20 - i * 4})`, opacity: .55 + i * .22 }, [
          c("circle", { key: 1, cx: 0, cy: 0, r: 6, fill: i === 2 ? g : t }),
          c("circle", { key: 2, cx: -9, cy: 20, r: 4.5, fill: muted }),
          c("circle", { key: 3, cx: 9, cy: 20, r: 4.5, fill: muted }),
          c("path", { key: 4, d: "M0 6l-9 11M0 6l9 11", stroke: "#D5DEE6", strokeWidth: 1.5 }),
        ])).concat(c("path", { key: "x", d: "M22 22h12M62 18h12M102 14h12", stroke: g, strokeWidth: 1.5, markerEnd: "" })));
      case "poly3":
      case "poly2":
        return svg([
          c("path", { key: 1, d: kind === "poly3" ? "M8 60 C40 10, 70 70, 142 18" : "M8 58 Q75 6 142 58", stroke: g, strokeWidth: 2.5, fill: "none" }),
          c("path", { key: 2, d: "M8 70h134M8 70V8", stroke: "#D5DEE6", strokeWidth: 1.5 }),
          ...[20, 45, 70, 95, 120].map((x, i) => c("circle", { key: "d" + i, cx: x, cy: [50, 30, 48, 24, 36][i], r: 2.5, fill: t })),
        ]);
      case "line":
        return svg([
          c("path", { key: 1, d: "M8 58 L142 20", stroke: g, strokeWidth: 2.5 }),
          c("path", { key: 2, d: "M8 70h134M8 70V8", stroke: "#D5DEE6", strokeWidth: 1.5 }),
          ...[20, 45, 70, 95, 120].map((x, i) => c("circle", { key: "d" + i, cx: x, cy: [56, 48, 40, 30, 24][i] + (i % 2 ? 4 : -4), r: 2.5, fill: t })),
        ]);
      case "svr":
        return svg([
          c("path", { key: 1, d: "M8 50 L142 24", stroke: g, strokeWidth: 2 }),
          c("path", { key: 2, d: "M8 38 L142 12", stroke: t, strokeWidth: 1, strokeDasharray: "4 3", opacity: .7 }),
          c("path", { key: 3, d: "M8 62 L142 36", stroke: t, strokeWidth: 1, strokeDasharray: "4 3", opacity: .7 }),
          ...[[25, 30], [50, 44], [70, 30], [95, 22], [118, 32]].map(([x, y], i) => c("circle", { key: "d" + i, cx: x, cy: y, r: 3, fill: i % 2 ? b : muted })),
        ]);
      case "base":
        return svg([
          c("path", { key: 1, d: "M8 40 H142", stroke: muted, strokeWidth: 2, strokeDasharray: "5 4" }),
          ...[20, 45, 70, 95, 120].map((x, i) => c("circle", { key: "d" + i, cx: x, cy: [52, 30, 46, 34, 50][i], r: 2.5, fill: "#CBD5DE" })),
        ]);
      case "knn":
        return svg([
          c("circle", { key: "r1", cx: 75, cy: 39, r: 26, stroke: t, strokeWidth: 1, fill: "none", opacity: .4 }),
          c("circle", { key: "r2", cx: 75, cy: 39, r: 16, stroke: t, strokeWidth: 1, fill: "none", opacity: .6 }),
          c("circle", { key: "c", cx: 75, cy: 39, r: 4.5, fill: g }),
          ...[[60, 30, g], [90, 32, g], [66, 52, t], [88, 50, b], [55, 45, muted], [98, 40, muted]].map(([x, y, col], i) => c("circle", { key: i, cx: x, cy: y, r: 3.5, fill: col })),
        ]);
      case "sigmoid":
        return svg([
          c("path", { key: 1, d: "M10 62 C50 62, 60 16, 140 16", stroke: g, strokeWidth: 2.5, fill: "none" }),
          c("path", { key: 2, d: "M10 70h132M75 70V8", stroke: "#D5DEE6", strokeWidth: 1.5 }),
          c("path", { key: 3, d: "M10 39h130", stroke: "#E4E9F0", strokeWidth: 1, strokeDasharray: "3 3" }),
        ]);
      case "bayes":
        return svg([
          c("path", { key: 1, d: "M10 64 C40 64 44 20 60 20 C76 20 80 64 110 64", stroke: g, strokeWidth: 2, fill: "none", opacity: .85 }),
          c("path", { key: 2, d: "M50 64 C80 64 84 26 100 26 C116 26 120 64 142 64", stroke: t, strokeWidth: 2, fill: "none", opacity: .7 }),
          c("path", { key: 3, d: "M10 64h132", stroke: "#D5DEE6", strokeWidth: 1.5 }),
        ]);
      default:
        return svg(c("circle", { cx: 75, cy: 39, r: 10, fill: muted }));
    }
  }

  window.Icon = Icon;
  window.ModelIllus = ModelIllus;
})();
