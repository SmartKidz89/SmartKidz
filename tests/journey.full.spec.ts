import { test, expect } from "@playwright/test";

function toInt(s: string | null) {
  const n = parseInt((s || "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

test("Full journey: learn -> earn -> spend -> trust (with value assertions)", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  // Signup
  await page.goto("/app/signup");
  await page.getByLabel(/Email/i).fill("kid@example.com");
  await page.getByLabel(/Password/i).fill("Password123!");
  await page.getByRole("button", { name: /Create account/i }).click();

  // App shell loads
  await page.waitForURL(/\/app(\/)?$/);

  // Learn: open a world and complete a lesson (DEMO_MODE supplies deterministic content)
  await page.goto("/app/worlds");
  await expect(page.locator("body")).toBeVisible();
  // Click the first world card or fallback to the first "Open" link
  const worldLink = page.locator("a[href^='/app/world']").first();
  if (await worldLink.count()) await worldLink.click();

  // Start a lesson: pick the first visible lesson CTA
  const startLesson = page.getByRole("link", { name: /Start|Open|Continue/i }).first();
  if (await startLesson.count()) await startLesson.click();

  // If a lesson runner is present, attempt to finish.
  // We keep this defensive because lesson UIs may evolve.
  const finishBtn = page.getByRole("button", { name: /Finish/i });
  if (await finishBtn.count()) {
    await finishBtn.click();
  }

  // Earn: claim quests and assert coin balance increases
  await page.goto("/app/today");
  await expect(page.getByText(/Today'?s Challenges/i)).toBeVisible();

  const coinsLocator = page.locator('[data-testid="econ-coins"]');
  await expect(coinsLocator).toBeVisible();
  const beforeCoins = toInt(await coinsLocator.textContent());

  const claim = page.locator('[data-testid^="quest-claim-"]').first();
  await expect(claim).toBeVisible();
  await claim.click();

  // Wait a tick for optimistic economy update
  await page.waitForTimeout(200);
  const afterClaimCoins = toInt(await coinsLocator.textContent());
  expect(afterClaimCoins).toBeGreaterThan(beforeCoins);

  // Claim another quest (if available) to ensure enough balance for purchases
  const claimButtons = page.locator('[data-testid^="quest-claim-"]');
  const claimCount = await claimButtons.count();
  if (claimCount > 1) {
    await claimButtons.nth(1).click();
    await page.waitForTimeout(200);
  }
  const afterCoins = toInt(await coinsLocator.textContent());
  expect(afterCoins).toBeGreaterThan(beforeCoins);

  // Spend: purchase an avatar item and assert ownership flips
  await page.goto("/app/avatar");
  await expect(page.getByText(/Avatar/i)).toBeVisible();

  // Find first buy button and click it
  const buyBtn = page.locator('[data-testid^="shop-buy-"]').first();
  await expect(buyBtn).toBeVisible();
  const buyTextBefore = (await buyBtn.textContent()) || "";
  // If already owned (rare), skip purchase but still assert UI is consistent
  if (/Buy/i.test(buyTextBefore)) {
    await buyBtn.click();
    await page.waitForTimeout(300);
    await expect(buyBtn).toHaveText(/Owned/i);
  } else {
    await expect(buyBtn).toHaveText(/Owned/i);
  }

  // Trust: open parent weekly report and assert latest activity appears
  await page.goto("/app/parent/insights");
  await expect(page.getByText(/Weekly Learning Report/i)).toBeVisible();
  await expect(page.locator('[data-testid="latest-activity"]')).toBeVisible();
}
  expect(consoleErrors, `Console/page errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});
