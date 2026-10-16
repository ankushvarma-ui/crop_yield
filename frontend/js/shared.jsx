/* CropAI — shared small components. Exported to window. */
(function () {
  const { useState, useEffect, useRef } = React;
  const c = React.createElement;

  // Animated count-up number (rAF for smoothness + timer fallback so the final value always lands)
  function CountUp({ value, dur = 1100, fmt, decimals = 0, suffix = "", prefix = "" }) {
    const [v, setV] = useState(0);
    const raf = useRef();
    useEffect(() => {
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setV(value * e);
        if (p < 1) raf.current = requestAnimationFrame(tick);
        else setV(value);
      };
      raf.current = requestAnimationFrame(tick);
      const done = setTimeout(() => setV(value), dur + 80);
      return () => { cancelAnimationFrame(raf.current); clearTimeout(done); };
    }, [value]);
    let out;
    if (fmt) out = fmt(Math.round(v));
    else out = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US");
    return c("span", { className: "tnum" }, prefix + out + suffix);
  }

  // Stagger reveal wrapper — JS-driven so the resolved (visible) state lives in the DOM
  function Reveal({ i = 0, children, style, className = "", as = "div", ...rest }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
      const t = setTimeout(() => setShow(true), Math.min(i * 55, 600));
      return () => clearTimeout(t);
    }, []);
    return c(as, {
      className,
      style: {
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(14px)",
        transition: "opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)",
        ...style,
      }, ...rest,
    }, children);
  }

  function SectionHead({ crumb, title, sub, right }) {
    return c("div", { className: "section-head" },
      c("div", { className: "head-row" },
        c("div", null,
          crumb && c("div", { className: "breadcrumb" }, crumb.map((x, i) =>
            c(React.Fragment, { key: i }, i > 0 && c("span", { className: "sep" }, "/"), c("span", null, x)))),
          c("h2", null, title),
          sub && c("p", null, sub)),
        right && c("div", { style: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" } }, right)));
  }

  // horizontal mini bar
  function MiniBar({ pct, color }) {
    return c("div", { className: "hbar", style: { flex: 1 } },
      c("i", { style: { width: Math.max(2, pct) + "%", background: color || undefined } }));
  }

  window.CountUp = CountUp;
  window.Reveal = Reveal;
  window.SectionHead = SectionHead;
  window.MiniBar = MiniBar;
})();
