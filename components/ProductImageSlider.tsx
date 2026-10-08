"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Swipeable product image carousel (up to 10 images). Native scroll-snap for
 * the swipe gesture + arrow buttons + a "1/N" counter + a horizontal thumbnail
 * strip below the hero. Tapping a thumbnail scrolls the hero to that photo;
 * the active thumbnail is highlighted with the brand-colored border. The first
 * image loads eagerly, the rest lazily, so the hero never waits for images
 * the visitor hasn't reached yet.
 */
export default function ProductImageSlider({ images, name }: { images: string[]; name: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const list = images.filter(Boolean);

  // rAF-throttled: scroll fires many times per frame while swiping, so the
  // index (arrows/thumbs/counter) only updates once per paint.
  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = trackRef.current;
      if (!el) return;
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(Math.max(0, Math.min(list.length - 1, i)));
    });
  }, [list.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Keep the selected thumbnail visible inside the strip as the hero changes.
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (list.length === 0) {
    return <div className="w-full aspect-square bg-[#f7f7f9] rounded-lg" />;
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="w-full aspect-square bg-[#f7f7f9] rounded-lg overflow-hidden flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {list.map((src, i) => (
          <div key={src} className="w-full shrink-0 snap-center flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={name}
              className="w-full h-full object-contain"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {list.length === 1 ? (
        <div className="flex justify-center py-3">
          <span className="w-6 h-1 rounded-full" style={{ background: "var(--brand)" }} />
        </div>
      ) : (
        <>
          {/* prev / next arrows */}
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 text-white grid place-items-center disabled:opacity-0 transition-opacity"
            disabled={index === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => goTo(Math.min(list.length - 1, index + 1))}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 text-white grid place-items-center disabled:opacity-0 transition-opacity"
            disabled={index === list.length - 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* counter pill */}
          <span className="absolute right-3 bottom-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white">
            {index + 1}/{list.length}
          </span>
        </>
      )}

      {/* Thumbnail strip — all photos for this product, tap to open in hero */}
      {list.length > 1 && (
        <div
          className="flex gap-2.5 overflow-x-auto pt-3 pb-1 -mx-4 px-4"
          style={{ scrollbarWidth: "none" }}
        >
          {list.map((src, i) => (
            <button
              key={src}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`View photo ${i + 1}`}
              className="shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden bg-[#f7f7f9]"
              style={{ borderColor: i === index ? "#9f2089" : "#e6e6ec" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
