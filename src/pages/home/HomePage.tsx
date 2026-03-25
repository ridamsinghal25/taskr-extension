import { Button } from "@/components/ui/button";
import {
  getWallpaperWithCache,
  type PexelsPhoto,
} from "@/services/pexelsWallpaper.services";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export function HomePage() {
  const [photo, setPhoto] = useState<PexelsPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const aliveRef = useRef(true);

  const loadWallpaper = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const { photo: next, nextRefreshAt } = await getWallpaperWithCache();
      if (!aliveRef.current) {
        return null;
      }
      setPhoto(next);
      if (!next && import.meta.env.VITE_PEXELS_API_KEY) {
        setError("No wallpaper returned from Pexels.");
      }
      return nextRefreshAt;
    } catch (e) {
      if (aliveRef.current) {
        setError((e as Error).message || "Could not load wallpaper.");
      }
      return null;
    } finally {
      if (aliveRef.current && !silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    let refreshTimer: number | undefined;

    const scheduleRefresh = (nextRefreshAt: number | null) => {
      if (nextRefreshAt == null || !aliveRef.current) return;
      const delay = Math.max(0, nextRefreshAt - Date.now());
      refreshTimer = window.setTimeout(async () => {
        if (!aliveRef.current) return;
        const nextAt = await loadWallpaper({ silent: true });
        scheduleRefresh(nextAt);
      }, delay) as unknown as number;
    };

    (async () => {
      const nextAt = await loadWallpaper();
      if (aliveRef.current) {
        scheduleRefresh(nextAt);
      }
    })();

    return () => {
      aliveRef.current = false;
      if (refreshTimer !== undefined) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [loadWallpaper]);

  const imageUrl = photo?.src.landscape ?? photo?.src.large2x ?? photo?.src.original;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={photo?.alt || "Wallpaper"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
          />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/25 via-background to-blue-950/40 dark:from-primary/20 dark:via-background dark:to-blue-950/60"
          aria-hidden
        />
      )}

      <div className="relative z-10 flex h-full flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin text-primary"
                aria-hidden
              />
              <span>Loading wallpaper…</span>
            </div>
          ) : null}
          {!loading && !import.meta.env.VITE_PEXELS_API_KEY ? (
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Add{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
                VITE_PEXELS_API_KEY
              </code>{" "}
              to your <code className="text-xs">.env</code> to show a Pexels
              background.
            </p>
          ) : null}
          {!loading && error ? (
            <p className="max-w-md text-center text-sm text-destructive">{error}</p>
          ) : null}

          <Button asChild size="lg" className="shadow-lg shadow-primary/20">
            <Link to="/workspace">Go to workspace</Link>
          </Button>
        </div>
      </div>

      {photo ? (
        <footer className="relative z-10 px-4 pb-4 text-center">
          <p className="text-xs text-muted-foreground drop-shadow-sm">
            Photo by{" "}
            <a
              href={photo.photographer_url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {photo.photographer}
            </a>{" "}
            on{" "}
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Pexels
            </a>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
