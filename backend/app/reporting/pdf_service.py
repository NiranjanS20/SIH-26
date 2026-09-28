import os
import hashlib
from datetime import datetime, timezone
import aiofiles
from jinja2 import Environment, FileSystemLoader

try:
    from playwright.async_api import async_playwright
    PLAYWRIGHT_AVAILABLE = True
except Exception:
    PLAYWRIGHT_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

async def generate_pdf(report_id: str, template_name: str, context: dict) -> tuple[str, str]:
    template = env.get_template(template_name)
    
    # Read CSS and Logo to inline them for a standalone HTML file
    with open(os.path.join(STATIC_DIR, 'report_styles.css'), 'r') as f:
        inline_css = f.read()
    
    import base64
    with open(os.path.join(STATIC_DIR, 'moil_logo.png'), 'rb') as f:
        logo_b64 = base64.b64encode(f.read()).decode('utf-8')
        
    context['inline_css'] = inline_css
    context['logo_data_uri'] = f"data:image/png;base64,{logo_b64}"
    
    html_out = template.render(context)
    
    # Add an auto-print script so it acts like a PDF download dialog
    print_script = "<script>window.onload = function() { window.print(); }</script>"
    if "</body>" in html_out:
        html_out = html_out.replace("</body>", f"{print_script}\n</body>")
    else:
        html_out += print_script
    
    # Save as .html instead of .pdf
    output_filename = f"{report_id}.html"
    output_filepath = os.path.join(OUTPUT_DIR, output_filename)
    
    async with aiofiles.open(output_filepath, 'w', encoding='utf-8') as f:
        await f.write(html_out)
    
    # Hash the generated file
    sha256_hash = hashlib.sha256()
    async with aiofiles.open(output_filepath, "rb") as f:
        while chunk := await f.read(8192):
            sha256_hash.update(chunk)
            
    content_hash = sha256_hash.hexdigest()
    return output_filepath, content_hash
