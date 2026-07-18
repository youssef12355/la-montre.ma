/* ==========================================================================
   LA MONTRE — SHOP / CATALOG LOGIC
   Handles gender, brand/category, price range, search, sort and pagination
   client-side. Designed to stay fast even with hundreds of products.
   ========================================================================== */
const PAGE_SIZE = 12;

let shopState = {
  gender: getParam("gender") || "all",
  category: getParam("cat") || "all",
  query: "",
  minPrice: null,
  maxPrice: null,
  sale: getParam("sale") === "1",
  sort: "featured",
  page: 1
};

function productCardHTML(p, index){
  const tagHTML = p.tag ? `<span class="card-tag">${p.tag}</span>` : "";
  const priceHTML = p.oldPrice
    ? `<span style="text-decoration:line-through;opacity:.5;margin-right:8px;">${formatPrice(p.oldPrice)}</span>${formatPrice(p.price)}`
    : formatPrice(p.price);
  const delay = (index % PAGE_SIZE) * 45;
  const hasSecondImage = !!p.hoverImage;
  return `
    <article class="card" data-reveal="fade" data-reveal-delay="${delay}">
      <a href="product.html?id=${p.id}" class="card-media">
        ${tagHTML}
        <img class="card-img-primary" src="${p.image}" alt="${p.title}" loading="lazy">
        ${hasSecondImage ? `<img class="card-img-secondary" src="${p.hoverImage}" alt="${p.title}" loading="lazy">` : ""}
      </a>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-title"><a href="product.html?id=${p.id}">${p.title}</a></h3>
        <div class="card-price">${priceHTML}</div>
        <div class="card-actions">
          <a href="product.html?id=${p.id}" class="btn btn-dark">Voir</a>
          <button class="btn btn-gold" onclick="addToCart('${p.id}')">Ajouter</button>
        </div>
      </div>
    </article>
  `;
}

function getFilteredProducts(){
  let list = [...PRODUCTS];

  if (shopState.gender !== "all"){
    list = list.filter(p => p.gender === shopState.gender);
  }
  if (shopState.category !== "all"){
    list = list.filter(p => p.category === shopState.category);
  }
  if (shopState.minPrice != null){
    list = list.filter(p => p.price >= shopState.minPrice);
  }
  if (shopState.maxPrice != null){
    list = list.filter(p => p.price <= shopState.maxPrice);
  }
  if (shopState.sale){
    list = list.filter(p => p.oldPrice != null && p.oldPrice > p.price);
  }
  if (shopState.query.trim()){
    const q = shopState.query.trim().toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }
  switch (shopState.sort){
    case "price-asc": list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "name": list.sort((a,b) => a.title.localeCompare(b.title)); break;
    default:
      list.sort((a,b) => (b.featured === true) - (a.featured === true));
  }
  return list;
}

function availableCategories(){
  // Brand list narrows to whichever gender is currently selected
  const pool = shopState.gender === "all" ? PRODUCTS : PRODUCTS.filter(p => p.gender === shopState.gender);
  return [...new Set(pool.map(p => p.category))].sort();
}

function renderFilterChips(){
  const el = document.getElementById("filter-chips");
  if (!el) return;
  const chips = [];
  if (shopState.gender !== "all"){
    chips.push({ label: shopState.gender, clear: () => setGender("all") });
  }
  if (shopState.category !== "all"){
    chips.push({ label: shopState.category, clear: () => { shopState.category = "all"; syncControls(); applyFilters(); } });
  }
  if (shopState.minPrice != null || shopState.maxPrice != null){
    const lbl = `${shopState.minPrice ?? 0} – ${shopState.maxPrice ?? "∞"} ${CONFIG.currency}`;
    chips.push({ label: lbl, clear: () => {
      shopState.minPrice = null; shopState.maxPrice = null;
      document.getElementById("price-min").value = "";
      document.getElementById("price-max").value = "";
      applyFilters();
    }});
  }
  if (shopState.query.trim()){
    chips.push({ label: `"${shopState.query.trim()}"`, clear: () => {
      shopState.query = "";
      document.getElementById("filter-search").value = "";
      applyFilters();
    }});
  }
  if (shopState.sale){
    chips.push({ label: "Promotions", clear: () => { shopState.sale = false; applyFilters(); } });
  }

  if (!chips.length){ el.innerHTML = ""; return; }

  el.innerHTML = chips.map((c, i) => `
    <span class="filter-chip">${c.label}<button aria-label="Retirer" data-chip="${i}">✕</button></span>
  `).join("") + `<button class="filter-chip clear-all" id="clear-all-filters">Réinitialiser tout</button>`;

  chips.forEach((c, i) => {
    el.querySelector(`[data-chip="${i}"]`).addEventListener("click", c.clear);
  });
  const clearAll = document.getElementById("clear-all-filters");
  if (clearAll) clearAll.addEventListener("click", resetAllFilters);
}

function resetAllFilters(){
  shopState = { ...shopState, gender: "all", category: "all", query: "", minPrice: null, maxPrice: null, sale: false, page: 1 };
  document.getElementById("filter-search").value = "";
  document.getElementById("price-min").value = "";
  document.getElementById("price-max").value = "";
  syncControls();
  applyFilters();
}

function setGender(g){
  shopState.gender = g;
  shopState.category = "all"; // brand list depends on gender, reset to avoid an invalid combo
  shopState.page = 1;
  syncControls();
  applyFilters();
}

function syncControls(){
  document.querySelectorAll(".gender-toggle button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.gender === shopState.gender);
  });
  const catSelect = document.getElementById("filter-category");
  if (catSelect){
    catSelect.innerHTML = `<option value="all">Toutes les marques</option>` +
      availableCategories().map(c => `<option value="${c}">${c}</option>`).join("");
    catSelect.value = shopState.category;
  }
}

function applyFilters(){
  shopState.page = 1;
  renderShopPage();
}

function renderShopPage(){
  const grid = document.getElementById("product-grid");
  const countEl = document.getElementById("result-count");
  const paginationEl = document.getElementById("pagination");
  if (!grid) return;

  renderFilterChips();

  const filtered = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  shopState.page = Math.min(shopState.page, totalPages);
  const start = (shopState.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  countEl.textContent = `${filtered.length} montre${filtered.length !== 1 ? "s" : ""}`;

  grid.innerHTML = pageItems.length
    ? pageItems.map((p, i) => productCardHTML(p, i)).join("")
    : `<div class="empty-state" style="grid-column:1/-1;">Aucune montre ne correspond à votre recherche.</div>`;

  // Pagination
  if (totalPages <= 1){
    paginationEl.innerHTML = "";
  } else {
    let html = `<button ${shopState.page === 1 ? "disabled" : ""} onclick="goToPage(${shopState.page - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++){
      html += `<button class="${i === shopState.page ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button ${shopState.page === totalPages ? "disabled" : ""} onclick="goToPage(${shopState.page + 1})">›</button>`;
    paginationEl.innerHTML = html;
  }

  if (typeof refreshScrollReveal === "function") refreshScrollReveal();
}

function goToPage(n){
  shopState.page = n;
  renderShopPage();
  document.getElementById("product-grid").scrollIntoView({ behavior: "smooth", block: "start" });
}

function initShopControls(){
  const catSelect = document.getElementById("filter-category");
  const sortSelect = document.getElementById("filter-sort");
  const searchInput = document.getElementById("filter-search");
  const genderButtons = document.querySelectorAll(".gender-toggle button");
  const priceMin = document.getElementById("price-min");
  const priceMax = document.getElementById("price-max");
  if (!catSelect || !sortSelect || !searchInput) return; // controls not on this page

  syncControls();

  genderButtons.forEach(btn => {
    btn.addEventListener("click", () => setGender(btn.dataset.gender));
  });

  catSelect.addEventListener("change", () => {
    shopState.category = catSelect.value;
    applyFilters();
  });
  sortSelect.addEventListener("change", () => {
    shopState.sort = sortSelect.value;
    applyFilters();
  });
  let debounce;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      shopState.query = searchInput.value;
      applyFilters();
    }, 200);
  });
  let priceDebounce;
  const onPriceChange = () => {
    clearTimeout(priceDebounce);
    priceDebounce = setTimeout(() => {
      shopState.minPrice = priceMin.value ? Number(priceMin.value) : null;
      shopState.maxPrice = priceMax.value ? Number(priceMax.value) : null;
      applyFilters();
    }, 350);
  };
  if (priceMin) priceMin.addEventListener("input", onPriceChange);
  if (priceMax) priceMax.addEventListener("input", onPriceChange);
}

document.addEventListener("DOMContentLoaded", () => {
  initShopControls();
  renderShopPage();
});
