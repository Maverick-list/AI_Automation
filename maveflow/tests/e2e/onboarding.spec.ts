import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test("Should navigate through the 4-step wizard", async ({ page }) => {
    // Navigate to Onboarding
    await page.goto("/onboarding");

    // Step 1
    await expect(page.locator("h2")).toContainText("Welcome to MaveFlow");
    await page.click("button:has-text('Connect Google Account')");

    // Step 2
    await expect(page.locator("h2")).toContainText("Which services will you automate?");
    await page.click("text=Gmail"); // Toggle a service off/on
    await page.click("button:has-text('Continue')");

    // Step 3
    await expect(page.locator("h2")).toContainText("Create your first automation");
    await page.click("text=Forward VIP Emails");
    await page.click("button:has-text('Setup Template')");

    // Step 4
    await expect(page.locator("h2")).toContainText("You're all set!");
    
    // Final redirect
    await page.click("button:has-text('Go to Dashboard')");
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
