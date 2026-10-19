import type { Metadata } from "next";
import { SignInView } from "@/components/auth/SignInView";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Start a NEXTUP demo session. Supabase sign-in appears only when public environment variables are set.",
};

export default function SignInPage() {
  return <SignInView />;
}
