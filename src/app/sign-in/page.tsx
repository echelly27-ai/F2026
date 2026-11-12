import type { Metadata } from "next";
import { SignInView } from "@/components/auth/SignInView";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Start a NEXTUP demo session. A name and email stay in this browser. No password is stored for the demo.",
};

export default function SignInPage() {
  return <SignInView />;
}
