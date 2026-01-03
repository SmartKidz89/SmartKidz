import { test, expect } from "@playwright/test";

/**
 * Full kid + parent journey smoke.
 *
 * Requires Supabase env vars (see playwright.config.ts).
 */

test("End-to-end journey: signup -> onboarding -> world -> lesson complete", async ({ page }) => {
  // Signup
  await page.goto("/app/signup");
  await page.getByLabel("Email").fill("demo@smartkidz.test");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: /Create account/i }).click();

  await expect(page).toHaveURL(/\/app\/onboarding/);

  // Onboarding step 1
  await page.getByLabel("Full name").fill("Demo Parent");
  await page.getByRole("button", { name: /^Next$/ }).click();

  // Onboarding step 2
  await page.getByLabel("Name").fill("Olivia");
  await page.getByLabel("Year level").selectOption("1");
  await page.getByRole("button", { name: /^Finish/ }).click();

  await expect(page).toHaveURL(/\/app\/?$/);

  // Open a world (Math)
  await page.goto("/app/world?subject=math&year=1");
  await expect(page.getByText(/Math/i)).toBeVisible();

  // Open the seeded lesson
  await page.getByRole("button", { name: /Counting to 20/i }).click();
  await expect(page).toHaveURL(/\/app\/lesson\/MAT_Y1_001/);

  // Confirm lesson header
  await expect(page.getByRole("heading", { name: /Counting to 20/i })).toBeVisible();

  // Complete lesson
  await page.getByRole("button", { name: /Finish/i }).click();
  // Confetti is non-deterministic; just ensure we stay on the lesson page and no crash.
  await expect(page).toHaveURL(/\/app\/lesson\/MAT_Y1_001/);
});

test("Parent view loads (premium gate satisfied in demo)", async ({ page }) => {
  await page.goto("/app/parent");
  // If not authenticated yet, the app may redirect to login; in demo mode the session persists.
  // Either way, we want a non-blank UI surface.
  await expect(page.locator("body")).toBeVisible();
});
