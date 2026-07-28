export type ShiftType   = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface PistolReading {
  pistolId:      string;
  pistolNumber:  number;
  product:       string;
  productName:   string;
  productCode:   string;
  purchasePrice: number;
  sellingPrice:  number;
  vatRate:       number;
  openingIndex:  number;
  closingIndex:  number;
  volumeSold:    number;
  amountHT:      number;
  vatAmount:     number;
  amountTTC:     number;
  profit:        number;
}

export interface PumpReading {
  pump:           string;
  pumpNumber:     string;
  pistolReadings: PistolReading[];
}

export interface Shift {
  _id:           string;
  station:       { _id: string; name: string; code: string } | string;
  shiftType:     ShiftType;
  shiftDate:     string;
  shiftNumber:   number;
  status:        ShiftStatus;
  openedBy:      { _id: string; firstName: string; lastName: string } | string;
  closedBy?:     { _id: string; firstName: string; lastName: string } | string;
  employees:     { _id: string; firstName: string; lastName: string }[];
  pumpReadings:  PumpReading[];

  totalSalesHT:  number;
  totalVAT:      number;
  totalSalesTTC: number;
  totalProfit:   number;

  cashAmount:         number;
  bankCardAmount:     number;
  fuelCardAmount:     number;
  bankTransferAmount: number;
  creditAmount:       number;
  totalPayments:      number;

  balance:       number;
  isBalanced:    boolean;
  totalExpenses: number;

  openedAt:  string;
  closedAt?: string;
  notes?:    string;
}
