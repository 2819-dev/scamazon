(function () {
  "use strict";

  const P = window.PRODUCTS;
  const C = window.CATEGORIES;
  const byId = Object.fromEntries(P.map((p) => [p.id, p]));
  const app = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ================= STATE =================
  const store = {
    get(k, d) { try { const v = localStorage.getItem("scam2_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("scam2_" + k, JSON.stringify(v)); } catch {} },
  };
  const S = {
    cart: store.get("cart", []),        // [{id, variant, qty}]
    saved: store.get("saved", []),      // same shape
    wish: store.get("wish", []),        // [id]
    user: store.get("user", null),      // {name, email}
    crime: store.get("crime", false),
    orders: store.get("orders", []),
    address: store.get("address", null),// {name, line1, city, state, zip}
    history: store.get("history", []),  // [id]
    reviews: store.get("reviews", {}),  // {id: [{name, stars, title, body, date}]}
    clipped: store.get("clipped", {}),  // {id: true}
  };
  const save = (...keys) => { keys.forEach((k) => store.set(k, S[k])); refreshHeader(); };

  // ================= HELPERS =================
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const priceHTML = (n, cls = "") => {
    const [d, c] = n.toFixed(2).split(".");
    return `<span class="price ${cls}"><sup>$</sup>${Number(d).toLocaleString("en-US")}<span class="cents">${c}</span></span>`;
  };
  const starSVG = (fill) => `<svg viewBox="0 0 24 24" width="16" height="16"><defs><linearGradient id="g${Math.round(fill * 100)}"><stop offset="${fill * 100}%" stop-color="#de7921"/><stop offset="${fill * 100}%" stop-color="#fff"/></linearGradient></defs><path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" fill="url(#g${Math.round(fill * 100)})" stroke="#de7921" stroke-width="1.3"/></svg>`;
  const stars = (r) => `<span class="stars" aria-label="${r.toFixed(1)} out of 5 stars">${[0, 1, 2, 3, 4].map((i) => starSVG(Math.max(0, Math.min(1, r - i)) >= 0.75 ? 1 : Math.max(0, Math.min(1, r - i)) >= 0.25 ? 0.5 : 0)).join("")}</span>`;
  const catName = (id) => (C.find((c) => c.id === id) || {}).name || "All";
  const off = (price, list) => Math.round((1 - price / list) * 100);
  const dateStr = (d, opts = { weekday: "long", month: "long", day: "numeric" }) => new Date(d).toLocaleDateString("en-US", opts);
  const daysFrom = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
  const seeded = (str) => { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 10000) / 10000; };
  const stockFor = (p) => Math.floor(seeded(p.id + "stock")() * 22) + 2;

  // product pricing incl. variant & user reviews
  const variantDelta = (p, v) => { if (!p.v) return 0; const o = p.v.options.find((x) => x[0] === v); return o ? o[1] : 0; };
  const defaultVariant = (p) => (p.v ? p.v.options[0][0] : "");
  const unitPrice = (p, v) => +(p.price + variantDelta(p, v)).toFixed(2);
  const listPrice = (p, v) => +(p.list + variantDelta(p, v)).toFixed(2);
  const userReviews = (id) => S.reviews[id] || [];
  const ratingOf = (p) => {
    const ur = userReviews(p.id);
    const count = p.reviews + ur.length;
    const avg = (p.rating * p.reviews + ur.reduce((a, r) => a + r.stars, 0)) / count;
    return { avg: Math.round(avg * 10) / 10, count };
  };
  const ratingLine = (p) => { const r = ratingOf(p); return `<div class="rating-line"><span>${r.avg.toFixed(1)}</span>${stars(r.avg)}<a class="count" href="#/p/${p.id}">(${r.count.toLocaleString()})</a></div>`; };
  const imgTag = (p, cls = "", lazy = true) => `<div class="pimg ${cls}"><img src="${p.img}" alt="${esc(p.title)}" ${lazy ? 'loading="lazy"' : ""} decoding="async"></div>`;

  // cart math
  const lineKey = (l) => l.id + "|" + (l.variant || "");
  const cartLines = () => S.cart.filter((l) => byId[l.id]);
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => cartLines().reduce((a, l) => a + unitPrice(byId[l.id], l.variant) * l.qty, 0);
  const couponSavings = () => cartLines().reduce((a, l) => { const p = byId[l.id]; return a + (p.coupon && S.clipped[p.id] ? Math.min(p.coupon, unitPrice(p, l.variant)) * l.qty : 0); }, 0);

  function addToCart(id, variant = defaultVariant(byId[id]), qty = 1, silent = false) {
    const p = byId[id];
    const line = S.cart.find((l) => l.id === id && (l.variant || "") === (variant || ""));
    if (line) line.qty = Math.min(line.qty + qty, 30); else S.cart.push({ id, variant, qty });
    save("cart");
    if (!silent) toast(`<img src="${p.img}" alt="" class="toast-img"><div><b class="ok">✔ Added to Cart</b><br><span class="tiny">${esc(variant ? p.v.name + ": " + variant : p.brand)} · Subtotal <b>${money(cartSubtotal())}</b></span></div><a class="btn sm" href="#/cart">Go to Cart</a>`);
  }
  function toggleWish(id) {
    const i = S.wish.indexOf(id);
    if (i >= 0) { S.wish.splice(i, 1); toast("Removed from your Wish List"); }
    else { S.wish.unshift(id); toast(`<b class="ok">♥ Added to Wish List</b> <a class="btn sm" href="#/lists">View List</a>`); }
    save("wish");
  }
  function pushHistory(id) { S.history = [id, ...S.history.filter((x) => x !== id)].slice(0, 16); store.set("history", S.history); }

  // ================= UI CHROME =================
  let toastTimer;
  function toast(html) {
    const t = $("#toast");
    t.innerHTML = html; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }
  function modal(title, html, onMount) {
    $("#modalTitle").textContent = title; $("#modalBody").innerHTML = html;
    $("#modal").hidden = false; document.body.classList.add("noscroll");
    onMount && onMount($("#modalBody"));
    const f = $("#modalBody input, #modalBody button"); f && f.focus();
  }
  function closeModal() { $("#modal").hidden = true; document.body.classList.remove("noscroll"); }
  $("#modalClose").onclick = closeModal;
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

  function refreshHeader() {
    $("#cartCount").textContent = cartCount();
    const first = S.user ? S.user.name.split(" ")[0] : null;
    $("#helloName").textContent = first ? `Hello, ${first}` : "Hello, sign in";
    $("#drawerHello").textContent = first ? `Hello, ${first}` : "Hello, sign in";
    if (S.address) { $("#deliverTo").textContent = `Deliver to ${first || S.address.name.split(" ")[0] || "you"}`; $("#deliverZip").textContent = `📍 ${S.address.city || ""} ${S.address.zip}`.trim(); }
    else { $("#deliverTo").textContent = "Deliver to you"; $("#deliverZip").textContent = "📍 Update location"; }
  }

  // location modal
  $("#deliverBtn").onclick = () => modal("Choose your location", `
    <p class="muted">Delivery options and delivery speeds may vary for different locations. (They won't, nothing is real.)</p>
    ${S.user ? "" : `<a class="btn block" href="#/signin" data-close>Sign in to see your addresses</a><div class="or">or enter a US zip code</div>`}
    <form id="zipForm" class="inline-form"><input id="zipIn" inputmode="numeric" pattern="\\d{5}" maxlength="5" placeholder="ZIP code" value="${esc(S.address?.zip || "")}" required><button class="btn ghost">Apply</button></form>`,
    (el) => {
      $$("[data-close]", el).forEach((a) => a.addEventListener("click", closeModal));
      $("#zipForm", el).onsubmit = (e) => {
        e.preventDefault();
        const zip = $("#zipIn", el).value;
        const cities = ["Springfield", "Shelbyville", "Gotham-ish", "Nowhere", "Scamville", "Fakesburg"];
        S.address = { ...(S.address || { name: S.user?.name || "", line1: "", state: "" }), zip, city: S.address?.city || cities[Number(zip) % cities.length] };
        save("address"); closeModal(); toast(`📍 Delivering to ${esc(S.address.city)} ${zip}`); route();
      };
    });

  // drawer menu
  function openDrawer() {
    $("#drawerBody").innerHTML = `
      <h4>Trending</h4><a href="#/deals">Today's Deals</a><a href="#/s?sort=reviews">Best Sellers</a><a href="#/s?sort=new">New Releases</a>
      <h4>Shop by Department</h4>${C.map((c) => `<a href="#/s?cat=${c.id}">${esc(c.name)} <span>›</span></a>`).join("")}
      <h4>Programs & Features</h4><a href="#/crime">Crime Membership</a><a href="#/lists">Your Wish List</a>
      <h4>Help & Settings</h4><a href="#/account">Your Account</a><a href="#/orders">Your Orders</a>
      ${S.user ? `<a href="#/" data-signout>Sign Out</a>` : `<a href="#/signin">Sign In</a>`}`;
    $("#drawer").classList.add("open"); $("#scrim").classList.add("show"); $("#drawer").setAttribute("aria-hidden", "false");
  }
  function closeDrawer() { $("#drawer").classList.remove("open"); $("#scrim").classList.remove("show"); $("#drawer").setAttribute("aria-hidden", "true"); }
  $("#menuBtn").onclick = openDrawer;
  $("#scrim").onclick = closeDrawer;
  $("#drawer").addEventListener("click", (e) => { if (e.target.closest("a")) closeDrawer(); });

  // header search + suggestions
  const sel = $("#searchCat");
  C.forEach((c) => sel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${esc(c.name)}</option>`));
  const subnav = $("#subnav");
  C.forEach((c) => subnav.insertAdjacentHTML("beforeend", `<a href="#/s?cat=${c.id}">${esc(c.name)}</a>`));
  subnav.insertAdjacentHTML("beforeend", `<a href="#/lists">Wish List</a><a href="#/orders">Customer Disservice</a>`);

  const input = $("#searchInput"), sug = $("#suggest");
  let sugIdx = -1;
  const doSearch = (q) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sel.value) params.set("cat", sel.value);
    sug.hidden = true; input.blur();
    location.hash = "#/s?" + params.toString();
  };
  $("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); doSearch(input.value.trim()); });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    sugIdx = -1;
    if (!q) { sug.hidden = true; return; }
    const brands = [...new Set(P.map((p) => p.brand))].filter((b) => b.toLowerCase().includes(q)).slice(0, 3);
    const prods = P.filter((p) => (p.title + " " + p.brand).toLowerCase().includes(q)).slice(0, 6);
    if (!brands.length && !prods.length) { sug.innerHTML = `<li class="none">No suggestions. Try "pear" or "crime".</li>`; sug.hidden = false; return; }
    sug.innerHTML = brands.map((b) => `<li role="option" data-q="${esc(b)}">🔍 <b>${esc(b)}</b> <span class="muted">in All Departments</span></li>`).join("") +
      prods.map((p) => `<li role="option" data-id="${p.id}"><img src="${p.img}" alt=""> <span>${esc(p.title.split(" — ")[0])}</span></li>`).join("");
    sug.hidden = false;
  });
  input.addEventListener("keydown", (e) => {
    const items = $$("li[role=option]", sug);
    if (sug.hidden || !items.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sugIdx = (sugIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((li, i) => li.classList.toggle("active", i === sugIdx));
    } else if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); items[sugIdx].dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); }
    else if (e.key === "Escape") sug.hidden = true;
  });
  sug.addEventListener("mousedown", (e) => {
    const li = e.target.closest("li[role=option]"); if (!li) return;
    e.preventDefault();
    if (li.dataset.id) { sug.hidden = true; input.value = ""; location.hash = "#/p/" + li.dataset.id; }
    else { input.value = li.dataset.q; doSearch(li.dataset.q); }
  });
  input.addEventListener("blur", () => setTimeout(() => (sug.hidden = true), 120));

  // ================= SHARED PIECES =================
  function deliveryLine(p, small = true) {
    const cls = small ? "delivery" : "delivery big";
    if (p.crime && S.crime) return `<div class="${cls}"><span class="crime-badge">crime</span> FREE One-Day Delivery <b>${dateStr(daysFrom(1), { weekday: "short", month: "short", day: "numeric" })}</b></div>`;
    if (p.crime) return `<div class="${cls}">FREE delivery <b>${dateStr(daysFrom(6), { weekday: "short", month: "short", day: "numeric" })}</b> on $35 of items<br>Or fastest delivery <b>${dateStr(daysFrom(1), { weekday: "short", month: "short", day: "numeric" })}</b> with <a href="#/crime" class="crime-badge">crime</a></div>`;
    return `<div class="${cls}">Delivery <b>${dateStr(daysFrom(9), { weekday: "short", month: "short", day: "numeric" })}</b>, maybe. Ships from a guy.</div>`;
  }
  const couponBadge = (p) => p.coupon ? `<div class="coupon-line"><span class="coupon-tag">Coupon</span> Save $${p.coupon} with coupon</div>` : "";

  function resultCard(p) {
    const wished = S.wish.includes(p.id);
    return `<div class="result">
      <button class="heart ${wished ? "on" : ""}" data-wish="${p.id}" aria-label="${wished ? "Remove from" : "Add to"} wish list" title="Wish List">♥</button>
      <a href="#/p/${p.id}">${imgTag(p)}</a>
      <a class="t" href="#/p/${p.id}">${esc(p.title)}</a>
      ${ratingLine(p)}
      ${ratingOf(p).count > 30000 ? `<div class="tiny muted">${Math.floor(seeded(p.id)() * 9 + 1)}K+ bought in past month</div>` : ""}
      ${p.deal ? `<div><span class="deal-badge">Limited time deal</span></div>` : ""}
      <div>${priceHTML(p.price)} ${p.list > p.price ? `<span class="list-price">List: <s>${money(p.list)}</s></span>` : ""}</div>
      ${p.v ? `<div class="tiny muted">Options: ${p.v.options.length} ${esc(p.v.name.toLowerCase())}s</div>` : ""}
      ${couponBadge(p)}
      ${deliveryLine(p)}
      ${p.v ? `<a class="btn" href="#/p/${p.id}">See options</a>` : `<button class="btn" data-add="${p.id}">Add to cart</button>`}
    </div>`;
  }
  const miniCard = (p) => `<div class="item"><a href="#/p/${p.id}">${imgTag(p)}</a><a class="t" href="#/p/${p.id}">${esc(p.title)}</a>${ratingLine(p)}${p.deal && p.list > p.price ? `<span class="deal-badge">${off(p.price, p.list)}% off</span>` : ""}<div>${priceHTML(p.price, "sm")}</div></div>`;
  const scroller = (title, list, link) => list.length ? `<section class="row"><div class="row-head"><h3>${title}</h3>${link ? `<a class="see-more" href="${link}">See more</a>` : ""}</div><div class="scroller">${list.map(miniCard).join("")}</div></section>` : "";

  // ================= VIEWS =================
  const slides = [
    { cls: "s1", kicker: "Just dropped", h: "Pear pPhone 17 Pro Max", p: "Now with even fewer ports. From $1,199.", id: "pear-pphone-17" },
    { cls: "s2", kicker: "Crime members save more", h: "Crime pays. Literally.", p: "FREE One-Day delivery, Crime Video & deals that are basically illegal.", link: "#/crime", cta: "Try Crime free", img: "img/rollex.jpg" },
    { cls: "s3", kicker: "Gaming Week", h: "Up to 30% off consoles", p: "PlayStaytion, Xboxx & Joy-Drift controllers.", link: "#/s?cat=gaming", cta: "Shop gaming", img: "img/sonny-playstaytion.jpg" },
    { cls: "s4", kicker: "Summer style", h: "Ray-Bam. BAM. Shade.", p: "Classic Wayfarer-ish sunglasses, 54% off.", id: "raybam" },
  ];

  function home() {
    const inCat = (c) => P.filter((p) => p.cat === c);
    const quad = (title, items, link, linkText) => `<div class="card"><h3>${title}</h3><div class="quad">${items.slice(0, 4).map((p) => `<a href="#/p/${p.id}">${imgTag(p)}<span>${esc(p.title.split(" ").slice(0, 3).join(" "))}</span></a>`).join("")}</div><a class="see-more" href="${link}">${linkText}</a></div>`;
    const single = (title, p, link, linkText, extra = "") => `<div class="card single"><h3>${title}</h3><a href="#/p/${p.id}">${imgTag(p)}</a>${extra}<a class="see-more" href="${link}">${linkText}</a></div>`;
    const hist = S.history.map((id) => byId[id]).filter(Boolean);
    const dealOfDay = P.filter((p) => p.deal).sort((a, b) => off(b.price, b.list) - off(a.price, a.list))[0];

    app.innerHTML = `
      ${S.crime ? `<div class="member-banner">🦹 Welcome back${S.user ? ", " + esc(S.user.name.split(" ")[0]) : ""}. Your Crime membership is active — everything ships free & fast.</div>` : ""}
      <section class="hero" aria-label="Featured">
        ${slides.map((s, i) => { const p = s.id && byId[s.id]; return `<div class="hero-slide ${s.cls} ${i === 0 ? "active" : ""}">
          <div class="hero-copy"><span class="kicker">${s.kicker}</span><h2>${s.h}</h2><p>${s.p}</p><a class="btn ${s.cls === "s2" ? "crime" : ""}" href="${p ? "#/p/" + p.id : s.link}">${s.cta || "Shop now"}</a></div>
          <img class="hero-img" src="${p ? p.img : s.img}" alt="" ${i ? 'loading="lazy"' : ""}>
        </div>`; }).join("")}
        <button class="hero-btn prev" aria-label="Previous slide">‹</button>
        <button class="hero-btn next" aria-label="Next slide">›</button>
        <div class="dots">${slides.map((_, i) => `<button aria-label="Slide ${i + 1}" data-dot="${i}" class="${i ? "" : "on"}"></button>`).join("")}</div>
      </section>
      <section class="grid-cards">
        ${S.user ? `<div class="card"><h3>Hi, ${esc(S.user.name.split(" ")[0])}</h3><p class="muted">Recommendations for you, based on your questionable purchase history.</p><div class="quad">${(hist.length ? hist : P.filter((p) => p.deal)).slice(0, 4).map((p) => `<a href="#/p/${p.id}">${imgTag(p)}<span>${esc(p.brand)}</span></a>`).join("")}</div><a class="see-more" href="#/orders">Your orders</a></div>`
          : `<div class="card signin-card"><h3>Sign in for the best experience</h3><a class="btn block" href="#/signin">Sign in securely-ish</a><p class="muted">New customer? <a class="lnk" href="#/signin?new=1">Start here.</a></p><div class="quad">${P.filter((p) => p.cat === "devices").slice(0, 4).map((p) => `<a href="#/p/${p.id}">${imgTag(p)}<span>${esc(p.title.split(" ").slice(1, 3).join(" "))}</span></a>`).join("")}</div></div>`}
        ${quad("Shop Pear products", P.filter((p) => p.brand === "Pear"), "#/s?q=pear", "See all Pear")}
        ${single("Deal of the day", dealOfDay, "#/deals", "See all deals", `<div class="dod"><span class="deal-badge">Up to ${off(dealOfDay.price, dealOfDay.list)}% off</span> <span class="deal-text">Deal of the Day</span><div class="tiny">${esc(dealOfDay.title.split(" — ")[0])}</div></div>`)}
        ${quad("Level up your gaming", inCat("gaming"), "#/s?cat=gaming", "Shop gaming")}
        ${quad("Kicks & fashion-ish", inCat("fashion"), "#/s?cat=fashion", "Shop fashion")}
        ${quad("Upgrade your kitchen", inCat("home").filter((p) => /pottery|mixer|espresso|decker/.test(p.id)), "#/s?cat=home", "Shop home & kitchen")}
        ${S.crime ? quad("Your Crime picks", P.filter((p) => p.crime && p.deal).slice(4), "#/s?crime=1", "All Crime deals") :
          `<div class="card crime-card"><h3>Try Crime free for 30 days</h3><div class="crime-mini"><div class="crime-logo sm"><span class="s">scamazon</span><span class="c">crime</span></div><p>Free One-Day delivery, Crime Video &amp; more.</p></div><a class="btn crime block" href="#/crime">Start your free trial</a></div>`}
        ${quad("Snacks & sips", inCat("grocery"), "#/s?cat=grocery", "Shop grocery")}
      </section>
      ${hist.length ? scroller("Your browsing history", hist, null) : ""}
      ${scroller("Today's suspiciously good deals", P.filter((p) => p.deal).sort((a, b) => off(b.price, b.list) - off(a.price, a.list)), "#/deals")}
      ${scroller("Best sellers in Electronics", P.filter((p) => p.cat === "electronics").sort((a, b) => b.reviews - a.reviews), "#/s?cat=electronics&sort=reviews")}
      ${scroller("Toys for big kids", inCat("toys"), "#/s?cat=toys")}
      ${scroller("Scamazon Devices — they're listening", [...inCat("devices"), ...inCat("computers")], "#/s?cat=devices")}
    `;

    // carousel
    let idx = 0;
    const els = $$(".hero-slide", app), dots = $$("[data-dot]", app);
    const show = (n) => { els[idx].classList.remove("active"); dots[idx].classList.remove("on"); idx = (n + els.length) % els.length; els[idx].classList.add("active"); dots[idx].classList.add("on"); };
    $(".prev", app).onclick = () => show(idx - 1);
    $(".next", app).onclick = () => show(idx + 1);
    dots.forEach((d) => (d.onclick = () => show(+d.dataset.dot)));
    const timer = setInterval(() => { if (!document.body.contains(els[0])) return clearInterval(timer); show(idx + 1); }, 6000);
  }

  // ---------- search / browse ----------
  const PRICE_BANDS = [["Under $25", 0, 25], ["$25 to $50", 25, 50], ["$50 to $100", 50, 100], ["$100 to $200", 100, 200], ["$200 & above", 200, Infinity]];
  function search(params, mode = "search") {
    const q = (params.get("q") || "").toLowerCase().trim();
    const cat = params.get("cat") || "";
    const sort = params.get("sort") || "featured";
    const crimeOnly = params.get("crime") === "1";
    const dealsOnly = mode === "deals" || params.get("deals") === "1";
    const minStars = Number(params.get("stars") || 0);
    const brandsSel = (params.get("brand") || "").split(",").filter(Boolean);
    const min = params.get("min") !== null && params.get("min") !== "" ? Number(params.get("min")) : null;
    const max = params.get("max") !== null && params.get("max") !== "" ? Number(params.get("max")) : null;
    const page = Math.max(1, Number(params.get("page") || 1));
    const words = q.split(/\s+/).filter(Boolean);

    const base = P.filter((p) =>
      (!words.length || words.every((w) => (p.title + " " + p.brand + " " + catName(p.cat) + " " + p.bullets.join(" ")).toLowerCase().includes(w))) &&
      (!cat || p.cat === cat));
    let list = base.filter((p) =>
      (!crimeOnly || p.crime) && (!dealsOnly || p.deal) && ratingOf(p).avg >= minStars &&
      (!brandsSel.length || brandsSel.includes(p.brand)) && (min === null || p.price >= min) && (max === null || p.price <= max));
    const sorters = {
      low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price,
      rating: (a, b) => ratingOf(b).avg - ratingOf(a).avg, reviews: (a, b) => ratingOf(b).count - ratingOf(a).count,
      discount: (a, b) => off(b.price, b.list) - off(a.price, a.list), new: (a, b) => P.indexOf(b) - P.indexOf(a),
    };
    if (sorters[sort]) list = [...list].sort(sorters[sort]);
    const PER = 16, pages = Math.max(1, Math.ceil(list.length / PER));
    const shown = list.slice((page - 1) * PER, page * PER);

    const baseHash = mode === "deals" ? "#/deals" : "#/s";
    const link = (changes) => { const n = new URLSearchParams(params); n.delete("page"); Object.entries(changes).forEach(([k, v]) => (v === "" || v === null || v === undefined ? n.delete(k) : n.set(k, v))); return baseHash + "?" + n.toString(); };
    const brands = [...new Set(base.map((p) => p.brand))].sort();
    const priceActive = (lo, hi) => min === lo && (hi === Infinity ? max === null : max === hi);

    const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
    app.innerHTML = `
      ${mode === "deals" ? `<div class="deals-banner"><h1>Today's Deals</h1><p>All deals end in <b id="countdown">--:--:--</b>. Then they restart. Forever.</p>
        <div class="chips">${[["", "All Deals"], ...C.map((c) => [c.id, c.name])].map(([id, n]) => `<a class="chip ${cat === id ? "on" : ""}" href="${link({ cat: id })}">${esc(n)}</a>`).join("")}</div></div>` : ""}
      <div class="results">
        <button class="btn ghost filter-toggle" type="button" id="filterToggle">Filters ▾</button>
        <aside class="filters" id="filters">
          ${mode !== "deals" ? `<h4>Department</h4>
          <a href="${link({ cat: "" })}" class="${!cat ? "active" : ""}">Any Department</a>
          ${C.map((c) => `<a href="${link({ cat: c.id })}" class="${cat === c.id ? "active" : ""}">${esc(c.name)}</a>`).join("")}` : ""}
          <h4>Delivery</h4>
          <label><input type="checkbox" data-toggle="crime" ${crimeOnly ? "checked" : ""}> <span class="crime-badge">crime</span> eligible</label>
          ${mode !== "deals" ? `<label><input type="checkbox" data-toggle="deals" ${dealsOnly ? "checked" : ""}> Today's deals only</label>` : ""}
          <h4>Customer Reviews</h4>
          ${[4, 3].map((s) => `<a href="${link({ stars: minStars === s ? "" : s })}" class="${minStars === s ? "active" : ""}">${stars(s)} &amp; Up</a>`).join("")}
          <h4>Brands</h4>
          ${brands.map((b) => `<label><input type="checkbox" data-brand="${esc(b)}" ${brandsSel.includes(b) ? "checked" : ""}> ${esc(b)}</label>`).join("")}
          <h4>Price</h4>
          ${PRICE_BANDS.map(([n, lo, hi]) => `<a href="${priceActive(lo, hi) ? link({ min: "", max: "" }) : link({ min: lo, max: hi === Infinity ? "" : hi })}" class="${priceActive(lo, hi) ? "active" : ""}">${n}</a>`).join("")}
          <form class="price-form" id="priceForm"><input type="number" min="0" placeholder="$ Min" id="minIn" value="${min ?? ""}"><input type="number" min="0" placeholder="$ Max" id="maxIn" value="${max ?? ""}"><button class="btn ghost sm">Go</button></form>
          ${(crimeOnly || minStars || brandsSel.length || min !== null || max !== null || (dealsOnly && mode !== "deals")) ? `<p><a class="lnk" href="${baseHash}?${new URLSearchParams([...(q ? [["q", params.get("q")]] : []), ...(cat ? [["cat", cat]] : [])]).toString()}">✕ Clear all filters</a></p>` : ""}
        </aside>
        <div class="results-main">
          <div class="results-head">
            <div>${list.length ? `${(page - 1) * PER + 1}-${Math.min(page * PER, list.length)} of ` : ""}${list.length} result${list.length === 1 ? "" : "s"} ${q ? `for <b class="q">"${esc(params.get("q"))}"</b>` : ""} ${cat ? `in <b>${esc(catName(cat))}</b>` : ""}</div>
            <label>Sort by: <select id="sortSel">
              ${[["featured", "Featured"], ["low", "Price: Low to High"], ["high", "Price: High to Low"], ["rating", "Avg. Customer Review"], ["reviews", "Most Reviewed"], ["discount", "Biggest Discount"], ["new", "Newest Arrivals"]].map(([v, t]) => `<option value="${v}" ${sort === v ? "selected" : ""}>${t}</option>`).join("")}
            </select></label>
          </div>
          ${shown.length ? `<div class="result-grid">${shown.map(resultCard).join("")}</div>` :
            `<div class="page flat"><h2>No results${q ? ` for "${esc(params.get("q"))}"` : ""}</h2><p>Try checking your spelling, removing filters, or accept that even we don't sell a knockoff of that. Yet.</p><a class="btn" href="#/s">Browse everything</a></div>`}
          ${pages > 1 ? `<nav class="pager">${page > 1 ? `<a href="${link({ page: page - 1 })}">‹ Previous</a>` : `<span class="dim">‹ Previous</span>`}${Array.from({ length: pages }, (_, i) => `<a href="${link({ page: i + 1 })}" class="${i + 1 === page ? "on" : ""}">${i + 1}</a>`).join("")}${page < pages ? `<a href="${link({ page: page + 1 })}">Next ›</a>` : `<span class="dim">Next ›</span>`}</nav>` : ""}
        </div>
      </div>`;

    $("#sortSel").onchange = (e) => (location.hash = link({ sort: e.target.value === "featured" ? "" : e.target.value }));
    $$("[data-toggle]", app).forEach((cb) => (cb.onchange = () => (location.hash = link({ [cb.dataset.toggle]: cb.checked ? "1" : "" }))));
    $$("[data-brand]", app).forEach((cb) => (cb.onchange = () => {
      const set = new Set(brandsSel); cb.checked ? set.add(cb.dataset.brand) : set.delete(cb.dataset.brand);
      location.hash = link({ brand: [...set].join(",") });
    }));
    $("#priceForm").onsubmit = (e) => { e.preventDefault(); location.hash = link({ min: $("#minIn").value, max: $("#maxIn").value }); };
    $("#filterToggle").onclick = () => $("#filters").classList.toggle("open");
    const cd = $("#countdown");
    if (cd) {
      const tick = () => { if (!document.body.contains(cd)) return clearInterval(t); const s = Math.max(0, Math.floor((midnight - Date.now()) / 1000)); cd.textContent = [s / 3600, (s % 3600) / 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":"); };
      const t = setInterval(tick, 1000); tick();
    }
  }

  // ---------- product page ----------
  const reviewers = ["Karen W.", "Definitely_Real_Person", "Chad", "Grandma Joan", "TotallyNotABot42", "Mike from Ohio", "A Scamazon Customer", "xX_Gamer_Xx", "Linda", "Dr. Reviews PhD", "Brenda K.", "Sir Buys-a-Lot"];
  const reviewBank = [
    [5, "Exactly like the real thing", "My friends couldn't tell the difference. I couldn't either. I'm no longer sure there is one."],
    [5, "Arrived before I ordered it", "Crime delivery is fast. Suspiciously fast. I hadn't even clicked buy yet."],
    [4, "Pretty good, one star off for the smell", "Works great. Smells faintly of warehouse and ambition."],
    [1, "Received a brick", "Ordered this, got a brick. To be fair, it's a very nice brick. Updating to 2 stars."],
    [5, "Changed my life", "I received this product for free in exchange for an honest review. Honestly: five stars."],
    [3, "It's fine", "It does what it says, and also some things it doesn't say. Mostly fine."],
    [4, "My cat loves the box", "The product is OK. The box is a 10/10 according to Mr. Whiskers."],
    [2, "The sticker fell off", "Underneath the sticker was another sticker. Turtles all the way down."],
    [5, "Bought three", "One for me, one for my mom, one to return for no reason."],
    [4, "Better than the original-ish", "Does everything the expensive one does, plus a mysterious extra beep."],
  ];

  function product(id, params) {
    const p = byId[id];
    if (!p) return notFound();
    pushHistory(id);
    const rand = seeded(p.id);
    const stock = stockFor(p);
    let variant = params.get("v") && p.v && p.v.options.some((o) => o[0] === params.get("v")) ? params.get("v") : defaultVariant(p);
    const r = ratingOf(p);
    const baseRevs = Array.from({ length: 5 }, () => { const [s, h, t] = reviewBank[Math.floor(rand() * reviewBank.length)]; return { name: reviewers[Math.floor(rand() * reviewers.length)], stars: s, title: h, body: t, date: daysFrom(-Math.floor(rand() * 300) - 3), helpful: Math.floor(rand() * 400), fake: true }; })
      .filter((v, i, a) => a.findIndex((x) => x.title === v.title) === i);
    const allRevs = [...userReviews(p.id).map((x) => ({ ...x, mine: true })), ...baseRevs];
    const dist = [5, 4, 3, 2, 1].map((s) => (s === 5 ? Math.max(5, (r.avg - 3) * 40) : s === 4 ? 22 : s === 3 ? 8 : s === 2 ? 4 : Math.max(2, (5 - r.avg) * 8)));
    const totalDist = dist.reduce((a, b) => a + b, 0);
    const related = P.filter((x) => x.cat === p.cat && x.id !== p.id);
    const alsoBrand = P.filter((x) => x.brand === p.brand && x.id !== p.id);
    const fbt = [p, ...related.slice(0, 2)];
    const views = [["50% 50%", "100%"], ["30% 35%", "180%"], ["70% 60%", "200%"], ["50% 50%", "260%"]];

    app.innerHTML = `
      <div class="pdp-wrap">
        <div class="crumbs"><a href="#/s?cat=${p.cat}">${esc(catName(p.cat))}</a> › <a href="#/s?brand=${encodeURIComponent(p.brand)}">${esc(p.brand)}</a></div>
        <div class="pdp">
          <div class="pdp-gallery">
            <div class="thumbs">${views.map(([pos, size], i) => `<button class="thumb-btn ${i ? "" : "on"}" data-view="${i}" aria-label="View ${i + 1}"><span style="background-image:url(${p.img});background-position:${pos};background-size:${size}"></span></button>`).join("")}</div>
            <div class="main-img" id="mainImg" style="background-image:url(${p.img})"><img src="${p.img}" alt="${esc(p.title)}" id="mainImgEl"><span class="zoom-hint">Roll over image to zoom in</span></div>
          </div>
          <div class="pdp-info">
            <h1>${esc(p.title)}</h1>
            <a class="lnk" href="#/s?brand=${encodeURIComponent(p.brand)}">Visit the ${esc(p.brand)} Store</a>
            <div class="rating-line big"><span>${r.avg.toFixed(1)}</span>${stars(r.avg)}<a class="count" href="#reviews" data-scroll="reviews">${r.count.toLocaleString()} ratings</a></div>
            ${r.count > 20000 ? `<span class="bestseller">#1 Best Seller</span> <span class="tiny">in ${esc(catName(p.cat))}</span>` : ""}
            <div class="tiny"><b>${Math.floor(rand() * 9) + 1}K+ bought</b> in past month</div>
            <hr>
            ${p.deal ? `<span class="deal-badge">Limited time deal</span>` : ""}
            <div class="price-row" id="priceRow"></div>
            ${p.coupon ? `<label class="coupon-clip"><input type="checkbox" id="clip" ${S.clipped[p.id] ? "checked" : ""}> <span class="coupon-tag">Coupon</span> <span id="clipText">${S.clipped[p.id] ? `Coupon clipped! $${p.coupon} off applied at checkout` : `Apply $${p.coupon} coupon`}</span></label>` : ""}
            ${p.crime ? `<div class="crime-row"><span class="crime-badge">crime</span> ${S.crime ? "FREE One-Day Delivery — you're a member" : `<a href="#/crime" class="lnk">Join Crime</a> for FREE One-Day delivery`}</div>` : ""}
            ${p.v ? `<div class="variants"><div><b>${esc(p.v.name)}:</b> <span id="vLabel">${esc(variant)}</span></div><div class="v-opts">${p.v.options.map(([l, d]) => `<button class="v-opt ${l === variant ? "on" : ""}" data-v="${esc(l)}"><b>${esc(l)}</b><span>${money(p.price + d)}</span></button>`).join("")}</div></div>` : ""}
            <hr>
            <h3>About this item</h3>
            <ul class="bullets">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}<li>Brand sticker hand-applied by our authenticity team (Gary)</li></ul>
          </div>
          <div class="buybox">
            <div id="bbPrice"></div>
            ${deliveryLine(p, false)}
            ${S.address ? `<div class="tiny lnk">📍 Deliver to ${esc(S.address.city || "")} ${esc(S.address.zip)}</div>` : `<button class="linkbtn tiny" data-loc>📍 Update location</button>`}
            <div class="stock ${stock < 6 ? "low" : ""}">${stock < 6 ? `Only ${stock} left in stock - order soon.` : "In Stock"}</div>
            <label class="qty-label">Quantity: <select id="qtySel">${Array.from({ length: Math.min(stock, 10) }, (_, i) => `<option>${i + 1}</option>`).join("")}</select></label>
            <button class="btn block" id="addBtn">Add to Cart</button>
            <button class="btn orange block" id="buyBtn">Buy Now</button>
            <div class="meta">
              <span>Ships from</span><span>Scamazon.con</span>
              <span>Sold by</span><span>${esc(p.brand)} (probably)</span>
              <span>Returns</span><span>Returnable within 30 seconds</span>
              <span>Payment</span><span class="lnk">🔒 Secure-ish transaction</span>
            </div>
            <label class="gift"><input type="checkbox"> Add a gift receipt for easy returns (lol)</label>
            <hr>
            <button class="btn ghost block" id="listBtn">${S.wish.includes(p.id) ? "♥ In your Wish List" : "Add to List"}</button>
            <button class="btn ghost block" id="shareBtn">Share 🔗</button>
          </div>
        </div>

        ${related.length >= 2 ? `<section class="row flat"><h3>Frequently bought together</h3><div class="fbt">
          <div class="fbt-imgs">${fbt.map((x, i) => `${i ? '<span class="plus">+</span>' : ""}<a href="#/p/${x.id}">${imgTag(x)}</a>`).join("")}</div>
          <div class="fbt-side"><div>Total price: <b class="red">${money(fbt.reduce((a, x) => a + x.price, 0))}</b></div><button class="btn" id="fbtBtn">Add all ${fbt.length} to Cart</button>
          <ul class="tiny">${fbt.map((x, i) => `<li>${i ? "" : "<b>This item:</b> "}${esc(x.title.split(" — ")[0])} — <b>${money(x.price)}</b></li>`).join("")}</ul></div></div></section>` : ""}

        ${scroller("Products related to this item", related, `#/s?cat=${p.cat}`)}
        ${alsoBrand.length ? scroller(`More from ${esc(p.brand)}`, alsoBrand, `#/s?brand=${encodeURIComponent(p.brand)}`) : ""}

        <section class="reviews" id="reviews">
          <div>
            <h2>Customer reviews</h2>
            <div class="rating-line big">${stars(r.avg)} <b>${r.avg.toFixed(1)} out of 5</b></div>
            <div class="muted tiny">${r.count.toLocaleString()} global ratings (many from real people)</div>
            ${dist.map((d, i) => `<div class="hist"><span>${5 - i} star</span><div class="bar"><div style="width:${Math.round((d / totalDist) * 100)}%"></div></div><span>${Math.round((d / totalDist) * 100)}%</span></div>`).join("")}
            <hr>
            <h3>Review this product</h3>
            <p class="tiny">Share your thoughts with other customers (and our marketing team)</p>
            <button class="btn ghost block" id="writeReview">Write a customer review</button>
          </div>
          <div>
            <h3>Top reviews from the United States</h3>
            ${allRevs.map((rv) => `<div class="review">
              <div class="who"><span class="avatar">${esc(rv.name[0])}</span>${esc(rv.name)}${rv.mine ? ' <span class="you">You</span>' : ""}</div>
              <div class="head">${stars(rv.stars)} <b>${esc(rv.title)}</b></div>
              <div class="tiny muted">Reviewed in the United States on ${dateStr(rv.date, { month: "long", day: "numeric", year: "numeric" })}${p.v && !rv.mine ? ` · ${esc(p.v.name)}: ${esc(p.v.options[Math.floor(seeded(rv.title)() * p.v.options.length)][0])}` : ""}</div>
              <div class="verified">${rv.mine ? "Your review" : "Verified-ish Purchase"}</div>
              <p>${esc(rv.body)}</p>
              ${rv.mine ? "" : `<div class="helpful"><span>${rv.helpful} people found this helpful</span> <button class="btn ghost sm" data-helpful>Helpful</button> <button class="linkbtn tiny" data-report>Report</button></div>`}
            </div>`).join("")}
          </div>
        </section>
      </div>`;

    // dynamic price/variant rendering
    function renderPrice() {
      const up = unitPrice(p, variant), lp = listPrice(p, variant);
      $("#priceRow").innerHTML = `${lp > up ? `<span class="pct">-${off(up, lp)}%</span> ` : ""}${priceHTML(up, "big")}${lp > up ? `<div class="list-price">List Price: <s>${money(lp)}</s></div>` : ""}<div class="tiny muted">${up > 100 ? `Or ${money(up / 12)}/mo (12 mo) with Scamazon Store Card-ish. Interest: yes.` : "No interest. In anything."}</div>`;
      $("#bbPrice").innerHTML = priceHTML(up, "big");
    }
    renderPrice();
    $$(".v-opt", app).forEach((b) => (b.onclick = () => {
      variant = b.dataset.v; $$(".v-opt", app).forEach((x) => x.classList.toggle("on", x === b)); $("#vLabel").textContent = variant; renderPrice();
      history.replaceState(null, "", "#/p/" + p.id + "?v=" + encodeURIComponent(variant));
    }));
    const clip = $("#clip");
    if (clip) clip.onchange = () => { S.clipped[p.id] = clip.checked; if (!clip.checked) delete S.clipped[p.id]; save("clipped"); $("#clipText").textContent = clip.checked ? `Coupon clipped! $${p.coupon} off applied at checkout` : `Apply $${p.coupon} coupon`; };

    // gallery: thumbnails + hover zoom
    const main = $("#mainImg"), mainImg = $("#mainImgEl");
    $$(".thumb-btn", app).forEach((b) => b.addEventListener("mouseenter", () => b.click()));
    $$(".thumb-btn", app).forEach((b) => (b.onclick = () => {
      $$(".thumb-btn", app).forEach((x) => x.classList.toggle("on", x === b));
      const [pos, size] = views[b.dataset.view];
      mainImg.style.objectPosition = pos; mainImg.style.transform = `scale(${parseInt(size) / 100})`; mainImg.style.transformOrigin = pos;
    }));
    main.addEventListener("mousemove", (e) => {
      const rc = main.getBoundingClientRect();
      main.style.backgroundPosition = `${((e.clientX - rc.left) / rc.width) * 100}% ${((e.clientY - rc.top) / rc.height) * 100}%`;
      main.classList.add("zooming");
    });
    main.addEventListener("mouseleave", () => main.classList.remove("zooming"));

    const qty = () => Number($("#qtySel").value);
    $("#addBtn").onclick = () => addToCart(p.id, variant, qty());
    $("#buyBtn").onclick = () => { addToCart(p.id, variant, qty(), true); location.hash = "#/checkout"; };
    $("#listBtn").onclick = () => { toggleWish(p.id); $("#listBtn").textContent = S.wish.includes(p.id) ? "♥ In your Wish List" : "Add to List"; };
    $("#shareBtn").onclick = () => copyLink("#/p/" + p.id);
    const fbtBtn = $("#fbtBtn");
    if (fbtBtn) fbtBtn.onclick = () => { fbt.forEach((x) => addToCart(x.id, defaultVariant(x), 1, true)); toast(`<b class="ok">✔ ${fbt.length} items added to Cart</b> <a class="btn sm" href="#/cart">Go to Cart</a>`); };
    $("#writeReview").onclick = () => reviewModal(p);
    $$("[data-helpful]", app).forEach((b) => (b.onclick = () => { b.disabled = true; b.textContent = "Thanks!"; const s = b.previousElementSibling; s.textContent = (parseInt(s.textContent) + 1) + " people found this helpful"; }));
    $$("[data-report]", app).forEach((b) => (b.onclick = () => { b.replaceWith(Object.assign(document.createElement("span"), { className: "tiny muted", textContent: "Reported. We'll ignore it promptly." })); }));
    const sc = $("[data-scroll]", app); if (sc) sc.onclick = (e) => { e.preventDefault(); $("#reviews").scrollIntoView({ behavior: "smooth" }); };
  }

  function reviewModal(p) {
    if (!S.user) { toast("Sign in to write a review"); location.hash = "#/signin?next=" + encodeURIComponent("#/p/" + p.id); return; }
    let rating = 0;
    modal("Create Review", `
      <div class="review-prod">${imgTag(p, "xs")}<span>${esc(p.title.split(" — ")[0])}</span></div>
      <form id="revForm" class="stack">
        <label>Overall rating</label>
        <div class="star-pick" id="starPick">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-s="${n}" aria-label="${n} stars">★</button>`).join("")}</div>
        <label for="rvTitle">Add a headline</label><input id="rvTitle" required maxlength="80" placeholder="What's most important to know?">
        <label for="rvBody">Add a written review</label><textarea id="rvBody" required rows="4" maxlength="800" placeholder="What did you like or dislike? Did the sticker stay on?"></textarea>
        <p class="tiny muted" id="rvErr"></p>
        <button class="btn">Submit</button>
      </form>`, (el) => {
      const btns = $$("[data-s]", el);
      btns.forEach((b) => (b.onclick = () => { rating = +b.dataset.s; btns.forEach((x) => x.classList.toggle("on", +x.dataset.s <= rating)); }));
      $("#revForm", el).onsubmit = (e) => {
        e.preventDefault();
        if (!rating) { $("#rvErr", el).textContent = "Please select a star rating."; return; }
        (S.reviews[p.id] = S.reviews[p.id] || []).unshift({ name: S.user.name, stars: rating, title: $("#rvTitle", el).value.trim(), body: $("#rvBody", el).value.trim(), date: Date.now() });
        save("reviews"); closeModal(); toast("<b class='ok'>✔ Review submitted.</b> Thanks for your honest(ish) opinion."); route();
      };
    });
  }

  function copyLink(hash) {
    const url = location.origin + location.pathname + hash;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast("🔗 Link copied. Spread the scam."), () => modal("Share", `<input class="share-in" value="${esc(url)}" readonly onclick="this.select()">`));
  }

  // ---------- cart ----------
  function cartView() {
    const lines = cartLines();
    const saved = S.saved.filter((l) => byId[l.id]);
    const sub = cartSubtotal(), count = cartCount(), coupons = couponSavings();
    const lineHTML = (l, isSaved) => { const p = byId[l.id]; const k = lineKey(l); return `<div class="cart-item">
      <a href="#/p/${p.id}${l.variant ? "?v=" + encodeURIComponent(l.variant) : ""}">${imgTag(p)}</a>
      <div>
        <a class="t" href="#/p/${p.id}">${esc(p.title)}</a>
        <div class="stock tiny">In Stock</div>
        ${p.crime ? `<span class="crime-badge">crime</span>` : ""}
        ${l.variant ? `<div class="tiny"><b>${esc(p.v.name)}:</b> ${esc(l.variant)}</div>` : ""}
        ${p.coupon && S.clipped[p.id] && !isSaved ? `<div class="tiny ok">Coupon applied: -$${p.coupon} each</div>` : ""}
        <div class="actions">
          ${isSaved ? `<button class="btn sm" data-move="${esc(k)}">Move to cart</button>` : `<span class="qty"><button data-dec="${esc(k)}" aria-label="Decrease quantity">${l.qty === 1 ? "🗑" : "−"}</button><span>${l.qty}</span><button data-inc="${esc(k)}" aria-label="Increase quantity">+</button></span>`}
          <span class="sep">|</span><button class="linkbtn" data-del="${esc(k)}" data-saved="${isSaved ? 1 : ""}">Delete</button>
          ${isSaved ? "" : `<span class="sep">|</span><button class="linkbtn" data-later="${esc(k)}">Save for later</button>`}
          <span class="sep">|</span><button class="linkbtn" data-share="${p.id}">Share</button>
        </div>
      </div>
      <div class="line-price">${priceHTML(unitPrice(p, l.variant) * (isSaved ? 1 : l.qty), "sm")}</div>
    </div>`; };

    app.innerHTML = `
      <div class="cart-wrap">
        <div>
          <div class="cart-list">
            ${lines.length ? `<h1>Shopping Cart</h1><div class="cart-sub-head"><button class="linkbtn" id="clearCart">Deselect all items (just kidding, delete them)</button><span class="muted">Price</span></div>
              ${lines.map((l) => lineHTML(l, false)).join("")}
              <div class="subtotal">Subtotal (${count} item${count === 1 ? "" : "s"}): <b>${money(sub)}</b></div>`
              : `<div class="empty-cart"><img src="img/stanly-quencher.jpg" alt=""><div><h1>Your Scamazon Cart is empty</h1><p>Your wallet thanks you. Your wallet is wrong.</p><a class="btn" href="#/deals">Shop today's deals</a> ${S.user ? "" : `<a class="btn ghost" href="#/signin">Sign in to your account</a>`}</div></div>`}
          </div>
          ${saved.length ? `<div class="cart-list"><h2>Saved for later (${saved.length} item${saved.length === 1 ? "" : "s"})</h2>${saved.map((l) => lineHTML(l, true)).join("")}</div>` : ""}
        </div>
        ${lines.length ? `<div class="summary">
          ${sub >= 35 || S.crime ? `<div class="free ok">✔ Your order qualifies for FREE Shipping.${S.crime ? " Thanks, criminal." : ""}</div>` : `<div class="free"><div class="ship-bar"><div style="width:${Math.min(100, (sub / 35) * 100)}%"></div></div>Add <b>${money(35 - sub)}</b> of eligible items to your order for FREE Shipping.</div>`}
          <div class="big-sub">Subtotal (${count} item${count === 1 ? "" : "s"}): <b>${money(sub)}</b></div>
          ${coupons ? `<div class="ok tiny">Clipped coupons: -${money(coupons)} at checkout</div>` : ""}
          <label class="tiny"><input type="checkbox"> This order contains a gift (of guilt)</label>
          <a class="btn block" href="#/checkout">Proceed to checkout</a>
          ${!S.crime ? `<div class="tiny crime-upsell"><span class="crime-badge">crime</span> members get FREE One-Day delivery. <a href="#/crime" class="lnk">Try Crime free</a></div>` : ""}
        </div>` : ""}
      </div>
      ${scroller("Customers who bought items in your cart also bought", P.filter((p) => !lines.some((l) => l.id === p.id)).sort((a, b) => b.reviews - a.reviews).slice(0, 12))}`;
    const cc = $("#clearCart");
    if (cc) cc.onclick = () => { S.cart = []; save("cart"); cartView(); };
  }

  // ---------- checkout ----------
  const PROMOS = {
    CRIME10: { pct: 10, msg: "10% off — crime pays!" },
    SCAM50: { flat: 0.5, msg: "50 cents off. We said SCAM50, not 50%." },
    FREESTUFF: { none: true, msg: "Nice try." },
    PEAR: { pct: 5, msg: "5% off Pear-adjacent vibes" },
  };
  function checkout() {
    const lines = cartLines();
    if (!lines.length) { location.hash = "#/cart"; return; }
    if (!S.user) { toast("Please sign in to check out"); location.hash = "#/signin?next=" + encodeURIComponent("#/checkout"); return; }
    let promo = null, ship = S.crime ? "crime" : "standard";
    const a = S.address || {};

    app.innerHTML = `
      <div class="checkout-head"><a href="#/" class="logo dark"><span class="logo-text">scamazon</span><span class="logo-tld">.con</span></a><h1>Checkout (<a class="lnk" href="#/cart">${cartCount()} items</a>)</h1><span class="lock">🔒</span></div>
      <div class="checkout">
        <form id="coForm" novalidate>
          <div class="step"><h3><span>1</span> Shipping address</h3>
            <div class="grid2">
              <div><label for="nm">Full name</label><input id="nm" required value="${esc(a.name || S.user.name)}" autocomplete="name"></div>
              <div><label for="ad">Street address</label><input id="ad" required value="${esc(a.line1 || "")}" placeholder="123 Totally Real St" autocomplete="address-line1"></div>
              <div><label for="ct">City</label><input id="ct" required value="${esc(a.city || "")}" autocomplete="address-level2"></div>
              <div class="grid2 inner"><div><label for="st">State</label><input id="st" required maxlength="2" value="${esc(a.state || "")}" placeholder="XX" autocomplete="address-level1"></div><div><label for="zp">ZIP</label><input id="zp" required pattern="\\d{5}" maxlength="5" inputmode="numeric" value="${esc(a.zip || "")}" autocomplete="postal-code"></div></div>
            </div>
            <label class="tiny check"><input type="checkbox" id="saveAddr" checked> Save as my default address</label>
          </div>
          <div class="step"><h3><span>2</span> Payment method</h3>
            <p class="tiny muted">This is a parody store — no payment info is collected and nothing is charged. Pick your favorite pretend currency.</p>
            ${[["Monopoly Money", "🎲"], ["An IOU written on a napkin", "📝"], ["ScamCoin (down 98% today)", "🪙"], ["Exposure", "📸"], ["Scamazon Gift Card balance: $0.00", "🎁"]].map(([n, e], i) => `<label class="radio"><input type="radio" name="pay" value="${esc(n)}" ${i ? "" : "checked"} ${i === 4 ? "disabled" : ""}> ${e} ${esc(n)}</label>`).join("")}
            <div class="promo"><label for="promoIn">Gift card or promo code</label><div class="inline-form"><input id="promoIn" placeholder="Try CRIME10"><button type="button" class="btn ghost" id="promoBtn">Apply</button></div><div class="tiny" id="promoMsg"></div></div>
          </div>
          <div class="step"><h3><span>3</span> Review items and delivery</h3>
            <div class="ship-opts">
              ${S.crime ? `<label class="radio"><input type="radio" name="ship" value="crime" checked> <span><b class="ok">${dateStr(daysFrom(1))}</b><br><span class="tiny"><span class="crime-badge">crime</span> FREE One-Day Delivery</span></span></label>` : ""}
              <label class="radio"><input type="radio" name="ship" value="standard" ${S.crime ? "" : "checked"}> <span><b class="ok">${dateStr(daysFrom(6))}</b><br><span class="tiny">Standard — FREE over $35, otherwise $5.99</span></span></label>
              <label class="radio"><input type="radio" name="ship" value="express"> <span><b class="ok">${dateStr(daysFrom(2))}</b><br><span class="tiny">Expedited — $12.99 (we drive a little faster)</span></span></label>
              <label class="radio"><input type="radio" name="ship" value="slow"> <span><b class="ok">${dateStr(daysFrom(14))}</b><br><span class="tiny">🐌 No-Rush — FREE + a $1 credit you'll never use</span></span></label>
            </div>
            ${lines.map((l) => { const p = byId[l.id]; return `<div class="order-line">${imgTag(p, "xs")}<div><b>${esc(p.title.split(" — ")[0])}</b>${l.variant ? `<div class="tiny">${esc(p.v.name)}: ${esc(l.variant)}</div>` : ""}<div class="tiny">Qty: ${l.qty} · <b class="red">${money(unitPrice(p, l.variant) * l.qty)}</b></div></div></div>`; }).join("")}
          </div>
        </form>
        <div class="summary sticky" id="orderSummary"></div>
      </div>`;

    function totals() {
      const sub = cartSubtotal(), coupons = couponSavings();
      const shipCost = ship === "crime" || ship === "slow" ? 0 : ship === "express" ? 12.99 : sub >= 35 ? 0 : 5.99;
      let promoOff = 0;
      if (promo) promoOff = promo.pct ? +((sub - coupons) * promo.pct / 100).toFixed(2) : promo.flat || 0;
      const fee = 1.99;
      const taxable = Math.max(0, sub - coupons - promoOff);
      const tax = +(taxable * 0.0825).toFixed(2);
      return { sub, coupons, shipCost, promoOff, fee, tax, total: +(taxable + shipCost + fee + tax).toFixed(2) };
    }
    function renderSummary() {
      const t = totals();
      $("#orderSummary").innerHTML = `
        <button class="btn block" form="coForm" type="submit">Place your order</button>
        <p class="tiny muted center">By placing your order, you agree to Scamazon's conditions of use, privacy notice, and to never ask questions.</p>
        <h3>Order Summary</h3>
        <div class="sum-grid">
          <span>Items (${cartCount()}):</span><span>${money(t.sub)}</span>
          <span>Shipping &amp; handling:</span><span>${money(t.shipCost)}</span>
          ${t.coupons ? `<span>Coupons:</span><span class="ok">-${money(t.coupons)}</span>` : ""}
          ${t.promoOff ? `<span>Promo:</span><span class="ok">-${money(t.promoOff)}</span>` : ""}
          <span>Convenience fee (for your convenience):</span><span>${money(t.fee)}</span>
          <span>Estimated tax:</span><span>${money(t.tax)}</span>
        </div>
        <div class="order-total"><span>Order total:</span><span>${money(t.total)}</span></div>`;
    }
    renderSummary();
    $$("input[name=ship]", app).forEach((r) => (r.onchange = () => { ship = r.value; renderSummary(); }));
    $("#promoBtn").onclick = () => {
      const code = $("#promoIn").value.trim().toUpperCase(), msg = $("#promoMsg");
      const pr = PROMOS[code];
      if (!code) return;
      if (!pr) { promo = null; msg.innerHTML = `<span class="red">The promotional code you entered is not valid. Neither are most of our products.</span>`; }
      else if (pr.none) { promo = null; msg.innerHTML = `<span class="red">${pr.msg}</span>`; }
      else { promo = { ...pr, code }; msg.innerHTML = `<span class="ok">✔ ${code} applied: ${pr.msg}</span>`; }
      renderSummary();
    };
    $("#coForm").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      const bad = $$("input[required]", f).filter((i) => !i.checkValidity());
      $$("input", f).forEach((i) => i.classList.remove("invalid"));
      if (bad.length) { bad.forEach((i) => i.classList.add("invalid")); bad[0].focus(); toast("<span class='red'>Please fill in your shipping address.</span>"); return; }
      const addr = { name: $("#nm").value.trim(), line1: $("#ad").value.trim(), city: $("#ct").value.trim(), state: $("#st").value.trim().toUpperCase(), zip: $("#zp").value.trim() };
      if ($("#saveAddr").checked) { S.address = addr; save("address"); }
      const t = totals();
      const days = ship === "crime" ? 1 : ship === "express" ? 2 : ship === "slow" ? 14 : 6;
      const order = {
        id: "113-" + Math.floor(1e6 + Math.random() * 9e6) + "-" + Math.floor(1e6 + Math.random() * 9e6),
        date: Date.now(), eta: daysFrom(days).getTime(), ship, pay: new FormData(f).get("pay"), addr, total: t.total, promo: promo?.code || null,
        items: lines.map((l) => ({ id: l.id, variant: l.variant, qty: l.qty, price: unitPrice(byId[l.id], l.variant), returned: false })),
        cancelled: false,
      };
      S.orders.unshift(order);
      lines.forEach((l) => delete S.clipped[l.id]);
      S.cart = [];
      save("orders", "cart", "clipped");
      app.innerHTML = `<div class="page center thanks"><div class="check">✔</div><h1 class="ok">Order placed, thanks!</h1><p>Confirmation will be sent to <b>${esc(S.user.email)}</b> (in spirit).</p>
        <p><b>Arriving ${dateStr(order.eta)}</b> to ${esc(addr.name)}, ${esc(addr.city)}, ${esc(addr.state)} — give or take a fiscal quarter.</p>
        <p class="tiny muted">Order #${order.id} · Paid with ${esc(order.pay)} · ${money(order.total)}</p>
        <div class="thanks-imgs">${order.items.map((it) => imgTag(byId[it.id], "xs")).join("")}</div>
        <a class="btn" href="#/track/${order.id}">Track package</a> <a class="btn ghost" href="#/orders">Review your orders</a> <a class="btn ghost" href="#/">Continue shopping</a></div>`;
      window.scrollTo(0, 0);
    };
  }

  // ---------- orders / tracking ----------
  // Orders "progress" in real time so tracking feels alive: each stage takes a couple of minutes.
  const STAGES = ["Ordered", "Shipped", "Out for delivery", "Delivered"];
  function stageOf(o) {
    if (o.cancelled) return -1;
    const mins = (Date.now() - o.date) / 60000;
    return mins < 2 ? 0 : mins < 5 ? 1 : mins < 9 ? 2 : 3;
  }
  const stageText = (o) => { const s = stageOf(o); return s < 0 ? "Cancelled" : s === 3 ? `Delivered ${dateStr(o.date + 9 * 60000, { month: "short", day: "numeric" })} — left somewhere, probably` : s === 2 ? "Out for delivery (allegedly)" : s === 1 ? `Shipped — arriving ${dateStr(o.eta)}` : `Arriving ${dateStr(o.eta)}`; };

  function ordersView(params) {
    if (!S.user) { location.hash = "#/signin?next=" + encodeURIComponent("#/orders"); return; }
    const filter = params.get("f") || "all";
    const list = S.orders.filter((o) => filter === "all" || (filter === "open" && stageOf(o) >= 0 && stageOf(o) < 3) || (filter === "cancelled" && o.cancelled));
    app.innerHTML = `<div class="page"><h1>Your Orders</h1>
      <div class="tabs">${[["all", "Orders"], ["open", "Not Yet Delivered"], ["cancelled", "Cancelled Orders"]].map(([k, n]) => `<a href="#/orders?f=${k}" class="${filter === k ? "on" : ""}">${n}</a>`).join("")}</div>
      ${!list.length ? `<p>${filter === "all" ? "You haven't placed any orders yet. Suspicious." : "Nothing here."} <a class="lnk" href="#/">Start shopping</a></p>` :
      list.map((o) => { const st = stageOf(o); return `<div class="order">
        <div class="order-head"><div>ORDER PLACED<b>${dateStr(o.date, { month: "long", day: "numeric", year: "numeric" })}</b></div><div>TOTAL<b>${money(o.total)}</b></div><div>SHIP TO<b>${esc(o.addr?.name || "")}</b></div><div>PAID WITH<b>${esc(o.pay)}</b></div><div class="right">ORDER # ${esc(o.id)}<a class="lnk" href="#/track/${o.id}">View order details</a></div></div>
        <div class="order-body">
          <div class="order-main">
            <div class="status ${st < 0 ? "red" : ""}">${stageText(o)}</div>
            ${o.items.map((it, i) => { const p = byId[it.id]; if (!p) return ""; return `<div class="order-line">${imgTag(p, "sm")}<div><a class="lnk" href="#/p/${p.id}">${esc(p.title)}</a>${it.variant ? `<div class="tiny">${esc(p.v.name)}: ${esc(it.variant)}</div>` : ""}<div class="tiny">Qty: ${it.qty} · ${money(it.price)}</div>
              ${it.returned ? `<div class="tiny red">Return started — refund will be issued in Monopoly Money</div>` : ""}
              <div class="btn-row"><button class="btn sm" data-add="${p.id}" data-variant="${esc(it.variant || "")}">🔁 Buy it again</button> <a class="btn ghost sm" href="#/p/${p.id}">View your item</a></div></div></div>`; }).join("")}
          </div>
          <div class="order-actions">
            ${st >= 0 ? `<a class="btn block" href="#/track/${o.id}">Track package</a>` : ""}
            ${st >= 0 && st < 1 ? `<button class="btn ghost block" data-cancel="${o.id}">Cancel order</button>` : ""}
            ${st === 3 && o.items.some((it) => !it.returned) ? `<button class="btn ghost block" data-return="${o.id}">Return or replace items</button>` : ""}
            ${st === 3 ? `<a class="btn ghost block" href="#/p/${o.items[0].id}#reviews" data-review="${o.items[0].id}">Write a product review</a>` : ""}
          </div>
        </div></div>`; }).join("")}
      </div>`;
  }

  function trackView(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return notFound();
    const st = stageOf(o);
    const log = [
      [o.date, "Order placed", "Your order was received and immediately forgotten about."],
      [o.date + 2 * 60000, "Shipped", "Package left the Scamazon warehouse (a garage in Ohio)."],
      [o.date + 3.5 * 60000, "In transit", "Package is on a truck. The truck is vibing."],
      [o.date + 5 * 60000, "Out for delivery", "Driver is 3 stops away. Or 300. Hard to say."],
      [o.date + 9 * 60000, "Delivered", `Left at front door of ${esc(o.addr?.line1 || "your house")}. Or the neighbor's. Photo is blurry.`],
    ].filter(([t]) => t <= Date.now() && !o.cancelled);
    app.innerHTML = `<div class="page track">
      <a class="lnk tiny" href="#/orders">‹ Your Orders</a>
      <h1>${st < 0 ? "Order cancelled" : st === 3 ? "Delivered" : `Arriving ${dateStr(o.eta)}`}</h1>
      <p class="muted">Order #${esc(o.id)} · ${o.items.reduce((a, i) => a + i.qty, 0)} item(s) · ${money(o.total)}</p>
      ${st >= 0 ? `<div class="progress"><div class="progress-fill" style="width:${(st / 3) * 100}%"></div>${STAGES.map((s, i) => `<div class="pstep ${i <= st ? "done" : ""}" style="left:${(i / 3) * 100}%"><span></span><b>${s}</b></div>`).join("")}</div>` : ""}
      <div class="track-grid">
        <div><h3>Shipping updates</h3>${log.length ? log.reverse().map(([t, h, d]) => `<div class="log"><b>${h}</b><div class="tiny muted">${new Date(t).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}</div><p>${d}</p></div>`).join("") : "<p>No updates. The package is shy.</p>"}
          ${st >= 0 && st < 3 ? `<p class="tiny muted">Tip: this page updates as your package moves (it only takes a few minutes in Scamazon time).</p>` : ""}</div>
        <div><h3>Shipping to</h3><p>${esc(o.addr?.name)}<br>${esc(o.addr?.line1)}<br>${esc(o.addr?.city)}, ${esc(o.addr?.state)} ${esc(o.addr?.zip)}</p>
          <h3>Items</h3>${o.items.map((it) => byId[it.id] ? `<div class="order-line">${imgTag(byId[it.id], "xs")}<a class="lnk tiny" href="#/p/${it.id}">${esc(byId[it.id].title.split(" — ")[0])}</a></div>` : "").join("")}
          ${st >= 0 && st < 1 ? `<button class="btn ghost" data-cancel="${o.id}">Cancel order</button>` : ""}</div>
      </div></div>`;
    if (st >= 0 && st < 3) { const t = setTimeout(() => { if (location.hash === "#/track/" + id) route(); }, 30000); window.addEventListener("hashchange", () => clearTimeout(t), { once: true }); }
  }

  // ---------- lists ----------
  function listsView() {
    const items = S.wish.map((id) => byId[id]).filter(Boolean);
    app.innerHTML = `<div class="page"><h1>Your Wish List</h1><p class="muted">${items.length} item${items.length === 1 ? "" : "s"} · Private · Things you'll buy "eventually"</p>
      ${items.length ? items.map((p) => `<div class="wish-item">
        <a href="#/p/${p.id}">${imgTag(p, "sm")}</a>
        <div><a class="t" href="#/p/${p.id}">${esc(p.title)}</a>${ratingLine(p)}<div>${priceHTML(p.price, "sm")} ${p.list > p.price ? `<span class="deal-text">Price dropped ${off(p.price, p.list)}%</span>` : ""}</div></div>
        <div class="wish-actions"><button class="btn sm" data-add="${p.id}">Add to Cart</button><button class="linkbtn" data-wish="${p.id}">Delete</button></div>
      </div>`).join("") : `<div class="empty-cart"><div class="big-heart">♡</div><div><h2>Your list is empty</h2><p>Click "Add to List" or the ♥ on any product to save it here.</p><a class="btn" href="#/s">Browse products</a></div></div>`}
      ${items.length ? `<button class="btn ghost" id="addAllWish">Add all to Cart</button>` : ""}</div>`;
    const b = $("#addAllWish");
    if (b) b.onclick = () => { items.forEach((p) => addToCart(p.id, defaultVariant(p), 1, true)); toast(`<b class="ok">✔ ${items.length} items added to Cart</b> <a class="btn sm" href="#/cart">Go to Cart</a>`); };
  }

  // ---------- account ----------
  function signinView(params) {
    const isNew = params.get("new") === "1";
    const next = params.get("next") || "#/";
    if (S.user) { location.hash = next; return; }
    app.innerHTML = `<div class="auth">
      <a href="#/" class="logo dark"><span class="logo-text">scamazon</span><span class="logo-tld">.con</span></a>
      <form class="auth-card" id="authForm">
        <h1>${isNew ? "Create account" : "Sign in"}</h1>
        ${isNew ? `<label for="an">Your name</label><input id="an" required autocomplete="name" placeholder="First and last name">` : ""}
        <label for="ae">Email</label><input id="ae" type="email" required autocomplete="email">
        <label for="ap">Password</label><input id="ap" type="password" required minlength="${isNew ? 6 : 1}" autocomplete="${isNew ? "new-password" : "current-password"}" placeholder="${isNew ? "At least 6 characters" : ""}">
        <p class="tiny muted">Demo only: nothing leaves your browser and the password isn't stored. Any email & password works.</p>
        <p class="tiny red" id="authErr"></p>
        <button class="btn block">${isNew ? "Create your Scamazon account" : "Continue"}</button>
        <p class="tiny">By continuing, you agree to Scamazon's Conditions of Use and Privacy-ish Notice.</p>
      </form>
      ${isNew ? `<p class="tiny">Already have an account? <a class="lnk" href="#/signin?next=${encodeURIComponent(next)}">Sign in ›</a></p>` : `<div class="or">New to Scamazon?</div><a class="btn ghost auth-new" href="#/signin?new=1&next=${encodeURIComponent(next)}">Create your Scamazon account</a>`}
    </div>`;
    $("#authForm").onsubmit = (e) => {
      e.preventDefault();
      const email = $("#ae").value.trim();
      const name = isNew ? $("#an").value.trim() : (store.get("known_" + email.toLowerCase(), null) || email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      if (isNew && name.length < 2) { $("#authErr").textContent = "Enter your name"; return; }
      S.user = { name, email };
      store.set("known_" + email.toLowerCase(), name);
      if (S.address && !S.address.name) S.address.name = name;
      save("user", "address");
      toast(`👋 Welcome${isNew ? "" : " back"}, ${esc(name.split(" ")[0])}!`);
      location.hash = next;
    };
  }

  function account() {
    if (!S.user) { location.hash = "#/signin?next=" + encodeURIComponent("#/account"); return; }
    const a = S.address;
    app.innerHTML = `<div class="page"><h1>Your Account</h1><p class="muted">Signed in as <b>${esc(S.user.name)}</b> (${esc(S.user.email)})</p>
      <div class="acct-grid">
        <a class="acct" href="#/orders"><img src="img/bryo-railway.jpg" alt=""><div><h3>Your Orders</h3><p>Track, cancel, return, or buy things again. ${S.orders.length} order(s).</p></div></a>
        <a class="acct" href="#/crime"><img src="img/rollex.jpg" alt=""><div><h3>Crime</h3><p>${S.crime ? "Member since recently. View benefits." : "Not a member. Turn to a life of Crime."}</p></div></a>
        <a class="acct" href="#/lists"><img src="img/stanly-quencher.jpg" alt=""><div><h3>Your Lists</h3><p>${S.wish.length} item(s) on your Wish List.</p></div></a>
        <button class="acct" id="addrBtn"><img src="img/ding-lock.jpg" alt=""><div><h3>Your Addresses</h3><p>${a && a.line1 ? `${esc(a.line1)}, ${esc(a.city)} ${esc(a.zip)}` : "Add a shipping address"}</p></div></button>
        <div class="acct"><img src="img/the-ordinaire.jpg" alt=""><div><h3>Login &amp; security</h3><p>Your password is "password". We checked. (Not really — we don't store it.)</p></div></div>
        <a class="acct" href="#/cart"><img src="img/echo-echo.jpg" alt=""><div><h3>Your Cart</h3><p>${cartCount()} item(s) waiting patiently.</p></div></a>
      </div>
      <div class="btn-row"><button class="btn ghost" data-signout>Sign out</button> <button class="btn ghost" id="resetBtn">Delete all my data</button></div></div>`;
    $("#addrBtn").onclick = () => addressModal();
    $("#resetBtn").onclick = () => {
      if (!confirm("Delete your cart, orders, lists, reviews and account from this browser?")) return;
      Object.keys(localStorage).filter((k) => k.startsWith("scam2_")).forEach((k) => localStorage.removeItem(k));
      Object.assign(S, { cart: [], saved: [], wish: [], user: null, crime: false, orders: [], address: null, history: [], reviews: {}, clipped: {} });
      refreshHeader(); toast("🧹 Fresh start. Evidence destroyed."); location.hash = "#/";
    };
  }
  function addressModal() {
    const a = S.address || {};
    modal("Your default address", `<form id="addrForm" class="stack">
      <label for="m_nm">Full name</label><input id="m_nm" required value="${esc(a.name || S.user?.name || "")}">
      <label for="m_ad">Street address</label><input id="m_ad" required value="${esc(a.line1 || "")}">
      <label for="m_ct">City</label><input id="m_ct" required value="${esc(a.city || "")}">
      <div class="grid2"><div><label for="m_st">State</label><input id="m_st" required maxlength="2" value="${esc(a.state || "")}"></div><div><label for="m_zp">ZIP</label><input id="m_zp" required pattern="\\d{5}" maxlength="5" value="${esc(a.zip || "")}"></div></div>
      <button class="btn">Save address</button></form>`, (el) => {
      $("#addrForm", el).onsubmit = (e) => {
        e.preventDefault();
        S.address = { name: $("#m_nm", el).value.trim(), line1: $("#m_ad", el).value.trim(), city: $("#m_ct", el).value.trim(), state: $("#m_st", el).value.trim().toUpperCase(), zip: $("#m_zp", el).value.trim() };
        save("address"); closeModal(); toast("✔ Address saved"); route();
      };
    });
  }

  // ---------- Crime ----------
  function crimeView() {
    const shows = [["The Heist Next Door", "#3a1c71,#d76d77"], ["Law & Disorder", "#0f2027,#2c5364"], ["Getaway Bakers", "#f7971e,#ffd200"], ["Breaking Bread", "#134e5e,#71b280"], ["The Usual Suspects-ish", "#232526,#414345"], ["Real Housewives of Alcatraz", "#c94b4b,#4b134f"]];
    app.innerHTML = `
      <section class="crime-hero">
        <div class="crime-logo"><span class="s">scamazon</span><span class="c">crime</span></div>
        <p>${S.crime ? `You're a Crime member${S.user ? ", " + esc(S.user.name.split(" ")[0]) : ""}. You've been doing Crime for a while now. We're proud of you.` : "Free One-Day delivery. Crime Video. Crime Music. Deals so good they should be illegal. Because Crime pays."}</p>
        ${S.crime ? `<button class="btn ghost" id="cancelCrime">Cancel membership</button>` : `<button class="btn crime xl" id="joinCrime">Start your 30-day free trial</button>`}
        <div class="fine">After your free trial, Crime is $14.99/month. Cancel anytime*. *Anytime means "eventually, after several 'Are you sure?' screens."</div>
      </section>
      <section class="crime-perks">
        ${[["🚚", "FREE Crime Delivery", "Getaway-car speed: One-Day delivery on millions of items. Packages arrive before you remember ordering them."], ["🎬", "Crime Video", "Thousands of heist movies, true-crime docuseries, and that one show everyone says you have to watch."], ["🎵", "Crime Music", "100 million songs, ad-free. Mostly 'Smooth Operator' on loop."], ["💰", "Crime Day Deals", "Two days a year when everything is 'on sale' from a price we raised the week before."], ["📚", "Crime Reading", "Rotating catalog of e-books, mostly mysteries. Whodunit? You did. You bought it."], ["📸", "Crime Photos", "Unlimited photo storage. Perfect for evidence. Of your vacation. Evidence of your vacation."]].map(([e, h, t]) => `<div class="perk"><div class="e">${e}</div><h3>${h}</h3><p>${t}</p></div>`).join("")}
      </section>
      <section class="row dark"><h3>Now streaming on Crime Video</h3><div class="scroller">${shows.map(([n, g]) => `<button class="poster" style="background:linear-gradient(135deg,${g})" data-show="${esc(n)}"><span>${esc(n)}</span><i>▶</i></button>`).join("")}</div></section>
      <section class="plans">
        ${[["Monthly", "$14.99", "/mo", "Petty Crime. Commit month to month."], ["Annual", "$139", "/yr", "Organized Crime. Save $40 a year.", true], ["Student", "$7.49", "/mo", "Juvenile Crime. Requires a .edu email."]].map(([n, pr, per, d, pop]) => `<div class="plan ${pop ? "pop" : ""}"><h3>${n} ${pop ? '<span class="deal-badge">Best value</span>' : ""}</h3><div class="p">${pr}<span>${per}</span></div><p>${d}</p>${S.crime ? "" : `<button class="btn ${pop ? "crime" : "ghost"} block" data-join>Choose ${n}</button>`}</div>`).join("")}
      </section>`;
    const join = () => {
      if (!S.user) { toast("Sign in to start your Crime trial"); location.hash = "#/signin?next=" + encodeURIComponent("#/crime"); return; }
      S.crime = true; save("crime"); toast("🦹 Welcome to Crime! Your (pretend) free trial has started."); crimeView(); window.scrollTo(0, 0);
    };
    const j = $("#joinCrime"); if (j) j.onclick = join;
    $$("[data-join]", app).forEach((b) => (b.onclick = join));
    $$("[data-show]", app).forEach((b) => (b.onclick = () => S.crime ? modal(b.dataset.show, `<div class="player"><div class="spinner"></div><p>Buffering… Buffering… This episode is unavailable in your region (Earth).</p></div>`) : (toast("Join Crime to watch"), window.scrollTo({ top: 0, behavior: "smooth" }))));
    const c = $("#cancelCrime");
    if (c) {
      const msgs = ["Are you sure?", "Are you SURE sure?", "But think of the free shipping…", "We'll give you a coupon! (we won't)", "Last chance! (not really)"];
      let clicks = 0;
      c.onclick = () => {
        if (clicks < msgs.length) { c.textContent = msgs[clicks++] + " — click again to cancel"; return; }
        S.crime = false; save("crime"); toast("😢 Crime membership cancelled. You've gone straight."); crimeView();
      };
    }
  }

  function about() {
    app.innerHTML = `<div class="page narrow"><h1>About Scamazon</h1>
      <p>Scamazon.con is a parody online store. Every brand here is lovingly off-brand — Pear, Samsong, Nikey, Abibas, Ray-Bam, Sonny and friends are fictional.</p>
      <p>Nothing here is for sale. No payment information is collected, no orders are real, and Crime membership is entirely pretend. Your account, cart, orders and reviews live only in your own browser — delete them anytime from Your Account.</p>
      <p>Product photos come from <a class="lnk" href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a> photographers (Unsplash License), with knockoff stickers slapped on by our authenticity team (Gary).</p>
      <p>Promo codes that "work" at checkout: <code>CRIME10</code>, <code>PEAR</code>, <code>SCAM50</code>. Try <code>FREESTUFF</code> too.</p>
      <p>Our mission: to be Earth's most customer-confused company.</p>
      <a class="btn" href="#/">Back to shopping</a></div>`;
  }

  function notFound() {
    app.innerHTML = `<div class="page center"><img class="nf" src="img/participation-trophy.jpg" alt=""><h1>Sorry, we couldn't find that page</h1><p>But you tried, and that's what counts. Here's a participation trophy.</p><a class="btn" href="#/">Go to Scamazon home</a></div>`;
  }

  // ================= GLOBAL ACTIONS =================
  const findLine = (arr, key) => arr.find((l) => lineKey(l) === key);
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-del],[data-later],[data-move],[data-share],[data-wish],[data-cancel],[data-return],[data-signout],[data-loc],[data-review]");
    if (!t) return;
    const d = t.dataset;
    if (d.add) { const p = byId[d.add]; return addToCart(d.add, d.variant !== undefined && d.variant !== "" ? d.variant : defaultVariant(p)); }
    if (d.wish) { e.preventDefault(); toggleWish(d.wish); if (location.hash.startsWith("#/lists")) listsView(); else t.classList.toggle("on", S.wish.includes(d.wish)); return; }
    if (d.share) return copyLink("#/p/" + d.share);
    if (d.loc) return $("#deliverBtn").click();
    if (d.signout !== undefined) { e.preventDefault(); S.user = null; S.crime = false; save("user", "crime"); toast("Signed out. Come back soon (you will)."); location.hash = "#/"; route(); return; }
    if (d.review) { e.preventDefault(); location.hash = "#/p/" + d.review; setTimeout(() => reviewModal(byId[d.review]), 50); return; }
    if (d.cancel) {
      const o = S.orders.find((x) => x.id === d.cancel);
      if (o && confirm("Cancel this order? Your Monopoly Money will be refunded.")) { o.cancelled = true; save("orders"); toast("Order cancelled. The garage in Ohio is devastated."); route(); }
      return;
    }
    if (d.return) {
      const o = S.orders.find((x) => x.id === d.return);
      modal("Return items", `<form id="retForm" class="stack"><p class="tiny muted">Select items to return. Refunds issued in the original pretend currency.</p>
        ${o.items.map((it, i) => it.returned ? "" : `<label class="radio"><input type="checkbox" name="r" value="${i}" checked> ${esc(byId[it.id]?.title.split(" — ")[0] || it.id)}</label>`).join("")}
        <label for="why">Reason</label><select id="why"><option>Sticker fell off</option><option>Not as described (it was described accurately)</option><option>Bought by mistake (Alexya did it)</option><option>Found it cheaper on Scamazon</option></select>
        <button class="btn">Submit return</button></form>`, (el) => {
        $("#retForm", el).onsubmit = (ev) => { ev.preventDefault(); $$("input[name=r]:checked", el).forEach((cb) => (o.items[+cb.value].returned = true)); save("orders"); closeModal(); toast("📦 Return started. Drop it off at any Scamazon Locker (there are none)."); route(); };
      });
      return;
    }
    // cart line ops
    const k = d.inc || d.dec || d.del || d.later || d.move;
    if (!k) return;
    if (d.inc) { const l = findLine(S.cart, k); if (l) l.qty = Math.min(30, l.qty + 1); }
    if (d.dec) { const l = findLine(S.cart, k); if (l && --l.qty <= 0) S.cart = S.cart.filter((x) => x !== l); }
    if (d.del) { if (d.saved) S.saved = S.saved.filter((x) => lineKey(x) !== k); else S.cart = S.cart.filter((x) => lineKey(x) !== k); }
    if (d.later) { const l = findLine(S.cart, k); if (l) { S.cart = S.cart.filter((x) => x !== l); if (!findLine(S.saved, k)) S.saved.unshift({ ...l, qty: 1 }); toast("💾 Saved for later. Later never comes."); } }
    if (d.move) { const l = findLine(S.saved, k); if (l) { S.saved = S.saved.filter((x) => x !== l); addToCart(l.id, l.variant, 1, true); } }
    save("cart", "saved"); cartView();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeDrawer(); } });

  // ================= ROUTER =================
  function route() {
    closeModal();
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const params = new URLSearchParams(qs || "");
    const parts = path.split("/").filter(Boolean);
    input.value = parts[0] === "s" ? params.get("q") || "" : "";
    sel.value = parts[0] === "s" ? params.get("cat") || "" : "";
    document.body.classList.toggle("bare", parts[0] === "signin" || parts[0] === "checkout");
    switch (parts[0]) {
      case undefined: home(); break;
      case "s": search(params); break;
      case "deals": search(params, "deals"); break;
      case "p": product(parts[1], params); break;
      case "cart": cartView(); break;
      case "checkout": checkout(); break;
      case "orders": ordersView(params); break;
      case "track": trackView(parts[1]); break;
      case "lists": listsView(); break;
      case "signin": signinView(params); break;
      case "account": account(); break;
      case "crime": crimeView(); break;
      case "about": about(); break;
      default: notFound();
    }
    const titles = { s: "Search", deals: "Today's Deals", cart: "Shopping Cart", checkout: "Checkout", orders: "Your Orders", track: "Track Package", lists: "Your Wish List", signin: "Sign-In", account: "Your Account", crime: "Crime", about: "About" };
    document.title = parts[0] === "p" && byId[parts[1]] ? `Scamazon.con: ${byId[parts[1]].title}` : parts[0] ? `Scamazon.con: ${titles[parts[0]] || "Page Not Found"}` : "Scamazon.con — Spend less*. Regret more.";
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  refreshHeader();
  route();
})();
