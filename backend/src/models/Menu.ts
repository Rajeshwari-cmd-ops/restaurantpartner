import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  dishId: string;
  name: string;
  category: string;
  price: number;
  dietType: 'VEG' | 'NON_VEG' | 'EGG';
  description: string;
  imageUrl?: string;
  isAvailable: boolean;
  isEightysixed: boolean;
  prepTimeMins: number;
  rating: number;
  totalOrdersCount: number;
}

const MenuItemSchema: Schema = new Schema(
  {
    dishId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    dietType: { type: String, enum: ['VEG', 'NON_VEG', 'EGG'], default: 'VEG' },
    description: { type: String },
    imageUrl: { type: String },
    isAvailable: { type: Boolean, default: true },
    isEightysixed: { type: Boolean, default: false },
    prepTimeMins: { type: Number, default: 15 },
    rating: { type: Number, default: 4.8 },
    totalOrdersCount: { type: Number, default: 120 },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
