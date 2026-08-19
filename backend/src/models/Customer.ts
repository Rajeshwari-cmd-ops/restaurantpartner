import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  segment: 'VIP Platinum' | 'VIP Gold' | 'Regular' | 'New Guest' | 'At Risk';
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  favoriteItem: string;
  lastOrderDate: string;
  joinedDate: string;
  loyaltyPoints: number;
  ratingGiven: number;
  lastReviewText: string;
  pastOrders: { orderId: string; date: string; amount: number; items: string; status: string }[];
  status: 'active' | 'at_risk' | 'churned';
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: 'CG' },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    segment: {
      type: String,
      enum: ['VIP Platinum', 'VIP Gold', 'Regular', 'New Guest', 'At Risk'],
      default: 'Regular',
    },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    favoriteItem: { type: String, default: 'Chicken Dum Biryani' },
    lastOrderDate: { type: String, default: 'Today' },
    joinedDate: { type: String, default: 'Jan 2024' },
    loyaltyPoints: { type: Number, default: 100 },
    ratingGiven: { type: Number, default: 5.0 },
    lastReviewText: { type: String },
    pastOrders: [
      {
        orderId: { type: String },
        date: { type: String },
        amount: { type: Number },
        items: { type: String },
        status: { type: String },
      },
    ],
    status: { type: String, enum: ['active', 'at_risk', 'churned'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
