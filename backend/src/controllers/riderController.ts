import { Request, Response } from 'express';
import Rider from '../models/Rider';
import { broadcastEvent } from '../socket/socketServer';

export const getRiders = async (req: Request, res: Response) => {
  try {
    const riders = await Rider.find().sort({ name: 1 });
    res.json(riders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRiderStatus = async (req: Request, res: Response) => {
  try {
    const { status, batteryLevel, location } = req.body;
    const rider = await Rider.findOne({ $or: [{ _id: req.params.id }, { riderId: req.params.id }] });
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    if (status) rider.status = status;
    if (batteryLevel !== undefined) rider.batteryLevel = batteryLevel;
    if (location) {
      rider.location = location;
      rider.lastLocationUpdate = new Date();
    }

    await rider.save();
    broadcastEvent('rider_updated', rider);

    res.json({ message: 'Rider status updated successfully', rider });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
