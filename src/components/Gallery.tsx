"use client";

import { useState } from "react";

/** Product photo gallery: one large image with a row of selectable thumbnails. */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-[28px] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${name}, photo ${active + 1} of ${images.length}`}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show photo ${i + 1}`}
            aria-pressed={active === i}
            className={`aspect-square overflow-hidden rounded-xl bg-white ring-offset-2 ring-offset-paper transition ${
              active === i ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
