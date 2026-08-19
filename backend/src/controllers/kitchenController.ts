import { Request, Response } from 'express';
import KitchenTicket from '../models/Kitchen';
import { broadcastEvent } from '../socket/socketServer';

export const getKitchenTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await KitchenTicket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateKitchenTicketStatus = async (req: Request, res: Response) => {
  try {
    const { status, chefAssigned } = req.body;
    const ticket = await KitchenTicket.findOne({ $or: [{ _id: req.params.id }, { ticketId: req.params.id }] });
    if (!ticket) return res.status(404).json({ error: 'Kitchen Ticket not found' });

    if (status) ticket.status = status;
    if (chefAssigned) ticket.chefAssigned = chefAssigned;
    if (status === 'READY') ticket.completedAt = new Date();

    await ticket.save();
    broadcastEvent('kitchen_updated', ticket);

    res.json({ message: 'Kitchen ticket updated successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
