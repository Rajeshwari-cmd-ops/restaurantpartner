import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportDate: string;
  grossRevenue: number;
  totalOrders: number;
  avgPreparationTimeMins: number;
  onTimeDeliveryPct: number;
  topSellingDishes: { name: string; ordersCount: number; revenue: number }[];
  categoryBreakdown: { category: string; percentage: number; revenue: number }[];
}

const ReportSchema: Schema = new Schema(
  {
    reportDate: { type: String, required: true, unique: true },
    grossRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    avgPreparationTimeMins: { type: Number, default: 12.4 },
    onTimeDeliveryPct: { type: Number, default: 97.8 },
    topSellingDishes: [
      {
        name: { type: String },
        ordersCount: { type: Number },
        revenue: { type: Number },
      },
    ],
    categoryBreakdown: [
      {
        category: { type: String },
        percentage: { type: Number },
        revenue: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', ReportSchema);
