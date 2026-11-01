# Scamazon

A parody "everything store" — Earth's most customer-confused company. All products are off-brand
(Pear pPhone, Samsong Galaxy, Nikey, Abibas, Sonny PlayStaytion…) and the membership program is **Crime**.

Static site: plain HTML/CSS/JS, no build step. Open `index.html` or serve the folder.

- `index.html` – shell (header, nav, footer)
- `styles.css` – styles
- `products.js` – the off-brand catalog
- `app.js` – hash router, cart, checkout, orders, Crime membership (state in localStorage)

Deployed on Netlify (`netlify.toml` publishes the repo root). Nothing is real: no payments, no data collected.
