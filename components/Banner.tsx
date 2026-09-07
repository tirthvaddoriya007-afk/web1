import Link from "next/link";

/**
 * Full-width banner image slot. Renders the image at its natural aspect ratio
 * (full width, height auto) so it is never cropped — matching the reference.
 */
export default function Banner({
  src,
  href,
  alt,
}: {
  src: string;
  href?: string;
  alt: string;
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-full h-auto block" />
  );
  return href ? (
    <Link href={href} className="block">
      {img}
    </Link>
  ) : (
    img
  );
}
