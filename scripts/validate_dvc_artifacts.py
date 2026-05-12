import csv
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = PROJECT_ROOT / "dataset_ProjetML_2026.csv"
MODELS_DIR = PROJECT_ROOT / "models"
REPORTS_DIR = PROJECT_ROOT / "reports"
METRICS_PATH = REPORTS_DIR / "dvc_metrics.json"

EXPECTED_COLUMNS = [
    "Poids",
    "Volume",
    "Conductivite",
    "Opacite",
    "Rigidite",
    "Prix_Revente",
    "Source",
    "Rapport_Collecte",
    "Categorie",
]

REQUIRED_MODEL_FILES = [
    "model_classification.pkl",
    "model_regression.pkl",
    "model_nlp.pkl",
    "model_multi.pkl",
    "tfidf_vectorizer.pkl",
    "tfidf_multi.pkl",
    "scaler.pkl",
    "scaler_multi.pkl",
]


def validate_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    category_counts = {}
    missing_categories = 0
    row_count = 0

    with DATASET_PATH.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        columns = reader.fieldnames or []
        missing_columns = sorted(set(EXPECTED_COLUMNS) - set(columns))
        if missing_columns:
            raise ValueError(f"Missing columns: {missing_columns}")

        for row in reader:
            row_count += 1
            category = (row.get("Categorie") or "").strip()
            if category:
                category_counts[category] = category_counts.get(category, 0) + 1
            else:
                missing_categories += 1

    if row_count == 0:
        raise ValueError("Dataset is empty")

    return {
        "rows": row_count,
        "columns": len(EXPECTED_COLUMNS),
        "missing_categories": missing_categories,
        "category_counts": category_counts,
    }


def validate_models():
    if not MODELS_DIR.exists():
        raise FileNotFoundError(f"Models directory not found: {MODELS_DIR}")

    model_sizes = {}
    for filename in REQUIRED_MODEL_FILES:
        path = MODELS_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Required model file not found: {path}")
        if path.stat().st_size <= 0:
            raise ValueError(f"Model file is empty: {path}")
        model_sizes[filename] = path.stat().st_size

    return {
        "count": len(REQUIRED_MODEL_FILES),
        "total_size_bytes": sum(model_sizes.values()),
        "files": model_sizes,
    }


def main():
    metrics = {
        "dataset": validate_dataset(),
        "models": validate_models(),
    }

    REPORTS_DIR.mkdir(exist_ok=True)
    METRICS_PATH.write_text(
        json.dumps(metrics, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"DVC metrics written to {METRICS_PATH}")


if __name__ == "__main__":
    main()
