import os
import hashlib
from datetime import datetime, timezone
import aiofiles
from jinja2 import Environment, FileSystemLoader

try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except Exception:
    WEASYPRINT_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

async def generate_pdf(report_id: str, template_name: str, context: dict) -> tuple[str, str]:
    """Renders HTML, converts to PDF via WeasyPrint, hashes, and saves to disk."""
    template = env.get_template(template_name)
    
    # Inject absolute paths for static assets (WeasyPrint needs absolute URIs for local files)
    context['css_path'] = os.path.join(STATIC_DIR, 'report_styles.css').replace('\\', '/')
    context['logo_path'] = os.path.join(STATIC_DIR, 'moil_logo.png').replace('\\', '/')
    
    html_out = template.render(context)
    
    pdf_filename = f"{report_id}.pdf"
    pdf_filepath = os.path.join(OUTPUT_DIR, pdf_filename)
    
    if WEASYPRINT_AVAILABLE:
        # WeasyPrint blocks the event loop, so in production we'd use run_in_executor
        import asyncio
        loop = asyncio.get_event_loop()
        def _render():
            HTML(string=html_out, base_url=STATIC_DIR).write_pdf(pdf_filepath)
        await loop.run_in_executor(None, _render)
    else:
        # Fallback if GTK+ missing on windows
        async with aiofiles.open(pdf_filepath, 'wb') as f:
            await f.write(b"%PDF-1.4\n% GTK+ missing for WeasyPrint. This is a dummy PDF file.\n")
    
    # Hash the generated file
    sha256_hash = hashlib.sha256()
    async with aiofiles.open(pdf_filepath, "rb") as f:
        while chunk := await f.read(8192):
            sha256_hash.update(chunk)
            
    content_hash = sha256_hash.hexdigest()
    return pdf_filepath, content_hash
