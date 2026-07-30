import { CreditTransaction } from '../models/CreditTransaction';
import mongoose from 'mongoose';

/**
 * Build aging buckets for credit transactions per customer.
 * Buckets: 0-30,31-60,61-90,>90 days
 */
export const creditAgingReport = async (station?: string) => {
  const match: any = {};
  if (station) match.station = new mongoose.Types.ObjectId(station);

  const pipeline: any[] = [
    { $match: match },
    {
      $addFields: {
        daysOld: { $dateDiff: { startDate: '$createdAt', endDate: '$$NOW', unit: 'day' } }
      }
    },
    {
      $group: {
        _id: '$customer',
        totalBalance: { $sum: '$amount' },
        bucket0_30: { $sum: { $cond: [{ $and: [{ $gte: ['$daysOld', 0] }, { $lte: ['$daysOld', 30] }] }, '$amount', 0] } },
        bucket31_60: { $sum: { $cond: [{ $and: [{ $gte: ['$daysOld', 31] }, { $lte: ['$daysOld', 60] }] }, '$amount', 0] } },
        bucket61_90: { $sum: { $cond: [{ $and: [{ $gte: ['$daysOld', 61] }, { $lte: ['$daysOld', 90] }] }, '$amount', 0] } },
        bucket90p: { $sum: { $cond: [{ $gt: ['$daysOld', 90] }, '$amount', 0] } },
        lastTxAt: { $max: '$createdAt' },
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    { $project: { customer: { _id: 1, name: 1, phone: 1, creditBalance: '$customer.creditBalance' }, totalBalance: 1, bucket0_30: 1, bucket31_60:1, bucket61_90:1, bucket90p:1, lastTxAt:1 } },
    { $sort: { totalBalance: -1 } }
  ];

  return CreditTransaction.aggregate(pipeline);
};
