import { Request, Response } from 'express';
import { seedDatabase } from '../seed/seedData';

export const handleSeedDatabase = async (_req: Request, res: Response) => {
  const result = await seedDatabase();
  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ error: result.error });
  }
};
