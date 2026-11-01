// All brands are proudly off-brand. Any resemblance to real products is purely for the laughs.
window.CATEGORIES = [
  { id: "electronics", name: "Electronics", emoji: "📱" },
  { id: "computers", name: "Computers", emoji: "💻" },
  { id: "gaming", name: "Video Games", emoji: "🎮" },
  { id: "home", name: "Home & Kitchen", emoji: "🏠" },
  { id: "fashion", name: "Fashion", emoji: "👟" },
  { id: "grocery", name: "Grocery", emoji: "🛒" },
  { id: "toys", name: "Toys", emoji: "🧸" },
  { id: "devices", name: "Scamazon Devices", emoji: "🔊" },
];

window.PRODUCTS = [
  // Pear
  { id: "pear-pphone-17", title: "Pear pPhone 17 Pro Max, 256GB, Titanium-ish (Unlocked, Sort Of)", brand: "Pear", cat: "electronics", price: 1199.0, list: 1299.0, rating: 4.7, reviews: 18452, emoji: "📱", bg: ["#d7d2cc", "#304352"], crime: true, deal: false,
    bullets: ["Pear Intelligence™ — it guesses what you meant, confidently and wrongly", "Triple camera system with Courage Mode (removes the headphone jack again)", "Dynamic Island now available as a timeshare", "Charger sold separately. Cable sold separately. Air sold separately."] },
  { id: "pear-padbook-air", title: "Pear PadBook Air 15-inch, P4 Chip, 16GB RAM, 512GB SSD — Space Greige", brand: "Pear", cat: "computers", price: 1299.0, list: 1499.0, rating: 4.8, reviews: 9321, emoji: "💻", bg: ["#e0e0e0", "#8e9eab"], crime: true, deal: true,
    bullets: ["So thin it slices bread (do not slice bread)", "All-day battery life, where 'day' is defined by Pear", "Two ports. You will need seven dongles.", "PearOS Sequoia-ish preinstalled"] },
  { id: "pear-airbuds-pro", title: "Pear AirBuds Pro 3 Wireless Earbuds with Active Noise Cancelling & Easily Lost Case", brand: "Pear", cat: "electronics", price: 199.0, list: 249.0, rating: 4.6, reviews: 51203, emoji: "🎧", bg: ["#ffffff", "#c9d6ff"], crime: true, deal: true,
    bullets: ["Cancels noise, including your family asking you to take them out", "Spatial audio: sounds like it's coming from under the couch, where it actually is", "Find My Bud™ beeps from inside the dryer", "Up to 6 hours listening, 30 minutes of finding"] },
  { id: "pear-watch-ultra", title: "Pear Watch Ultra 3 Smartwatch — Tells Time, Judges You", brand: "Pear", cat: "electronics", price: 799.0, list: 799.0, rating: 4.5, reviews: 7710, emoji: "⌚", bg: ["#ff9966", "#ff5e62"], crime: true, deal: false,
    bullets: ["Reminds you to stand up 41 times a day", "Rated water-resistant to 100m; your bank account to 0m", "Detects falls, crashes, and poor life choices", "Bands sold separately, at the price of a bicycle"] },
  { id: "pear-pencil", title: "Pear Pencil (3rd Generation) — It's a Stick That Costs $129", brand: "Pear", cat: "electronics", price: 129.0, list: 129.0, rating: 4.4, reviews: 22018, emoji: "✏️", bg: ["#fdfbfb", "#ebedee"], crime: true, deal: false,
    bullets: ["Pixel-perfect precision for doodling in meetings", "Magnetically attaches, then magnetically detaches in your bag", "Does not write on paper. We checked."] },

  // Electronics
  { id: "samsong-galaxy", title: "Samsong Galaxy S26 Ultra 5G, 512GB — Phantom Off-Black", brand: "Samsong", cat: "electronics", price: 1099.99, list: 1299.99, rating: 4.6, reviews: 12044, emoji: "📲", bg: ["#141e30", "#243b55"], crime: true, deal: true,
    bullets: ["200MP camera: zoom in to read your neighbor's grocery list", "Built-in S-Pen (probably not the one from that other phone)", "Comes with 14 preinstalled apps you can't uninstall"] },
  { id: "boss-headphones", title: "Boss QuietComfy Ultra Over-Ear Headphones — Noise Cancelling for Bosses", brand: "Boss", cat: "electronics", price: 329.0, list: 429.0, rating: 4.7, reviews: 30411, emoji: "🎧", bg: ["#232526", "#414345"], crime: true, deal: true,
    bullets: ["Silences open-plan offices and your inner critic", "24-hour battery", "Pairs instantly with everything except the device you want"] },
  { id: "sonny-tv", title: "Sonny BRAVO 75\" 4K OLED Smart TV with Google-ish TV", brand: "Sonny", cat: "electronics", price: 1799.99, list: 2499.99, rating: 4.8, reviews: 4102, emoji: "📺", bg: ["#000000", "#434343"], crime: false, deal: true,
    bullets: ["Blacks so deep they have their own gravitational pull", "Motion smoothing on by default so every movie looks like a soap opera", "Remote with 4 streaming buttons you'll never press"] },
  { id: "goamateur-hero", title: "GoAmateur HERO 13 Action Camera — For Moderately Extreme Sports", brand: "GoAmateur", cat: "electronics", price: 299.0, list: 399.0, rating: 4.3, reviews: 8766, emoji: "📷", bg: ["#56ab2f", "#a8e063"], crime: true, deal: true,
    bullets: ["Captures your skateboard fall in glorious 5.3K", "HyperSmooth stabilization for very slow walks", "Mount it to your dog. He doesn't mind. Probably."] },
  { id: "cannon-dslr", title: "Cannon EOS R-ish Mirrorless Camera Body — Shoots Photos, Not Cannonballs", brand: "Cannon", cat: "electronics", price: 1499.0, list: 1699.0, rating: 4.7, reviews: 2210, emoji: "📸", bg: ["#bdc3c7", "#2c3e50"], crime: false, deal: false,
    bullets: ["24MP full-frame sensor", "Autofocus tracks eyes, animals, and debt collectors", "Lens not included. Lens costs more than body."] },
  { id: "fitbitten", title: "Fitbitten Charge 7 Fitness Tracker — Counts Steps to the Fridge", brand: "Fitbitten", cat: "electronics", price: 129.95, list: 159.95, rating: 4.2, reviews: 15560, emoji: "🏃", bg: ["#00c6ff", "#0072ff"], crime: true, deal: true,
    bullets: ["Sleep tracking: confirms you didn't", "Heart-rate monitor that spikes when you see the price", "7-day battery"] },

  // Computers
  { id: "envydia-rtx", title: "Envydia GeForce RTX 5090 Graphics Card — Requires a Small Nuclear Reactor", brand: "Envydia", cat: "computers", price: 1999.99, list: 2199.99, rating: 4.9, reviews: 3304, emoji: "🖥️", bg: ["#76b852", "#8DC26F"], crime: true, deal: false,
    bullets: ["32GB GDDR7 — runs Minesweeper at 900fps", "Doubles as a space heater for your entire zip code", "Currently out of stock everywhere except here, suspiciously"] },
  { id: "logictech-mouse", title: "Logictech MX Masterful 3S Wireless Mouse — Ergonomic for Right-Handed Geniuses", brand: "Logictech", cat: "computers", price: 99.99, list: 119.99, rating: 4.8, reviews: 40987, emoji: "🖱️", bg: ["#3a6186", "#89253e"], crime: true, deal: true,
    bullets: ["MagSpeed scroll wheel scrolls 1,000 lines a second straight past the thing you wanted", "Works on glass, wood, and your pants", "70 days battery"] },
  { id: "microsloth-surface", title: "Microsloth Surfacé Laptop 7 — Windows 12 (Eventually)", brand: "Microsloth", cat: "computers", price: 999.99, list: 1199.99, rating: 4.4, reviews: 3312, emoji: "💻", bg: ["#4facfe", "#00f2fe"], crime: true, deal: true,
    bullets: ["Restarts for updates exactly when you're presenting", "Copilate AI assistant included, whether you want it or not", "Touchscreen for leaving fingerprints"] },
  { id: "dell-ish", title: "Delll XPeeS 14 Laptop — Now With an Extra 'L' for Luxury", brand: "Delll", cat: "computers", price: 1349.0, list: 1549.0, rating: 4.3, reviews: 2087, emoji: "⌨️", bg: ["#c9d6ff", "#e2e2e2"], crime: false, deal: false,
    bullets: ["Invisible touch-row of function keys (good luck)", "InfinityEdge display: edges go on forever (they don't)", "Webcam placed to emphasize your nostrils"] },

  // Gaming
  { id: "sonny-playstaytion", title: "Sonny PlayStaytion 6 Console — Stay-at-Home Edition", brand: "Sonny", cat: "gaming", price: 499.99, list: 549.99, rating: 4.8, reviews: 27201, emoji: "🎮", bg: ["#1f4037", "#99f2c8"], crime: true, deal: false,
    bullets: ["Loads games faster than you can find your controller", "Haptic feedback: feel every bad decision", "Weighs as much as a mid-size dog"] },
  { id: "microsloth-xboxx", title: "Microsloth Xboxx Series XX — It's Two X's Better", brand: "Microsloth", cat: "gaming", price: 449.99, list: 499.99, rating: 4.7, reviews: 19888, emoji: "🕹️", bg: ["#0f9b0f", "#000000"], crime: true, deal: true,
    bullets: ["Looks like a fridge. Is not a fridge. Please stop putting cheese in it.", "Game Pass Ultimate-ish trial", "Quick Resume for life (coming soon)"] },
  { id: "nintendont-switcheroo", title: "Nintendont Switcheroo 2 — Handheld, Docked, Dropped", brand: "Nintendont", cat: "gaming", price: 449.99, list: 449.99, rating: 4.9, reviews: 33456, emoji: "🎮", bg: ["#ff416c", "#ff4b2b"], crime: true, deal: false,
    bullets: ["Joy-Drifts™ controllers drift on their own, like your attention", "Plays Mustache Plumber Bros. Wonder-ish", "Cartridges taste bad (we were told to say this)"] },
  { id: "razor-keyboard", title: "Razzer BlackWidowish V5 RGB Mechanical Keyboard — 16.8 Million Colors, 0 Productivity", brand: "Razzer", cat: "gaming", price: 169.99, list: 229.99, rating: 4.6, reviews: 8654, emoji: "⌨️", bg: ["#000000", "#0f9b0f"], crime: true, deal: true,
    bullets: ["Clicky switches your roommate will love", "RGB synced to your heart rate and electric bill", "Wrist rest included"] },

  // Home & Kitchen
  { id: "dysin-vacuum", title: "Dysin V16 Cordless Vacuum — Sucks (In a Good Way)", brand: "Dysin", cat: "home", price: 649.99, list: 849.99, rating: 4.7, reviews: 12001, emoji: "🧹", bg: ["#a770ef", "#cf8bf3"], crime: true, deal: true,
    bullets: ["Laser reveals dust you were happier not knowing about", "Counts particles and judges your housekeeping", "60 minutes runtime, 3 minutes on max"] },
  { id: "doomba", title: "iRobbed Doomba j9+ Robot Vacuum — Plotting Against You Since 2026", brand: "iRobbed", cat: "home", price: 599.99, list: 899.99, rating: 4.4, reviews: 21876, emoji: "🤖", bg: ["#434343", "#000000"], crime: true, deal: true,
    bullets: ["Maps your home (and shares it with... someone)", "Avoids cords, socks, and eye contact", "Self-empties. Self-aware update coming Q3."] },
  { id: "instant-pottery", title: "Instant Pottery Duo 7-in-1 Pressure Cooker — 6 Quart", brand: "Instant Pottery", cat: "home", price: 79.95, list: 119.99, rating: 4.7, reviews: 158203, emoji: "🍲", bg: ["#f7971e", "#ffd200"], crime: true, deal: true,
    bullets: ["Pressure cooks, slow cooks, rice cooks, and mild existential pressure", "Recipes say '20 minutes' (+40 minutes of pressurizing)", "Steam release scares the cat every time"] },
  { id: "kitchenmaid-mixer", title: "KitchenMaid Artisan-ish 5 Qt Stand Mixer — Empire Red", brand: "KitchenMaid", cat: "home", price: 379.99, list: 459.99, rating: 4.8, reviews: 60334, emoji: "🥣", bg: ["#cb2d3e", "#ef473a"], crime: true, deal: false,
    bullets: ["Will be used twice a year and displayed always", "Weighs 26 lbs — your new counter's permanent resident", "Flour cloud mode on low speed"] },
  { id: "stanly-quencher", title: "Stanly Quencher H2.0 40oz Tumbler — The Cup Everyone Fights Over", brand: "Stanly", cat: "home", price: 45.0, list: 45.0, rating: 4.8, reviews: 98765, emoji: "🥤", bg: ["#ffafbd", "#ffc3a0"], crime: true, deal: false,
    bullets: ["Holds 40oz of water and 100% of your personality", "Fits in no cupholder ever manufactured", "Keeps ice frozen for 2 days, trends for 6 months"] },
  { id: "yetty-cooler", title: "Yetty Tundra-ish 45 Hard Cooler — Bear-Resistant, Wallet-Vulnerable", brand: "Yetty", cat: "home", price: 325.0, list: 325.0, rating: 4.8, reviews: 7712, emoji: "🧊", bg: ["#e0eafc", "#cfdef3"], crime: false, deal: false,
    bullets: ["Certified bear-resistant (bears not consulted)", "Keeps ice for days", "Doubles as a seat, a step stool, and a status symbol"] },
  { id: "ding-doorbell", title: "Ding Video Doorbell Pro — Watch Packages Get Stolen in 1080p", brand: "Ding", cat: "devices", price: 149.99, list: 229.99, rating: 4.5, reviews: 45012, emoji: "🔔", bg: ["#2193b0", "#6dd5ed"], crime: true, deal: true,
    bullets: ["Motion alerts for every leaf, cat, and passing cloud", "Two-way talk: yell at delivery drivers remotely", "Crime members get Crime-time alerts"] },

  // Fashion
  { id: "nikey-airmax", title: "Nikey Air Maxx 90 Men's Running Shoes — Just Did It", brand: "Nikey", cat: "fashion", price: 129.99, list: 150.0, rating: 4.6, reviews: 23410, emoji: "👟", bg: ["#ece9e6", "#ffffff"], crime: true, deal: true,
    bullets: ["Swoosh-adjacent logo", "Visible air bubble (contains imported air)", "Makes you run 3% faster toward the snack aisle"] },
  { id: "abibas-sambo", title: "Abibas Sambo OG Sneakers — Three Stripes Plus a Bonus Fourth", brand: "Abibas", cat: "fashion", price: 99.95, list: 110.0, rating: 4.5, reviews: 15006, emoji: "👞", bg: ["#ffffff", "#bdc3c7"], crime: true, deal: false,
    bullets: ["Four stripes. That's 33% more stripe.", "Gum sole (do not chew)", "Endorsed by your cousin who 'got into fashion'"] },
  { id: "rollex", title: "Rollex Submarina-ish Automatic Watch — Rolls Right Off Your Wrist", brand: "Rollex", cat: "fashion", price: 89.99, list: 9999.99, rating: 3.9, reviews: 1203, emoji: "⌚", bg: ["#c79081", "#dfa579"], crime: true, deal: true,
    bullets: ["99% off — this is definitely the real deal, trust us", "Water resistant until it touches water", "Ticks loudly so everyone knows"] },
  { id: "raybam", title: "Ray-Bam Wayfarer-ish Classic Sunglasses — BAM! Shade.", brand: "Ray-Bam", cat: "fashion", price: 79.0, list: 171.0, rating: 4.4, reviews: 9988, emoji: "🕶️", bg: ["#000000", "#53346d"], crime: true, deal: true,
    bullets: ["UV protection from the sun and from eye contact", "Polarized against glare and criticism", "Lost within 3 weeks or your money back (no)"] },
  { id: "crocks", title: "Crocks Classic Clog — Unisex, Uncool, Unbelievably Comfy", brand: "Crocks", cat: "fashion", price: 49.99, list: 54.99, rating: 4.8, reviews: 201345, emoji: "🥿", bg: ["#a8e063", "#56ab2f"], crime: true, deal: false,
    bullets: ["Sport mode: flip the strap. Become unstoppable.", "13 holes for 13 Jibbitz-ish charms", "Your mom said no. We say yes."] },
  { id: "gucchi-bag", title: "Gucchi Monogram-ish Tote Bag — Says 'GG', Means 'Good Game'", brand: "Gucchi", cat: "fashion", price: 59.99, list: 2400.0, rating: 3.6, reviews: 802, emoji: "👜", bg: ["#c9a96e", "#5c3d2e"], crime: false, deal: true,
    bullets: ["Authentic-ish leather-adjacent material", "Fits a phone, keys, and a sense of mystery", "Ships in a box that says 'definitely real'"] },

  // Grocery
  { id: "koka-kola", title: "Koka-Kola Classic Soda, 12 fl oz Cans, 24 Pack — The Real-ish Thing", brand: "Koka-Kola", cat: "grocery", price: 11.98, list: 13.99, rating: 4.8, reviews: 65430, emoji: "🥫", bg: ["#ed213a", "#93291e"], crime: true, deal: false,
    bullets: ["Secret formula (it's sugar)", "Pairs with pizza, burgers, and regret", "Polar bears not included"] },
  { id: "starbux-coffee", title: "Starbux Pike's Plaice Medium Roast Whole Bean Coffee, 28 oz", brand: "Starbux", cat: "grocery", price: 17.49, list: 21.99, rating: 4.6, reviews: 34120, emoji: "☕", bg: ["#3e5151", "#decba4"], crime: true, deal: true,
    bullets: ["Your name will be spelled wrong on the bag", "Smooth, balanced, slightly burnt — like us", "Makes ~ 140 cups, or 1 'Venti'"] },
  { id: "doritoes", title: "Doritoes Nacho Cheez Tortilla Chips, Party Size — Licks Your Fingers For You", brand: "Doritoes", cat: "grocery", price: 6.98, list: 7.49, rating: 4.7, reviews: 22340, emoji: "🌮", bg: ["#f12711", "#f5af19"], crime: true, deal: false,
    bullets: ["Bag is 60% air (premium air)", "Orange dust coats your keyboard permanently", "Crunch volume: 11"] },
  { id: "haribold", title: "Haribold Goldbears Gummy Candy, 5 lb Bag — For Sharing (You Won't)", brand: "Haribold", cat: "grocery", price: 19.99, list: 24.99, rating: 4.5, reviews: 12988, emoji: "🧸", bg: ["#f7ff00", "#db36a4"], crime: true, deal: true,
    bullets: ["5 lbs of bears", "Read the sugar-free version reviews. Then don't buy it.", "Bold flavors"] },

  // Toys
  { id: "legoh-castle", title: "Legoh Creator Expert Medieval Castle, 4,514 Pieces — Step on Responsibly", brand: "Legoh", cat: "toys", price: 399.99, list: 399.99, rating: 4.9, reviews: 6302, emoji: "🏰", bg: ["#f7971e", "#e52d27"], crime: true, deal: false,
    bullets: ["4,514 pieces, 4,513 of which you'll find", "Ages 18+ (because of the price)", "Pain on contact with bare feet: legendary"] },
  { id: "barbee-dreamhouse", title: "Barbee DreamHaus Playset — More Square Footage Than Your Apartment", brand: "Barbee", cat: "toys", price: 179.99, list: 199.99, rating: 4.7, reviews: 11021, emoji: "🏡", bg: ["#ff9a9e", "#fecfef"], crime: true, deal: true,
    bullets: ["3 stories, pool, slide, elevator, no mortgage", "75+ accessories that will vanish into the carpet", "Ken-ish sold separately (he's just Ken-ish)"] },
  { id: "hot-wheelz", title: "Hot Wheelz 20-Car Gift Pack — Zero Speeding Tickets", brand: "Hot Wheelz", cat: "toys", price: 21.99, list: 24.99, rating: 4.8, reviews: 54321, emoji: "🏎️", bg: ["#f83600", "#f9d423"], crime: true, deal: false,
    bullets: ["1:64 scale cars, 1:1 scale fun", "Exclusive deco — paint is mostly on the car", "Track sold separately"] },
  { id: "nerff-blaster", title: "Nerff Elite 3.0 Motorized Blaster — Foam Dart Diplomacy", brand: "Nerff", cat: "toys", price: 39.99, list: 54.99, rating: 4.5, reviews: 8790, emoji: "🔫", bg: ["#ff8008", "#ffc837"], crime: true, deal: true,
    bullets: ["Fires darts at 90 feet per second", "Darts lost under the couch: 100%", "For office warfare and family dinners"] },

  // Scamazon devices
  { id: "echo-echo", title: "Scamazon Echo-Echo Dot (6th Gen) with Alexya — Always Listening, Rarely Helping", brand: "Scamazon", cat: "devices", price: 29.99, list: 49.99, rating: 4.6, reviews: 999999, emoji: "🔊", bg: ["#141e30", "#00c6ff"], crime: true, deal: true,
    bullets: ["\"Alexya, play my music\" → 'Now playing: bagpipe covers'", "Totally not recording you (we promise) (do not check)", "Adds things to your cart when you sneeze"] },
  { id: "kindling", title: "Scamazon Kindling Paperwhite-ish — Burn Through Books, Not Paper", brand: "Scamazon", cat: "devices", price: 119.99, list: 159.99, rating: 4.7, reviews: 87654, emoji: "📖", bg: ["#ece9e6", "#a1887f"], crime: true, deal: true,
    bullets: ["Glare-free display for reading outside, if you go outside", "Weeks of battery", "With Special Offers (ads on your lock screen, forever)"] },
  { id: "fire-stick", title: "Scamazon Fire-Hazard TV Stick 4K — Streams Everything, Including Ads", brand: "Scamazon", cat: "devices", price: 24.99, list: 49.99, rating: 4.5, reviews: 456789, emoji: "🔥", bg: ["#ff512f", "#dd2476"], crime: true, deal: true,
    bullets: ["Not an actual fire hazard (legal made us say this)", "Home screen is 80% ads, 20% things you pay for", "Remote with Alexya voice so you can argue with your TV"] },
];
