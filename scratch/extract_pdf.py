import pypdf
import sys

def extract_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        print(f"Total pages: {len(reader.pages)}")
        for idx, page in enumerate(reader.pages):
            print(f"--- PAGE {idx+1} ---")
            print(page.extract_text())
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    pdf_path = "/Users/akashvishwakarma/Downloads/diagramai/be_first-year-engineering_semester-1_2025_may_basic-electrical-electronics-engineering-nep-2020-scheme.pdf"
    extract_text(pdf_path)
