import { useState } from 'react';

export default function Photo({
  src,
  alt,
  className = '',
  w = 1600,
  h = 1000,
}: {
  src: string;
  alt: string;
  className?: string;
  w?: number;
  h?: number;
}) {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading="lazy"
      onError={() => setOk(false)}
      className={`object-cover ${className}`}
    />
  ) : (
    <div
      role="img"
      aria-label={alt}
      className={`bg-[radial-gradient(circle_at_30%_20%,rgba(130,234,244,.35),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(245,184,61,.25),transparent_50%),#161616] ${className}`}
    />
  );
}
