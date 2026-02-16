import { test, expect } from '@playwright/test';

test.describe('Security & System Integrity Protocol', () => {

    test.beforeEach(async ({ page }) => {
        // Authenticate as Admin before running tests
        await page.goto('/login');
        await page.fill('input[id="identifier"]', 'admin');
        await page.fill('input[id="password"]', 'SecurePassword123!');
        await page.click('button[type="submit"]');
        await expect(page.locator('header')).toContainText('admin', { timeout: 15000 });
    });

    test('Bypass Restriction: Geofence Enforcement', async ({ page }) => {
        await page.goto('/verify');

        // Check for toast message instead of UI element if it's strictly in a toast
        const toast = page.locator('.hot-toast-container'); // Common for react-hot-toast
        const restrictedText = page.locator('text=Location Access Denied').first();

        await expect(restrictedText).toBeVisible({ timeout: 15000 });

        // Biometric scan should be blocked
        await expect(page.locator('text=Liveness // PENDING')).toBeVisible();
    });

    test('Bypass Restriction: Dev-Only Location Bypass', async ({ page }) => {
        await page.goto('/verify');

        // Search for Dev Bypass more flexibly
        const bypassBtn = page.locator('button:has-text("Dev Bypass")');
        await expect(bypassBtn).toBeVisible({ timeout: 10000 });

        // Click Dev Bypass
        await bypassBtn.click();

        // Status should change for Geofence
        await expect(page.locator('text=LAT // 11.55')).toBeVisible({ timeout: 10000 });
    });

    test('System Integrity: Multi-Handshake Verification', async ({ page }) => {
        await page.goto('/verify');

        // Requirement 1: Identity Selection
        await expect(page.getByRole('heading', { name: 'Directory' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Employee Identity' })).toBeVisible();

        // Requirement 2: Scanner Hud Initialization
        await expect(page.locator('text=EAR //')).toBeVisible();
        await expect(page.locator('text=Liveness //')).toBeVisible();

        // Final state check: System should be in "Ready" state
        await expect(page.getByText('Ready for biometric scan').first()).toBeVisible();
    });

    test('Security Header Check', async ({ page }) => {
        const response = await page.goto('/dashboard');
        const headers = response?.headers();
        expect(headers?.['x-powered-by']).toBe('Next.js');
    });
});

test.describe('Dashboard System Navigation', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[id="identifier"]', 'admin');
        await page.fill('input[id="password"]', 'SecurePassword123!');
        await page.click('button[type="submit"]');
        await expect(page.locator('header')).toContainText('admin', { timeout: 15000 });
    });

    test('Records Page: Live Cambodia Time Implementation', async ({ page }) => {
        await page.goto('/dashboard/attendance/records');

        // Check for the Cambodia system time label
        await expect(page.locator('text=System Time:')).toBeVisible({ timeout: 10000 });

        // Check for "Attendance Vault" header
        await expect(page.getByRole('heading', { name: 'Attendance Vault' })).toBeVisible();
    });

    test('Analytics: Workforce Intelligence Dashboard', async ({ page }) => {
        await page.goto('/dashboard/reports/analytics');

        // Check for premium UI elements
        await expect(page.getByRole('heading', { name: 'Workforce Intelligence' })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=Neural Intelligence Active')).toBeVisible();

        // Integrity gauge check
        await expect(page.locator('text=Global Integrity')).toBeVisible();
    });
});
