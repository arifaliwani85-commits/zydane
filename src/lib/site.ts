/** Store-wide settings. Edit these to rebrand or change commercial terms. */
export const site = {
  name: "Zydane",
  tagline: "Considered essentials for everyday living",
  description:
    "Zydane designs its own line of everyday essentials and curates the best finds from independent makers worldwide.",
  currency: "USD",
  locale: "en-US",
  /** Orders at or above this subtotal ship free. */
  freeShippingThreshold: 75,
  /** Flat shipping fee below the threshold. */
  shippingFlat: 6,
  supportEmail: "hello@zydane.com",
} as const;

export const fulfilment = {
  house: {
    label: "Zydane Line",
    short: "Our own design",
    shipping: "Ships within 24 hours from our warehouse",
    delivery: "Delivered in 2–4 business days",
  },
  curated: {
    label: "Curated Find",
    short: "Sourced from a partner maker",
    shipping: "Ships direct from our partner within 3 days",
    delivery: "Delivered in 6–12 business days",
  },
} as const;
