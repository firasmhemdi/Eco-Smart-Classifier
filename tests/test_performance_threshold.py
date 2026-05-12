import pytest

import main


@pytest.mark.model
def test_reported_model_performance_passes_minimum_threshold():
    stats = main.stats_dataset()

    assert stats["accuracy_classification"] >= 70
    assert stats["accuracy_nlp"] >= 70
    assert stats["accuracy_multimodal"] >= 70
