"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/format";

function publicSrc(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base || !path.startsWith("/") || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}

const FALLBACK = publicSrc("/images/fallback.jpg");

export function SafeImage({
  src,
  alt,
  className,
  frameClassName,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  frameClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const initial = publicSrc(src);
  const [current, setCurrent] = useState(initial);
  const [source, setSource] = useState(initial);

  if (initial !== source) {
    setSource(initial);
    setCurrent(initial);
  }

  return (
    <div className={cn("relative overflow-hidden bg-navy", frameClassName)}>
      <Image
        src={current}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
        onError={() => {
          if (current !== FALLBACK) setCurrent(FALLBACK);
        }}
      />
    </div>
  );
}
