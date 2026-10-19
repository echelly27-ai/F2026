"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/format";

const FALLBACK = "/images/fallback.jpg";

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
  const [current, setCurrent] = useState(src);
  const [source, setSource] = useState(src);

  if (src !== source) {
    setSource(src);
    setCurrent(src);
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
