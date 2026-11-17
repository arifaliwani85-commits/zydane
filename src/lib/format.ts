import { site } from "./site";

const fmt = new Intl.NumberFormat(site.locale, {
  style: "currency",
  currency: site.currency,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const money = (n: number) => fmt.format(n);

export const shippingFor = (subtotal: number) =>
  subtotal === 0 || subtotal >= site.freeShippingThreshold ? 0 : site.shippingFlat;
