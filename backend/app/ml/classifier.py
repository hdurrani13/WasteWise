"""Text classifier that predicts which bin an item belongs in.

Uses TF-IDF on word and character n-grams plus logistic regression.
Character n-grams help with typos and unseen words that share roots
("aluminium tray" vs "aluminum pie plate").
"""

from __future__ import annotations

import csv
import random
from dataclasses import dataclass
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion, Pipeline

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "items.csv"
EXTRA_PATH = Path(__file__).resolve().parents[2] / "data" / "training_extra.csv"
MODEL_PATH = Path(__file__).resolve().parents[2] / "data" / "model.joblib"

# Modifiers added to item names to create extra training examples
AUGMENT_PREFIXES = ["", "old", "used", "empty", "dirty", "broken", "small", "large", "a", "my"]


@dataclass
class Prediction:
    bin: str
    confidence: float
    alternatives: list[tuple[str, float]]


def load_rows(path: Path = DATA_PATH) -> list[dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def load_extra(path: Path = EXTRA_PATH) -> list[tuple[str, str]]:
    """Material words and synonyms ("aluminium", "styrofoam") that item names alone don't cover."""
    if not path.exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return [(r["text"], r["bin"]) for r in csv.DictReader(f)]


def build_training_set(
    rows: list[dict[str, str]], seed: int = 42, include_extra: bool = True
) -> tuple[list[str], list[str]]:
    rng = random.Random(seed)
    texts, labels = [], []
    for row in rows:
        name = row["name"].lower()
        category = row["category"].lower()
        for prefix in rng.sample(AUGMENT_PREFIXES, k=4):
            texts.append(f"{prefix} {name}".strip())
            labels.append(row["bin"])
        texts.append(f"{name} {category}")
        labels.append(row["bin"])
    if include_extra:
        for text, label in load_extra():
            texts.append(text)
            labels.append(label)
    return texts, labels


def build_pipeline() -> Pipeline:
    features = FeatureUnion(
        [
            ("word", TfidfVectorizer(analyzer="word", ngram_range=(1, 2), sublinear_tf=True)),
            ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True)),
        ]
    )
    return Pipeline([("features", features), ("clf", LogisticRegression(max_iter=2000, C=10.0))])


class BinClassifier:
    def __init__(self, pipeline: Pipeline):
        self.pipeline = pipeline

    @classmethod
    def train(cls, rows: list[dict[str, str]] | None = None) -> BinClassifier:
        texts, labels = build_training_set(rows or load_rows())
        pipeline = build_pipeline()
        pipeline.fit(texts, labels)
        return cls(pipeline)

    @classmethod
    def load_or_train(cls, path: Path = MODEL_PATH) -> BinClassifier:
        if path.exists():
            return cls(joblib.load(path))
        model = cls.train()
        model.save(path)
        return model

    def save(self, path: Path = MODEL_PATH) -> None:
        joblib.dump(self.pipeline, path)

    def predict(self, text: str, top_k: int = 3) -> Prediction:
        probs = self.pipeline.predict_proba([text.lower().strip()])[0]
        ranked = sorted(zip(self.pipeline.classes_, probs), key=lambda p: p[1], reverse=True)
        best_bin, best_conf = ranked[0]
        return Prediction(
            bin=str(best_bin),
            confidence=round(float(best_conf), 3),
            alternatives=[(str(b), round(float(p), 3)) for b, p in ranked[1:top_k]],
        )
