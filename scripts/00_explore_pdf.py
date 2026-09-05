import pdfplumber

def search_value_and_write_page(pdf_path, value_str):
    print(f"--- Searching for {value_str} in {pdf_path} ---")
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and value_str in text:
                print(f"--- MATCH FOUND ON PAGE {i + 1} ---")
                with open('pdf_page_output.txt', 'w', encoding='utf-8') as f:
                    f.write(text)
                return

if __name__ == '__main__':
    search_value_and_write_page('data/mine data/june_data.pdf', '96592')
