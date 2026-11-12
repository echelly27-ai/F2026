import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function SignedOutState({ pageTitle }: { pageTitle: string }) {
  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime">{pageTitle}</p>
        <h1 className="mt-2 font-display text-5xl uppercase leading-[0.9] text-paper sm:text-6xl">{pageTitle}</h1>
      </header>
      <div className="mt-8">
        <EmptyState
          title="Nothing is available"
          body="Start a demo session to see what you saved on this device."
          action={<ButtonLink href="/sign-in">Sign in</ButtonLink>}
        />
      </div>
    </Container>
  );
}
