/* CropAI — Chart.js React wrapper. window.RChart */
(function () {
  const { useRef, useEffect } = React;

  if (window.Chart) {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = "#5A6772";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(26,32,39,0.92)";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.titleFont = { weight: "600" };
    Chart.defaults.maintainAspectRatio = false;
  }

  function RChart({ type, data, options, height = 260 }) {
    const ref = useRef(null);
    const inst = useRef(null);
    useEffect(() => {
      if (!ref.current || !window.Chart) return;
      inst.current = new Chart(ref.current.getContext("2d"), {
        type, data, options: options || {},
      });
      return () => { if (inst.current) inst.current.destroy(); };
    }, []);
    return React.createElement("div", { className: "chart-box", style: { height } },
      React.createElement("canvas", { ref }));
  }

  // shared palette helpers
  RChart.green = "#4CAF50";
  RChart.greenDark = "#2E7D32";
  RChart.teal = "#00ACC1";
  RChart.blue = "#2196F3";
  RChart.grid = { color: "#EEF2F6", drawTicks: false };
  RChart.noLegend = { legend: { display: false } };

  window.RChart = RChart;
})();
