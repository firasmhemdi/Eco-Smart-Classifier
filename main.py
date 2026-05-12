from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import re

app = FastAPI(title="Eco-Smart Classifier API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOPWORDS = [
    "le","la","les","un","une","des","de","du","en","et","est",
    "au","aux","par","sur","dans","ou","à","se","ce","qui","que",
    "qu","il","elle","ils","elles","nous","vous","on","y","si",
    "ne","pas","plus","très","avec","pour","son","sa","ses","leur",
    "leurs","dont","lot","déchet","collecté","collecte","site",
    "volume","poids","type","provenance","identifié","récupéré"
]

def nettoyer_texte(texte):
    texte = texte.lower()
    texte = re.sub(r'[0-9]', '', texte)
    texte = re.sub(r'[^\w\s]', '', texte)
    texte = re.sub(r'\s+', ' ', texte).strip()
    mots = [m for m in texte.split() if m not in STOPWORDS and len(m) >= 3]
    return " ".join(mots)

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

@app.get("/")
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
    return {"categorie": str(pred)}

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
    categorie = str(pred)
    prix_base = PRIX_PAR_CATEGORIE.get(categorie, 5.0)
    facteur = min(data.poids / 100, 2.0)
    prix = round(prix_base * (1 + facteur * 0.3), 2)
    return {"prix_estime": prix, "categorie": categorie}

@app.post("/predict/nlp")
def predire_nlp(data: DonneesNLP):
    m = get_models()
    texte_propre = nettoyer_texte(data.texte)
    X = m["tfidf"].transform([texte_propre])
    pred = m["nlp"].predict(X)[0]
    return {"categorie": str(pred), "texte_nettoye": texte_propre}