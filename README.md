# Crop Yield Prediction — Decision Support System

A complete supervised machine learning project that predicts agricultural crop yield (hg/ha) from climate and agricultural input data. The project covers the full ML workflow — exploratory data analysis, preprocessing, regression, and classification — and is delivered as an interactive 10-section Streamlit web application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Dataset](#2-dataset)
3. [Project Structure](#3-project-structure)
4. [Machine Learning Pipeline](#4-machine-learning-pipeline)
5. [Regression Models](#5-regression-models)
6. [Classification Models](#6-classification-models)
7. [Evaluation Metrics](#7-evaluation-metrics)
8. [Streamlit Application](#8-streamlit-application)
9. [Installation & Setup](#9-installation--setup)
10. [Usage](#10-usage)

---

## 1. Project Overview

**Goal:** Predict crop yield (measured in hectograms per hectare, hg/ha) for a given country, crop type, year, and set of climate conditions, and classify the expected yield level.

**Problem types covered:**
- **Supervised Regression** — predict the exact yield value (continuous output)
- **Supervised Classification** — predict the yield category (binary or 3-class)

**Practical applications:**
- Harvest volume estimation before the growing season
- Risk analysis for below-average yield conditions
- Pesticide and irrigation resource planning
- Government food security and agricultural policy support

---

## 2. Dataset

### Source files

| File | Description |
|---|---|
| `data/yield.csv` | Crop yield per country and year (hg/ha) |
| `data/pesticides.csv` | Pesticide usage per country and year (tonnes) |
| `data/rainfall.csv` | Average annual rainfall per country (mm/year) |
| `data/temp.csv` | Average temperature per country and year (°C) |
| `data/yield_df.csv` | Pre-merged and cleaned dataset used for modelling |

### Merged dataset — `yield_df.csv`

| Property | Value |
|---|---|
| Records | 28,242 |
| Countries (Area) | 101 |
| Crop types (Item) | 10 |
| Year range | 1990 – 2013 |
| Missing values | None |

### Columns

| Column | Type | Description |
|---|---|---|
| `Area` | Categorical | Country name (101 unique values) |
| `Item` | Categorical | Crop type (10 unique values) |
| `Year` | Numerical | Year of observation |
| `average_rain_fall_mm_per_year` | Numerical | Average annual rainfall (mm) |
| `pesticides_tonnes` | Numerical | Pesticide usage (tonnes) |
| `avg_temp` | Numerical | Average temperature (°C) |
| `hg/ha_yield` | Numerical **(target)** | Crop yield (hectograms per hectare) |

### Key observations from EDA

- Yield varies widely across crops and countries — the distribution is right-skewed.
- Pesticide usage shows a positive relationship with yield.
- Temperature and rainfall have a complex, non-linear influence on yield.
- No missing values — no imputation required.
- Non-linear ensemble models (Random Forest, Gradient Boosting) are expected to outperform linear models.

---

## 3. Project Structure

```
Project/
├── data/
│   ├── yield_df.csv          # Main dataset (pre-merged, used by the app)
│   ├── yield.csv             # Raw yield data
│   ├── pesticides.csv        # Raw pesticide data
│   ├── rainfall.csv          # Raw rainfall data
│   └── temp.csv              # Raw temperature data
├── notebooks/
│   ├── 01_data_exploration.ipynb   # Full Exploratory Data Analysis (EDA)
│   └── 02_ml_pipeline.ipynb        # End-to-end ML pipeline (training + evaluation)
├── app.py                    # Streamlit web application (10 sections)
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 4. Machine Learning Pipeline

The same preprocessing pipeline is applied for both regression and classification.

### Step 1 — Drop index column
The `Unnamed: 0` column (CSV export artefact) is dropped automatically on load.

### Step 2 — Encode categorical features
`Area` and `Item` are encoded with `OneHotEncoder` inside a `ColumnTransformer`:
- `Area` → 101 binary columns
- `Item` → 10 binary columns

### Step 3 — Train / Test split
- **Regression:** 80% train / 20% test, `random_state=0` (configurable in the app)
- **Classification:** 75% train / 25% test, `random_state=0` (configurable in the app)

### Step 4 — Feature scaling
`StandardScaler` is applied **only to the numerical columns** (Year, rainfall, pesticides, temperature). One-hot encoded binary columns are not scaled.

```
x_stand = (x − mean(x)) / std(x)
```

The scaler is **fit on the training set only** to prevent data leakage.

### Step 5 — Polynomial features (optional, regression only)
When Polynomial Regression is selected, `PolynomialFeatures` is applied **only to the 4 numerical columns** after scaling, then concatenated back with the OHE columns. This avoids an exponential expansion from the 111 binary OHE columns and focuses the polynomial terms where non-linearity is meaningful.

### Baseline
A naive predictor that always outputs the training mean is computed for comparison. Every useful model must outperform it.

---

## 5. Regression Models

Six regression models are available in the app (all from scikit-learn):

### 5.1 Linear Regression
Models yield as a weighted linear combination of all features:

```
y = W₁x₁ + W₂x₂ + ... + Wₙxₙ + b
```

Serves as the linear baseline. Fast to train and highly interpretable.

### 5.2 Polynomial Regression
Extends Linear Regression by adding polynomial terms of the numerical features up to degree *n*:

```
y = W₁x + W₂x² + W₃x³ + ... + Wₙxⁿ + b
```

Implemented via `PolynomialFeatures` (degree selectable: 2, 3, or 4) applied to the numerical columns, followed by `LinearRegression`. Captures the non-linear relationships between temperature, rainfall, pesticides, and yield that the EDA revealed.

### 5.3 Decision Tree Regressor
Recursively partitions the feature space into regions and assigns a constant predicted value to each leaf node. Naturally handles non-linearity and feature interactions without scaling. `random_state=0`.

### 5.4 Random Forest Regressor
An ensemble of 100 decision trees trained on random subsets of the data (bagging). Final prediction is the average of all tree predictions. Reduces overfitting compared to a single tree and typically achieves the highest R² on this dataset. `n_estimators=100`, `random_state=0`.

### 5.5 Gradient Boosting Regressor
Builds trees sequentially — each tree corrects the residual errors of the previous one. Often competitive with Random Forest on tabular data. `random_state=0`.

### 5.6 SVR (Support Vector Regression)
Uses an RBF kernel to fit a hyperplane in a high-dimensional space with a margin of tolerance (ε-insensitive loss). Robust to outliers. Note: may take several minutes on the full 28k-row dataset due to the quadratic complexity of the RBF kernel. Disabled by default in the app.

### Baseline — Mean predictor
Always predicts the training set mean. R² = 0 by definition. All models are compared against it.

---

## 6. Classification Models

The continuous `hg/ha_yield` is discretised into categories before training. Two target types are available:

| Type | Classes | Rule |
|---|---|---|
| **Binary** | 0 = Below average, 1 = Above average | Threshold = training mean |
| **3-Class** | 0 = Low, 1 = Medium, 2 = High | 33rd and 67th percentile boundaries |

Three classifiers are available (all from scikit-learn):

### 6.1 Logistic Regression
Applies a sigmoid function to a linear combination of features to produce a class probability:

```
z = W₁x₁ + W₂x₂ + ... + Wₙxₙ + b
P(class=1 | x) = 1 / (1 + e^−z)
```

Assigns class 1 if P ≥ 0.5. `max_iter=1000`, `random_state=0`.

### 6.2 K-Nearest Neighbors (KNN)
Classifies a new point by a majority vote among its *K* nearest neighbours in feature space (Euclidean / Minkowski distance). *K* is configurable via a slider (1–15, default 5).

Steps:
1. Choose K
2. Find the K closest training points to the new entry
3. Count votes per class
4. Assign the majority class

### 6.3 Naive Bayes (GaussianNB)
A probabilistic classifier based on Bayes' theorem with the naive assumption of feature independence:

```
P(C | X) = P(X | C) · P(C) / P(X)
P(X | C) = P(x₁|C) · P(x₂|C) · ... · P(xₙ|C)
```

Assumes Gaussian distributions for continuous features. Fast, interpretable, and effective even on high-dimensional data.

---

## 7. Evaluation Metrics

### Regression metrics

| Metric | Formula | Interpretation |
|---|---|---|
| **R²** | 1 − SS_res / SS_tot | Proportion of variance explained (1.0 = perfect, 0 = baseline) |
| **MAE** | mean(\|y − ŷ\|) | Average absolute error in hg/ha (lower is better) |
| **MSE** | mean((y − ŷ)²) | Penalises large errors more heavily (lower is better) |
| **RMSE** | √MSE | Same unit as target; easier to interpret than MSE (lower is better) |

**R² rating guide:**

| R² | Rating |
|---|---|
| > 0.90 | Excellent |
| 0.70 – 0.90 | Good |
| 0.00 – 0.70 | Average |
| < 0.00 | Poor (worse than baseline) |

### Classification metrics

| Metric | Formula | Interpretation |
|---|---|---|
| **Accuracy** | Correct predictions / Total predictions | Overall correctness (higher is better) |
| **Precision** | TP / (TP + FP) | Of predicted positives, how many are actually positive |
| **Recall** | TP / (TP + FN) | Of actual positives, how many were correctly identified |
| **Confusion Matrix** | — | Full breakdown of correct and incorrect predictions per class |

Binary tasks use standard binary averaging; 3-class tasks use weighted averaging.

---

## 8. Streamlit Application

`app.py` is a 10-section interactive web application covering the complete ML workflow.

### Section overview

| Section | Title | Description |
|---|---|---|
| **1** | Upload Dataset | Upload CSV or Excel, or use the default `yield_df.csv` |
| **2** | Data Exploration | Shape, types, statistics, missing values, categorical uniques, yield distribution |
| **3** | Preprocessing | Column identification, encoding and scaling strategy, train/test split plan |
| **4** | Model Training | Select regression models (Linear, Polynomial, Decision Tree, Random Forest, Gradient Boosting, SVR), configure split, train with progress bar |
| **5** | Benchmark Results | Colour-coded table of all models — best in green, baseline in grey |
| **6** | Visualizations | R² bar chart, RMSE bar chart, MAE bar chart, Actual vs Predicted scatter plot |
| **7** | Best Model & Recommendation | Auto-selected best model, R² interpretation, baseline comparison, agricultural guidance |
| **8** | Make a Prediction | Input country/crop/year/climate → instant yield prediction with above/below average interpretation |
| **9** | Classification | Choose binary or 3-class target, select classifiers (Logistic Regression, KNN, Naive Bayes), configure and train |
| **10** | Classification Results | Metrics table, accuracy bar chart, confusion matrices, classify a new entry |

### Key design features

- **Session state** — all trained models, scalers, and encoders are stored in `st.session_state` and persist across navigation without retraining.
- **Custom dataset support** — any CSV or Excel file with the same column structure can be uploaded and processed without code changes.
- **Polynomial pipeline integration** — when the best regression model is a Polynomial model, the app automatically applies `PolynomialFeatures` in the prediction pipeline (Section 8) and visualisation (Section 6).
- **Configurable training** — test split ratio, random seed, polynomial degree, KNN k-value, and which models to include are all adjustable through the UI.
- **Decision support output** — regression predictions are compared against the training mean and interpreted in plain agricultural language; classification predictions output a labelled yield category.

---

## 9. Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip

### Install dependencies

```bash
pip install -r requirements.txt
```

**`requirements.txt`:**
```
streamlit
pandas
numpy
scikit-learn
matplotlib
openpyxl
```

All models — including SVR, KNN, Naive Bayes, Logistic Regression, and PolynomialFeatures — are part of scikit-learn and require no additional packages.

---

## 10. Usage

### Run the Streamlit application

```bash
streamlit run app.py
```

The app opens in your browser at `http://localhost:8501`.

### Recommended workflow — Regression

1. **Section 1** — the default dataset loads automatically; or upload your own file.
2. **Section 2** — explore the data (distributions, types, missing values).
3. **Section 3** — review the preprocessing plan.
4. **Section 4** — select models, click **Train Models**.
5. **Section 5** — compare benchmark results.
6. **Section 6** — explore visualisations.
7. **Section 7** — read the best model recommendation.
8. **Section 8** — enter a custom scenario and get a yield prediction.

### Recommended workflow — Classification

9. **Section 9** — choose Binary or 3-Class target, select classifiers, click **Train Classifiers**.
10. **Section 10** — review confusion matrices, compare accuracy, classify a new entry.

### Run the notebooks

```bash
jupyter notebook notebooks/01_data_exploration.ipynb
jupyter notebook notebooks/02_ml_pipeline.ipynb
```

| Notebook | Contents |
|---|---|
| `01_data_exploration.ipynb` | Full EDA: shape, types, missing values, distributions, scatter plots, correlation matrix, key observations |
| `02_ml_pipeline.ipynb` | End-to-end pipeline: preprocessing, training Linear Regression / Decision Tree / Random Forest / Gradient Boosting, benchmark table, visualisations, example prediction |
