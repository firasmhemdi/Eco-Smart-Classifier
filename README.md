# Eco-Smart Classifier

Systeme intelligent de classification de dechets et d'estimation du prix de revente en TND.

Le projet couvre tout le workflow demande : preparation des donnees, classification, regression, clustering, NLP, pipeline multimodal, API FastAPI, interface React, Docker, tests, CI/CD, MLflow et DVC.

## Resultats Principaux

| Module | Methode | Performance |
| --- | --- | --- |
| Classification numerique | Random Forest | 99.93% accuracy |
| Regression prix | Gradient Boosting | R2 = 0.74 |
| NLP | TF-IDF + LinearSVC | 100% accuracy |
| Multimodal | TF-IDF + numerique + LinearSVC | 100% accuracy |
| Clustering | K-Means, k=4 | PCA 2D, 88.6% variance |

## Lancer En Local Avec Docker

Prerequis :

- Docker Desktop ouvert.
- Le projet clone en local.

### Option Recommandee : Application Fullstack Sur Un Seul Port

Depuis la racine du projet :

```bash
docker build -t eco-smart-fullstack .
docker run --rm -p 8000:8000 eco-smart-fullstack
```

Puis ouvrir :

- Application web : http://localhost:8000
- API FastAPI : http://localhost:8000/health
- Documentation Swagger : http://localhost:8000/docs

Cette option construit le frontend React, le sert avec FastAPI et charge les modeles depuis `models/`.

### Option Alternative : Docker Compose

```bash
docker compose up --build
```

Puis ouvrir :

- Frontend React : http://localhost:3000
- API FastAPI : http://localhost:8000
- Documentation Swagger : http://localhost:8000/docs

Arreter les conteneurs :

```bash
docker compose down
```

## Lancer Sans Docker

### Backend FastAPI

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

API :

- http://localhost:8000
- http://localhost:8000/docs

### Frontend React

Dans un autre terminal :

```bash
cd eco-smart-frontend
npm install
npm start
```

Sous Windows PowerShell, si `npm` est bloque par la policy, utiliser :

```bash
npm.cmd install
npm.cmd start
```

Frontend :

- http://localhost:3000

## Fonctionnalites De L'Application

L'application web contient trois onglets :

1. **Dashboard Data**
   - statistiques du dataset ;
   - distribution des categories ;
   - performances des modeles ;
   - visualisation PCA des clusters ;
   - methode du coude pour justifier `k=4`.

2. **Prediction Manuelle**
   - curseurs pour `Poids`, `Volume`, `Conductivite`, `Opacite`, `Rigidite` ;
   - prediction de la categorie ;
   - estimation du prix en `TND`.

3. **Assistant NLP**
   - saisie d'une description textuelle ;
   - nettoyage du texte ;
   - prediction de la categorie par modele NLP ;
   - renfort par mots-cles metier.

## Endpoints API

| Endpoint | Methode | Role |
| --- | --- | --- |
| `/health` | GET | Verifier que l'API fonctionne |
| `/data/stats` | GET | Recuperer les statistiques du dashboard |
| `/predict/classification` | POST | Predire une categorie depuis les variables numeriques |
| `/predict/regression` | POST | Estimer le prix en TND |
| `/predict/nlp` | POST | Predire une categorie depuis un texte |
| `/artifacts/clusters_pca.png` | GET | Afficher les clusters PCA |
| `/artifacts/elbow_method.png` | GET | Afficher la methode du coude |

Exemple NLP :

```bash
curl -X POST http://localhost:8000/predict/nlp ^
  -H "Content-Type: application/json" ^
  -d "{\"texte\":\"carton papier leger opaque\"}"
```

Exemple prediction numerique :

```bash
curl -X POST http://localhost:8000/predict/regression ^
  -H "Content-Type: application/json" ^
  -d "{\"poids\":50,\"volume\":100,\"conductivite\":0.1,\"opacite\":1,\"rigidite\":5}"
```

## Modules Du Projet

### Module 1 - Data Engineering

- exploration du dataset ;
- gestion des valeurs manquantes ;
- comparaison mediane, KNNImputer et IterativeImputer ;
- traitement des outliers par capping IQR ;
- standardisation avec StandardScaler ;
- encodage des variables categoriques.

### Module 2 - Machine Learning Supervise

- classification de `Categorie` ;
- regression du `Prix_Revente` ;
- comparaison de plusieurs modeles ;
- tuning avec GridSearchCV ;
- matrice de confusion et importance des features ;
- sauvegarde des modeles en `.pkl`.

### Module 3 - Clustering

- K-Means sans utiliser la cible ;
- choix de `k=4` avec la methode du coude ;
- visualisation PCA 2D ;
- affichage des artefacts dans le dashboard.

### Module 4 - NLP

- nettoyage de `Rapport_Collecte` ;
- suppression des stopwords ;
- comparaison BoW, TF-IDF, Word2Vec et FastText ;
- choix final : TF-IDF + LinearSVC ;
- endpoint `/predict/nlp` integre dans l'assistant web.

### Module 5 - Pipeline Multimodal

- fusion sparse avec `hstack` ;
- combinaison TF-IDF + variables numeriques standardisees ;
- modele final LinearSVC ;
- comparaison texte seul, numerique seul et combine.

### Module 6 - MLOps

- MLflow : 5 experiences et Model Registry ;
- DVC : suivi documente du dataset et des modeles ;
- FastAPI + Docker ;
- tests pytest ;
- CI GitHub Actions ;
- deploiement Render via `render.yaml`.

Note : pour simplifier le deploiement de ce projet d'etude, le dataset et les modeles sont aussi presents directement dans le depot Git. DVC reste configure pour documenter et verifier les artefacts.

## Tests

Installer les dependances de test :

```bash
pip install -r requirements-dev.txt
```

Lancer les tests :

```bash
pytest
```

Lancer les tests frontend :

```bash
cd eco-smart-frontend
npm.cmd test -- --watchAll=false
```

## Deploiement

Le Dockerfile principal construit une image fullstack :

- build React ;
- API FastAPI ;
- modeles ML inclus ;
- images PCA/coude incluses ;
- port compatible avec Render via la variable `PORT`.

Render peut construire directement depuis :

```text
Dockerfile
render.yaml
```

## Auteur

Firas Mhemdi - Mastere DSIR1, ISET Sfax
