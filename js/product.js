/* ==========================================================================
   LA MONTRE — PRODUCT DETAIL LOGIC
   ========================================================================== */
let currentQty = 1;

function specRowsHTML(specs){
  return Object.entries(specs).map(([k,v]) => `
    <tr><td>${k.replace(/_/g, " ")}</td><td>${v}</td></tr>
  `).join("");
}

function relatedProductsHTML(product){
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  if (!related.length) return "";
  return `
    <section>
      <div class="wrap">
        <div class="section-head">
          <div><span class="eyebrow">Vous aimerez aussi</span><h2>Même marque</h2></div>
        </div>
        <div class="grid">${related.map((p,i) => productCardHTML(p,i)).join("")}</div>
      </div>
    </section>
  `;
}

function setMainImage(src, index){
  const mainImg = document.getElementById("main-image");
  if (mainImg) mainImg.src = src;
  document.querySelectorAll(".thumb-item").forEach(el => el.classList.remove("active"));
  const thumb = document.getElementById(`thumb-${index}`);
  if (thumb) thumb.classList.add("active");
}

function renderProductPage(){
  const id = getParam("id");
  const product = findProduct(id);
  const container = document.getElementById("product-container");
  const breadcrumb = document.getElementById("breadcrumb-current");
  document.body.classList.remove("has-buybar");

  if (!product){
    container.innerHTML = `<div class="empty-state">Montre introuvable. <a href="shop.html">Retour à la boutique</a></div>`;
    return;
  }

  document.title = `${product.title} — ${CONFIG.shopName}`;
  if (breadcrumb) breadcrumb.textContent = product.title;

  const gallery = product.images && product.images.length ? product.images : [product.image];
  const priceHTML = product.oldPrice
    ? `<span style="text-decoration:line-through;opacity:.6;margin-right:12px;font-size:16px;">${formatPrice(product.oldPrice)}</span>${formatPrice(product.price)}`
    : formatPrice(product.price);

  const isBackorder = product.stock <= 4;
  const stockBadgeHTML = product.stock === 0
    ? `<span class="stock-badge stock-badge-out">Rupture de stock</span>`
    : isBackorder
      ? `<span class="stock-badge stock-badge-order">Sur commande</span>`
      : `<span class="stock-badge stock-badge-in">En stock</span>`;
  const stockHTML = product.stock === 0
    ? `<span class="stock-note stock-out">Rupture de stock</span>`
    : product.stock <= 4
      ? `<span class="stock-note stock-low">Plus que ${product.stock} en stock — dépêchez-vous</span>`
      : `<span class="stock-note">${product.stock} en stock</span>`;

  const askWhatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Bonjour ${CONFIG.shopName}, je suis intéressé(e) par la montre "${product.title}" (${formatPrice(product.price)}). Est-elle disponible ?`
  )}`;
  const inWishlist = isInWishlist(product.id);
  const pageUrl = `${location.origin}${location.pathname}?id=${product.id}`;

  container.innerHTML = `
    <div class="product-view">
      <div class="product-gallery">
        <div class="product-gallery-main">
          ${product.tag ? `<span class="card-tag">${product.tag}</span>` : ""}
          <img id="main-image" src="${gallery[0]}" alt="${product.title}">
        </div>
        ${gallery.length > 1 ? `
        <div class="thumb-row">
          ${gallery.map((src,i) => `
            <div id="thumb-${i}" class="thumb-item ${i === 0 ? "active" : ""}" onclick="setMainImage('${src}', ${i})">
              <img src="${src}" alt="${product.title} ${i+1}">
            </div>
          `).join("")}
        </div>` : ""}
      </div>
      <div class="product-info">
        <a href="shop.html?cat=${encodeURIComponent(product.category)}" class="eyebrow" style="text-decoration:underline;">${product.category}</a>
        <h1 class="product-title">${product.title}</h1>
        <div class="product-price">${priceHTML}</div>
        ${stockBadgeHTML}
        <p class="product-desc">${product.description}</p>
        <table class="spec-table">${specRowsHTML(product.specs)}</table>

        <div class="qty-row">
          <div class="qty-control">
            <button type="button" onclick="changeQty(-1)" aria-label="Diminuer">−</button>
            <span id="qty-display">1</span>
            <button type="button" onclick="changeQty(1)" aria-label="Augmenter">+</button>
          </div>
          ${stockHTML}
        </div>

        <div class="product-actions">
          <button class="btn btn-gold" ${product.stock === 0 ? "disabled" : ""} id="add-to-cart-btn" onclick="addToCart('${product.id}', currentQty); currentQty=1; document.getElementById('qty-display').textContent=1;">Ajouter au panier</button>
          <a href="cart.html" class="btn btn-dark" onclick="addToCart('${product.id}', currentQty)">Commander maintenant</a>
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
          <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(location.origin + '/' + product.image)}&description=${encodeURIComponent(product.title)}" target="_blank" rel="noopener" aria-label="Épingler sur Pinterest">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.64 19.32c-.05-.82-.09-2.08.02-2.98.1-.8.66-5.1.66-5.1s-.17-.34-.17-.83c0-.78.45-1.36 1.02-1.36.48 0 .71.36.71.8 0 .48-.31 1.21-.47 1.88-.13.56.29 1.02.85 1.02 1.02 0 1.8-1.08 1.8-2.63 0-1.38-.99-2.34-2.4-2.34-1.64 0-2.6 1.23-2.6 2.5 0 .49.19 1.02.43 1.31a.17.17 0 0 1 .04.17c-.05.19-.15.6-.17.68-.03.11-.09.13-.2.08-.77-.36-1.25-1.48-1.25-2.39 0-1.94 1.41-3.73 4.07-3.73 2.13 0 3.79 1.52 3.79 3.55 0 2.12-1.33 3.82-3.19 3.82-.62 0-1.21-.32-1.41-.71l-.38 1.47c-.14.53-.51 1.19-.76 1.6A10 10 0 1 0 12 2z"/></svg>
          </a>
          <button class="copy-link-btn" onclick="copyProductLink('${pageUrl.replace(/'/g, "\\'")}')" aria-label="Copier le lien">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>

        <a href="${askWhatsappUrl}" target="_blank" rel="noopener" class="ask-whatsapp">
          <svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.01 3C9.38 3 4 8.38 4 15.01c0 2.2.59 4.27 1.62 6.05L4 29l8.14-1.55a11.9 11.9 0 0 0 3.87.64h.01c6.63 0 12.01-5.38 12.01-12.01C28.03 8.38 22.65 3 16.01 3zm0 21.82c-1.9 0-3.72-.5-5.31-1.44l-.38-.22-4.83.92.93-4.71-.25-.4a9.86 9.86 0 0 1-1.5-5.26c0-5.46 4.45-9.9 9.91-9.9 5.46 0 9.9 4.44 9.9 9.9 0 5.47-4.44 9.11-8.47 11.11z"/><path d="M21.5 18.24c-.29-.15-1.71-.85-1.97-.94-.26-.1-.46-.15-.65.15-.19.29-.75.94-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.23-.56-.47-.48-.65-.49-.17-.01-.36-.01-.55-.01-.19 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.44 0 1.44 1.05 2.83 1.19 3.03.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.11.56-.08 1.71-.7 1.96-1.37.24-.68.24-1.26.17-1.37-.07-.12-.26-.19-.55-.34z"/></svg>
          Une question ? Discutez avec nous sur WhatsApp
        </a>

        <div class="trust-strip">
          <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="7" width="15" height="13" rx="1"/><path d="M16 10h3l3 3v4h-6"/><circle cx="5.5" cy="20" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/></svg>Livraison gratuite partout au Maroc</div>
          <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>Paiement à la livraison</div>
          <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11z"/></svg>Garantie ${product.specs.Warranty || "3 ans (cachet V-T-S)"}</div>
        </div>
      </div>
    </div>
    ${relatedProductsHTML(product)}
  `;

  if (typeof refreshScrollReveal === "function") refreshScrollReveal();

  // Mobile sticky buy bar
  document.body.classList.add("has-buybar");
  let bar = document.getElementById("mobile-buybar");
  if (!bar){
    bar = document.createElement("div");
    bar.id = "mobile-buybar";
    bar.className = "mobile-buybar";
    document.body.appendChild(bar);
  }
  bar.innerHTML = `
    <div class="mobile-buybar-price">${formatPrice(product.price)}</div>
    <button class="btn btn-gold" ${product.stock === 0 ? "disabled" : ""} onclick="addToCart('${product.id}', currentQty)">Ajouter au panier</button>
  `;
}

function changeQty(delta){
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById("qty-display").textContent = currentQty;
}

document.addEventListener("DOMContentLoaded", renderProductPage);
