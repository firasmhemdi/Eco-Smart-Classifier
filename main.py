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

CATEGORY_ALIASES = {
    "MÃ©tal": "Métal",
    "MÃƒÂ©tal": "Métal",
    "Métal": "Métal",
    "Metal": "Métal",
    "Papier": "Papier",
    "Plastique": "Plastique",
    "Verre": "Verre",
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
    return CATEGORY_ALIASES.get(str(categorie), str(categorie))

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

def predire_categorie_nlp_hybride(texte_propre, modele, vectorizer):
    X = vectorizer.transform([texte_propre])
    prediction_modele = normaliser_categorie(modele.predict(X)[0])
    prediction_mots_cles, scores = categorie_par_mots_cles(texte_propre)
    prediction_finale = prediction_mots_cles or prediction_modele
    source = "mots_cles+modele" if prediction_mots_cles else "modele"
    return prediction_finale, prediction_modele, scores, source

# ── Chargement lazy des modèles ────────────────────────────
_models = {}

def get_models():
    if not _models:
        import joblib
        from scipy.sparse import hstack, csr_matrix
        _models["nlp"]    = joblib.load("models/model_nlp.pkl")
        _models["tfidf"]  = joblib.load("models/tfidf_vectorizer.pkl")
        _models["multi"]  = joblib.load("models/model_multi.pkl")
        _models["tfidf_multi"]  = joblib.load("models/tfidf_multi.pkl")
        _models["scaler_multi"] = joblib.load("models/scaler_multi.pkl")
    return _models

PRIX_PAR_CATEGORIE = {
    "Métal"    : 15.0,
    "Papier"   : 3.5,
    "Plastique": 5.0,
    "Verre"    : 2.0,
}

class DonneesNumeriques(BaseModel):
    poids: float
    volume: float
    conductivite: float
    opacite: float
    rigidite: float

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
    from scipy.sparse import hstack, csr_matrix
    m = get_models()
    X_text = m["tfidf_multi"].transform([""])
    X_num  = m["scaler_multi"].transform([[
        data.poids, data.volume, data.conductivite,
        data.opacite, data.rigidite
    ]])
    X = hstack([X_text, csr_matrix(X_num)])
    pred = m["multi"].predict(X)[0]
    return {"categorie": normaliser_categorie(pred)}

@app.post("/predict/regression")
def predire_prix(data: DonneesNumeriques):
    from scipy.sparse import hstack, csr_matrix
    m = get_models()
    X_text = m["tfidf_multi"].transform([""])
    X_num  = m["scaler_multi"].transform([[
        data.poids, data.volume, data.conductivite,
        data.opacite, data.rigidite
    ]])
    X = hstack([X_text, csr_matrix(X_num)])
    pred = m["multi"].predict(X)[0]
    categorie = normaliser_categorie(pred)
    prix_base = PRIX_PAR_CATEGORIE.get(categorie, 5.0)
    facteur = min(data.poids / 100, 2.0)
    prix = round(prix_base * (1 + facteur * 0.3), 2)
    return {"prix_estime": prix, "devise": "TND", "categorie": categorie}

@app.post("/predict/nlp")
def predire_nlp(data: DonneesNLP):
    m = get_models()
    texte_propre = nettoyer_texte(data.texte)
    pred, pred_modele, scores, source = predire_categorie_nlp_hybride(
        texte_propre,
        m["nlp"],
        m["tfidf"],
    )
    return {
        "categorie": pred,
        "texte_nettoye": texte_propre,
        "prediction_modele": pred_modele,
        "scores_mots_cles": scores,
        "source": source,
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
