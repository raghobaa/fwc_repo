from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import shutil
import os
import uuid
from services.extractor import extract_text, chunk_text
from services.embedder import get_embedding
from db.mongo import resumes_collection

router = APIRouter()

UPLOAD_DIR = "temp_resumes"
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


def save_uploaded_file(upload_file: UploadFile) -> str:
    """Save uploaded file to temp directory using shutil and return path."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Use unique name to avoid conflicts
    unique_name = f"{uuid.uuid4()}_{upload_file.filename}"
    dest_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save using shutil
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return dest_path


def process_resume_file(file_path: str, original_filename: str) -> dict:
    """Extract text, chunk, embed, and store resume in MongoDB."""

    # Extract text
    full_text = extract_text(file_path)
    if not full_text:
        return {"filename": original_filename, "status": "failed", "reason": "No text extracted"}

    # Take first 200 chars as preview
    text_preview = full_text[:200] + "..." if len(full_text) > 200 else full_text

    # Try to extract candidate name (first non-empty line usually)
    lines = [l.strip() for l in full_text.split("\n") if l.strip()]
    candidate_name = lines[0] if lines else original_filename

    # Chunk text and embed (use full text for single embedding, chunked for large docs)
    chunks = chunk_text(full_text)
    primary_text = chunks[0] if chunks else full_text

    # Generate embedding from first meaningful chunk
    embedding = get_embedding(primary_text[:2000])  # Gemini has token limits

    if not embedding:
        return {"filename": original_filename, "status": "failed", "reason": "Embedding failed"}

    # Check if resume already exists (avoid duplicates)
    existing = resumes_collection.find_one({"filename": original_filename})
    if existing:
        resumes_collection.update_one(
            {"filename": original_filename},
            {"$set": {
                "full_text": full_text,
                "text_preview": text_preview,
                "candidate_name": candidate_name,
                "embedding": embedding
            }}
        )
        return {"filename": original_filename, "status": "updated"}

    # Store in MongoDB
    resumes_collection.insert_one({
        "filename": original_filename,
        "candidate_name": candidate_name,
        "full_text": full_text,
        "text_preview": text_preview,
        "embedding": embedding
    })

    return {"filename": original_filename, "status": "success"}


@router.post("/upload")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    Upload multiple resume files (entire folder contents).
    Frontend sends all files from a folder using webkitdirectory.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    results = []
    saved_paths = []

    for upload_file in files:
        filename = upload_file.filename or ""
        ext = os.path.splitext(filename)[1].lower()

        if ext not in SUPPORTED_EXTENSIONS:
            results.append({
                "filename": filename,
                "status": "skipped",
                "reason": f"Unsupported format: {ext}"
            })
            continue

        try:
            # Save file using shutil
            file_path = save_uploaded_file(upload_file)
            saved_paths.append(file_path)

            # Process: extract → embed → store
            result = process_resume_file(file_path, filename)
            results.append(result)

        except Exception as e:
            results.append({
                "filename": filename,
                "status": "failed",
                "reason": str(e)
            })

    # Cleanup temp files after processing
    for path in saved_paths:
        try:
            os.remove(path)
        except Exception:
            pass

    success_count = sum(1 for r in results if r["status"] in ("success", "updated"))
    failed_count = sum(1 for r in results if r["status"] == "failed")
    skipped_count = sum(1 for r in results if r["status"] == "skipped")

    return {
        "message": f"Processed {len(files)} files",
        "summary": {
            "success": success_count,
            "failed": failed_count,
            "skipped": skipped_count
        },
        "details": results
    }


@router.get("/resumes")
async def list_resumes():
    """List all uploaded resumes."""
    resumes = list(resumes_collection.find(
        {},
        {"_id": 0, "filename": 1, "candidate_name": 1, "text_preview": 1}
    ))
    return {"total": len(resumes), "resumes": resumes}


@router.delete("/resumes/{filename}")
async def delete_resume(filename: str):
    """Delete a resume by filename."""
    result = resumes_collection.delete_one({"filename": filename})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": f"Deleted {filename}"}
