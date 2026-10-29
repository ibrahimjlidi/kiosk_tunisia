import { expect, Page, test } from '@playwright/test';

const operator = {
  email: process.env.E2E_OPERATOR_EMAIL || 'demo_st002_operator@example.test',
  password: process.env.E2E_OPERATOR_PASSWORD || 'Demo@123',
};

const shiftId = '64b000000000000000000001';
const stationId = '64b000000000000000000002';
const pumpId = '64b000000000000000000003';
const pistolId = '64b000000000000000000004';
const fuelProductId = '64b000000000000000000005';
const serviceProductId = '64b000000000000000000006';

async function signInAsOperator(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(operator.email);
  await page.locator('#password').fill(operator.password);
  await page.getByRole('button', { name: /Se connecter/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

function openShiftFixture(closingIndex = 100) {
  const financials = {
    volumeSold: closingIndex - 100,
    amountTTC: (closingIndex - 100) * 2.2,
    amountHT: Number((((closingIndex - 100) * 2.2) / 1.19).toFixed(3)),
    vatAmount: Number((((closingIndex - 100) * 2.2) - (((closingIndex - 100) * 2.2) / 1.19)).toFixed(3)),
    profit: (closingIndex - 100) * 0.4,
  };

  return {
    _id: shiftId,
    station: { _id: stationId, name: 'Test station', code: 'TEST-01' },
    shiftType: 'MORNING',
    shiftDate: '2026-10-28T00:00:00.000Z',
    shiftNumber: 1,
    status: 'OPEN',
    openedBy: { _id: '64b000000000000000000007', firstName: 'Demo', lastName: 'Operator' },
    employees: [],
    pumpReadings: [{
      pump: pumpId,
      pumpNumber: '1',
      pistolReadings: [{
        pistolId,
        pistolNumber: 1,
        product: fuelProductId,
        productName: 'Test Diesel',
        productCode: 'TEST-DIESEL',
        purchasePrice: 1.8,
        sellingPrice: 2.2,
        vatRate: 19,
        openingIndex: 100,
        closingIndex,
        ...financials,
      }],
    }],
    totalSalesHT: financials.amountHT,
    totalVAT: financials.vatAmount,
    totalSalesTTC: financials.amountTTC,
    totalProfit: financials.profit,
    cashAmount: 0,
    bankCardAmount: 0,
    fuelCardAmount: 0,
    bankTransferAmount: 0,
    creditAmount: 0,
    totalPayments: 0,
    balance: 0,
    isBalanced: false,
    totalExpenses: 0,
    openedAt: '2026-10-28T06:00:00.000Z',
  };
}

async function installShiftApiMock(page: Page, initialShift = openShiftFixture()) {
  let savedReadings: unknown;
  await page.route('**/api/v1/shifts/*', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname === `/api/v1/shifts/${shiftId}` && method === 'GET') {
      await route.fulfill({ status: 200, json: { success: true, shift: initialShift } });
      return;
    }

    if (url.pathname === `/api/v1/shifts/${shiftId}/readings` && method === 'PUT') {
      savedReadings = route.request().postDataJSON().readings;
      const requestedReadings = savedReadings as Array<{ closingIndex: number }>;
      const updatedShift = openShiftFixture(requestedReadings[0].closingIndex);
      await route.fulfill({ status: 200, json: { success: true, shift: updatedShift } });
      return;
    }

    await route.continue();
  });

  return {
    getSavedReadings: () => savedReadings,
  };
}

test.describe('Operator business actions', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsOperator(page);
  });

  test('reads operational records and exposes role restrictions through the API', async ({ page, request }) => {
    const token = await page.evaluate(() => localStorage.getItem('fuelstation_token'));
    expect(token).toBeTruthy();
    const apiBase = new URL('/api/v1/', process.env.E2E_BASE_URL || 'http://localhost');
    const apiRequest = (path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', data?: unknown) =>
      request.fetch(new URL(path, apiBase).toString(), {
        method,
        headers: { Authorization: `Bearer ${token}` },
        data,
      });

    for (const resource of ['stations', 'pumps', 'tanks', 'products', 'purchases', 'expenses', 'shifts']) {
      const response = await apiRequest(resource);
      expect(response.status(), `${resource} should be readable`).toBe(200);
    }

    const teamsResponse = await apiRequest('teams');
    expect(teamsResponse.status(), 'operators should only receive their own led teams').toBe(200);
    const teamsPayload = await teamsResponse.json();
    const tokenPayload = await page.evaluate(() => {
      const token = localStorage.getItem('fuelstation_token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    });
    for (const team of teamsPayload.teams || []) {
      expect(team.leader?._id || team.leader).toBe(tokenPayload.id);
    }

    const shiftsResponse = await apiRequest('shifts');
    const shiftsPayload = await shiftsResponse.json();
    for (const shift of shiftsPayload.shifts || []) {
      const employeeIds = (shift.employees || []).map((employee: { _id: string } | string) =>
        typeof employee === 'string' ? employee : employee._id
      );
      expect(employeeIds, 'operators should only receive shifts where they are assigned employees').toContain(tokenPayload.id);
    }

    for (const resource of ['customers', 'kif-returns', 'daily-closures/summary']) {
      const response = await apiRequest(resource);
      expect(response.status(), `${resource} should be restricted`).toBe(403);
    }

    const memberOpenResponse = await apiRequest('shifts', 'POST', {
      stationId,
      shiftType: 'NIGHT',
      shiftDate: new Date().toISOString(),
      teamId: '64b000000000000000000099',
    });
    expect(memberOpenResponse.status(), 'an Operator must not open a shift for a team they do not lead').toBe(403);

    const assignedShiftPayments = await apiRequest(
      'shifts/64b000000000000000000009/payments',
      'PUT',
      { cashAmount: 0 }
    );
    expect(assignedShiftPayments.status(), 'payment updates reach shift lookup for Operators').toBe(404);

    const gaugingList = await apiRequest('tank-gaugings');
    expect(gaugingList.status(), 'gauge records are readable through API though their page is restricted').toBe(200);

    const restrictedWrites: Array<[string, 'POST' | 'PUT', unknown?]> = [
      ['purchases', 'POST', {}],
      ['expenses', 'POST', {}],
      ['stations', 'POST', {}],
      ['kif-returns', 'POST', {}],
      ['tank-gaugings', 'POST', {}],
      ['daily-closures/close', 'POST', {}],
      ['customers', 'POST', {}],
      ['customers/64b000000000000000000008/transactions', 'POST', {}],
      ['shifts/64b000000000000000000009/close', 'POST', {}],
    ];

    for (const [resource, method, data] of restrictedWrites) {
      const response = await apiRequest(resource, method, data);
      expect(response.status(), `${method} ${resource} should be denied to Operator`).toBe(403);
    }
  });

  test('does not show shift-opening controls to a team member', async ({ page }) => {
    await page.route('**/api/v1/teams', async (route) => {
      await route.fulfill({ status: 200, json: { success: true, count: 0, teams: [] } });
    });
    await page.goto('/shifts');
    await expect(page.getByRole('button', { name: 'Open New Shift' })).toHaveCount(0);
    await expect(page.getByRole('status')).toContainText('Only a team leader can open a shift');
  });

  test('renders team selection for an Operator with a led team', async ({ page }) => {
    const teamId = '64b000000000000000000099';
    await page.route('**/api/v1/teams', async (route) => {
      await route.fulfill({ status: 200, json: { success: true, count: 1, teams: [{ _id: teamId, name: 'Assigned demo team', active: true }] } });
    });
    await page.route('**/api/v1/shifts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, json: { success: true, shift: { _id: shiftId } } });
        return;
      }
      await route.continue();
    });

    await page.goto('/shifts');
    await page.getByRole('button', { name: 'Open New Shift' }).click();
    await page.getByLabel('Assigned Team').selectOption(teamId);
    await page.getByRole('button', { name: 'Open Shift' }).click();

    await expect(page.getByRole('button', { name: 'Open New Shift' })).toBeVisible();
  });

  test('calculates zero and nonzero pump readings and submits only the expected reading update', async ({ page }) => {
    const mock = await installShiftApiMock(page);
    await page.goto(`/shifts/${shiftId}`);

    const readingInput = page.locator('input[type="number"]').first();
    await expect(readingInput).toHaveValue('100');
    const pistolRow = page.getByRole('row').filter({ hasText: 'TEST-DIESEL' });
    await expect(pistolRow).toContainText('0.000');
    await expect(page.getByRole('button', { name: 'Record Sale' })).toHaveCount(0);

    await readingInput.fill('110');
    await expect(pistolRow).toContainText('10.000');
    await expect(pistolRow).toContainText('22.000');
    await expect(pistolRow).toContainText('18.487');
    await expect(pistolRow).toContainText('3.513');
    await expect(pistolRow).toContainText('+4.000');

    await page.getByRole('button', { name: 'Save & Recalculate' }).click();
    await expect(page.getByText('Readings saved & financials recalculated')).toBeVisible();
    expect(mock.getSavedReadings()).toEqual([{ pumpId, pistolId, closingIndex: 110 }]);
  });

  test('records an in-shift sale using a mocked endpoint rather than changing the demo database', async ({ page }) => {
    await installShiftApiMock(page, openShiftFixture(110));
    let submittedSale: Record<string, unknown> | undefined;
    await page.route('**/api/v1/sales', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      submittedSale = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { success: true, sale: { _id: '64b000000000000000000010' } } });
    });

    await page.goto(`/shifts/${shiftId}`);
    await page.getByRole('button', { name: 'Record Sale' }).click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Record', exact: true }).click();

    await expect.poll(() => submittedSale).toMatchObject({
      shift: shiftId,
      station: stationId,
      pump: pumpId,
      pistol: pistolId,
      quantity: 10,
      amountTTC: 22,
      paymentMethod: 'CASH',
    });
  });

  test('completes a POS sale against a mocked sales endpoint', async ({ page }) => {
    let submittedSale: Record<string, unknown> | undefined;
    await page.route('**/api/v1/sales', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      submittedSale = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { success: true, sale: { _id: '64b000000000000000000011' } } });
    });

    await page.goto('/pos');
    await expect(page.getByRole('heading', { name: 'POS Terminal' })).toBeVisible();
    await page.locator('select').nth(1).selectOption('BANK_CARD');
    await page.locator('input[type="number"]').fill('2');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: 'Complete sale' }).click();

    await expect(page.getByText('Receipt completed successfully.')).toBeVisible();
    await expect.poll(() => submittedSale).toMatchObject({ paymentMethod: 'BANK_CARD', quantity: 2 });
  });

  test('records a service sale against a mocked sales endpoint', async ({ page }) => {
    let submittedSale: Record<string, unknown> | undefined;
    await page.route('**/api/v1/products', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          products: [{
            _id: serviceProductId,
            name: 'Test service',
            code: 'TEST-SERVICE',
            category: 'SERVICE',
            purchasePrice: 2,
            sellingPrice: 7.5,
            vatRate: 19,
            unitOfMeasure: 'SERVICE',
            minStockAlert: 0,
            currentStock: 0,
            active: true,
          }],
        },
      });
    });
    await page.route('**/api/v1/sales', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      submittedSale = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { success: true, sale: { _id: '64b000000000000000000012' } } });
    });

    await page.goto('/services');
    await page.getByLabel('Service').selectOption(serviceProductId);
    await page.getByLabel('Quantity').fill('2');
    await page.getByRole('button', { name: 'Record service sale' }).click();

    await expect(page.getByText('Service sale recorded for Test service.')).toBeVisible();
    await expect.poll(() => submittedSale).toMatchObject({
      product: serviceProductId,
      quantity: 2,
      amountTTC: 15,
      paymentMethod: 'CASH',
    });
  });
});
