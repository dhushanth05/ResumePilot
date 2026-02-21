import re


class SkillExtractor:
    def __init__(self, skill_dictionary: list[str] | None = None) -> None:
        self.skill_dictionary = skill_dictionary or _DEFAULT_SKILLS

    def extract_skills(self, text: str) -> list[str]:
        normalized = _normalize_text(text)
        if not normalized:
            return []

        found: set[str] = set()
        for skill in self.skill_dictionary:
            s = skill.strip().lower()
            if not s:
                continue
            # word-boundary-ish match for single tokens; relaxed substring for multi-word skills
            if " " in s:
                if s in normalized:
                    found.add(skill)
            else:
                if re.search(rf"\b{re.escape(s)}\b", normalized):
                    found.add(skill)

        return sorted(found)


def _normalize_text(text: str) -> str:
    text = (text or "").lower()
    # Keep word characters, plus, and # for skills like c++/c#
    text = re.sub(r"[^a-z0-9\s\+\#\.]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


_DEFAULT_SKILLS: list[str] = [
    "python",
    "java",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "git",
    "ci/cd",
    "linux",
    "rest",
    "graphql",
    "microservices",
    "pytest",
    "pandas",
    "numpy",
    "scikit-learn",
    "machine learning",
    "nlp",
    "html",
    "css",
    "tailwind",
]


def get_skill_extractor() -> SkillExtractor:
    return SkillExtractor()

