import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import streamlit as st

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, PolynomialFeatures
from sklearn.compose import ColumnTransformer

from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB

from sklearn.metrics import (r2_score, mean_absolute_error, mean_squared_error,
                              confusion_matrix, accuracy_score,
                              precision_score, recall_score)

# ─────────────────────────────────────────────
# PAGE CONFIGURATION
# ─────────────────────────────────────────────
st.set_page_config(page_title="Crop Yield — Decision Support", layout="wide")

st.title("Smart Agriculture — Crop Yield Prediction")
st.markdown("**Decision Support System using Regression & Classification Models**")
st.markdown("---")

# ─────────────────────────────────────────────
# SIDEBAR NAVIGATION
# ─────────────────────────────────────────────
st.sidebar.title("Navigation")
section = st.sidebar.radio("Go to", [
    "1 - Upload Dataset",
    "2 - Data Exploration",
    "3 - Preprocessing",
    "4 - Model Training",
    "5 - Benchmark Results",
    "6 - Visualizations",
    "7 - Best Model & Recommendation",
    "8 - Make a Prediction",
    "9 - Classification",
    "10 - Classification Results",
])

# ─────────────────────────────────────────────
# SESSION STATE
# ─────────────────────────────────────────────
for key in ['data', 'results', 'models', 'ct', 'sc',
            'x_test', 'y_test', 'n_ohe_cols',
            'best_model_name', 'y_train_mean', 'target_col', 'feat_cols',
            'poly_features',
            'clf_results', 'clf_models', 'clf_ct', 'clf_sc',
            'clf_x_test', 'clf_y_test', 'clf_best',
            'clf_target_type', 'clf_feat_cols', 'clf_n_ohe_cols']:
    if key not in st.session_state:
        st.session_state[key] = None


# ══════════════════════════════════════════════
# SECTION 1 — UPLOAD DATASET
# ══════════════════════════════════════════════
if section == "1 - Upload Dataset":
    st.header("1 - Upload Dataset")
    st.markdown(
        "Upload your dataset in **CSV** or **Excel** format. "
        "If no file is uploaded the default dataset **yield_df.csv** is used."
    )

    uploaded_file = st.file_uploader("Choose a CSV or Excel file", type=["csv", "xlsx", "xls"])

    if uploaded_file is not None:
        if uploaded_file.name.endswith(".csv"):
            data = pd.read_csv(uploaded_file)
        else:
            data = pd.read_excel(uploaded_file)
        if 'Unnamed: 0' in data.columns:
            data = data.drop(columns=['Unnamed: 0'])
        st.session_state.data = data
        st.success(f"File loaded: {uploaded_file.name}")
    else:
        st.info("No file uploaded — using default dataset: **yield_df.csv**")
        data = pd.read_csv("data/yield_df.csv")
        if 'Unnamed: 0' in data.columns:
            data = data.drop(columns=['Unnamed: 0'])
        st.session_state.data = data

    data = st.session_state.data
    st.markdown(f"**Shape:** {data.shape[0]:,} rows × {data.shape[1]} columns")
    st.dataframe(data.head(10))


# ══════════════════════════════════════════════
# SECTION 2 — DATA EXPLORATION
# ══════════════════════════════════════════════
elif section == "2 - Data Exploration":
    st.header("2 - Data Exploration")

    if st.session_state.data is None:
        st.warning("Please go to Section 1 first.")
        st.stop()

    data = st.session_state.data

    st.subheader("2.1 - Shape")
    c1, c2 = st.columns(2)
    c1.metric("Rows",    f"{data.shape[0]:,}")
    c2.metric("Columns", data.shape[1])

    st.subheader("2.2 - Data Types")
    st.dataframe(pd.DataFrame({
        "Column":         data.columns,
        "Type":           data.dtypes.values,
        "Non-Null Count": data.notnull().sum().values
    }))

    st.subheader("2.3 - Statistical Summary")
    st.dataframe(data.describe())

    st.subheader("2.4 - Missing Values")
    if data.isnull().sum().sum() == 0:
        st.success("No missing values detected.")
    else:
        st.warning("Missing values detected:")
        st.dataframe(data.isnull().sum()[data.isnull().sum() > 0].rename("Missing Count"))

    st.subheader("2.5 - Categorical Columns — Unique Values")
    cat_cols = data.select_dtypes(include='object').columns.tolist()
    if cat_cols:
        for col in cat_cols:
            st.markdown(f"**{col}** — {data[col].nunique()} unique values")
            st.write(sorted(data[col].unique().tolist())[:20])
    else:
        st.info("No categorical columns found.")

    st.subheader("2.6 - Target Variable Distribution")
    if 'hg/ha_yield' in data.columns:
        target_col = 'hg/ha_yield'
    else:
        target_col = data.select_dtypes(include=[np.number]).columns[-1]
    st.markdown(f"Target column: **{target_col}**")

    fig, ax = plt.subplots(figsize=(8, 3))
    ax.hist(data[target_col], bins=50, color='steelblue', edgecolor='black')
    ax.set_title(f'Distribution of {target_col}')
    ax.set_xlabel(target_col)
    ax.set_ylabel('Frequency')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()


# ══════════════════════════════════════════════
# SECTION 3 — PREPROCESSING
# ══════════════════════════════════════════════
elif section == "3 - Preprocessing":
    st.header("3 - Preprocessing")

    if st.session_state.data is None:
        st.warning("Please go to Section 1 first.")
        st.stop()

    data = st.session_state.data

    if 'hg/ha_yield' in data.columns:
        target_col = 'hg/ha_yield'
    else:
        target_col = data.select_dtypes(include=[np.number]).columns[-1]

    cat_cols  = data.select_dtypes(include='object').columns.tolist()
    feat_cols = [c for c in data.columns if c != target_col]
    num_feat  = [c for c in feat_cols if c not in cat_cols]

    st.subheader("3.1 - Column Identification")
    st.markdown(f"**Target column**: `{target_col}`")
    st.markdown(f"**Categorical features** (OneHotEncoded): `{cat_cols}`")
    st.markdown(f"**Numerical features**  (StandardScaled): `{num_feat}`")

    st.subheader("3.2 - Missing Values")
    if data.isnull().sum().sum() == 0:
        st.success("No missing values — no imputation needed.")
    else:
        st.warning(f"{data.isnull().sum().sum()} missing values detected.")

    st.subheader("3.3 - Encoding Strategy")
    st.markdown(
        "Categorical columns are encoded using **OneHotEncoder** via **ColumnTransformer**."
    )
    for col in cat_cols:
        st.markdown(f"- **{col}**: {data[col].nunique()} categories → {data[col].nunique()} binary columns")

    st.subheader("3.4 - Feature Scaling")
    st.markdown("Numerical features are standardized with **StandardScaler** (fit on train only):")
    st.latex(r"x_{stand} = \frac{x - mean(x)}{std(x)}")
    st.markdown("OHE columns are **not scaled** (already 0/1 binary values).")

    st.subheader("3.5 - Train / Test Split")
    st.markdown("80% training — 20% test — `random_state=0`")
    c1, c2 = st.columns(2)
    c1.metric("Training samples", f"{int(len(data)*0.8):,}")
    c2.metric("Test samples",     f"{int(len(data)*0.2):,}")

    st.success("Preprocessing plan is ready. Proceed to Section 4 to train the models.")


# ══════════════════════════════════════════════
# SECTION 4 — MODEL TRAINING
# ══════════════════════════════════════════════
elif section == "4 - Model Training":
    st.header("4 - Model Training")

    if st.session_state.data is None:
        st.warning("Please go to Section 1 first.")
        st.stop()

    data = st.session_state.data

    st.subheader("4.1 - Select Target Variable")
    numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
    default_idx  = numeric_cols.index('hg/ha_yield') if 'hg/ha_yield' in numeric_cols else 0
    target_col   = st.selectbox("Target column (what to predict)", numeric_cols, index=default_idx)

    st.subheader("4.2 - Select Regression Models to Train")
    use_lr   = st.checkbox("Linear Regression",                          value=True)
    use_poly = st.checkbox("Polynomial Regression",                      value=False)
    use_dt   = st.checkbox("Decision Tree Regressor",                    value=True)
    use_rf   = st.checkbox("Random Forest Regressor",                    value=True)
    use_gb   = st.checkbox("Gradient Boosting Regressor",                value=True)
    use_svr  = st.checkbox("Support Vector Regression (SVR)",            value=False)

    poly_degree = 2
    if use_poly:
        poly_degree = st.slider("Polynomial degree", 2, 4, 2)
        st.info(
            f"PolynomialFeatures (degree={poly_degree}) will be applied to the **numerical columns only** "
            "(Year, rainfall, pesticides, temperature) to capture non-linear relationships."
        )
    if use_svr:
        st.warning("SVR with RBF kernel may take several minutes on large datasets (28k+ rows).")

    st.subheader("4.3 - Train / Test Split Parameters")
    test_size    = st.slider("Test size", 0.1, 0.4, 0.2, 0.05)
    random_state = st.number_input("Random state", value=0, step=1, format="%d")

    if st.button("Train Models"):

        x_df      = data.drop(columns=[target_col])
        feat_cols = x_df.columns.tolist()
        y         = data[target_col].values

        cat_cols    = x_df.select_dtypes(include='object').columns.tolist()
        cat_indices = [x_df.columns.get_loc(c) for c in cat_cols]

        ct = ColumnTransformer(
            transformers=[('encoder', OneHotEncoder(handle_unknown='ignore'), cat_indices)],
            remainder='passthrough'
        )
        x = ct.fit_transform(x_df)
        if hasattr(x, 'toarray'):
            x = x.toarray()
        x = x.astype(float)

        n_ohe_cols = len(ct.named_transformers_['encoder'].get_feature_names_out())

        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=test_size, random_state=int(random_state)
        )

        sc = StandardScaler()
        x_train[:, n_ohe_cols:] = sc.fit_transform(x_train[:, n_ohe_cols:])
        x_test[:, n_ohe_cols:]  = sc.transform(x_test[:, n_ohe_cols:])

        # ── Standard models (use same x_train / x_test) ──
        models_to_train = {}
        if use_lr:  models_to_train['Linear Regression']    = LinearRegression()
        if use_dt:  models_to_train['Decision Tree']        = DecisionTreeRegressor(random_state=0)
        if use_rf:  models_to_train['Random Forest']        = RandomForestRegressor(n_estimators=100, random_state=0)
        if use_gb:  models_to_train['Gradient Boosting']    = GradientBoostingRegressor(random_state=0)
        if use_svr: models_to_train['SVR (RBF)']            = SVR(kernel='rbf')

        results          = {}
        trained_models   = {}
        poly_features_dict = {}

        total_steps = len(models_to_train) + (1 if use_poly else 0)
        progress    = st.progress(0)
        step        = 0

        for name, model in models_to_train.items():
            with st.spinner(f"Training {name}..."):
                model.fit(x_train, y_train)
                y_pred = model.predict(x_test)
                results[name] = {
                    'R2'  : r2_score(y_test, y_pred),
                    'MAE' : mean_absolute_error(y_test, y_pred),
                    'MSE' : mean_squared_error(y_test, y_pred),
                    'RMSE': np.sqrt(mean_squared_error(y_test, y_pred))
                }
                trained_models[name] = model
            step += 1
            progress.progress(step / total_steps)

        # ── Polynomial Regression (separate X matrices) ──
        if use_poly:
            poly_name = f'Polynomial Regression (deg={poly_degree})'
            with st.spinner(f"Training {poly_name}..."):
                pf = PolynomialFeatures(degree=poly_degree, include_bias=False)
                x_num_train_poly = pf.fit_transform(x_train[:, n_ohe_cols:])
                x_num_test_poly  = pf.transform(x_test[:, n_ohe_cols:])
                x_train_poly = np.concatenate([x_train[:, :n_ohe_cols], x_num_train_poly], axis=1)
                x_test_poly  = np.concatenate([x_test[:, :n_ohe_cols],  x_num_test_poly],  axis=1)

                poly_lr = LinearRegression()
                poly_lr.fit(x_train_poly, y_train)
                y_pred_poly = poly_lr.predict(x_test_poly)
                results[poly_name] = {
                    'R2'  : r2_score(y_test, y_pred_poly),
                    'MAE' : mean_absolute_error(y_test, y_pred_poly),
                    'MSE' : mean_squared_error(y_test, y_pred_poly),
                    'RMSE': np.sqrt(mean_squared_error(y_test, y_pred_poly))
                }
                trained_models[poly_name]    = poly_lr
                poly_features_dict[poly_name] = pf
            step += 1
            progress.progress(step / total_steps)

        # ── Baseline ──
        y_baseline = np.full_like(y_test, fill_value=np.mean(y_train), dtype=float)
        results['Baseline (mean)'] = {
            'R2'  : r2_score(y_test, y_baseline),
            'MAE' : mean_absolute_error(y_test, y_baseline),
            'MSE' : mean_squared_error(y_test, y_baseline),
            'RMSE': np.sqrt(mean_squared_error(y_test, y_baseline))
        }

        best_model_name = max(
            [m for m in results if m != 'Baseline (mean)'],
            key=lambda m: results[m]['R2']
        )

        st.session_state.results         = results
        st.session_state.models          = trained_models
        st.session_state.ct              = ct
        st.session_state.sc              = sc
        st.session_state.x_test          = x_test
        st.session_state.y_test          = y_test
        st.session_state.n_ohe_cols      = n_ohe_cols
        st.session_state.best_model_name = best_model_name
        st.session_state.y_train_mean    = float(np.mean(y_train))
        st.session_state.target_col      = target_col
        st.session_state.feat_cols       = feat_cols
        st.session_state.poly_features   = poly_features_dict

        st.success(
            f"Training complete. Best model: **{best_model_name}** "
            f"(R² = {results[best_model_name]['R2']:.4f})"
        )


# ══════════════════════════════════════════════
# SECTION 5 — BENCHMARK RESULTS
# ══════════════════════════════════════════════
elif section == "5 - Benchmark Results":
    st.header("5 - Benchmark Results")

    if st.session_state.results is None:
        st.warning("Please train the models in Section 4 first.")
        st.stop()

    results = st.session_state.results
    best    = st.session_state.best_model_name

    df_results           = pd.DataFrame(results).T.reset_index()
    df_results.columns   = ['Model', 'R²', 'MAE', 'MSE', 'RMSE']
    df_results['R²']     = df_results['R²'].round(4)
    df_results['MAE']    = df_results['MAE'].round(2)
    df_results['MSE']    = df_results['MSE'].round(2)
    df_results['RMSE']   = df_results['RMSE'].round(2)

    def highlight_best(row):
        if row['Model'] == best:
            return ['background-color: #d4edda'] * len(row)
        if row['Model'] == 'Baseline (mean)':
            return ['background-color: #f5f5f5'] * len(row)
        return [''] * len(row)

    st.subheader("Full Benchmark Table")
    st.dataframe(df_results.style.apply(highlight_best, axis=1))
    st.markdown(f"Best model (green): **{best}**")

    st.subheader("Best Model — Key Metrics")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("R²",   f"{results[best]['R2']:.4f}")
    c2.metric("MAE",  f"{results[best]['MAE']:,.0f}")
    c3.metric("MSE",  f"{results[best]['MSE']:,.0f}")
    c4.metric("RMSE", f"{results[best]['RMSE']:,.0f}")


# ══════════════════════════════════════════════
# SECTION 6 — VISUALIZATIONS
# ══════════════════════════════════════════════
elif section == "6 - Visualizations":
    st.header("6 - Visualizations")

    if st.session_state.results is None:
        st.warning("Please train the models in Section 4 first.")
        st.stop()

    results     = st.session_state.results
    models      = st.session_state.models
    x_test      = st.session_state.x_test
    y_test      = st.session_state.y_test
    best        = st.session_state.best_model_name
    n_ohe_cols  = st.session_state.n_ohe_cols
    poly_features_dict = st.session_state.poly_features or {}
    model_names = list(results.keys())
    target_col  = st.session_state.target_col

    # 6.1 R² bar chart
    st.subheader("6.1 - R² Score Comparison")
    r2_scores = [results[m]['R2'] for m in model_names]
    colors    = ['steelblue' if m != 'Baseline (mean)' else 'lightgrey' for m in model_names]

    fig, ax = plt.subplots(figsize=(10, 4))
    bars = ax.bar(model_names, r2_scores, color=colors, edgecolor='black')
    for bar, val in zip(bars, r2_scores):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                f'{val:.4f}', ha='center', va='bottom', fontsize=8)
    ax.set_title('R² Score — Model Comparison')
    ax.set_xlabel('Model')
    ax.set_ylabel('R² Score')
    ax.set_ylim(0, 1.15)
    plt.xticks(rotation=20, ha='right')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    # 6.2 RMSE bar chart
    st.subheader("6.2 - RMSE Comparison (lower is better)")
    rmse_scores = [results[m]['RMSE'] for m in model_names]
    colors_r    = ['tomato' if m != 'Baseline (mean)' else 'lightgrey' for m in model_names]

    fig, ax = plt.subplots(figsize=(10, 4))
    bars = ax.bar(model_names, rmse_scores, color=colors_r, edgecolor='black')
    for bar, val in zip(bars, rmse_scores):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 200,
                f'{val:,.0f}', ha='center', va='bottom', fontsize=8)
    ax.set_title('RMSE — Model Comparison')
    ax.set_xlabel('Model')
    ax.set_ylabel(f'RMSE ({target_col})')
    plt.xticks(rotation=20, ha='right')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    # 6.3 Actual vs Predicted (best model)
    st.subheader(f"6.3 - Actual vs Predicted — {best}")
    if best in poly_features_dict:
        pf = poly_features_dict[best]
        x_ohe  = x_test[:, :n_ohe_cols]
        x_poly = pf.transform(x_test[:, n_ohe_cols:])
        x_best = np.concatenate([x_ohe, x_poly], axis=1)
    else:
        x_best = x_test
    y_pred_best = models[best].predict(x_best)

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(y_test, y_pred_best, alpha=0.3, color='steelblue', s=5)
    ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=1.5)
    ax.set_title(f'Actual vs Predicted — {best}')
    ax.set_xlabel(f'Actual {target_col}')
    ax.set_ylabel(f'Predicted {target_col}')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    # 6.4 MAE bar chart
    st.subheader("6.4 - MAE Comparison (lower is better)")
    mae_scores = [results[m]['MAE'] for m in model_names]
    colors_m   = ['seagreen' if m != 'Baseline (mean)' else 'lightgrey' for m in model_names]

    fig, ax = plt.subplots(figsize=(10, 4))
    bars = ax.bar(model_names, mae_scores, color=colors_m, edgecolor='black')
    for bar, val in zip(bars, mae_scores):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 200,
                f'{val:,.0f}', ha='center', va='bottom', fontsize=8)
    ax.set_title('MAE — Model Comparison')
    ax.set_xlabel('Model')
    ax.set_ylabel(f'MAE ({target_col})')
    plt.xticks(rotation=20, ha='right')
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()


# ══════════════════════════════════════════════
# SECTION 7 — BEST MODEL & RECOMMENDATION
# ══════════════════════════════════════════════
elif section == "7 - Best Model & Recommendation":
    st.header("7 - Best Model & Recommendation")

    if st.session_state.results is None:
        st.warning("Please train the models in Section 4 first.")
        st.stop()

    results    = st.session_state.results
    best       = st.session_state.best_model_name
    r2         = results[best]['R2']
    mae        = results[best]['MAE']
    rmse       = results[best]['RMSE']
    target_col = st.session_state.target_col

    st.subheader("7.1 - Recommended Model")
    st.success(f"Best model: **{best}**")
    c1, c2, c3 = st.columns(3)
    c1.metric("R²",   f"{r2:.4f}")
    c2.metric("MAE",  f"{mae:,.0f}")
    c3.metric("RMSE", f"{rmse:,.0f}")

    st.subheader("7.2 - Performance Interpretation")
    if r2 > 0.9:
        st.success(f"R² = {r2:.4f} → **Excellent** — the model explains {r2*100:.1f}% of the variance in {target_col}.")
    elif r2 > 0.7:
        st.info(f"R² = {r2:.4f} → **Good** — the model explains {r2*100:.1f}% of the variance in {target_col}.")
    elif r2 > 0.0:
        st.warning(f"R² = {r2:.4f} → **Average** — only {r2*100:.1f}% of variance explained.")
    else:
        st.error(f"R² = {r2:.4f} → **Poor** — model performs worse than predicting the mean.")

    st.subheader("7.3 - Baseline Comparison")
    b_r2   = results['Baseline (mean)']['R2']
    b_mae  = results['Baseline (mean)']['MAE']
    b_rmse = results['Baseline (mean)']['RMSE']

    c1, c2, c3 = st.columns(3)
    c1.metric("R² gain vs Baseline",  f"+{(r2 - b_r2)*100:.1f} pts")
    c2.metric("MAE reduction",        f"-{(1 - mae/b_mae)*100:.1f}%")
    c3.metric("RMSE reduction",       f"-{(1 - rmse/b_rmse)*100:.1f}%")

    st.subheader("7.4 - Agricultural Decision Support")
    st.markdown(f"""
The **{best}** model is recommended for crop yield prediction.

**What the results mean:**
- Average prediction error of **{mae:,.0f} hg/ha** ({mae/10000:.2f} tonnes/ha)
  gives farmers reliable estimates for harvest planning.
- The model captures **{r2*100:.1f}%** of crop yield variation across countries and crops.

**Practical applications:**
- **Production estimation** — forecast harvest volume before the growing season
- **Risk analysis** — identify climate conditions likely to produce below-average yields
- **Resource planning** — optimise pesticide and irrigation investment
- **Policy support** — help governments plan food security based on climate projections
    """)


# ══════════════════════════════════════════════
# SECTION 8 — MAKE A PREDICTION
# ══════════════════════════════════════════════
elif section == "8 - Make a Prediction":
    st.header("8 - Make a Prediction")
    st.markdown("Use the best trained model to predict crop yield for a custom scenario.")

    if st.session_state.models is None:
        st.warning("Please train the models in Section 4 first.")
        st.stop()

    data               = st.session_state.data
    ct                 = st.session_state.ct
    sc                 = st.session_state.sc
    models             = st.session_state.models
    best               = st.session_state.best_model_name
    n_ohe_cols         = st.session_state.n_ohe_cols
    y_train_mean       = st.session_state.y_train_mean
    target_col         = st.session_state.target_col
    feat_cols          = st.session_state.feat_cols
    poly_features_dict = st.session_state.poly_features or {}

    st.markdown(f"Model in use: **{best}**")

    c1, c2 = st.columns(2)
    with c1:
        area      = st.selectbox("Country (Area)", sorted(data['Area'].unique()))
        item      = st.selectbox("Crop (Item)",    sorted(data['Item'].unique()))
        year      = st.number_input("Year", min_value=1990, max_value=2030, value=2010, step=1)
    with c2:
        rainfall   = st.number_input("Average Rainfall (mm/year)",  0.0, 5000.0, 1000.0, 10.0)
        pesticides = st.number_input("Pesticides (tonnes)",          0.0, 500000.0, 100.0, 10.0)
        avg_temp   = st.number_input("Average Temperature (°C)",    -10.0, 50.0, 20.0, 0.1)

    if st.button("Predict Yield"):
        raw = {
            'Area'                          : [area],
            'Item'                          : [item],
            'Year'                          : [int(year)],
            'average_rain_fall_mm_per_year' : [float(rainfall)],
            'pesticides_tonnes'             : [float(pesticides)],
            'avg_temp'                      : [float(avg_temp)]
        }
        sample_df = pd.DataFrame(raw)[feat_cols]

        sample_encoded = ct.transform(sample_df)
        if hasattr(sample_encoded, 'toarray'):
            sample_encoded = sample_encoded.toarray()
        sample_encoded = sample_encoded.astype(float)
        sample_encoded[:, n_ohe_cols:] = sc.transform(sample_encoded[:, n_ohe_cols:])

        # Apply PolynomialFeatures if the best model is a polynomial model
        if best in poly_features_dict:
            pf = poly_features_dict[best]
            sample_ohe  = sample_encoded[:, :n_ohe_cols]
            sample_poly = pf.transform(sample_encoded[:, n_ohe_cols:])
            sample_final = np.concatenate([sample_ohe, sample_poly], axis=1)
        else:
            sample_final = sample_encoded

        prediction = models[best].predict(sample_final)[0]
        avg_yield  = y_train_mean

        st.markdown("---")
        st.subheader("Prediction Result")
        c1, c2 = st.columns(2)
        c1.metric("Predicted Yield", f"{prediction:,.0f} hg/ha")
        c2.metric("Equivalent",      f"{prediction/10000:.2f} tonnes/ha")

        st.subheader("Decision Support Interpretation")
        if prediction > avg_yield:
            diff = ((prediction - avg_yield) / avg_yield) * 100
            st.success(
                f"Predicted yield **{prediction:,.0f} hg/ha** is "
                f"**{diff:.1f}% ABOVE** the average ({avg_yield:,.0f} hg/ha). "
                f"Conditions appear favourable for **{item}** in **{area}**."
            )
        else:
            diff = ((avg_yield - prediction) / avg_yield) * 100
            st.warning(
                f"Predicted yield **{prediction:,.0f} hg/ha** is "
                f"**{diff:.1f}% BELOW** the average ({avg_yield:,.0f} hg/ha). "
                f"Consider reviewing rainfall, temperature, or pesticide conditions."
            )

        st.markdown("---")
        st.markdown("**Input Summary**")
        st.dataframe(pd.DataFrame({
            'Parameter': ['Country', 'Crop', 'Year', 'Rainfall (mm/yr)', 'Pesticides (t)', 'Avg Temp (°C)'],
            'Value':     [area, item, year, rainfall, pesticides, avg_temp]
        }))


# ══════════════════════════════════════════════
# SECTION 9 — CLASSIFICATION
# ══════════════════════════════════════════════
elif section == "9 - Classification":
    st.header("9 - Classification")
    st.markdown("""
Classification converts the **continuous crop yield** into **discrete categories** and trains
classifiers to predict which yield band a given scenario falls into.

**Models used** (from course TPs):
- Logistic Regression
- K-Nearest Neighbors (KNN)
- Naive Bayes (GaussianNB)
    """)

    if st.session_state.data is None:
        st.warning("Please go to Section 1 first.")
        st.stop()

    data = st.session_state.data

    if 'hg/ha_yield' in data.columns:
        target_col = 'hg/ha_yield'
    else:
        target_col = data.select_dtypes(include=[np.number]).columns[-1]

    # 9.1 Classification target
    st.subheader("9.1 - Define Classification Target")
    target_type = st.radio("Choose classification type", [
        "Binary — Above / Below Average Yield",
        "3-Class — Low / Medium / High Yield"
    ])

    if target_type == "Binary — Above / Below Average Yield":
        threshold = data[target_col].mean()
        y_cls     = (data[target_col] >= threshold).astype(int)
        class_names = ["Below Average (0)", "Above Average (1)"]
        st.markdown(f"Threshold (mean): **{threshold:,.0f} hg/ha**")
    else:
        q33 = data[target_col].quantile(0.33)
        q67 = data[target_col].quantile(0.67)
        y_cls = pd.cut(
            data[target_col],
            bins=[-np.inf, q33, q67, np.inf],
            labels=[0, 1, 2]
        ).astype(int)
        class_names = ["Low (0)", "Medium (1)", "High (2)"]
        st.markdown(
            f"Low: < {q33:,.0f} | Medium: {q33:,.0f} – {q67:,.0f} | High: > {q67:,.0f} hg/ha"
        )

    # 9.2 Class distribution
    st.subheader("9.2 - Class Distribution")
    counts = pd.Series(y_cls).value_counts().sort_index()
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.bar(
        [class_names[i] for i in counts.index],
        counts.values,
        color='steelblue', edgecolor='black'
    )
    for i, (idx, val) in enumerate(counts.items()):
        ax.text(i, val + 30, str(val), ha='center', va='bottom', fontsize=9)
    ax.set_title("Class Distribution")
    ax.set_ylabel("Count")
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    # 9.3 Model selection
    st.subheader("9.3 - Select Classification Models")
    use_logr = st.checkbox("Logistic Regression",        value=True)
    use_knn  = st.checkbox("K-Nearest Neighbors (KNN)",  value=True)
    use_nb   = st.checkbox("Naive Bayes (GaussianNB)",   value=True)

    k_neighbors = 5
    if use_knn:
        k_neighbors = st.slider("K — number of neighbors", 1, 15, 5, 2)

    # 9.4 Split parameters
    st.subheader("9.4 - Train / Test Split Parameters")
    test_size_clf    = st.slider("Test size (classification)", 0.1, 0.4, 0.25, 0.05)
    random_state_clf = st.number_input("Random state (classification)", value=0, step=1, format="%d")

    if st.button("Train Classifiers"):
        if not (use_logr or use_knn or use_nb):
            st.error("Select at least one classifier.")
            st.stop()

        x_df          = data.drop(columns=[target_col])
        feat_cols_clf = x_df.columns.tolist()
        y_arr         = y_cls.values if hasattr(y_cls, 'values') else np.array(y_cls)

        cat_cols    = x_df.select_dtypes(include='object').columns.tolist()
        cat_indices = [x_df.columns.get_loc(c) for c in cat_cols]

        ct_clf = ColumnTransformer(
            transformers=[('encoder', OneHotEncoder(handle_unknown='ignore'), cat_indices)],
            remainder='passthrough'
        )
        x_enc = ct_clf.fit_transform(x_df)
        if hasattr(x_enc, 'toarray'):
            x_enc = x_enc.toarray()
        x_enc = x_enc.astype(float)

        n_ohe_clf = len(ct_clf.named_transformers_['encoder'].get_feature_names_out())

        x_train_c, x_test_c, y_train_c, y_test_c = train_test_split(
            x_enc, y_arr,
            test_size=test_size_clf,
            random_state=int(random_state_clf)
        )

        sc_clf = StandardScaler()
        x_train_c[:, n_ohe_clf:] = sc_clf.fit_transform(x_train_c[:, n_ohe_clf:])
        x_test_c[:, n_ohe_clf:]  = sc_clf.transform(x_test_c[:, n_ohe_clf:])

        clf_to_train = {}
        if use_logr: clf_to_train['Logistic Regression']     = LogisticRegression(max_iter=1000, random_state=0)
        if use_knn:  clf_to_train[f'KNN (k={k_neighbors})']  = KNeighborsClassifier(n_neighbors=k_neighbors, metric='minkowski', p=2)
        if use_nb:   clf_to_train['Naive Bayes']              = GaussianNB()

        avg_type   = 'binary' if target_type.startswith("Binary") else 'weighted'
        clf_results = {}
        trained_clf = {}
        progress_c  = st.progress(0)

        for i, (name, clf) in enumerate(clf_to_train.items()):
            with st.spinner(f"Training {name}..."):
                clf.fit(x_train_c, y_train_c)
                y_pred_c = clf.predict(x_test_c)
                clf_results[name] = {
                    'Accuracy' : accuracy_score(y_test_c, y_pred_c),
                    'Precision': precision_score(y_test_c, y_pred_c, average=avg_type, zero_division=0),
                    'Recall'   : recall_score(y_test_c, y_pred_c, average=avg_type, zero_division=0),
                    'CM'       : confusion_matrix(y_test_c, y_pred_c)
                }
                trained_clf[name] = clf
            progress_c.progress((i + 1) / len(clf_to_train))

        best_clf = max(clf_results, key=lambda m: clf_results[m]['Accuracy'])

        st.session_state.clf_results     = clf_results
        st.session_state.clf_models      = trained_clf
        st.session_state.clf_ct          = ct_clf
        st.session_state.clf_sc          = sc_clf
        st.session_state.clf_x_test      = x_test_c
        st.session_state.clf_y_test      = y_test_c
        st.session_state.clf_best        = best_clf
        st.session_state.clf_target_type = target_type
        st.session_state.clf_feat_cols   = feat_cols_clf
        st.session_state.clf_n_ohe_cols  = n_ohe_clf

        st.success(
            f"Training complete. Best classifier: **{best_clf}** "
            f"(Accuracy = {clf_results[best_clf]['Accuracy']:.4f})"
        )


# ══════════════════════════════════════════════
# SECTION 10 — CLASSIFICATION RESULTS
# ══════════════════════════════════════════════
elif section == "10 - Classification Results":
    st.header("10 - Classification Results")

    if st.session_state.clf_results is None:
        st.warning("Please train the classifiers in Section 9 first.")
        st.stop()

    clf_results  = st.session_state.clf_results
    best_clf     = st.session_state.clf_best
    target_type  = st.session_state.clf_target_type
    data         = st.session_state.data
    clf_models   = st.session_state.clf_models
    ct_clf       = st.session_state.clf_ct
    sc_clf       = st.session_state.clf_sc
    feat_cols_clf= st.session_state.clf_feat_cols
    n_ohe_clf    = st.session_state.clf_n_ohe_cols

    if 'hg/ha_yield' in data.columns:
        target_col = 'hg/ha_yield'
    else:
        target_col = data.select_dtypes(include=[np.number]).columns[-1]

    is_binary = target_type.startswith("Binary")
    class_names = (["Below Average", "Above Average"] if is_binary
                   else ["Low", "Medium", "High"])

    # 10.1 Benchmark table
    st.subheader("10.1 - Benchmark Table")
    df_clf = pd.DataFrame({
        'Model'    : list(clf_results.keys()),
        'Accuracy' : [round(clf_results[m]['Accuracy'],  4) for m in clf_results],
        'Precision': [round(clf_results[m]['Precision'], 4) for m in clf_results],
        'Recall'   : [round(clf_results[m]['Recall'],    4) for m in clf_results],
    })

    def highlight_clf(row):
        if row['Model'] == best_clf:
            return ['background-color: #d4edda'] * len(row)
        return [''] * len(row)

    st.dataframe(df_clf.style.apply(highlight_clf, axis=1))
    st.markdown(f"Best classifier (green): **{best_clf}**")

    # 10.2 Key metrics for best classifier
    st.subheader("10.2 - Best Classifier Metrics")
    c1, c2, c3 = st.columns(3)
    c1.metric("Accuracy",  f"{clf_results[best_clf]['Accuracy']:.4f}")
    c2.metric("Precision", f"{clf_results[best_clf]['Precision']:.4f}")
    c3.metric("Recall",    f"{clf_results[best_clf]['Recall']:.4f}")

    # 10.3 Accuracy bar chart
    st.subheader("10.3 - Accuracy Comparison")
    clf_names  = list(clf_results.keys())
    accuracies = [clf_results[m]['Accuracy'] for m in clf_names]

    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.bar(clf_names, accuracies, color='steelblue', edgecolor='black')
    for bar, val in zip(bars, accuracies):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.003,
                f'{val:.4f}', ha='center', va='bottom', fontsize=9)
    ax.set_ylim(0, 1.1)
    ax.set_title("Accuracy — Classifier Comparison")
    ax.set_ylabel("Accuracy")
    plt.tight_layout()
    st.pyplot(fig)
    plt.close()

    # 10.4 Confusion matrices
    st.subheader("10.4 - Confusion Matrices")
    clf_cols = st.columns(len(clf_results))
    for col, (name, metrics) in zip(clf_cols, clf_results.items()):
        with col:
            cm  = metrics['CM']
            fig, ax = plt.subplots(figsize=(4, 3))
            im  = ax.imshow(cm, cmap='Blues')
            plt.colorbar(im, ax=ax)
            ax.set_xticks(range(cm.shape[1]))
            ax.set_yticks(range(cm.shape[0]))
            ax.set_xticklabels(class_names[:cm.shape[1]], fontsize=7, rotation=15)
            ax.set_yticklabels(class_names[:cm.shape[0]], fontsize=7)
            ax.set_title(name, fontsize=9)
            ax.set_xlabel("Predicted", fontsize=8)
            ax.set_ylabel("Actual", fontsize=8)
            for i in range(cm.shape[0]):
                for j in range(cm.shape[1]):
                    ax.text(j, i, str(cm[i, j]), ha='center', va='center',
                            color='white' if cm[i, j] > cm.max() / 2 else 'black',
                            fontsize=9)
            plt.tight_layout()
            st.pyplot(fig)
            plt.close()

    # 10.5 Classify a new entry
    st.markdown("---")
    st.subheader("10.5 - Classify a New Entry")
    st.markdown(f"Model in use: **{best_clf}**  |  Target: **{target_type}**")

    ca1, ca2 = st.columns(2)
    with ca1:
        area_c      = st.selectbox("Country (Area)", sorted(data['Area'].unique()), key='clf_area')
        item_c      = st.selectbox("Crop (Item)",    sorted(data['Item'].unique()),  key='clf_item')
        year_c      = st.number_input("Year", min_value=1990, max_value=2030, value=2010, step=1, key='clf_year')
    with ca2:
        rainfall_c   = st.number_input("Average Rainfall (mm/year)",  0.0, 5000.0, 1000.0, 10.0, key='clf_rain')
        pesticides_c = st.number_input("Pesticides (tonnes)",          0.0, 500000.0, 100.0, 10.0, key='clf_pest')
        avg_temp_c   = st.number_input("Average Temperature (°C)",    -10.0, 50.0, 20.0, 0.1,    key='clf_temp')

    if st.button("Classify"):
        raw_c = {
            'Area'                          : [area_c],
            'Item'                          : [item_c],
            'Year'                          : [int(year_c)],
            'average_rain_fall_mm_per_year' : [float(rainfall_c)],
            'pesticides_tonnes'             : [float(pesticides_c)],
            'avg_temp'                      : [float(avg_temp_c)]
        }
        sample_c_df  = pd.DataFrame(raw_c)[feat_cols_clf]
        sample_c_enc = ct_clf.transform(sample_c_df)
        if hasattr(sample_c_enc, 'toarray'):
            sample_c_enc = sample_c_enc.toarray()
        sample_c_enc = sample_c_enc.astype(float)
        sample_c_enc[:, n_ohe_clf:] = sc_clf.transform(sample_c_enc[:, n_ohe_clf:])

        predicted_class = int(clf_models[best_clf].predict(sample_c_enc)[0])

        st.markdown("---")
        st.subheader("Classification Result")
        label = class_names[predicted_class]

        if is_binary:
            if predicted_class == 1:
                st.success(f"Predicted class: **{predicted_class}** → **{label}** yield")
            else:
                st.warning(f"Predicted class: **{predicted_class}** → **{label}** yield")
        else:
            if predicted_class == 2:
                st.success(f"Predicted class: **{predicted_class}** → **{label}** yield")
            elif predicted_class == 1:
                st.info(f"Predicted class: **{predicted_class}** → **{label}** yield")
            else:
                st.warning(f"Predicted class: **{predicted_class}** → **{label}** yield")

        st.markdown("**Input Summary**")
        st.dataframe(pd.DataFrame({
            'Parameter': ['Country', 'Crop', 'Year', 'Rainfall (mm/yr)', 'Pesticides (t)', 'Avg Temp (°C)'],
            'Value':     [area_c, item_c, year_c, rainfall_c, pesticides_c, avg_temp_c]
        }))
