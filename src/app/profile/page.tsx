import type { Metadata } from "next";
import { ProfileSummary } from "@/components/profile/ProfileSummary";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Review the profile saved on this device and update one item at a time.",
};

export default function ProfilePage() {
  return <ProfileSummary />;
}
