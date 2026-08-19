import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'kitchen_chef' | 'rider' | 'cashier';
  phone: string;
  avatar?: string;
  outletId: string;
  outletName: string;
  isOnline: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'manager', 'kitchen_chef', 'rider', 'cashier'],
      default: 'manager',
    },
    phone: { type: String, required: true },
    avatar: { type: String, default: 'RS' },
    outletId: { type: String, default: 'outlet-01' },
    outletName: { type: String, default: 'Spice Junction - Electronic City Phase 1' },
    isOnline: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
