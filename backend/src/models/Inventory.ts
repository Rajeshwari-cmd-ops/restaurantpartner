import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  code: string;
  name: string;
  category: 'Dairy' | 'Grains' | 'Poultry' | 'Produce' | 'Spices' | 'Oils & Sauces' | 'Packaging';
  currentStock: number;
  unit: string;
  minThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  unitCost: number;
  expiryDate: string;
  lotNumber: string;
  storageLocation: string;
  supplierName: string;
  lastUpdated: string;
  lastReceived: string;
  lastUsed: string;
}

const InventorySchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Dairy', 'Grains', 'Poultry', 'Produce', 'Spices', 'Oils & Sauces', 'Packaging'],
      default: 'Dairy',
    },
    currentStock: { type: Number, required: true },
    unit: { type: String, required: true },
    minThreshold: { type: Number, required: true },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    unitCost: { type: Number, required: true },
    expiryDate: { type: String },
    lotNumber: { type: String },
    storageLocation: { type: String, default: 'Main Pantry' },
    supplierName: { type: String },
    lastUpdated: { type: String, default: 'Just now' },
    lastReceived: { type: String },
    lastUsed: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>('Inventory', InventorySchema);
