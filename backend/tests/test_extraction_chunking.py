import pytest
from backend.app.services.extraction_service import ExtractionService, ExtractionError
from backend.app.services.chunking_service import ChunkingService


def test_pdf_extraction_page_accuracy(generate_sample_pdf, tmp_path):
    """Verifies that PyMuPDF accurately extracts text page by page with 1-based indexing."""
    pdf_path = str(tmp_path / "research_paper.pdf")
    page1_text = "Clinical trial began in January 2026 with 450 subjects."
    page2_text = "Secondary endpoints were met with statistical significance."
    generate_sample_pdf(pdf_path, [page1_text, page2_text])

    extracted = ExtractionService.extract_pdf(pdf_path)
    assert len(extracted) == 2
    assert extracted[0]["page_number"] == 1
    assert page1_text in extracted[0]["text_content"]
    assert extracted[1]["page_number"] == 2
    assert page2_text in extracted[1]["text_content"]


def test_scanned_pdf_without_text_fails_honestly(generate_sample_pdf, tmp_path):
    """
    Verifies that a PDF with zero extractable text raises an honest ExtractionError
    disclosing that OCR is not enabled, instead of pretending text was found.
    """
    pdf_path = str(tmp_path / "scanned_doc.pdf")
    # Empty page with 0 text
    generate_sample_pdf(pdf_path, [""])

    with pytest.raises(ExtractionError) as exc_info:
        ExtractionService.extract_pdf(pdf_path)

    assert "no extractable text" in str(exc_info.value).lower()
    assert "ocr is not enabled" in str(exc_info.value).lower()


def test_txt_extraction_accuracy(tmp_path):
    """Verifies text extraction from TXT files with page 1 mapping."""
    txt_path = str(tmp_path / "sample.txt")
    text_content = "This is a direct text file describing experimental parameters."
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text_content)

    extracted = ExtractionService.extract_txt(txt_path)
    assert len(extracted) == 1
    assert extracted[0]["page_number"] == 1
    assert extracted[0]["text_content"] == text_content


def test_chunking_boundaries_and_metadata_preservation():
    """
    Verifies that ChunkingService splits sentences cleanly, preserves page numbers,
    computes character coordinates, and retains overlapping sentences.
    """
    chunker = ChunkingService(chunk_size=30, chunk_overlap=10)

    sample_pages = [
        {
            "page_number": 1,
            "text_content": (
                "First sentence establishes foundational context. "
                "Second sentence provides supporting experimental observations. "
                "Third sentence elaborates on statistical deviations. "
                "Fourth sentence summarizes the primary methodology."
            )
        },
        {
            "page_number": 2,
            "text_content": (
                "Fifth sentence begins the subsequent chapter. "
                "Sixth sentence delivers final conclusions."
            )
        }
    ]

    chunks = chunker.chunk_document(document_id="doc_abc123", pages=sample_pages)
    assert len(chunks) > 1

    for i, c in enumerate(chunks):
        assert c["document_id"] == "doc_abc123"
        assert c["chunk_index"] == i
        assert c["page_number"] in [1, 2]
        assert c["character_start"] >= 0
        assert c["character_end"] > c["character_start"]
        assert len(c["text_content"]) > 0
        assert c["token_count"] > 0
