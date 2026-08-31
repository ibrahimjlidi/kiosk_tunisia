import mongoose from 'mongoose';
import { User } from './src/models/User.ts';
console.log('connecting');
await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/fuelstation_erp');
console.log('connected');
try {
  const user = await User.create({ username: 'diaguser2', email: 'diag2@example.com', password: 'Test1234', role: 'ADMIN', firstName: 'Diag', lastName: 'User' });
  console.log('created', user._id.toString());
} catch (err) {
  console.error('ERROR', err);
}
await mongoose.disconnect();
