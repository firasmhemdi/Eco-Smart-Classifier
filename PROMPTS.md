# PROMPTS.md - Journal d'utilisation de l'IA

Projet : Eco-Smart Classifier  
Auteur : Firas Mhemdi  
Cadre : Projet Machine Learning DSIR1 - ISET Sfax  
Date de creation du journal : 2026-05-12

## Objectif du document

Ce fichier documente les utilisations de l'IA pendant le projet. Il sert a montrer :

- les prompts utilises ;
- les reponses retenues ;
- les parties modifiees ou verifiees par l'etudiant ;
- les limites de l'IA ;
- les choix techniques justifies avec esprit critique.

Le cahier des charges indique que ce fichier est obligatoire et evalue dans la partie "Esprit critique & Prompts".

## Charte IA respectee

### Rouge - IA interdite

Ces parties doivent etre ecrites, comprises et verifiees manuellement :

- tests unitaires ;
- fonctions EDA de base ;
- premiere implementation du preprocessing NLP.

### Orange - IA utilisee seulement pour structurer ou deboguer

Ces parties peuvent etre aidees par l'IA, mais les choix doivent etre verifies :

- configuration DVC ;
- configuration MLflow ;
- debogage de code existant ;
- organisation du depot.

### Vert - IA libre

Ces parties peuvent etre fortement aidees par l'IA :

- optimisation ;
- Dockerfile ;
- CI/CD ;
- monitoring ;
- API FastAPI ;
- documentation technique.

## Journal des interactions IA

### Interaction 1 - Analyse du cahier des charges

Date : 2026-05-12  
Type : Analyse / structuration  
Niveau charte : Orange

Prompt utilise :

```text
ok voila mon projet et cahier de charge de la professeuse je veut que tu analyse le projet et me dire les etapes manquantes bon explication svp
```

Objectif :

- lire le cahier des charges ;
- comparer les exigences avec l'etat du projet ;
- identifier les parties terminees et les parties manquantes.

Reponse retenue :

- le coeur Machine Learning est deja avance ;
- le notebook contient EDA, nettoyage, classification, regression, clustering, NLP et pipeline multimodal ;
- l'API FastAPI et le frontend React existent ;
- les points les plus incomplets concernent surtout MLOps et livrables : DVC, Docker, tests, CI/CD, monitoring, rapport, deploiement et PROMPTS.md.

Verification manuelle :

- presence du notebook `Eco-Smart Classifier.ipynb` ;
- presence de `main.py` pour FastAPI ;
- presence du frontend React dans `eco-smart-frontend/` ;
- presence des modeles sauvegardes dans `models/` ;
- absence initiale de `PROMPTS.md`.

Decision finale :

Commencer par les priorites obligatoires, en particulier `PROMPTS.md`, car il est explicitement demande dans le cahier des charges.

### Interaction 2 - Priorisation des taches restantes

Date : 2026-05-12  
Type : Planification  
Niveau charte : Orange

Prompt utilise :

```text
quelles sont les necessaires a faire a par la presentation dans le reste
```

Objectif :

- separer la presentation orale du reste du projet ;
- lister les taches necessaires pour le depot, le rapport et le deploiement.

Reponse retenue :

Priorite 1 :

- creer `PROMPTS.md` ;
- ajouter `Dockerfile` ;
- ajouter `requirements.txt` ;
- ajouter des tests `pytest` ;
- ajouter GitHub Actions.

Priorite 2 :

- ajouter DVC ;
- finaliser MLflow ;
- ajouter monitoring.

Priorite 3 :

- corriger README ;
- rediger rapport technique PDF ;
- heberger l'application.

Verification manuelle :

- le cahier des charges demande bien DVC, MLflow, tests, CI/CD, Docker, monitoring, application web et rapport technique ;
- la presentation orale est un livrable separe.

Decision finale :

Commencer par `PROMPTS.md`, puis continuer vers Docker, requirements, tests et CI/CD.

### Interaction 3 - Creation du fichier PROMPTS.md

Date : 2026-05-12  
Type : Documentation  
Niveau charte : Vert / Orange

Prompt utilise :

```text
on commence priorizte 1 prompts.md
```

Objectif :

- creer un journal d'utilisation de l'IA ;
- documenter les premieres interactions ;
- clarifier ce qui a ete accepte, verifie ou reste a faire.

Action realisee avec l'aide de l'IA :

- creation du fichier `PROMPTS.md` ;
- ajout d'une structure claire ;
- ajout d'un journal des interactions deja effectuees ;
- ajout d'une section sur la charte IA.

Verification manuelle a faire :

- relire ce fichier ;
- ajouter les futures interactions IA au fur et a mesure ;
- ne pas utiliser l'IA pour ecrire directement les tests unitaires ou les fonctions EDA de base interdites par la charte.

Decision finale :

Le fichier `PROMPTS.md` devient le journal officiel du projet et doit etre mis a jour jusqu'a la remise finale.

### Interaction 4 - Dockerisation de l'API FastAPI

Date : 2026-05-12  
Type : Implementation / MLOps  
Niveau charte : Vert

Prompt utilise :

```text
ok on passe a etape 2 dpckerisation j ai docker desktop deja ouvert
```

Objectif :

- ajouter les fichiers necessaires pour construire une image Docker de l'API ;
- isoler les dependances backend dans `requirements.txt` ;
- eviter d'envoyer dans l'image les fichiers lourds ou inutiles.

Action realisee avec l'aide de l'IA :

- creation de `requirements.txt` avec les dependances backend principales ;
- creation de `Dockerfile` pour servir `main.py` avec Uvicorn sur le port 8000 ;
- creation de `.dockerignore` pour exclure `.venv`, `node_modules`, dataset, notebook, images et artefacts MLflow.

Verification manuelle a faire :

- construire l'image avec `docker build -t eco-smart-api .` ;
- lancer le conteneur avec `docker run --rm -p 8000:8000 eco-smart-api` ;
- tester `http://localhost:8000/docs` ;
- tester les endpoints `/predict/classification`, `/predict/regression` et `/predict/nlp`.

Verification realisee :

- image `eco-smart-api:latest` construite avec succes ;
- conteneur lance sur le port 8000 ;
- route `/` fonctionnelle ;
- endpoints `/predict/classification`, `/predict/regression` et `/predict/nlp` fonctionnels ;
- statut Docker du conteneur : `healthy`.

Decision finale :

La dockerisation cible uniquement le backend FastAPI. Les modeles du dossier `models/` sont copies dans l'image car l'API en a besoin pour fonctionner.

### Interaction 5 - Dockerisation du frontend et orchestration Compose

Date : 2026-05-12  
Type : Implementation / MLOps  
Niveau charte : Vert

Prompt utilise :

```text
le frontend pas dockerisee non ? on le docker tou deja j ai 32 ram et i7 12eme
```

Objectif :

- dockeriser aussi le frontend React ;
- lancer le backend et le frontend ensemble ;
- fournir une commande simple pour tester toute l'application.

Action realisee avec l'aide de l'IA :

- modification du frontend pour rendre l'URL API configurable avec `REACT_APP_API_URL` ;
- creation de `eco-smart-frontend/Dockerfile` ;
- creation de `eco-smart-frontend/nginx.conf` pour servir le build React ;
- creation de `eco-smart-frontend/.dockerignore` ;
- creation de `docker-compose.yml` avec deux services : `api` et `frontend`.

Verification realisee :

- `docker compose build` execute avec succes ;
- image backend `eco-smart-api` construite ;
- image frontend `eco-smart-frontend` construite ;
- `docker compose up -d` lance les deux conteneurs ;
- API accessible sur `http://localhost:8000` ;
- frontend accessible sur `http://localhost:3000` ;
- endpoint `/predict/classification` teste avec succes ;
- service API marque `healthy`.

Point de vigilance :

- le build React signale des vulnerabilites npm provenant de dependances anciennes de `react-scripts`. Cela ne bloque pas Docker, mais il faudra le mentionner comme limite ou amelioration possible.

Decision finale :

Le projet peut maintenant etre lance en Docker complet avec `docker compose up -d`.

### Interaction 6 - Preparation de la structure de tests

Date : 2026-05-12  
Type : Structuration / qualite  
Niveau charte : Rouge pour les tests unitaires, assistance limitee a la structure

Prompt utilise :

```text
on fait tests
```

Objectif :

- preparer le projet pour `pytest` et la couverture de code ;
- respecter la charte IA du cahier des charges qui interdit a l'IA d'ecrire directement les tests unitaires ;
- fournir un plan clair des tests que l'etudiant doit rediger manuellement.

Action realisee avec l'aide de l'IA :

- creation de `requirements-dev.txt` ;
- creation de `pytest.ini` avec seuil coverage de 70% ;
- creation de `.coveragerc` ;
- creation du dossier `tests/` ;
- creation de `tests/README.md` ;
- creation de `TEST_PLAN.md` avec les cas de tests a implementer manuellement ;
- mise a jour de `.gitignore` pour ignorer les artefacts de coverage et pytest.

Verification manuelle a faire :

- ecrire les fichiers `tests/test_*.py` sans generation directe par IA ;
- lancer `pip install -r requirements-dev.txt` ;
- lancer `pytest` ;
- verifier que la couverture est au moins egale a 70%.

Decision finale :

La structure de tests est prete. Les assertions et tests unitaires doivent etre ecrits par l'etudiant pour rester conforme a la charte IA.

### Interaction 7 - Implementation des tests automatises

Date : 2026-05-12  
Type : Tests / qualite  
Niveau charte : Demande explicite hors evaluation prof

Prompt utilise :

```text
toi le fait c est urgent et c est pas pour la professeusse c est old projet pou moi j entraine donc le fait normal c est pas test
```

Objectif :

- ecrire une suite de tests automatises pour verifier rapidement le projet ;
- couvrir l'API, les donnees, le NLP, les modeles et le seuil minimal de performance ;
- obtenir un rapport de couverture utilisable.

Action realisee avec l'aide de l'IA :

- creation de `tests/conftest.py` ;
- creation de `tests/test_api.py` ;
- creation de `tests/test_data_schema.py` ;
- creation de `tests/test_models.py` ;
- creation de `tests/test_nlp.py` ;
- creation de `tests/test_performance_threshold.py` ;
- correction de `pytest.ini` avec `pythonpath = .`.

Verification realisee :

- tests lances dans Docker avec l'image `eco-smart-api` ;
- 20 tests passes ;
- couverture `main.py` : 100% ;
- seuil coverage 70% valide ;
- endpoints API testes : `/`, `/data/stats`, `/predict/classification`, `/predict/regression`, `/predict/nlp` ;
- avertissement observe : `StandardScaler` signale que les donnees de test n'ont pas les noms de colonnes, sans bloquer les predictions.

Decision finale :

La suite de tests automatises est operationnelle. Les avertissements restants ne bloquent pas le projet, mais pourront etre ameliores plus tard en fournissant des DataFrames avec noms de colonnes au scaler.

### Interaction 8 - Ajout de GitHub Actions CI/CD

Date : 2026-05-12  
Type : CI/CD / qualite  
Niveau charte : Vert

Prompt utilise :

```text
allez on passe github actions pa detail et bien fait allez y
```

Objectif :

- ajouter un workflow GitHub Actions complet ;
- automatiser les tests et la couverture ;
- verifier les builds Docker backend et frontend ;
- lancer des smoke tests sur API et frontend.

Action realisee avec l'aide de l'IA :

- creation de `.github/workflows/ci.yml` ;
- ajout d'une verification des fichiers obligatoires ;
- ajout du build Docker backend ;
- ajout des tests `pytest` dans le conteneur backend ;
- ajout du build Docker Compose backend + frontend ;
- ajout du lancement du stack avec `docker compose up -d --wait` ;
- ajout de smoke tests avec `curl` ;
- ajout d'un upload du rapport coverage `htmlcov`.

Point de vigilance :

- la CI a besoin de `dataset_ProjetML_2026.csv` et du dossier `models/` ;
- ces fichiers sont actuellement ignores par `.gitignore` car ils doivent idealement etre geres par DVC ;
- apres l'etape DVC, il faudra ajouter un `dvc pull` dans le workflow pour restaurer dataset et modeles avant les tests.

Decision finale :

La CI/CD est prete pour un depot contenant les artefacts necessaires ou pour une integration DVC prochaine.

### Interaction 9 - Configuration DVC

Date : 2026-05-12  
Type : DVC / reproductibilite  
Niveau charte : Orange

Prompt utilise :

```text
yalla mon amioe dvc
```

Objectif :

- initialiser DVC dans le depot ;
- versionner le dataset et les modeles avec DVC ;
- creer un pipeline `dvc.yaml` reproductible ;
- verifier `dvc repro` ;
- preparer GitHub Actions pour utiliser `dvc pull` quand un remote partage sera configure.

Action realisee avec l'aide de l'IA :

- installation/verifications de DVC ;
- initialisation de `.dvc/` ;
- ajout de `dataset_ProjetML_2026.csv` avec `dvc add` ;
- ajout du dossier `models/` avec `dvc add` ;
- creation de `scripts/validate_dvc_artifacts.py` ;
- creation d'une etape DVC `validate_artifacts` dans `dvc.yaml` ;
- execution de `dvc repro` ;
- generation de `reports/dvc_metrics.json` ;
- configuration d'un remote DVC local de test dans `C:\tmp\eco-smart-dvc-remote` ;
- execution de `dvc push` vers ce remote local ;
- mise a jour de GitHub Actions pour installer DVC et lancer `dvc pull` si un remote partage existe.

Verification realisee :

- `dvc status` retourne : donnees et pipelines a jour ;
- `dvc repro` fonctionne ;
- `dvc metrics show` affiche les metriques ;
- dataset valide : 10500 lignes, 9 colonnes, 514 categories manquantes ;
- modeles valides : 8 fichiers, taille totale 1793525 octets ;
- `dvc push` local : 9 fichiers pousses.

Point de vigilance :

- le remote local sert seulement au test sur cette machine ;
- pour GitHub Actions et le travail collaboratif, il faut configurer un remote partage accessible depuis GitHub, par exemple Google Drive, S3, Azure, SSH ou autre stockage distant.

Decision finale :

DVC est operationnel localement. La prochaine amelioration consiste a choisir et configurer un remote DVC partage pour que GitHub Actions puisse restaurer automatiquement dataset et modeles.

## Choix techniques a justifier dans le rapport

### Nettoyage et imputation

Choix actuel :

- comparaison mediane, KNNImputer et IterativeImputer ;
- utilisation d'IterativeImputer dans le notebook pour continuer le pipeline ;
- traitement des outliers par capping IQR.

Justification a developper :

- expliquer pourquoi l'imputation iterative peut mieux exploiter les relations entre variables ;
- montrer les limites : risque de complexite, dependance aux correlations et au dataset ;
- comparer visuellement les distributions avant/apres imputation.

### Modeles numeriques

Choix actuel :

- comparaison Logistic Regression, Random Forest, Gradient Boosting et SVM ;
- tuning avec GridSearchCV ;
- matrice de confusion et importance de variables.

Justification a developper :

- ne pas se contenter du meilleur score ;
- expliquer precision, rappel, confusion entre classes ;
- discuter le risque de score trop eleve si les features sont tres separables ou si fuite de donnees.

### Regression du prix

Choix actuel :

- comparaison Linear Regression, Random Forest Regressor et Gradient Boosting Regressor ;
- evaluation avec R2 et RMSE.

Justification a developper :

- expliquer pourquoi R2 seul ne suffit pas ;
- analyser les erreurs importantes ;
- verifier si `Prix_Revente` est bien exclu des features quand il est la cible.

### NLP

Choix actuel :

- nettoyage texte ;
- suppression des stopwords francais et mots du domaine ;
- comparaison Bag of Words, TF-IDF, Word2Vec et FastText ;
- comparaison Naive Bayes, Logistic Regression, LinearSVC et Random Forest.

Justification a developper :

- expliquer pourquoi TF-IDF avec unigrammes + bigrammes est une bonne reference ;
- comparer avec Word2Vec/FastText ;
- ajouter une discussion sur les limites du nettoyage sans vraie lemmatisation.

### Pipeline multimodal

Choix actuel :

- fusion sparse avec `hstack` ;
- combinaison features textuelles TF-IDF + features numeriques standardisees ;
- comparaison texte seul, numerique seul et combine.

Justification a developper :

- expliquer pourquoi la fusion multimodale peut ameliorer la robustesse ;
- discuter la ponderation relative texte/numerique ;
- mentionner que `ColumnTransformer` serait preferable pour une reproductibilite industrielle.

### MLOps

Choix actuel :

- MLflow utilise dans le notebook avec 5 experiences ;
- modele enregistre dans le Model Registry.

Points restants :

- ajouter DVC ;
- ajouter tests ;
- ajouter CI/CD ;
- ajouter Docker ;
- ajouter monitoring drift ;
- documenter l'execution reproductible dans le README.

## Regles de mise a jour du journal

A chaque nouvelle utilisation importante de l'IA, ajouter :

- la date ;
- le prompt ;
- l'objectif ;
- la reponse retenue ;
- ce qui a ete verifie manuellement ;
- les limites ou corrections apportees ;
- la decision finale.

## Points de vigilance

- Ne pas presenter un fichier genere par IA comme non verifie.
- Garder les scores ML critiques : un score tres eleve doit etre explique.
- Verifier que les fichiers annonces dans le README existent vraiment.
- Ne pas mettre les donnees et modeles lourds directement dans Git ; utiliser DVC ou `.gitignore`.
- Garder le projet reproductible avec des commandes simples.
