/* ===== LuxStep - main.js ===== */

// ---------- Product data (images live in /images, so they always load) ----------
const products = [
  { id: 1,  name: "Aero Runner",    cat: "sports",   price: 3499, old: 4499, tag: "Sale",    rating: 4.5, img: "images/aero-runner.svg",    desc: "Lightweight mesh upper with responsive cushioning for daily runs." },
  { id: 2,  name: "Urban Classic",  cat: "sneakers", price: 2999, old: null, tag: "New",     rating: 4.6, img: "images/urban-classic.svg",  desc: "Clean low-top silhouette that goes with everything in your wardrobe." },
  { id: 3,  name: "Velocity Pro",   cat: "sports",   price: 4299, old: 5299, tag: "Sale",    rating: 4.8, img: "images/velocity-pro.svg",   desc: "Performance trainer with extra grip and breathable knit." },
  { id: 4,  name: "Noir Oxford",    cat: "formal",   price: 5499, old: null, tag: "Premium", rating: 4.7, img: "images/noir-oxford.svg",    desc: "Full-grain leather oxford with a hand-polished finish." },
  { id: 5,  name: "Street Cloud",   cat: "sneakers", price: 2499, old: 2999, tag: "Sale",    rating: 4.3, img: "images/street-cloud.svg",   desc: "Soft, cloud-like midsole for all-day comfort." },
  { id: 6,  name: "Gold Edge",      cat: "sneakers", price: 4799, old: null, tag: "Limited", rating: 4.9, img: "images/gold-edge.svg",      desc: "Limited edition high-top with gold accent detailing." },
  { id: 7,  name: "Heritage Derby", cat: "formal",   price: 4999, old: 5999, tag: "Sale",    rating: 4.4, img: "images/heritage-derby.svg", desc: "Timeless derby shoe, perfect for office and occasions." },
  { id: 8,  name: "Trail Blazer",   cat: "sports",   price: 3899, old: null, tag: "New",     rating: 4.5, img: "images/trail-blazer.svg",   desc: "Rugged outsole built for trails, hills and wet surfaces." },
  { id: 9,  name: "Loafer Lite",    cat: "casual",   price: 2799, old: null, tag: null,      rating: 4.2, img: "images/loafer-lite.svg",    desc: "Slip-on loafer with a cushioned insole and soft lining." },
  { id: 10, name: "Pulse Low",      cat: "sneakers", price: 3199, old: 3999, tag: "Sale",    rating: 4.6, img: "images/pulse-low.svg",      desc: "Everyday sneaker with a premium feel at a friendly price." },
  { id: 11, name: "Monk Strap",     cat: "formal",   price: 5799, old: null, tag: "Premium", rating: 4.8, img: "images/monk-strap.svg",     desc: "Double monk strap with polished buckles for a sharp look." },
  { id: 12, name: "Canvas Drift",   cat: "casual",   price: 1999, old: null, tag: "New",     rating: 4.1, img: "images/canvas-drift.svg",   desc: "Breathable canvas shoe ideal for relaxed weekends." }
];

const SIZES = [6, 7, 8, 9, 10, 11];
const FREE_SHIP = 2999;
const COUPONS = { LUX30: { pct: 30, cat: "sneakers", label: "30% off sneakers" } };

// ---------- State ----------
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let cart = load("luxstepCart", []);
let wishlist = load("luxstepWish", []);
let coupon = load("luxstepCoupon", null);
let activeFilter = "all";
let searchTerm = "";
let sortMode = "default";
let modalProduct = null;
let modalSize = null;

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

function stars(r) {
  let out = "";
  for (let i = 1; i <= 5; i++) out += i <= Math.round(r) ? "★" : "☆";
  return out;
}

function showToast(msg) {
  $("#toastMsg").textContent = msg;
  bootstrap.Toast.getOrCreateInstance($("#liveToast"), { delay: 2400 }).show();
}

// ---------- Search match: name, category, tag, description ----------
function matches(p, term) {
  if (!term) return true;
  const hay = `${p.name} ${p.cat} ${p.tag || ""} ${p.desc}`.toLowerCase();
  return term.split(/\s+/).every((word) => hay.includes(word));
}

function highlight(text, term) {
  if (!term) return text;
  let out = text;
  term.split(/\s+/).filter(Boolean).forEach((w) => {
    const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    out = out.replace(re, "<mark>$1</mark>");
  });
  return out;
}

// ---------- Render products ----------
function renderProducts() {
  let list = products.filter((p) => {
    const catOk = activeFilter === "all" || (activeFilter === "wishlist" ? wishlist.includes(p.id) : p.cat === activeFilter);
    return catOk && matches(p, searchTerm);
  });
  if (sortMode === "low") list.sort((a, b) => a.price - b.price);
  if (sortMode === "high") list.sort((a, b) => b.price - a.price);
  if (sortMode === "rating") list.sort((a, b) => b.rating - a.rating);

  $("#noResults").classList.toggle("d-none", list.length > 0);
  $("#resultCount").textContent = `Showing ${list.length} of ${products.length} shoes`;

  $("#productGrid").innerHTML = list.map((p) => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card product-card">
        <div class="product-img-wrap" data-view="${p.id}" role="button" tabindex="0" aria-label="Quick view ${p.name}">
          ${p.tag ? `<span class="badge text-bg-warning product-tag">${p.tag}</span>` : ""}
          <button class="wish-btn ${wishlist.includes(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist">
            <i class="bi ${wishlist.includes(p.id) ? "bi-heart-fill" : "bi-heart"}"></i>
          </button>
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="card-body d-flex flex-column">
          <small class="text-muted text-uppercase">${highlight(p.cat, searchTerm)}</small>
          <h6 class="card-title mb-1">${highlight(p.name, searchTerm)}</h6>
          <div class="stars-sm mb-1" title="${p.rating} / 5">${stars(p.rating)} <small class="text-muted">${p.rating}</small></div>
          <div class="mb-3">
            <span class="price">${money(p.price)}</span>
            ${p.old ? `<span class="old-price">${money(p.old)}</span>` : ""}
          </div>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-outline-dark btn-sm flex-fill" data-view="${p.id}">Quick View</button>
            <button class="btn btn-gold btn-sm flex-fill" data-view="${p.id}"><i class="bi bi-bag-plus"></i> Add</button>
          </div>
        </div>
      </div>
    </div>`).join("");

  $("#wishCount").textContent = wishlist.length;
}

// Search suggestions (datalist)
function fillSuggestions() {
  $("#shoeNames").innerHTML = products.map((p) => `<option value="${p.name}">`).join("");
}

// ---------- Quick view modal ----------
function openModal(id) {
  modalProduct = products.find((p) => p.id === id);
  modalSize = null;
  $("#modalTitle").textContent = modalProduct.name;
  $("#modalImg").src = modalProduct.img;
  $("#modalImg").alt = modalProduct.name;
  $("#modalCat").textContent = modalProduct.cat;
  $("#modalDesc").textContent = modalProduct.desc;
  $("#modalStars").innerHTML = `${stars(modalProduct.rating)} <small class="text-muted">${modalProduct.rating} / 5</small>`;
  $("#modalPrice").innerHTML = money(modalProduct.price) + (modalProduct.old ? ` <small class="old-price">${money(modalProduct.old)}</small>` : "");
  $("#modalQty").textContent = "1";

  $("#sizeOptions").innerHTML = SIZES.map((s) => `
    <input type="radio" class="btn-check" name="size" id="size${s}" value="${s}" autocomplete="off">
    <label class="btn btn-outline-dark" for="size${s}">${s}</label>`).join("");

  bootstrap.Modal.getOrCreateInstance($("#productModal")).show();
}

// ---------- Cart ----------
function addToCart(product, size, qty = 1) {
  const existing = cart.find((i) => i.id === product.id && i.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id: product.id, name: product.name, cat: product.cat, price: product.price, img: product.img, size, qty });
  save("luxstepCart", cart);
  renderCart();
  showToast(`${product.name} (UK ${size}) added to cart`);
}

function cartTotals() {
  const subtotal = cart.reduce((n, i) => n + i.qty * i.price, 0);
  let discount = 0;
  if (coupon && COUPONS[coupon]) {
    const c = COUPONS[coupon];
    discount = cart.filter((i) => i.cat === c.cat).reduce((n, i) => n + i.qty * i.price * c.pct / 100, 0);
  }
  return { subtotal, discount, total: subtotal - discount };
}

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const { subtotal, discount, total } = cartTotals();
  $("#cartCount").textContent = count;
  $("#cartSubtotal").textContent = money(subtotal);
  $("#cartTotal").textContent = money(total);
  $("#discountRow").classList.toggle("d-none", discount <= 0);
  $("#cartDiscount").textContent = "-" + money(discount);

  // free-delivery progress bar
  const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);
  $("#shipBar").style.width = pct + "%";
  $("#shipMsg").textContent = subtotal === 0 ? `Free delivery above ${money(FREE_SHIP)}`
    : subtotal >= FREE_SHIP ? "🎉 You have unlocked free delivery!"
    : `Add ${money(FREE_SHIP - subtotal)} more for free delivery`;

  if (!cart.length) {
    $("#cartItems").innerHTML = `<p class="text-center text-muted mt-5"><i class="bi bi-bag fs-1 d-block mb-2"></i>Your cart is empty.</p>`;
    return;
  }
  $("#cartItems").innerHTML = cart.map((i, idx) => `
    <div class="cart-item">
      <img src="${i.img}" alt="${i.name}" />
      <div class="flex-grow-1">
        <h6 class="mb-0">${i.name}</h6>
        <small class="text-muted">UK ${i.size} &middot; ${money(i.price)}</small>
        <div class="btn-group btn-group-sm mt-1 d-flex" style="width:110px" role="group">
          <button class="btn btn-outline-secondary" data-dec="${idx}" aria-label="Decrease">-</button>
          <span class="btn btn-light disabled flex-fill">${i.qty}</span>
          <button class="btn btn-outline-secondary" data-inc="${idx}" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="btn btn-sm text-danger" data-remove="${idx}" aria-label="Remove"><i class="bi bi-trash"></i></button>
    </div>`).join("");
}

// ---------- Events ----------
document.addEventListener("DOMContentLoaded", () => {
  fillSuggestions();
  renderProducts();
  renderCart();

  // Filters
  $("#filterPills").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    document.querySelectorAll("#filterPills .nav-link").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderProducts();
  });

  // Search + sort
  $("#searchInput").addEventListener("input", (e) => { searchTerm = e.target.value.trim().toLowerCase(); renderProducts(); });
  $("#sortSelect").addEventListener("change", (e) => { sortMode = e.target.value; renderProducts(); });
  $("#resetSearch").addEventListener("click", () => {
    searchTerm = ""; $("#searchInput").value = "";
    activeFilter = "all";
    document.querySelectorAll("#filterPills .nav-link").forEach((b) => b.classList.toggle("active", b.dataset.filter === "all"));
    renderProducts();
  });

  // Grid: wishlist heart, quick view / add
  $("#productGrid").addEventListener("click", (e) => {
    const heart = e.target.closest("[data-wish]");
    if (heart) {
      e.stopPropagation();
      const id = Number(heart.dataset.wish);
      const p = products.find((x) => x.id === id);
      if (wishlist.includes(id)) { wishlist = wishlist.filter((w) => w !== id); showToast(`${p.name} removed from wishlist`); }
      else { wishlist.push(id); showToast(`${p.name} saved to wishlist ♥`); }
      save("luxstepWish", wishlist);
      renderProducts();
      return;
    }
    const view = e.target.closest("[data-view]");
    if (view) openModal(Number(view.dataset.view));
  });
  $("#productGrid").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("[data-view]")) openModal(Number(e.target.dataset.view));
  });

  // Modal: size, quantity, add
  $("#sizeOptions").addEventListener("change", (e) => { modalSize = Number(e.target.value); });
  $("#qtyPlus").addEventListener("click", () => { $("#modalQty").textContent = Math.min(10, Number($("#modalQty").textContent) + 1); });
  $("#qtyMinus").addEventListener("click", () => { $("#modalQty").textContent = Math.max(1, Number($("#modalQty").textContent) - 1); });
  $("#modalAddBtn").addEventListener("click", () => {
    if (!modalSize) { showToast("Please select a size first"); return; }
    addToCart(modalProduct, modalSize, Number($("#modalQty").textContent));
    bootstrap.Modal.getInstance($("#productModal")).hide();
  });

  // Cart controls
  $("#cartItems").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rem = e.target.closest("[data-remove]");
    if (inc) cart[inc.dataset.inc].qty++;
    else if (dec) { const i = cart[dec.dataset.dec]; i.qty--; if (i.qty <= 0) cart.splice(dec.dataset.dec, 1); }
    else if (rem) cart.splice(rem.dataset.remove, 1);
    else return;
    save("luxstepCart", cart);
    renderCart();
  });

  // Coupon
  $("#applyCoupon").addEventListener("click", () => {
    const code = $("#couponInput").value.trim().toUpperCase();
    if (COUPONS[code]) { coupon = code; save("luxstepCoupon", coupon); showToast(`Coupon ${code} applied: ${COUPONS[code].label}`); }
    else { coupon = null; save("luxstepCoupon", coupon); showToast("Invalid coupon code. Try LUX30"); }
    renderCart();
  });

  $("#clearCartBtn").addEventListener("click", () => { cart = []; coupon = null; save("luxstepCart", cart); save("luxstepCoupon", coupon); $("#couponInput").value = ""; renderCart(); });
  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) { showToast("Your cart is empty"); return; }
    cart = []; coupon = null; save("luxstepCart", cart); save("luxstepCoupon", coupon); $("#couponInput").value = ""; renderCart();
    const oc = bootstrap.Offcanvas.getInstance($("#cartCanvas"));
    if (oc) oc.hide();
    showToast("Thank you! Your order has been placed (demo).");
  });

  // Contact form validation (Bootstrap)
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target;
    if (!form.checkValidity()) { form.classList.add("was-validated"); return; }
    form.reset();
    form.classList.remove("was-validated");
    showToast("Message sent! We will reply soon.");
  });

  // Navbar shadow + back-to-top button
  const nav = $(".lux-nav");
  const topBtn = $("#topBtn");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
    topBtn.style.display = window.scrollY > 400 ? "block" : "none";
  });
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Close mobile menu after clicking a link
  document.querySelectorAll("#navMenu .nav-link").forEach((link) =>
    link.addEventListener("click", () => {
      const menu = $("#navMenu");
      if (menu.classList.contains("show")) bootstrap.Collapse.getInstance(menu).hide();
    })
  );

  // Active nav link while scrolling
  const sections = document.querySelectorAll("section[id], header[id]");
  const links = document.querySelectorAll("#navMenu .nav-link");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
});
