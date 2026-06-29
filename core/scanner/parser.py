import re

WORK_CODE_PATTERN = re.compile(r'(RJ|BJ|VJ)(\d+)', re.IGNORECASE)

FILE_TYPE_MAP = {
    "audio": {".mp3", ".wav", ".flac", ".m4a", ".ogg", ".aac"},
    "video": {".mp4", ".mkv", ".webm", ".avi"},
    "image": {".jpg", ".jpeg", ".png", ".webp", ".bmp"},
    "subtitle": {".lrc", ".srt", ".vtt", ".ass"},
    "text": {".txt", ".md", ".pdf"},
    "archive": {".zip", ".7z", ".rar"},
}


def parse_work_codes(text):
    codes = []
    for match in WORK_CODE_PATTERN.finditer(text):
        raw = match.group(0)
        code_type = match.group(1).lower()
        number_str = match.group(2)
        number = int(number_str)
        norm = f"{code_type}{number}"
        codes.append(
            {
                "raw": raw,
                "norm": norm,
                "type": code_type,
                "number": number,
            }
        )
    return codes


def classify_file(suffix):
    suffix = suffix.lower()
    for file_type, extensions in FILE_TYPE_MAP.items():
        if suffix in extensions:
            return file_type
    return "other"
