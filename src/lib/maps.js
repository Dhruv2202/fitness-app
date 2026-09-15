// Pulls a location out of a Google Maps link, so coordinates never have to be
// copied by hand.

function decodeName(raw) {
  try {
    return decodeURIComponent(raw.replace(/\+/g, " ")).trim() || null;
  } catch {
    return null;
  }
}

export function parseMapsUrl(url) {
  const result = { lat: null, lon: null, name: null };

  // !3d/!4d is the pin itself. The @lat,lng that usually appears earlier is
  // only where the map happens to be centred, so prefer the pin when present.
  const pin = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const centre = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const query = url.match(/[?&](?:q|query|daddr)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

  const coords = pin ?? query ?? centre;
  if (coords) {
    const lat = Number(coords[1]);
    const lon = Number(coords[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      result.lat = lat;
      result.lon = lon;
    }
  }

  const named = url.match(/\/maps\/place\/([^/@?]+)/);
  if (named) result.name = decodeName(named[1]);

  return result;
}

// Shortened links (maps.app.goo.gl) carry nothing useful until they're followed.
export async function resolveMapsUrl(url) {
  if (!/goo\.gl|maps\.app/.test(url)) return url;

  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      },
    });
    return res.url || url;
  } catch {
    return url;
  }
}
