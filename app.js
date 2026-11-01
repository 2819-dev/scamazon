(function () {
  "use strict";

  const P = window.PRODUCTS;
  const C = window.CATEGORIES;
  const byId = Object.fromEntries(P.map((p) => [p.id, p]));
  const app = document.getElementById("app");

  // ---------- storage ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem("scam_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("scam_" + k, JSON.stringify(v)); } catch {} },
  };
  let cart = store.get("cart", {});
  let crime = store.get("crime", false);
  let orders = store.get("orders", []);
  const saveCart = () => { store.set("cart", cart); updateCount(); };

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const priceHTML = (n) => {
    const [d, c] = n.toFixed(2).split(".");
    return `<span class="price"><sup>$</sup>${Number(d).toLocaleString("en-US")}<span class="cents">${c}</span></span>`;
  };
  const stars = (r) => {
    const full = Math.floor(r), half = r - full >= 0.5 ? 1 : 0;
    return "★".repeat(full) + (half ? "⯪" : "") + "☆".repeat(5 - full - half);
  };
  const ratingLine = (p) => `<div class="rating-line"><span>${p.rating.toFixed(1)}</span><span class="stars" aria-label="${p.rating} out of 5 stars">${stars(p.rating)}</span><span class="count">(${p.reviews.toLocaleString()})</span></div>`;
  const thumb = (p, cls = "") => `<div class="thumb ${cls}" style="background:linear-gradient(135deg,${p.bg[0]},${p.bg[1]})"><span>${p.emoji}</span><span class="brand-tag">${esc(p.brand)}</span></div>`;
  const off = (p) => Math.round((1 - p.price / p.list) * 100);
  const catName = (id) => (C.find((c) => c.id === id) || {}).name || "All";
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((s, [id, q]) => s + (byId[id] ? byId[id].price * q : 0), 0);
  const deliveryDate = (days) => {
    const d = new Date(); d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
  // deterministic pseudo-random per product
  const seeded = (str) => { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000; };
  const stockFor = (p) => Math.floor(seeded(p.id)() * 18) + 1;

  function updateCount() { document.getElementById("cartCount").textContent = cartCount(); }

  let toastTimer;
  function toast(html) {
    const t = document.getElementById("toast");
    t.innerHTML = html;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
  }

  function addToCart(id, qty = 1) {
    cart[id] = (cart[id] || 0) + qty;
    saveCart();
    const p = byId[id];
    toast(`<span style="font-size:28px">${p.emoji}</span><div><b style="color:#067d62">✔ Added to Cart</b><br><span style="font-size:12px">Cart subtotal: <b>${money(cartTotal())}</b></span></div><a class="btn" href="#/cart">Go to Cart</a>`);
  }

  // ---------- header ----------
  const sel = document.getElementById("searchCat");
  C.forEach((c) => sel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${esc(c.name)}</option>`));
  const subnav = document.getElementById("subnav");
  C.forEach((c) => subnav.insertAdjacentHTML("beforeend", `<a href="#/s?cat=${c.id}">${esc(c.name)}</a>`));
  subnav.insertAdjacentHTML("beforeend", `<a href="#/orders">Customer Disservice</a><a href="#/about">Sell</a>`);
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("searchInput").value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sel.value) params.set("cat", sel.value);
    location.hash = "#/s?" + params.toString();
  });

  // ---------- reusable pieces ----------
  function deliveryLine(p) {
    if (p.crime && crime) return `<div class="delivery"><span class="crime-badge">crime</span> FREE delivery <b>${deliveryDate(1)}</b></div>`;
    if (p.crime) return `<div class="delivery"><span class="crime-badge">crime</span> FREE delivery <b>${deliveryDate(2)}</b> for Crime members<br>or FREE delivery <b>${deliveryDate(7)}</b> on $35 of items</div>`;
    return `<div class="delivery">FREE delivery <b>${deliveryDate(9)}</b>, maybe</div>`;
  }

  function resultCard(p) {
    return `<div class="result">
      <a href="#/p/${p.id}">${thumb(p)}</a>
      <a class="t" href="#/p/${p.id}">${esc(p.title)}</a>
      ${ratingLine(p)}
      ${p.deal && off(p) > 0 ? `<div><span class="deal-badge">Limited time deal</span></div>` : ""}
      <div>${priceHTML(p.price)} ${p.list > p.price ? `<span class="list-price">List: <s>${money(p.list)}</s></span>` : ""}</div>
      ${deliveryLine(p)}
      <button class="btn" data-add="${p.id}">Add to cart</button>
    </div>`;
  }

  // ---------- views ----------
  const slides = [
    { bg: "linear-gradient(135deg,#ff7e5f,#feb47b)", e: "🍐", h: "The new pPhone 17 Pro", p: "From Pear. Now with even fewer ports." },
    { bg: "linear-gradient(135deg,#2c0b0b,#c0392b)", e: "🦹", h: "Join Crime today", p: "Free delivery, Crime Video & deals that are basically illegal." },
    { bg: "linear-gradient(135deg,#00c6ff,#0072ff)", e: "🎮", h: "Gaming Week", p: "Up to 40% off consoles that totally exist." },
    { bg: "linear-gradient(135deg,#56ab2f,#a8e063)", e: "🏠", h: "Home deals you won't believe", p: "Seriously. Don't believe them." },
  ];

  function home() {
    const quad = (title, items, link, linkText) => `<div class="card"><h3>${title}</h3><div class="quad">${items.map((p) => `<a href="#/p/${p.id}">${thumb(p)}<div>${esc(p.brand)}</div></a>`).join("")}</div><a class="see-more" href="${link}">${linkText}</a></div>`;
    const single = (title, p, link, linkText) => `<div class="card single"><h3>${title}</h3><a href="#/p/${p.id}">${thumb(p)}</a><a class="see-more" href="${link}">${linkText}</a></div>`;
    const inCat = (c) => P.filter((p) => p.cat === c);
    const scroller = (title, list) => `<div class="row"><h3>${title}</h3><div class="scroller">${list.map((p) => `<div class="item"><a href="#/p/${p.id}">${thumb(p)}</a><a class="t" href="#/p/${p.id}">${esc(p.title)}</a>${p.deal ? `<span class="deal-badge">${off(p)}% off</span>` : ""}<div>${priceHTML(p.price)}</div></div>`).join("")}</div></div>`;

    app.innerHTML = `
      ${crime ? `<div class="member-banner">🦹 Welcome back, Crime member. Your crimes ship free.</div>` : ""}
      <section class="hero" aria-label="Featured">
        ${slides.map((s, i) => `<div class="hero-slide ${i === 0 ? "active" : ""}" style="background:${s.bg}"><div><span class="hero-emoji">${s.e}</span><h2>${s.h}</h2><p>${s.p}</p></div></div>`).join("")}
        <button class="hero-btn prev" aria-label="Previous slide">‹</button>
        <button class="hero-btn next" aria-label="Next slide">›</button>
      </section>
      <section class="grid-cards">
        ${quad("Shop Pear products", P.filter((p) => p.brand === "Pear").slice(0, 4), "#/s?q=pear", "See all Pear")}
        ${quad("Gaming accessories", inCat("gaming"), "#/s?cat=gaming", "See more")}
        ${single("Deal of the day", byId["rollex"], "#/deals", "See all deals")}
        ${quad("Upgrade your home", inCat("home").slice(0, 4), "#/s?cat=home", "Shop home")}
        ${quad("Fashion-ish", inCat("fashion").slice(0, 4), "#/s?cat=fashion", "Shop fashion")}
        ${crime ? single("You're a Crime member", byId["echo-echo"], "#/crime", "Manage membership") :
          `<div class="card"><h3>Try Crime free</h3><div class="thumb" style="height:280px;font-size:110px;background:radial-gradient(circle,#6b1414,#0b0b0b)"><span>🦹</span></div><a class="btn crime block" style="display:block;text-align:center;margin-top:12px" href="#/crime">Start your 30-day free trial</a></div>`}
        ${quad("Snacks & drinks", inCat("grocery"), "#/s?cat=grocery", "Shop grocery")}
        ${quad("Toys for big kids", inCat("toys"), "#/s?cat=toys", "Shop toys")}
      </section>
      ${scroller("Today's suspiciously good deals", P.filter((p) => p.deal).sort((a, b) => off(b) - off(a)))}
      ${scroller("Best sellers in Electronics", inCat("electronics"))}
      ${scroller("Scamazon Devices — they're listening", [...inCat("devices"), ...inCat("computers")])}
    `;

    // carousel
    let idx = 0;
    const els = app.querySelectorAll(".hero-slide");
    const go = (d) => { els[idx].classList.remove("active"); idx = (idx + d + els.length) % els.length; els[idx].classList.add("active"); };
    app.querySelector(".prev").onclick = () => go(-1);
    app.querySelector(".next").onclick = () => go(1);
    const timer = setInterval(() => { if (!document.body.contains(els[0])) return clearInterval(timer); go(1); }, 5000);
  }

  function search(params, dealsOnly = false) {
    const q = (params.get("q") || "").toLowerCase();
    const cat = params.get("cat") || "";
    const sort = params.get("sort") || "featured";
    const crimeOnly = params.get("crime") === "1";
    const minStars = Number(params.get("stars") || 0);
    let list = P.filter((p) =>
      (!q || (p.title + " " + p.brand + " " + p.cat).toLowerCase().includes(q)) &&
      (!cat || p.cat === cat) && (!crimeOnly || p.crime) && (!dealsOnly || p.deal) && p.rating >= minStars);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "reviews") list.sort((a, b) => b.reviews - a.reviews);

    const base = dealsOnly ? "#/deals" : "#/s";
    const link = (changes) => { const n = new URLSearchParams(params); Object.entries(changes).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); return base + "?" + n.toString(); };

    app.innerHTML = `
      <div class="results">
        <aside class="filters">
          <h4>Department</h4>
          <a href="${link({ cat: "" })}" class="${!cat ? "active" : ""}">All Departments</a>
          ${C.map((c) => `<a href="${link({ cat: c.id })}" class="${cat === c.id ? "active" : ""}">${c.emoji} ${esc(c.name)}</a>`).join("")}
          <h4>Delivery</h4>
          <label><input type="checkbox" id="crimeFilter" ${crimeOnly ? "checked" : ""}> <span class="crime-badge">crime</span> eligible</label>
          <h4>Customer Reviews</h4>
          ${[4, 3].map((s) => `<a href="${link({ stars: minStars === s ? "" : s })}" class="${minStars === s ? "active" : ""}"><span class="stars">${stars(s)}</span> &amp; Up</a>`).join("")}
          <h4>Brands</h4>
          ${[...new Set(P.map((p) => p.brand))].sort().slice(0, 14).map((b) => `<a href="#/s?q=${encodeURIComponent(b)}">${esc(b)}</a>`).join("")}
        </aside>
        <div class="results-main">
          <div class="results-head">
            <div>${list.length} result${list.length === 1 ? "" : "s"} ${q ? `for <b style="color:#c45500">"${esc(params.get("q"))}"</b>` : ""} ${cat ? `in <b>${esc(catName(cat))}</b>` : ""} ${dealsOnly ? "<b>— Today's Deals</b>" : ""}</div>
            <label>Sort by: <select id="sortSel">
              ${[["featured", "Featured"], ["low", "Price: Low to High"], ["high", "Price: High to Low"], ["rating", "Avg. Customer Review"], ["reviews", "Most Reviewed"]].map(([v, t]) => `<option value="${v}" ${sort === v ? "selected" : ""}>${t}</option>`).join("")}
            </select></label>
          </div>
          ${list.length ? `<div class="result-grid">${list.map(resultCard).join("")}</div>` :
            `<div class="page" style="margin:0"><h2>No results for "${esc(params.get("q") || "")}"</h2><p>Try checking your spelling, or accept that even we don't sell a knockoff of that. Yet.</p></div>`}
        </div>
      </div>`;
    document.getElementById("sortSel").onchange = (e) => (location.hash = link({ sort: e.target.value === "featured" ? "" : e.target.value }));
    document.getElementById("crimeFilter").onchange = (e) => (location.hash = link({ crime: e.target.checked ? "1" : "" }));
  }

  const reviewers = ["Karen W.", "Definitely_Real_Person", "Chad", "Grandma Joan", "TotallyNotABot42", "Mike from Ohio", "A Customer", "xX_Gamer_Xx", "Linda", "Dr. Reviews PhD"];
  const reviewBank = [
    [5, "Exactly like the real thing", "My friends couldn't tell the difference. I couldn't either. I'm not sure there is one."],
    [5, "Arrived before I ordered it", "Crime delivery is fast. Suspiciously fast. I didn't even click buy yet."],
    [4, "Pretty good, one star off for the smell", "Works great. Smells faintly of a warehouse and ambition."],
    [1, "Received a brick", "Ordered this, got a brick. To be fair, it's a very nice brick. Updating to 2 stars."],
    [5, "Changed my life", "I was given this product for free in exchange for an honest review. Honestly: 5 stars."],
    [3, "It's fine", "It does what it says, and also some things it doesn't say. Mostly fine."],
    [4, "My cat loves the box", "Product is OK. The box is a 10/10 according to Mr. Whiskers."],
    [2, "Instructions were in Comic Sans", "Hard to take seriously. Works though."],
  ];

  function product(id) {
    const p = byId[id];
    if (!p) return notFound();
    const rand = seeded(p.id);
    const stock = stockFor(p);
    const revs = Array.from({ length: 4 }, () => reviewBank[Math.floor(rand() * reviewBank.length)]);
    const dist = [5, 4, 3, 2, 1].map((s) => {
      const base = s === 5 ? p.rating * 14 : s === 4 ? 22 : s === 3 ? 8 : s === 2 ? 4 : 6 - p.rating;
      return Math.max(1, Math.round(base));
    });
    const totalDist = dist.reduce((a, b) => a + b, 0);
    const related = P.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 8);

    app.innerHTML = `
      <div style="padding:14px">
        <div class="pdp">
          <div class="crumbs"><a href="#/s?cat=${p.cat}">${esc(catName(p.cat))}</a> › <a href="#/s?q=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></div>
          <div class="pdp-gallery">${thumb(p)}</div>
          <div class="pdp-info">
            <h1>${esc(p.title)}</h1>
            <a class="brand-link" href="#/s?q=${encodeURIComponent(p.brand)}">Visit the ${esc(p.brand)} Store</a>
            ${ratingLine(p)}
            ${p.reviews > 20000 ? `<span class="bestseller">#1 Best Seller</span> <span style="font-size:12px">in ${esc(catName(p.cat))}</span>` : ""}
            <div style="font-size:13px;margin-top:4px"><b>${(Math.floor(rand() * 9) + 1)}K+ bought</b> in past month</div>
            <hr>
            ${p.deal ? `<span class="deal-badge">Limited time deal</span>` : ""}
            <div style="margin:6px 0">${p.list > p.price ? `<span style="color:#cc0c39;font-size:28px;font-weight:300">-${off(p)}%</span> ` : ""}${priceHTML(p.price)}</div>
            ${p.list > p.price ? `<div class="list-price">List Price: <s>${money(p.list)}</s></div>` : ""}
            ${p.crime ? `<div style="margin-top:6px"><span class="crime-badge">crime</span> <span style="font-size:13px">${crime ? "FREE One-Day Delivery — you're a member" : `<a href="#/crime" style="color:var(--link)">Join Crime</a> for FREE delivery`}</span></div>` : ""}
            <hr>
            <h3 style="margin:0 0 6px">About this item</h3>
            <ul>${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
          </div>
          <div class="buybox">
            ${priceHTML(p.price)}
            ${deliveryLine(p)}
            <div class="stock ${stock < 6 ? "low" : ""}">${stock < 6 ? `Only ${stock} left in stock - order soon.` : "In Stock"}</div>
            <label>Quantity: <select id="qtySel">${Array.from({ length: Math.min(stock, 10) }, (_, i) => `<option>${i + 1}</option>`).join("")}</select></label>
            <button class="btn block" id="addBtn">Add to Cart</button>
            <button class="btn orange block" id="buyBtn">Buy Now</button>
            <div class="meta">
              <span>Ships from</span><span>Scamazon.con</span>
              <span>Sold by</span><span>${esc(p.brand)} (probably)</span>
              <span>Returns</span><span>Returnable within 30 seconds</span>
              <span>Payment</span><span class="secure">🔒 Secure-ish transaction</span>
            </div>
            <hr>
            <button class="btn ghost block" id="listBtn">Add to List</button>
          </div>
        </div>

        ${related.length ? `<div class="row" style="margin:14px 0"><h3>Products related to this item</h3><div class="scroller">${related.map((r) => `<div class="item"><a href="#/p/${r.id}">${thumb(r)}</a><a class="t" href="#/p/${r.id}">${esc(r.title)}</a>${ratingLine(r)}<div>${priceHTML(r.price)}</div></div>`).join("")}</div></div>` : ""}

        <div class="reviews">
          <div>
            <h2 style="margin:0">Customer reviews</h2>
            <div style="display:flex;gap:8px;align-items:center;margin:6px 0"><span class="stars" style="font-size:20px">${stars(p.rating)}</span> <b>${p.rating} out of 5</b></div>
            <div style="color:var(--muted);font-size:13px">${p.reviews.toLocaleString()} global ratings (many from real people)</div>
            ${dist.map((d, i) => `<div class="hist"><span>${5 - i} star</span><div class="bar"><div style="width:${Math.round((d / totalDist) * 100)}%"></div></div><span>${Math.round((d / totalDist) * 100)}%</span></div>`).join("")}
          </div>
          <div>
            <h3 style="margin-top:0">Top reviews from the United States</h3>
            ${revs.map(([s, h, t], i) => `<div class="review">
              <div class="who"><span class="avatar">👤</span>${esc(reviewers[Math.floor(rand() * reviewers.length)])}</div>
              <div class="head"><span class="stars">${stars(s)}</span> ${esc(h)}</div>
              <div style="font-size:12px;color:var(--muted)">Reviewed in the United States on ${deliveryDate(-(i + 1) * 17)}</div>
              <div class="verified">Verified-ish Purchase</div>
              <p>${esc(t)}</p>
              <div class="helpful">${Math.floor(rand() * 500)} people found this helpful</div>
            </div>`).join("")}
          </div>
        </div>
      </div>`;
    const qty = () => Number(document.getElementById("qtySel").value);
    document.getElementById("addBtn").onclick = () => addToCart(p.id, qty());
    document.getElementById("buyBtn").onclick = () => { cart[p.id] = (cart[p.id] || 0) + qty(); saveCart(); location.hash = "#/checkout"; };
    document.getElementById("listBtn").onclick = () => toast("📝 Added to your Wish-It-Were-Real List");
  }

  function cartView() {
    const items = Object.entries(cart).filter(([id]) => byId[id]);
    const count = cartCount();
    if (!items.length) {
      app.innerHTML = `<div class="page"><div class="empty-cart"><div class="big">🛒</div><div><h1>Your Scamazon Cart is empty</h1><p>Your wallet thanks you. Your wallet is wrong.</p><a class="btn" href="#/deals">Shop today's deals</a></div></div></div>`;
      return;
    }
    const total = cartTotal();
    app.innerHTML = `
      <div class="cart-wrap">
        <div class="cart-list">
          <h1>Shopping Cart</h1>
          <div style="text-align:right;color:var(--muted);font-size:13px">Price</div>
          ${items.map(([id, q]) => { const p = byId[id]; return `<div class="cart-item">
            <a href="#/p/${id}">${thumb(p)}</a>
            <div>
              <a class="t" href="#/p/${id}">${esc(p.title)}</a>
              <div class="stock" style="color:#007600;font-size:12px;margin:4px 0">In Stock</div>
              ${p.crime ? `<span class="crime-badge">crime</span>` : ""}
              <div class="actions">
                <span class="qty"><button data-dec="${id}" aria-label="Decrease">${q === 1 ? "🗑" : "−"}</button><span>${q}</span><button data-inc="${id}" aria-label="Increase">+</button></span>
                | <button class="linkbtn" data-del="${id}">Delete</button>
                | <button class="linkbtn" data-later="${id}">Save for later</button>
                | <button class="linkbtn" data-share="${id}">Share</button>
              </div>
            </div>
            <div class="line-price" style="font-weight:700;font-size:18px">${money(p.price * q)}</div>
          </div>`; }).join("")}
          <div class="subtotal">Subtotal (${count} item${count === 1 ? "" : "s"}): <b>${money(total)}</b></div>
        </div>
        <div class="summary">
          ${total >= 35 || crime ? `<div class="free">✔ Your order qualifies for FREE Shipping. ${crime ? "Thanks, criminal." : ""}</div>` : `<div class="free" style="color:var(--price)">Add ${money(35 - total)} of eligible items for FREE Shipping.</div>`}
          <div style="font-size:18px">Subtotal (${count} item${count === 1 ? "" : "s"}): <b>${money(total)}</b></div>
          <label style="font-size:13px"><input type="checkbox"> This order contains a gift (of guilt)</label>
          <a class="btn block" style="text-align:center" href="#/checkout">Proceed to checkout</a>
          ${!crime ? `<div style="font-size:12px;border-top:1px solid #ddd;padding-top:10px"><span class="crime-badge">crime</span> members get FREE One-Day delivery. <a href="#/crime" style="color:var(--link)">Try Crime free</a></div>` : ""}
        </div>
      </div>`;
    app.onclick = null;
  }

  function checkout() {
    const items = Object.entries(cart).filter(([id]) => byId[id]);
    if (!items.length) { location.hash = "#/cart"; return; }
    const sub = cartTotal();
    const ship = sub >= 35 || crime ? 0 : 5.99;
    const tax = +(sub * 0.0825).toFixed(2);
    const scamFee = 1.99;
    const total = sub + ship + tax + scamFee;
    app.innerHTML = `
      <div class="checkout">
        <form id="coForm">
          <div class="step"><h3>1 &nbsp; Shipping address</h3>
            <label for="nm">Full name</label><input id="nm" required placeholder="Jane Doe" autocomplete="off">
            <label for="ad">Address</label><input id="ad" required placeholder="123 Totally Real St" autocomplete="off">
            <label for="ct">City, State ZIP</label><input id="ct" required placeholder="Springfield, ?? 00000" autocomplete="off">
          </div>
          <div class="step"><h3>2 &nbsp; Payment method</h3>
            <p style="font-size:13px;color:var(--muted);margin-top:0">This is a parody store. No payment info is collected and nothing is charged — pick your favorite pretend currency.</p>
            <label class="radio"><input type="radio" name="pay" value="Monopoly Money" checked> 🎲 Monopoly Money</label>
            <label class="radio"><input type="radio" name="pay" value="An IOU"> 📝 An IOU written on a napkin</label>
            <label class="radio"><input type="radio" name="pay" value="ScamCoin"> 🪙 ScamCoin (down 98% today)</label>
            <label class="radio"><input type="radio" name="pay" value="Exposure"> 📸 Exposure</label>
          </div>
          <div class="step"><h3>3 &nbsp; Review items and shipping</h3>
            ${items.map(([id, q]) => `<div class="order-line">${thumb(byId[id])}<div><b>${esc(byId[id].title)}</b><br>Qty: ${q} · ${money(byId[id].price * q)}</div></div>`).join("")}
            <label class="radio"><input type="radio" name="ship" checked> ${crime ? `<span class="crime-badge">crime</span> FREE One-Day — ${deliveryDate(1)}` : `Standard — ${deliveryDate(7)}`}</label>
            <label class="radio"><input type="radio" name="ship"> 🐌 No-Rush Delivery — whenever, get a $1 digital credit you'll never use</label>
          </div>
        </form>
        <div class="summary">
          <button class="btn block" form="coForm" type="submit">Place your order</button>
          <div style="font-size:11px;color:var(--muted);text-align:center">By placing your order, you agree to Scamazon's conditions of use, privacy notice, and to never ask questions.</div>
          <h3 style="margin:6px 0">Order Summary</h3>
          <div style="display:grid;grid-template-columns:1fr auto;gap:4px;font-size:13px">
            <span>Items:</span><span>${money(sub)}</span>
            <span>Shipping &amp; handling:</span><span>${money(ship)}</span>
            <span>Convenience fee for your convenience:</span><span>${money(scamFee)}</span>
            <span>Estimated tax:</span><span>${money(tax)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:var(--price);font-size:18px;font-weight:700;border-top:1px solid #ddd;padding-top:10px"><span>Order total:</span><span>${money(total)}</span></div>
        </div>
      </div>`;
    document.getElementById("coForm").onsubmit = (e) => {
      e.preventDefault();
      const pay = new FormData(e.target).get("pay");
      const order = { id: "113-" + Math.floor(1e6 + Math.random() * 9e6) + "-" + Math.floor(1e6 + Math.random() * 9e6), date: Date.now(), items: cart, total, pay, name: document.getElementById("nm").value };
      orders.unshift(order); store.set("orders", orders);
      cart = {}; saveCart();
      app.innerHTML = `<div class="page" style="text-align:center"><div style="font-size:80px">🎉</div><h1 style="color:#067d62">Order placed, thanks!</h1><p>Confirmation will be sent to an email address we made up.</p><p>Order #<b>${order.id}</b> paid with <b>${esc(pay)}</b>.</p><p><b>Arriving ${deliveryDate(crime ? 1 : 7)}</b> (give or take a fiscal quarter)</p><a class="btn" href="#/orders">Review your orders</a> <a class="btn ghost" href="#/">Continue shopping</a></div>`;
      window.scrollTo(0, 0);
    };
  }

  function ordersView() {
    const statuses = ["Delivered to a neighbor you've never met", "Out for delivery (allegedly)", "Lost in transit, emotionally", "Shipped — currently on a boat, vibing", "Delivered. Left in the rain."];
    app.innerHTML = `<div class="page"><h1>Your Orders</h1>
      ${!orders.length ? `<p>You haven't placed any orders yet. Suspicious. <a href="#/" style="color:var(--link)">Start shopping</a></p>` :
      orders.map((o, i) => `<div class="order">
        <div class="order-head"><div>ORDER PLACED<b>${new Date(o.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</b></div><div>TOTAL<b>${money(o.total)}</b></div><div>SHIP TO<b>${esc(o.name)}</b></div><div>PAID WITH<b>${esc(o.pay)}</b></div><div>ORDER # <b>${esc(o.id)}</b></div></div>
        <div class="order-body"><div class="status">${statuses[i % statuses.length]}</div>
          ${Object.entries(o.items).filter(([id]) => byId[id]).map(([id, q]) => `<div class="order-line">${thumb(byId[id])}<div><a href="#/p/${id}" style="color:var(--link)">${esc(byId[id].title)}</a><br>Qty: ${q}<br><button class="btn" style="margin-top:6px" data-add="${id}">🔁 Buy it again</button></div></div>`).join("")}
        </div></div>`).join("")}
      </div>`;
  }

  function crimeView() {
    app.innerHTML = `
      <section class="crime-hero">
        <div class="crime-logo"><span class="s">scamazon</span><span class="c">crime</span></div>
        <p>${crime ? "You're a Crime member. You've been doing Crime for a while now. We're proud of you." : "Free delivery. Crime Video. Crime Music. Deals so good they should be illegal. Because Crime pays."}</p>
        ${crime ? `<button class="btn ghost" id="cancelCrime">Cancel membership (takes 47 clicks)</button>` : `<button class="btn crime" id="joinCrime" style="font-size:18px;padding:12px 30px">Start your 30-day free trial</button>`}
        <div class="fine">After your free trial, Crime is $14.99/month. Cancel anytime*. *Anytime means "eventually, after several 'Are you sure?' screens."</div>
      </section>
      <section class="crime-perks">
        ${[
          ["🚚", "FREE Crime Delivery", "Getaway-car speed: One-Day delivery on millions of items. Packages arrive before you remember ordering them."],
          ["🎬", "Crime Video", "Stream thousands of heist movies, true-crime docuseries, and that one show everyone says you have to watch."],
          ["🎵", "Crime Music", "100 million songs, ad-free. Mostly 'Smooth Criminal' on loop."],
          ["💰", "Crime Day Deals", "Two days a year when everything is 'on sale' from a price we raised the week before."],
          ["📚", "Crime Reading", "Rotating catalog of e-books, mostly mysteries. Whodunit? You did. You bought it."],
          ["📸", "Crime Photos", "Unlimited photo storage. Perfect for evidence. Of your vacation. Evidence of your vacation."],
        ].map(([e, h, t]) => `<div class="perk"><div class="e">${e}</div><h3>${h}</h3><p>${t}</p></div>`).join("")}
      </section>
      <section class="plans">
        <div class="plan"><h3>Monthly</h3><div class="p">$14.99<span style="font-size:14px">/mo</span></div><p>Petty Crime. Commit month to month.</p></div>
        <div class="plan pop"><h3>Annual <span class="deal-badge" style="margin:0">Best value</span></h3><div class="p">$139<span style="font-size:14px">/yr</span></div><p>Organized Crime. Save $40 a year.</p></div>
        <div class="plan"><h3>Student</h3><div class="p">$7.49<span style="font-size:14px">/mo</span></div><p>Juvenile Crime. Requires a .edu email.</p></div>
      </section>`;
    const j = document.getElementById("joinCrime");
    if (j) j.onclick = () => { crime = true; store.set("crime", true); toast("🦹 Welcome to Crime! You're now a member. (Pretend trial, no charge.)"); crimeView(); window.scrollTo(0, 0); };
    const c = document.getElementById("cancelCrime");
    if (c) {
      let clicks = 0;
      c.onclick = () => {
        clicks++;
        const msgs = ["Are you sure?", "Are you SURE sure?", "But think of the free shipping…", "Last chance! (not really)", "OK fine."];
        if (clicks < msgs.length) { c.textContent = msgs[clicks - 1] + " (click again)"; return; }
        crime = false; store.set("crime", false); toast("😢 Crime membership cancelled. You've gone straight."); crimeView();
      };
    }
  }

  function account() {
    app.innerHTML = `<div class="page"><h1>Your Account</h1>
      <div class="crime-perks" style="padding:0">
        <a class="perk" href="#/orders"><div class="e">📦</div><h3>Your Orders</h3><p>Track, return, or buy things again (and again).</p></a>
        <a class="perk" href="#/crime"><div class="e">🦹</div><h3>Crime</h3><p>${crime ? "You're a member. View benefits." : "Not a member yet. Turn to a life of Crime."}</p></a>
        <div class="perk"><div class="e">🔐</div><h3>Login &amp; security</h3><p>Your password is "password". We checked.</p></div>
        <a class="perk" href="#/cart"><div class="e">🛒</div><h3>Your Cart</h3><p>${cartCount()} item(s) waiting patiently.</p></a>
      </div>
      <p style="margin-top:20px"><button class="btn ghost" id="resetBtn">Reset everything (cart, orders, Crime)</button></p></div>`;
    document.getElementById("resetBtn").onclick = () => { cart = {}; orders = []; crime = false; store.set("orders", []); store.set("crime", false); saveCart(); toast("🧹 Fresh start. Evidence destroyed."); account(); };
  }

  function about() {
    app.innerHTML = `<div class="page"><h1>About Scamazon</h1>
      <p>Scamazon.con is a parody online store. Every brand here is lovingly off-brand — Pear, Samsong, Nikey, Abibas, Sonny and friends are fictional.</p>
      <p>Nothing here is for sale. No payment information is collected, no orders are real, and Crime membership is entirely pretend. Your cart and orders live only in your own browser.</p>
      <p>Our mission: to be Earth's most customer-confused company.</p>
      <a class="btn" href="#/">Back to shopping</a></div>`;
  }

  function notFound() {
    app.innerHTML = `<div class="page" style="text-align:center"><div style="font-size:90px">🐶</div><h1>Sorry, we couldn't find that page</h1><p>Meet the dogs of Scamazon. They ate it.</p><a class="btn" href="#/">Go to Scamazon home</a></div>`;
  }

  // ---------- global click delegation ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-del],[data-later],[data-share]");
    if (!t) return;
    const d = t.dataset;
    if (d.add) return addToCart(d.add);
    if (d.inc) { cart[d.inc]++; saveCart(); return cartView(); }
    if (d.dec) { if (--cart[d.dec] <= 0) delete cart[d.dec]; saveCart(); return cartView(); }
    if (d.del) { delete cart[d.del]; saveCart(); return cartView(); }
    if (d.later) { delete cart[d.later]; saveCart(); toast("💾 Saved for later. Later never comes."); return cartView(); }
    if (d.share) { navigator.clipboard?.writeText(location.origin + location.pathname + "#/p/" + d.share).catch(() => {}); toast("🔗 Link copied. Spread the scam."); }
  });

  // ---------- router ----------
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const params = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    document.getElementById("searchInput").value = parts[0] === "s" ? params.get("q") || "" : "";
    sel.value = parts[0] === "s" ? params.get("cat") || "" : "";
    switch (parts[0]) {
      case undefined: home(); break;
      case "s": search(params); break;
      case "deals": search(params, true); break;
      case "p": product(parts[1]); break;
      case "cart": cartView(); break;
      case "checkout": checkout(); break;
      case "orders": ordersView(); break;
      case "crime": crimeView(); break;
      case "account": account(); break;
      case "about": about(); break;
      default: notFound();
    }
    const titles = { s: "Search", deals: "Today's Deals", cart: "Shopping Cart", checkout: "Checkout", orders: "Your Orders", crime: "Crime", account: "Your Account", about: "About" };
    document.title = parts[0] === "p" && byId[parts[1]] ? `Scamazon.con: ${byId[parts[1]].title}` : parts[0] ? `Scamazon.con: ${titles[parts[0]] || "Page Not Found"}` : "Scamazon.con — Spend less*. Regret more.";
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  updateCount();
  route();
})();
