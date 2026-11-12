import type { Metadata } from "next";
import { HighlightsManager } from "@/components/dashboard/HighlightsManager";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Container, PageHeader } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Edit the profile and film links saved on this device.",
};

export default function ProfilePage() {
  return (
    <Container className="space-y-6 py-10 sm:py-14">
      <PageHeader
        eyebrow="My profile"
        title="Your profile"
        lede="The same profile editor and film links as the dashboard. Changes stay on this device."
      />
      <ProfileForm />
      <HighlightsManager />
    </Container>
  );
}
