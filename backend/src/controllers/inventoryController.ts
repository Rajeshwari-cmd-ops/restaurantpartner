import { Request, Response } from 'express';
import Inventory from '../models/Inventory';
import { broadcastEvent } from '../socket/socketServer';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { currentStock, status, adjustQty, lastReceived } = req.body;
    const item = await Inventory.findOne({ $or: [{ _id: req.params.id }, { code: req.params.id }] });
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    if (adjustQty !== undefined) {
      item.currentStock = Math.max(0, item.currentStock + adjustQty);
      item.lastUsed = `Adjusted stock by ${adjustQty >= 0 ? '+' : ''}${adjustQty} ${item.unit}`;
    } else if (currentStock !== undefined) {
      item.currentStock = Math.max(0, currentStock);
    }

    if (lastReceived) {
      item.lastReceived = lastReceived;
    }

    item.status =
      item.currentStock === 0
        ? 'out_of_stock'
        : item.currentStock <= item.minThreshold
        ? 'low_stock'
        : 'in_stock';
    item.lastUpdated = 'Just now';

    await item.save();
    broadcastEvent('inventory_updated', item);

    res.json({ message: 'Inventory item updated successfully', item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
