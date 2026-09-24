"use client";

import { useEffect, useRef, useState } from "react";

// Enough to feel alive, few enough that a card never fetches a gallery's worth
// of images just to sit in a list.
const MAX_PHOTOS = 5;
const HOLD_MS = 3800;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function CardPhotos({ photos, alt, className = "", children }) {
  const list = (photos ?? []).filter(Boolean).slice(0, MAX_PHOTOS);
  const [index, setIndex] = useState(0);
  const [live, setLive] = useState(false);
  const frame = useRef(null);

  // Only a card near the viewport loads its extra photos or runs a timer. With
  // eighty cards on screen, animating all of them costs far more than it shows.
  useEffect(() => {
    const el = frame.current;
    if (!el || list.length < 2) return;

    if (typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [list.length]);

  useEffect(() => {
    if (!live || list.length < 2) return;
    // Someone who has asked their device for less motion gets a still image.
    if (window.matchMedia?.(REDUCED_MOTION).matches) return;

    const timer = setInterval(
      () => setIndex((i) => (i + 1) % list.length),
      HOLD_MS
    );
    return () => clearInterval(timer);
  }, [live, list.length]);

  if (list.length === 0) return null;

  return (
    <div
      ref={frame}
      className={`relative h-40 w-full overflow-hidden bg-surface-2 ${className}`}
    >
      {list.map((src, i) => {
        // Past the first, images enter the DOM only once the card is close to
        // view, so a long list never fetches hundreds of files up front.
        if (i > 0 && !live) return null;
        return (
          <img
            key={src}
            src={src}
            alt={i === 0 ? alt : ""}
            loading="lazy"
            decoding="async"
            className={`card-photo absolute inset-0 h-full w-full object-cover ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      {list.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {list.map((src, i) => (
            <span
              key={src}
              className={`h-1 rounded-full bg-white transition-all duration-500 ${
                i === index ? "w-3 opacity-95" : "w-1 opacity-50"
              }`}
            />
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
