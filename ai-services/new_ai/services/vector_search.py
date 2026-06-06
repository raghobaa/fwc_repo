from db.mongo import resumes_collection
from services.embedder import get_query_embedding


def vector_search(query: str, top_k: int = 5) -> list[dict]:
    """
    Search resumes using MongoDB Atlas Vector Search.
    Requires a vector search index named 'resume_vector_index' on the 'embedding' field.
    """
    query_embedding = get_query_embedding(query)

    if not query_embedding:
        return []

    pipeline = [
        {
            "$vectorSearch": {
                "index": "resume_vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": top_k * 10,
                "limit": top_k
            }
        },
        {
            "$project": {
                "_id": 0,
                "filename": {"$ifNull": ["$filename", "$source_file"]},
                "source_file": 1,
                "chunk_index": 1,
                "candidate_name": 1,
                "text_preview": 1,
                "text": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    try:
        results = list(resumes_collection.aggregate(pipeline))
        return results
    except Exception as e:
        print(f"Vector search error: {e}")
        # Fallback: basic text search if vector index not set up yet
        return fallback_text_search(query, top_k)


def fallback_text_search(query: str, top_k: int = 5) -> list[dict]:
    """Fallback text search when vector index is not available."""
    keywords = query.lower().split()
    regex_pattern = "|".join(keywords)

    results = list(resumes_collection.find(
        {
            "$or": [
                {"full_text": {"$regex": regex_pattern, "$options": "i"}},
                {"text": {"$regex": regex_pattern, "$options": "i"}},
            ]
        },
        {
            "_id": 0,
            "filename": 1,
            "source_file": 1,
            "chunk_index": 1,
            "candidate_name": 1,
            "text_preview": 1,
        }
    ).limit(top_k))

    for result in results:
        if "filename" not in result and "source_file" in result:
            result["filename"] = result["source_file"]

    return results
