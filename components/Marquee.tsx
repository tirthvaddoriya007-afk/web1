import { brand } from "@/lib/brand";

export default function Marquee({ text }: { text?: string }) {
  const t = text?.trim() || brand.promo;
  return (
    <div className="marquee">
      <div className="marquee__inner">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
