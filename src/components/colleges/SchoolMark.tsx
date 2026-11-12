"use client";

import { useState } from "react";
import { cn } from "@/lib/format";
import { logoOnPaper, publicAsset, schoolInitial } from "@/lib/school-logo";

export function SchoolMark({
  name,
  logo,
  size = "sm",
}: {
  name: string;
  logo: string | null;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const initial = schoolInitial(name);
  const box = size === "lg" ? "size-16 text-3xl" : "size-10 text-lg";
  const onPaper = logo ? logoOnPaper(logo) : false;

  if (!logo || failed) {
    return (
      <span
        className={cn(
          "inline-grid shrink-0 place-items-center rounded-lg border border-line bg-navy font-display leading-none text-paper",
          box,
        )}
        aria-hidden="true"
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={publicAsset(logo)}
      alt=""
      width={size === "lg" ? 64 : 40}
      height={size === "lg" ? 64 : 40}
      className={cn(
        "shrink-0 rounded-lg border border-line object-contain p-1",
        onPaper ? "bg-paper" : "bg-ink",
        box,
      )}
      onError={() => setFailed(true)}
    />
  );
}
