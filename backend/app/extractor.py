import os
from pypdf import PdfReader
import docx

def extract_text(file_path: str, file_type: str) -> tuple[str, str]:
    """
    Extracts text from the given file_path based on file_type.
    Returns: (extracted_text_content, extraction_method_name)
    Raises ValueError for unsupported formats.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    ext = file_type.upper()

    if ext == "PDF":
        try:
            reader = PdfReader(file_path)
            pages_text = []
            for page in reader.pages:
                pages_text.append(page.extract_text() or "")
            return "\n".join(pages_text), "PYPDF_EXTRACTOR"
        except Exception as e:
            raise RuntimeError(f"PDF extraction failed: {str(e)}")

    elif ext in ("DOCX", "DOC"):
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs]
            return "\n".join(paragraphs), "PYTHON_DOCX_EXTRACTOR"
        except Exception as e:
            raise RuntimeError(f"DOCX extraction failed: {str(e)}")

    elif ext in ("TXT", "MD", "CSV", "JSON"):
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read(), "UTF8_TEXT_EXTRACTOR"
        except Exception as e:
            raise RuntimeError(f"Text file read failed: {str(e)}")

    else:
        raise ValueError(f"Unsupported document format '{ext}' for intelligence indexing")
