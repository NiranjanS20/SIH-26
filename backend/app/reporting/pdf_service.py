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

from weasyprint import HTML, CSS

def inr_currency(value):
    try:
        # Format as INR currency
        val = float(value)
        s = f"{val:,.2f}"
        # Indian grouping system (e.g. 1,00,000.00) is complex to do natively without babel,
        # but standard thousand separator is acceptable if babel is missing, or we can do a simple replacement:
        parts = s.split('.')
        int_part = parts[0]
        dec_part = parts[1] if len(parts) > 1 else "00"
        if len(int_part) > 3:
            last_three = int_part[-3:]
            other = int_part[:-3]
            other = other.replace(',', '')
            # chunk by 2
            other_parts = []
            while other:
                other_parts.append(other[-2:])
                other = other[:-2]
            other_parts.reverse()
            int_part = ",".join(other_parts) + "," + last_three
        return f"₹{int_part}.{dec_part}"
    except (ValueError, TypeError):
        return f"₹{value}"

env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
env.filters['inr_currency'] = inr_currency

async def generate_pdf(report_id: str, template_name: str, context: dict) -> tuple[str, str]:
    # 2. Kill Every Mock/Placeholder Data Path (Model Version Validation)
    model_version = str(context.get("model_versions", "")).lower()
    if any(forbidden in model_version for forbidden in ["mock", "demo", "placeholder"]):
        raise ValueError(f"CRITICAL: Found mocked model_version '{context.get('model_versions')}' in report payload. Mock data is forbidden.")
        
    template = env.get_template(template_name)
    
    # 4. Fix the Letterhead Asset - load real MOIL logo via base64
    import base64
    with open(os.path.join(STATIC_DIR, 'moil_logo.png'), 'rb') as f:
        logo_b64 = base64.b64encode(f.read()).decode('utf-8')
        
    context['logo_data_uri'] = f"data:image/png;base64,{logo_b64}"
    
    html_out = template.render(context)
    
    # 1. Architectural Fix - Non-Negotiable
    # Generate using WeasyPrint server-side. No window.print() or browser fallbacks.
    output_filename = f"{report_id}.pdf"
    output_filepath = os.path.join(OUTPUT_DIR, output_filename)
    
    # Ensure WeasyPrint finds the static CSS
    css = CSS(filename=os.path.join(STATIC_DIR, 'report_styles.css'))
    
    # Run WeasyPrint generation
    HTML(string=html_out, base_url=f"file://{BASE_DIR}/").write_pdf(output_filepath, stylesheets=[css])
    
    # Hash the generated file
    sha256_hash = hashlib.sha256()
    async with aiofiles.open(output_filepath, "rb") as f:
        while chunk := await f.read(8192):
            sha256_hash.update(chunk)
            
    content_hash = sha256_hash.hexdigest()
    return output_filepath, content_hash
