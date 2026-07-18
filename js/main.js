/* ==========================================================================
   LA MONTRE — SITE CONFIG
   Edit the values in CONFIG to match your business. Nothing else in this
   file needs to change for normal use.
   ========================================================================== */
const CONFIG = {
  shopName: "La MontreⓇ",
  tagline: "N°1 au Maroc — Importation & distribution de montres haut de gamme",
  legalName: "La MontreⓇ Sarl / Visual Trading System (Sarl)",
  currency: "MAD",                 // shown after every price, e.g. "2450 MAD"
  whatsappNumber: "212600000000",  // country code + number, no + or spaces
  contactAddress: "1 Rue Zaid Bnou Rifaa, Casablanca 20350, MA",
  contactPhone: "+212 6 60 85 12 60",
  contactPhone2: "+212 5 22 96 92 10",
  contactEmail: "contact@la-montre.ma",
  instagram: "https://www.instagram.com/la.montre.ma/",
  facebook: "https://www.facebook.com/La.montre.boutique/",
  freeDelivery: true,
  warrantyYears: 3,
  warrantyNote: "Garantie 3 ans avec cachet de la société (V-T-S) — exclusivité La MontreⓇ",

  /* Order notification emails — sent to notifyEmail via EmailJS whenever a customer
     confirms an order on cart.html. See README for the 5-minute setup (free account,
     no backend/server needed). Leave emailjsPublicKey empty to disable email sending
     entirely (WhatsApp confirmation still works either way). */
  notifyEmail: "contact@la-montre.ma",
  emailjsPublicKey: "",      // from EmailJS → Account → API Keys
  emailjsServiceId: "",      // from EmailJS → Email Services
  emailjsTemplateId: ""      // from EmailJS → Email Templates
};

function formatPrice(n){
  return n.toLocaleString("fr-FR") + " " + CONFIG.currency;
}


function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

function findProduct(id){
  return PRODUCTS.find(p => p.id === id);
}

function getCategories(){
  return [...new Set(PRODUCTS.map(p => p.category))];
}

/* ---------------------------- CART (localStorage) ---------------------------- */
const CART_KEY = "lamontre_cart";

function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }catch(e){ return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, qty = 1){
  const cart = getCart();
  const line = cart.find(l => l.id === id);
  if (line){ line.qty += qty; } else { cart.push({ id, qty }); }
  saveCart(cart);
  showToast("Ajouté au panier — item added to cart");
}

function removeFromCart(id){
  saveCart(getCart().filter(l => l.id !== id));
  if (typeof renderCartPage === "function") renderCartPage();
}

function updateCartQty(id, qty){
  const cart = getCart();
  const line = cart.find(l => l.id === id);
  if (!line) return;
  line.qty = Math.max(1, qty);
  saveCart(cart);
  if (typeof renderCartPage === "function") renderCartPage();
}

function cartTotal(){
  return getCart().reduce((sum, line) => {
    const p = findProduct(line.id);
    return p ? sum + p.price * line.qty : sum;
  }, 0);
}

function cartCount(){
  return getCart().reduce((sum, line) => sum + line.qty, 0);
}

function updateCartCount(){
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = cartCount();
  });
}

/* ---------------------------- WISHLIST (localStorage) ---------------------------- */
const WISHLIST_KEY = "lamontre_wishlist";

function getWishlist(){
  try{ return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch(e){ return []; }
}

function isInWishlist(id){
  return getWishlist().includes(id);
}

function toggleWishlist(id){
  let list = getWishlist();
  if (list.includes(id)){
    list = list.filter(x => x !== id);
    showToast("Retiré de vos favoris");
  } else {
    list.push(id);
    showToast("Ajouté à votre liste de souhaits");
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateWishlistCount();
  document.querySelectorAll("[data-wishlist-btn]").forEach(btn => {
    if (btn.dataset.wishlistBtn === id){
      btn.classList.toggle("active", list.includes(id));
    }
  });
  if (typeof renderWishlistPage === "function") renderWishlistPage();
}

function wishlistCount(){
  return getWishlist().length;
}

function updateWishlistCount(){
  document.querySelectorAll("[data-wishlist-count]").forEach(el => {
    el.textContent = wishlistCount();
  });
}

/* ---------------------------- COMPARE (localStorage) ---------------------------- */
const COMPARE_KEY = "lamontre_compare";
const COMPARE_MAX = 4;

function getCompareList(){
  try{ return JSON.parse(localStorage.getItem(COMPARE_KEY)) || []; }
  catch(e){ return []; }
}

function isInCompare(id){
  return getCompareList().includes(id);
}

function toggleCompare(id){
  let list = getCompareList();
  if (list.includes(id)){
    list = list.filter(x => x !== id);
    showToast("Retiré du comparateur");
  } else {
    if (list.length >= COMPARE_MAX){
      showToast(`Vous pouvez comparer ${COMPARE_MAX} montres maximum`);
      return;
    }
    list.push(id);
    showToast("Ajouté au comparateur");
  }
  localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
  updateCompareCount();
  document.querySelectorAll("[data-compare-btn]").forEach(btn => {
    if (btn.dataset.compareBtn === id){
      btn.classList.toggle("active", list.includes(id));
    }
  });
  if (typeof renderComparePage === "function") renderComparePage();
}

function compareCount(){
  return getCompareList().length;
}

function updateCompareCount(){
  document.querySelectorAll("[data-compare-count]").forEach(el => {
    el.textContent = compareCount();
  });
}

/* Card style for "Articles Les Plus Tendances" — green sale badge, colored title link,
   Ajouter au panier + Comparer buttons, matching the reference design. */
function trendingCardHTML(p, index){
  const tagHTML = p.tag ? `<span class="trending-tag">${p.tag}</span>` : "";
  const priceHTML = p.oldPrice
    ? `<span style="text-decoration:line-through;opacity:.5;margin-right:8px;">${formatPrice(p.oldPrice)}</span>${formatPrice(p.price)}`
    : formatPrice(p.price);
  const delay = (index % 12) * 40;
  const hasSecondImage = !!p.hoverImage;
  return `
    <article class="card trending-card" data-reveal="fade" data-reveal-delay="${delay}">
      <a href="product.html?id=${p.id}" class="card-media">
        ${tagHTML}
        <img class="card-img-primary" src="${p.image}" alt="${p.title}" loading="lazy">
        ${hasSecondImage ? `<img class="card-img-secondary" src="${p.hoverImage}" alt="${p.title}" loading="lazy">` : ""}
      </a>
      <div class="card-body">
        <h3 class="card-title trending-title"><a href="product.html?id=${p.id}">${p.title}</a></h3>
        <div class="card-price">${priceHTML}</div>
        <div class="card-actions">
          <button class="btn btn-gold" onclick="addToCart('${p.id}')">Ajouter au panier</button>
        </div>
      </div>
    </article>
  `;
}

function copyProductLink(url){
  navigator.clipboard.writeText(url).then(() => {
    showToast("Lien copié !");
  }).catch(() => {
    showToast("Impossible de copier le lien");
  });
}

/* ---------------------------- TOAST ---------------------------- */
function showToast(msg){
  let toast = document.querySelector(".toast");
  if (!toast){
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------------------------- MEGA MENU BUILDERS ---------------------------- */
function chunk(arr, size){
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function brandListColumn(brands, extraParams = ""){
  return brands.map(b => `<a href="shop.html?cat=${encodeURIComponent(b)}${extraParams}">${b}®</a>`).join("");
}

function buildMarquesMegaMenu(){
  const brands = getCategories().sort();
  const cols = chunk(brands, Math.ceil(brands.length / 4));
  return `
    <div class="mega-menu mega-menu-wide">
      <div class="mega-grid">
        ${cols.map(col => `<div class="mega-col">${brandListColumn(col)}</div>`).join("")}
      </div>
    </div>
  `;
}

function buildGenderMegaMenu(gender){
  const pool = PRODUCTS.filter(p => p.gender === gender);
  const brands = [...new Set(pool.map(p => p.category))].sort();
  const cols = chunk(brands, Math.ceil(brands.length / 2) || 1);
  const picks = pool.filter(p => p.featured).slice(0, 2).concat(pool.slice(0, 2)).slice(0, 2);
  return `
    <div class="mega-menu mega-menu-wide">
      <div class="mega-grid mega-grid-with-images">
        <div class="mega-col">
          <span class="mega-col-title">Top Marques</span>
          ${brandListColumn(cols[0] || [], `&gender=${gender}`)}
        </div>
        <div class="mega-col">
          <span class="mega-col-title">&nbsp;</span>
          ${brandListColumn(cols[1] || [], `&gender=${gender}`)}
        </div>
        <div class="mega-images">
          ${picks.map(p => `
            <a href="product.html?id=${p.id}" class="mega-image">
              <img src="${p.image}" alt="${p.title}" loading="lazy">
            </a>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function buildPromotionsMegaMenu(){
  return `
    <div class="mega-menu mega-menu-narrow">
      <a href="shop.html?gender=Homme&amp;sale=1">Promotion Homme</a>
      <a href="shop.html?gender=Femme&amp;sale=1">Promotion Femme</a>
    </div>
  `;
}

/* ---------------------------- HEADER / FOOTER ---------------------------- */
function renderChrome(){
  const header = document.getElementById("site-header");
  if (header && typeof PRODUCTS !== "undefined"){
    header.innerHTML = `
      <div class="wrap">
        <a href="index.html" class="brand">
          <img src="images/logo.png" alt="${CONFIG.shopName}">
        </a>
        <nav class="main-nav" id="main-nav">
          <div class="nav-item"><a href="index.html">La Montre</a></div>
          <div class="nav-item has-mega">
            <a href="shop.html">Marques</a>
            ${buildMarquesMegaMenu()}
          </div>
          <div class="nav-item has-mega">
            <a href="shop.html?gender=Femme">Montre Femme</a>
            ${buildGenderMegaMenu("Femme")}
          </div>
          <div class="nav-item has-mega">
            <a href="shop.html?gender=Homme">Montre Homme</a>
            ${buildGenderMegaMenu("Homme")}
          </div>
          <div class="nav-item has-mega">
            <a href="shop.html">Promotions</a>
            ${buildPromotionsMegaMenu()}
          </div>
          <div class="nav-item"><a href="contact.html">Contactez Nous</a></div>
        </nav>
        <div class="header-actions">
          <a href="wishlist.html" class="icon-btn" aria-label="Liste de souhaits">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
            <span class="cart-count" data-wishlist-count>0</span>
          </a>
          <a href="cart.html" class="icon-btn" aria-label="Panier">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span class="cart-count" data-cart-count>0</span>
          </a>
          <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    `;
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    toggle.addEventListener("click", () => nav.classList.toggle("open"));

    // Mobile: tap the parent link of a mega-menu item to expand/collapse instead of navigating
    nav.querySelectorAll(".nav-item.has-mega > a").forEach(link => {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 900){
          e.preventDefault();
          link.parentElement.classList.toggle("mega-open");
        }
      });
    });

    const current = location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll(".nav-item > a").forEach(a => {
      if (a.getAttribute("href").split("?")[0] === current) a.classList.add("active");
    });
  }

  const footer = document.getElementById("site-footer");
  if (footer){
    const instaPicks = (typeof PRODUCTS !== "undefined" ? PRODUCTS : [])
      .filter(p => p.featured).slice(0, 6);
    const instaGrid = instaPicks.map(p => `
      <a href="${CONFIG.instagram}" target="_blank" rel="noopener" title="${p.title}">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
      </a>
    `).join("");

    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-columns">
          <div class="footer-col">
            <h4>Nous contacter</h4>
            <ul class="footer-contact-list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z"/></svg>
                <span>${CONFIG.contactAddress}</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href="tel:${CONFIG.contactPhone.replace(/\s/g,'')}">${CONFIG.contactPhone}</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href="tel:${CONFIG.contactPhone2.replace(/\s/g,'')}">${CONFIG.contactPhone2}</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="m4 4 8 8 8-8"/></svg>
                <a href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a>
              </li>
            </ul>
            <div class="footer-badges">
              <a href="shop.html?cat=Rolex" class="badge-rolex">
                <img src="images/brands/rolex-crown.svg" alt="Rolex">
                <strong>ROLEX</strong>
                <span>Détaillant officiel</span>
              </a>
            </div>
          </div>

          <div class="footer-col">
            <h4>Suivez-nous sur</h4>
            <p>Offres spéciales sur les réseaux sociaux</p>
            <div class="social-icons">
              <a class="social-circle" href="${CONFIG.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/></svg>
              </a>
              <a class="social-circle" href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
              </a>
              <a class="social-circle" href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noopener" aria-label="WhatsApp">
                <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.2.59 4.27 1.62 6.05L4 29l8.14-1.55a11.9 11.9 0 0 0 3.87.64h.01c6.63 0 12.01-5.38 12.01-12.01C28.03 8.38 22.65 3 16.01 3zm0 21.82c-1.9 0-3.72-.5-5.31-1.44l-.38-.22-4.83.92.93-4.71-.25-.4a9.86 9.86 0 0 1-1.5-5.26c0-5.46 4.45-9.9 9.91-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.47-4.44 9.11-8.47 11.11z"/></svg>
              </a>
            </div>
          </div>

          <div class="footer-col">
            <h4>#Instagram</h4>
            <p>Notre galerie Instagram</p>
            <div class="insta-grid">${instaGrid}</div>
          </div>
        </div>

        <div class="footer-links-row">
          <a href="wishlist.html">Liste De Souhaits</a>
          <a href="conditions-generales-de-vente.html">Conditions Générales De Vente</a>
          <a href="mentions-legales.html">Mentions légales</a>
          <a href="conditions-de-retour.html">Conditions De Retour</a>
          <a href="qui-sommes-nous.html">Qui Sommes Nous</a>
          <a href="contact.html">Contactez-nous</a>
        </div>

        <p class="footer-blurb">
          Quand on parle de belles montres, on pense forcément à des grands classiques. Rolex, Longines, Raymond Weil, Tag Heuer, Tissot, Guess, collection GC, Calvin Klein, Hugo Boss, Emporio Armani, Michael Kors, Versace... La MontreⓇ est la boutique où vous trouverez la montre de vos rêves.
        </p>
      </div>

      <div class="footer-bottom-bar">
        <div class="wrap footer-bottom-inner">
          <span>© ${new Date().getFullYear()} ${CONFIG.legalName}. Tous droits réservés.</span>
          <div class="payment-badges">
            <img src="images/payments/paypal.png" alt="PayPal" class="pay-icon">
            <img src="images/payments/bmce.png" alt="BMCE Bank" class="pay-icon">
            <img src="images/payments/amana.png" alt="Amana" class="pay-icon">
          </div>
        </div>
      </div>
    `;

  }

  updateCartCount();
  updateWishlistCount();
  renderWhatsappFAB();
}

/* ---------------------------- WHATSAPP FLOATING BUTTON ---------------------------- */
function renderWhatsappFAB(){
  if (document.getElementById("wa-fab")) return;
  const fab = document.createElement("a");
  fab.id = "wa-fab";
  fab.className = "wa-fab";
  fab.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent("Bonjour " + CONFIG.shopName + ", j'ai une question sur vos montres.")}`;
  fab.target = "_blank";
  fab.rel = "noopener";
  fab.setAttribute("aria-label", "Contactez-nous sur WhatsApp");
  fab.innerHTML = `
    <span class="wa-fab-ring"></span>
    <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.2.59 4.27 1.62 6.05L4 29l8.14-1.55a11.9 11.9 0 0 0 3.87.64h.01c6.63 0 12.01-5.38 12.01-12.01C28.03 8.38 22.65 3 16.01 3zm0 21.82c-1.9 0-3.72-.5-5.31-1.44l-.38-.22-4.83.92.93-4.71-.25-.4a9.86 9.86 0 0 1-1.5-5.26c0-5.46 4.45-9.9 9.91-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.47-4.44 9.11-8.47 11.11z"/><path d="M21.5 18.24c-.29-.15-1.71-.85-1.97-.94-.26-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.48-.65-.49-.17-.01-.36-.01-.55-.01-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.44 0 1.44 1.05 2.83 1.19 3.03.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.11.56-.08 1.71-.7 1.96-1.37.24-.68.24-1.26.17-1.37-.07-.12-.26-.19-.55-.34z"/></svg>
  `;
  document.body.appendChild(fab);
}

document.addEventListener("DOMContentLoaded", renderChrome);

/* ---------------------------- SCROLL REVEAL ---------------------------- */
function initScrollReveal(){
  const els = document.querySelectorAll("[data-reveal]");
  if (!els.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced){
    els.forEach(el => el.classList.add("reveal-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const delay = entry.target.dataset.revealDelay || 0;
        setTimeout(() => entry.target.classList.add("reveal-in"), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  els.forEach(el => io.observe(el));
}

/* Re-observes newly injected content (e.g. after a re-render like shop grid updates) */
function refreshScrollReveal(){
  initScrollReveal();
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
});
