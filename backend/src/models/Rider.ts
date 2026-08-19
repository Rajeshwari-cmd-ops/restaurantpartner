import mongoose, { Schema, Document } from 'mongoose';

export interface IRider extends Document {
  riderId: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: 'EV Bike' | 'Motorcycle' | 'Bicycle';
  vehicleNumber: string;
  status: 'available' | 'assigned' | 'arrived_at_store' | 'on_delivery' | 'on_break' | 'offline';
  currentOrderId?: string;
  currentOrderNumber?: string;
  batteryLevel: number;
  rating: number;
  deliveriesToday: number;
  totalDistanceKm: number;
  location: { lat: number; lng: number; address: string };
  lastLocationUpdate: Date;
}

const RiderSchema: Schema = new Schema(
  {
    riderId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String, default: 'RD' },
    vehicleType: { type: String, enum: ['EV Bike', 'Motorcycle', 'Bicycle'], default: 'EV Bike' },
    vehicleNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'assigned', 'arrived_at_store', 'on_delivery', 'on_break', 'offline'],
      default: 'available',
    },
    currentOrderId: { type: String },
    currentOrderNumber: { type: String },
    batteryLevel: { type: Number, default: 85 },
    rating: { type: Number, default: 4.8 },
    deliveriesToday: { type: Number, default: 12 },
    totalDistanceKm: { type: Number, default: 42.5 },
    location: {
      lat: { type: Number, default: 12.8452 },
      lng: { type: Number, default: 77.6602 },
      address: { type: String, default: 'Electronic City Phase 1' },
    },
    lastLocationUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IRider>('Rider', RiderSchema);
