/**
 * Product catalogue.
 *
 * `source: "house"`   → your private-label products, fulfilled from your own stock.
 * `source: "curated"` → dropshipped products, fulfilled by the named supplier.
 *
 * To add a product, append an entry below. To use a real photo, drop it in
 * /public/products and set `image: "/products/your-file.jpg"`; without one the
 * store renders a studio-style illustration from `art` + `tone`.
 */

import type { CurrencyCode, MarketCode } from "./site";

export type Source = "house" | "curated";
export type Category = "kids" | "home" | "wellness" | "carry" | "tech";
export type ArtShape =
  | "bottle"
  | "jar"
  | "candle"
  | "mug"
  | "tote"
  | "lamp"
  | "speaker"
  | "throw"
  | "watch"
  | "flask";

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  /**
   * Price in `baseCurrency` (US dollars unless stated). Used for any market
   * that has no entry in `prices`, converted at the rate set in site.ts.
   */
  price: number;
  compareAt?: number;
  baseCurrency?: CurrencyCode;
  /** Exact prices per currency; these win over the converted `price`. */
  prices?: Partial<Record<CurrencyCode, { price: number; compareAt?: number }>>;
  /** Markets this product is sold in. Leave out to sell it in every market. */
  markets?: MarketCode[];
  category: Category;
  source: Source;
  /** Dropship supplier reference — never shown to shoppers. */
  supplier?: { name: string; sku: string; cost: number };
  description: string;
  details: string[];
  variants?: { label: string; options: string[] };
  /** Leave out until you have real reviews; the stars are hidden without them. */
  rating?: number;
  reviews?: number;
  badge?: string;
  art: ArtShape;
  /** [backdrop, object] colours for the generated product visual. */
  tone: [string, string];
  image?: string;
  /** Extra photos shown in the product page gallery (the first is `image`). */
  gallery?: string[];
  /** Feature blocks shown on the product page. */
  highlights?: { title: string; text: string }[];
  safety?: string;
  featured?: boolean;
  /** Placeholder product shown as "Coming soon" and not buyable. Remove it or its flag once the product is real. */
  sample?: boolean;
  /** WooCommerce product id, for Curated Finds synced from the AliDropship back office. */
  wooId?: number;
  /** WooCommerce variation id for each option of a synced product. */
  wooVariations?: Record<string, number>;
}

export const categories: { id: Category; name: string; blurb: string }[] = [
  { id: "kids", name: "Kids", blurb: "Play that sparks imagination" },
  { id: "home", name: "Home", blurb: "Objects that settle a room" },
  { id: "wellness", name: "Wellness", blurb: "Small rituals, done well" },
  { id: "carry", name: "Carry", blurb: "Made to leave the house" },
  { id: "tech", name: "Tech", blurb: "Quiet, useful technology" },
];

export const products: Product[] = [
  // ───────────── Zydane Line (private label) ─────────────
  {
    slug: "fairy-potion-kit",
    name: "Fairy Potion Kit",
    subtitle: "24-bottle magic potion making kit · Ages 6+",
    price: 22.85,
    compareAt: 25,
    prices: { GBP: { price: 17.99, compareAt: 19.99 } },
    category: "kids",
    source: "house",
    description:
      "Spark your child's imagination with the Zydane Fairy Potion Kit. This 24-bottle craft set lets kids mix their own enchanting potions using colorful magic powders, glitter, sequins, crystals and glow-in-the-dark stones. It blends creative arts with hands-on STEM play: children measure, mix and watch colors combine while inventing stories about fairies, wizards and magical creatures. The reusable corked bottles, funnels, mixing bowls and stirring rods mean kids can play again and again, and the included display case shows off their favorite creations.",
    details: [
      "24 reusable corked bottles and a display case",
      "7 magic powders, glitter, sequins and crystals",
      "Glow-in-the-dark stones, fairy wings and charms",
      "2 funnels, 2 mixing bowls, stirring rods and labels",
      "Non-toxic, EN71-tested materials",
      "For ages 6 and up, with adult supervision",
      "Box: 9.25 × 6.69 × 2.36 in, 1.21 lb",
    ],
    highlights: [
      {
        title: "A magical potion-making adventure",
        text: "Kids become real potion masters, brewing Friendship Elixir, Dream Dust, Unicorn Wishes and Rainbow Magic. Every mix sparks imagination, storytelling and hours of screen-free play.",
      },
      {
        title: "Easy step-by-step instructions",
        text: "Mix, create, decorate and display. The instruction guide gets kids brewing straight out of the box, with room to invent their own spells — and minimal mess for parents.",
      },
      {
        title: "Everything included, 24 bottles",
        text: "Reusable corked bottles, 7 magic powders, glitter, sequins, crystals, glow-in-the-dark stones, fairy wings, charms, funnels, mixing bowls, stirring rods, labels and a display case.",
      },
      {
        title: "STEM learning through play",
        text: "Kids practise measuring, mixing and observing color changes while building fine motor skills, focus and problem-solving — at home, in classrooms, at parties and sleepovers.",
      },
      {
        title: "The perfect gift for girls & boys",
        text: "A gift-ready box for birthdays, Christmas, Halloween or just because. Reusable bottles and tools mean kids come back to it again and again.",
      },
    ],
    safety:
      "Not suitable for children under 6 years. To be used under the direct supervision of an adult. Choking hazard: contains small parts. Includes a long cord; ensure proper use to prevent entanglement. If prone to asthma or allergies, use in a ventilated space.",
    badge: "Ages 6+",
    art: "jar",
    tone: ["#2A1B4D", "#8E5BD8"],
    image: "/products/potion-kit/6.jpg",
    gallery: [
      "/products/potion-kit/1.jpg",
      "/products/potion-kit/2.jpg",
      "/products/potion-kit/3.jpg",
      "/products/potion-kit/5.jpg",
      "/products/potion-kit/9.jpg",
      "/products/potion-kit/8.jpg",
      "/products/potion-kit/7.jpg",
      "/products/potion-kit/4.jpg",
    ],
    featured: true,
  },
  {
    slug: "face-neck-massage-set",
    name: "Face & Neck Massage Set",
    subtitle: "LED face & neck massager with jade gua sha",
    price: 19.99,
    prices: { GBP: { price: 14.99 } },
    markets: ["GB"],
    category: "wellness",
    source: "house",
    description:
      "A spa-like face and neck ritual at home. The Zydane Aesthetics massager combines EMS microcurrent, soothing 45°C warmth and 7 LED light colours across three modes, with an ergonomic head that follows the curves of your jawline and neck. It comes with a hand-polished jade gua sha for gentle sculpting, so you can massage, de-puff and refresh in a few minutes a day. Rechargeable over USB-C and light enough to travel with.",
    details: [
      "3 massage modes: Clean, EMS and Hot",
      "7 LED colours: red, blue, green, yellow, cyan, purple and white",
      "Soothing warmth at a constant 45 ± 5 °C (113 ± 9 °F)",
      "400 mAh rechargeable battery, 1–2 hours of use",
      "USB-C charging (5 V / 1 A), about 3 hours to full",
      "ABS with electroplated finish, 3 W rated power",
      "Massager 13.9 × 9.0 cm, approx. 85 g",
      "In the box: massager, jade gua sha, USB-C cable, user manual, gift box",
    ],
    highlights: [
      {
        title: "Three modes, one device",
        text: "Switch between Clean, EMS and Hot with a single button. Gentle EMS microcurrent helps tone, while soothing warmth relaxes tired muscles.",
      },
      {
        title: "7 LED light colours",
        text: "Red to revitalise and energise, blue to soothe and balance, purple to combine both — plus green, yellow, cyan and white for a refreshed-looking glow.",
      },
      {
        title: "Jade gua sha included",
        text: "A hand-polished jade stone for gentle facial sculpting, de-puffing and lymphatic massage. Use it after the massager to finish your routine.",
      },
      {
        title: "An easy 4-step routine",
        text: "Cleanse, massage in your preferred mode, sculpt with the gua sha, then finish with your favourite serum or moisturiser.",
      },
      {
        title: "Rechargeable and travel-friendly",
        text: "USB-C charging and a 400 mAh battery give 1–2 hours of use per charge. At around 85 g, it slips easily into a wash bag.",
      },
      {
        title: "Gift-ready packaging",
        text: "Arrives in a premium Zydane Aesthetics gift box — a thoughtful present for birthdays, holidays or anyone who deserves a little self-care.",
      },
    ],
    badge: "New",
    art: "bottle",
    tone: ["#E7EEE8", "#1F4A35"],
    image: "/products/face-massager/1.jpg",
    gallery: [
      "/products/face-massager/2.jpg",
      "/products/face-massager/3.jpg",
      "/products/face-massager/4.jpg",
      "/products/face-massager/5.jpg",
      "/products/face-massager/6.jpg",
      "/products/face-massager/7.jpg",
      "/products/face-massager/8.jpg",
      "/products/face-massager/9.jpg",
    ],
    featured: true,
  },
  {
    slug: "atlas-ceramic-mug",
    sample: true,
    name: "Atlas Ceramic Mug",
    subtitle: "Hand-glazed stoneware, 350 ml",
    price: 28,
    category: "home",
    source: "house",
    description:
      "A heavy-bottomed stoneware mug with a matte glaze that warms in the hand. Thrown in small batches, so no two are quite alike.",
    details: ["350 ml capacity", "Dishwasher and microwave safe", "Lead-free reactive glaze", "Sold individually"],
    variants: { label: "Glaze", options: ["Oat", "Moss", "Charcoal"] },
    rating: 4.9,
    reviews: 412,
    badge: "Bestseller",
    art: "mug",
    tone: ["#E9E2D6", "#B8A58C"],
    featured: true,
  },
  {
    slug: "no-1-botanical-candle",
    sample: true,
    name: "No. 1 Botanical Candle",
    subtitle: "Fig leaf, cedar & black tea",
    price: 42,
    category: "home",
    source: "house",
    description:
      "Our first scent: green fig leaf over dry cedar and a trace of smoked tea. Poured into a reusable smoked-glass vessel.",
    details: ["220 g coconut-soy wax", "50 hour burn time", "Cotton wick, phthalate-free fragrance", "Vessel is reusable"],
    rating: 4.8,
    reviews: 289,
    art: "candle",
    tone: ["#E4DDD3", "#5C5046"],
    featured: true,
  },
  {
    slug: "daily-renewal-serum",
    sample: true,
    name: "Daily Renewal Serum",
    subtitle: "Niacinamide 5% + squalane",
    price: 38,
    compareAt: 46,
    category: "wellness",
    source: "house",
    description:
      "A lightweight daily serum that evens tone and keeps skin calm. Fragrance-free and formulated for all skin types.",
    details: ["30 ml glass dropper bottle", "Fragrance-free, vegan", "Dermatologist tested", "Use morning and evening"],
    rating: 4.7,
    reviews: 634,
    badge: "Save 17%",
    art: "bottle",
    tone: ["#E8E0D2", "#A8672F"],
    featured: true,
  },
  {
    slug: "mineral-bath-soak",
    sample: true,
    name: "Mineral Bath Soak",
    subtitle: "Magnesium, eucalyptus & clary sage",
    price: 32,
    category: "wellness",
    source: "house",
    description:
      "Coarse magnesium flakes blended with eucalyptus and clary sage. A generous scoop turns an ordinary bath into an early night.",
    details: ["450 g — around 8 baths", "Pure magnesium chloride flakes", "Essential oils only", "Recyclable glass jar"],
    rating: 4.8,
    reviews: 176,
    art: "jar",
    tone: ["#DDE1D8", "#7C8B76"],
  },
  {
    slug: "field-canvas-tote",
    sample: true,
    name: "Field Canvas Tote",
    subtitle: "18 oz waxed cotton, leather handles",
    price: 68,
    category: "carry",
    source: "house",
    description:
      "A structured everyday tote in heavyweight waxed canvas. Stands on its own, shrugs off rain and softens with every year of use.",
    details: ["18 oz waxed cotton canvas", "Vegetable-tanned leather handles", "Interior zip pocket", "42 × 36 × 16 cm"],
    variants: { label: "Colour", options: ["Sand", "Olive", "Ink"] },
    rating: 4.9,
    reviews: 221,
    badge: "New",
    art: "tote",
    tone: ["#E6DFD2", "#8C7A5B"],
    featured: true,
  },
  {
    slug: "insulated-steel-flask",
    sample: true,
    name: "Insulated Steel Flask",
    subtitle: "Cold 24 h, hot 12 h — 600 ml",
    price: 36,
    category: "carry",
    source: "house",
    description:
      "Double-walled stainless steel with a powder-coat finish and a leak-proof cap that opens with one hand.",
    details: ["600 ml capacity", "18/8 stainless steel, BPA-free", "Fits standard cup holders", "Hand wash recommended"],
    variants: { label: "Colour", options: ["Bone", "Forest", "Graphite"] },
    rating: 4.8,
    reviews: 508,
    art: "flask",
    tone: ["#DFE2DC", "#2F4A3C"],
  },
  {
    slug: "merino-lounge-throw",
    sample: true,
    name: "Merino Lounge Throw",
    subtitle: "Extra-fine merino, 130 × 180 cm",
    price: 124,
    category: "home",
    source: "house",
    description:
      "Woven from extra-fine merino with a brushed finish and hand-knotted fringe. Light enough for summer evenings, warm enough for January.",
    details: ["100% extra-fine merino wool", "130 × 180 cm", "Dry clean or cool hand wash", "Woven in limited runs"],
    variants: { label: "Colour", options: ["Oatmeal", "Clay", "Slate"] },
    rating: 5.0,
    reviews: 97,
    art: "throw",
    tone: ["#E9E3DA", "#B4573A"],
  },
  {
    slug: "hand-and-body-wash",
    sample: true,
    name: "Hand & Body Wash",
    subtitle: "Bergamot, vetiver & sea salt",
    price: 24,
    category: "wellness",
    source: "house",
    description:
      "A gentle, low-foam wash with a clean citrus-and-earth scent. Refillable aluminium bottle with a pump that actually lasts.",
    details: ["500 ml refillable bottle", "pH balanced, sulphate-free", "Refill pouches available", "Vegan and cruelty-free"],
    rating: 4.7,
    reviews: 341,
    art: "bottle",
    tone: ["#E3E2DA", "#3D4A45"],
  },

  // ───────────── Curated Finds (dropship) ─────────────
  {
    slug: "halo-table-lamp",
    sample: true,
    name: "Halo Table Lamp",
    subtitle: "Dimmable, cordless, 40 h battery",
    price: 89,
    compareAt: 110,
    category: "home",
    source: "curated",
    supplier: { name: "Lumen Works", sku: "LW-HALO-02", cost: 41 },
    description:
      "A cordless lamp with a warm, glare-free glow. Three brightness levels by touch, and it moves from desk to dinner table without a cable in sight.",
    details: ["Warm 2700 K LED", "Up to 40 hours per charge", "USB-C charging", "Anodised aluminium body"],
    variants: { label: "Finish", options: ["Brass", "Matte Black"] },
    rating: 4.6,
    reviews: 158,
    badge: "Save 19%",
    art: "lamp",
    tone: ["#E7E0D3", "#B8904F"],
    featured: true,
  },
  {
    slug: "orbit-wireless-speaker",
    sample: true,
    name: "Orbit Wireless Speaker",
    subtitle: "360° sound, 20 h playtime",
    price: 119,
    category: "tech",
    source: "curated",
    supplier: { name: "Northwave Audio", sku: "NW-ORB-1", cost: 58 },
    description:
      "Room-filling sound from a speaker the size of a grapefruit. Wrapped in woven wool-blend fabric and tuned for clarity at low volume.",
    details: ["Bluetooth 5.3, multipoint", "20 hours per charge", "IP67 water and dust resistant", "Pair two for stereo"],
    variants: { label: "Colour", options: ["Stone", "Ink"] },
    rating: 4.7,
    reviews: 264,
    art: "speaker",
    tone: ["#DEDFDB", "#4A4E52"],
    featured: true,
  },
  {
    slug: "meridian-field-watch",
    sample: true,
    name: "Meridian Field Watch",
    subtitle: "38 mm, sapphire crystal",
    price: 165,
    category: "carry",
    source: "curated",
    supplier: { name: "Meridian Watch Co.", sku: "MWC-F38", cost: 84 },
    description:
      "A clean, legible field watch with a Japanese quartz movement and a leather strap that only gets better with wear.",
    details: ["38 mm brushed steel case", "Sapphire crystal", "100 m water resistance", "Quick-release leather strap"],
    variants: { label: "Dial", options: ["Cream", "Black"] },
    rating: 4.8,
    reviews: 89,
    badge: "Limited",
    art: "watch",
    tone: ["#E5DFD4", "#6B4A32"],
    featured: true,
  },
  {
    slug: "pour-over-carafe-set",
    sample: true,
    name: "Pour-Over Carafe Set",
    subtitle: "Borosilicate glass, serves four",
    price: 54,
    category: "home",
    source: "curated",
    supplier: { name: "Kiln & Co.", sku: "KC-PO-600", cost: 22 },
    description:
      "A heat-proof glass carafe with a reusable steel filter. Makes four clean cups and looks good left out on the counter.",
    details: ["600 ml carafe", "Reusable stainless filter", "Cork and leather collar", "Dishwasher-safe glass"],
    rating: 4.6,
    reviews: 203,
    art: "jar",
    tone: ["#E8E1D5", "#8A5A3B"],
  },
  {
    slug: "aroma-stone-diffuser",
    sample: true,
    name: "Aroma Stone Diffuser",
    subtitle: "Ultrasonic, ceramic shell",
    price: 64,
    category: "wellness",
    source: "curated",
    supplier: { name: "Stillwater Goods", sku: "SG-DIF-CER", cost: 27 },
    description:
      "A near-silent ultrasonic diffuser under a hand-finished ceramic cover. Runs up to eight hours and switches itself off.",
    details: ["Up to 8 hours runtime", "Auto shut-off", "Soft ambient light, optional", "Covers rooms up to 30 m²"],
    rating: 4.5,
    reviews: 312,
    art: "speaker",
    tone: ["#E6E2DA", "#C9BBA6"],
  },
  {
    slug: "magnetic-charging-stand",
    sample: true,
    name: "Magnetic Charging Stand",
    subtitle: "15 W wireless, solid walnut",
    price: 58,
    category: "tech",
    source: "curated",
    supplier: { name: "Grain Electronics", sku: "GE-MCS-15", cost: 24 },
    description:
      "A weighted walnut stand that charges your phone at eye level. Snaps into place magnetically and tilts for calls.",
    details: ["15 W Qi2 fast charging", "Solid walnut and steel", "1.5 m braided USB-C cable", "Works through cases up to 3 mm"],
    rating: 4.6,
    reviews: 147,
    badge: "New",
    art: "lamp",
    tone: ["#E2DED6", "#6E4B34"],
  },
  {
    slug: "travel-tech-pouch",
    sample: true,
    name: "Travel Tech Pouch",
    subtitle: "Recycled nylon, lay-flat design",
    price: 39,
    category: "tech",
    source: "curated",
    supplier: { name: "Transit Supply", sku: "TS-TP-M", cost: 14 },
    description:
      "Cables, chargers and adapters, finally in one place. Opens flat so you can see everything without digging.",
    details: ["Recycled 420D nylon", "Water-resistant zips", "Elastic loops and mesh pockets", "24 × 16 × 7 cm"],
    variants: { label: "Colour", options: ["Black", "Olive"] },
    rating: 4.7,
    reviews: 419,
    art: "tote",
    tone: ["#DFDFD9", "#33362F"],
  },
  {
    slug: "glass-water-bottle",
    sample: true,
    name: "Glass Water Bottle",
    subtitle: "Borosilicate with silicone sleeve",
    price: 29,
    category: "carry",
    source: "curated",
    supplier: { name: "Clearwell", sku: "CW-GB-550", cost: 11 },
    description:
      "Pure-tasting water from lightweight glass, protected by a soft silicone sleeve and topped with a bamboo cap.",
    details: ["550 ml capacity", "Borosilicate glass", "Bamboo and steel cap", "Sleeve is dishwasher safe"],
    variants: { label: "Sleeve", options: ["Sage", "Sand", "Smoke"] },
    rating: 4.5,
    reviews: 276,
    art: "flask",
    tone: ["#E0E4DE", "#9DAA98"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
