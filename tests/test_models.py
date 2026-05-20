import joblib
import pytest
from scipy.sparse import csr_matrix, hstack

import main
from conftest import EXPECTED_CATEGORIES, MODELS_DIR


REQUIRED_MODEL_FILES = [
    "model_classification.pkl",
    "model_regression.pkl",
    "scaler.pkl",
    "model_nlp.pkl",
    "tfidf_vectorizer.pkl",
    "model_multi.pkl",
    "tfidf_multi.pkl",
    "scaler_multi.pkl",
]


@pytest.mark.model
def test_required_model_files_exist():
    for filename in REQUIRED_MODEL_FILES:
        path = MODELS_DIR / filename
        assert path.exists()
        assert path.stat().st_size > 0


@pytest.mark.model
def test_get_models_loads_required_objects():
    models = main.get_models()

    assert set(models) >= {
        "classification",
        "regression",
        "scaler",
        "nlp",
        "tfidf",
        "multi",
        "tfidf_multi",
        "scaler_multi",
    }
    for model in models.values():
        assert model is not None


@pytest.mark.model
def test_tfidf_vectorizer_transforms_text():
    vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer.pkl")
    matrix = vectorizer.transform(["plastique leger recyclable"])

    assert matrix.shape[0] == 1
    assert matrix.shape[1] > 0
    assert hasattr(matrix, "tocsr")


@pytest.mark.model
def test_nlp_model_predicts_known_category():
    models = main.get_models()
    text = main.nettoyer_texte("materiau verre transparent rigide")
    features = models["tfidf"].transform([text])

    prediction = str(models["nlp"].predict(features)[0])

    assert prediction in EXPECTED_CATEGORIES


@pytest.mark.model
def test_multimodal_model_predicts_known_category():
    models = main.get_models()
    text_features = models["tfidf_multi"].transform([""])
    numeric_features = models["scaler_multi"].transform([[50, 100, 0.1, 1.0, 5.0]])
    features = hstack([text_features, csr_matrix(numeric_features)])

    prediction = str(models["multi"].predict(features)[0])

    assert prediction in EXPECTED_CATEGORIES
