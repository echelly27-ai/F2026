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
  return {
    title: college.name,
    description: staff.length
      ? `${college.name} men's basketball coaches with emails published on the school's athletics staff page. Tuition, selectivity, and enrollment on this page are samples.`
      : `${college.name} in the college directory. Tuition, selectivity, and enrollment on this page are samples. Staff contacts are not published here.`,
  };
}

export default async function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const college = getDirectoryCollege(id);
  if (!college) notFound();
  return <CollegePage college={college} />;
}
