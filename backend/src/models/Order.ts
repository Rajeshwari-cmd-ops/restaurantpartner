import mongoose, { Schema, Document } from 'mongoose';

export type OrderWorkflowStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'COOKING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'RIDER_ARRIVED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  unitCost?: number;
  customization?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryType: 'DELIVERY' | 'TAKEOUT' | 'DINE_IN';
  channel: 'Swiggy' | 'Zomato' | 'Direct Store' | 'POS Counter';
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'COD';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: OrderWorkflowStatus;
  cookingTimeEst: number; // in minutes
  preparationStartedAt?: Date;
  readyAt?: Date;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    deliveryType: {
      type: String,
      enum: ['DELIVERY', 'TAKEOUT', 'DINE_IN'],
      default: 'DELIVERY',
    },
    channel: {
      type: String,
      enum: ['Swiggy', 'Zomato', 'Direct Store', 'POS Counter'],
      default: 'Direct Store',
    },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        unitCost: { type: Number, default: 0 },
        customization: { type: String },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'CARD', 'COD'], default: 'UPI' },
    paymentStatus: { type: String, enum: ['PAID', 'PENDING', 'REFUNDED'], default: 'PAID' },
    status: {
      type: String,
      enum: [
        'PLACED',
        'ACCEPTED',
        'COOKING',
        'READY_FOR_PICKUP',
        'ASSIGNED',
        'RIDER_ARRIVED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    cookingTimeEst: { type: Number, default: 15 },
    preparationStartedAt: { type: Date },
    readyAt: { type: Date },
    riderId: { type: String },
    riderName: { type: String },
    riderPhone: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
