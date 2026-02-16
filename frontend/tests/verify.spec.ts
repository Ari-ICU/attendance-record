import { test, expect } from '@playwright/test';

test.describe('Face Verification Page', () => {
    test('should load the verification page and initialize the webcam', async ({ page }) => {
        // Navigate to the verify page
        await page.goto('/verify');

        // Check if the main header is visible
        await expect(page.locator('h1')).toContainText('Smart Attendance');

        // Check if the webcam component is rendered
        const video = page.locator('video');
        await expect(video).toBeVisible();

        // Check for the initialization status message in the bottom bar
        // It starts with 'Initializing Biometric modules...' or 'Ready for biometric scan'
        const statusText = page.locator('span:has-text("Initializing"), span:has-text("Ready"), span:has-text("Target")');
        await expect(statusText).toBeVisible();

        // Verify indicators are present
        await expect(page.getByText('Liveness:', { exact: false })).toBeVisible();
        await expect(page.getByText('Geofence:', { exact: false })).toBeVisible();
    });

    test('should switch modes between Check In and Check Out', async ({ page }) => {
        await page.goto('/verify');

        const checkOutBtn = page.getByRole('button', { name: 'Check Out' });
        await checkOutBtn.click();

        // Use a more specific locator for the header description to avoid strict mode violations
        const description = page.locator('header p');
        await expect(description).toContainText('check out');

        const checkInBtn = page.getByRole('button', { name: 'Check In' });
        await checkInBtn.click();
        await expect(description).toContainText('check in');
    });
});
