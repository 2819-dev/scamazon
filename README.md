# Scamazon

A demo e-commerce storefront with fictional brands (Pear, Samsong, Nikey, Abibas, Ray-Bam, Sonny…)
and a membership program called **Crime**.

Live: https://scamazon-6glw.netlify.app

## Features
- Stock product photos with fictional brand labels (`img/`)
- Search with live suggestions, departments, brand / price / rating / Crime / deal filters, sorting, pagination
- Product pages: image views + hover zoom, variants (size, color, storage) with live pricing, clippable coupons,
  frequently-bought-together, related items, reviews (write your own)
- Cart with quantities, save for later, free-shipping progress; wish list
- Sign in / create account, saved address, "Deliver to" ZIP
- Checkout with address validation, delivery speeds, promo codes (`WELCOME5`, `CRIME10`, `FREESHIP`, `PEAR`), demo payment
- Orders with live (accelerated) tracking, cancel, return, buy again
- Crime membership: join / (try to) cancel, free one-day delivery, Crime Video

Plain HTML/CSS/JS, no build step. All state lives in the visitor's browser (localStorage). No payments are processed and no data leaves the browser.

Photos: [Unsplash](https://unsplash.com) (Unsplash License), with brand labels added.
