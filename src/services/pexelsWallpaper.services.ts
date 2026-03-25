/** Pexels API — set `VITE_PEXELS_API_KEY` in `.env` (see https://www.pexels.com/api/) */

const STORAGE_KEY = "taskr_pexels_wallpaper_v1";
const TTL_MS = 60 * 60 * 1000;

export const PEXELS_WALLPAPER_QUERIES = [
  "wide landscape nature lake mountains sky",
  "scenic nature open field mountains lake",
  "nature wide valley sky lake forest",
  "open landscape mountains river sky scenic",
  "wide mountain lake reflection sky",
  "open sky valley landscape nature",
  "scenic mountains lake horizon sky",
  "nature wide open field sky clouds",
  "landscape mountains river valley wide",
  "serene lake mountains sky reflection",
  "wide alpine landscape lake mountains",
  "open meadow mountains sky landscape",
  "nature valley wide sky scenic view",
  "mountain lake wide angle scenic",
  "open horizon mountains lake nature",
  "calm lake forest mountains sky",
  "wide scenic river valley mountains",
  "nature open space sky mountains",
  "landscape wide horizon lake sky",
  "peaceful lake mountains reflection sky",
  "open countryside sky wide landscape",
  "mountain range lake wide scenic",
  "nature landscape wide valley sky",
  "clear sky mountains lake scenic",
  "wide landscape river forest mountains",
  "open field nature mountains sky",
  "serene landscape lake sky mountains",
  "nature scenic wide angle mountains",
  "open valley landscape sky clouds",
  "mountains lake horizon wide view",
  "wide forest lake mountains scenic",
  "nature wide sky clouds landscape",
  "open nature landscape lake horizon",
  "scenic wide mountains valley lake",
  "mountain lake clear sky wide",
  "nature landscape horizon mountains lake",
  "open sky forest mountains landscape",
  "wide scenic nature valley river",
  "mountains lake wide perspective sky",
  "open landscape valley sky mountains",
  "calm nature lake mountains horizon",
  "wide panoramic mountains lake sky",
  "open scenic valley nature landscape",
  "nature lake sky wide composition",
  "mountains horizon wide landscape sky",
  "open field mountains scenic sky",
  "wide nature river mountains valley",
  "serene wide landscape lake sky",
  "nature mountains sky horizon wide",
  "open sky valley lake mountains",
  "wide scenic forest lake mountains",
  "nature horizon lake mountains sky",
  "open nature mountains lake view",
  "wide sky landscape mountains river",
  "mountain valley lake wide horizon",
  "nature wide scenic open sky",
  "open landscape lake mountains horizon",
  "wide peaceful nature mountains lake",
  "sky mountains lake wide scenery",
  "open forest mountains sky landscape",
  "wide valley mountains lake sky",
  "nature wide horizon landscape sky",
  "open scenic mountains lake sky",
  "wide nature lake forest mountains",
  "mountains sky wide landscape view",
  "open lake mountains scenic horizon",
  "wide nature sky clouds mountains",
  "landscape open mountains lake sky",
  "wide scenic horizon lake mountains",
  "nature wide composition mountains sky",
  "open nature sky lake mountains",
  "wide field mountains sky landscape",
  "serene mountains lake wide horizon",
  "open wide landscape sky mountains",
  "nature valley mountains lake wide",
  "wide scenic sky mountains lake",
  "open horizon nature mountains lake",
  "wide landscape forest sky mountains",
  "nature lake mountains wide horizon",
  "open scenic lake mountains sky",
  "wide nature valley mountains sky",
  "open sky mountains lake scenic",
  "wide mountains lake nature view",
  "nature open valley sky mountains",
  "wide landscape lake horizon mountains",
  "open scenic sky mountains lake",
  "wide nature forest mountains sky",
  "open horizon lake mountains scenic",
  "wide sky mountains landscape nature",
  "nature mountains lake wide scenery",
  "open valley mountains lake sky",
  "wide scenic landscape mountains sky",
  "open lake sky mountains landscape",
  "wide nature mountains horizon sky",
  "open sky lake mountains view",
  "wide landscape mountains lake nature",
  "open nature wide sky mountains",
  "wide horizon mountains lake sky"
] as const;

export type PexelsPhoto = {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  url: string;
  src: {
    landscape: string;
    large2x: string;
    original: string;
  };
};

type PexelsSearchResponse = {
  photos: PexelsPhoto[];
};

type StoredWallpaper = {
  photo: PexelsPhoto;
  expiresAt: number;
  queryIndex: number;
};

function readStored(): StoredWallpaper | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredWallpaper;
    if (
      !parsed?.photo ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.queryIndex !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(entry: StoredWallpaper): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

async function fetchWallpaperByQuery(query: string): Promise<PexelsPhoto | null> {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;
  if (!apiKey?.trim()) {
    return null;
  }

  const params = new URLSearchParams({
    query,
    orientation: "landscape",
    size: "large",
    per_page: "1",
  });

  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: {
      Authorization: apiKey.trim(),
    },
  });

  if (!res.ok) {
    throw new Error(`Pexels request failed (${res.status})`);
  }

  const data = (await res.json()) as PexelsSearchResponse;
  return data.photos?.[0] ?? null;
}

export type WallpaperCacheResult = {
  photo: PexelsPhoto | null;
  /** Timestamp when the current cache entry expires; use for scheduling a refetch. */
  nextRefreshAt: number | null;
};

/**
 * Returns a cached wallpaper for up to 1 hour, then refetches using the next query in
 * {@link PEXELS_WALLPAPER_QUERIES}.
 */
export async function getWallpaperWithCache(): Promise<WallpaperCacheResult> {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;
  if (!apiKey?.trim()) {
    return { photo: null, nextRefreshAt: null };
  }

  const stored = readStored();
  if (stored && Date.now() < stored.expiresAt) {
    return { photo: stored.photo, nextRefreshAt: stored.expiresAt };
  }

  const nextIndex = stored
    ? (stored.queryIndex + 1) % PEXELS_WALLPAPER_QUERIES.length
    : 0;

  const query = PEXELS_WALLPAPER_QUERIES[nextIndex];
  const photo = await fetchWallpaperByQuery(query);

  if (!photo) {
    return { photo: null, nextRefreshAt: null };
  }

  const expiresAt = Date.now() + TTL_MS;
  writeStored({ photo, expiresAt, queryIndex: nextIndex });
  return { photo, nextRefreshAt: expiresAt };
}
