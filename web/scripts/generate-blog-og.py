"""Generate locale-specific OG images for blog listing pages.

Produces 1280x838 PNG images with:
- ViziAI wordmark in brand colors (Teal primary)
- Landing page tagline per locale
- Blog description per locale
- Clean, minimal design on white background
"""

from PIL import Image, ImageDraw, ImageFont
import os

WIDTH, HEIGHT = 1280, 838
TEAL = (13, 148, 136)       # #0D9488
CORAL = (249, 112, 102)     # #F97066
DARK = (26, 26, 31)         # #1A1A1F
GRAY = (107, 114, 128)      # #6B7280
BG = (251, 251, 251)        # #FBFBFB

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "og")
os.makedirs(OUT_DIR, exist_ok=True)

# Try to find Inter font, fall back to system fonts
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
FONT_REG_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

def find_font(candidates):
    for f in candidates:
        if os.path.exists(f):
            return f
    return None

BOLD_FONT_PATH = find_font(FONT_CANDIDATES)
REG_FONT_PATH = find_font(FONT_REG_CANDIDATES)

LOCALES = {
    "en": {
        "tagline": "Track Your Blood Test Results\nand Understand Health Trends",
        "blog_desc": "Articles about blood test tracking,\nhealth analysis, and AI insights",
    },
    "tr": {
        "tagline": "Kan Tahlili Sonuçlarınızı Takip Edin,\nDeğerleri Anlayın",
        "blog_desc": "Kan testi takibi, sağlık analizi\nve yapay zeka hakkında yazılar",
    },
    "es": {
        "tagline": "Entiende tus Análisis de Sangre\ny Sigue los Resultados",
        "blog_desc": "Artículos sobre seguimiento de análisis\nde sangre, salud e IA",
    },
    "de": {
        "tagline": "Blutwerte verstehen —\nLaborbefund hochladen und verfolgen",
        "blog_desc": "Artikel über Blutwerte-Tracking,\nGesundheitsanalyse und KI",
    },
    "fr": {
        "tagline": "Comprendre vos analyses de sang\net suivre les résultats",
        "blog_desc": "Articles sur le suivi des analyses\nde sang, la santé et l'IA",
    },
}


def draw_wordmark(draw, x, y, size):
    """Draw ViziAI wordmark: 'Vizi' in teal, 'AI' in coral."""
    font = ImageFont.truetype(BOLD_FONT_PATH, size) if BOLD_FONT_PATH else ImageFont.load_default()
    # Draw "Vizi"
    draw.text((x, y), "Vizi", fill=TEAL, font=font)
    vizi_w = draw.textlength("Vizi", font=font)
    # Draw "AI"
    draw.text((x + vizi_w, y), "AI", fill=CORAL, font=font)
    ai_w = draw.textlength("AI", font=font)
    return vizi_w + ai_w


def wrap_text(text, font, max_width, draw):
    """Simple line wrapper for pre-split text."""
    lines = text.split("\n")
    return lines


def generate_image(locale, data):
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Subtle top accent bar
    draw.rectangle([(0, 0), (WIDTH, 6)], fill=TEAL)

    # ViziAI wordmark
    draw_wordmark(draw, 80, 100, 72)

    # Divider dot
    dot_font = ImageFont.truetype(REG_FONT_PATH, 28) if REG_FONT_PATH else ImageFont.load_default()
    draw.text((80, 200), "BLOG", fill=TEAL, font=dot_font)

    # Tagline
    tagline_font = ImageFont.truetype(BOLD_FONT_PATH, 48) if BOLD_FONT_PATH else ImageFont.load_default()
    tagline_lines = data["tagline"].split("\n")
    y = 290
    for line in tagline_lines:
        draw.text((80, y), line, fill=DARK, font=tagline_font)
        y += 64

    # Blog description
    desc_font = ImageFont.truetype(REG_FONT_PATH, 30) if REG_FONT_PATH else ImageFont.load_default()
    desc_lines = data["blog_desc"].split("\n")
    y = y + 40
    for line in desc_lines:
        draw.text((80, y), line, fill=GRAY, font=desc_font)
        y += 44

    # Bottom accent bar
    draw.rectangle([(0, HEIGHT - 6), (WIDTH, HEIGHT)], fill=TEAL)

    # Decorative corner element
    for i in range(3):
        draw.rectangle(
            [(WIDTH - 200 + i * 60, HEIGHT - 180), (WIDTH - 200 + i * 60 + 40, HEIGHT - 180 + 40)],
            fill=(*TEAL, 40) if i != 1 else (*CORAL, 60),
            outline=TEAL if i != 1 else CORAL,
            width=2,
        )

    # URL at bottom
    url_font = ImageFont.truetype(REG_FONT_PATH, 22) if REG_FONT_PATH else ImageFont.load_default()
    draw.text((80, HEIGHT - 80), f"viziai.app/{locale}/blog", fill=GRAY, font=url_font)

    out_path = os.path.join(OUT_DIR, f"blog-{locale}.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"  Generated {out_path} ({os.path.getsize(out_path) // 1024} KB)")


if __name__ == "__main__":
    for locale, data in LOCALES.items():
        generate_image(locale, data)
    print("\nDone! Generated OG images for all locales.")
