import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: String,
    profileImage: String,
    role: { type: String, enum: ['user', 'admin', 'vendor'], default: 'user' },
    isActive: { type: Boolean, default: true },
    vendorStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: undefined },
    vendorProfile: {
      storeName: String,
      businessName: String,
      gstNumber: String,
      pickupAddress: String,
      description: String,
      supportEmail: String,
      payoutAccount: String,
      rejectionReason: String,
      approvedAt: Date,
      rejectedAt: Date
    },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

// Fields for password reset
userSchema.add({
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;

