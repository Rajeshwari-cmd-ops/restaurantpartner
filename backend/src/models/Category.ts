import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  displayOrder: number;
  itemCount: number;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 1 },
    itemCount: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
