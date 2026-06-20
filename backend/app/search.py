import re


def normalize(value: str | None) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-zа-я0-9\s-]", " ", str(value or "").lower().replace("ё", "е"))).strip()


def tokenize(value: str | None) -> list[str]:
    return [token.strip() for token in normalize(value).split(" ") if len(token.strip()) > 2]


def is_close_token(word: str, token: str) -> bool:
    if word.startswith(token) or token.startswith(word):
        return True
    if len(word) > 5 and len(token) > 5:
        return word[:6] == token[:6]
    return False


def score_feature(query: str | None, row: dict[str, object]) -> int:
    query_tokens = tokenize(query)
    haystack = normalize(
        " ".join(
            [
                str(row.get("name", "")),
                str(row.get("projectName", "")),
                str(row.get("client", "")),
                str(row.get("industry", "")),
                str(row.get("platform", "")),
                str(row.get("product", "")),
                str(row.get("stack", "")),
            ]
        )
    )
    feature_name = normalize(str(row.get("name", "")))

    if not query_tokens:
        return 100

    score = 0
    haystack_words = haystack.split(" ")
    for token in query_tokens:
        if token in feature_name:
            score += 75
        elif token in haystack:
            score += 52
        elif any(is_close_token(word, token) for word in haystack_words):
            score += 32

    phrase_bonus = 25 if normalize(query) in feature_name else 0
    return min(100, round(score / len(query_tokens)) + phrase_bonus)
