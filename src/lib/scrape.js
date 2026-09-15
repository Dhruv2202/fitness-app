import { normalizeUrl } from "@/lib/url";

// Matching the whole tag first, then reading `content` with a backreference to
// its own quote character, so apostrophes inside titles don't end the match.
function metaContent(html, property) {
  const tag = html.match(
    new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*>`, "i")
  )?.[0];
  if (!tag) return null;

  const content = tag.match(/content=(["'])([\s\S]*?)\1/i);
  return content?.[2] ? decode(content[2].trim()) : null;
}

function firstOf(...values) {
  return values.find((v) => v !== null && v !== undefined && v !== "") ?? null;
}

function decode(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

// Most shops publish a Product block in JSON-LD, which is more reliable than
// guessing at price text in the markup.
function fromJsonLd(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  for (const [, raw] of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      continue;
    }

    const nodes = Array.isArray(parsed)
      ? parsed
      : parsed["@graph"] ?? [parsed];

    for (const node of nodes) {
      if (!node || node["@type"] !== "Product") continue;

      const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
      const image = Array.isArray(node.image) ? node.image[0] : node.image;

      return {
        name: typeof node.name === "string" ? node.name : null,
        brand:
          typeof node.brand === "string"
            ? node.brand
            : (node.brand?.name ?? null),
        price: offers?.price ? String(offers.price) : null,
        currency: offers?.priceCurrency ?? null,
        image: typeof image === "string" ? image : (image?.url ?? null),
      };
    }
  }
  return {};
}

const BUSINESS_TYPES = [
  "LocalBusiness",
  "HealthClub",
  "ExerciseGym",
  "SportsActivityLocation",
  "SportsClub",
  "DaySpa",
  "HealthAndBeautyBusiness",
  "Organization",
];

function nodesOf(parsed) {
  const nodes = Array.isArray(parsed) ? parsed : (parsed["@graph"] ?? [parsed]);
  return nodes.filter(Boolean);
}

// A business's own site often publishes its address, phone and hours as
// structured data, which is exactly what a Maps link can't give us.
function businessFromJsonLd(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  for (const [, raw] of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      continue;
    }

    for (const node of nodesOf(parsed)) {
      const types = [node["@type"]].flat().filter(Boolean);
      if (!types.some((t) => BUSINESS_TYPES.includes(t))) continue;

      const addr = node.address;
      const address =
        typeof addr === "string"
          ? addr
          : addr
            ? [
                addr.streetAddress,
                addr.addressLocality,
                addr.addressRegion,
                addr.postalCode,
              ]
                .filter(Boolean)
                .join(", ")
            : null;

      const hours = node.openingHours
        ? [node.openingHours].flat().join(", ")
        : Array.isArray(node.openingHoursSpecification)
          ? node.openingHoursSpecification
              .map((s) => {
                const days = [s.dayOfWeek]
                  .flat()
                  .filter(Boolean)
                  .map((d) => String(d).split("/").pop().slice(0, 2))
                  .join(",");
                return s.opens && s.closes
                  ? `${days} ${s.opens}-${s.closes}`
                  : null;
              })
              .filter(Boolean)
              .join("; ")
          : null;

      const image = Array.isArray(node.image) ? node.image[0] : node.image;

      return {
        name: typeof node.name === "string" ? node.name : null,
        address: address || null,
        area: typeof addr === "object" ? (addr?.addressLocality ?? null) : null,
        phone: node.telephone ?? null,
        timings: hours || null,
        image: typeof image === "string" ? image : (image?.url ?? null),
        lat: node.geo?.latitude ? Number(node.geo.latitude) : null,
        lon: node.geo?.longitude ? Number(node.geo.longitude) : null,
      };
    }
  }
  return {};
}

function textOf(html) {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

// Hardly any gym site publishes structured business data, but most put a
// phone number and an address somewhere on the page. These are the fallbacks.
function phoneFromPage(html) {
  // A tel: link is the strongest signal — it's a number someone meant to be called.
  const tel = html.match(/href=["']tel:([^"']+)["']/i)?.[1];
  if (tel) {
    const digits = tel.replace(/[^\d+]/g, "");
    if (digits.replace(/\D/g, "").length >= 10) return digits;
  }

  const text = textOf(html);
  // Indian mobile numbers start 6-9; require a +91 or a nearby cue word so we
  // don't pick up a random ten digit number.
  const cued = text.match(
    /(?:phone|call|contact|mobile|whatsapp|tel)[^0-9+]{0,20}((?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5})/i
  );
  if (cued) return cued[1].replace(/\s|-/g, "");

  const plus91 = text.match(/\+91[\s-]?([6-9]\d{4}[\s-]?\d{5})/);
  if (plus91) return `+91${plus91[1].replace(/\s|-/g, "")}`;

  // No cue word and no country code: only trust it when the page contains a
  // single candidate, otherwise we'd be picking one number out of many.
  const candidates = new Set(
    (text.match(/(?<!\d)[6-9]\d{9}(?!\d)/g) ?? []).map((n) => n)
  );
  return candidates.size === 1 ? [...candidates][0] : null;
}

function addressFromPage(html) {
  const text = textOf(html);
  // An Indian postal code anchors the line that is most likely an address.
  const match = text.match(/([A-Z][^.;|]{15,110}?\b\d{6}\b)/);
  if (!match) return null;

  const candidate = match[1].trim();
  return /\d/.test(candidate) ? candidate : null;
}

export async function fetchPlaceMeta(rawUrl) {
  const { html, host, url } = await loadPage(rawUrl);
  const found = businessFromJsonLd(html);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  return {
    name: firstOf(
      found.name,
      metaContent(html, "og:site_name"),
      metaContent(html, "og:title"),
      title ? decode(title.trim()) : null
    ),
    address: firstOf(found.address, addressFromPage(html)),
    area: found.area ?? null,
    phone: firstOf(found.phone, phoneFromPage(html)),
    timings: found.timings ?? null,
    image: firstOf(found.image, metaContent(html, "og:image")),
    lat: Number.isFinite(found.lat) ? found.lat : null,
    lon: Number.isFinite(found.lon) ? found.lon : null,
    website: url,
    source: host,
  };
}

async function loadPage(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("That doesn't look like a web address");

  const host = new URL(url).hostname;
  // Admin-only, but don't let it be pointed at internal addresses.
  if (/^(localhost$|127\.|10\.|192\.168\.|169\.254\.|\[?::1)/i.test(host)) {
    throw new Error("That address isn't allowed");
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      // Some sites serve a stripped page to anything that doesn't look like a
      // real browser, and the stripped version has no metadata in it.
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`The site returned ${res.status}`);
  return { html: (await res.text()).slice(0, 1500000), host, url };
}

export async function fetchProductMeta(rawUrl) {
  const { html, host, url } = await loadPage(rawUrl);
  const jsonLd = fromJsonLd(html);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  const name = firstOf(
    jsonLd.name,
    metaContent(html, "og:title"),
    metaContent(html, "twitter:title"),
    title ? decode(title.trim()) : null
  );

  const image = firstOf(
    jsonLd.image,
    metaContent(html, "og:image"),
    metaContent(html, "twitter:image")
  );

  const brand = firstOf(
    jsonLd.brand,
    metaContent(html, "og:site_name"),
    host.replace(/^www\./, "").split(".")[0]
  );

  const rawPrice = firstOf(
    jsonLd.price,
    metaContent(html, "product:price:amount"),
    metaContent(html, "og:price:amount")
  );

  const price = rawPrice
    ? `₹${Number(rawPrice).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}`
    : null;

  return {
    name,
    brand,
    price,
    image: image ? normalizeUrl(image) : null,
    buy_url: url,
  };
}
