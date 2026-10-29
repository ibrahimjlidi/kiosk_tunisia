import { expect, Page, test } from '@playwright/test';

type RoleName = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATOR';

interface RoleAccount {
  role: RoleName;
  email: string;
  password: string;
  allowedRoutes: string[];
  deniedRoutes: string[];
}

const sharedRoutes = [
  '/dashboard',
  '/station',
  '/pumps',
  '/tanks',
  '/products',
  '/purchases',
  '/expenses',
  '/shifts',
  '/pos',
  '/services',
];

const managementRoutes = [
  '/suppliers',
  '/purchase-orders',
  '/employees',
  '/users',
  '/customers',
  '/teams',
  '/settings',
  '/audit-logs',
  '/reports',
  '/reports/sales',
  '/reports/analytics',
  '/reports/audit',
  '/reports/credits',
  '/daily-close',
  '/kif-returns',
  '/tank-gauging',
];

const supervisorRoutes = [
  '/suppliers',
  '/teams',
  '/settings',
  '/reports',
  '/reports/sales',
  '/reports/analytics',
  '/reports/audit',
  '/reports/credits',
  '/daily-close',
  '/kif-returns',
  '/tank-gauging',
];

const operatorDeniedRoutes = [
  ...managementRoutes,
];

const accounts: RoleAccount[] = [
  {
    role: 'ADMIN',
    email: process.env.E2E_ADMIN_EMAIL || 'admin@fuelstation.tn',
    password: process.env.E2E_ADMIN_PASSWORD || 'Admin123!',
    allowedRoutes: [...sharedRoutes, ...managementRoutes],
    deniedRoutes: [],
  },
  {
    role: 'MANAGER',
    email: process.env.E2E_MANAGER_EMAIL || 'demo_st002_manager@example.test',
    password: process.env.E2E_MANAGER_PASSWORD || 'Demo@123',
    allowedRoutes: [...sharedRoutes, ...managementRoutes],
    deniedRoutes: [],
  },
  {
    role: 'SUPERVISOR',
    email: process.env.E2E_SUPERVISOR_EMAIL || 'demo_st002_supervisor@example.test',
    password: process.env.E2E_SUPERVISOR_PASSWORD || 'Demo@123',
    allowedRoutes: [...sharedRoutes, ...supervisorRoutes],
    deniedRoutes: [
      '/purchase-orders',
      '/employees',
      '/users',
      '/customers',
      '/audit-logs',
    ],
  },
  {
    role: 'OPERATOR',
    email: process.env.E2E_OPERATOR_EMAIL || 'demo_st002_operator@example.test',
    password: process.env.E2E_OPERATOR_PASSWORD || 'Demo@123',
    allowedRoutes: sharedRoutes,
    deniedRoutes: operatorDeniedRoutes,
  },
];

async function signIn(page: Page, account: RoleAccount): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(account.email);
  await page.locator('#password').fill(account.password);
  await page.getByRole('button', { name: /Se connecter/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function expectPageAllowed(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await expect(page).toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
  await expect(page.getByRole('heading', { name: 'Access Forbidden' })).toHaveCount(0);
  await expect(page.locator('main h2').first()).toBeVisible();
}

async function expectPageDenied(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: 'Access Forbidden' })).toBeVisible();
}

for (const account of accounts) {
  test.describe(`${account.role} workflow`, () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page, account);
    });

    test('can access every permitted workflow route and is blocked from restricted routes', async ({ page }) => {
      for (const route of account.allowedRoutes) {
        await expectPageAllowed(page, route);
      }

      for (const route of account.deniedRoutes) {
        await expectPageDenied(page, route);
      }
    });

    test('dashboard only shows user metrics when the role can read user records', async ({ page }) => {
      const usersMetric = page.getByText('Users', { exact: true });
      if (account.role === 'OPERATOR') {
        await expect(usersMetric).toHaveCount(0);
        const restrictedRequests: string[] = [];
        page.on('request', (request) => {
          if (/\/api\/v1\/(users|reports\/summary)/.test(request.url())) {
            restrictedRequests.push(request.url());
          }
        });
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        expect(restrictedRequests).toEqual([]);
      } else {
        await expect(page.locator('main').getByText('Users', { exact: true })).toBeVisible();
      }
    });

    test('can open and cancel the shift-opening form without creating a shift', async ({ page }) => {
      await page.goto('/shifts');
      await page.getByRole('button', { name: 'Open New Shift' }).click();
      await expect(page.getByRole('heading', { name: 'Open New Shift' })).toBeVisible();
      await expect(page.locator('#shift-station')).toBeVisible();
      await expect(page.locator('#shift-type')).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('heading', { name: 'Open New Shift' })).toHaveCount(0);
    });

    test('can add an item to the POS cart and clear it without recording a sale', async ({ page }) => {
      await page.goto('/pos');
      await expect(page.getByRole('heading', { name: 'POS Terminal' })).toBeVisible();
      await expect(page.locator('select').nth(0).locator('option')).not.toHaveCount(0);
      await expect(page.locator('select').nth(2).locator('option')).not.toHaveCount(0);

      await page.getByRole('button', { name: 'Add to cart' }).click();
      await expect(page.getByText('1 item(s)')).toBeVisible();
      await expect(page.getByText(/added to the till/)).toBeVisible();

      await page.getByRole('button', { name: 'Clear cart' }).click();
      await expect(page.getByText('No items yet. Add products to start a sale.')).toBeVisible();
    });

    test('can log out and is redirected to login when reopening a protected page', async ({ page }) => {
      await page.locator('button[title="Logout"]').click();
      await expect(page).toHaveURL(/\/login$/);

      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login$/);
    });

    test('can inspect purchases and expenses with write actions matching the role', async ({ page }) => {
      const canManage = account.role === 'ADMIN' || account.role === 'MANAGER';

      await page.goto('/purchases');
      await expect(page.getByRole('heading', { name: 'Purchase Register' })).toBeVisible();
      await expect(page.getByText(/Forbidden: Role/)).toHaveCount(0);
      if (canManage) {
        await page.getByRole('button', { name: 'New Purchase' }).click();
        await expect(page.getByRole('heading', { name: 'Record Purchase' })).toBeVisible();
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Record Purchase' })).toHaveCount(0);
      } else {
        await expect(page.getByRole('button', { name: 'New Purchase' })).toHaveCount(0);
      }

      await page.goto('/expenses');
      await expect(page.getByRole('heading', { name: 'Expense Ledger' })).toBeVisible();
      await expect(page.getByText(/Forbidden: Role/)).toHaveCount(0);
      if (canManage) {
        await page.getByRole('button', { name: 'New Expense' }).click();
        await expect(page.getByRole('heading', { name: 'Record Expense' })).toBeVisible();
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Record Expense' })).toHaveCount(0);
      } else {
        await expect(page.getByRole('button', { name: 'New Expense' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: /Mark (Pending|Paid)/ })).toHaveCount(0);
      }
    });
  });
}

test('invalid credentials stay on login and show an error', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('invalid.user@example.test');
  await page.locator('#password').fill('incorrect-password');
  await page.getByRole('button', { name: /Se connecter/ }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert')).toBeVisible();
});

for (const account of accounts.filter(({ role }) => role !== 'OPERATOR')) {
  test(`${account.role} can open and cancel Kif return entry`, async ({ page }) => {
    await signIn(page, account);
    await page.goto('/kif-returns');
    await expect(page.getByRole('heading', { name: 'Kif Returns' })).toBeVisible();
    await page.getByRole('button', { name: 'Record' }).click();
    await expect(page.getByRole('heading', { name: 'Record Kif Return' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Record Kif Return' })).toHaveCount(0);
  });

  test(`${account.role} can review the daily-close summary without finalizing it`, async ({ page }) => {
    await signIn(page, account);
    await page.goto('/daily-close');
    await expect(page.getByRole('heading', { name: 'Daily Close & Station Situation' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finalize Close' })).toBeVisible();
  });
}

for (const account of accounts.filter(({ role }) => role !== 'OPERATOR')) {
  test(`${account.role} sees team controls only when authorized`, async ({ page }) => {
    await signIn(page, account);
    await page.goto('/teams');
    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();

    const canManage = account.role === 'ADMIN' || account.role === 'MANAGER';
    await expect(page.getByRole('button', { name: 'Add Team' })).toHaveCount(canManage ? 1 : 0);
    if (canManage) {
      await expect(page.getByLabel('Station', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Team leader')).toBeVisible();
      await expect(page.getByLabel('Station', { exact: true }).locator('option').nth(1)).toBeAttached();
      await expect(page.getByLabel('Team leader').locator('option').nth(1)).toBeAttached();
      await expect(page.getByLabel('Team leader').locator('option').nth(1)).toHaveAttribute('value', /^[a-f\d]{24}$/i);
      await page.getByRole('button', { name: 'Manage members' }).first().click();
      await expect(page.getByRole('region', { name: 'Team member selection' })).toBeVisible();
      await expect(page.getByRole('region', { name: 'Team member selection' }).getByRole('checkbox').first()).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).last().click();
    } else {
      await expect(page.getByRole('button', { name: 'Toggle' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Manage members' })).toHaveCount(0);
    }
  });
}

test('ADMIN can open and cancel station setup without creating a station', async ({ page }) => {
  await signIn(page, accounts[0]);
  await page.goto('/station');
  await page.getByRole('button', { name: 'Add Station' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Station' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Add New Station' })).toHaveCount(0);
});

for (const account of accounts.filter(({ role }) => role === 'ADMIN' || role === 'MANAGER')) {
  test(`${account.role} can open and cancel user provisioning`, async ({ page }) => {
    await signIn(page, account);
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'User Management & RBAC Roles' })).toBeVisible();
    await page.getByRole('button', { name: 'Provision New User' }).click();
    await expect(page.getByRole('heading', { name: 'Provision Station Operator / Manager' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Provision Station Operator / Manager' })).toHaveCount(0);
  });
}
