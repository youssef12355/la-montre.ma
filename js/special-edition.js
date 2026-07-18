/* ==========================================================================
   LA MONTRE — "SPÉCIALE ÉDITION" HOMEPAGE SHOWCASE
   A rich product-spotlight carousel, restricted to Rolex only. Reuses the
   same CSS classes as the product detail page (.product-view, .thumb-item,
   .stock-badge, etc.) so it looks consistent and needs almost no new CSS.
   To feature a different brand instead, change SPECIAL_EDITION_BRAND below.
   ========================================================================== */
const SPECIAL_EDITION_BRAND = "Rolex";
let seIndex = 0;

function seSetImage(src, i){
  const img = document.getElementById("se-main-image");
  if (img) img.src = src;
  document.querySelectorAll(".se-thumb-item").forEach(el => el.classList.remove("active"));
  const thumb = document.getElementById(`se-thumb-${i}`);
  if (thumb) thumb.classList.add("active");
}

function renderSpecialEdition(){
  const section = document.getElementById("special-edition");
  if (!section || typeof PRODUCTS === "undefined") return;

  const items = PRODUCTS.filter(p => p.category === SPECIAL_EDITION_BRAND);
  if (!items.length){ section.style.display = "none"; return; }

  seIndex = ((seIndex % items.length) + items.length) % items.length;
  const product = items[seIndex];
  const gallery = product.images && product.images.length ? product.images : [product.image];

  const isBackorder = product.stock <= 4;
  const stockBadgeHTML = product.stock === 0
    ? `<span class="stock-badge stock-badge-out">Rupture de stock</span>`
    : isBackorder
      ? `<span class="stock-badge stock-badge-order">Sur commande</span>`
      : `<span class="stock-badge stock-badge-in">En stock</span>`;

  const askWhatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour ${CONFIG.shopName}, je suis intéressé(e) par la montre "${product.title}" (${formatPrice(product.price)}). Est-elle disponible ?`
  )}`;
  const pageUrl = `${location.origin}/product.html?id=${product.id}`;
  const inWishlist = isInWishlist(product.id);

  const wrap = document.getElementById("se-content");
  wrap.innerHTML = `
    <div class="product-view se-view">
      <div class="product-gallery">
        <div class="product-gallery-main">
          ${product.tag ? `<span class="card-tag">${product.tag}</span>` : ""}
          <img id="se-main-image" src="${gallery[0]}" alt="${product.title}">
        </div>
        ${gallery.length > 1 ? `
        <div class="thumb-row">
          ${gallery.map((src,i) => `
            <div id="se-thumb-${i}" class="thumb-item se-thumb-item ${i === 0 ? "active" : ""}" onclick="seSetImage('${src}', ${i})">
              <img src="${src}" alt="${product.title} ${i+1}">
            </div>
          `).join("")}
        </div>` : ""}
      </div>
      <div class="product-info">
        <a href="shop.html?cat=${encodeURIComponent(product.category)}" class="eyebrow" style="text-decoration:underline;">${product.category}</a>
        <h3 class="product-title" style="font-size:clamp(22px,2.6vw,32px);">${product.title}</h3>
        <div class="product-price">${formatPrice(product.price)}</div>
        ${stockBadgeHTML}

        <div class="qty-row">
          <div class="qty-control">
            <button type="button" onclick="seChangeQty(-1)" aria-label="Diminuer">−</button>
            <span id="se-qty-display">1</span>
            <button type="button" onclick="seChangeQty(1)" aria-label="Augmenter">+</button>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn-gold" ${product.stock === 0 ? "disabled" : ""} onclick="addToCart('${product.id}', seQty); seQty=1; document.getElementById('se-qty-display').textContent=1;">Ajouter au panier</button>
          <a href="cart.html" class="btn btn-dark" onclick="addToCart('${product.id}', seQty)">Commander maintenant</a>
        </div>

        <div class="product-actions-secondary">
          <a href="${askWhatsappUrl}" target="_blank" rel="noopener" class="btn-text-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Faire une demande
          </a>
          <button class="btn-text-action ${inWishlist ? "active" : ""}" data-wishlist-btn="${product.id}" onclick="toggleWishlist('${product.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
            Ajouter à la liste de souhaits
          </button>
        </div>

        <div class="product-meta-row">
          <span><strong>SKU :</strong> ${product.specs.Reference || "N/A"}</span>
          <span><strong>Catégories :</strong>
            <a href="shop.html?cat=${encodeURIComponent(product.category)}">${product.category}</a>,
            <a href="shop.html?gender=${encodeURIComponent(product.gender)}">${product.gender}</a>
          </span>
        </div>

        <div class="share-row">
          <span>Partager :</span>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener" aria-label="Partager sur Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/></svg>
          </a>
          <a href="https://wa.me/?text=${encodeURIComponent(product.title + " — " + pageUrl)}" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp">
            <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.2.59 4.27 1.62 6.05L4 29l8.14-1.55a11.9 11.9 0 0 0 3.87.64h.01c6.63 0 12.01-5.38 12.01-12.01C28.03 8.38 22.65 3 16.01 3zm0 21.82c-1.9 0-3.72-.5-5.31-1.44l-.38-.22-4.83.92.93-4.71-.25-.4a9.86 9.86 0 0 1-1.5-5.26c0-5.46 4.45-9.9 9.91-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.47-4.44 9.11-8.47 11.11z"/></svg>
          </a>
          <button class="copy-link-btn" onclick="copyProductLink('${pageUrl.replace(/'/g, "\\'")}')" aria-label="Copier le lien">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll(".se-dot").forEach((dot, i) => dot.classList.toggle("is-active", i === seIndex));
  if (typeof refreshScrollReveal === "function") refreshScrollReveal();
}

let seQty = 1;
function seChangeQty(delta){
  seQty = Math.max(1, seQty + delta);
  document.getElementById("se-qty-display").textContent = seQty;
}

function seGoTo(delta){
  seIndex += delta;
  seQty = 1;
  renderSpecialEdition();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("special-edition")) renderSpecialEdition();
});
