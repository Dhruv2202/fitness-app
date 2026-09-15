// Generates supabase/03-seed-places.sql from the OpenStreetMap snapshot,
// so the existing 205 places can be loaded into the database once.

import { writeFile } from "node:fs/promises";
import { realPlaces } from "../src/data/realPlaces.js";

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  if (!values || values.length === 0) return "'{}'";
  const inner = values.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",");
  return `'{${inner}}'`;
}

const rows = realPlaces.map(
  (p) =>
    `  (${p.id}, ${p.id}, ${sqlString(p.name)}, ${sqlString(p.type)}, ` +
    `${sqlString(p.area)}, ${sqlString(p.address)}, ${p.lat}, ${p.lon}, ` +
    `${sqlString(p.phone)}, ${sqlString(p.timings)}, ${sqlArray(p.amenities)})`
);

const sql = `-- Seeds the places table with the OpenStreetMap snapshot.
-- Safe to re-run: existing rows are left untouched.
-- Run this AFTER 02-places-events-admin.sql.

insert into places (id, osm_id, name, type, area, address, lat, lon, phone, timings, amenities)
values
${rows.join(",\n")}
on conflict (id) do nothing;
`;

await writeFile(
  new URL("../supabase/03-seed-places.sql", import.meta.url),
  sql
);

console.log(`Wrote ${rows.length} place rows to supabase/03-seed-places.sql`);
