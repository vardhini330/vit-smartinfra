import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'official', 'citizen'], required: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  // Prevent role changes after initial creation to avoid privilege escalation
  if (!this.isNew && this.isModified('role')) {
    return next(new Error('Role cannot be changed after creation'));
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Also guard against role changes via findOneAndUpdate-style operations
userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  const directRoleChange = Object.prototype.hasOwnProperty.call(update, 'role');
  const setRoleChange = update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'role');

  if (directRoleChange || setRoleChange) {
    return next(new Error('Role cannot be changed after creation'));
  }

  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
