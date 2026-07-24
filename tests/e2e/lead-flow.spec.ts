import { test, expect } from "@playwright/test";

// Happy path: submit a lead on the public form -> log in as the seeded
// admin -> confirm it's visible and searchable -> toggle its status ->
// confirm it persists after reload. Requires a real database with an admin
// user seeded via `npm run db:seed` (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD).
test("lead submission to status change", async ({ page }) => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  test.skip(!adminEmail || !adminPassword, "SEED_ADMIN_EMAIL/PASSWORD not set");

  const uniqueName = `Playwright Test ${Date.now()}`;

  await page.goto("/");
  await page.getByLabel("Name").fill(uniqueName);
  await page.getByLabel("Email").fill(`playwright-${Date.now()}@example.com`);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "$5k – $15k" }).click();
  await page
    .getByLabel("Tell us about the project")
    .fill("Automated end-to-end test submission for LeadDesk.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Message sent")).toBeVisible({ timeout: 10_000 });

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });

  await page.getByPlaceholder("Search name, email, message…").fill(uniqueName);
  const row = page.getByRole("row", { name: new RegExp(uniqueName) });
  await expect(row).toBeVisible({ timeout: 10_000 });

  await row.getByRole("radio", { name: "Contacted" }).click();
  await expect(row.getByRole("radio", { name: "Contacted", checked: true })).toBeVisible();

  await page.reload();
  await page.getByPlaceholder("Search name, email, message…").fill(uniqueName);
  await expect(
    page.getByRole("row", { name: new RegExp(uniqueName) }).getByRole("radio", { name: "Contacted", checked: true }),
  ).toBeVisible({ timeout: 10_000 });
});
