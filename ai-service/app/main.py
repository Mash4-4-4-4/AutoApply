from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI  # noqa: E402

from app.api.resume import router as resume_router  # noqa: E402

app = FastAPI(title="ApplyPilot AI service", version="0.2.0")
app.include_router(resume_router)


@app.get("/health")
def health():
    return {"ok": True}
