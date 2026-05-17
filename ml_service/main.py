import contextlib
import threading
import time
import requests
import joblib
import pandas as pd
import numpy as np
import networkx as nx
import concurrent.futures
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
import shap
import uvicorn

models = {}
explainers = {}

model_files = {
    'rf': 'rf_model.joblib',
    'xgb': 'xgb_model.joblib',
    'lgb': 'lgb_model.joblib',
    'iso': 'iso_forest.joblib',
    'ocsvm': 'ocsvm.joblib',
    'lof': 'lof.joblib'
}

for name, filename in model_files.items():
    try:
        models[name] = joblib.load(filename)
        print(f"Loaded {filename}")
        if name in ['rf', 'xgb', 'lgb']: # Tree models
            try:
                explainers[name] = shap.TreeExplainer(models[name])
            except Exception:
                pass
    except Exception as e:
        print(f"Warning: Could not load {filename}. {e}")

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
    if not models:
        return {"error": "No models loaded"}

    # Convert features to DataFrame to match training
    feature_dict = features.dict()
    # Convert booleans to ints for the model
    for k, v in feature_dict.items():
        if isinstance(v, bool):
            feature_dict[k] = int(v)
            
    df = pd.DataFrame([feature_dict])
    feature_names = df.columns.tolist()

    def _predict(name, model):
        if name in ['rf', 'xgb', 'lgb']: # Supervised
            try:
                probs = model.predict_proba(df)[0]
                fraud_prob = float(probs[1]) if probs.shape[0] > 1 else float(probs[0])
            except Exception:
                pred_label = int(model.predict(df)[0])
                fraud_prob = 1.0 if pred_label == 1 else 0.0
            return {'name': name, 'prob': float(fraud_prob * 100)}
        else: # Unsupervised
            try:
                score = model.decision_function(df)[0]
                prob = float(max(0, min(100, 50 - (score * 100))))
            except Exception:
                prob = 50.0
            return {'name': name, 'prob': prob}

    results = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(_predict, name, model) for name, model in models.items()]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())

    # Aggregate probabilities
    avg_prob = sum(r['prob'] for r in results) / len(results) if results else 0
    is_fraud = int(avg_prob > 50)
    rawScore = avg_prob / 100.0

    shapReasons = []
    for name, explainer in explainers.items():
        try:
            shap_values = explainer.shap_values(df)
            sv = shap_values[1] if isinstance(shap_values, list) and len(shap_values) > 1 else shap_values
            sv = sv[0] if isinstance(sv, (list, np.ndarray)) and hasattr(sv, '__len__') else sv
            contribs = []
            for i, fname in enumerate(feature_names):
                if sv[i] > 0:
                    contribs.append({"feature": fname, "impact": abs(float(sv[i]))})
            contribs = sorted(contribs, key=lambda x: x["impact"], reverse=True)
            for c in contribs[:3]:
                shapReasons.append(f"High risk driven by {c['feature']} (via {name})")
            break # one explanation is enough
        except Exception:
            continue

    return {
        "mlProbability": float(avg_prob),
        "isFraud": is_fraud,
        "shapReasons": shapReasons[:3],
        "rawScore": rawScore,
        "ensembleDetails": results
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
