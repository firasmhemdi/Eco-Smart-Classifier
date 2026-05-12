# Plan de tests - Eco-Smart Classifier

Ce plan indique les tests a ecrire manuellement pour respecter le cahier des charges.

## 1. Tests schema dataset

Fichier suggere : `tests/test_data_schema.py`

Verifier :

- le fichier `dataset_ProjetML_2026.csv` existe ou est restaure via DVC ;
- les colonnes attendues sont presentes :
  - `Poids`
  - `Volume`
  - `Conductivite`
  - `Opacite`
  - `Rigidite`
  - `Prix_Revente`
  - `Source`
  - `Rapport_Collecte`
  - `Categorie`
- les colonnes numeriques sont bien numeriques ;
- le dataset n'est pas vide ;
- les categories connues sont controlees : Metal, Papier, Plastique, Verre.

## 2. Tests qualite post-imputation

Fichier suggere : `tests/test_preprocessing.py`

Verifier :

- apres imputation, les features numeriques ne contiennent plus de NaN ;
- le capping IQR ne supprime pas toutes les lignes ;
- la standardisation conserve le meme nombre de lignes ;
- les colonnes one-hot de `Source` sont creees.

## 3. Tests NLP

Fichier suggere : `tests/test_nlp.py`

Verifier :

- `nettoyer_texte` met le texte en minuscules ;
- les chiffres sont supprimes ;
- la ponctuation est supprimee ;
- les stopwords generiques et du domaine sont retires ;
- les mots courts sont retires ;
- une description non vide donne un texte nettoye non vide.

## 4. Tests vectorisation

Fichier suggere : `tests/test_vectorization.py`

Verifier :

- `models/tfidf_vectorizer.pkl` se charge ;
- `models/tfidf_multi.pkl` se charge ;
- une phrase transformee produit une matrice sparse ;
- le nombre de colonnes de la matrice est superieur a 0.

## 5. Tests modeles

Fichier suggere : `tests/test_models.py`

Verifier :

- les fichiers `.pkl` necessaires existent ;
- les modeles se chargent sans erreur ;
- une prediction numerique retourne une categorie non vide ;
- une prediction NLP retourne une categorie non vide ;
- la categorie retournee appartient aux categories attendues.

## 6. Tests API

Fichier suggere : `tests/test_api.py`

Verifier avec `fastapi.testclient.TestClient` :

- `GET /` retourne 200 ;
- `GET /data/stats` retourne les metriques attendues ;
- `POST /predict/classification` retourne 200 et une categorie ;
- `POST /predict/regression` retourne 200 et un prix estime ;
- `POST /predict/nlp` retourne 200, une categorie et `texte_nettoye` ;
- un payload invalide retourne une erreur 422.

## 7. Test seuil performance

Fichier suggere : `tests/test_performance_threshold.py`

Verifier :

- l'accuracy du modele final sur un jeu de validation/test est >= 0.70 ;
- ce test doit utiliser les donnees de test ou un artefact d'evaluation reproductible ;
- ne pas reutiliser les donnees d'entrainement comme preuve de performance.

## Commandes

Installer les dependances de test :

```bash
pip install -r requirements-dev.txt
```

Lancer les tests :

```bash
pytest
```

Lancer avec rapport coverage HTML :

```bash
pytest --cov=main --cov-report=term-missing --cov-report=html
```

Le rapport HTML sera dans `htmlcov/`.
