import Link from "next/link";

/**
 * Full-width banner image slot. Renders the image at its natural aspect ratio
 * (full width, height auto) so it is never cropped — matching the reference.
 *
 * `priority` marks above-the-fold banners: eager load + high fetch priority.
 * Everything else is lazy + low priority + async decode, and width/height
 * reserve the space so banners never cause layout shift.
 */
export default function Banner({
  src,
  href,
  alt,
  priority = false,
  width,
  height,
}: {
  src: string;
  href?: string;
  alt: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "low"}
      decoding="async"
      className="w-full h-auto block"
    />
  );
  return href ? (
    <Link href={href} className="block">
      {img}
    </Link>
  ) : (
    img
  );
}
