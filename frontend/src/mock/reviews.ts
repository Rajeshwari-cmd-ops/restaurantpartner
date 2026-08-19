import type { Review } from '../types';

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Aarav Mehta',
    rating: 5,
    orderNumber: '#FIC-8891',
    comment: 'Best Paneer Butter Masala in town! Arrived super hot and fresh.',
    date: '2 hours ago',
    replied: true,
    replyText: 'Thank you Aarav! Glad you enjoyed the meal.',
  },
  {
    id: 'rev-2',
    customerName: 'Priya Sharma',
    rating: 4,
    orderNumber: '#FIC-8890',
    comment: 'Biryani was delicious and full of flavor. Slightly spicy but great portion.',
    date: 'Yesterday',
    replied: false,
  },
  {
    id: 'rev-3',
    customerName: 'Siddharth Verma',
    rating: 2,
    orderNumber: '#FIC-8850',
    comment: 'Delivery took almost 50 minutes. Food was lukewarm.',
    date: '3 days ago',
    replied: true,
    replyText: 'We sincerely apologize Siddharth. We are improving our dispatch speed.',
  },
];
