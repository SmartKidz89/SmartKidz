import React, { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // Prefer the app router experience if present.
    if (typeof window !== "undefined") {
      window.location.replace("/app");
    }
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>SmartKidz</h1>
      <p style={{ marginTop: 12 }}>Redirecting…</p>
    </main>
  );
}
