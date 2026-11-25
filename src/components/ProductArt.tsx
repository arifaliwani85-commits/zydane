import type { ReactNode } from "react";
import type { Product } from "@/lib/products";

/**
 * Studio-style product visual. Uses the product photo when `image` is set,
 * otherwise draws a soft-lit illustration from the product's shape and tones.
 */
export function ProductArt({
  product,
  className = "",
}: {
  product: Pick<Product, "slug" | "name" | "image" | "art" | "tone">;
  className?: string;
}) {
  if (product.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={product.image} alt={product.name} loading="lazy" className={`h-full w-full object-cover ${className}`} />
    );
  }

  const [bg, c] = product.tone;
  const id = product.slug;
  const dark = `color-mix(in srgb, ${c} 68%, #000)`;
  const light = `color-mix(in srgb, ${c} 55%, #fff)`;
  const shade = `url(#shade-${id})`;

  /** A solid form with a left-lit highlight and right-side falloff. */
  const solid = (key: string, el: (fill: string) => ReactNode, fill: string = c) => (
    <g key={key}>
      <g style={{ fill }}>{el("inherit")}</g>
      {el(shade)}
    </g>
  );

  const shapes: Record<Product["art"], ReactNode> = {
    bottle: (
      <>
        {solid("cap", (f) => <rect x="172" y="118" width="56" height="62" rx="9" fill={f} />, dark)}
        {solid("neck", (f) => <rect x="181" y="176" width="38" height="40" fill={f} />, light)}
        {solid("body", (f) => <rect x="138" y="208" width="124" height="194" rx="20" fill={f} />)}
        <rect x="158" y="268" width="84" height="74" rx="3" fill="#fff" opacity="0.82" />
        <rect x="170" y="286" width="42" height="3" fill={dark} style={{ fill: dark }} opacity="0.7" />
        <rect x="170" y="298" width="60" height="2" style={{ fill: dark }} opacity="0.35" />
        <rect x="170" y="307" width="50" height="2" style={{ fill: dark }} opacity="0.35" />
      </>
    ),
    jar: (
      <>
        {solid("lid", (f) => <rect x="126" y="192" width="148" height="46" rx="10" fill={f} />, dark)}
        {solid("body", (f) => <rect x="116" y="232" width="168" height="170" rx="26" fill={f} />)}
        <rect x="150" y="286" width="100" height="62" rx="3" fill="#fff" opacity="0.8" />
        <rect x="164" y="304" width="46" height="3" style={{ fill: dark }} opacity="0.7" />
        <rect x="164" y="316" width="70" height="2" style={{ fill: dark }} opacity="0.35" />
      </>
    ),
    candle: (
      <>
        <path d="M200 188c-9 14-13 22-13 30a13 13 0 0 0 26 0c0-8-4-16-13-30z" fill="#F2B45C" />
        <path d="M200 204c-4 7-6 11-6 15a6 6 0 0 0 12 0c0-4-2-8-6-15z" fill="#FFF3D6" />
        <rect x="198.5" y="228" width="3" height="22" fill="#2a2520" />
        {solid("vessel", (f) => <rect x="122" y="246" width="156" height="156" rx="16" fill={f} />)}
        <ellipse cx="200" cy="250" rx="72" ry="9" fill="#F3EBDD" opacity="0.9" />
        <rect x="158" y="300" width="84" height="54" rx="3" fill="#fff" opacity="0.14" />
        <rect x="172" y="318" width="56" height="3" fill="#fff" opacity="0.7" />
        <rect x="180" y="330" width="40" height="2" fill="#fff" opacity="0.4" />
      </>
    ),
    mug: (
      <>
        <path
          d="M262 290h22a34 34 0 0 1 0 68h-22"
          fill="none"
          strokeWidth="20"
          strokeLinecap="round"
          style={{ stroke: dark }}
        />
        {solid("body", (f) => <path d="M118 252h152v118a32 32 0 0 1-32 32h-88a32 32 0 0 1-32-32z" fill={f} />)}
        <ellipse cx="194" cy="253" rx="76" ry="10" style={{ fill: dark }} opacity="0.55" />
      </>
    ),
    tote: (
      <>
        <path d="M152 250c0-70 96-70 96 0" fill="none" strokeWidth="11" strokeLinecap="round" style={{ stroke: dark }} />
        {solid("body", (f) => (
          <path d="M112 238h176a8 8 0 0 1 8 7l12 143a14 14 0 0 1-14 14H106a14 14 0 0 1-14-14l12-143a8 8 0 0 1 8-7z" fill={f} />
        ))}
        <path d="M168 250c0-48 64-48 64 0" fill="none" strokeWidth="9" strokeLinecap="round" style={{ stroke: dark }} opacity="0.55" />
        <rect x="176" y="300" width="48" height="30" rx="3" style={{ fill: dark }} opacity="0.5" />
      </>
    ),
    lamp: (
      <>
        {solid("stem", (f) => <rect x="193" y="246" width="14" height="146" fill={f} />, dark)}
        {solid("base", (f) => <rect x="140" y="384" width="120" height="18" rx="9" fill={f} />)}
        <ellipse cx="200" cy="262" rx="96" ry="30" fill="#FFE9B8" opacity="0.5" filter={`url(#blur-${id})`} />
        {solid("shade", (f) => <path d="M112 252c0-62 39-106 88-106s88 44 88 106z" fill={f} />)}
        <rect x="112" y="246" width="176" height="8" rx="4" fill="#FFF1CF" opacity="0.9" />
      </>
    ),
    speaker: (
      <>
        {solid("body", (f) => <rect x="110" y="226" width="180" height="176" rx="78" fill={f} />)}
        <g opacity="0.22" fill="#fff">
          {Array.from({ length: 7 }).flatMap((_, r) =>
            Array.from({ length: 9 }).map((_, i) => (
              <circle key={`${r}-${i}`} cx={136 + i * 16} cy={282 + r * 14} r="2.2" />
            )),
          )}
        </g>
        <ellipse cx="200" cy="236" rx="46" ry="7" style={{ fill: dark }} opacity="0.6" />
        <circle cx="200" cy="236" r="3" fill="#fff" opacity="0.8" />
      </>
    ),
    throw: (
      <>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            {solid(
              `fold-${i}`,
              (f) => <rect x={98 + i * 6} y={270 + i * 44} width={204 - i * 12} height="48" rx="22" fill={f} />,
              i === 1 ? light : c,
            )}
            <path
              d={`M${120 + i * 6} ${294 + i * 44}h${150 - i * 12}`}
              strokeWidth="1.5"
              style={{ stroke: dark }}
              opacity="0.35"
            />
          </g>
        ))}
        <g strokeWidth="3" strokeLinecap="round" style={{ stroke: dark }} opacity="0.6">
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M${296} ${276 + i * 7}h16`} />
          ))}
        </g>
      </>
    ),
    watch: (
      <>
        {solid("strap", (f) => <rect x="170" y="112" width="60" height="296" rx="14" fill={f} />)}
        <rect x="273" y="252" width="12" height="20" rx="3" fill="#8E8A84" />
        {solid("case", (f) => <circle cx="200" cy="262" r="76" fill={f} />, "#B9B5AE")}
        <circle cx="200" cy="262" r="62" fill="#F4EEE2" />
        <g stroke="#2a2622" strokeLinecap="round">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <path
                key={i}
                strokeWidth={i % 3 === 0 ? 3 : 1.5}
                d={`M${(200 + Math.sin(a) * 50).toFixed(1)} ${(262 - Math.cos(a) * 50).toFixed(1)}L${(200 + Math.sin(a) * 56).toFixed(1)} ${(262 - Math.cos(a) * 56).toFixed(1)}`}
              />
            );
          })}
          <path d="M200 262L200 224" strokeWidth="4" />
          <path d="M200 262L230 276" strokeWidth="3" />
        </g>
        <circle cx="200" cy="262" r="4" style={{ fill: c }} />
      </>
    ),
    flask: (
      <>
        <path d="M184 132c0-22 32-22 32 0" fill="none" strokeWidth="8" strokeLinecap="round" style={{ stroke: dark }} />
        {solid("cap", (f) => <rect x="166" y="130" width="68" height="54" rx="12" fill={f} />, dark)}
        {solid("body", (f) => <rect x="146" y="178" width="108" height="224" rx="30" fill={f} />)}
        <rect x="182" y="300" width="36" height="3" fill="#fff" opacity="0.6" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 400 500" role="img" aria-label={product.name} preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`}>
      <defs>
        <radialGradient id={`light-${id}`} cx="32%" cy="24%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.07" />
        </radialGradient>
        <linearGradient id={`shade-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.22" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`floor-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <rect width="400" height="500" fill={bg} />
      <rect width="400" height="500" fill={`url(#light-${id})`} />
      <rect y="402" width="400" height="98" fill={`url(#floor-${id})`} />
      <ellipse cx="212" cy="406" rx="118" ry="13" fill="#000" opacity="0.2" filter={`url(#blur-${id})`} />
      {shapes[product.art]}
    </svg>
  );
}
