from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import main


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = PROJECT_ROOT / "dataset_ProjetML_2026.csv"
MODELS_DIR = PROJECT_ROOT / "models"

EXPECTED_COLUMNS = {
    "Poids",
    "Volume",
    "Conductivite",
    "Opacite",
    "Rigidite",
    "Prix_Revente",
    "Source",
    "Rapport_Collecte",
    "Categorie",
}

NUMERIC_COLUMNS = [
    "Poids",
    "Volume",
    "Conductivite",
    "Opacite",
    "Rigidite",
    "Prix_Revente",
]

EXPECTED_CATEGORIES = {"Metal", "Métal", "MÃ©tal", "Papier", "Plastique", "Verre"}


@pytest.fixture(scope="session")
def client():
    return TestClient(main.app)


@pytest.fixture(scope="session")
def numeric_payload():
    return {
        "poids": 50,
        "volume": 100,
        "conductivite": 0.1,
        "opacite": 1.0,
        "rigidite": 5.0,
    }
