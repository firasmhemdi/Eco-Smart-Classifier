import pandas as pd
import pytest

from conftest import DATASET_PATH, EXPECTED_COLUMNS, NUMERIC_COLUMNS


@pytest.mark.data
def test_dataset_file_exists():
    assert DATASET_PATH.exists()
    assert DATASET_PATH.stat().st_size > 0


@pytest.mark.data
def test_dataset_has_expected_schema():
    df = pd.read_csv(DATASET_PATH, nrows=50)

    assert EXPECTED_COLUMNS.issubset(df.columns)
    assert not df.empty


@pytest.mark.data
def test_numeric_columns_are_numeric():
    df = pd.read_csv(DATASET_PATH, usecols=NUMERIC_COLUMNS, nrows=200)

    for column in NUMERIC_COLUMNS:
        converted = pd.to_numeric(df[column], errors="coerce")
        non_null_original = df[column].notna().sum()
        non_null_converted = converted.notna().sum()
        assert non_null_converted == non_null_original


@pytest.mark.data
def test_dataset_contains_target_categories():
    df = pd.read_csv(DATASET_PATH, usecols=["Categorie"])
    categories = set(df["Categorie"].dropna().unique())

    assert len(categories) >= 4
    assert categories & {"Papier", "Plastique", "Verre"}
