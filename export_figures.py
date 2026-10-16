"""
Run both notebooks and export every matplotlib figure to report_figures/ as PNG.
Figures are captured after each code cell (works whether or not plt.show is called).
"""
import os, sys, json, traceback
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
NB_DIR = os.path.join(HERE, "notebooks")
OUT = os.path.join(HERE, "report_figures")
os.makedirs(OUT, exist_ok=True)

# Descriptive filenames per (notebook, cell index). Unmapped figure cells fall back to generic.
NAMES = {
    "01_data_exploration.ipynb": {
        20: "01_yield_distribution",
        22: "02_avg_yield_per_crop",
        24: "03_yield_boxplots_per_crop",
        26: "04_top20_countries",
        28: "05_yield_trend_years",
        30: "06_feature_vs_target_scatter",
        32: "07_numeric_feature_distributions",
        35: "08_correlation_heatmap",
    },
    "02_ml_pipeline.ipynb": {
        16: "09_avp_linear_regression",
        19: "10_avp_polynomial_deg2",
        22: "11_avp_polynomial_deg3",
        25: "12_avp_decision_tree",
        28: "13_avp_random_forest",
        29: "14_feature_importance_rf",
        32: "15_avp_gradient_boosting",
        33: "16_feature_importance_gb",
        36: "17_avp_svr",
        43: "18_r2_comparison",
        45: "19_rmse_comparison",
        47: "20_mae_comparison",
        49: "21_actual_vs_predicted_all",
        55: "22_binary_target_distribution",
        62: "23_cm_logreg_binary",
        65: "24_cm_knn_binary",
        68: "25_cm_naivebayes_binary",
        71: "26_binary_classifiers_comparison",
        74: "27_cm_3class",
        75: "28_3class_classifiers_comparison",
    },
}


def run_notebook(nb_name, ns, skip_svr=False):
    path = os.path.join(NB_DIR, nb_name)
    nb = json.load(open(path, encoding="utf-8"))
    cells = nb["cells"]
    saved = []
    for idx, cell in enumerate(cells):
        if cell["cell_type"] != "code":
            continue
        src = "".join(cell["source"])
        # strip jupyter magics / shell lines
        src = "\n".join(l for l in src.split("\n")
                        if not l.lstrip().startswith(("%", "!")))
        if skip_svr and ("SVR(" in src or "svr" in src.lower() and "kernel" in src):
            print(f"  [skip SVR] {nb_name} cell {idx}")
            continue
        plt.close("all")
        try:
            exec(compile(src, f"{nb_name}#cell{idx}", "exec"), ns)
        except Exception:
            print(f"  ! error in {nb_name} cell {idx}:")
            traceback.print_exc()
            continue
        fignums = plt.get_fignums()
        if not fignums:
            continue
        base = NAMES.get(nb_name, {}).get(idx, f"{nb_name[:2]}_cell{idx}")
        for j, fn in enumerate(fignums):
            fig = plt.figure(fn)
            suffix = "" if len(fignums) == 1 else f"_{j+1}"
            fname = os.path.join(OUT, f"{base}{suffix}.png")
            fig.savefig(fname, dpi=150, bbox_inches="tight")
            saved.append(os.path.basename(fname))
            print(f"  saved {os.path.basename(fname)}")
        plt.close("all")
    return saved


def main():
    os.chdir(NB_DIR)  # notebooks reference ../data/...
    skip_svr = "--skip-svr" in sys.argv
    all_saved = []
    for nb in ["01_data_exploration.ipynb", "02_ml_pipeline.ipynb"]:
        print(f"\n===== running {nb} =====")
        ns = {"__name__": "__main__"}
        all_saved += run_notebook(nb, ns, skip_svr=skip_svr)
    print(f"\nDONE — {len(all_saved)} figures written to report_figures/")


if __name__ == "__main__":
    main()
