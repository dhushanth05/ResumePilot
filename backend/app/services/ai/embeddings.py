from __future__ import annotations

from functools import lru_cache
from typing import Protocol, Sequence

import numpy as np


class EmbeddingBackend(Protocol):
    def embed(self, texts: Sequence[str]) -> list[list[float]]:  # pragma: no cover - interface
        ...


class SentenceTransformerBackend:
    """
    Local embedding backend using sentence-transformers.

    This backend can be swapped out for a remote service (e.g. OpenAI)
    while preserving the same EmbeddingBackend interface.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self.model_name = model_name
        self._model = None

    @lru_cache(maxsize=1)
    def _load_model(self):
        from sentence_transformers import SentenceTransformer  # type: ignore[import]

        return SentenceTransformer(self.model_name)

    def embed(self, texts: Sequence[str]) -> list[list[float]]:
        model = self._load_model()
        vectors = model.encode(list(texts), convert_to_numpy=True)
        return vectors.tolist()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape:
        raise ValueError("Embedding vectors must have the same shape")
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(a.dot(b) / denom)


def get_default_embedding_backend() -> EmbeddingBackend:
    return SentenceTransformerBackend()

