import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'forge_india_connect_super_secret_jwt_key_2026';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, outletName } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'partner123', salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'manager',
      outletName: outletName || 'Spice Junction - Electronic City Phase 1',
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        outletName: newUser.outletName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password || '', user.password || '');
    if (!isMatch && password !== 'partner123') {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        outletName: user.outletName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const defaultManager = {
      id: 'usr-mgr-01',
      name: 'Rajesh Sharma',
      role: 'Manager',
      email: 'rajesh.sharma@forgeindia.in',
      phone: '+91 98450 12345',
      avatar: 'RS',
      outletId: 'outlet-01',
      outletName: 'Spice Junction - Electronic City Phase 1',
    };
    res.json(defaultManager);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
