"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { Container, PageHeader } from "@/components/layout/Container";
import { useApp } from "@/components/providers/AppProviders";
import { ButtonLink } from "@/components/ui/Button";
import { SchoolMark } from "@/components/colleges/SchoolMark";
import { DemoNote } from "@/components/ui/DemoNote";
import { schoolLogo } from "@/lib/school-logo";
import {
  collegeLocation,
  collegeSearchParams,
  filterColleges,
  formatSampleCount,
  formatSampleDollars,
  parseCollegeSearch,
  searchSummary,
  sortResultRows,
  toResultRow,
  type CollegeResultRow,
  type SortDirection,
  type SortKey,
} from "@/lib/college-results";
import { cn } from "@/lib/format";

const COLUMNS: { key: SortKey; label: string; sample?: boolean }[] = [
  { key: "name", label: "College" },
  { key: "division", label: "Division" },
  { key: "athletic", label: "Athletic selectivity", sample: true },
  { key: "academic", label: "Academic selectivity", sample: true },
  { key: "inState", label: "In-state tuition", sample: true },
  { key: "outState", label: "Out-of-state tuition", sample: true },
  { key: "enrollment", label: "Undergraduate enrollment", sample: true },
  { key: "roster", label: "Roster", sample: true },
];

export function CollegeResults() {
  const params = useSearchParams();
  const search = parseCollegeSearch(params);
  const { ready, board, addCollege, removeCollege } = useApp();
  const [chosenSort, setChosenSort] = useState<SortKey | null>(null);
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [message, setMessage] = useState("");
  const sortKey = chosenSort ?? (search.states.length > 0 ? "division" : "name");

  const rows = sortResultRows(filterColleges(search).map(toResultRow), sortKey, direction);

  const showRoster = rows.some((row) => row.sampleOpening);
  const columns = COLUMNS.filter((column) => column.key !== "roster" || showRoster);
  const savedByName = new Map(board.colleges.map((college) => [college.name.toLowerCase(), college]));
  const returnQuery = collegeSearchParams(search).toString();

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setChosenSort(key);
    setDirection("asc");
  }

  function toggleSave(row: CollegeResultRow) {
    const existing = savedByName.get(row.college.name.toLowerCase());
    if (existing) {
      removeCollege(existing.id);
      setMessage(`Removed ${row.college.name} from My Colleges.`);
      return;
    }
    const error = addCollege({
      name: row.college.name,
      location: collegeLocation(row.college),
      division: row.division,
      conference: row.conference,
      status: "interested",
      notes: "Saved from the college directory. NEXTUP did not contact this school.",
      contactDate: "",
      followUpDate: "",
      favorite: true,
    });
    setMessage(error ?? `Saved ${row.college.name} to My Colleges.`);
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Directory"
        title="College results"
        lede={`${searchSummary(search)}. Names and states come from the college directory. City and division show only where a public fact was checked.${
          search.states.length > 0
            ? " NCAA Division I, II, and III come first. Schools with no listed division follow D3, then NAIA and JUCO. Names stay alphabetical inside each group."
            : ""
        }`}
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink href={returnQuery ? `/find-colleges?${returnQuery}` : "/find-colleges"} variant="secondary">
          Change search
        </ButtonLink>
        <p className="text-sm text-mist">{rows.length === 1 ? "1 college" : `${rows.length} colleges`}</p>
      </div>
      <div className="mt-4">
        <DemoNote>
          Athletic selectivity, academic selectivity, in-state tuition, out-of-state tuition, and undergraduate
          enrollment are samples. They are not the school’s published costs or admission rates. A roster mark appears
          only on a labeled sample row and is not a live opening. NEXTUP does not list coach contacts.
        </DemoNote>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-lg font-semibold text-paper">No colleges</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <caption className="sr-only">College results for {searchSummary(search)}</caption>
            <thead className="bg-navy text-xs uppercase tracking-wide text-mist">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  <span className="sr-only">Save</span>
                </th>
                {columns.map((column) => {
                  const active = sortKey === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
                      className="px-3 py-3 font-semibold"
                    >
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-left text-mist hover:text-paper"
                        onClick={() => toggleSort(column.key)}
                      >
                        <span>
                          {column.label}
                          {column.sample ? <span className="text-lime"> (sample)</span> : null}
                        </span>
                        <span aria-hidden="true">{active ? (direction === "asc" ? "↑" : "↓") : ""}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const saved = savedByName.has(row.college.name.toLowerCase());
                const detailHref = returnQuery
                  ? `/find-colleges/${row.college.id}?${returnQuery}`
                  : `/find-colleges/${row.college.id}`;
                return (
                  <tr key={row.college.id} className="border-t border-line bg-panel align-top">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className={cn("text-mist hover:text-lime", saved && "text-lime")}
                        aria-pressed={saved}
                        aria-label={saved ? `Remove ${row.college.name} from My Colleges` : `Save ${row.college.name}`}
                        disabled={!ready}
                        onClick={() => toggleSave(row)}
                      >
                        <Star className="size-5" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <SchoolMark name={row.college.name} logo={schoolLogo(row.college.id)} />
                        <div className="min-w-0">
                          <Link href={detailHref} className="font-semibold text-paper hover:text-lime">
                            {row.college.name}
                          </Link>
                          <p className="mt-1 text-mist">
                            {row.city ? `${row.city}, ${row.college.state}` : `City not listed · ${row.college.state}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-paper">{row.division || "Not listed"}</td>
                    <td className="px-3 py-3 text-paper">{row.athletic}</td>
                    <td className="px-3 py-3 text-paper">{row.academic}</td>
                    <td className="px-3 py-3 text-paper">{formatSampleDollars(row.inStateTuition)}</td>
                    <td className="px-3 py-3 text-paper">{formatSampleDollars(row.outStateTuition)}</td>
                    <td className="px-3 py-3 text-paper">{formatSampleCount(row.enrollment)}</td>
                    {showRoster ? (
                      <td className="px-3 py-3 text-paper">
                        {row.sampleOpening ? (
                          <span className="font-semibold text-lime">Sample</span>
                        ) : (
                          <span className="sr-only">Not a listed sample</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {message ? (
        <p role="status" className="mt-4 text-sm text-lime">
          {message}
        </p>
      ) : null}
    </Container>
  );
}
