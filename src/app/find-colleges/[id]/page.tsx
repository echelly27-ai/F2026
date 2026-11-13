import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollegePage } from "@/components/colleges/CollegePage";
import { verifiedStaff } from "@/lib/basketball-staff";
import { directoryCollegeParams, getDirectoryCollege } from "@/lib/college-results";

export function generateStaticParams() {
  return directoryCollegeParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const college = getDirectoryCollege(id);
  if (!college) return { title: "College" };
  const staff = verifiedStaff(id);
  const withEmail = staff.some((coach) => coach.email);
  return {
    title: college.name,
    description: staff.length
      ? withEmail
        ? `${college.name} men's basketball coaches, with an email when the school's athletics staff page prints one. Tuition, selectivity, and enrollment on this page are samples.`
        : `${college.name} men's basketball coaches listed from the school's athletics staff page. That page does not print a coach email. Tuition, selectivity, and enrollment on this page are samples.`
      : `${college.name} in the college directory. Tuition, selectivity, and enrollment on this page are samples. Staff contacts are not published here.`,
  };
}

export default async function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const college = getDirectoryCollege(id);
  if (!college) notFound();
  return <CollegePage college={college} />;
}
