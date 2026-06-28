def chunk_text(text: str, chunk_size: int = 750, overlap: int = 150) -> list[dict]:
    """
    Splits text into logical paragraph-bounded chunks of max size `chunk_size`
    with `overlap` character overlap.
    Returns: list of dicts containing chunk properties.
    """
    if not text or not text.strip():
        return []

    # Split on newlines to preserve paragraph boundaries
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = [text.strip()]

    chunks = []
    current_chunk_parts = []
    current_size = 0
    chunk_index = 0

    for para in paragraphs:
        # Handle single paragraphs larger than chunk_size by splitting them by sentence or characters
        if len(para) > chunk_size:
            # If we have accumulated previous parts, flush them first
            if current_chunk_parts:
                chunk_content = "\n".join(current_chunk_parts)
                chunks.append({
                    "chunk_index": chunk_index,
                    "chunk_text": chunk_content,
                    "character_count": len(chunk_content)
                })
                chunk_index += 1
                current_chunk_parts = []
                current_size = 0

            # Split large paragraph into sentence-like or character chunks
            start = 0
            while start < len(para):
                end = min(start + chunk_size, len(para))
                sub_chunk = para[start:end]
                chunks.append({
                    "chunk_index": chunk_index,
                    "chunk_text": sub_chunk,
                    "character_count": len(sub_chunk)
                })
                chunk_index += 1
                start += (chunk_size - overlap)
            continue

        # Normal grouping
        if current_size + len(para) > chunk_size and current_chunk_parts:
            chunk_content = "\n".join(current_chunk_parts)
            chunks.append({
                "chunk_index": chunk_index,
                "chunk_text": chunk_content,
                "character_count": len(chunk_content)
            })
            chunk_index += 1

            # Build overlap
            overlap_parts = []
            overlap_size = 0
            for part in reversed(current_chunk_parts):
                if overlap_size + len(part) <= overlap:
                    overlap_parts.insert(0, part)
                    overlap_size += len(part)
                else:
                    break
            current_chunk_parts = overlap_parts
            current_size = overlap_size

        current_chunk_parts.append(para)
        current_size += len(para)

    # Flush any remaining text
    if current_chunk_parts:
        chunk_content = "\n".join(current_chunk_parts)
        if len(chunk_content) > 15 or not chunks:
            chunks.append({
                "chunk_index": chunk_index,
                "chunk_text": chunk_content,
                "character_count": len(chunk_content)
            })

    return chunks
