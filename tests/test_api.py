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


@pytest.mark.api
def test_regression_endpoint_returns_price_and_category(client, numeric_payload):
    response = client.post("/predict/regression", json=numeric_payload)
    data = response.json()

    assert response.status_code == 200
    assert data["categorie"] in EXPECTED_CATEGORIES
    assert isinstance(data["prix_estime"], (int, float))
    assert data["prix_estime"] > 0


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
