"use client";

import { useState } from "react";
import { ArrowIcon } from "./Icons";

export function Newsletter() {
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="mt-10 text-sm text-cream/80" role="status">Thank you — you&apos;re on the list.</p>;
  }

  return (
    <form
      className="mt-10 flex max-w-md items-center border-b border-cream/30 focus-within:border-cream"
      onSubmit={(e) => {
        e.preventDefault();
        // Connect this to your email platform (Klaviyo, Mailchimp, …).
        setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="Email address"
        aria-label="Email address"
        className="h-14 w-full bg-transparent text-base placeholder:text-cream/40 focus:outline-none"
      />
      <button className="p-3 transition-transform hover:translate-x-1" aria-label="Subscribe">
        <ArrowIcon />
      </button>
    </form>
  );
}
