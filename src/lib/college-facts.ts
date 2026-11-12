/** Checked public facts for a small set of men's basketball programs.
 * City, NCAA division, and conference are included only where the campus and membership are public knowledge.
 * Every other directory row stays limited to the IPEDS name, state, and control.
 */
export type CheckedCollegeFact = {
  city: string;
  division: "NCAA Division I";
  conference: string;
};

export const CHECKED_COLLEGE_FACTS: Record<string, CheckedCollegeFact> = {
  "100751": { city: "Tuscaloosa", division: "NCAA Division I", conference: "SEC" },
  "100858": { city: "Auburn", division: "NCAA Division I", conference: "SEC" },
  "104179": { city: "Tucson", division: "NCAA Division I", conference: "Big 12" },
  "106397": { city: "Fayetteville", division: "NCAA Division I", conference: "SEC" },
  "110662": { city: "Los Angeles", division: "NCAA Division I", conference: "Big Ten" },
  "122409": { city: "San Diego", division: "NCAA Division I", conference: "Mountain West" },
  "128328": { city: "Colorado Springs", division: "NCAA Division I", conference: "Mountain West" },
  "129020": { city: "Storrs", division: "NCAA Division I", conference: "Big East" },
  "130794": { city: "New Haven", division: "NCAA Division I", conference: "Ivy League" },
  "131496": { city: "Washington", division: "NCAA Division I", conference: "Big East" },
  "134097": { city: "Tallahassee", division: "NCAA Division I", conference: "ACC" },
  "134130": { city: "Gainesville", division: "NCAA Division I", conference: "SEC" },
  "135726": { city: "Coral Gables", division: "NCAA Division I", conference: "ACC" },
  "145637": { city: "Champaign", division: "NCAA Division I", conference: "Big Ten" },
  "150163": { city: "Indianapolis", division: "NCAA Division I", conference: "Big East" },
  "151351": { city: "Bloomington", division: "NCAA Division I", conference: "Big Ten" },
  "153603": { city: "Ames", division: "NCAA Division I", conference: "Big 12" },
  "153658": { city: "Iowa City", division: "NCAA Division I", conference: "Big Ten" },
  "155317": { city: "Lawrence", division: "NCAA Division I", conference: "Big 12" },
  "157085": { city: "Lexington", division: "NCAA Division I", conference: "SEC" },
  "157289": { city: "Louisville", division: "NCAA Division I", conference: "ACC" },
  "163286": { city: "College Park", division: "NCAA Division I", conference: "Big Ten" },
  "164155": { city: "Annapolis", division: "NCAA Division I", conference: "Patriot League" },
  "166027": { city: "Cambridge", division: "NCAA Division I", conference: "Ivy League" },
  "170976": { city: "Ann Arbor", division: "NCAA Division I", conference: "Big Ten" },
  "171100": { city: "East Lansing", division: "NCAA Division I", conference: "Big Ten" },
  "181002": { city: "Omaha", division: "NCAA Division I", conference: "Big East" },
  "186131": { city: "Princeton", division: "NCAA Division I", conference: "Ivy League" },
  "186584": { city: "South Orange", division: "NCAA Division I", conference: "Big East" },
  "196413": { city: "Syracuse", division: "NCAA Division I", conference: "ACC" },
  "197036": { city: "West Point", division: "NCAA Division I", conference: "Patriot League" },
  "198385": { city: "Davidson", division: "NCAA Division I", conference: "Atlantic 10" },
  "198419": { city: "Durham", division: "NCAA Division I", conference: "ACC" },
  "199120": { city: "Chapel Hill", division: "NCAA Division I", conference: "ACC" },
  "199847": { city: "Winston-Salem", division: "NCAA Division I", conference: "ACC" },
  "202480": { city: "Dayton", division: "NCAA Division I", conference: "Atlantic 10" },
  "204796": { city: "Columbus", division: "NCAA Division I", conference: "Big Ten" },
  "206622": { city: "Cincinnati", division: "NCAA Division I", conference: "Big East" },
  "209551": { city: "Eugene", division: "NCAA Division I", conference: "Big Ten" },
  "215062": { city: "Philadelphia", division: "NCAA Division I", conference: "Ivy League" },
  "216597": { city: "Villanova", division: "NCAA Division I", conference: "Big East" },
  "217882": { city: "Clemson", division: "NCAA Division I", conference: "ACC" },
  "220862": { city: "Memphis", division: "NCAA Division I", conference: "American Athletic Conference" },
  "221759": { city: "Knoxville", division: "NCAA Division I", conference: "SEC" },
  "223232": { city: "Waco", division: "NCAA Division I", conference: "Big 12" },
  "225511": { city: "Houston", division: "NCAA Division I", conference: "Big 12" },
  "228778": { city: "Austin", division: "NCAA Division I", conference: "SEC" },
  "233374": { city: "Richmond", division: "NCAA Division I", conference: "Atlantic 10" },
  "234076": { city: "Charlottesville", division: "NCAA Division I", conference: "ACC" },
  "235316": { city: "Spokane", division: "NCAA Division I", conference: "West Coast Conference" },
  "236948": { city: "Seattle", division: "NCAA Division I", conference: "Big Ten" },
  "239105": { city: "Milwaukee", division: "NCAA Division I", conference: "Big East" },
  "240444": { city: "Madison", division: "NCAA Division I", conference: "Big Ten" },
  "243744": { city: "Stanford", division: "NCAA Division I", conference: "ACC" },
  "243780": { city: "West Lafayette", division: "NCAA Division I", conference: "Big Ten" },
  "126614": { city: "Boulder", division: "NCAA Division I", conference: "Big 12" },
  "495767": { city: "University Park", division: "NCAA Division I", conference: "Big Ten" },
};

/** Demonstration roster spots. Not live openings and not coach contacts. */
export const DEMONSTRATION_OPENINGS = [
  { id: "demo-opening-1", collegeId: "198419", position: "PG", gradYear: "2027" },
  { id: "demo-opening-2", collegeId: "155317", position: "SG", gradYear: "2026" },
  { id: "demo-opening-3", collegeId: "157085", position: "SF", gradYear: "2028" },
  { id: "demo-opening-4", collegeId: "110662", position: "PF", gradYear: "2027" },
  { id: "demo-opening-5", collegeId: "129020", position: "C", gradYear: "2026" },
  { id: "demo-opening-6", collegeId: "235316", position: "PG", gradYear: "2028" },
  { id: "demo-opening-7", collegeId: "204796", position: "SG", gradYear: "2027" },
  { id: "demo-opening-8", collegeId: "243780", position: "SF", gradYear: "2029" },
] as const;

export const OPENING_POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
