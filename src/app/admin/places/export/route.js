import { getAdminUser } from "@/lib/admin";
import { getPlacesForExport } from "@/lib/data";
import { placesToCsv } from "@/lib/csv";

// Downloading the current data is how a spreadsheet edit starts: change cells,
// save as CSV, load it back. The id column is what makes that a round trip.
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return new Response("Not authorised", { status: 401 });

  const places = await getPlacesForExport();
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(placesToCsv(places), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="places-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
