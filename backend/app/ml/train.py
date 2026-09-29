"""Train the bin classifier and report held-out accuracy.

Run from backend/:  python -m app.ml.train
Evaluation uses 5-fold cross-validation that holds out whole items (not just augmented copies of them), so the
score reflects how well the model handles items it has never seen.
"""

from sklearn.metrics import classification_report
from sklearn.model_selection import StratifiedKFold

from .classifier import MODEL_PATH, BinClassifier, build_pipeline, build_training_set, load_rows


def evaluate(n_splits: int = 5, seed: int = 7) -> float:
    rows = load_rows()
    labels = [r["bin"] for r in rows]
    folds = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    y_true, y_pred = [], []
    for train_idx, test_idx in folds.split(rows, labels):
        x_train, y_train = build_training_set([rows[i] for i in train_idx])
        pipeline = build_pipeline().fit(x_train, y_train)
        y_pred += list(pipeline.predict([rows[i]["name"] for i in test_idx]))
        y_true += [labels[i] for i in test_idx]
    print(classification_report(y_true, y_pred, zero_division=0))
    return sum(p == y for p, y in zip(y_pred, y_true)) / len(y_true)


def main() -> None:
    accuracy = evaluate()
    print(f"Cross-validated accuracy on unseen items: {accuracy:.1%}")
    model = BinClassifier.train()
    model.save(MODEL_PATH)
    print(f"Saved model trained on all items to {MODEL_PATH}")


if __name__ == "__main__":
    main()
