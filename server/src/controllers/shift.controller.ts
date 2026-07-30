import { Request, Response } from 'express';
import { Shift, ShiftType } from '../models/Shift';
import { Station } from '../models/Station';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  buildInitialPumpReadings,
  calcPistolFinancials,
  aggregateShiftTotals,
  rolloverIndexesToPumps,
} from '../services/shift.service';
import { createSalesForShift } from '../services/sale.service';

const SHIFT_TYPE_NUMBER: Record<ShiftType, number> = {
  MORNING:   1,
  AFTERNOON: 2,
  NIGHT:     3,
};

/** GET /api/v1/shifts — list shifts with optional date filter */
export const getShifts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    if (req.query.station) filter.station = req.query.station;
    if (req.query.status)  filter.status  = req.query.status;

    if (req.query.date) {
      const day = new Date(req.query.date as string);
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end   = new Date(day); end.setHours(23, 59, 59, 999);
      filter.shiftDate = { $gte: start, $lte: end };
    }

    const shifts = await Shift.find(filter)
      .populate('station',   'name code')
      .populate('openedBy',  'firstName lastName')
      .populate('closedBy',  'firstName lastName')
      .populate('employees', 'firstName lastName')
      .sort({ shiftDate: -1, shiftNumber: 1 });

    res.status(200).json({ success: true, count: shifts.length, shifts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/v1/shifts/:id */
export const getShiftById = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('station',   'name code')
      .populate('openedBy',  'firstName lastName')
      .populate('closedBy',  'firstName lastName')
      .populate('employees', 'firstName lastName');

    if (!shift) { res.status(404).json({ success: false, message: 'Shift not found' }); return; }
    res.status(200).json({ success: true, shift });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/v1/shifts — open a new shift */
export const openShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stationId, shiftType, shiftDate, employeeIds } = req.body;

    if (!stationId || !shiftType || !shiftDate) {
      res.status(400).json({ success: false, message: 'stationId, shiftType, and shiftDate are required' });
      return;
    }

    const station = await Station.findById(stationId);
    if (!station) { res.status(404).json({ success: false, message: 'Station not found' }); return; }

    const date   = new Date(shiftDate);
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    // Check for duplicate shift
    const existing = await Shift.findOne({
      station: stationId,
      shiftType,
      shiftDate: { $gte: dayStart, $lte: dayEnd },
    });
    if (existing) {
      res.status(409).json({ success: false, message: `A ${shiftType} shift already exists for this date` });
      return;
    }

    const shiftNumber = SHIFT_TYPE_NUMBER[shiftType as ShiftType];
    const pumpReadings = await buildInitialPumpReadings(stationId, date, shiftNumber);

    const shift = await Shift.create({
      station:     stationId,
      shiftType,
      shiftDate:   date,
      shiftNumber,
      openedBy:    req.user!.id,
      employees:   employeeIds || [],
      pumpReadings,
      openedAt:    new Date(),
    });

    res.status(201).json({ success: true, message: `${shiftType} shift opened successfully`, shift });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/** PUT /api/v1/shifts/:id/readings — update pump closing indexes and recalculate */
export const updateShiftReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404).json({ success: false, message: 'Shift not found' }); return; }
    if (shift.status === 'CLOSED') {
      res.status(403).json({ success: false, message: 'Cannot edit a closed shift' });
      return;
    }

    // req.body.readings: [{ pumpId, pistolId, closingIndex }]
    const updates: { pumpId: string; pistolId: string; closingIndex: number }[] = req.body.readings || [];

    for (const update of updates) {
      const pumpReading = shift.pumpReadings.find(
        (pr) => pr.pump.toString() === update.pumpId
      );
      if (!pumpReading) continue;

      const pistolReading = pumpReading.pistolReadings.find(
        (pr) => pr.pistolId.toString() === update.pistolId
      );
      if (!pistolReading) continue;

      if (update.closingIndex < pistolReading.openingIndex) {
        res.status(400).json({
          success: false,
          message: `Closing index (${update.closingIndex}) cannot be less than opening index (${pistolReading.openingIndex}) for pistol ${pistolReading.pistolNumber}`,
        });
        return;
      }

      pistolReading.closingIndex = update.closingIndex;

      // Recalculate financials
      const calc = calcPistolFinancials(
        pistolReading.openingIndex,
        pistolReading.closingIndex,
        pistolReading.sellingPrice,
        pistolReading.purchasePrice,
        pistolReading.vatRate
      );
      Object.assign(pistolReading, calc);
    }

    // Re-aggregate shift totals
    const totals = aggregateShiftTotals(shift.pumpReadings);
    Object.assign(shift, totals);

    await shift.save();
    res.status(200).json({ success: true, message: 'Readings updated and recalculated', shift });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/v1/shifts/:id/payments — record payments */
export const updateShiftPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404).json({ success: false, message: 'Shift not found' }); return; }
    if (shift.status === 'CLOSED') {
      res.status(403).json({ success: false, message: 'Cannot edit a closed shift' });
      return;
    }

    const { cashAmount = 0, bankCardAmount = 0, fuelCardAmount = 0, bankTransferAmount = 0, creditAmount = 0 } = req.body;

    shift.cashAmount         = cashAmount;
    shift.bankCardAmount     = bankCardAmount;
    shift.fuelCardAmount     = fuelCardAmount;
    shift.bankTransferAmount = bankTransferAmount;
    shift.creditAmount       = creditAmount;
    shift.totalPayments      = parseFloat((cashAmount + bankCardAmount + fuelCardAmount + bankTransferAmount + creditAmount).toFixed(3));
    shift.balance            = parseFloat((shift.totalPayments - shift.totalSalesTTC).toFixed(3));
    shift.isBalanced         = Math.abs(shift.balance) < 0.001;

    await shift.save();
    res.status(200).json({ success: true, message: 'Payments updated', shift });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/v1/shifts/:id/close — close a shift */
export const closeShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404).json({ success: false, message: 'Shift not found' }); return; }
    if (shift.status === 'CLOSED') {
      res.status(409).json({ success: false, message: 'Shift is already closed' });
      return;
    }

    // Business rule: readings must be done (at least one reading has closingIndex > openingIndex OR all are 0)
    // Payments must be recorded
    if (shift.totalPayments === 0 && shift.totalSalesTTC > 0) {
      res.status(400).json({ success: false, message: 'Payments must be recorded before closing the shift' });
      return;
    }

    shift.status   = 'CLOSED';
    shift.closedBy = req.user!.id as any;
    shift.closedAt = new Date();
    shift.notes    = req.body.notes || '';

    await shift.save();

    // Create Sale documents from readings
    try {
      const createdCount = await createSalesForShift(shift._id);
      // Roll over closing indexes to Pump model
      await rolloverIndexesToPumps(shift.pumpReadings);

      res.status(200).json({ success: true, message: `Shift closed successfully, ${createdCount} sale(s) recorded, and indexes rolled over`, shift });
    } catch (err: any) {
      // If sales creation fails, still attempt rollover but report error
      await rolloverIndexesToPumps(shift.pumpReadings).catch(() => {});
      res.status(500).json({ success: false, message: `Shift closed but failed to record sales: ${err.message}`, shift });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/v1/shifts/:id/reopen — ADMIN only */
export const reopenShift = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404).json({ success: false, message: 'Shift not found' }); return; }
    if (shift.status === 'OPEN') {
      res.status(409).json({ success: false, message: 'Shift is already open' });
      return;
    }

    shift.status   = 'OPEN';
    shift.closedBy = undefined;
    shift.closedAt = undefined;
    await shift.save();

    res.status(200).json({ success: true, message: 'Shift reopened by administrator', shift });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
