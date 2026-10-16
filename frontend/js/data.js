/* CropAI — mock data layer. Attaches to window.DATA */
(function () {
  const REGRESSION = [
    { name: "Random Forest", r2: 0.9810, mae: 4892, rmse: 12041, desc: "Ensemble of 100 decision trees with bagging", icon: "forest", best: true },
    { name: "Decision Tree", r2: 0.9621, mae: 6357, rmse: 16889, desc: "Tree of binary feature decisions", icon: "tree" },
    { name: "Gradient Boosting", r2: 0.9412, mae: 9124, rmse: 21103, desc: "Sequential trees correcting residual errors", icon: "boost" },
    { name: "Polynomial Regression (deg=3)", r2: 0.7842, mae: 22891, rmse: 40562, desc: "Captures non-linear feature relationships", icon: "poly3" },
    { name: "Polynomial Regression (deg=2)", r2: 0.7503, mae: 24613, rmse: 43615, desc: "Quadratic feature expansion", icon: "poly2" },
    { name: "Linear Regression", r2: 0.7488, mae: 25201, rmse: 43800, desc: "Linear combination of all features", icon: "line" },
    { name: "SVR (RBF)", r2: 0.4521, mae: 38742, rmse: 64318, desc: "Support Vector Regression with RBF kernel", icon: "svr" },
    { name: "Baseline (mean)", r2: 0.0000, mae: 56892, rmse: 87143, desc: "Always predicts the training mean", icon: "base", baseline: true },
  ];

  const CLASSIFIERS = [
    { name: "Random Forest Classifier", acc: 0.9743, prec: 0.9701, rec: 0.9688, desc: "Ensemble vote of 100 decision trees", icon: "forest", best: true },
    { name: "K-Nearest Neighbors (k=5)", acc: 0.9412, prec: 0.9298, rec: 0.9355, desc: "Majority vote of 5 closest neighbours", icon: "knn" },
    { name: "Logistic Regression", acc: 0.8124, prec: 0.7945, rec: 0.7812, desc: "Sigmoid over a linear feature combination", icon: "sigmoid" },
    { name: "Naive Bayes", acc: 0.7236, prec: 0.7012, rec: 0.6889, desc: "Bayes' theorem with feature independence", icon: "bayes" },
  ];

  // Dataset preview rows
  const PREVIEW = [
    ["Albania", "Maize", 2005, 1485, 121, 16.4, 36613],
    ["Brazil", "Soybeans", 2010, 1782, 377929, 25.1, 31075],
    ["India", "Rice, paddy", 2008, 1083, 75000, 24.8, 33841],
    ["France", "Wheat", 2012, 867, 2843, 11.2, 72167],
    ["Mexico", "Maize", 2007, 752, 30050, 21.0, 30930],
    ["Japan", "Rice, paddy", 2004, 1668, 54330, 15.4, 65300],
    ["Egypt", "Potatoes", 2011, 51, 19320, 22.1, 248050],
    ["Australia", "Sorghum", 2009, 534, 27450, 21.7, 28911],
    ["Nigeria", "Cassava", 2013, 1150, 280, 27.2, 142940],
    ["Spain", "Wheat", 2006, 636, 19584, 14.9, 30419],
  ];

  // Average yield by crop (hg/ha) sorted desc
  const YIELD_BY_CROP = [
    { crop: "Cassava", val: 270000 },
    { crop: "Potatoes", val: 198000 },
    { crop: "Sweet potatoes", val: 161000 },
    { crop: "Yams", val: 102000 },
    { crop: "Plantains", val: 96000 },
    { crop: "Rice, paddy", val: 51000 },
    { crop: "Maize", val: 42000 },
    { crop: "Wheat", val: 31000 },
    { crop: "Soybeans", val: 19000 },
    { crop: "Sorghum", val: 12000 },
  ];

  // Histogram of yield (right-skewed), bins of ~25k
  const HIST = {
    labels: ["0–25k", "25–50k", "50–75k", "75–100k", "100–150k", "150–200k", "200–300k", "300k+"],
    counts: [6120, 7340, 5210, 3480, 2890, 1640, 1090, 472],
    meanBin: 2, medianBin: 1,
  };

  // Top 10 countries by avg yield
  const TOP_COUNTRIES = [
    { c: "Belgium", v: 251000 }, { c: "Netherlands", v: 243000 }, { c: "New Zealand", v: 221000 },
    { c: "Germany", v: 198000 }, { c: "Denmark", v: 191000 }, { c: "United Kingdom", v: 178000 },
    { c: "France", v: 172000 }, { c: "Egypt", v: 168000 }, { c: "United States", v: 159000 },
    { c: "Japan", v: 151000 },
  ];

  // Year-over-year mean yield trend 1990–2013
  const YOY = (function () {
    const years = []; const vals = [];
    for (let y = 1990; y <= 2013; y++) {
      years.push(y);
      const t = (y - 1990) / 23;
      vals.push(Math.round(52000 + t * 36000 + Math.sin(t * 9) * 2600));
    }
    return { years, vals };
  })();

  // 5x5 correlation matrix (Year, Rainfall, Pesticides, Temp, Yield)
  const CORR_LABELS = ["Year", "Rainfall", "Pesticides", "Temp", "Yield"];
  const CORR = [
    [1.00, -0.02, 0.21, 0.04, 0.18],
    [-0.02, 1.00, -0.08, -0.31, 0.07],
    [0.21, -0.08, 1.00, 0.05, 0.36],
    [0.04, -0.31, 0.05, 1.00, -0.12],
    [0.18, 0.07, 0.36, -0.12, 1.00],
  ];

  // Feature importance (top 15)
  const FEAT_IMP = [
    { f: "pesticides_tonnes", v: 0.34 },
    { f: "Year", v: 0.18 },
    { f: "avg_temp", v: 0.13 },
    { f: "average_rain_fall_mm", v: 0.11 },
    { f: "Item = Cassava", v: 0.061 },
    { f: "Item = Potatoes", v: 0.048 },
    { f: "Area = Egypt", v: 0.027 },
    { f: "Item = Sweet potatoes", v: 0.024 },
    { f: "Area = India", v: 0.019 },
    { f: "Area = Brazil", v: 0.016 },
    { f: "Item = Yams", v: 0.013 },
    { f: "Area = Netherlands", v: 0.011 },
    { f: "Item = Wheat", v: 0.0095 },
    { f: "Area = France", v: 0.0081 },
    { f: "Area = Japan", v: 0.0067 },
  ];

  // Confusion matrix — binary (RF classifier), test n = 5648
  const CM_BINARY = { labels: ["Below Avg", "Above Avg"], m: [[2754, 71], [74, 2749]] };
  const CM_3CLASS = { labels: ["Low", "Medium", "High"], m: [[1812, 38, 6], [44, 1693, 51], [9, 63, 1880]] };

  const COUNTRIES = ["Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia", "Denmark", "Egypt", "France", "Germany", "Greece", "India", "Indonesia", "Italy", "Japan", "Kenya", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria", "Pakistan", "Peru", "Poland", "Portugal", "Spain", "Thailand", "Turkey", "Ukraine", "United Kingdom", "United States", "Vietnam"];
  const CROPS = ["Maize", "Wheat", "Rice, paddy", "Soybeans", "Potatoes", "Sweet potatoes", "Cassava", "Yams", "Plantains and others", "Sorghum"];

  const RECENT = [
    { time: "2 min ago", country: "Albania", crop: "Maize", yield: 84230, status: "above" },
    { time: "18 min ago", country: "Brazil", crop: "Soybeans", yield: 28940, status: "below" },
    { time: "1 hr ago", country: "Netherlands", crop: "Potatoes", yield: 246800, status: "above" },
  ];

  // Historical yield for selected combo (Albania × Maize) 1990–2013
  const HIST_COMBO = (function () {
    const years = []; const vals = [];
    for (let y = 1990; y <= 2013; y++) {
      years.push(y);
      const t = (y - 1990) / 23;
      vals.push(Math.round(28000 + t * 18000 + Math.sin(t * 11) * 4200));
    }
    return { years, vals };
  })();

  const fmt = (n) => n.toLocaleString("en-US");

  window.DATA = {
    REGRESSION, CLASSIFIERS, PREVIEW, YIELD_BY_CROP, HIST, TOP_COUNTRIES, YOY,
    CORR_LABELS, CORR, FEAT_IMP, CM_BINARY, CM_3CLASS, COUNTRIES, CROPS, RECENT, HIST_COMBO, fmt,
    STATS: { records: 28242, countries: 101, crops: 10, trainMean: 77000 },
  };

  // ── Live backend hydration ──
  // Fetch real values from the Flask API on load and overwrite the defaults.
  // Components keep working from the mocks if the API isn't reachable.
  (async function hydrate() {
    const safe = async (path) => {
      try {
        const r = await fetch(path);
        if (!r.ok) return null;
        return await r.json();
      } catch (_) { return null; }
    };

    const [stats, opts, reg, clf, expl, viz] = await Promise.all([
      safe("/api/stats"),
      safe("/api/options"),
      safe("/api/models/regression"),
      safe("/api/models/classification"),
      safe("/api/exploration"),
      safe("/api/visualizations"),
    ]);

    if (stats) window.DATA.STATS = {
      ...window.DATA.STATS,
      records: stats.records, countries: stats.countries, crops: stats.crops,
      trainMean: stats.trainMean, yearMin: stats.yearMin, yearMax: stats.yearMax,
    };
    if (opts && opts.countries && opts.crops) {
      window.DATA.COUNTRIES = opts.countries;
      window.DATA.CROPS     = opts.crops;
    }
    if (Array.isArray(reg) && reg.length) window.DATA.REGRESSION   = reg;
    if (Array.isArray(clf) && clf.length) window.DATA.CLASSIFIERS  = clf;

    // Exploration page — real distribution, heatmap, top lists, preview
    if (expl) {
      if (expl.stats) window.DATA.STATS = {
        ...window.DATA.STATS,
        records: expl.stats.records, countries: expl.stats.countries,
        crops: expl.stats.crops, missing: expl.stats.missing,
        mean: expl.mean, median: expl.median,
      };
      if (expl.hist) window.DATA.HIST = { labels: expl.hist.labels, counts: expl.hist.counts, meanBin: 2, medianBin: 1 };
      if (expl.yieldByCrop)  window.DATA.YIELD_BY_CROP = expl.yieldByCrop;
      if (expl.topCountries) window.DATA.TOP_COUNTRIES = expl.topCountries;
      if (expl.yoy)          window.DATA.YOY           = expl.yoy;
      if (expl.corr)        { window.DATA.CORR = expl.corr; window.DATA.CORR_LABELS = expl.corrLabels; }
      if (expl.preview)      window.DATA.PREVIEW = expl.preview;
      if (expl.recent)       window.DATA.RECENT  = expl.recent;
    }

    // Visualizations page — real feature importance, scatter, yearly perf, KPIs
    if (viz) {
      if (Array.isArray(viz.featImportance) && viz.featImportance.length) window.DATA.FEAT_IMP = viz.featImportance;
      if (Array.isArray(viz.scatter) && viz.scatter.length)               window.DATA.SCATTER  = viz.scatter;
      if (viz.yearlyPerf && viz.yearlyPerf.years)                         window.DATA.YEARLY_PERF = viz.yearlyPerf;
      if (viz.kpis)                                                       window.DATA.KPIS = viz.kpis;
    }

    window.dispatchEvent(new CustomEvent("cropai:hydrated"));
  })();
})();
