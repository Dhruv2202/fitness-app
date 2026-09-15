// A Google Maps link contains only a position and sometimes a name — the phone
// number, hours and address shown on Google's own page are not in the URL, and
// scraping them isn't permitted. OpenStreetMap is queried instead: free, and it
// often has exactly those tags for places that are mapped.

const OVERPASS = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 120;

function addressFrom(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"] || tags["addr:neighbourhood"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function score(tags, wantedName) {
  if (!wantedName || !tags.name) return 0;
  const a = tags.name.toLowerCase();
  const b = wantedName.toLowerCase();
  if (a === b) return 3;
  if (a.includes(b) || b.includes(a)) return 2;
  // A shared distinctive word is a reasonable hint.
  const words = b.split(/\s+/).filter((w) => w.length > 3);
  return words.some((w) => a.includes(w)) ? 1 : 0;
}

export async function enrichFromCoords(lat, lon, wantedName) {
  const query = `[out:json][timeout:20];
(
  node(around:${RADIUS_M},${lat},${lon})["name"];
  way(around:${RADIUS_M},${lat},${lon})["name"];
);
out center tags 40;`;

  let elements = [];
  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "fitness-app-delhi/1.0 (admin tool)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return {};
    elements = (await res.json()).elements ?? [];
  } catch {
    return {};
  }

  if (elements.length === 0) return {};

  // Prefer a name match; fall back to whatever carries the most useful detail.
  const ranked = elements
    .map((el) => {
      const tags = el.tags ?? {};
      const detail =
        (tags.phone || tags["contact:phone"] ? 1 : 0) +
        (tags.opening_hours ? 1 : 0) +
        (addressFrom(tags) ? 1 : 0);
      return { tags, match: score(tags, wantedName), detail };
    })
    .sort((a, b) => b.match - a.match || b.detail - a.detail);

  const best = ranked[0];
  if (!best || (best.match === 0 && best.detail === 0)) return {};

  const tags = best.tags;
  return {
    matchedName: best.match > 0 ? tags.name : null,
    address: addressFrom(tags),
    area:
      tags["addr:suburb"] ||
      tags["addr:neighbourhood"] ||
      tags["addr:city"] ||
      null,
    phone: tags.phone || tags["contact:phone"] || null,
    timings: tags.opening_hours || null,
    confident: best.match >= 2,
  };
}
