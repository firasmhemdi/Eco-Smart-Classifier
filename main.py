from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import numpy as np
from pathlib import Path
import re
import unicodedata

app = FastAPI(title="Eco-Smart Classifier API")
STATIC_DIR = Path(__file__).resolve().parent / "static"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOPWORDS = {
    "le","la","les","un","une","des","de","du","en","et","est",
    "au","aux","par","sur","dans","ou","a","se","ce","qui","que",
    "qu","il","elle","ils","elles","nous","vous","on","y","si",
    "ne","pas","plus","tres","avec","pour","son","sa","ses","leur",
    "leurs","dont","lot","dechet","collecte","site","volume","poids",
    "type","provenance","identifie","recupere","materiau","materiaux",
    "à","très","déchet","collecté","identifié","récupéré","matériau",
    "matériaux"
}

CATEGORY_BY_ID = {
    "0": "MÃ©tal",
    "1": "Papier",
    "2": "Plastique",
    "3": "Verre",
}

CATEGORY_ALIASES = {
    "MÃ©tal": "Métal",
    "MÃƒÂ©tal": "Métal",
    "Métal": "Métal",
    "Metal": "Métal",
    "Papier": "Papier",
    "Plastique": "Plastique",
    "Verre": "Verre",
}

def corriger_encodage_categorie(categorie):
    categorie_str = str(categorie)
    if "tal" in categorie_str and categorie_str.startswith("M"):
        return "Métal"
    return categorie_str

NUMERIC_COLUMNS = ["Poids", "Volume", "Conductivite", "Opacite", "Rigidite"]
SOURCE_COLUMNS = [
    "Source_Centre_Tri",
    "Source_Collecte_Citoyenne",
    "Source_Usine_A",
    "Source_Usine_B",
]

SOURCE_ALIASES = {
    "centre_tri": "Source_Centre_Tri",
    "centre tri": "Source_Centre_Tri",
    "collecte_citoyenne": "Source_Collecte_Citoyenne",
    "collecte citoyenne": "Source_Collecte_Citoyenne",
    "usine_a": "Source_Usine_A",
    "usine a": "Source_Usine_A",
    "usine_b": "Source_Usine_B",
    "usine b": "Source_Usine_B",
}

# Median resale value per kg observed in the cleaned dataset.
PRIX_MIN_PAR_KG = {
    "Métal": 0.30,
    "Papier": 0.05,
    "Plastique": 0.10,
    "Verre": 0.03,
}

NLP_KEYWORDS = {
    "Métal": {
        "metal", "metallique", "fer", "acier", "aluminium", "cuivre",
        "conducteur", "conductivite", "brillant", "rouille", "aimant",
        "canette", "boite",
    },
    "Papier": {
        "papier", "carton", "feuille", "feuilles", "journal", "journaux",
        "magazine", "enveloppe", "souple", "opaque", "leger",
    },
    "Plastique": {
        "plastique", "bouteille", "bidon", "sachet", "emballage",
        "polyethylene", "pet", "pvc", "recyclable", "leger", "semi",
        "alimentaire",
    },
    "Verre": {
        "verre", "vitrage", "transparent", "transparente", "bocal",
        "bris", "casse", "cassons", "bouteille", "rigide", "fragile",
        "dense",
    },
}

STRONG_NLP_KEYWORDS = {
    "Métal": {"metal", "metallique", "fer", "acier", "aluminium", "cuivre"},
    "Papier": {"papier", "carton", "feuille", "feuilles", "journal"},
    "Plastique": {"plastique", "pet", "pvc", "polyethylene"},
    "Verre": {"verre", "vitrage", "bocal"},
}

def normaliser_texte(texte):
    texte = texte.lower()
    texte = unicodedata.normalize("NFKD", texte)
    texte = "".join(char for char in texte if not unicodedata.combining(char))
    return texte

def nettoyer_texte(texte):
    texte = texte.lower()
    texte = re.sub(r'[0-9]', '', texte)
    texte = re.sub(r'[_]', ' ', texte)
    texte = re.sub(r'[^\w\s]', ' ', texte)
    texte = re.sub(r'\s+', ' ', texte).strip()
    mots = [m for m in texte.split() if m not in STOPWORDS and len(m) >= 3]
    return " ".join(mots)

def normaliser_categorie(categorie):
    categorie_str = corriger_encodage_categorie(categorie)
    if categorie_str in CATEGORY_ALIASES:
        return corriger_encodage_categorie(CATEGORY_ALIASES[categorie_str])
    try:
        categorie_num = float(categorie_str)
        if categorie_num.is_integer():
            categorie_str = str(int(categorie_num))
    except ValueError:
        pass
    categorie_norm = CATEGORY_BY_ID.get(categorie_str, CATEGORY_ALIASES.get(categorie_str, categorie_str))
    return corriger_encodage_categorie(categorie_norm)

def vecteur_numerique(data):
    return np.array([[
        data.poids,
        data.volume,
        data.conductivite,
        data.opacite,
        data.rigidite,
    ]], dtype=float)

def encoder_source(source):
    valeurs = {col: 0.0 for col in SOURCE_COLUMNS}
    if source:
        source_key = str(source).strip().lower()
        colonne = SOURCE_ALIASES.get(source_key)
        if colonne:
            valeurs[colonne] = 1.0
    return [valeurs[col] for col in SOURCE_COLUMNS]

def features_regression(data, models):
    numeriques = models["scaler"].transform(vecteur_numerique(data))[0]
    return np.array([list(numeriques) + encoder_source(data.source)], dtype=float)

def predire_prix_modele(data, models):
    X_reg = features_regression(data, models)
    prix = float(models["regression"].predict(X_reg)[0])
    return round(max(prix, 0.0), 2)

def calibrer_prix_par_poids(data, categorie, prix_modele):
    categorie_norm = normaliser_categorie(categorie)
    prix_minimum = PRIX_MIN_PAR_KG.get(categorie_norm)
    if prix_minimum is None:
        return prix_modele
    prix_par_poids = max(data.poids, 0.0) * prix_minimum
    return round(max(prix_modele, prix_par_poids), 2)

def features_classification(data, models, prix_estime=None):
    numeriques = models["scaler"].transform(vecteur_numerique(data))[0]
    prix = data.prix_revente if data.prix_revente is not None else prix_estime
    if prix is None:
        prix = predire_prix_modele(data, models)
    return np.array([list(numeriques) + [float(prix)] + encoder_source(data.source)], dtype=float)

def categorie_par_mots_cles(texte_propre):
    tokens = set(normaliser_texte(texte_propre).split())
    scores = {
        categorie: sum(1 for mot in mots if mot in tokens)
        for categorie, mots in NLP_KEYWORDS.items()
    }
    best_category, best_score = max(scores.items(), key=lambda item: item[1])
    strong_hit = any(mot in tokens for mot in STRONG_NLP_KEYWORDS[best_category])
    if best_score >= 2 or strong_hit:
        return best_category, scores
    return None, scores

def mots_cles_detectes(texte_propre):
    tokens = set(normaliser_texte(texte_propre).split())
    return {
        normaliser_categorie(categorie): sorted(mots & tokens)
        for categorie, mots in NLP_KEYWORDS.items()
        if mots & tokens
    }

def confiance_depuis_modele(modele, X, prediction_modele):
    if not hasattr(modele, "decision_function"):
        return 0.5

    scores = np.asarray(modele.decision_function(X))
    if scores.ndim == 1:
        scores = np.vstack([-scores, scores]).T

    scores = scores[0]
    scores = scores - np.max(scores)
    probabilities = np.exp(scores) / np.exp(scores).sum()
    classes = [normaliser_categorie(categorie) for categorie in modele.classes_]
    confidence_by_class = dict(zip(classes, probabilities))
    return float(confidence_by_class.get(prediction_modele, probabilities.max()))

def niveau_confiance(score):
    if score >= 0.75:
        return "elevee"
    if score >= 0.5:
        return "moyenne"
    return "faible"

def expliquer_prediction_nlp(prediction_finale, prediction_modele, scores, detected, source, confiance):
    best_category, best_score = max(scores.items(), key=lambda item: item[1])
    best_category = normaliser_categorie(best_category)
    mots = detected.get(best_category, [])
    mots_resume = ", ".join(mots[:4])

    if source == "mots_cles+modele" and mots_resume:
        explication = (
            f"La decision finale est {prediction_finale} car le texte contient "
            f"des indices importants: {mots_resume}. Le modele TF-IDF proposait "
            f"{prediction_modele}."
        )
    else:
        explication = (
            f"La decision finale est {prediction_finale}. Aucun mot-cle tres fort "
            f"n'a ete detecte, donc l'API se base surtout sur la similarite TF-IDF "
            f"apprise par le modele."
        )

    if best_score == 0:
        conseil = "Ajoutez des mots plus precis comme plastique, verre, carton, acier, conducteur ou transparent."
    elif confiance < 0.5:
        conseil = "La confiance est faible: ajoutez plus de details sur la matiere, la rigidite, la transparence ou la conductivite."
    else:
        conseil = "La description contient assez d'indices pour justifier la categorie proposee."

    return explication, conseil

def predire_categorie_nlp_hybride(texte_propre, modele, vectorizer):
    X = vectorizer.transform([texte_propre])
    prediction_modele = normaliser_categorie(modele.predict(X)[0])
    prediction_mots_cles, scores = categorie_par_mots_cles(texte_propre)
    prediction_mots_cles = normaliser_categorie(prediction_mots_cles) if prediction_mots_cles else None
    prediction_finale = prediction_mots_cles or prediction_modele
    source = "mots_cles+modele" if prediction_mots_cles else "modele"
    confiance_modele = confiance_depuis_modele(modele, X, prediction_modele)
    meilleur_score_mots = max(scores.values()) if scores else 0

    if prediction_mots_cles:
        confiance = min(0.95, 0.58 + meilleur_score_mots * 0.1)
        if prediction_mots_cles == prediction_modele:
            confiance = min(0.98, confiance + 0.12)
    else:
        confiance = confiance_modele

    detected = mots_cles_detectes(texte_propre)
    explication, conseil = expliquer_prediction_nlp(
        prediction_finale,
        prediction_modele,
        scores,
        detected,
        source,
        confiance,
    )
    return {
        "categorie": prediction_finale,
        "prediction_modele": prediction_modele,
        "scores_mots_cles": scores,
        "mots_cles_detectes": detected,
        "source": source,
        "confiance": round(confiance * 100, 1),
        "niveau_confiance": niveau_confiance(confiance),
        "explication": explication,
        "conseil": conseil,
    }

# ── Chargement lazy des modèles ────────────────────────────
_models = {}

def get_models():
    if not _models:
        import joblib
        _models["classification"] = joblib.load("models/model_classification.pkl")
        _models["regression"] = joblib.load("models/model_regression.pkl")
        _models["scaler"] = joblib.load("models/scaler.pkl")
        _models["nlp"]    = joblib.load("models/model_nlp.pkl")
        _models["tfidf"]  = joblib.load("models/tfidf_vectorizer.pkl")
        _models["multi"]  = joblib.load("models/model_multi.pkl")
        _models["tfidf_multi"]  = joblib.load("models/tfidf_multi.pkl")
        _models["scaler_multi"] = joblib.load("models/scaler_multi.pkl")
    return _models

class DonneesNumeriques(BaseModel):
    poids: float
    volume: float
    conductivite: float
    opacite: float
    rigidite: float
    source: str | None = None
    prix_revente: float | None = None

class DonneesNLP(BaseModel):
    texte: str

@app.get("/health")
def accueil():
    return {"message": "Eco-Smart Classifier API ✅"}

@app.get("/data/stats")
def stats_dataset():
    return {
        "total_lignes": 10500,
        "total_labellise": 9986,
        "categories": {
            "Plastique": 2795,
            "Verre": 2586,
            "Papier": 2318,
            "Métal": 2287
        },
        "accuracy_classification": 99.93,
        "accuracy_nlp": 100.0,
        "accuracy_multimodal": 100.0,
        "r2_regression": 0.74,
        "rmse_regression": 3.95
    }

@app.post("/predict/classification")
def predire_categorie(data: DonneesNumeriques):
    m = get_models()
    prix_modele = predire_prix_modele(data, m)
    X = features_classification(data, m, prix_estime=prix_modele)
    pred = m["classification"].predict(X)[0]
    categorie = normaliser_categorie(pred)
    prix_estime = calibrer_prix_par_poids(data, categorie, prix_modele)
    return {
        "categorie": categorie,
        "modele_utilise": "model_classification.pkl",
        "prix_utilise": prix_estime,
        "prix_modele_brut": prix_modele,
    }

@app.post("/predict/regression")
def predire_prix(data: DonneesNumeriques):
    m = get_models()
    prix_modele = predire_prix_modele(data, m)
    X_class = features_classification(data, m, prix_estime=prix_modele)
    pred = m["classification"].predict(X_class)[0]
    categorie = normaliser_categorie(pred)
    prix = calibrer_prix_par_poids(data, categorie, prix_modele)
    return {
        "prix_estime": prix,
        "prix_modele_brut": prix_modele,
        "devise": "TND",
        "categorie": categorie,
        "modele_prix": "model_regression.pkl",
        "modele_categorie": "model_classification.pkl",
        "calibration": "minimum_prix_par_kg",
    }

@app.post("/predict/nlp")
def predire_nlp(data: DonneesNLP):
    m = get_models()
    texte_propre = nettoyer_texte(data.texte)
    analyse = predire_categorie_nlp_hybride(
        texte_propre,
        m["nlp"],
        m["tfidf"],
    )
    return {
        **analyse,
        "texte_nettoye": texte_propre,
    }

@app.get("/artifacts/{filename}")
def get_artifact(filename: str):
    allowed_files = {"clusters_pca.png", "elbow_method.png"}
    artifact_path = ARTIFACTS_DIR / filename
    if filename not in allowed_files or not artifact_path.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    return FileResponse(artifact_path)


if STATIC_DIR.exists():
    app.mount(
        "/static",
        StaticFiles(directory=STATIC_DIR / "static"),
        name="static",
    )

    @app.get("/")
    def frontend_index():
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/{full_path:path}")
    def frontend_app(full_path: str):
        requested = (STATIC_DIR / full_path).resolve()
        static_root = STATIC_DIR.resolve()
        if requested.is_file() and static_root in requested.parents:
            return FileResponse(requested)
        return FileResponse(STATIC_DIR / "index.html")
else:
    @app.get("/")
    def api_root():
        return {"message": "Eco-Smart Classifier API ✅"}
