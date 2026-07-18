/* ==========================================================================
   LA MONTRE — CART & CHECKOUT (Cash on Delivery)
   No payment gateway: the customer fills their details, reviews the order,
   and confirms via WhatsApp (or the fallback form). You then call them to
   confirm and arrange delivery / cash collection.
   ========================================================================== */

function cartLineHTML(line){
  const p = findProduct(line.id);
  if (!p) return "";
  return `
    <div class="cart-item">
      <img src="${p.image}" alt="${p.title}">
      <div>
        <h4 class="cart-item-title">${p.title}</h4>
        <div class="cart-item-cat">${p.category}</div>
        <div class="qty-control" style="margin-top:10px;">
          <button type="button" onclick="updateCartQty('${p.id}', ${line.qty - 1})">−</button>
          <span>${line.qty}</span>
          <button type="button" onclick="updateCartQty('${p.id}', ${line.qty + 1})">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">Retirer</button>
      </div>
      <div class="cart-item-price">${formatPrice(p.price * line.qty)}</div>
    </div>
  `;
}

function renderCartPage(){
  const cart = getCart();
  const listEl = document.getElementById("cart-list");
  const summaryEl = document.getElementById("cart-summary");
  const emptyEl = document.getElementById("cart-empty");
  const layoutEl = document.getElementById("cart-layout");

  if (!cart.length){
    layoutEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }
  layoutEl.style.display = "grid";
  emptyEl.style.display = "none";

  listEl.innerHTML = cart.map(cartLineHTML).join("");

  const total = cartTotal();
  summaryEl.innerHTML = `
    <h3>Résumé de commande</h3>
    <div class="summary-row"><span>Articles (${cartCount()})</span><span>${formatPrice(total)}</span></div>
    <div class="summary-row"><span>Livraison</span><span>Gratuite</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatPrice(total)}</span></div>
    <div class="cod-note">Paiement à la livraison — vous payez en espèces à réception. ${CONFIG.warrantyNote}.</div>
    <button class="btn btn-gold btn-block" onclick="document.getElementById('checkout-form').scrollIntoView({behavior:'smooth'})">Passer la commande</button>
  `;
}

function buildOrderMessage(customer){
  const cart = getCart();
  const lines = cart.map(line => {
    const p = findProduct(line.id);
    return `• ${p.title} x${line.qty} — ${formatPrice(p.price * line.qty)}`;
  }).join("\n");
  const total = formatPrice(cartTotal());

  const msg =
    `Bonjour ${CONFIG.shopName}, je souhaite commander :\n\n` +
    `${lines}\n\n` +
    `Total : ${total}\n\n` +
    `Nom : ${customer.name}\n` +
    `Téléphone : ${customer.phone}\n` +
    `Adresse : ${customer.address}, ${customer.city}\n` +
    (customer.notes ? `Note : ${customer.notes}\n` : "") +
    `\nPaiement à la livraison.`;

  return msg;
}

/* Sends an order-notification email to CONFIG.notifyEmail via EmailJS. Silently does
   nothing if the site owner hasn't configured EmailJS yet (emailjsPublicKey empty) —
   WhatsApp confirmation is the guaranteed path either way, this is a bonus channel. */
let emailjsReady = false;
function initEmailJS(){
  if (!CONFIG.emailjsPublicKey || typeof emailjs === "undefined") return;
  emailjs.init({ publicKey: CONFIG.emailjsPublicKey });
  emailjsReady = true;
}

function sendOrderEmail(customer){
  if (!CONFIG.emailjsPublicKey || !CONFIG.emailjsServiceId || !CONFIG.emailjsTemplateId){
    return; // EmailJS not configured — skip quietly
  }
  if (typeof emailjs === "undefined" || !emailjsReady){
    console.warn("EmailJS library did not load; order email not sent.");
    return;
  }
  const cart = getCart();
  const orderLines = cart.map(line => {
    const p = findProduct(line.id);
    return `${p.title} x${line.qty} — ${formatPrice(p.price * line.qty)}`;
  }).join("\n");

  emailjs.send(CONFIG.emailjsServiceId, CONFIG.emailjsTemplateId, {
    to_email: CONFIG.notifyEmail,
    customer_name: customer.name,
    customer_phone: customer.phone,
    customer_address: `${customer.address}, ${customer.city}`,
    customer_notes: customer.notes || "—",
    order_lines: orderLines,
    order_total: formatPrice(cartTotal())
  }).catch(err => console.warn("Order email failed to send:", err));
}

function validateCheckoutForm(form){
  let valid = true;
  ["name","phone","address","city"].forEach(field => {
    const group = form.querySelector(`[data-field="${field}"]`);
    const input = form.elements[field];
    const ok = input.value.trim().length > 1;
    group.classList.toggle("field-invalid", !ok);
    if (!ok) valid = false;
  });
  return valid;
}

function initCheckoutForm(){
  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!getCart().length){
      showToast("Votre panier est vide");
      return;
    }
    if (!validateCheckoutForm(form)) return;

    const customer = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      address: form.elements.address.value.trim(),
      city: form.elements.city.value.trim(),
      notes: form.elements.notes.value.trim()
    };

    const message = buildOrderMessage(customer);
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    sendOrderEmail(customer);
    showToast("Commande prête — confirmez sur WhatsApp");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  initCheckoutForm();
  initEmailJS();
});
