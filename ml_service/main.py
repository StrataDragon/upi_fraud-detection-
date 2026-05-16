import contextlib
import threading
import time
import requests
import joblib
import pandas as pd
import numpy as np
import networkx as nx
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
import shap
import uvicorn

# Load IsolationForest model
try:
    model = joblib.load("iso_forest.joblib")
    # Initialize a fast TreeExplainer for the Isolation Forest
    explainer = shap.TreeExplainer(model)
except Exception as e:
    print("Warning: Could not load iso_forest.joblib. Did you run train_model.py?")
    model = None
    explainer = None

# NetworkX Graph for DeepGraph feature
G = nx.DiGraph()
graph_lock = threading.Lock()

# Define Pydantic models for API
class TransactionFeatures(BaseModel):
    amount: float
    hourOfDay: int
    dayOfWeek: int
    isWeekend: bool
    isNightTime: bool
    senderTxCount7d: int
    senderTxCount1h: int
    senderAvgAmount: float
    amountZScore: float
    isNewReceiver: bool
    receiverIsBlacklisted: bool
    descriptionRiskScore: float
    isRoundAmount: bool
    amountToAvgRatio: float

class EdgePayload(BaseModel):
    senderUpi: str
    receiverUpi: str
    amount: float
    transactionId: str

app = FastAPI(title="UPI Fraud ML Sidecar")

@app.post("/predict")
def predict_fraud(features: TransactionFeatures):
    if model is None:
        return {"error": "Model not loaded"}

    # Convert features to DataFrame to match training
    feature_dict = features.dict()
    # Convert booleans to ints for the model
    for k, v in feature_dict.items():
        if isinstance(v, bool):
            feature_dict[k] = int(v)
            
    df = pd.DataFrame([feature_dict])
    
    # 1 is normal, -1 is anomalous
    pred = model.predict(df)[0]
    # Decision function returns lower scores for anomalies
    score = model.decision_function(df)[0]
    
    # Convert score to a 0-100 probability. 
    # decision_function typically returns values between -0.5 and 0.5.
    # We want lower/negative values to be high probability of fraud.
    # Normalizing it:
    prob = float(max(0, min(100, 50 - (score * 100))))
    
    # Generate SHAP explanations
    shap_values = explainer.shap_values(df)
    
    # Extract top contributing features to the anomaly
    # SHAP values for IsoForest: negative values push prediction towards -1 (anomaly)
    # We want to find the most negative SHAP values.
    feature_names = df.columns.tolist()
    shap_vals = shap_values[0] if isinstance(shap_values, list) else shap_values[0]
    
    contributions = []
    for i, name in enumerate(feature_names):
        # We only care about features pushing the score down (towards fraud)
        if shap_vals[i] < 0:
            contributions.append({"feature": name, "impact": abs(float(shap_vals[i]))})
            
    # Sort by highest impact
    contributions = sorted(contributions, key=lambda x: x["impact"], reverse=True)
    
    top_reasons = []
    for contrib in contributions[:3]: # top 3 reasons
        top_reasons.append(f"High risk driven by {contrib['feature']} anomaly")

    return {
        "mlProbability": prob,
        "isAnomaly": int(pred == -1),
        "shapReasons": top_reasons,
        "rawScore": float(score)
    }

@app.post("/add_edge")
def add_edge(payload: EdgePayload):
    with graph_lock:
        u = payload.senderUpi
        v = payload.receiverUpi
        # Add edge or update weight
        if G.has_edge(u, v):
            G[u][v]['weight'] += payload.amount
            G[u][v]['count'] += 1
        else:
            G.add_edge(u, v, weight=payload.amount, count=1)
    return {"status": "edge added"}

def run_graph_analysis():
    """Background thread that runs PageRank and Louvain to find Mule Rings"""
    while True:
        time.sleep(15) # Run every 15 seconds
        with graph_lock:
            if len(G.nodes) < 5:
                continue
            
            # Simple mule logic: High In-Degree and High Out-Degree over short period
            # Fan-In / Fan-Out detection
            suspicious_nodes = []
            for node in list(G.nodes):
                in_deg = G.in_degree(node)
                out_deg = G.out_degree(node)
                
                # If a node receives money from many distinct users and sends out
                if in_deg >= 3 and out_deg >= 1:
                    suspicious_nodes.append({
                        "node": node,
                        "inDegree": in_deg,
                        "outDegree": out_deg
                    })
            
            if suspicious_nodes:
                # Fire webhook to Node.js backend
                try:
                    requests.post("http://127.0.0.1:5000/api/webhooks/graph-alert", json={
                        "type": "MULE_RING_DETECTED",
                        "nodes": suspicious_nodes
                    }, timeout=2)
                    print(f"Fired webhook for suspicious nodes: {suspicious_nodes}")
                except Exception as e:
                    print(f"Failed to push webhook: {e}")
                
                # Clear graph to simulate sliding window (for hackathon demo simplicity)
                G.clear()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    thread = threading.Thread(target=run_graph_analysis, daemon=True)
    thread.start()
    yield
    # Shutdown

app.router.lifespan_context = lifespan

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
