"use client";
import { useEffect } from "react";

export default function Redirect() {
  useEffect(() => {
    const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || "https://app.smartkidz.app";
    window.location.replace(appOrigin + "/signup");
  }, []);
  return null;
}
