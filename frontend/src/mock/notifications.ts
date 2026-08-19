import type { NotificationItem } from '../types';

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Order Received',
    message: 'Order #FIC-8891 worth ₹655 has been placed by Aarav Mehta.',
    time: '5 mins ago',
    read: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'Low Stock Alert',
    message: 'Amul Fresh Butter stock is below 5 kg threshold.',
    time: '30 mins ago',
    read: false,
    type: 'inventory',
  },
  {
    id: 'notif-3',
    title: 'Payout Processed',
    message: 'Weekly settlement of ₹38,400 successfully initiated.',
    time: 'Yesterday',
    read: true,
    type: 'finance',
  },
  {
    id: 'notif-4',
    title: 'System Update',
    message: 'Forge India Connect Portal upgraded to v2.4 with faster order dispatching.',
    time: '2 days ago',
    read: true,
    type: 'system',
  },
];
