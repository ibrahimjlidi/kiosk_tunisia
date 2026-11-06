import { expect, Page, test } from '@playwright/test';

const stationId = '64b000000000000000000021';
const shiftIds = {
  MORNING: '64b000000000000000000022',
  AFTERNOON: '64b000000000000000000023',
  NIGHT: '64b000000000000000000024',
} as const;
const pumpIds = ['pump-1', 'pump-2', 'pump-3', 'pump-4'];
const pistolIds = pumpIds.flatMap((pumpId) => [`${pumpId}-p1`, `${pumpId}-p2`]);
const targetPistolId = 'pump-4-p1';
const volumes = {
  MORNING: 2.5,
  AFTERNOON: 3.25,
  NIGHT: 1.75,
} as const;

type ShiftName = keyof typeof shiftIds;
type Reading = { pumpId: string; pistolId: string; closingIndex: number };

function makeShift(
  shiftType: ShiftName,
  openingIndexes: Record<string, number>,
  status: 'OPEN' | 'CLOSED' = 'OPEN'
) {
  return {
    _id: shiftIds[shiftType],
    station: { _id: stationId, name: 'Isolated handoff test', code: 'HANDOFF' },
    shiftType,
    shiftDate: '2026-11-07T00:00:00.000Z',
    shiftNumber: Object.keys(shiftIds).indexOf(shiftType) + 1,
    status,
    openedBy: { _id: '64b000000000000000000025', firstName: 'Test', lastName: 'Operator' },
    employees: [],
    pumpReadings: pumpIds.map((pumpId, pumpIndex) => ({
      pump: pumpId,
      pumpNumber: String(pumpIndex + 1),
      pistolReadings: [1, 2].map((pistolNumber) => {
        const pistolId = `${pumpId}-p${pistolNumber}`;
        const openingIndex = openingIndexes[pistolId];
        return {
          pistolId,
          pistolNumber,
          product: '64b000000000000000000026',
          productName: 'Test Diesel',
          productCode: 'TEST-DIESEL',
          purchasePrice: 1.75,
          sellingPrice: 2.2,
          vatRate: 19,
          openingIndex,
          closingIndex: openingIndex,
          volumeSold: 0,
          amountHT: 0,
          vatAmount: 0,
          amountTTC: 0,
          profit: 0,
        };
      }),
    })),
    totalSalesHT: 0,
    totalVAT: 0,
    totalSalesTTC: 0,
    totalProfit: 0,
    cashAmount: 0,
    bankCardAmount: 0,
    fuelCardAmount: 0,
    bankTransferAmount: 0,
    creditAmount: 0,
    totalPayments: 0,
    balance: 0,
    isBalanced: false,
    totalExpenses: 0,
    openedAt: '2026-11-07T06:00:00.000Z',
  };
}

async function installIsolatedShiftApi(page: Page) {
  const shifts = new Map<string, ReturnType<typeof makeShift>>();
  const savedReadings: Array<{ shiftType: ShiftName; readings: Reading[] }> = [];
  const savedPayments: Array<{ shiftType: ShiftName; payments: Record<string, number> }> = [];
  const closedShifts: ShiftName[] = [];

  await page.addInitScript(() => {
    localStorage.setItem('fuelstation_token', 'isolated-shift-handoff-test-token');
  });

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (path.endsWith('/auth/me') && method === 'GET') {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          user: {
            id: '64b000000000000000000025',
            username: 'test-operator',
            email: 'test@example.test',
            role: 'ADMIN',
            firstName: 'Test',
            lastName: 'Operator',
            active: true,
            station: stationId,
            permissions: ['shifts.read'],
          },
        },
      });
      return;
    }

    const shiftId = path.match(/\/shifts\/([^/]+)/)?.[1];
    if (shiftId && path === `/api/v1/shifts/${shiftId}` && method === 'GET') {
      const shift = shifts.get(shiftId);
      if (!shift) {
        await route.fulfill({ status: 404, json: { success: false, message: 'Shift not found in isolated test' } });
        return;
      }
      await route.fulfill({ status: 200, json: { success: true, shift } });
      return;
    }

    if (shiftId && path === `/api/v1/shifts/${shiftId}/readings` && method === 'PUT') {
      const shift = shifts.get(shiftId);
      if (!shift) {
        await route.fulfill({ status: 404, json: { success: false, message: 'Shift not found in isolated test' } });
        return;
      }
      const readings = (request.postDataJSON() as { readings: Reading[] }).readings;
      savedReadings.push({ shiftType: shift.shiftType as ShiftName, readings });
      for (const reading of readings) {
        const pistol = shift.pumpReadings
          .flatMap((pump) => pump.pistolReadings)
          .find((entry) => entry.pistolId === reading.pistolId);
        if (!pistol) throw new Error(`Unknown pistol in readings payload: ${reading.pistolId}`);
        const volumeSold = reading.closingIndex - pistol.openingIndex;
        pistol.closingIndex = reading.closingIndex;
        pistol.volumeSold = volumeSold;
        pistol.amountTTC = Number((volumeSold * pistol.sellingPrice).toFixed(3));
        pistol.amountHT = Number((pistol.amountTTC / (1 + pistol.vatRate / 100)).toFixed(3));
        pistol.vatAmount = Number((pistol.amountTTC - pistol.amountHT).toFixed(3));
        pistol.profit = Number((volumeSold * (pistol.sellingPrice - pistol.purchasePrice)).toFixed(3));
      }
      shift.totalSalesTTC = shift.pumpReadings.flatMap((pump) => pump.pistolReadings)
        .reduce((total, pistol) => total + pistol.amountTTC, 0);
      shift.totalSalesHT = shift.pumpReadings.flatMap((pump) => pump.pistolReadings)
        .reduce((total, pistol) => total + pistol.amountHT, 0);
      shift.totalVAT = shift.pumpReadings.flatMap((pump) => pump.pistolReadings)
        .reduce((total, pistol) => total + pistol.vatAmount, 0);
      shift.totalProfit = shift.pumpReadings.flatMap((pump) => pump.pistolReadings)
        .reduce((total, pistol) => total + pistol.profit, 0);
      await route.fulfill({ status: 200, json: { success: true, shift } });
      return;
    }

    if (shiftId && path === `/api/v1/shifts/${shiftId}/payments` && method === 'PUT') {
      const shift = shifts.get(shiftId);
      if (!shift) {
        await route.fulfill({ status: 404, json: { success: false, message: 'Shift not found in isolated test' } });
        return;
      }
      const payments = request.postDataJSON() as Record<string, number>;
      savedPayments.push({ shiftType: shift.shiftType as ShiftName, payments });
      Object.assign(shift, payments);
      shift.totalPayments = Object.values(payments).reduce((total, amount) => total + amount, 0);
      shift.balance = shift.totalPayments - shift.totalSalesTTC;
      shift.isBalanced = Math.abs(shift.balance) < 0.001;
      await route.fulfill({ status: 200, json: { success: true, shift } });
      return;
    }

    if (shiftId && path === `/api/v1/shifts/${shiftId}/close` && method === 'POST') {
      const shift = shifts.get(shiftId);
      if (!shift) {
        await route.fulfill({ status: 404, json: { success: false, message: 'Shift not found in isolated test' } });
        return;
      }
      shift.status = 'CLOSED';
      closedShifts.push(shift.shiftType as ShiftName);
      const nextShift = shift.shiftType === 'MORNING' ? 'AFTERNOON' : shift.shiftType === 'AFTERNOON' ? 'NIGHT' : null;
      if (nextShift) {
        const nextOpenings = Object.fromEntries(
          shift.pumpReadings.flatMap((pump) =>
            pump.pistolReadings.map((pistol) => [pistol.pistolId, pistol.closingIndex])
          )
        );
        shifts.set(shiftIds[nextShift], makeShift(nextShift, nextOpenings));
      }
      await route.fulfill({ status: 200, json: { success: true, shift } });
      return;
    }

    await route.fulfill({ status: 200, json: { success: true, data: [] } });
  });

  shifts.set(shiftIds.MORNING, makeShift(
    'MORNING',
    Object.fromEntries(pistolIds.map((pistolId, index) => [pistolId, 1000 + index * 100]))
  ));

  return { savedReadings, savedPayments, closedShifts };
}

test('carries saved closing indexes through MORNING, AFTERNOON, and NIGHT with balanced payments', async ({ page }) => {
  const mock = await installIsolatedShiftApi(page);
  page.on('dialog', (dialog) => dialog.accept());

  let previousClosingIndexes: Record<string, number> | undefined;
  for (const shiftType of ['MORNING', 'AFTERNOON', 'NIGHT'] as const) {
    await page.goto(`/shifts/${shiftIds[shiftType]}`);
    await expect(page.getByRole('heading', { name: `${shiftType} Shift` })).toBeVisible();
    await expect(page.getByText('OPEN', { exact: true })).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(8);
    if (previousClosingIndexes) {
      for (let index = 0; index < pistolIds.length; index += 1) {
        await expect(rows.nth(index).locator('td').nth(2)).toHaveText(previousClosingIndexes[pistolIds[index]].toFixed(1));
      }
    }

    const openingIndexes = Object.fromEntries(
      await Promise.all(pistolIds.map(async (pistolId, index) => {
        const value = await rows.nth(index).locator('input[type="number"]').inputValue();
        return [pistolId, Number(value)];
      }))
    );
    const closingIndexes = { ...openingIndexes, [targetPistolId]: openingIndexes[targetPistolId] + volumes[shiftType] };
    const targetRow = rows.filter({ hasText: '4 · P1' });
    await targetRow.locator('input[type="number"]').fill(String(closingIndexes[targetPistolId]));

    const amountTTC = Number((volumes[shiftType] * 2.2).toFixed(3));
    const expectedHT = Number((amountTTC / 1.19).toFixed(3));
    const expectedVAT = Number((amountTTC - expectedHT).toFixed(3));
    const expectedProfit = Number((volumes[shiftType] * (2.2 - 1.75)).toFixed(3));
    await expect(targetRow).toContainText(volumes[shiftType].toFixed(3));
    await expect(targetRow).toContainText(amountTTC.toFixed(3));
    await expect(targetRow).toContainText(expectedHT.toFixed(3));
    await expect(targetRow).toContainText(expectedVAT.toFixed(3));
    await expect(targetRow).toContainText(expectedProfit.toFixed(3));
    const salesTtcCard = page.locator('.glass-panel').filter({
      has: page.getByText('Sales TTC', { exact: true }),
    });
    await expect(salesTtcCard.getByText(amountTTC.toFixed(3), { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Save & Recalculate' }).click();
    await expect(page.getByText('Readings saved & financials recalculated')).toBeVisible();
    await expect.poll(() => mock.savedReadings.length).toBe(Object.keys(shiftIds).indexOf(shiftType) + 1);

    const paymentPanel = page.locator('.glass-panel').filter({ has: page.getByRole('heading', { name: 'Payments Entry' }) });
    const halfPayment = Number((amountTTC / 2).toFixed(3));
    await paymentPanel.locator('input[type="number"]').nth(0).fill(String(halfPayment));
    await paymentPanel.locator('input[type="number"]').nth(1).fill(String(halfPayment));
    await paymentPanel.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Payments saved & reconciliation updated')).toBeVisible();
    await expect(page.getByText('✓ Balanced')).toBeVisible();

    await page.getByRole('button', { name: 'Close Shift & Lock' }).click();
    await expect(page.getByText('Shift closed and indexes rolled over')).toBeVisible();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();
    await expect.poll(() => mock.savedPayments.length).toBe(Object.keys(shiftIds).indexOf(shiftType) + 1);
    previousClosingIndexes = closingIndexes;
  }

  expect(mock.closedShifts).toEqual(['MORNING', 'AFTERNOON', 'NIGHT']);
  expect(mock.savedPayments).toEqual([
    { shiftType: 'MORNING', payments: { cashAmount: 2.75, bankCardAmount: 2.75, fuelCardAmount: 0, bankTransferAmount: 0, creditAmount: 0 } },
    { shiftType: 'AFTERNOON', payments: { cashAmount: 3.575, bankCardAmount: 3.575, fuelCardAmount: 0, bankTransferAmount: 0, creditAmount: 0 } },
    { shiftType: 'NIGHT', payments: { cashAmount: 1.925, bankCardAmount: 1.925, fuelCardAmount: 0, bankTransferAmount: 0, creditAmount: 0 } },
  ]);
  expect(mock.savedReadings.map(({ readings }) => readings)).toHaveLength(3);
  expect(mock.savedReadings.every(({ readings }) => readings.length === pistolIds.length)).toBe(true);
  expect(mock.savedReadings.map(({ shiftType, readings }) => ({
    shiftType,
    changed: readings.find((reading) => reading.pistolId === targetPistolId)?.closingIndex,
  }))).toEqual([
    { shiftType: 'MORNING', changed: 1602.5 },
    { shiftType: 'AFTERNOON', changed: 1605.75 },
    { shiftType: 'NIGHT', changed: 1607.5 },
  ]);
});
