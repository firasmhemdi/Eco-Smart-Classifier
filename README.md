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
## Docker - API FastAPI

Construire l'image :

```bash
docker build -t eco-smart-api .
```

Lancer le conteneur :

```bash
docker run --rm -p 8000:8000 eco-smart-api
```

Verifier l'API :

- API : http://localhost:8000
- Documentation Swagger : http://localhost:8000/docs

## Docker Compose - Backend + Frontend

Construire les deux images :

```bash
docker compose build
```

Lancer toute l'application :

```bash
docker compose up -d
```

Arreter les conteneurs :

```bash
docker compose down
```

URLs :

- Frontend React : http://localhost:3000
- API FastAPI : http://localhost:8000
- API Docs : http://localhost:8000/docs

## Tests

Installer les dependances de test :

```bash
pip install -r requirements-dev.txt
```

Lancer les tests avec coverage :

```bash
pytest
```

Le plan des tests a implementer est dans `TEST_PLAN.md`.

Execution verifiee dans Docker :

```bash
docker run --rm -v "${PWD}:/app" -w /app eco-smart-api sh -c "pip install --no-cache-dir -r requirements-dev.txt && pytest"
```

Resultat actuel : 20 tests passes, coverage `main.py` 100%.

## CI/CD GitHub Actions

Le workflow CI est dans `.github/workflows/ci.yml`.

Il execute :

- verification des fichiers obligatoires ;
- build de l'image backend `eco-smart-api` ;
- tests `pytest` avec coverage ;
- build backend + frontend avec Docker Compose ;
- lancement du stack complet ;
- smoke tests API et frontend ;
- upload du rapport `htmlcov`.

Important : pour simplifier le deploiement de ce projet d'etude, le dataset et les modeles sont aussi presents directement dans le depot Git. DVC reste configure pour documenter et verifier les artefacts.

## DVC

Le projet utilise DVC pour documenter et verifier les artefacts :

- `dataset_ProjetML_2026.csv`
- `models/`

Verifier le pipeline :

```bash
dvc status
dvc repro
dvc metrics show
```

Pousser les artefacts vers le remote DVC :

```bash
dvc push
```

Note : les artefacts sont aussi suivis directement par Git pour faciliter GitHub Actions et le deploiement simple.
