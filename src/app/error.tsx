"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-20">
      <h1 className="font-display text-6xl uppercase leading-none text-paper">Something went wrong</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
        This page hit an error. Your saved board is still in this browser if storage is available.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
