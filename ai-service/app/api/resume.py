import os
import secrets

from fastapi import APIRouter, File, Header, HTTPException, UploadFile

from app.schemas.resume import ResumeAnalysis
from app.services.analyzer import analyze
from app.services.extract import MAX_BYTES, ExtractionError, detect_kind, extract_text

router = APIRouter(prefix="/ai/resume", tags=["resume"])


def _check_token(token: str | None) -> None:
    expected = os.getenv("AI_SERVICE_TOKEN")
    if expected and not secrets.compare_digest(token or "", expected):
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume(file: UploadFile = File(...), x_internal_token: str | None = Header(default=None)):
    _check_token(x_internal_token)
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File is too large (max 5 MB)")
    try:
        kind = detect_kind(data, file.filename or "")
        text = extract_text(data, kind)
    except ExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return await analyze(text)
