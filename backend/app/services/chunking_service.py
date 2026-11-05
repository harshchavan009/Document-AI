import re
from typing import List, Dict, Any


class ChunkingService:
    """
    Sentence-aware token chunking service that preserves page numbers
    and character coordinates for precise citation tracking and preview.
    """

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Token estimator using standard 4-character approximation per token.
        Provides fast, deterministic token counts matching English text distributions.
        """
        if not text:
            return 0
        return max(1, len(text) // 4)

    def split_page_into_sentences(self, text: str) -> List[str]:
        """Splits page text into sentences while preserving whitespace integrity."""
        paragraphs = text.split("\n\n")
        sentences = []
        for p in paragraphs:
            clean_p = p.strip()
            if not clean_p:
                continue
            # Split on sentence boundaries (. ! ?) followed by whitespace
            parts = re.split(r'(?<=[.!?])\s+', clean_p)
            for part in parts:
                clean_part = part.strip()
                if clean_part:
                    sentences.append(clean_part)
        return sentences

    def chunk_document(
        self,
        document_id: str,
        pages: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generates overlapping chunks from extracted pages.
        Retains page numbers, sequence indices, and character offsets.
        """
        chunks = []
        chunk_index = 0

        for page_data in pages:
            page_num = page_data["page_number"]
            page_text = page_data["text_content"]
            sentences = self.split_page_into_sentences(page_text)

            if not sentences:
                continue

            current_sentences = []
            current_token_count = 0

            for sentence in sentences:
                sentence_tokens = self.estimate_tokens(sentence)

                if current_token_count + sentence_tokens > self.chunk_size and current_sentences:
                    chunk_text = " ".join(current_sentences)
                    char_start = page_text.find(current_sentences[0])
                    if char_start == -1:
                        char_start = 0
                    char_end = char_start + len(chunk_text)

                    chunks.append({
                        "id": f"{document_id}_{chunk_index}",
                        "document_id": document_id,
                        "chunk_index": chunk_index,
                        "page_number": page_num,
                        "character_start": max(0, char_start),
                        "character_end": char_end,
                        "text_content": chunk_text,
                        "token_count": current_token_count
                    })
                    chunk_index += 1

                    # Retain overlap sentences
                    overlap_sentences = []
                    overlap_tokens = 0
                    for s in reversed(current_sentences):
                        s_tokens = self.estimate_tokens(s)
                        if overlap_tokens + s_tokens <= self.chunk_overlap:
                            overlap_sentences.insert(0, s)
                            overlap_tokens += s_tokens
                        else:
                            break

                    current_sentences = overlap_sentences + [sentence]
                    current_token_count = overlap_tokens + sentence_tokens
                else:
                    current_sentences.append(sentence)
                    current_token_count += sentence_tokens

            # Flush remaining sentences for this page
            if current_sentences:
                chunk_text = " ".join(current_sentences)
                char_start = page_text.find(current_sentences[0])
                if char_start == -1:
                    char_start = 0
                char_end = char_start + len(chunk_text)

                chunks.append({
                    "id": f"{document_id}_{chunk_index}",
                    "document_id": document_id,
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "character_start": max(0, char_start),
                    "character_end": char_end,
                    "text_content": chunk_text,
                    "token_count": current_token_count
                })
                chunk_index += 1

        return chunks
