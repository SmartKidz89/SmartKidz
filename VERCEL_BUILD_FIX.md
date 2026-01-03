# Vercel Build Fix: Next.js SWC lockfile warning

If Vercel previously failed with:
"Found lockfile missing swc dependencies"

This project intentionally omits `package-lock.json` so Vercel can resolve the correct
platform-specific `@next/swc-*` binaries during `npm install` on the build machine.

If you prefer to use a lockfile:
1. Use Node 20.x locally
2. Run `npm install`
3. Run `npm run build`
4. Commit the regenerated `package-lock.json`
