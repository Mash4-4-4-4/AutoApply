import io

import pymupdf as fitz
from docx import Document
from fastapi.testclient import TestClient

from app.main import app
from app.services.heuristic import parse_resume_text

SAMPLE = """JOSE MARIA
josemaria@gmail.com | +91 98765 43210 | Bangalore, Karnataka

Summary
Final-year student who builds full-stack web apps.

Skills
Languages: JavaScript, Python, HTML, CSS
Frameworks: React, Node.js, express

Education
B.Tech in Computer Science
RV College of Engineering
2021 - 2025

Experience
Frontend Intern at Acme Labs  Jun 2024 - Aug 2024
- Built dashboards in React
- Improved load time by 30%

Projects
ApplyPilot | React, Node.js
- Auto-apply platform for internships
"""


def test_heuristic_fields():
    r = parse_resume_text(SAMPLE)
    assert r.personal.name == "Jose Maria"
    assert r.personal.email == "josemaria@gmail.com"
    assert r.personal.phone.replace(" ", "") == "+919876543210"
    assert r.personal.location == "Bangalore, Karnataka"
    assert {"JavaScript", "React", "Node.js", "Express.js", "Python"} <= set(r.skills)
    assert r.education[0].institution == "RV College of Engineering"
    assert r.education[0].period == "2021 - 2025"
    assert "B.Tech" in r.education[0].degree
    assert r.experience[0].title == "Frontend Intern" and r.experience[0].company == "Acme Labs"
    assert r.projects[0].name == "ApplyPilot" and "React" in r.projects[0].tech


def _docx_bytes():
    d = Document()
    for line in SAMPLE.splitlines():
        d.add_paragraph(line)
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()


def _pdf_bytes():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 60), SAMPLE, fontsize=10)
    return doc.tobytes()


client = TestClient(app)


def test_api_docx_and_pdf():
    for name, data in (("r.docx", _docx_bytes()), ("r.pdf", _pdf_bytes())):
        res = client.post("/ai/resume/analyze", files={"file": (name, data)})
        assert res.status_code == 200, res.text
        body = res.json()
        assert body["personal"]["email"] == "josemaria@gmail.com"
        assert body["engine"] == "heuristic"


def test_rejects_bad_file():
    res = client.post("/ai/resume/analyze", files={"file": ("x.exe", b"MZ....")})
    assert res.status_code == 422


def test_token_enforced(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "s3cret")
    assert client.post("/ai/resume/analyze", files={"file": ("r.docx", _docx_bytes())}).status_code == 401
    ok = client.post("/ai/resume/analyze", files={"file": ("r.docx", _docx_bytes())}, headers={"X-Internal-Token": "s3cret"})
    assert ok.status_code == 200
