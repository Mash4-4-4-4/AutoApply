"""Rule-based resume parser. Used when no LLM key is configured or the LLM call fails."""
import re

from app.schemas.resume import Education, Experience, Personal, Project, ResumeAnalysis

KNOWN_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift",
    "SQL", "HTML", "CSS", "React", "Next.js", "Vue", "Angular", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
    "Spring Boot", "MongoDB", "MySQL", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Git", "GitHub", "Linux",
    "Tailwind CSS", "Redux", "GraphQL", "REST APIs", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy",
    "OpenCV", "Figma", "Firebase", "Machine Learning", "Deep Learning", "NLP", "Data Structures", "Algorithms",
    "Power BI", "Tableau", "Excel", "Bootstrap", "jQuery", "Selenium", "Postman", "Flutter", "React Native", "Android",
]
CANON = {s.lower(): s for s in KNOWN_SKILLS}
CANON.update({"nodejs": "Node.js", "node": "Node.js", "reactjs": "React", "react.js": "React", "expressjs": "Express.js",
              "express": "Express.js", "js": "JavaScript", "ts": "TypeScript", "mongo": "MongoDB", "postgres": "PostgreSQL"})
SCAN_SKILLS = [s for s in KNOWN_SKILLS if s not in ("C", "Go")]

HEADERS = {
    "skills": {"skills", "technical skills", "key skills", "core competencies", "technologies", "tech stack"},
    "education": {"education", "academics", "academic background", "qualifications", "educational qualifications"},
    "experience": {"experience", "work experience", "professional experience", "internships",
                   "internship experience", "employment", "work history"},
    "projects": {"projects", "personal projects", "academic projects", "key projects"},
    "summary": {"summary", "profile", "objective", "about me", "professional summary", "career objective"},
    "other": {"certifications", "achievements", "awards", "interests", "extracurricular", "extracurriculars",
              "publications", "languages", "hobbies", "references", "positions of responsibility", "courses"},
}
ALIAS = {a: k for k, v in HEADERS.items() for a in v}

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{8,17}\d")
BULLET_RE = re.compile(r"^\s*[-•*▪●◦‣]\s*")
MONTH = r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?"
DATE_RANGE = re.compile(
    rf"(?:{MONTH}\s*)?(?:19|20)\d{{2}}\s*(?:[-–—]|\bto\b)\s*(?:{MONTH}\s*)?(?:(?:19|20)\d{{2}}|present|current|ongoing)",
    re.I,
)
YEAR_RE = re.compile(r"\b(?:19|20)\d{2}\b")
DEGREE_RE = re.compile(
    r"\b(b\.?\s?tech|b\.?\s?e\b|b\.?\s?sc|bca|bachelor[^,|]*|m\.?\s?tech|m\.?\s?sc|mca|master[^,|]*|mba|ph\.?d|"
    r"diploma|b\.?\s?com|class\s+(?:x|xii|10|12)|higher secondary|senior secondary|intermediate)",
    re.I,
)
INST_RE = re.compile(r"\b(university|college|institute|school|academy|iit|nit|iiit|vidyalaya)\b", re.I)
LOC_RE = re.compile(r"^[A-Za-z][A-Za-z .]+,\s*[A-Za-z][A-Za-z .]+$")


def split_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"header": []}
    cur = "header"
    for raw in lines:
        s = raw.strip()
        if not s:
            continue
        norm = re.sub(r"[^a-z& ]", "", s.lower()).strip()
        if len(s) <= 32 and norm in ALIAS:
            cur = ALIAS[norm]
            sections.setdefault(cur, [])
            continue
        sections.setdefault(cur, []).append(s)
    return sections


def _name(header: list[str]) -> str:
    for line in header[:6]:
        if any(x in line.lower() for x in ("@", "http", "resume", "curriculum")) or re.search(r"\d", line):
            continue
        words = line.split()
        if 2 <= len(words) <= 4 and all(re.fullmatch(r"[A-Za-z.'-]+", w) for w in words):
            return line.title() if line.isupper() else line
    return ""


def _phone(text: str) -> str:
    for m in PHONE_RE.finditer(text):
        if 10 <= len(re.sub(r"\D", "", m.group())) <= 13 and not DATE_RANGE.search(m.group()):
            return m.group().strip()
    return ""


def _location(header: list[str], name: str) -> str:
    for line in header[:8]:
        labeled = re.search(r"(?:location|address|city)\s*[:\-]\s*(.+)", line, re.I)
        if labeled:
            return labeled.group(1).strip()[:80]
        for tok in re.split(r"[|•·▪●\t]| {3,}", line):
            tok = tok.strip()
            if tok and tok != name and len(tok) <= 60 and LOC_RE.match(tok) and not INST_RE.search(tok):
                return tok
    return ""


def parse_skills(lines: list[str], full_text: str) -> list[str]:
    items: list[str] = []
    for line in lines:
        line = BULLET_RE.sub("", line)
        if ":" in line:
            line = line.split(":", 1)[1]
        for tok in re.split(r"[,|•·;]| {2,}", line):
            tok = tok.strip(" .-")
            if 1 <= len(tok) <= 30 and len(tok.split()) <= 3:
                canon = CANON.get(tok.lower(), tok)
                if canon not in items:
                    items.append(canon)
    if not items:
        for s in SCAN_SKILLS:
            if re.search(rf"(?<![\w+#.]){re.escape(s)}(?![\w+#])", full_text, re.I):
                items.append(s)
    return items[:40]


def parse_education(lines: list[str]) -> list[Education]:
    out: list[Education] = []
    for i, line in enumerate(lines):
        if not DEGREE_RE.search(line):
            continue
        window = lines[max(0, i - 1): i + 3]
        period_m = DATE_RANGE.search(" ".join(window)) or YEAR_RE.search(" ".join(window))
        period = period_m.group(0) if period_m else ""
        chunks = [c.strip(" ()") for c in re.split(r"\s*[|–—]\s*|\s+-\s+|,\s*", line) if c.strip(" ()")]
        inst = next((c for c in chunks if INST_RE.search(c)), "")
        if not inst:
            inst = next((w for w in window if w is not line and INST_RE.search(w) and not DEGREE_RE.search(w)), "")
        degree_parts = [c for c in chunks if not INST_RE.search(c) and not DATE_RANGE.search(c) and not YEAR_RE.fullmatch(c)]
        degree = ", ".join(degree_parts)
        degree = DATE_RANGE.sub("", degree).strip(" ,-")
        entry = Education(degree=degree[:120], institution=inst[:120], period=period)
        if entry.degree and entry not in out:
            out.append(entry)
    return out[:6]


def parse_experience(lines: list[str]) -> list[Experience]:
    idx = [i for i, l in enumerate(lines) if DATE_RANGE.search(l)]
    out: list[Experience] = []
    for n, i in enumerate(idx):
        m = DATE_RANGE.search(lines[i])
        rest = DATE_RANGE.sub("", lines[i]).strip(" |–—-,()")
        if not rest and i > 0 and not BULLET_RE.match(lines[i - 1]):
            rest = lines[i - 1]
        parts = re.split(r"\s+(?:at|@)\s+|\s*[|–—,]\s*|\s+-\s+", rest, maxsplit=1)
        end = idx[n + 1] if n + 1 < len(idx) else len(lines)
        body = [BULLET_RE.sub("", l) for l in lines[i + 1: end] if BULLET_RE.match(l)] or lines[i + 1: end][:3]
        out.append(Experience(
            title=parts[0].strip()[:100],
            company=(parts[1].strip() if len(parts) > 1 else "")[:100],
            period=m.group(0) if m else "",
            summary=" ".join(body)[:400],
        ))
    return [e for e in out if e.title][:6]


def parse_projects(lines: list[str]) -> list[Project]:
    entries: list[dict] = []
    for l in lines:
        if not BULLET_RE.match(l) and len(l) <= 90 and (not entries or entries[-1]["body"]):
            entries.append({"name": re.split(r"\s*[|–—]\s*|\s+-\s+", l)[0].strip(" :"), "head": l, "body": []})
        elif entries:
            entries[-1]["body"].append(BULLET_RE.sub("", l))
    out = []
    for e in entries[:6]:
        blob = e["head"] + " " + " ".join(e["body"])
        tech = [s for s in SCAN_SKILLS if re.search(rf"(?<![\w+#.]){re.escape(s)}(?![\w+#])", blob, re.I)]
        out.append(Project(name=e["name"][:100], summary=" ".join(e["body"])[:400], tech=tech[:8]))
    return out


def parse_resume_text(text: str) -> ResumeAnalysis:
    lines = [l.rstrip() for l in text.splitlines()]
    sec = split_sections(lines)
    header = sec.get("header", [])
    email = EMAIL_RE.search(text)
    name = _name(header)
    return ResumeAnalysis(
        personal=Personal(name=name, email=email.group() if email else "", phone=_phone("\n".join(header) or text) or _phone(text),
                          location=_location(header, name)),
        summary=" ".join(sec.get("summary", []))[:500],
        skills=parse_skills(sec.get("skills", []), text),
        education=parse_education(sec.get("education", [])),
        experience=parse_experience(sec.get("experience", [])),
        projects=parse_projects(sec.get("projects", [])),
        engine="heuristic",
    )
