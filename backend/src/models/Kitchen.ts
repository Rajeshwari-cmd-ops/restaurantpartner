import mongoose, { Schema, Document } from 'mongoose';

export interface IKitchenTicket extends Document {
  ticketId: string;
  orderId: string;
  orderNumber: string;
  station: 'Tandoor' | 'Curry & Gravy' | 'Biryani & Rice' | 'Beverages & Desserts' | 'Packaging';
  chefAssigned?: string;
  items: { name: string; quantity: number; notes?: string; completed: boolean }[];
  priority: 'NORMAL' | 'VIP' | 'EXPRESS';
  status: 'QUEUED' | 'PREPARING' | 'READY' | 'DISPATCHED';
  startedAt?: Date;
  completedAt?: Date;
}

const KitchenTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true },
    orderNumber: { type: String, required: true },
    station: {
      type: String,
      enum: ['Tandoor', 'Curry & Gravy', 'Biryani & Rice', 'Beverages & Desserts', 'Packaging'],
      default: 'Curry & Gravy',
    },
    chefAssigned: { type: String, default: 'Chef Suresh' },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        notes: { type: String },
        completed: { type: Boolean, default: false },
      },
    ],
    priority: { type: String, enum: ['NORMAL', 'VIP', 'EXPRESS'], default: 'NORMAL' },
    status: {
      type: String,
      enum: ['QUEUED', 'PREPARING', 'READY', 'DISPATCHED'],
      default: 'PREPARING',
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IKitchenTicket>('KitchenTicket', KitchenTicketSchema);
