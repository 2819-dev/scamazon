# Scamazon

A parody "everything store": Earth's most customer-confused company. Every brand is off-brand
(Pear pPhone, Samsong Galaxy, Nikey, Abibas, Ray-Bam, Sonny PlayStaytion…), and the membership program is **Crime**.

Live: https://scamazon-6glw.netlify.app

## Features
- Stock product photos with knockoff brand stickers baked in (`img/`)
- Search with live suggestions, departments, brand / price / rating / Crime / deal filters, sorting, pagination
- Product pages: image views + hover zoom, variants (size, color, storage) with live pricing, clippable coupons,
  frequently-bought-together, related items, reviews (write your own)
- Cart with quantities, save for later, free-shipping progress; wish list
- Sign in / create account, saved address, "Deliver to" ZIP
- Checkout with address validation, delivery speeds, promo codes (`CRIME10`, `PEAR`, `SCAM50`, `FREESTUFF`), pretend payment
- Orders with live (accelerated) tracking, cancel, return, buy again
- Crime membership: join / (try to) cancel, free one-day delivery, Crime Video

Plain HTML/CSS/JS, no build step. All state lives in the visitor's browser (localStorage). Nothing is real:
no payments, no data collected.

Photos: [Unsplash](https://unsplash.com) (Unsplash License), stickers added.
