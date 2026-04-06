import mongoose from 'mongoose';

const accessSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  appSlug: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  access: [accessSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
