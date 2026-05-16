import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

# Features expected by the API:
feature_names = [
    "amount", "hourOfDay", "dayOfWeek", "isWeekend", "isNightTime",
    "senderTxCount7d", "senderTxCount1h", "senderAvgAmount",
    "amountZScore", "isNewReceiver", "receiverIsBlacklisted",
    "descriptionRiskScore", "isRoundAmount", "amountToAvgRatio"
]

def generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    data = []
    for _ in range(n_samples):
        # Normal transaction
        amount = np.random.lognormal(mean=7, sigma=1) # ~1000 to ~5000
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
        
        # Inject some anomalies (fraud patterns)
        if np.random.rand() < 0.05: # 5% anomalies
            amount = np.random.lognormal(mean=10, sigma=1) # Large amounts
            hourOfDay = np.random.randint(0, 5) # Night time
            isNightTime = 1
            senderTxCount1h = np.random.randint(5, 15) # High velocity
            amountZScore = np.random.uniform(3, 8)
            isNewReceiver = 1
            receiverIsBlacklisted = np.random.choice([0, 1], p=[0.5, 0.5])
            descriptionRiskScore = np.random.uniform(0.5, 1.0)
            amountToAvgRatio = np.random.uniform(3, 10)

        data.append([
            amount, hourOfDay, dayOfWeek, isWeekend, isNightTime,
            senderTxCount7d, senderTxCount1h, senderAvgAmount,
            amountZScore, isNewReceiver, receiverIsBlacklisted,
            descriptionRiskScore, isRoundAmount, amountToAvgRatio
        ])
    return pd.DataFrame(data, columns=feature_names)

if __name__ == "__main__":
    print("Generating synthetic feature data for IsoForest training...")
    df = generate_synthetic_data()
    
    print("Training Isolation Forest...")
    # contamination=0.05 means we expect ~5% fraud
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(df)
    
    # Save the model
    joblib.dump(model, "iso_forest.joblib")
    print("Model saved to iso_forest.joblib successfully!")
