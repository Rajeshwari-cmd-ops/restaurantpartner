import { Request, Response } from 'express';
import Review from '../models/Review';
import { broadcastEvent } from '../socket/socketServer';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const replyToReview = async (req: Request, res: Response) => {
  try {
    const { replyText } = req.body;
    const review = await Review.findOne({ $or: [{ _id: req.params.id }, { reviewId: req.params.id }] });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.replied = true;
    review.replyText = replyText;
    review.replyDate = 'Just now';
    await review.save();

    broadcastEvent('review_updated', review);
    res.json({ message: 'Review response published successfully', review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
