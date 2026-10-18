(() => {
'use strict'

// Netlify Identity sends recovery and invitation tokens to the site URL.
// Forward them before the catalogue replaces the URL fragment with its category.
const identityHash = new URLSearchParams(window.location.hash.slice(1))
if (['recovery_token', 'invite_token', 'confirmation_token', 'email_change_token'].some((token) => identityHash.has(token))) {
  window.location.replace(`/admin/recovery.html${window.location.hash}`)
  return
}

// Format international sans signe + ni espaces.
const WHATSAPP_NUMBER = '221786305685'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

const PRODUCTS = {
  HOMME: [
  {
    id: 1,
    name: 'Ensemble Lin Noir',
    description: 'Ensemble deux pièces en lin premium : haut col V et pantalon large taille haute. Coupe décontractée et raffinée, idéal pour toutes occasions.',
    image: 'products/p1.jpg',
    alt: 'Homme en ensemble lin noir col V et pantalon large',
  },
  {
    id: 2,
    name: 'Tenue Noire All Black',
    description: 'Chemise noire boutonnée oversize associée à un pantalon large fluide. Le look monochrome urbain par excellence, élégant au quotidien.',
    image: 'collection/chemise-noire-boutons.jpg',
    alt: 'Homme en chemise noire boutonnée et pantalon noir',
  },
  {
    id: 3,
    name: 'Pantalon Lin Blanc',
    description: 'Pantalon ample en lin blanc naturel, taille élastiquée avec cordon ajustable. Légèreté et confort pour un style estival chic.',
    image: 'products/p3.jpg',
    alt: 'Pantalon en lin blanc avec cordon de serrage',
  },
  {
    id: 4,
    name: 'Pantalon Lin Sable',
    description: 'Pantalon wide-leg en lin sable, taille à cordon, tombé impeccable. Pièce polyvalente qui se porte du matin au soir avec style.',
    image: 'products/p6.jpg',
    alt: 'Homme en pantalon large lin beige sable',
  },
],
  FEMME: [
  {
    id: 5,
    name: 'Ensemble Blanc Fluide',
    description: 'Ensemble blanc fluide composé d’un haut ample et d’un pantalon long. Une silhouette lumineuse et élégante pour les sorties et événements.',
    image: 'collection/WhatsApp Image 2026-10-07 at 19.48.00 (3).jpeg',
    alt: 'Femme portant un ensemble blanc dans un intérieur lumineux',
  },
  {
    id: 6,
    name: 'Robe Mini Rayée Rose',
    description: 'Robe mini rayée rose. Une pièce confortable et raffinée pour toutes les occasions.',
    image: 'collection/robe-mini-rayee-rose.jpg',
    alt: 'Femme portant une robe mini rayée rose',
  },
  {
    id: 7,
    name: 'Kaftan Rose Fuchsia — Vue Signature',
    description: 'Kaftan en broderie ajourée rose fuchsia, col V profond, manches kimono. Pièce statement lumineuse pour les soirées et cérémonies.',
    image: 'products/p7.jpg',
    alt: 'Femme en kaftan rose fuchsia brodé ajouré, portrait',
  },
  {
    id: 8,
    name: 'Kaftan Rose Fuchsia — Silhouette Complète',
    description: 'Kaftan rose fuchsia en dentelle florale, longueur midi asymétrique avec volant bas. Allure festive et légère, idéal pour les événements.',
    image: 'products/p8.jpg',
    alt: 'Femme en kaftan rose fuchsia ajouré pleine longueur',
  },
  {
    id: 9,
    name: 'Robe Mini Rayée Bleue',
    description: 'Mini robe bleue à rayures blanches, col V et manches bouffantes. Une coupe féminine et affirmée pour un style printanier.',
    image: 'products/p9.jpg',
    alt: 'Femme portant une mini robe bleue à rayures blanches',
  },
  {
    id: 10,
    name: 'Kaftan Rose Fuchsia — Look de Nuit',
    description: 'Le kaftan rose fuchsia porté en soirée, sous les lumières de la ville. Éclat garanti pour les fêtes, mariages et occasions spéciales.',
    image: 'products/p10.jpg',
    alt: "Femme en kaftan rose fuchsia la nuit au bord de l'eau",
  },
],
  UNISEXE: [
  {
    id: 11,
    name: 'Chemise Lin Blanche Oversize',
    description: 'Chemise oversize en lin naturel blanc, col ouvert, manches longues retroussables. Pièce intemporelle portée seule ou en superposition.',
    image: 'https://images.unsplash.com/photo-1591357037205-166318b51afd?w=600&h=800&fit=crop&auto=format',
    alt: 'Chemise oversize en lin blanc portée de façon décontractée',
  },
  {
    id: 12,
    name: 'Chemise Blanche Épurée',
    description: 'Chemise blanche structurée à coupe droite, col classique. Le basique ultime qui s\'adapte à tous les styles, femme comme homme.',
    image: 'https://images.unsplash.com/photo-1776633733518-d81137214dc9?w=600&h=800&fit=crop&auto=format',
    alt: 'Chemise blanche épurée portée simplement',
  },
  {
    id: 13,
    name: 'Pantalon Lin Blanc Unisexe',
    description: 'Pantalon ample en lin blanc naturel, taille élastiquée avec cordon ajustable. Porté par tous, légèreté et élégance assurées.',
    image: 'products/p3.jpg',
    alt: 'Pantalon en lin blanc avec cordon de serrage',
  },
  {
    id: 14,
    name: 'Chemise Noire Signature',
    description: 'Chemise noire à coupe nette, col chevalier, manches longues. Pièce versatile et affirmée qui se porte indifféremment par tous.',
    image: 'https://images.unsplash.com/photo-1698720642529-1defa5910184?w=600&h=800&fit=crop&auto=format',
    alt: 'Chemise noire portée avec style',
  },
],
}

let catalogProducts = []
let activeCategory = 'HOMME'

const HERO = {
  HOMME: {
    title: ['Élégance', 'Masculine'],
    subtitle: "Des pièces taillées pour l'homme moderne qui ne sacrifie rien au style. Matières nobles, coupes précises, allure intemporelle.",
    image: 'hero-photo.jpg',
    alt: 'Homme portant une tenue noire dans un jardin',
  },
  FEMME: {
    title: ['Grâce', 'Féminine'],
    subtitle: 'Une sélection de pièces pensées pour sublimer chaque silhouette. Raffinement, caractère et élégance à chaque occasion.',
    image: 'collection/WhatsApp Image 2026-10-07 at 19.48.00 (1).jpeg',
    alt: 'Femme portant une robe rose de la collection',
  },
  UNISEXE: {
    title: ['Style', 'Libre'],
    subtitle: 'Des pièces sans frontières, pensées pour toutes et tous. Coupes fluides, matières nobles, liberté de porter à sa façon.',
    image: 'products/p2.jpg',
    alt: 'Pantalon ample en lin blanc, pièce unisexe',
  },
}

const WA_ICON_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'

// Création d'éléments sûre : le texte passe par textContent (pas d'injection HTML)
function el(tag, className, attrs = {}, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v)
  if (text !== undefined) node.textContent = text
  return node
}

function waIcon(className) {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('class', className)
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const p = document.createElementNS(ns, 'path')
  p.setAttribute('d', WA_ICON_PATH)
  svg.appendChild(p)
  return svg
}

function productCard(product) {
  const msg = `Bonjour, je suis intéressé(e) par l'article : ${product.name}`
  const link = `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`
  const article = el('article', 'group relative flex flex-col bg-[#111111] overflow-hidden border border-[rgba(201,168,108,0.12)] hover:border-[rgba(201,168,108,0.35)] transition-all duration-500')

  const imgWrap = el('div', 'relative overflow-hidden bg-[#1a1a1a] aspect-[3/4]')
  imgWrap.append(
    el('img', 'w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105', {
      src: product.image, alt: product.alt, width: '600', height: '800',
      loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer',
    }),
    el('div', 'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'),
  )

  const body = el('div', 'flex flex-col flex-1 p-6 gap-4')
  const text = el('div', 'flex-1')
  text.append(
    el('h3', 'font-display text-lg font-semibold text-[#f5f0eb] tracking-wide leading-snug mb-2', {}, product.name),
    el('p', 'text-[#a09585] text-base font-light leading-relaxed', {}, product.description),
  )

  const cta = el('div', 'pt-4 border-t border-[rgba(201,168,108,0.12)]')
  const a = el('a', 'flex items-center gap-3 w-full px-4 py-3 bg-[#1a2e1a] hover:bg-[#25D366] border border-[#25D366]/30 hover:border-[#25D366] text-[#25D366] hover:text-white transition-all duration-300', {
    href: link, target: '_blank', rel: 'noopener noreferrer',
    'aria-label': `Commander ${product.name} via WhatsApp (s'ouvre dans un nouvel onglet)`,
  })
  a.append(waIcon('w-5 h-5 flex-shrink-0'), el('span', 'text-sm font-medium tracking-wide', {}, 'Commander via WhatsApp'))
  cta.append(el('p', 'text-[#9c9084] text-xs tracking-widest uppercase mb-3 font-light', {}, 'Contact & Commande'), a)

  body.append(text, cta)
  article.append(imgWrap, body)
  return article
}

function render(category) {
  activeCategory = category
  const hero = HERO[category]
  document.getElementById('hero-title-1').textContent = hero.title[0]
  document.getElementById('hero-title-2').textContent = hero.title[1]
  document.getElementById('hero-subtitle').textContent = hero.subtitle
  const heroImage = document.getElementById('hero-image')
  heroImage.src = hero.image
  heroImage.alt = hero.alt
  document.getElementById('hero-badge').classList.toggle('hidden', category !== 'UNISEXE')
  document.getElementById('catalogue-title').textContent = `Collection ${category.toLowerCase()}`

  const grid = document.getElementById('grid')
  const categoryProducts = catalogProducts.filter((product) => product.category === category)
  grid.replaceChildren(...PRODUCTS[category].concat(categoryProducts).map(productCard))
  grid.classList.remove('animate-fade')
  void grid.offsetWidth // relance l'animation
  grid.classList.add('animate-fade')

  document.querySelectorAll('[data-cat]').forEach((btn) => {
    const active = btn.dataset.cat === category
    btn.setAttribute('aria-pressed', String(active))
    btn.classList.toggle('text-[#c9a86c]', active)
    btn.classList.toggle('text-[#9c9084]', !active)
    btn.querySelector('.underline-dot').classList.toggle('hidden', !active)
  })
  history.replaceState(null, '', `#${category.toLowerCase()}`)
}

document.querySelectorAll('[data-cat]').forEach((btn) =>
  btn.addEventListener('click', () => {
    render(btn.dataset.cat)
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
  }),
)

document.querySelectorAll('[data-wa]').forEach((a) => a.setAttribute('href', WHATSAPP_URL))
document.querySelectorAll('[data-year]').forEach((n) => (n.textContent = new Date().getFullYear()))
document.querySelectorAll('[data-wa-icon]').forEach((n) => n.replaceWith(waIcon(n.dataset.waIcon)))

const fromHash = location.hash.slice(1).toUpperCase()
render(PRODUCTS[fromHash] ? fromHash : 'HOMME')

fetch('/data/catalog-products.json', { cache: 'no-cache' })
  .then((response) => {
    if (!response.ok) throw new Error(`Chargement du catalogue impossible (HTTP ${response.status}).`)
    return response.json()
  })
  .then((products) => {
    if (!Array.isArray(products)) throw new TypeError('Le catalogue reçu n’est pas une liste de produits.')
    catalogProducts = products
    render(activeCategory)
  })
  .catch((error) => console.error('Les nouveaux produits du catalogue n’ont pas pu être chargés :', error))
})()
