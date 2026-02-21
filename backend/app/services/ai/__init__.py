"""
AI analysis service layer.

This package provides modular, swappable components for:
- PDF text extraction
- Skill extraction (spaCy)
- Embedding generation (sentence-transformers)
- Similarity and ATS scoring

Implementations are designed so they can run locally or delegate to
external providers (e.g. OpenAI, Pinecone) behind clear interfaces.
"""

