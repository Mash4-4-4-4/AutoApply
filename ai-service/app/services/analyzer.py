import logging

from app.schemas.resume import ResumeAnalysis
from app.services import llm
from app.services.heuristic import parse_resume_text

log = logging.getLogger("analyzer")


async def analyze(text: str) -> ResumeAnalysis:
    warnings: list[str] = []
    if llm.is_configured():
        try:
            data = await llm.llm_extract(text)
            return ResumeAnalysis.model_validate({**data, "engine": "llm", "warnings": []})
        except Exception as exc:
            log.warning("LLM extraction failed: %s", exc)
            warnings.append("AI extraction was unavailable, so basic parsing was used. Please review carefully.")
    result = parse_resume_text(text)
    result.warnings = warnings
    return result
