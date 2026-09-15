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

export async function fetchProductMeta(rawUrl) {
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
      // Some shops serve a stripped page to anything that doesn't look like a
      // real browser, and the stripped version has no metadata in it.
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`The site returned ${res.status}`);
  const html = (await res.text()).slice(0, 1500000);

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
