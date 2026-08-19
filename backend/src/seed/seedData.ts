import bcrypt from 'bcryptjs';
import User from '../models/User';
import Order from '../models/Order';
import KitchenTicket from '../models/Kitchen';
import Rider from '../models/Rider';
import Inventory from '../models/Inventory';
import Customer from '../models/Customer';
import MenuItem from '../models/Menu';
import Category from '../models/Category';
import Review from '../models/Review';
import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';

export const seedDatabase = async () => {
  try {
    console.log('[Seed Engine] Seeding MongoDB with production-grade restaurant demo data...');

    // 1. Seed Users
    await User.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('partner123', salt);

    await User.create([
      {
        name: 'Rajesh Sharma',
        email: 'rajesh.sharma@forgeindia.in',
        password: passHash,
        phone: '+91 98450 12345',
        role: 'manager',
        avatar: 'RS',
        outletName: 'Spice Junction - Electronic City Phase 1',
      },
      {
        name: 'Chef Suresh Kumar',
        email: 'chef.suresh@forgeindia.in',
        password: passHash,
        phone: '+91 98450 99887',
        role: 'kitchen_chef',
        avatar: 'SK',
        outletName: 'Spice Junction - Electronic City Phase 1',
      },
    ]);

    // 2. Seed Orders
    await Order.deleteMany({});
    const initialOrders = await Order.create([
      {
        orderNumber: '#FIC-8891',
        customerName: 'Priya Sharma',
        customerPhone: '+91 98765 43210',
        customerAddress: 'Flat 402, NeoTown Apts, Electronic City Phase 1',
        deliveryType: 'DELIVERY',
        channel: 'Swiggy',
        items: [
          { itemId: 'ing-1', name: 'Fresh Malai Paneer Tikka', quantity: 2, price: 320 },
          { itemId: 'ing-3', name: 'Garlic Butter Naan', quantity: 3, price: 60 },
        ],
        subtotal: 820,
        tax: 41,
        totalAmount: 861,
        paymentMethod: 'UPI',
        status: 'COOKING',
        cookingTimeEst: 15,
        riderId: 'rider-1',
        riderName: 'Ramesh Kumar',
        riderPhone: '+91 98450 11223',
      },
      {
        orderNumber: '#FIC-8890',
        customerName: 'Rahul Verma',
        customerPhone: '+91 98123 45678',
        customerAddress: 'Villa 12, Green Glen Layout, Bellandur',
        deliveryType: 'DELIVERY',
        channel: 'Direct Store',
        items: [
          { itemId: 'ing-2', name: 'Chicken Dum Biryani (Full)', quantity: 1, price: 350 },
          { itemId: 'ing-5', name: 'Sweet Mango Lassi', quantity: 2, price: 90 },
        ],
        subtotal: 530,
        tax: 26.5,
        totalAmount: 556.5,
        paymentMethod: 'UPI',
        status: 'READY_FOR_PICKUP',
        cookingTimeEst: 12,
        riderId: 'rider-2',
        riderName: 'Suresh P',
        riderPhone: '+91 98860 33445',
      },
    ]);

    // 3. Seed Kitchen Tickets
    await KitchenTicket.deleteMany({});
    await KitchenTicket.create([
      {
        ticketId: 'tkt-8891',
        orderId: initialOrders[0]._id.toString(),
        orderNumber: '#FIC-8891',
        station: 'Tandoor',
        chefAssigned: 'Chef Suresh',
        items: [
          { name: 'Fresh Malai Paneer Tikka', quantity: 2, completed: true },
          { name: 'Garlic Butter Naan', quantity: 3, completed: false },
        ],
        priority: 'VIP',
        status: 'PREPARING',
      },
      {
        ticketId: 'tkt-8890',
        orderId: initialOrders[1]._id.toString(),
        orderNumber: '#FIC-8890',
        station: 'Biryani & Rice',
        chefAssigned: 'Chef Anil',
        items: [
          { name: 'Chicken Dum Biryani (Full)', quantity: 1, completed: true },
          { name: 'Sweet Mango Lassi', quantity: 2, completed: true },
        ],
        priority: 'NORMAL',
        status: 'READY',
      },
    ]);

    // 4. Seed Riders
    await Rider.deleteMany({});
    await Rider.create([
      {
        riderId: 'rider-1',
        name: 'Ramesh Kumar',
        phone: '+91 98450 11223',
        avatar: 'RK',
        vehicleType: 'EV Bike',
        vehicleNumber: 'KA-01-EQ-9921',
        status: 'assigned',
        currentOrderNumber: '#FIC-8891',
        batteryLevel: 92,
        rating: 4.9,
        deliveriesToday: 14,
      },
      {
        riderId: 'rider-2',
        name: 'Suresh P',
        phone: '+91 98860 33445',
        avatar: 'SP',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'KA-05-MK-4412',
        status: 'available',
        batteryLevel: 88,
        rating: 4.8,
        deliveriesToday: 11,
      },
    ]);

    // 5. Seed Inventory SKUs
    await Inventory.deleteMany({});
    await Inventory.create([
      {
        code: 'ING-101',
        name: 'Fresh Malai Paneer',
        category: 'Dairy',
        currentStock: 18,
        unit: 'kg',
        minThreshold: 10,
        status: 'in_stock',
        unitCost: 280,
        expiryDate: '30 Aug 2026',
        lotNumber: 'LOT-9821',
        storageLocation: 'Cold Room Chiller #1',
        supplierName: 'MilkyMist Dairy Co.',
      },
      {
        code: 'ING-102',
        name: 'Premium Basmati Rice (Long Grain)',
        category: 'Grains',
        currentStock: 45,
        unit: 'kg',
        minThreshold: 20,
        status: 'in_stock',
        unitCost: 120,
        expiryDate: '15 Dec 2026',
        lotNumber: 'LOT-4412',
        storageLocation: 'Dry Pantry Section B',
        supplierName: 'Fortune Foods Pvt Ltd',
      },
      {
        code: 'ING-103',
        name: 'Amul Fresh Cooking Butter',
        category: 'Dairy',
        currentStock: 3.5,
        unit: 'kg',
        minThreshold: 5,
        status: 'low_stock',
        unitCost: 440,
        expiryDate: '12 Aug 2026',
        lotNumber: 'LOT-8810',
        storageLocation: 'Cold Room Chiller #1',
        supplierName: 'Gujarat Milk Federation',
      },
    ]);

    // 6. Seed Customer CRM Profiles
    await Customer.deleteMany({});
    await Customer.create([
      {
        customerId: 'c-101',
        name: 'Priya Sharma',
        avatar: 'PS',
        phone: '+91 98765 43210',
        email: 'priya.sharma@example.com',
        address: 'Flat 402, NeoTown Apts, Electronic City Phase 1',
        segment: 'VIP Platinum',
        totalOrders: 28,
        totalSpent: 14560,
        avgOrderValue: 520,
        favoriteItem: 'Chicken Dum Biryani',
        lastOrderDate: 'Today, 1:15 PM',
        loyaltyPoints: 1450,
        ratingGiven: 5.0,
        status: 'active',
      },
      {
        customerId: 'c-102',
        name: 'Rahul Verma',
        avatar: 'RV',
        phone: '+91 98123 45678',
        email: 'rahul.v@example.com',
        address: 'Villa 12, Green Glen Layout, Bellandur',
        segment: 'VIP Gold',
        totalOrders: 19,
        totalSpent: 9120,
        avgOrderValue: 480,
        favoriteItem: 'Paneer Butter Masala',
        lastOrderDate: 'Yesterday',
        loyaltyPoints: 910,
        ratingGiven: 4.8,
        status: 'active',
      },
    ]);

    // 7. Seed Menu Items & Categories
    await MenuItem.deleteMany({});
    await MenuItem.create([
      {
        dishId: 'm-101',
        name: 'Fresh Malai Paneer Tikka',
        category: 'Starters & Appetizers',
        price: 320,
        dietType: 'VEG',
        description: 'Cottage cheese marinated in yogurt and tandoori spices.',
        isAvailable: true,
        isEightysixed: false,
        rating: 4.9,
      },
      {
        dishId: 'm-102',
        name: 'Chicken Dum Biryani (Full)',
        category: 'Combos & Biryani',
        price: 350,
        dietType: 'NON_VEG',
        description: 'Hyderabadi style slow cooked biryani with aromatic basmati rice.',
        isAvailable: true,
        isEightysixed: false,
        rating: 4.8,
      },
    ]);

    await Category.deleteMany({});
    await Category.create([
      { categoryId: 'cat-1', name: 'Starters & Appetizers', displayOrder: 1, itemCount: 12 },
      { categoryId: 'cat-2', name: 'Main Course & Curries', displayOrder: 2, itemCount: 18 },
      { categoryId: 'cat-3', name: 'Combos & Biryani', displayOrder: 3, itemCount: 8 },
    ]);

    // 8. Seed Reviews
    await Review.deleteMany({});
    await Review.create([
      {
        reviewId: 'rev-1',
        customerName: 'Aarav Mehta',
        customerSegment: 'VIP Platinum',
        rating: 5,
        orderNumber: '#FIC-8891',
        orderAmount: 680,
        orderedItems: ['Fresh Malai Paneer Tikka', 'Garlic Butter Naan'],
        comment: 'Best Paneer Butter Masala in town! Arrived super hot and fresh.',
        replied: true,
        replyText: 'Thank you Aarav! Glad you enjoyed the meal.',
        sentiment: 'Positive',
      },
    ]);

    // 9. Seed Reports
    await Report.deleteMany({});
    await Report.create({
      reportDate: '2026-07-31',
      grossRevenue: 482450,
      totalOrders: 1048,
      avgPreparationTimeMins: 12.4,
      onTimeDeliveryPct: 97.8,
    });

    // 10. Seed Activity Log
    await ActivityLog.deleteMany({});
    await ActivityLog.create({
      action: 'SYSTEM_BOOT',
      module: 'AUTH',
      details: 'Restaurant Partner Portal backend initialized and database seeded successfully.',
      performedBy: 'System Engine',
    });

    console.log('[Seed Engine] MongoDB database successfully populated with restaurant demo data!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error: any) {
    console.error('[Seed Engine Error]', error);
    return { success: false, error: error.message };
  }
};
