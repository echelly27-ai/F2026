import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";

export function SignedOutState({ pageTitle }: { pageTitle: string }) {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{pageTitle}</p>
        <h1 className="mt-2 font-display text-5xl uppercase leading-[0.9] text-paper sm:text-6xl">{pageTitle}</h1>
      </header>
      <div className="mt-8">
        <ButtonLink href="/sign-in">Sign in</ButtonLink>
      </div>
    </Container>
  );
}
