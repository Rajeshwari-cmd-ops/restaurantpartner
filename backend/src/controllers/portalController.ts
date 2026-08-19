import { Request, Response } from 'express';
import restaurantData from '../data/restaurant.json';

// In-memory data store for live API operations
let restaurantProfile = { ...restaurantData };

let ordersList = [
  {
    id: 'ord-1001',
    orderNumber: '#FIC-8897',
    customerName: 'Karan Patel',
    customerPhone: '+91 9887 44321',
    deliveryType: 'delivery',
    status: 'new',
    paymentStatus: 'paid',
    totalAmount: 1712,
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    items: [
      { id: 'itm-1', name: 'Paneer Butter Masala', quantity: 2, price: 340, isVeg: true },
      { id: 'itm-2', name: 'Chicken Dum Biryani', quantity: 2, price: 380, isVeg: false },
      { id: 'itm-3', name: 'Garlic Butter Naan', quantity: 4, price: 75, isVeg: true },
    ],
  },
  {
    id: 'ord-1002',
    orderNumber: '#FIC-8891',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98201 11223',
    deliveryType: 'delivery',
    status: 'new',
    paymentStatus: 'paid',
    totalAmount: 1040,
    createdAt: new Date(Date.now() - 9 * 60000).toISOString(),
    items: [
      { id: 'itm-1', name: 'Paneer Butter Masala', quantity: 2, price: 340, isVeg: true },
      { id: 'itm-3', name: 'Butter Naan', quantity: 4, price: 45, isVeg: true },
      { id: 'itm-4', name: 'Jeera Rice', quantity: 1, price: 180, isVeg: true },
    ],
  },
  {
    id: 'ord-1003',
    orderNumber: '#FIC-8890',
    customerName: 'Priya Sharma',
    customerPhone: '+91 9100 44332',
    deliveryType: 'delivery',
    status: 'preparing',
    paymentStatus: 'paid',
    totalAmount: 1050,
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    items: [
      { id: 'itm-2', name: 'Chicken Dum Biryani', quantity: 2, price: 420, isVeg: false },
      { id: 'itm-5', name: 'Mirchi Ka Salan', quantity: 1, price: 90, isVeg: true },
      { id: 'itm-6', name: 'Mango Lassi', quantity: 1, price: 120, isVeg: true },
    ],
  },
  {
    id: 'ord-1004',
    orderNumber: '#FIC-8889',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 7112 88776',
    deliveryType: 'pickup',
    status: 'ready',
    paymentStatus: 'paid',
    totalAmount: 520,
    createdAt: new Date(Date.now() - 34 * 60000).toISOString(),
    items: [
      { id: 'itm-7', name: 'Dal Makhani', quantity: 1, price: 290, isVeg: true },
      { id: 'itm-3', name: 'Garlic Naan', quantity: 2, price: 60, isVeg: true },
      { id: 'itm-8', name: 'Gulab Jamun', quantity: 1, price: 110, isVeg: true },
    ],
  },
];

let inventoryList = [
  { id: 'inv-1', name: 'Fresh Malai Paneer', sku: 'ING-101', category: 'Dairy', currentStock: 18, minThreshold: 10, unit: 'kg', pricePerUnit: 280, status: 'in_stock' },
  { id: 'inv-2', name: 'Premium Basmati Rice', sku: 'ING-102', category: 'Grains', currentStock: 45, minThreshold: 20, unit: 'kg', pricePerUnit: 120, status: 'in_stock' },
  { id: 'inv-3', name: 'Amul Fresh Cooking Butter', sku: 'ING-103', category: 'Dairy', currentStock: 3.5, minThreshold: 5, unit: 'kg', pricePerUnit: 440, status: 'low_stock' },
  { id: 'inv-4', name: 'Fresh Farm Chicken', sku: 'ING-104', category: 'Poultry', currentStock: 0, minThreshold: 15, unit: 'kg', pricePerUnit: 210, status: 'out_of_stock' },
  { id: 'inv-5', name: 'Mysore Curry Spice Blend', sku: 'ING-105', category: 'Spices', currentStock: 8, minThreshold: 3, unit: 'kg', pricePerUnit: 350, status: 'in_stock' },
];

let ridersList = [
  { id: 'r-1', name: 'Ramesh Kumar', phone: '+91 8765 43210', liveStatus: 'on_delivery', currentAssignment: '#FIC-8891', liveEtaOrDist: '12m ETA (2.4 km)' },
  { id: 'r-2', name: 'Suresh Kumar', phone: '+91 8765 12345', liveStatus: 'idle', currentAssignment: 'None (Idle at Outlet)', liveEtaOrDist: '0.2 km from outlet' },
  { id: 'r-3', name: 'Suresh P', phone: '+91 8765 43211', liveStatus: 'picking_up', currentAssignment: '#FIC-8889', liveEtaOrDist: '8m ETA (1.5 km)' },
];

export const getHealthStatus = (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'Forge India Connect - Restaurant Partner Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

export const getRestaurantProfile = (_req: Request, res: Response) => {
  res.json({ success: true, data: restaurantProfile });
};

export const toggleOnlineStatus = (req: Request, res: Response) => {
  const { isOnline } = req.body;
  if (typeof isOnline === 'boolean') {
    restaurantProfile.isOnline = isOnline;
  } else {
    restaurantProfile.isOnline = !restaurantProfile.isOnline;
  }
  res.json({ success: true, isOnline: restaurantProfile.isOnline });
};

export const getOrders = (req: Request, res: Response) => {
  const { status, search } = req.query;
  let results = [...ordersList];

  if (status && status !== 'all') {
    results = results.filter((o) => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
    );
  }

  res.json({ success: true, total: results.length, data: results });
};

export const createOrder = (req: Request, res: Response) => {
  const { customerName, customerPhone, deliveryType, items, totalAmount } = req.body;
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: `#FIC-${Math.floor(8000 + Math.random() * 1000)}`,
    customerName: customerName || 'Walk-in Guest',
    customerPhone: customerPhone || '+91 98000 11223',
    deliveryType: deliveryType || 'delivery',
    status: 'new',
    paymentStatus: 'paid',
    totalAmount: totalAmount || 500,
    createdAt: new Date().toISOString(),
    items: items || [],
  };

  ordersList = [newOrder, ...ordersList];
  res.status(201).json({ success: true, data: newOrder });
};

export const updateOrderStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const orderIndex = ordersList.findIndex(o => o.id === id || o.orderNumber === id);
  if (orderIndex === -1) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  ordersList[orderIndex].status = status;
  res.json({ success: true, data: ordersList[orderIndex] });
};

export const getInventory = (_req: Request, res: Response) => {
  res.json({ success: true, total: inventoryList.length, data: inventoryList });
};

export const updateInventoryItem = (req: Request, res: Response) => {
  const { id } = req.params;
  const { currentStock } = req.body;

  const itemIndex = inventoryList.findIndex(i => i.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ success: false, message: 'Item not found' });
    return;
  }

  if (typeof currentStock === 'number') {
    inventoryList[itemIndex].currentStock = currentStock;
    inventoryList[itemIndex].status =
      currentStock <= 0 ? 'out_of_stock' : currentStock <= inventoryList[itemIndex].minThreshold ? 'low_stock' : 'in_stock';
  }

  res.json({ success: true, data: inventoryList[itemIndex] });
};

export const getRiders = (_req: Request, res: Response) => {
  res.json({ success: true, total: ridersList.length, data: ridersList });
};

export const updateRiderStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { liveStatus } = req.body;

  const riderIndex = ridersList.findIndex(r => r.id === id);
  if (riderIndex === -1) {
    res.status(404).json({ success: false, message: 'Rider not found' });
    return;
  }

  ridersList[riderIndex].liveStatus = liveStatus;
  res.json({ success: true, data: ridersList[riderIndex] });
};
