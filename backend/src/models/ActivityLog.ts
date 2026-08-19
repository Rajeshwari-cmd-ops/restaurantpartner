import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  module: 'ORDER' | 'KITCHEN' | 'DISPATCH' | 'RIDER' | 'INVENTORY' | 'MENU' | 'CRM' | 'AUTH';
  details: string;
  performedBy: string;
  timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    action: { type: String, required: true },
    module: {
      type: String,
      enum: ['ORDER', 'KITCHEN', 'DISPATCH', 'RIDER', 'INVENTORY', 'MENU', 'CRM', 'AUTH'],
      required: true,
    },
    details: { type: String, required: true },
    performedBy: { type: String, default: 'System Engine' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
