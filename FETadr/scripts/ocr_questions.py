# -*- coding: utf-8 -*-
"""Turn scanned grammar and notice pages into text questions."""
import json
import os
import re

import wordninja
from rapidocr_onnxruntime import RapidOCR

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MEDIA = os.path.join(ROOT, "media")
DATA = os.path.join(ROOT, "src", "data")

PAGE_META = [
    ("01", "g1", "Quá khứ đơn / tiếp diễn", list(range(1, 26))),
    ("02", "g2", "Tính từ, trường học và thể thao", list(range(26, 51))),
    ("03", "g3", "Quần áo, nhà cửa, giao thông", list(range(51, 79))),
    ("04", "g4", "Phrasal verb và word formation", list(range(79, 101)) + list(range(111, 117))),
    ("05", "g5", "Word formation", list(range(117, 121))),
]

ANSWERS = {
    1: "A", 2: "A", 3: "A", 4: "A", 5: "A", 6: "B", 7: "B", 8: "A", 9: "A", 10: "A",
    11: "C", 12: "A", 13: "D", 14: "C", 15: "A", 16: "D", 17: "A", 18: "B", 19: "C", 20: "A",
    21: "A", 22: "C", 23: "C", 24: "A", 25: "B",
    26: "A", 27: "B", 28: "B", 29: "A", 30: "B",
    31: "D", 32: "A", 33: "B", 34: "A", 35: "A", 36: "B", 37: "A", 38: "C", 39: "A", 40: "C",
    41: "A", 42: "B", 43: "C", 44: "B", 45: "D", 46: "A", 47: "A", 48: "D", 49: "A", 50: "A",
    51: "A", 52: "D", 53: "D", 54: "B", 55: "A", 56: "B", 57: "C", 58: "D", 59: "C", 60: "C",
    61: "B", 62: "D", 63: "A", 64: "B", 65: "B", 66: "B", 67: "A", 68: "D", 69: "B", 70: "A",
    71: "A", 72: "B", 73: "C", 74: "A", 75: "C", 76: "D", 77: "B", 78: "B",
    79: "D", 80: "A",
    81: "D", 82: "A", 83: "C", 84: "C", 85: "B", 86: "C", 87: "A", 88: "D", 89: "B", 90: "C",
    91: "A", 92: "D", 93: "B", 94: "C", 95: "C", 96: "D",
    97: "B", 98: "A", 99: "C", 100: "B",
    111: "C", 112: "B", 113: "D", 114: "A", 115: "C", 116: "B",
    117: "B", 118: "C", 119: "A", 120: "C",
}

READING_ANSWERS = [
    ["B", "A", "C", "A", "C"],
    ["A", "C", "B", "C", "A"],
    ["C", "B", "A", "C", "A"],
    ["C", "C", "A", "A", "B"],
    ["C", "B", "B", "B", "A"],
    ["B", "B", "C", "C", "A"],
    ["C", "C", "B", "A", "C"],
    ["C", "C", "A", "A", "B"],
    ["C", "B", "A", "C", "B"],
    ["C", "A", "C", "B", "B"],
]
READING_LABELS = ["7.1", "7.2", "7.3", "7.4", "8.1", "8.2", "8.3", "8.4", "Plus 2.2", "Plus 2.3"]


def unglue(text):
    def fix_chunk(match):
        word = match.group(0)
        if len(word) < 12:
            return word
        return " ".join(wordninja.split(word))

    return re.sub(r"[A-Za-z']{12,}", fix_chunk, text)


def tidy(text):
    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"\s+", " ", text).strip(" .")
    text = text.replace(" ,", ",").replace(" .", ".")
    text = re.sub(r"\b1\b(?=\s|$)", "I", text)
    text = text.replace("OK.I", "OK. I").replace("OK.1", "OK. I")
    text = unglue(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_options(text):
    text = re.sub(r"(?<=\S)(?=[A-Da-d][\.\)])", " | ", text)
    found = []
    for match in re.finditer(r"([A-Da-d])[\.\)]\s*(.+?)(?=\s\|\s[A-Da-d][\.\)]|$)", text):
        found.append((match.group(1).upper(), tidy(match.group(2))))
    return found


def load_tokens(ocr, path):
    result, _ = ocr(path)
    tokens = []
    if not result:
        return tokens
    for box, text, _score in result:
        xs = [point[0] for point in box]
        ys = [point[1] for point in box]
        tokens.append({"x": min(xs), "y": min(ys), "r": max(xs), "text": text.strip()})
    return tokens


def grammar_questions(ocr):
    questions = []
    for file_name, page_id, topic, numbers in PAGE_META:
        tokens = load_tokens(ocr, os.path.join(MEDIA, "grammar", f"{file_name}.png"))
        numbered = []
        for token in tokens:
            match = re.match(r"^(\d+)\.", token["text"])
            if match:
                numbered.append((int(match.group(1)), token["y"]))
        numbered.sort(key=lambda item: item[1])
        for index, (number, y0) in enumerate(numbered):
            y1 = numbered[index + 1][1] if index + 1 < len(numbered) else 10_000
            block = [token for token in tokens if y0 - 4 <= token["y"] < y1 - 4]
            options = []
            stem_tokens = []
            hints = []
            for token in block:
                raw = re.sub(r"^\d+\.\s*", "", token["text"]).strip()
                raw = re.split(r"(?=[A-D]\.)", raw)[0].strip()
                parsed = split_options(token["text"])
                if parsed and re.search(r"[A-Da-d][\.\)]", token["text"]) and not re.match(r"^\d+\.", token["text"]):
                    options.extend(parsed)
                    continue
                if re.fullmatch(r"[A-Z]{6,}", raw):
                    hints.append(raw.title())
                    continue
                if raw:
                    stem_tokens.append({**token, "text": raw})
            lines = []
            for token in sorted(stem_tokens, key=lambda item: (item["y"], item["x"])):
                if not lines or token["y"] - lines[-1][0]["y"] > 18:
                    lines.append([token])
                else:
                    lines[-1].append(token)
            parts = []
            for line in lines:
                line.sort(key=lambda item: item["x"])
                for token_index, token in enumerate(line):
                    piece = tidy(token["text"])
                    if not piece or piece.lower() == "choose the best answer":
                        continue
                    if token_index > 0 and token["x"] - line[token_index - 1]["r"] > 22:
                        parts.append("______")
                    parts.append(piece)
            if parts and lines:
                last = max(lines[-1], key=lambda item: item["r"])
                if last["r"] < 560 and not re.search(r"[.!?\"']$", parts[-1]):
                    parts.append("______")
            stem = tidy(" ".join(parts))
            stem = re.sub(r"(?:\s*______\s*)+", " ______ ", stem).strip()
            stem = re.sub(r"\b1st\b", "1st", stem)
            if hints:
                stem = f"{stem} ({', '.join(hints)})"
            by_key = {}
            for key, label in options:
                by_key[key] = label
            option_list = [{"key": key, "text": by_key[key]} for key in "ABCD" if key in by_key]
            questions.append({
                "number": number,
                "pageId": page_id,
                "topic": topic,
                "stem": stem,
                "options": option_list,
                "answer": ANSWERS.get(number),
            })
        print(file_name, "questions", len(numbered), flush=True)
    return questions


def reading_item(ocr, path):
    tokens = load_tokens(ocr, path)
    if not tokens:
        return {"notice": "", "prompt": "", "options": []}
    mid = max(token["r"] for token in tokens) * 0.46
    left = [token for token in tokens if token["x"] < mid]
    right = [token for token in tokens if token["x"] >= mid]
    if len(right) < 2:
        xs = sorted(token["x"] for token in tokens)
        mid = xs[len(xs) // 2]
        left = [token for token in tokens if token["x"] < mid]
        right = [token for token in tokens if token["x"] >= mid]

    def lines_of(group):
        group = sorted(group, key=lambda token: (token["y"], token["x"]))
        rows = []
        for token in group:
            if not rows or token["y"] - rows[-1][0]["y"] > 14:
                rows.append([token])
            else:
                rows[-1].append(token)
        text_rows = []
        for row in rows:
            row.sort(key=lambda token: token["x"])
            text_rows.append(tidy(" ".join(token["text"] for token in row)))
        return [row for row in text_rows if row]

    notice_lines = lines_of(left)
    notice_lines = [re.sub(r"^(?:\d+\.\d+\.?\d*|Plus\s*2\.\d+\.?\d*|I)\s*", "", line).strip() for line in notice_lines]
    notice = "\n".join(line for line in notice_lines if line and line.lower() not in {"i"})
    notice = notice.replace("is t ", "1st ").replace("I st ", "1st ")
    right_lines = lines_of(right)
    prompt_lines = []
    options = []
    for line in right_lines:
        parsed = split_options(line) if re.search(r"[A-Da-d][\.\)]", line) else []
        if parsed and re.match(r"^[A-Da-d][\.\)]", line.strip()):
            options.extend(parsed)
        elif parsed and not re.match(r"^[A-Da-d][\.\)]", line.strip()):
            head = re.split(r"\s+(?=[A-Da-d][\.\)])", line, maxsplit=1)
            if head[0] and not re.match(r"^[A-Da-d][\.\)]", head[0]):
                prompt_lines.append(tidy(head[0]))
            options.extend(parsed)
        else:
            prompt_lines.append(line)
    by_key = {key: label for key, label in options}
    option_list = [{"key": key, "text": by_key[key]} for key in "ABC" if key in by_key]
    prompt = " ".join(prompt_lines).strip()
    option_text = " ".join(item["text"].lower() for item in option_list)
    if len(prompt.split()) < 4 or prompt.lower() in option_text:
        prompt = "What does the text say?"
    return {
        "notice": notice.strip(),
        "prompt": prompt,
        "options": option_list,
    }


def main():
    print("loading ocr", flush=True)
    ocr = RapidOCR()
    print("ocr ready", flush=True)
    questions = grammar_questions(ocr)
    with open(os.path.join(DATA, "grammarQuestions.json"), "w", encoding="utf-8") as handle:
        json.dump(questions, handle, ensure_ascii=False, indent=2)
    sets = []
    for index, answers in enumerate(READING_ANSWERS):
        page = f"{index + 1:02d}"
        items = []
        for item_index, answer in enumerate(answers):
            path = os.path.join(MEDIA, "reading", "items", f"{page}_{item_index + 1}.png")
            parsed = reading_item(ocr, path)
            items.append({
                "id": f"read-{page}-{item_index + 1}",
                "label": f"{READING_LABELS[index]}.{item_index + 1}",
                "setId": f"read-{page}",
                "setTitle": READING_LABELS[index],
                "answer": answer,
                **parsed,
            })
        sets.append({"id": f"read-{page}", "title": READING_LABELS[index], "items": items})
        print("reading", page, "ok", sum(1 for item in items if len(item["options"]) >= 3), flush=True)
    with open(os.path.join(DATA, "readingQuestions.json"), "w", encoding="utf-8") as handle:
        json.dump(sets, handle, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
