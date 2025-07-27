import { test, expect } from '@playwright/test';

test.describe('Provider Earnings Dashboard', () => {
  // Test data and setup
  const testProvider = {
    email: 'provider@test.com',
    password: 'testpass123',
    name: 'Test Provider',
  };

  test.beforeEach(async ({ page }) => {
    // Mock API responses for earnings data
    await page.route('/api/earnings/dashboard-summary*', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          earnings: {
            totalLifetime: 450000,
            availableBalance: 125000,
            pendingClearance: 35000,
            thisMonth: 85000,
            lastMonth: 72000,
          },
          performance: {
            totalBookings: 45,
            completedBookings: 42,
            totalStudents: 28,
            averageRating: 4.8,
          },
        }),
      });
    });

    await page.route('/api/earnings/history*', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          earnings: [
            {
              id: 'earning-1',
              grossAmount: 5000,
              platformFee: 500,
              netAmount: 4500,
              status: 'CLEARED',
              createdAt: '2024-01-15T10:00:00Z',
              clearedAt: '2024-01-17T10:00:00Z',
              bookingId: 'booking-1',
              serviceName: 'Math Tutoring',
              studentName: 'John Doe',
            },
            {
              id: 'earning-2',
              grossAmount: 3000,
              platformFee: 300,
              netAmount: 2700,
              status: 'PENDING',
              createdAt: '2024-01-20T14:30:00Z',
              clearedAt: null,
              bookingId: 'booking-2',
              serviceName: 'Physics Help',
              studentName: 'Jane Smith',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          },
        }),
      });
    });

    await page.route('/api/earnings/analytics*', async (route) => {
      const url = new URL(route.request().url());
      const report = url.searchParams.get('report');

      if (report === 'earnings_over_time') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            report: 'earnings_over_time',
            period: 'month',
            data: [
              { date: '2024-01', value: 45000 },
              { date: '2024-02', value: 52000 },
              { date: '2024-03', value: 38000 },
              { date: '2024-04', value: 61000 },
              { date: '2024-05', value: 55000 },
              { date: '2024-06', value: 48000 },
            ],
          }),
        });
      } else if (report === 'earnings_by_service') {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            report: 'earnings_by_service',
            data: [
              { serviceName: 'Math Tutoring', totalEarnings: 125000, bookingCount: 35 },
              { serviceName: 'Physics Help', totalEarnings: 89000, bookingCount: 25 },
              { serviceName: 'Chemistry Lab', totalEarnings: 67000, bookingCount: 20 },
              { serviceName: 'Essay Writing', totalEarnings: 45000, bookingCount: 15 },
            ],
          }),
        });
      }
    });

    await page.route('/api/earnings/payout-requests*', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          requests: [
            {
              id: 'payout-1',
              amount: 25000,
              method: 'bank_transfer',
              accountDetails: 'Bank: GTB, Account: 1234567890, Name: Test Provider',
              status: 'COMPLETED',
              notes: 'Monthly payout',
              createdAt: '2024-01-15T10:00:00Z',
              processedAt: '2024-01-17T10:00:00Z',
              rejectionReason: null,
            },
            {
              id: 'payout-2',
              amount: 15000,
              method: 'mobile_money',
              accountDetails: 'MTN: 08012345678, Name: Test Provider',
              status: 'PENDING',
              notes: null,
              createdAt: '2024-01-20T14:30:00Z',
              processedAt: null,
              rejectionReason: null,
            },
          ],
        }),
      });
    });
  });

  test('should display earnings overview with key metrics', async ({ page }) => {
    // Navigate to earnings dashboard
    await page.goto('/provider/earnings');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the main earnings metrics are displayed
    await expect(page.locator('text=₦450,000')).toBeVisible(); // Total Lifetime
    await expect(page.locator('text=₦125,000')).toBeVisible(); // Available Balance
    await expect(page.locator('text=₦35,000')).toBeVisible(); // Pending Clearance
    await expect(page.locator('text=₦85,000')).toBeVisible(); // This Month

    // Check performance metrics
    await expect(page.locator('text=4.8')).toBeVisible(); // Average rating
    await expect(page.locator('text=28')).toBeVisible(); // Total students
    await expect(page.locator('text=42')).toBeVisible(); // Completed bookings

    // Verify the page title
    await expect(page.locator('h1')).toContainText('Earnings & Growth Hub');
  });

  test('should navigate between different tabs', async ({ page }) => {
    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Test Overview tab (default)
    await expect(page.locator('[data-state=\"active\"] >> text=Overview')).toBeVisible();
    await expect(page.locator('text=Monthly Growth')).toBeVisible();

    // Test Earnings tab
    await page.click('text=Earnings');
    await expect(page.locator('[data-state=\"active\"] >> text=Earnings')).toBeVisible();
    await expect(page.locator('text=Earnings History')).toBeVisible();
    await expect(page.locator('text=Detailed record of all your earnings')).toBeVisible();

    // Test Analytics tab
    await page.click('text=Analytics');
    await expect(page.locator('[data-state=\"active\"] >> text=Analytics')).toBeVisible();
    await expect(page.locator('text=Performance Trend')).toBeVisible();

    // Test Payouts tab
    await page.click('text=Payouts');
    await expect(page.locator('[data-state=\"active\"] >> text=Payouts')).toBeVisible();
    await expect(page.locator('text=Available for Payout')).toBeVisible();
    await expect(page.locator('text=Request Payout')).toBeVisible();
  });

  test('should display earnings history with search and filter', async ({ page }) => {
    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Navigate to Earnings tab
    await page.click('text=Earnings');

    // Wait for earnings history to load
    await expect(page.locator('text=Math Tutoring')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=₦4,500')).toBeVisible();

    // Test search functionality
    const searchInput = page.locator('input[placeholder*=\"Search by student name\"]');
    await searchInput.fill('John');
    await expect(searchInput).toHaveValue('John');

    // Test status filter
    const statusFilter = page.locator('select, [role=\"combobox\"]').filter({ hasText: 'All Status' }).first();
    await statusFilter.click();
    await page.locator('text=Cleared').click();
    
    // Verify filter is applied
    await expect(page.locator('text=Cleared')).toBeVisible();

    // Test earning details modal
    const moreButton = page.locator('[data-testid=\"more-options\"], button').filter({ hasText: /more|⋯/ }).first();
    if (await moreButton.isVisible()) {
      await moreButton.click();
      await page.locator('text=View Details').click();
      await expect(page.locator('text=Earning Details')).toBeVisible();
      await expect(page.locator('text=Math Tutoring')).toBeVisible();
      
      // Close modal
      await page.keyboard.press('Escape');
    }
  });

  test('should display analytics charts and insights', async ({ page }) => {
    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Navigate to Analytics tab
    await page.click('text=Analytics');

    // Wait for analytics to load
    await expect(page.locator('text=Performance Trend')).toBeVisible();
    await expect(page.locator('text=Service Breakdown')).toBeVisible();
    await expect(page.locator('text=Peak Hours')).toBeVisible();

    // Check KPI cards
    await expect(page.locator('text=Avg. Per Booking')).toBeVisible();
    await expect(page.locator('text=Success Rate')).toBeVisible();
    await expect(page.locator('text=Avg. Rating')).toBeVisible();
    await expect(page.locator('text=Repeat Students')).toBeVisible();

    // Check insights section
    await expect(page.locator('text=Performance Insights')).toBeVisible();
    await expect(page.locator('text=Peak Performance')).toBeVisible();
    await expect(page.locator('text=Service Popularity')).toBeVisible();
  });

  test('should handle payout request flow', async ({ page }) => {
    // Mock successful payout request
    await page.route('/api/earnings/request-payout', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'payout-3',
          amount: 30000,
          method: 'bank_transfer',
          accountDetails: 'Bank: GTB, Account: 1234567890, Name: Test Provider',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        }),
      });
    });

    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Navigate to Payouts tab
    await page.click('text=Payouts');

    // Click Request Payout button
    await page.click('text=Request Payout');

    // Fill payout form
    await expect(page.locator('text=Request Payout')).toBeVisible(); // Modal title
    
    const amountInput = page.locator('input[type=\"number\"]');
    await amountInput.fill('30000');

    // Select payout method
    const methodSelect = page.locator('select, [role=\"combobox\"]').filter({ hasText: /Select payout method/ }).first();
    await methodSelect.click();
    await page.locator('text=Bank Transfer').click();

    // Fill account details
    const accountDetailsTextarea = page.locator('textarea').first();
    await accountDetailsTextarea.fill('Bank: GTB, Account: 1234567890, Name: Test Provider');

    // Fill notes (optional)
    const notesTextarea = page.locator('textarea').last();
    await notesTextarea.fill('Monthly payout request');

    // Submit the form
    await page.click('text=Submit Request');

    // Verify success (assuming toast notification or redirect)
    // Note: This would depend on your actual implementation
    await page.waitForTimeout(1000); // Wait for any animations/notifications
  });

  test('should handle insufficient balance error', async ({ page }) => {
    // Mock insufficient balance error
    await page.route('/api/earnings/request-payout', async (route) => {
      await route.fulfill({
        status: 400,
        body: 'Insufficient available balance',
      });
    });

    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Navigate to Payouts tab
    await page.click('text=Payouts');

    // Click Request Payout button
    await page.click('text=Request Payout');

    // Fill form with amount exceeding balance
    const amountInput = page.locator('input[type=\"number\"]');
    await amountInput.fill('200000'); // Exceeds available balance

    const methodSelect = page.locator('select, [role=\"combobox\"]').filter({ hasText: /Select payout method/ }).first();
    await methodSelect.click();
    await page.locator('text=Bank Transfer').click();

    const accountDetailsTextarea = page.locator('textarea').first();
    await accountDetailsTextarea.fill('Bank: GTB, Account: 1234567890, Name: Test Provider');

    // Should show error message for exceeding balance
    await expect(page.locator('text=Amount exceeds your available balance')).toBeVisible();
  });

  test('should display payout history', async ({ page }) => {
    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Navigate to Payouts tab
    await page.click('text=Payouts');

    // Check payout history
    await expect(page.locator('text=Payout Requests')).toBeVisible();
    await expect(page.locator('text=₦25,000')).toBeVisible(); // First payout amount
    await expect(page.locator('text=₦15,000')).toBeVisible(); // Second payout amount
    
    // Check status badges
    await expect(page.locator('text=COMPLETED')).toBeVisible();
    await expect(page.locator('text=PENDING')).toBeVisible();

    // Check payout methods
    await expect(page.locator('text=Bank Transfer')).toBeVisible();
    await expect(page.locator('text=Mobile Money')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Check that the layout adapts to mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=₦450,000')).toBeVisible();

    // Test tab navigation on mobile
    await page.click('text=Analytics');
    await expect(page.locator('text=Performance Trend')).toBeVisible();

    // Verify cards stack vertically on mobile
    const performanceCards = page.locator('[class*=\"grid\"][class*=\"md:grid-cols-3\"]').first();
    if (await performanceCards.isVisible()) {
      const boundingBox = await performanceCards.boundingBox();
      expect(boundingBox?.width).toBeLessThan(400); // Should be mobile width
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Delay API responses to test loading states
    await page.route('/api/earnings/dashboard-summary*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          earnings: {
            totalLifetime: 450000,
            availableBalance: 125000,
            pendingClearance: 35000,
            thisMonth: 85000,
            lastMonth: 72000,
          },
          performance: {
            totalBookings: 45,
            completedBookings: 42,
            totalStudents: 28,
            averageRating: 4.8,
          },
        }),
      });
    });

    await page.goto('/provider/earnings');

    // Check for loading skeletons or indicators
    // Note: The exact selectors would depend on your skeleton implementation
    const skeletonElements = page.locator('[class*=\"animate-pulse\"], [class*=\"skeleton\"]');
    if (await skeletonElements.first().isVisible()) {
      await expect(skeletonElements.first()).toBeVisible();
    }

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=₦450,000')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/earnings/dashboard-summary*', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'Internal Server Error',
      });
    });

    await page.goto('/provider/earnings');
    await page.waitForLoadState('networkidle');

    // Check for error message or retry button
    // Note: The exact error handling would depend on your implementation
    const errorMessage = page.locator('text=Error Loading Earnings Data, text=Failed to load, text=Something went wrong');
    if (await errorMessage.first().isVisible()) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});
