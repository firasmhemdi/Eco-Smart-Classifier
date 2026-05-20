import pytest

from conftest import EXPECTED_CATEGORIES


@pytest.mark.api
def test_home_endpoint_returns_message(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert "message" in response.json()
    assert "Eco-Smart Classifier API" in response.json()["message"]


@pytest.mark.api
def test_stats_endpoint_returns_expected_metrics(client):
    response = client.get("/data/stats")
    data = response.json()

    assert response.status_code == 200
    assert data["total_lignes"] > 0
    assert data["total_labellise"] > 0
    assert set(data["categories"]) >= {"Papier", "Plastique", "Verre"}
    assert data["accuracy_classification"] >= 70
    assert data["r2_regression"] > 0


@pytest.mark.api
def test_classification_endpoint_returns_category(client, numeric_payload):
    response = client.post("/predict/classification", json=numeric_payload)
    data = response.json()

    assert response.status_code == 200
    assert data["categorie"] in EXPECTED_CATEGORIES
    assert data["modele_utilise"] == "model_classification.pkl"


@pytest.mark.api
def test_regression_endpoint_returns_price_and_category(client, numeric_payload):
    response = client.post("/predict/regression", json=numeric_payload)
    data = response.json()

    assert response.status_code == 200
    assert data["categorie"] in EXPECTED_CATEGORIES
    assert isinstance(data["prix_estime"], (int, float))
    assert data["prix_estime"] > 0
    assert data["devise"] == "TND"
    assert data["modele_prix"] == "model_regression.pkl"
    assert data["calibration"] == "minimum_prix_par_kg"


@pytest.mark.api
def test_regression_price_increases_for_heavier_same_paper_payload(client):
    light_payload = {
        "poids": 87,
        "volume": 35,
        "conductivite": 0.1,
        "opacite": 1.0,
        "rigidite": 5.0,
    }
    heavy_payload = {**light_payload, "poids": 252}

    light = client.post("/predict/regression", json=light_payload).json()
    heavy = client.post("/predict/regression", json=heavy_payload).json()

    assert light["categorie"] == "Papier"
    assert heavy["categorie"] == "Papier"
    assert heavy["prix_estime"] > light["prix_estime"]


@pytest.mark.api
def test_nlp_endpoint_returns_category_and_cleaned_text(client):
    payload = {"texte": "Lot 123: materiau plastique leger, opaque et recyclable!"}

    response = client.post("/predict/nlp", json=payload)
    data = response.json()

    assert response.status_code == 200
    assert data["categorie"] in EXPECTED_CATEGORIES
    assert "texte_nettoye" in data
    assert "123" not in data["texte_nettoye"]
    assert "!" not in data["texte_nettoye"]


@pytest.mark.api
def test_classification_endpoint_rejects_invalid_payload(client):
    response = client.post("/predict/classification", json={"poids": "invalid"})

    assert response.status_code == 422
