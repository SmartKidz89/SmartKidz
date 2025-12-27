import { test, expect } from "@playwright/test";

test.describe("SmartKidz smoke routes", () => {
  const routes = [
    "/",                    // redirects to /marketing
    "/marketing",
    "/pricing",
    "/features",
    "/curriculum",
    "/login",
    "/signup",
    "/worlds",
    "/app",                 // should resolve or redirect
    "/app/login",
    "/app/signup",
    "/app/today",
    "/app/rewards",
    "/app/avatar",
    "/app/menu",
    "/app/parent",
    "/app/parent/insights",
  ];

  for (const route of routes) {
    test(`loads ${route}`, async ({ page }) => {
      const res = await page.goto(route, { waitUntil: "domcontentloaded" });
      // page.goto returns null on client-side navigation; handle that gracefully
      if (res) {
        expect(res.status(), `HTTP status for ${route}`).toBeLessThan(500);
      }
      await expect(page.locator("body")).toBeVisible();
      // basic guard against Next.js error overlay / 404 template
      const notFound = page.getByText(/404|not found/i);
      await expect(notFound).toHaveCount(0);
    });
  }

  test("navigation does not dead-end from marketing to app", async ({ page }) => {
    await page.goto("/marketing", { waitUntil: "domcontentloaded" });
    // Find the first CTA-like link pointing to /app or /app/login
    const cta = page.locator('a[href^="/app"]').first();
    if (await cta.count()) {
      await cta.click();
      await expect(page).toHaveURL(/\/app(\/login|\/signup|\/|\?|$)/);
    }
  });
});
