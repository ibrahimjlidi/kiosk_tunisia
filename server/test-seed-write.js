const mongoose = require('mongoose');
const { User } = require('./dist/models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const u = await User.create({ username: 'testuser2', email: 'test2@example.com', password: 'Test1234', role: 'ADMIN', firstName: 'Test', lastName: 'User' });
  console.log(JSON.stringify({ id: u._id.toString(), username: u.username, email: u.email }));
  await mongoose.disconnect();
})();
