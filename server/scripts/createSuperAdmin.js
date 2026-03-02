// server/scripts/createSuperAdmin.js – run from server dir: npm run create-superadmin
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartinfra';

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const email = 'superadmin@city.gov';
  const password = 'SuperAdmin123!';
  const fullName = 'City Super Admin';

  let user = await User.findOne({ email });
  if (user) {
    if (user.role === 'superadmin') {
      console.log('Super admin exists. Resetting password...');
      user.password = password;
      await user.save();
      console.log('Password updated for:', user.email);
    } else {
      console.log('User exists with wrong role. Deleting and recreating as superadmin...');
      await User.deleteOne({ email });
      user = await User.create({ email, password, fullName, role: 'superadmin' });
      console.log('Super admin created:', { id: user._id.toString(), email: user.email, role: user.role });
    }
  } else {
    user = await User.create({ email, password, fullName, role: 'superadmin' });
    console.log('Super admin created:', { id: user._id.toString(), email: user.email, role: user.role });
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
