"""Build an OFL-licensed, uppercase display derivative for Nemer category titles."""
from pathlib import Path
from copy import deepcopy
import unicodedata
import zipfile
import urllib.request
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'Nemer-Titulares'
OUT.mkdir(exist_ok=True)

def fetch(name, url):
    path = ROOT / name
    if not path.exists():
        with urllib.request.urlopen(url, timeout=30) as response:
            path.write_bytes(response.read())
    return path

base = fetch('Cinzel-Variable.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf')
decor = fetch('CinzelDecorative-Bold.ttf', 'https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/CinzelDecorative-Bold.ttf')
font = instantiateVariableFont(TTFont(base), {'wght': 700}, inplace=False)
ornament = TTFont(decor)
cmap, dcmap = font.getBestCmap(), ornament.getBestCmap()

# Mix the clean Roman capitals with the reference's distinctive swashes.
# Accented versions keep the same ornament so Spanish titles are consistent.
replaced = []
for codepoint, glyph in cmap.items():
    character = chr(codepoint)
    root = unicodedata.normalize('NFD', character)[0]
    if root in 'ANR' and character.isupper() and codepoint in dcmap:
        source = dcmap[codepoint]
        font['glyf'][glyph] = deepcopy(ornament['glyf'][source])
        font['hmtx'][glyph] = ornament['hmtx'][source]
        replaced.append(character)

# This is intentionally an uppercase title font: lower-case input has the
# same cap-height and ornaments as uppercase input, including accents.
for table in font['cmap'].tables:
    if table.isUnicode():
        for codepoint in list(table.cmap):
            capital = chr(codepoint).upper()
            if len(capital) == 1 and ord(capital) in cmap:
                table.cmap[codepoint] = cmap[ord(capital)]

family = 'Nemer Titulares'
copyright_notice = (
    'Copyright 2020 The Cinzel Project Authors (https://github.com/NDISCOVER/Cinzel). '
    'Copyright (c) 2012 Natanael Gama (info@ndiscovered.com), with Reserved Font Name Cinzel. '
    'Modified title-font build, 2026. Derived from Cinzel and Cinzel Decorative; '
    'not an original alphabet or an official brand font.'
)
names = {
    0: copyright_notice, 1: family, 2: 'Bold',
    3: '1.000;NMR;NemerTitulares-Bold',
    4: family + ' Bold', 5: 'Version 1.000', 6: 'NemerTitulares-Bold',
    7: 'Unofficial customized derivative; no endorsement implied.',
    8: 'Customized OFL derivative',
    9: 'Original typeface design: Natanael Gama / The Cinzel Project Authors. Custom selection and title mapping: 2026.',
    10: 'Uppercase display font. Clean Roman capitals with ornamental A, N and R, including accented counterparts. Lowercase input maps to capitals.',
    11: 'https://github.com/NDISCOVER/Cinzel',
    12: 'https://github.com/NDISCOVER/Cinzel',
    13: 'Licensed under the SIL Open Font License, Version 1.1. See bundled license files.',
    14: 'https://openfontlicense.org', 16: family, 17: 'Bold',
}
font['name'].names = []
for name_id, value in names.items():
    font['name'].setName(value, name_id, 3, 1, 0x409)
    # Mac Roman copies for software that still reads legacy family names.
    try:
        value.encode('mac_roman')
    except UnicodeEncodeError:
        continue
    font['name'].setName(value, name_id, 1, 0, 0)

for tag in ['DSIG', 'STAT', 'FFTM']:
    if tag in font:
        del font[tag]
font['head'].fontRevision = 1.0
font['head'].macStyle = 1
font['OS/2'].usWeightClass = 700
font['OS/2'].fsSelection = (1 << 5) | (1 << 7)
font['OS/2'].fsType = 0
font['OS/2'].sTypoAscender = 1100
font['OS/2'].sTypoDescender = -350
font['OS/2'].sTypoLineGap = 0
font['OS/2'].usWinAscent = 1250
font['OS/2'].usWinDescent = 400
font['hhea'].ascent = 1100
font['hhea'].descent = -350
font['hhea'].lineGap = 0
font['post'].isFixedPitch = 0
font.recalcBBoxes = True
font_path = OUT / 'NemerTitulares-Bold.ttf'
font.save(font_path)

# Parse the complete saved font and load it through FreeType, rather than
# assuming that a successful binary write guarantees a usable font.
check = TTFont(font_path, checkChecksums=2)
check.ensureDecompiled()
required = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÁÉÍÓÚÜÑáéíóúüñ0123456789¿?¡!.,:;()-/&'
missing = [c for c in required if ord(c) not in check.getBestCmap()]
assert not missing, missing
assert check['name'].getDebugName(1) == family
assert check['OS/2'].fsType == 0
for text in ['SECTOR AUTOMOTRIZ', 'SECTOR COMERCIAL-HOTELERO', 'ÁÉÍÓÚÜÑ', '0123456789']:
    ft = ImageFont.truetype(str(font_path), 100)
    assert ft.getlength(text) > 0
ft = ImageFont.truetype(str(font_path), 100)
assert bytes(ft.getmask('automotriz')) == bytes(ft.getmask('AUTOMOTRIZ'))

# A specimen rendered with the actual installable file. Gold here is artwork,
# not embedded color in the font itself.
W, H = 1800, 2020
image = Image.new('RGB', (W, H), '#080808')
draw = ImageDraw.Draw(image)
plain = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def note(text, y, size=25, fill='#bcb6a7'):
    f = ImageFont.truetype(plain, size)
    b = draw.textbbox((0, 0), text, font=f)
    draw.text(((W-b[2]+b[0])/2, y), text, font=f, fill=fill)

def gold(text, y, size, max_width=1540):
    f = ImageFont.truetype(str(font_path), size)
    while True:
        b = f.getbbox(text)
        if b[2]-b[0] <= max_width:
            break
        size -= 1
        f = ImageFont.truetype(str(font_path), size)
    tw, th = b[2]-b[0], b[3]-b[1]
    mask = Image.new('L', (W, th+4))
    md = ImageDraw.Draw(mask)
    md.text(((W-tw)/2-b[0], -b[1]+2), text, font=f, fill=255)
    layer = Image.new('RGB', mask.size)
    ld = ImageDraw.Draw(layer)
    stops = [(0,(168,127,37)),(.35,(226,201,108)),(.55,(255,245,171)),(.75,(228,204,115)),(1,(166,125,35))]
    for x in range(W):
        u=x/(W-1)
        for (p,c),(q,d) in zip(stops,stops[1:]):
            if p<=u<=q:
                t=(u-p)/(q-p)
                col=tuple(round(c[k]*(1-t)+d[k]*t) for k in range(3))
                break
        ld.line((x,0,x,mask.height),fill=col)
    image.paste(layer,(0,y),mask)

note('MUESTRA DE LA FUENTE INSTALABLE', 75, 25)
gold('NEMER TITULARES',145,123)
note('Versión Bold · Mayúsculas ornamentales', 325, 29)
draw.line((130,410,1670,410), fill='#51452a', width=2)
note('SECTOR',465,34, '#e7d69d')
gold('AUTOMOTRIZ',540,165)
note('SECTOR',805,34, '#e7d69d')
gold('COMERCIAL-HOTELERO',880,110)
note('SECTOR',1095,34, '#e7d69d')
gold('AGROPECUARIO',1170,135)
draw.line((130,1390,1670,1390), fill='#51452a', width=2)
gold('ABCDEFGHIJKLM',1445,95)
gold('NOPQRSTUVWXYZ',1590,95)
gold('Á É Í Ó Ú Ü Ñ',1740,90)
gold('0123456789',1870,75)
image.save(OUT/'Vista-previa.png')

for name,url in [
    ('OFL-Cinzel.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/cinzel/OFL.txt'),
    ('OFL-Cinzel-Decorative.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/cinzeldecorative/OFL.txt'),
]:
    source = ROOT / name
    if name == 'OFL-Cinzel-Decorative.txt' and (ROOT/'OFL.txt').exists():
        source = ROOT/'OFL.txt'
    if not source.exists():
        source=fetch(name,url)
    (OUT/name).write_bytes(source.read_bytes())

(OUT/'LEEME.txt').write_text('''NEMER TITULARES — BOLD, versión 1.000

Fuente TrueType para títulos de categorías, inspirada en el estilo visual
del logo facilitado y en el concepto «Sector automotriz».

INSTALACIÓN EN WINDOWS
1. Extrae este ZIP.
2. Haz clic derecho en NemerTitulares-Bold.ttf y elige Instalar.
   También puedes abrir el archivo y pulsar Instalar.
3. Vuelve a abrir Illustrator o Photoshop si no aparece de inmediato.
4. Busca «Nemer Titulares» en el menú de fuentes; estilo Bold.

EN MAC
Abre NemerTitulares-Bold.ttf e instala la fuente desde Catálogo Tipográfico.

USO
Es una fuente de mayúsculas para titulares; al escribir minúsculas también
se muestran mayúsculas. Incluye tildes, Ñ, Ü, números y puntuación común.
La A, la N y la R y sus formas acentuadas usan remates ornamentales.
Usa Montserrat para textos de lectura y para una línea pequeña «SECTOR».
Aplica color o degradado dorado desde Illustrator o Photoshop: la fuente
contiene formas vectoriales, no el acabado dorado de la muestra.
No es una reproducción exacta de cada letra de la imagen generada.

BASE Y LICENCIA
Es una adaptación de Cinzel Bold y Cinzel Decorative Bold, diseños de
Natanael Gama / The Cinzel Project Authors, bajo SIL Open Font License 1.1.
No es un alfabeto dibujado desde cero ni una tipografía oficial del grupo.
Cambios: selección de capitales ornamentales A/N/R, mapeo de entrada a
mayúsculas, identidad propia de familia y métricas verticales para remates.
La fuente derivada se distribuye bajo la misma licencia OFL 1.1.
Se adjuntan los avisos de autoría y las licencias originales.
La licencia permite uso comercial en diseños; la fuente no puede venderse
por sí sola. El nombre reservado Cinzel se conserva solo como atribución.

FUENTES ORIGINALES
https://github.com/google/fonts/tree/main/ofl/cinzel
https://github.com/google/fonts/tree/main/ofl/cinzeldecorative

CONTENIDO
NemerTitulares-Bold.ttf — fuente para instalar.
Vista-previa.png — muestra renderizada con la fuente real.
OFL-Cinzel.txt y OFL-Cinzel-Decorative.txt — licencias y atribución.
build_nemer.py — proceso reproducible (requiere fontTools y Pillow).
''',encoding='utf-8')
(OUT/'build_nemer.py').write_bytes(Path(__file__).read_bytes())
archive = ROOT.parent/'Nemer-Titulares.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for path in sorted(OUT.iterdir()):
        z.write(path, arcname='Nemer-Titulares/'+path.name)
print('Font:',font_path)
print('Archive:',archive)
print('Decorated capitals:', ''.join(replaced))
print('Unicode mappings:',len(check.getBestCmap()))
print('Validation: parsed all tables; FreeType render; Spanish coverage; lowercase mapping; embedding permissions OK.')
