"use client";

import { useEffect } from "react";

// Catches errors that escape the root layout itself - including a failed
// chunk load right as the app shell mounts. A stale chunk almost always
// means a newer deploy replaced the file this tab still expects, so
// reloading once is enough to pick up the fresh build. Needs its own
// <html>/<body> because it replaces the whole root layout, not just a
// page inside it.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error.name === "ChunkLoadError" ||
    /loading chunk|failed to load chunk/i.test(error.message);

  useEffect(() => {
    if (isChunkError) {
      window.location.reload();
    }
  }, [isChunkError]);

  if (isChunkError) {
    return (
      <html lang="de">
        <body
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            background: "#f6f3f1",
            color: "#5e5357",
          }}
        >
          <p>Wird aktualisiert…</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="de">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "sans-serif",
          background: "#f6f3f1",
          color: "#5e5357",
        }}
      >
        <p>Etwas ist schiefgelaufen.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            borderRadius: 18,
            background: "#c08a95",
            color: "white",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
