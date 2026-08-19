import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { broadcastEvent } from '../socket/socketServer';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ totalSpent: -1 });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addLoyaltyPoints = async (req: Request, res: Response) => {
  try {
    const { bonusPts } = req.body;
    const customer = await Customer.findOne({ $or: [{ _id: req.params.id }, { customerId: req.params.id }] });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    customer.loyaltyPoints += (bonusPts || 100);
    await customer.save();
    broadcastEvent('customer_updated', customer);

    res.json({ message: 'Loyalty points added successfully', customer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
