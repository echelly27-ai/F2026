import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">404</p>
      <h1 className="mt-3 font-display text-6xl uppercase leading-none text-paper">Page not found</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
        That address is not in NEXTUP. The demonstration roster only includes the published sample profiles.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/players">Discover players</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </Container>
  );
}
