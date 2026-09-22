const state = { data: null, category: "Todos", query: "", cart: JSON.parse(localStorage.getItem("burger-lab-cart") || "{}") };
const paymentDetails = { alias: "rey.ju50", holder: "Juan Ramon Reyes" };
const $ = (selector) => document.querySelector(selector);
const money = (value) => value == null ? "Consultar" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

const embeddedMenu = {"brand":{"name":"Burger Lab","tagline":"Burgers & lomos - experimental recipes","phone":"2657-560516","instagram":"burger_lab"},"currency":"ARS","categories":[{"name":"Burgers","items":[{"id":"fusion-alpha","name":"Fusion Alpha","description":"Triple medallón smash (70 gr), triple queso cheddar, cebolla caramelizada, tomate y salsa quántica.","price":18000,"image":"assets/fusion-alpha.png"},{"id":"fusion-x","name":"Fusion X","description":"Doble medallón smash (90 gr), doble cheddar, cebolla caramelizada, morrón asado, salsa Lab y pan de papa.","price":16000,"image":"assets/fusion-x.png"},{"id":"doble-helice","name":"Doble Hélice","description":"Doble medallón smash (80 gr), doble queso cheddar, cebolla crispy, doble bacon, huevo frito y salsa quántica.","price":16000,"image":"assets/doble-helice.png"},{"id":"lab-special","name":"Lab Special","description":"Un medallón smash (120 gr), queso cheddar, cebolla caramelizada, bacon y salsa Lab Secret (mayonesa, mostaza y ketchup).","price":15000,"image":"assets/lab-special.png"},{"id":"cheese-lab","name":"Cheese Lab","description":"Medallón smash (100 gr), doble cheddar, cebolla caramelizada, mayonesa y pan de papa.","price":10000,"image":"assets/cheese-lab.png"},{"id":"golden-burger","name":"Golden Burger","description":"Doble medallón smash (80 gr) envuelto en cheddar, cebolla caramelizada y salsa Lab Secret.","price":17000,"image":"assets/golden-burger.png"},{"id":"burger-classic","name":"Burger Classic","description":"Medallón smash (100 gr), lechuga, tomate, huevo, jamón, queso tybo y mayonesa.","price":13000,"image":"assets/burger-classic.png"}],"includes":"Todas las burgers llevan fritas."},{"name":"Lomos","items":[{"id":"lomo-quantum","name":"Lomo Quantum","description":"Lomo, queso cheddar, jamón, huevo, morrones asados y salsa quántica.","price":17000,"image":"assets/lomo-quantum.png"},{"id":"lomo-neon","name":"Lomo Neon","description":"Lomo, queso cheddar, lechuga, huevo, bacon y cebolla caramelizada.","price":17000,"image":"assets/lomo-neon.png"},{"id":"lomo-classic","name":"Lomo Classic","description":"Lomo, lechuga, tomate, huevo, jamón, queso tybo y mayonesa.","price":15000,"image":"assets/lomo-classic.png"}],"includes":"Todos los lomos llevan papa."},{"name":"Combos","items":[{"id":"combo-gran-duo","name":"Combo Gran Dúo","description":"2 burgers Doble Hélice con papas.","price":30000,"image":"assets/combo-gran-duo.png"},{"id":"combo-colision","name":"Combo Colisión","description":"2 lomos Classic con papas.","price":28000,"image":"assets/combo-colision.png"},{"id":"combo-doble-test","name":"Combo Doble Test","description":"2 Burger Classic con papas.","price":24000,"image":"assets/combo-doble-test.png"}],"includes":"Todos los combos llevan fritas."},{"name":"Papas","items":[{"id":"papas-classic","name":"Papas Classic","description":"Caja de papas.","price":12000,"image":"assets/papas-classic.png"},{"id":"papas-fusion","name":"Papas Fusion","description":"Caja de papas con cheddar.","price":13000,"image":"assets/papas-fusion.png"}]},{"name":"Salsas","items":[{"id":"salsa-lab-secret","name":"Salsa Lab Secret","description":"Mayonesa, mostaza y ketchup.","price":null,"image":"assets/salsa-lab-secret.png"},{"id":"salsa-blue","name":"Salsa Blue","description":"Queso crema, queso azul (roquefort), pimienta negra, nuez moscada y leche.","price":null,"image":"assets/salsa-blue.png"},{"id":"salsa-quantica","name":"Salsa Quántica","description":"Mayonesa, apio y ajo.","price":null,"image":"assets/salsa-quantica.png"}]}],"addOns":[{"name":"Cheddar","price":1000,"appliesTo":["burgers","lomos"]},{"name":"Medallón de carne","price":3000,"appliesTo":["burgers"]},{"name":"Carne","price":4000,"appliesTo":["lomos"]},{"name":"Huevo frito","price":500,"appliesTo":["burgers","lomos"]}]};

embeddedMenu.categories.find((category) => category.name === "Burgers").items.find((item) => item.id === "fusion-alpha").price = 18000;
embeddedMenu.categories.forEach((category) => category.items.forEach((item) => { if (item.price != null) item.price += 1000; }));

async function loadMenu() {
  if (window.location.protocol === "file:") return embeddedMenu;
  try {
    const response = await fetch("menu-data.json");
    if (!response.ok) throw new Error("No se pudo cargar menu-data.json");
    return await response.json();
  } catch (error) {
    return embeddedMenu;
  }
}

async function init() {
  state.data = await loadMenu();
  renderCategories();
  renderProducts();
  renderCart();
  bindEvents();
}

function allProducts() { return state.data.categories.flatMap((category) => category.items.map((item) => ({ ...item, category: category.name }))); }

function renderCategories() {
  const nav = $("#category-nav");
  nav.innerHTML = ["Todos", ...state.data.categories.map((category) => category.name)].map((category) => `<button type="button" class="category-button ${category === state.category ? "active" : ""}" data-category="${category}">${category}</button>`).join("");
}

function renderProducts() {
  const grid = $("#menu-grid");
  const query = state.query.trim().toLowerCase();
  const products = allProducts().filter((item) => (state.category === "Todos" || item.category === state.category) && (!query || `${item.name} ${item.description}`.toLowerCase().includes(query)));
  grid.innerHTML = "";
  $("#empty-state").hidden = products.length > 0;
  products.forEach((item) => {
    const fragment = $("#product-template").content.cloneNode(true);
    const card = fragment.querySelector(".product-card");
    const image = fragment.querySelector(".product-image");
    image.src = item.image;
    image.alt = `${item.name} - Burger Lab`;
    fragment.querySelector("h3").textContent = item.name;
    fragment.querySelector(".product-price").textContent = money(item.price);
    fragment.querySelector(".product-description").textContent = item.description;
    const badge = fragment.querySelector(".product-badge");
    if (["Fusion Alpha", "Doble Hélice", "Combo Gran Dúo"].includes(item.name)) { badge.hidden = false; badge.textContent = "Recomendado"; }
    fragment.querySelector(".add-button").addEventListener("click", () => addToCart(item.id));
    grid.appendChild(fragment);
  });
}

function addToCart(id) { state.cart[id] = (state.cart[id] || 0) + 1; saveCart(); renderCart(); openCart(); }
function removeFromCart(id) { if (!state.cart[id]) return; state.cart[id] -= 1; if (state.cart[id] <= 0) delete state.cart[id]; saveCart(); renderCart(); }
function saveCart() { localStorage.setItem("burger-lab-cart", JSON.stringify(state.cart)); }

function renderCart() {
  if (!state.data) return;
  const products = allProducts();
  const rows = Object.entries(state.cart).map(([id, quantity]) => ({ item: products.find((product) => product.id === id), quantity })).filter((row) => row.item);
  $("#cart-items").innerHTML = rows.map(({ item, quantity }) => `<div class="cart-row"><img src="${item.image}" alt=""><div><h4>${item.name}</h4><p>${money(item.price)} c/u</p></div><div class="qty-control"><button type="button" data-minus="${item.id}" aria-label="Quitar uno">−</button><strong>${quantity}</strong><button type="button" data-plus="${item.id}" aria-label="Agregar uno">+</button></div></div>`).join("");
  $("#cart-empty").hidden = rows.length > 0;
  const count = rows.reduce((sum, row) => sum + row.quantity, 0);
  const total = rows.reduce((sum, row) => sum + ((row.item.price || 0) * row.quantity), 0);
  $("#cart-count").textContent = count;
  $("#cart-total").textContent = money(total);
  const order = $("#whatsapp-order");
  if (rows.length) { order.classList.remove("disabled"); order.setAttribute("aria-disabled", "false"); order.href = `https://wa.me/542657560516?text=${encodeURIComponent(buildOrderMessage(rows, total))}`; } else { order.classList.add("disabled"); order.setAttribute("aria-disabled", "true"); order.href = "#"; }
  $("#cart-items").querySelectorAll("[data-minus]").forEach((button) => button.addEventListener("click", () => removeFromCart(button.dataset.minus)));
  $("#cart-items").querySelectorAll("[data-plus]").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.plus)));
}

function buildOrderMessage(rows, total) { return `Hola Burger Lab! Quiero pedir:\n${rows.map(({ item, quantity }) => `• ${quantity}x ${item.name} - ${money(item.price * quantity)}`).join("\n")}\n\nTotal estimado: ${money(total)}\n\nPago por transferencia Galicia\nAlias: ${paymentDetails.alias}\nTitular: ${paymentDetails.holder}`; }
function openCart() { $("#cart-drawer").classList.add("open"); $("#cart-drawer").setAttribute("aria-hidden", "false"); $("#cart-overlay").hidden = false; }
function closeCart() { $("#cart-drawer").classList.remove("open"); $("#cart-drawer").setAttribute("aria-hidden", "true"); $("#cart-overlay").hidden = true; }

function bindEvents() {
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; renderProducts(); });
  $("#category-nav").addEventListener("click", (event) => { const button = event.target.closest("[data-category]"); if (!button) return; state.category = button.dataset.category; renderCategories(); renderProducts(); });
  $("#open-cart").addEventListener("click", openCart); $("#close-cart").addEventListener("click", closeCart); $("#cart-overlay").addEventListener("click", closeCart);
  $("#copy-alias").addEventListener("click", async () => { try { await navigator.clipboard.writeText(paymentDetails.alias); $("#copy-alias").textContent = "Copiado"; setTimeout(() => { $("#copy-alias").textContent = "Copiar"; }, 1400); } catch { window.prompt("Copiá este alias:", paymentDetails.alias); } });
}

init().catch((error) => { console.error(error); $("#menu-grid").innerHTML = "<p>No pudimos cargar el menú. Revisá que la página se esté abriendo desde un servidor local.</p>"; });
