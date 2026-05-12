# ♻️ ECO-SMART CLASSIFIER

Système intelligent de classification de déchets et estimation du prix de revente.

## 🎯 Description
Pipeline ML complet allant de la donnée brute à une application web déployée, capable de classifier des déchets (Métal, Papier, Plastique, Verre) et d'estimer leur valeur de revente.

## 📊 Résultats

| Module | Modèle | Performance |
|--------|--------|-------------|
| Classification | Random Forest | 99.93% accuracy |
| Régression | Gradient Boosting | R²=0.74 |
| NLP | LinearSVC + TF-IDF | 100% accuracy |
| Multimodal | LinearSVC combiné | 100% accuracy |
| Clustering | K-Means (k=4) | PCA 88.6% variance |

## 🏗️ Architecture
```
eco-smart-classifier/
├── Eco-Smart Classifier.ipynb
├── main.py
├── Dockerfile
├── eco-smart-frontend/
├── models/
├── PROMPTS.md
└── README.md
```

## 🚀 Lancer le projet en 3 commandes

**1. API FastAPI**
```bash
python -m uvicorn main:app --reload
```

**2. Application React**
```bash
cd eco-smart-frontend && npm install && npm start
```

**3. MLflow UI**
```bash
mlflow ui
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Application Web | http://localhost:3000 |
| API FastAPI | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MLflow UI | http://localhost:5000 |

## 📦 Installation
```bash
pip install fastapi uvicorn scikit-learn joblib mlflow pandas numpy matplotlib seaborn gensim
cd eco-smart-frontend && npm install
```

## 🔬 Modules

**Module 1 — Data Engineering**
- Imputation : Médiane vs KNN vs IterativeImputer
- Outliers : Capping IQR
- Normalisation : StandardScaler
- Encodage : One-Hot + Label Encoding

**Module 2 — ML Supervisé**
- Classification : Random Forest (99.93%)
- Régression : Gradient Boosting (R²=0.74)
- Tuning : GridSearchCV

**Module 3 — Clustering**
- K-Means avec k=4 (Elbow Method)
- Visualisation PCA 2D (88.6% variance)

**Module 4 — NLP**
- Vectorisation : BoW, TF-IDF, Word2Vec, FastText
- Classificateurs : Naive Bayes, LinearSVC, Random Forest

**Module 5 — Pipeline Multimodal**
- Fusion hstack : TF-IDF + numérique = 694 features
- LinearSVC → 100% accuracy

**Module 6 — MLOps**
- MLflow : 5 expériences + Model Registry
- API REST : FastAPI + uvicorn
- Frontend : React + Recharts

## 👨‍💻 Auteur
**Firas Mhemdi** — Mastère DSIR1, ISET Sfax
