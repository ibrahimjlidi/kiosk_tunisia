import { Product } from '../models/Product';
import { Station } from '../models/Station';
import { Tank } from '../models/Tank';
import { Pump } from '../models/Pump';

const defaultProducts = [
  { name: 'Diesel (Gasoil)', code: 'GASOIL', purchasePrice: 1.85, sellingPrice: 2.2, minStockAlert: 3000, currentStock: 15000 },
  { name: 'Unleaded Petrol (Sans Plomb)', code: 'SANS_PLOMB', purchasePrice: 2.1, sellingPrice: 2.52, minStockAlert: 2500, currentStock: 18000 },
  { name: 'Gasoil 50 Premium', code: 'GASOIL_50', purchasePrice: 2.02, sellingPrice: 2.4, minStockAlert: 2000, currentStock: 12000 },
];

export const seedStationData = async (): Promise<void> => {
  try {
    const products = await Promise.all(defaultProducts.map(async (data) => (
      await Product.findOne({ code: data.code }) ?? await Product.create({
        ...data,
        category: 'FUEL',
        vatRate: 19,
        unitOfMeasure: 'LITER',
      })
    )));
    const station = await Station.findOne({ code: 'ST-001' }) ?? await Station.create({
      name: 'Station Kiosque - Les Berges du Lac 2',
      code: 'ST-001',
      address: 'Avenue de la Bourse, Lac 2',
      city: 'Tunis',
      phone: '+216 71 999 888',
      taxId: '1234567/A/M/000',
    });

    if (await Tank.countDocuments({ station: station._id }) === 0) {
      await Tank.create([
        { station: station._id, product: products[0]._id, tankNumber: 'Tank 1 - Gasoil (25,000L)', capacity: 25000, currentStock: 15000, minLevelAlert: 3000 },
        { station: station._id, product: products[1]._id, tankNumber: 'Tank 2 - Sans Plomb (30,000L)', capacity: 30000, currentStock: 18000, minLevelAlert: 2500 },
        { station: station._id, product: products[2]._id, tankNumber: 'Tank 3 - Gasoil 50 (20,000L)', capacity: 20000, currentStock: 12000, minLevelAlert: 2000 },
      ]);
    }

    if (await Pump.countDocuments({ station: station._id }) === 0) {
      const pumpSpecs = [
        ['Pump 01', [0, 1], [125000, 98450.5]],
        ['Pump 02', [0, 1], [110200, 85300]],
        ['Pump 03', [2, 1], [45200, 72100.5]],
        ['Pump 04', [0, 2], [95400, 38900]],
      ] as const;
      await Pump.create(pumpSpecs.map(([pumpNumber, productIndexes, indexes]) => ({
        station: station._id,
        pumpNumber,
        pistols: productIndexes.map((productIndex, index) => ({
          pistolNumber: index + 1,
          product: products[productIndex]._id,
          currentClosingIndex: indexes[index],
        })),
      })));
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed station data:', (error as Error).message);
  }
};
