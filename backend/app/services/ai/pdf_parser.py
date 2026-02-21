from typing import Protocol


class PDFParser(Protocol):
    async def extract_text(self, file_bytes: bytes) -> str:  # pragma: no cover - interface
        ...


class LocalPDFParser:
    """
    Placeholder for a production-grade PDF parser.

    In a real deployment, you might use libraries like pdfminer.six,
    PyPDF2, or a hosted document AI service. The async interface keeps
    it compatible with FastAPI's async request lifecycle.
    """

    async def extract_text(self, file_bytes: bytes) -> str:
        """
        Extract text from a PDF using PyPDF2.

        This is intentionally simple; in production you may want more
        robust handling (OCR, layout-aware parsing, etc.).
        """
        from PyPDF2 import PdfReader  # type: ignore[import]

        try:
            reader = PdfReader.from_bytes(file_bytes)
        except AttributeError:
            # Fallback for older PyPDF2 API
            from io import BytesIO

            reader = PdfReader(BytesIO(file_bytes))

        texts: list[str] = []
        for page in reader.pages:
            try:
                page_text = page.extract_text() or ""
            except Exception:
                page_text = ""
            if page_text:
                texts.append(page_text)
        extracted = "\n".join(texts)
        if extracted.strip():
            return extracted

        try:
            import pdfplumber  # type: ignore[import]
            from io import BytesIO

            with pdfplumber.open(BytesIO(file_bytes)) as pdf:
                pages = []
                for p in pdf.pages:
                    t = p.extract_text() or ""
                    if t:
                        pages.append(t)
                extracted = "\n".join(pages)
        except Exception:
            extracted = ""

        return extracted

