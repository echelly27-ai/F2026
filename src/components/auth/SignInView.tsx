"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { validateDemoSignIn } from "@/lib/validate";

export function SignInView() {
  const router = useRouter();
  const { session, signInDemo, signOut } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [demoErrors, setDemoErrors] = useState<Record<string, string>>({});

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Sign in"
        title="Demo session"
        lede="Demo mode keeps a name and email in this browser. It is not a production login, and no password is stored in the app for the demo."
      />

      {session ? (
        <section className="mt-6 max-w-xl rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-3xl uppercase text-paper">You are signed in</h2>
          <p className="mt-2 text-sm text-mist">
            {session.mode === "demo" ? "Demo-only session" : "Signed-in session"} for {session.email}. Your board
            remains on this device if you sign out.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
            <Button variant="secondary" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </section>
      ) : null}

      <form
        className="mt-6 max-w-xl rounded-2xl border border-line bg-panel p-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const errors = validateDemoSignIn(name, email);
          setDemoErrors(errors);
          if (Object.keys(errors).length > 0) {
            document.getElementById(errors.name ? "demo-name" : "demo-email")?.focus();
            return;
          }
          signInDemo(name, email);
          router.push("/dashboard");
        }}
      >
        <h2 className="font-display text-3xl uppercase text-paper">Continue in demo mode</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Clearly a demo. The email is not verified and is not a password. Use it to label your local board.
        </p>
        <div className="mt-4 space-y-4">
          <Field label="Name" id="demo-name" error={demoErrors.name}>
            <input
              id="demo-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              autoComplete="name"
              aria-invalid={Boolean(demoErrors.name)}
              aria-describedby={demoErrors.name ? "demo-name-error" : undefined}
              required
            />
          </Field>
          <Field label="Email" id="demo-email" error={demoErrors.email}>
            <input
              id="demo-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              autoComplete="email"
              aria-invalid={Boolean(demoErrors.email)}
              aria-describedby={demoErrors.email ? "demo-email-error" : undefined}
              required
            />
          </Field>
        </div>
        <Button type="submit" className="mt-5">
          Enter demo session
        </Button>
      </form>
    </Container>
  );
}
