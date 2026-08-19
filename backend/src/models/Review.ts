import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewId: string;
  customerName: string;
  customerSegment: string;
  rating: number;
  orderNumber: string;
  orderAmount: number;
  orderedItems: string[];
  comment: string;
  replied: boolean;
  replyText?: string;
  replyDate?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

const ReviewSchema: Schema = new Schema(
  {
    reviewId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerSegment: { type: String, default: 'VIP Gold' },
    rating: { type: Number, required: true },
    orderNumber: { type: String, required: true },
    orderAmount: { type: Number, required: true },
    orderedItems: [{ type: String }],
    comment: { type: String, required: true },
    replied: { type: Boolean, default: false },
    replyText: { type: String },
    replyDate: { type: String },
    sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Positive' },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
