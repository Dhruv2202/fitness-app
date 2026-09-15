// Minimal CSV reader that copes with what spreadsheet exports actually contain:
// quoted fields, commas and newlines inside quotes, and "" as an escaped quote.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const input = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export const IMPORT_COLUMNS = [
  "name",
  "type",
  "area",
  "address",
  "phone",
  "fee",
  "timings",
  "rating",
  "lat",
  "lon",
  "amenities",
];

export function rowsToPlaces(rows) {
  if (rows.length === 0) return { places: [], errors: ["The file is empty."] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const missing = ["name"].filter((required) => !header.includes(required));
  if (missing.length) {
    return {
      places: [],
      errors: [`Missing required column: ${missing.join(", ")}`],
    };
  }

  const places = [];
  const errors = [];

  rows.slice(1).forEach((cells, index) => {
    const lineNumber = index + 2;
    const get = (column) => {
      const at = header.indexOf(column);
      return at === -1 ? "" : (cells[at] ?? "").trim();
    };

    const name = get("name");
    if (!name) {
      errors.push(`Row ${lineNumber}: name is empty, skipped.`);
      return;
    }

    const rating = get("rating");
    const lat = get("lat");
    const lon = get("lon");
    const amenities = get("amenities");

    const ratingValue = rating === "" ? null : Number(rating);
    if (ratingValue !== null && !(ratingValue >= 0 && ratingValue <= 5)) {
      errors.push(
        `Row ${lineNumber}: rating "${rating}" must be between 0 and 5, so it will be left blank.`
      );
    }
    if ((lat === "") !== (lon === "")) {
      errors.push(
        `Row ${lineNumber}: needs both lat and lon to show in distance sorting.`
      );
    }

    places.push({
      name,
      type: get("type") || "Gym",
      area: get("area") || null,
      address: get("address") || null,
      phone: get("phone") || null,
      fee: get("fee") || null,
      timings: get("timings") || null,
      rating:
        ratingValue !== null && ratingValue >= 0 && ratingValue <= 5
          ? ratingValue
          : null,
      lat: lat === "" ? null : Number(lat),
      lon: lon === "" ? null : Number(lon),
      amenities: amenities
        ? amenities.split(/[,;|]/).map((a) => a.trim()).filter(Boolean)
        : [],
    });
  });

  return { places, errors };
}
