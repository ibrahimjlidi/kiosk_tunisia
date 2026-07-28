import { Product } from '../models/Product';
import { Station } from '../models/Station';
import { Tank } from '../models/Tank';
import { Pump } from '../models/Pump';

export const seedStationData = async (): Promise<void> => {
  try {
    // 1. Seed Products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const gasoil = await Product.create({
        name: 'Diesel (Gasoil)',
        code: 'GASOIL',
        category: 'FUEL',
        purchasePrice: 1.850,
        sellingPrice: 2.200,
        vatRate: 19,
        unitOfMeasure: 'LITER',
        minStockAlert: 3000,
        currentStock: 15000,
      });

      const sansPlomb = await Product.create({
        name: 'Unleaded Petrol (Sans Plomb)',
        code: 'SANS_PLOMB',
        category: 'FUEL',
        purchasePrice: 2.100,
        sellingPrice: 2.520,
        vatRate: 19,
        unitOfMeasure: 'LITER',
        minStockAlert: 2500,
        currentStock: 18000,
      });

      const gasoil50 = await Product.create({
        name: 'Gasoil 50 Premium',
        code: 'GASOIL_50',
        category: 'FUEL',
        purchasePrice: 2.020,
        sellingPrice: 2.400,
        vatRate: 19,
        unitOfMeasure: 'LITER',
        minStockAlert: 2000,
        currentStock: 12000,
      });

      console.log('[Seed] Default Fuel Products created (Gasoil, Sans Plomb, Gasoil 50)');

      // 2. Seed Default Station
      let station = await Station.findOne({ code: 'ST-001' });
      if (!station) {
        station = await Station.create({
          name: 'Station Kiosque - Les Berges du Lac 2',
          code: 'ST-001',
          address: 'Avenue de la Bourse, Lac 2',
          city: 'Tunis',
          phone: '+216 71 999 888',
          taxId: '1234567/A/M/000',
        });
        console.log('[Seed] Default Station created (Lac 2 Tunis)');
      }

      // 3. Seed Tanks
      const tankCount = await Tank.countDocuments();
      if (tankCount === 0 && station) {
        await Tank.create([
          {
            station: station._id,
            product: gasoil._id,
            tankNumber: 'Tank 1 - Gasoil (25,000L)',
            capacity: 25000,
            currentStock: 15000,
            minLevelAlert: 3000,
          },
          {
            station: station._id,
            product: sansPlomb._id,
            tankNumber: 'Tank 2 - Sans Plomb (30,000L)',
            capacity: 30000,
            currentStock: 18000,
            minLevelAlert: 2500,
          },
          {
            station: station._id,
            product: gasoil50._id,
            tankNumber: 'Tank 3 - Gasoil 50 (20,000L)',
            capacity: 20000,
            currentStock: 12000,
            minLevelAlert: 2000,
          },
        ]);
        console.log('[Seed] Default Fuel Tanks created');
      }

      // 4. Seed Pumps & Pistols
      const pumpCount = await Pump.countDocuments();
      if (pumpCount === 0 && station) {
        await Pump.create([
          {
            station: station._id,
            pumpNumber: 'Pump 01',
            pistols: [
              { pistolNumber: 1, product: gasoil._id, currentClosingIndex: 125000.0 },
              { pistolNumber: 2, product: sansPlomb._id, currentClosingIndex: 98450.5 },
            ],
          },
          {
            station: station._id,
            pumpNumber: 'Pump 02',
            pistols: [
              { pistolNumber: 1, product: gasoil._id, currentClosingIndex: 110200.0 },
              { pistolNumber: 2, product: sansPlomb._id, currentClosingIndex: 85300.0 },
            ],
          },
          {
            station: station._id,
            pumpNumber: 'Pump 03',
            pistols: [
              { pistolNumber: 1, product: gasoil50._id, currentClosingIndex: 45200.0 },
              { pistolNumber: 2, product: sansPlomb._id, currentClosingIndex: 72100.5 },
            ],
          },
          {
            station: station._id,
            pumpNumber: 'Pump 04',
            pistols: [
              { pistolNumber: 1, product: gasoil._id, currentClosingIndex: 95400.0 },
              { pistolNumber: 2, product: gasoil50._id, currentClosingIndex: 38900.0 },
            ],
          },
        ]);
        console.log('[Seed] Default Pumps & Pistols created (4 Pumps, 8 Pistols)');
      }
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed station data:', (error as Error).message);
  }
};
