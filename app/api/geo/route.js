import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(req) {
  // Vercel / Cloudflare headers for country code (ISO 3166-1 alpha-2)
  const country = req.headers.get("x-vercel-ip-country") || 
                  req.headers.get("cf-ipcountry") || 
                  "AU"; // Default fallback
                  
  return NextResponse.json({ country: country.toUpperCase() });
}