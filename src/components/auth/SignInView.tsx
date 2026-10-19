"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { validateDemoSignIn, validateSupabaseAuth } from "@/lib/validate";

export function SignInView() {
  const router = useRouter();
  const { session, supabaseEnabled, signInDemo, signInSupabase, signUpSupabase, signOut } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [demoErrors, setDemoErrors] = useState<Record<string, string>>({});
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});
  const [accountMessage, setAccountMessage] = useState("");
  const [pending, setPending] = useState<"in" | "up" | null>(null);

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Sign in"
        title="Demo session"
        lede="Demo mode keeps a name and email in this browser. It is not a production login, and no password is stored in the app for the demo."
      />

      {session ? (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-3xl uppercase text-paper">You are signed in</h2>
          <p className="mt-2 text-sm text-mist">
            {session.mode === "demo" ? "Demo-only session" : "Supabase session"} for {session.email}. Your board
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <form
          className="rounded-2xl border border-line bg-panel p-5"
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

        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="font-display text-3xl uppercase text-paper">Supabase account</h2>
          {supabaseEnabled ? (
            <form
              className="mt-4 space-y-4"
              noValidate
              onSubmit={(event) => event.preventDefault()}
            >
              <p className="text-sm leading-relaxed text-mist">
                Optional. Uses the anon key already configured in the environment. Passwords go to Supabase Auth
                and are not written into this repository.
              </p>
              <Field label="Account email" id="account-email" error={accountErrors.email}>
                <input
                  id="account-email"
                  type="email"
                  value={accountEmail}
                  onChange={(event) => setAccountEmail(event.target.value)}
                  className={inputClass}
                  autoComplete="username"
                  aria-invalid={Boolean(accountErrors.email)}
                  aria-describedby={accountErrors.email ? "account-email-error" : undefined}
                />
              </Field>
              <Field label="Password" id="account-password" error={accountErrors.password}>
                <input
                  id="account-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                  autoComplete="current-password"
                  aria-invalid={Boolean(accountErrors.password)}
                  aria-describedby={accountErrors.password ? "account-password-error" : undefined}
                />
              </Field>
              {accountMessage ? (
                <p role="status" className="text-sm text-mist">
                  {accountMessage}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={pending !== null}
                  onClick={() => {
                    void (async () => {
                      const errors = validateSupabaseAuth(accountEmail, password);
                      setAccountErrors(errors);
                      if (Object.keys(errors).length > 0) return;
                      setPending("in");
                      const result = await signInSupabase(accountEmail, password);
                      setPending(null);
                      if (result) {
                        setAccountMessage(result);
                        return;
                      }
                      router.push("/dashboard");
                    })();
                  }}
                >
                  {pending === "in" ? "Signing in…" : "Sign in"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending !== null}
                  onClick={() => {
                    void (async () => {
                      const errors = validateSupabaseAuth(accountEmail, password);
                      setAccountErrors(errors);
                      if (Object.keys(errors).length > 0) return;
                      setPending("up");
                      const result = await signUpSupabase(accountEmail, password);
                      setPending(null);
                      if (result?.startsWith("CONFIRM:")) {
                        setAccountMessage(result.replace("CONFIRM: ", ""));
                        return;
                      }
                      if (result) {
                        setAccountMessage(result);
                        return;
                      }
                      router.push("/dashboard");
                    })();
                  }}
                >
                  {pending === "up" ? "Creating…" : "Create account"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Supabase is not configured, so this build stays in demo mode. When you are ready, set
              NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then apply supabase/schema.sql. Do not
              put a service-role key in any NEXT_PUBLIC variable.
            </p>
          )}
        </section>
      </div>
    </Container>
  );
}
