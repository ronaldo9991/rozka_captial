import re
import zlib
import os

PDF_DIR = os.path.join(os.path.dirname(__file__), "client/public")

REPLACEMENTS = [
    (b"Mekness", b"Binofox"),
    (b"mekness", b"binofox"),
    (b"MEKNESS", b"BINOFOX"),
    (b"mekness.com", b"binofox.com"),
    (b"Mekness.com", b"Binofox.com"),
    (b"info@mekness.com", b"info@binofox.com"),
    (b"www.mekness.com", b"www.binofox.com"),
    (b"http://www.mekness.com", b"https://www.binofox.com"),
    (b"http://mekness.com", b"https://binofox.com"),
]

PDFS = [
    "anti_money_laundering.pdf",
    "complaints_procedure.pdf",
    "privacy_agreement.pdf",
    "risk_disclosure_and_warning_notice.pdf",
    "terms_conditions.pdf",
]


def replace_bytes(data: bytes) -> bytes:
    for old, new in REPLACEMENTS:
        data = data.replace(old, new)
    return data


def process_pdf(path: str) -> int:
    with open(path, "rb") as f:
        raw = f.read()

    result = bytearray()
    i = 0
    replacements_made = 0

    while i < len(raw):
        # Look for a FlateDecode compressed stream
        stream_start = raw.find(b"stream\r\n", i)
        if stream_start == -1:
            stream_start = raw.find(b"stream\n", i)

        if stream_start == -1:
            # No more streams — do plain replacement on the rest
            tail = replace_bytes(bytes(raw[i:]))
            if tail != raw[i:]:
                replacements_made += 1
            result.extend(tail)
            break

        # Is this a FlateDecode stream?
        # Look backwards for /Filter /FlateDecode in the dictionary before this stream
        header_region = raw[max(0, stream_start - 512): stream_start]
        is_flate = b"FlateDecode" in header_region or b"Fl\x61teDecode" in header_region

        # Append everything up to the stream keyword (with plain replacement)
        plain_part = replace_bytes(bytes(raw[i:stream_start]))
        if plain_part != raw[i:stream_start]:
            replacements_made += 1
        result.extend(plain_part)

        # Find stream content start
        if raw[stream_start:stream_start + 8] == b"stream\r\n":
            stream_keyword_len = 8
        else:
            stream_keyword_len = 7  # stream\n

        content_start = stream_start + stream_keyword_len

        # Find endstream
        end_marker = raw.find(b"endstream", content_start)
        if end_marker == -1:
            result.extend(raw[stream_start:])
            break

        # Strip trailing \r\n or \n before endstream
        content_end = end_marker
        if raw[content_end - 2: content_end] == b"\r\n":
            content_end -= 2
        elif raw[content_end - 1: content_end] == b"\n":
            content_end -= 1

        stream_data = raw[content_start:content_end]

        if is_flate:
            try:
                decompressed = zlib.decompress(stream_data)
                modified = replace_bytes(decompressed)
                if modified != decompressed:
                    replacements_made += 1
                recompressed = zlib.compress(modified)
                # Rebuild stream with correct length
                # Find and patch /Length in the header
                result.extend(b"stream\r\n")
                result.extend(recompressed)
                result.extend(b"\r\nendstream")
                i = end_marker + len(b"endstream")
                continue
            except zlib.error:
                pass  # Fall through to plain handling

        # Not FlateDecode or decompression failed — plain replacement
        result.extend(b"stream\r\n")
        plain_stream = replace_bytes(stream_data)
        if plain_stream != stream_data:
            replacements_made += 1
        result.extend(plain_stream)
        result.extend(b"\r\nendstream")
        i = end_marker + len(b"endstream")

    with open(path, "wb") as f:
        f.write(bytes(result))

    return replacements_made


def main():
    for pdf_name in PDFS:
        path = os.path.join(PDF_DIR, pdf_name)
        if not os.path.exists(path):
            print(f"  SKIP (not found): {pdf_name}")
            continue
        n = process_pdf(path)
        print(f"  {'OK' if n > 0 else 'no changes'} [{n} replacement blocks]: {pdf_name}")


if __name__ == "__main__":
    main()
