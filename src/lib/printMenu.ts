export interface PrintCategory {
  id: string
  name_es: string
  two_col?: boolean
}

export interface PrintDish {
  id: string
  category_id: string
  name_es: string
  description_es?: string
  price?: number
  is_chef_pick?: boolean
  note?: string
  allergens?: unknown
}

// Handles both Spanish IDs (from new admin) and English IDs (from old seed data)
const ALLERGEN_CODES: Record<string, string> = {
  gluten: 'G',     crustaceos: 'CR',  huevos: 'H',   pescado: 'P',
  cacahuetes: 'CA', soja: 'SO',       leche: 'L',    frutos_secos: 'FS',
  apio: 'AP',      mostaza: 'MO',     sesamo: 'SE',  sulfitos: 'SU',
  altramuces: 'AL', moluscos: 'ML',
  // English aliases from seed data
  eggs: 'H',  dairy: 'L',  sesame: 'SE', fish: 'P',  shellfish: 'CR',
  peanuts: 'CA', soy: 'SO', nuts: 'FS', celery: 'AP', mustard: 'MO',
  sulfites: 'SU', lupin: 'AL', molluscs: 'ML',
}

const WHALE_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
  <defs>
    <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e6b8a"/>
      <stop offset="50%" stop-color="#7ab8cc"/>
      <stop offset="100%" stop-color="#1e6b8a"/>
    </linearGradient>
  </defs>
  <path d="M50,72 C38,66 18,72 8,58 C2,50 6,38 14,34 C22,30 32,38 40,46 C44,50 47,56 50,60" fill="url(#wg)" opacity="0.9"/>
  <path d="M50,72 C62,66 82,72 92,58 C98,50 94,38 86,34 C78,30 68,38 60,46 C56,50 53,56 50,60" fill="url(#wg)" opacity="0.9"/>
  <path d="M42,68 C45,60 50,58 50,58 C50,58 55,60 58,68 C55,72 50,74 50,74 C50,74 45,72 42,68Z" fill="white" opacity="0.95"/>
  <path d="M26,44 C28,40 34,40 36,44" stroke="rgba(30,107,138,0.35)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M64,44 C66,40 72,40 74,44" stroke="rgba(30,107,138,0.35)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>`

const CORNER = `<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>`

function getAllergenIds(allergens: unknown): string[] {
  if (!allergens) return []
  if (Array.isArray(allergens)) return allergens as string[]
  if (typeof allergens === 'string') {
    try { return JSON.parse(allergens) } catch { return [] }
  }
  return []
}

function formatPrice(price?: number): string {
  if (price == null || price === 0) return ''
  return price % 1 === 0 ? `${price}&nbsp;€` : `${price.toFixed(2)}&nbsp;€`
}

function renderDish(dish: PrintDish): string {
  const ids = getAllergenIds(dish.allergens)
  const badges = ids
    .map(id => ALLERGEN_CODES[id] ? `<span class="allergen">${ALLERGEN_CODES[id]}</span>` : '')
    .filter(Boolean).join('')
  const price = formatPrice(dish.price)
  const cls = dish.is_chef_pick ? ' featured' : ''
  return `<div class="dish${cls}">
  <div class="dish-info">
    <span class="dish-name">${dish.name_es}</span>${dish.is_chef_pick ? ' <span class="firma">★</span>' : ''}
    ${dish.description_es ? `<div class="dish-desc">${dish.description_es}</div>` : ''}
    ${dish.note ? `<div class="dish-note">${dish.note}</div>` : ''}
    ${badges ? `<div class="allergens">${badges}</div>` : ''}
  </div>
  ${price ? `<div class="dish-price">${price}</div>` : ''}
</div>`
}

function renderCategory(cat: PrintCategory, dishes: PrintDish[]): string {
  const catDishes = dishes.filter(d => d.category_id === cat.id)
  if (!catDishes.length) return ''
  const cls = cat.two_col ? ' two-col' : ''
  return `<div class="category">
  <div class="cat-title">${cat.name_es}</div>
  <div class="dishes${cls}">${catDishes.map(renderDish).join('')}</div>
</div>`
}

function renderPage(
  cats: PrintCategory[],
  dishes: PrintDish[],
  subtitle: string,
  phone: string,
): string {
  const content = cats.map(c => renderCategory(c, dishes)).join('')
  return `<div class="page">
  <div class="frame">${CORNER}</div>
  <header class="page-header">
    <div class="whale-svg">${WHALE_SVG}</div>
    <div class="bar-name">Itsaski</div>
    <div class="bar-sub">${subtitle}</div>
  </header>
  <div class="content">${content}</div>
  <footer class="page-footer">
    <div class="footer-whale">${WHALE_SVG}</div>
    <div class="footer-text">Itsaski &middot; Barren Plaza 3 &middot; Todos los precios incluyen IVA</div>
    ${phone ? `<div class="footer-phone">&#9990; ${phone}</div>` : ''}
    <div class="footer-text">Infórmenos de sus alergias &middot; Consumo responsable</div>
  </footer>
</div>`
}

export function generatePrintHTML(
  categories: PrintCategory[],
  dishes: PrintDish[],
  phone = ''
): string {
  const activeCats = categories.filter(c => dishes.some(d => d.category_id === c.id))
  const half = Math.ceil(activeCats.length / 2)
  const caraA = activeCats.slice(0, half)
  const caraB = activeCats.slice(half)

  const pageA = renderPage(caraA, dishes, 'Barren Plaza 3', phone)
  const pageB = renderPage(caraB, dishes, 'Pintxos · Raciones · Bocadillos', phone)

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Itsaski &middot; Men&uacute;</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,500&family=Josefin+Sans:wght@300;400&display=swap" rel="stylesheet">
<style>
@page { size: A5; margin: 0; }
*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --ink:#0d1e2e; --teal:#1e6b8a; --gold:#9a7040;
  --muted:#7a9aaa; --light:#c8dde6; --rule:#d0dde4;
}
body { background:#d6d6d6; font-family:'Josefin Sans',sans-serif; color:var(--ink); }
.print-btn {
  position:fixed; top:14px; right:14px; z-index:100;
  padding:8px 22px; background:var(--teal); color:white; border:none;
  cursor:pointer; font-family:'Josefin Sans',sans-serif;
  font-size:9px; letter-spacing:0.22em; text-transform:uppercase; border-radius:2px;
}
@media print { .print-btn{display:none!important} body{background:white} }
.page {
  width:148mm; height:210mm; margin:7mm auto;
  padding:14mm 13mm 10mm;
  background:white; position:relative;
  box-shadow:0 4px 28px rgba(0,0,0,0.2);
  display:flex; flex-direction:column;
  page-break-after:always; overflow:hidden;
}
@media print { .page{margin:0;box-shadow:none} }
.frame {
  position:absolute; inset:5.5mm;
  border:0.4pt solid var(--gold); pointer-events:none; z-index:1;
}
.corner { position:absolute; width:5mm; height:5mm; border-color:var(--gold); border-style:solid; }
.corner.tl { top:-0.9pt; left:-0.9pt; border-width:1.5pt 0 0 1.5pt; }
.corner.tr { top:-0.9pt; right:-0.9pt; border-width:1.5pt 1.5pt 0 0; }
.corner.bl { bottom:-0.9pt; left:-0.9pt; border-width:0 0 1.5pt 1.5pt; }
.corner.br { bottom:-0.9pt; right:-0.9pt; border-width:0 1.5pt 1.5pt 0; }
.page-header {
  text-align:center; padding-bottom:4mm;
  border-bottom:0.3pt solid var(--rule); margin-bottom:3.5mm; flex-shrink:0;
}
.whale-svg { width:12mm; height:12mm; margin:0 auto 2mm; display:block; }
.bar-name {
  font-family:'Cormorant Garamond',serif; font-weight:300;
  font-size:24pt; letter-spacing:0.35em; color:var(--ink);
  text-transform:uppercase; line-height:1;
}
.bar-sub {
  font-family:'Josefin Sans',sans-serif; font-size:5pt;
  letter-spacing:0.4em; color:var(--gold); text-transform:uppercase; margin-top:1.5mm;
}
.content { flex:1; overflow:hidden; }
.cat-title {
  font-family:'Cormorant Garamond',serif; font-style:italic; font-weight:400;
  font-size:11pt; color:var(--teal); letter-spacing:0.06em; text-transform:uppercase;
  margin:3.5mm 0 1.2mm; padding-bottom:0.8mm; border-bottom:0.3pt solid var(--rule);
}
.category:first-child .cat-title { margin-top:0; }
.dishes.two-col { columns:2; column-gap:3.5mm; }
.dish {
  display:flex; align-items:baseline; gap:1.5mm;
  padding:0.9mm 0 0.6mm; border-bottom:0.2pt solid rgba(208,221,228,0.45);
  break-inside:avoid;
}
.dish.featured { border-left:1.5pt solid var(--gold); padding-left:1.5mm; margin-left:-1.5mm; }
.dish-info { flex:1; min-width:0; }
.dish-name {
  font-family:'Cormorant Garamond',serif; font-size:9.5pt;
  color:var(--ink); line-height:1.3;
}
.firma { font-size:6pt; color:var(--gold); margin-left:1mm; }
.dish-desc {
  display:block; font-size:5.5pt; letter-spacing:0.08em; text-transform:uppercase;
  color:var(--muted); line-height:1.3; margin-top:0.3mm;
}
.dish-note {
  display:block; font-size:5.5pt; font-style:italic;
  color:var(--gold); opacity:0.8; margin-top:0.2mm;
}
.allergens { display:flex; flex-wrap:wrap; gap:0.6mm; margin-top:0.5mm; }
.allergen {
  font-family:'Josefin Sans',sans-serif; font-size:4pt;
  letter-spacing:0.06em; text-transform:uppercase;
  border:0.3pt solid var(--light); color:var(--muted);
  padding:0.1mm 0.7mm; line-height:1.5;
}
.dish-price {
  font-family:'Cormorant Garamond',serif; font-size:9.5pt;
  color:var(--gold); white-space:nowrap; flex-shrink:0; align-self:flex-start;
}
.page-footer {
  text-align:center; padding-top:2.5mm;
  border-top:0.3pt solid var(--rule); margin-top:2mm; flex-shrink:0;
}
.footer-whale { width:5mm; height:5mm; margin:0 auto 1mm; display:block; opacity:0.25; }
.footer-text {
  font-size:4.5pt; letter-spacing:0.18em; color:var(--muted);
  text-transform:uppercase; line-height:1.7;
}
.footer-phone { font-size:5.5pt; color:var(--gold); letter-spacing:0.12em; margin:0.8mm 0; }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">&#128424; Imprimir</button>
${pageA}
${pageB}
</body>
</html>`
}
