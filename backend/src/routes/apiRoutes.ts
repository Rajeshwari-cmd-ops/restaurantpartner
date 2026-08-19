import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orderController';
import { getKitchenTickets, updateKitchenTicketStatus } from '../controllers/kitchenController';
import { getRiders, updateRiderStatus } from '../controllers/riderController';
import { getInventory, updateInventoryItem } from '../controllers/inventoryController';
import { getCustomers, addLoyaltyPoints } from '../controllers/customerController';
import { getMenuItems, getCategories, toggleEightysixItem } from '../controllers/menuController';
import { getReviews, replyToReview } from '../controllers/reviewController';
import { getExecutiveReport } from '../controllers/reportController';
import { handleSeedDatabase } from '../controllers/seedController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'Forge India Connect API' });
});

// Database Seed Route
router.post('/seed', handleSeedDatabase);

// Auth Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.get('/user/me', getCurrentUser);

// Restaurant Profile
router.get('/restaurant', (_req, res) => {
  res.json({
    id: 'rest-01',
    name: 'Spice Junction',
    branch: 'Electronic City Phase 1',
    address: '142, Hosur Main Road, Electronic City, Bengaluru - 560100',
    isOnline: true,
    rating: 4.8,
    activeOrdersCount: 8,
  });
});

// Orders & Shared Workflow REST APIs
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Kitchen KDS REST APIs
router.get('/kitchen/tickets', getKitchenTickets);
router.patch('/kitchen/tickets/:id/status', updateKitchenTicketStatus);

// Rider Dispatch REST APIs
router.get('/riders', getRiders);
router.patch('/riders/:id/status', updateRiderStatus);

// Inventory REST APIs
router.get('/inventory', getInventory);
router.patch('/inventory/:id', updateInventoryItem);

// Customer CRM REST APIs
router.get('/customers', getCustomers);
router.post('/customers/:id/loyalty', addLoyaltyPoints);

// Menu & Categories REST APIs
router.get('/menu', getMenuItems);
router.get('/categories', getCategories);
router.patch('/menu/:id/86', toggleEightysixItem);

// Reviews REST APIs
router.get('/reviews', getReviews);
router.post('/reviews/:id/reply', replyToReview);

// Reports REST APIs
router.get('/reports/executive', getExecutiveReport);

export default router;
