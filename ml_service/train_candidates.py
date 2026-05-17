import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.svm import OneClassSVM
from sklearn.neighbors import LocalOutlierFactor
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score, precision_recall_fscore_support
import joblib

feature_names = [
    "amount", "hourOfDay", "dayOfWeek", "isWeekend", "isNightTime",
    "senderTxCount7d", "senderTxCount1h", "senderAvgAmount",
    "amountZScore", "isNewReceiver", "receiverIsBlacklisted",
    "descriptionRiskScore", "isRoundAmount", "amountToAvgRatio"
]


def parse_timestamp(ts):
    try:
        return datetime.fromisoformat(ts.replace('Z', '+00:00'))
    except Exception:
        return None


def featurize(df_transactions: pd.DataFrame) -> pd.DataFrame:
    df = df_transactions.copy()
    # Parse timestamp
    df['ts'] = df['timestamp'].apply(parse_timestamp)
    df['hourOfDay'] = df['ts'].dt.hour.fillna(12).astype(int)
    df['dayOfWeek'] = df['ts'].dt.weekday.fillna(0).astype(int)
    df['isWeekend'] = df['dayOfWeek'].isin([5,6]).astype(int)
    df['isNightTime'] = df['hourOfDay'].apply(lambda h: 1 if h < 6 or h > 22 else 0)

    # Amount
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    # Sender-level aggregates
    sender_grp = df.groupby('senderUpi')
    df['senderTxCount7d'] = sender_grp['amount'].transform('count')
    df['senderAvgAmount'] = sender_grp['amount'].transform('mean').fillna(0)
    df['senderTxCount1h'] = 0
    # approximate recent 1h as fraction of transactions
    df['senderTxCount1h'] = (sender_grp['amount'].transform(lambda x: x.rolling(1).count()).fillna(0)).astype(int)

    df['amountZScore'] = (df['amount'] - df['senderAvgAmount']) / (df['amount'].std(ddof=0) + 1e-6)
    df['isNewReceiver'] = df.apply(lambda r: 1 if (df[(df['senderUpi'] == r['senderUpi']) & (df['receiverUpi'] == r['receiverUpi'])].shape[0] == 1) else 0, axis=1)
    df['receiverIsBlacklisted'] = 0
    # simplistic description risk heuristic
    df['descriptionRiskScore'] = df['description'].str.contains('urgent|verification|verify|refund|investment|crypto', case=False, na=False).astype(int)
    df['isRoundAmount'] = (df['amount'] % 100 == 0).astype(int)
    df['amountToAvgRatio'] = df.apply(lambda r: r['amount'] / (r['senderAvgAmount'] + 1e-6), axis=1)

    return df[feature_names].fillna(0)


def generate_labeled_synthetic(n_samples=5000, anomaly_frac=0.05, random_state=42):
    np.random.seed(random_state)
    X = []
    y = []
    for _ in range(n_samples):
        amount = np.random.lognormal(mean=7, sigma=1)
        hourOfDay = np.random.randint(6, 23)
        dayOfWeek = np.random.randint(0, 7)
        isWeekend = 1 if dayOfWeek in [0, 6] else 0
        isNightTime = 0
        senderTxCount7d = np.random.randint(1, 50)
        senderTxCount1h = np.random.randint(0, 3)
        senderAvgAmount = amount * np.random.uniform(0.8, 1.2)
        amountZScore = np.random.uniform(0, 1.5)
        isNewReceiver = np.random.choice([0, 1], p=[0.9, 0.1])
        receiverIsBlacklisted = 0
        descriptionRiskScore = np.random.uniform(0, 0.2)
        isRoundAmount = 1 if amount % 100 == 0 else 0
        amountToAvgRatio = amount / senderAvgAmount if senderAvgAmount > 0 else 1

        label = 0
        if np.random.rand() < anomaly_frac:
            amount = np.random.lognormal(mean=10, sigma=1)
            hourOfDay = np.random.randint(0, 5)
            isNightTime = 1
            senderTxCount1h = np.random.randint(5, 15)
            amountZScore = np.random.uniform(3, 8)
            isNewReceiver = 1
            receiverIsBlacklisted = np.random.choice([0, 1], p=[0.5, 0.5])
            descriptionRiskScore = np.random.uniform(0.5, 1.0)
            amountToAvgRatio = np.random.uniform(3, 10)
            label = 1

        X.append([
            amount, hourOfDay, dayOfWeek, isWeekend, isNightTime,
            senderTxCount7d, senderTxCount1h, senderAvgAmount,
            amountZScore, isNewReceiver, receiverIsBlacklisted,
            descriptionRiskScore, isRoundAmount, amountToAvgRatio
        ])
        y.append(label)
    return pd.DataFrame(X, columns=feature_names), np.array(y)


if __name__ == '__main__':
    print('Generating labeled synthetic dataset for candidate training...')
    X, y = generate_labeled_synthetic(n_samples=8000, anomaly_frac=0.05)

    X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)

    results = {}

    # Isolation Forest (unsupervised) trained on train data (including some anomalies)
    iso = IsolationForest(n_estimators=200, contamination=0.05, random_state=42)
    iso.fit(X_train)
    iso_scores = -iso.decision_function(X_test)  # higher -> more anomalous
    try:
        results['IsolationForest'] = roc_auc_score(y_test, iso_scores)
    except Exception:
        results['IsolationForest'] = None

    # OneClassSVM
    try:
        ocsvm = OneClassSVM(nu=0.05, kernel='rbf', gamma='scale')
        ocsvm.fit(X_train)
        oc_scores = -ocsvm.decision_function(X_test)
        results['OneClassSVM'] = roc_auc_score(y_test, oc_scores)
    except Exception as e:
        results['OneClassSVM'] = None

    # LocalOutlierFactor (novelty mode)
    try:
        lof = LocalOutlierFactor(n_neighbors=20, novelty=True)
        lof.fit(X_train)
        lof_scores = -lof.decision_function(X_test)
        results['LocalOutlierFactor'] = roc_auc_score(y_test, lof_scores)
    except Exception:
        results['LocalOutlierFactor'] = None

    # RandomForestClassifier (supervised)
    try:
        rf = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)
        rf.fit(X_train, y_train)
        rf_probs = rf.predict_proba(X_test)[:, 1]
        results['RandomForest'] = roc_auc_score(y_test, rf_probs)
    except Exception:
        results['RandomForest'] = None

    # XGBoost (if available)
    try:
        from xgboost import XGBClassifier
        xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
        xgb.fit(X_train, y_train)
        xgb_probs = xgb.predict_proba(X_test)[:, 1]
        results['XGBoost'] = roc_auc_score(y_test, xgb_probs)
    except Exception:
        results['XGBoost'] = None

    # LightGBM (if available)
    try:
        from lightgbm import LGBMClassifier
        lgb = LGBMClassifier(random_state=42)
        lgb.fit(X_train, y_train)
        lgb_probs = lgb.predict_proba(X_test)[:, 1]
        results['LightGBM'] = roc_auc_score(y_test, lgb_probs)
    except Exception:
        results['LightGBM'] = None

    print('Model evaluation results (AUC):')
    for k, v in results.items():
        print(f'- {k}: {v}')

    # Cross-validation for supervised models when possible
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    try:
        rf_cv = cross_val_score(RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42),
                                X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
        results['RandomForest_CV_mean'] = float(rf_cv.mean())
        print(f'- RandomForest CV AUC mean: {results["RandomForest_CV_mean"]}')
    except Exception:
        pass

    try:
        from xgboost import XGBClassifier
        xgb_cv = cross_val_score(XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42),
                                 X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
        results['XGBoost_CV_mean'] = float(xgb_cv.mean())
        print(f'- XGBoost CV AUC mean: {results["XGBoost_CV_mean"]}')
    except Exception:
        pass

    try:
        from lightgbm import LGBMClassifier
        lgb_cv = cross_val_score(LGBMClassifier(random_state=42), X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
        results['LightGBM_CV_mean'] = float(lgb_cv.mean())
        print(f'- LightGBM CV AUC mean: {results["LightGBM_CV_mean"]}')
    except Exception:
        pass

    print('Saving all successful models for parallel processing...')
    if results.get('IsolationForest') is not None:
        joblib.dump(iso, 'iso_forest.joblib')
        print('Saved iso_forest.joblib')
    if results.get('OneClassSVM') is not None:
        joblib.dump(ocsvm, 'ocsvm.joblib')
        print('Saved ocsvm.joblib')
    if results.get('LocalOutlierFactor') is not None:
        joblib.dump(lof, 'lof.joblib')
        print('Saved lof.joblib')
    if results.get('RandomForest') is not None:
        joblib.dump(rf, 'rf_model.joblib')
        print('Saved rf_model.joblib')
    if 'xgb' in locals() and results.get('XGBoost') is not None:
        joblib.dump(xgb, 'xgb_model.joblib')
        print('Saved xgb_model.joblib')
    if 'lgb' in locals() and results.get('LightGBM') is not None:
        joblib.dump(lgb, 'lgb_model.joblib')
        print('Saved lgb_model.joblib')
