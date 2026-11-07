import os
from typing import List, Dict, Any
from backend.app.config import settings


class ExtractionError(Exception):
    """Raised when document extraction fails or file is unreadable."""
    pass


class ExtractionService:
    """Handles text extraction from PDF and TXT documents."""

    @staticmethod
    def extract_pdf(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts text from PDF page by page using PyMuPDF (fitz).
        Returns a list of page dicts with page_number and text_content.
        """
        try:
            import pymupdf as fitz
        except ImportError:
            try:
                import fitz
            except ImportError:
                raise ExtractionError("PyMuPDF library is not installed in the environment.")

        if not os.path.exists(file_path):
            raise ExtractionError(f"PDF file not found at: {file_path}")

        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise ExtractionError(f"Failed to open PDF document: {str(e)}")

        try:
            if doc.is_encrypted:
                raise ExtractionError("Password-protected PDFs are not supported. Please remove the password.")

            page_count = len(doc)
            if page_count == 0:
                raise ExtractionError("PDF document has 0 pages.")

            if page_count > settings.MAX_PDF_PAGES:
                raise ExtractionError(
                    f"PDF document exceeds the maximum limit of {settings.MAX_PDF_PAGES} pages (contains {page_count} pages)."
                )

            extracted_pages = []
            total_text_length = 0

            for page_index in range(page_count):
                page = doc.load_page(page_index)
                page_text = page.get_text("text", sort=True)
                clean_text = page_text.strip()
                total_text_length += len(clean_text)

                extracted_pages.append({
                    "page_number": page_index + 1,
                    "text_content": page_text,
                    "character_count": len(page_text)
                })

            if total_text_length == 0:
                raise ExtractionError(
                    "Scanned PDF contains no extractable text. OCR is not enabled."
                )

            return extracted_pages
        finally:
            doc.close()

    @staticmethod
    def extract_txt(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts text from TXT file with encoding detection and fallback.
        """
        if not os.path.exists(file_path):
            raise ExtractionError(f"TXT file not found at: {file_path}")

        raw_bytes = None
        with open(file_path, "rb") as f:
            raw_bytes = f.read()

        if len(raw_bytes) == 0:
            raise ExtractionError("TXT file is empty (0 bytes).")

        text = None
        for encoding in ["utf-8", "latin-1", "ascii"]:
            try:
                text = raw_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        if text is None:
            raise ExtractionError("Failed to decode text file. Unsupported encoding.")

        clean_text = text.strip()
        if len(clean_text) == 0:
            raise ExtractionError("TXT file contains only whitespace.")

        return [{
            "page_number": 1,
            "text_content": text,
            "character_count": len(text)
        }]

    @classmethod
    def extract_document(cls, file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """Routes file to appropriate extractor based on verified MIME type or extension."""
        ext = os.path.splitext(file_path.lower())[1]
        if file_type == "application/pdf" or ext == ".pdf":
            return cls.extract_pdf(file_path)
        elif file_type == "text/plain" or ext == ".txt":
            return cls.extract_txt(file_path)
        else:
            raise ExtractionError(f"Unsupported document format: {file_type} ({ext})")
