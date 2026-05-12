import pytest

import main


@pytest.mark.nlp
def test_nettoyer_texte_lowercases_text():
    assert main.nettoyer_texte("PLASTIQUE RIGIDE") == "plastique rigide"


@pytest.mark.nlp
def test_nettoyer_texte_removes_digits_and_punctuation():
    cleaned = main.nettoyer_texte("Lot 123: plastique, verre!!!")

    assert "123" not in cleaned
    assert ":" not in cleaned
    assert "!" not in cleaned
    assert "plastique" in cleaned
    assert "verre" in cleaned


@pytest.mark.nlp
def test_nettoyer_texte_removes_stopwords_and_short_words():
    cleaned = main.nettoyer_texte("le la un de du en et plastique ax")
    tokens = cleaned.split()

    assert "plastique" in tokens
    assert "le" not in tokens
    assert "la" not in tokens
    assert "ax" not in tokens


@pytest.mark.nlp
def test_nettoyer_texte_collapses_extra_spaces():
    cleaned = main.nettoyer_texte("   plastique      rigide       opaque   ")

    assert cleaned == "plastique rigide opaque"
