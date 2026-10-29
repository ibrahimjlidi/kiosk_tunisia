import mongoose, { AnyKeys, Document, FilterQuery, HydratedDocument, Model } from 'mongoose';
import dotenv from 'dotenv';

import { User, IUser } from '../models/User';
import { Station, IStation } from '../models/Station';
import { Pump, IPump } from '../models/Pump';
import { Product, IProduct } from '../models/Product';
import { Tank, ITank } from '../models/Tank';
import { Shift, IShift, IPumpReading } from '../models/Shift';
import { Customer, ICustomer } from '../models/Customer';
import { Supplier, ISupplier } from '../models/Supplier';
import { Expense } from '../models/Expense';
import { ProductPurchase } from '../models/ProductPurchase';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { TankGauging } from '../models/TankGauging';
import { KifReturn } from '../models/KifReturn';
import { DailyClosure } from '../models/DailyClosure';
import { Sale } from '../models/Sale';
import { CreditTransaction } from '../models/CreditTransaction';
import { Team, ITeam } from '../models/Team';

dotenv.config();

const DEMO_PASSWORD = 'Demo@123';
const DEMO_STATIONS = [
  { code: 'ST-002', name: 'Station Sousse Centre', address: 'Avenue Habib Bourguiba', city: 'Sousse', phone: '+216 73 210 002', taxId: 'DEMO-002' },
  { code: 'ST-003', name: 'Station Sfax Port', address: 'Route du Port', city: 'Sfax', phone: '+216 74 210 003', taxId: 'DEMO-003' },
  { code: 'ST-004', name: 'Station Hammamet Centre', address: 'Avenue de la République', city: 'Hammamet', phone: '+216 72 210 004', taxId: 'DEMO-004' },
];

const findOrCreate = async <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  values: AnyKeys<T>,
): Promise<HydratedDocument<T>> => (await model.findOne(filter)) ?? model.create(values);

const startOfDay = (date: Date): Date => {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
};

const round = (value: number): number => Number(value.toFixed(3));

async function seedDemo(): Promise<void> {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO_IN_PRODUCTION !== 'true') {
    throw new Error('Demo seeding is disabled in production. Set SEED_DEMO_IN_PRODUCTION=true only for an intentional test database.');
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fuelstation_erp');

  try {
    const admin = await User.findOne({ role: 'ADMIN' });
    if (!admin) {
      throw new Error('An admin user is required. Start the API once to create the default admin before seeding demo data.');
    }

    const stations: HydratedDocument<IStation>[] = [];
    const mainStation = await Station.findOne({ code: 'ST-001' });
    if (mainStation) stations.push(mainStation);

    for (const stationData of DEMO_STATIONS) {
      stations.push(await findOrCreate<IStation>(
        Station,
        { code: stationData.code },
        { ...stationData, active: true },
      ));
    }

    const fuelProducts = await Product.find({ category: 'FUEL', active: true }).sort({ createdAt: 1 }).limit(3);
    const productTemplates = [
      { code: 'DEMO-GASOIL', name: 'Gasoil 2.200', purchasePrice: 1.85, sellingPrice: 2.2 },
      { code: 'DEMO-SP95', name: 'Sans Plomb 95', purchasePrice: 2.1, sellingPrice: 2.52 },
      { code: 'DEMO-GO50', name: 'Gasoil 50 Premium', purchasePrice: 2.02, sellingPrice: 2.4 },
    ];

    while (fuelProducts.length < productTemplates.length) {
      const template = productTemplates[fuelProducts.length];
      fuelProducts.push(await findOrCreate<IProduct>(
        Product,
        { code: template.code },
        {
          ...template,
          category: 'FUEL',
          vatRate: 19,
          unitOfMeasure: 'LITER',
          minStockAlert: 2000,
          currentStock: 12000,
          active: true,
        },
      ));
    }

    const [gasoil, petrol, premium] = fuelProducts;
    const supplier = await findOrCreate<ISupplier>(
      Supplier,
      { code: 'DEMO-SUP-001' },
      {
        name: 'Fournisseur Démo Tunisie',
        code: 'DEMO-SUP-001',
        contactPerson: 'Amine Ben Salem',
        phone: '+216 71 555 001',
        email: 'demo.supplier@example.test',
        address: 'Zone Industrielle, Tunis',
        taxId: 'DEMO-SUP-TAX',
        active: true,
      },
    );
    const customer = await findOrCreate<ICustomer>(
      Customer,
      { email: 'client.demo@example.test' },
      {
        name: 'Entreprise Démo',
        phone: '+216 20 555 010',
        email: 'client.demo@example.test',
        address: 'Tunis, Tunisie',
        creditBalance: 0,
      },
    );

    let created = 0;
    for (const [stationIndex, station] of stations.entries()) {
      const suffix = station.code.replace(/[^A-Z0-9]/g, '').toLowerCase();
      const accounts = {} as Record<'MANAGER' | 'SUPERVISOR' | 'OPERATOR', IUser>;
      const roles = [
        { role: 'MANAGER' as const, firstName: 'Nabil', lastName: 'Hammami' },
        { role: 'SUPERVISOR' as const, firstName: 'Salma', lastName: 'Ben Ali' },
        { role: 'OPERATOR' as const, firstName: 'Hedi', lastName: 'Mansour' },
      ];

      for (const account of roles) {
        const username = `demo_${suffix}_${account.role.toLowerCase()}`;
        let user = await User.findOne({ username });
        if (!user) {
          user = await User.create({
            username,
            email: `${username}@example.test`,
            password: DEMO_PASSWORD,
            role: account.role,
            firstName: account.firstName,
            lastName: account.lastName,
            phone: `+216 20 555 ${String(stationIndex * 10 + roles.indexOf(account)).padStart(3, '0')}`,
            active: true,
            station: station._id,
          });
          created += 1;
        }
        accounts[account.role] = user;
      }

      if (!station.manager) {
        station.manager = accounts.MANAGER._id;
        await station.save();
      }

      const morningTeam = await findOrCreate<ITeam>(
        Team,
        { name: `Demo ${station.code} Équipe Matin` },
        {
          name: `Demo ${station.code} Équipe Matin`,
          station: station._id,
          leader: accounts.SUPERVISOR._id,
          members: [accounts.MANAGER._id, accounts.SUPERVISOR._id, accounts.OPERATOR._id],
          active: true,
        },
      );
      const eveningTeam = await findOrCreate<ITeam>(
        Team,
        { name: `Demo ${station.code} Équipe Soir` },
        {
          name: `Demo ${station.code} Équipe Soir`,
          station: station._id,
          leader: accounts.MANAGER._id,
          members: [accounts.SUPERVISOR._id, accounts.OPERATOR._id],
          active: true,
        },
      );

      const tanks: ITank[] = [];
      for (const [tankIndex, product] of [gasoil, petrol, premium].entries()) {
        tanks.push(await findOrCreate<ITank>(
          Tank,
          { station: station._id, tankNumber: `Demo ${station.code} Cuve ${tankIndex + 1}` },
          {
            station: station._id,
            product: product._id,
            tankNumber: `Demo ${station.code} Cuve ${tankIndex + 1}`,
            capacity: 20000 + tankIndex * 5000,
            currentStock: 10000 + stationIndex * 500 + tankIndex * 1000,
            minLevelAlert: 2000,
            active: true,
          },
        ));
      }

      const pumpNumber = `Demo ${station.code} Pompe 01`;
      const pump: IPump = await findOrCreate<IPump>(
        Pump,
        { station: station._id, pumpNumber },
        {
          station: station._id,
          pumpNumber,
          active: true,
          pistols: [
            { pistolNumber: 1, product: gasoil._id, currentClosingIndex: 128450, active: true },
            { pistolNumber: 2, product: petrol._id, currentClosingIndex: 98210, active: true },
          ],
        },
      );

      const today = startOfDay(new Date());
      const morningDate = new Date(today);
      const morningExisting = await Shift.findOne({ station: station._id, shiftDate: morningDate, shiftType: 'MORNING' });
      let morningShift = morningExisting;
      if (!morningShift) {
        const volumes = [100, 50];
        const salesTTC = volumes.reduce((sum, volume, index) => sum + volume * [gasoil, petrol][index].sellingPrice, 0);
        const salesHT = volumes.reduce((sum, volume, index) => {
          const product = [gasoil, petrol][index];
          return sum + volume * product.sellingPrice / (1 + product.vatRate / 100);
        }, 0);
        const profit = volumes.reduce((sum, volume, index) => {
          const product = [gasoil, petrol][index];
          return sum + volume * (product.sellingPrice - product.purchasePrice);
        }, 0);
        const pistolReadings: IPumpReading['pistolReadings'] = [gasoil, petrol].map((product, index) => ({
          pistolId: pump.pistols[index]._id!,
          pistolNumber: index + 1,
          product: product._id,
          productName: product.name,
          productCode: product.code,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          vatRate: product.vatRate,
          openingIndex: index === 0 ? 128350 : 98160,
          closingIndex: (index === 0 ? 128350 : 98160) + volumes[index],
          volumeSold: volumes[index],
          amountHT: round(volumes[index] * product.sellingPrice / (1 + product.vatRate / 100)),
          vatAmount: round(volumes[index] * product.sellingPrice - volumes[index] * product.sellingPrice / (1 + product.vatRate / 100)),
          amountTTC: round(volumes[index] * product.sellingPrice),
          profit: round(volumes[index] * (product.sellingPrice - product.purchasePrice)),
        }));
        morningShift = await Shift.create({
          station: station._id,
          shiftType: 'MORNING',
          shiftDate: morningDate,
          shiftNumber: 1,
          status: 'CLOSED',
          openedBy: accounts.MANAGER._id,
          closedBy: accounts.MANAGER._id,
          team: morningTeam._id,
          employees: morningTeam.members,
          pumpReadings: [{ pump: pump._id, pumpNumber: pump.pumpNumber, pistolReadings }],
          totalVolumeByProduct: [
            { product: gasoil._id, productName: gasoil.name, volumeSold: 100 },
            { product: petrol._id, productName: petrol.name, volumeSold: 50 },
          ],
          totalSalesHT: round(salesHT),
          totalVAT: round(salesTTC - salesHT),
          totalSalesTTC: round(salesTTC),
          totalProfit: round(profit),
          cashAmount: round(100 * gasoil.sellingPrice),
          bankCardAmount: round(50 * petrol.sellingPrice),
          fuelCardAmount: 0,
          bankTransferAmount: 0,
          creditAmount: 0,
          totalPayments: round(salesTTC),
          balance: 0,
          isBalanced: true,
          totalExpenses: 0,
          openedAt: new Date(today.getTime() + 6 * 60 * 60 * 1000),
          closedAt: new Date(today.getTime() + 14 * 60 * 60 * 1000),
          notes: `DEMO DATA: Morning shift for ${station.name}`,
        });
        created += 1;
      }

      const afternoonExisting = await Shift.findOne({ station: station._id, shiftDate: today, shiftType: 'AFTERNOON' });
      if (!afternoonExisting) {
        await Shift.create({
          station: station._id,
          shiftType: 'AFTERNOON',
          shiftDate: today,
          shiftNumber: 2,
          status: 'OPEN',
          openedBy: accounts.MANAGER._id,
          team: eveningTeam._id,
          employees: eveningTeam.members,
          pumpReadings: [],
          openedAt: new Date(),
          notes: `DEMO DATA: Open afternoon shift for ${station.name}`,
        });
        created += 1;
      }

      if (morningShift.notes?.startsWith('DEMO DATA:')) {
        for (const [index, product] of [gasoil, petrol].entries()) {
          const quantity = index === 0 ? 100 : 50;
          const paymentMethod = index === 0 ? 'CASH' : 'BANK_CARD';
          const existingSale = await Sale.findOne({
            station: station._id,
            shift: morningShift._id,
            product: product._id,
            quantity,
            paymentMethod,
          });
          if (!existingSale) {
            await Sale.create({
              station: station._id,
              shift: morningShift._id,
              pump: pump._id,
              pistol: pump.pistols[index]._id,
              product: product._id,
              productName: product.name,
              productCode: product.code,
              employee: accounts.OPERATOR._id,
              quantity,
              purchasePrice: product.purchasePrice,
              sellingPrice: product.sellingPrice,
              vatRate: product.vatRate,
              amountHT: round(quantity * product.sellingPrice / (1 + product.vatRate / 100)),
              vatAmount: round(quantity * product.sellingPrice - quantity * product.sellingPrice / (1 + product.vatRate / 100)),
              amountTTC: round(quantity * product.sellingPrice),
              profit: round(quantity * (product.sellingPrice - product.purchasePrice)),
              paymentMethod,
            });
            created += 1;
          }
        }
      }

      const expenseData = {
        station: station._id,
        supplier: supplier._id,
        type: 'MAINTENANCE' as const,
        description: `Demo maintenance - ${station.name}`,
        amount: 125 + stationIndex * 10,
        paid: true,
        notes: `DEMO DATA: Maintenance expense for ${station.code}`,
      };
      if (!(await Expense.findOne({ station: station._id, notes: expenseData.notes }))) {
        await Expense.create(expenseData);
        created += 1;
      }

      const purchaseNote = `DEMO DATA: Fuel delivery for ${station.code}`;
      if (!(await ProductPurchase.findOne({ station: station._id, notes: purchaseNote }))) {
        await ProductPurchase.create({
          product: gasoil._id,
          station: station._id,
          supplier: supplier.name,
          quantity: 2500,
          unitCost: gasoil.purchasePrice,
          totalCost: round(2500 * gasoil.purchasePrice),
          notes: purchaseNote,
        });
        created += 1;
      }

      const orderNumber = `DEMO-PO-${station.code}`;
      if (!(await PurchaseOrder.findOne({ orderNumber }))) {
        await PurchaseOrder.create({
          supplier: supplier._id,
          station: station._id,
          orderNumber,
          orderDate: today,
          status: 'PENDING',
          items: [{ product: premium._id, quantity: 1500, unitPrice: premium.purchasePrice, tank: tanks[2]._id }],
          notes: `DEMO DATA: Pending order for ${station.name}`,
          createdBy: admin._id,
        });
        created += 1;
      }

      const gaugingNote = `DEMO DATA: Gauge for ${station.code}`;
      if (!(await TankGauging.findOne({ tank: tanks[0]._id, notes: gaugingNote }))) {
        await TankGauging.create({
          tank: tanks[0]._id,
          station: station._id,
          gaugedAt: new Date(today.getTime() + 7 * 60 * 60 * 1000),
          dipReading: 420,
          calculatedVolume: tanks[0].currentStock - 150,
          waterLevel: 12,
          temperature: 22,
          theoreticalStock: tanks[0].currentStock,
          variance: -150,
          operator: accounts.OPERATOR._id,
          notes: gaugingNote,
        });
        created += 1;
      }

      const kifNote = `DEMO DATA: Kif return for ${station.code}`;
      if (!(await KifReturn.findOne({ station: station._id, notes: kifNote }))) {
        await KifReturn.create({
          station: station._id,
          shift: morningShift._id,
          date: new Date(today.getTime() + 10 * 60 * 60 * 1000),
          product: gasoil._id,
          quantity: 8 + stationIndex,
          reason: 'Demo verification return',
          notes: kifNote,
          operator: accounts.OPERATOR._id,
        });
        created += 1;
      }

      const closureNote = `DEMO DATA: Daily closure for ${station.code}`;
      if (!(await DailyClosure.findOne({ station: station._id, notes: closureNote }))) {
        await DailyClosure.create({
          station: station._id,
          closureDate: today,
          status: 'OPEN',
          salesTTC: morningShift.totalSalesTTC,
          totalPayments: morningShift.totalPayments,
          totalExpenses: expenseData.amount,
          totalPurchases: 2500 * gasoil.purchasePrice,
          totalKifQuantity: 8 + stationIndex,
          variance: 0,
          isBalanced: true,
          notes: closureNote,
        });
        created += 1;
      }

      const creditNote = `DEMO DATA: Credit test for ${station.code}`;
      if (!(await CreditTransaction.findOne({ station: station._id, notes: creditNote }))) {
        await CreditTransaction.create({
          customer: customer._id,
          station: station._id,
          type: 'SALE',
          amount: 75 + stationIndex * 10,
          notes: creditNote,
        });
        created += 1;
      }
    }

    console.log(`[Demo seed] Completed. ${stations.length} stations are available; ${created} demo records added.`);
    console.log(`[Demo accounts] Password for generated manager, supervisor, and operator accounts: ${DEMO_PASSWORD}`);
    console.log('[Demo accounts] Usernames follow demo_<station-code>_<role>, for example demo_st002_manager.');
  } finally {
    await mongoose.disconnect();
  }
}

void seedDemo().catch((error: unknown) => {
  console.error('[Demo seed error]', error);
  process.exitCode = 1;
});
