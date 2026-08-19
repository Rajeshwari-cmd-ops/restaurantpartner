import { Request, Response } from 'express';
import MenuItem from '../models/Menu';
import Category from '../models/Category';
import { broadcastEvent } from '../socket/socketServer';

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleEightysixItem = async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findOne({ $or: [{ _id: req.params.id }, { dishId: req.params.id }] });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });

    item.isEightysixed = !item.isEightysixed;
    item.isAvailable = !item.isEightysixed;
    await item.save();

    broadcastEvent('menu_updated', item);
    res.json({ message: `Item ${item.name} 86'd status updated to ${item.isEightysixed}`, item });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
