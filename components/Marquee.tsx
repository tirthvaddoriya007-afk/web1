import { brand } from "@/lib/brand";

export default function Marquee() {
  const text = brand.promo;
  return (
    <div className="marquee">
      <div className="marquee__inner">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}
