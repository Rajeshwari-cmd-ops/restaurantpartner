import { Request, Response } from 'express';
import Order, { OrderWorkflowStatus } from '../models/Order';
import KitchenTicket from '../models/Kitchen';
import Rider from '../models/Rider';
import Inventory from '../models/Inventory';
import Customer from '../models/Customer';
import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';
import { broadcastEvent } from '../socket/socketServer';

// GET /api/v1/orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/v1/orders/:id
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findOne({ $or: [{ _id: req.params.id }, { orderNumber: req.params.id }] });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/orders (Create New Live Order)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrderData = req.body;
    if (!newOrderData.orderNumber) {
      newOrderData.orderNumber = `#FIC-${Math.floor(8800 + Math.random() * 2000)}`;
    }

    const order = await Order.create(newOrderData);

    // Create Kitchen Ticket Automatically
    const kitchenTicket = await KitchenTicket.create({
      ticketId: `tkt-${order.orderNumber.replace('#', '')}`,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      station: 'Curry & Gravy',
      chefAssigned: 'Chef Suresh',
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        completed: false,
      })),
      priority: order.totalAmount > 1000 ? 'VIP' : 'NORMAL',
      status: 'QUEUED',
    });

    // Create Activity Log
    await ActivityLog.create({
      action: 'ORDER_CREATED',
      module: 'ORDER',
      details: `New order ${order.orderNumber} received via ${order.channel} (${order.customerName}).`,
      performedBy: 'System Engine',
    });

    broadcastEvent('order_created', order);
    broadcastEvent('kitchen_updated', kitchenTicket);

    res.status(201).json({ message: 'Order created successfully', order, kitchenTicket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/v1/orders/:id/status (SHARED WORKFLOW STATE MACHINE ENGINE)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, riderId, cancellationReason } = req.body;
    const orderId = req.params.id;

    const order = await Order.findOne({ $or: [{ _id: orderId }, { orderNumber: orderId }] });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const prevStatus = order.status;
    order.status = status as OrderWorkflowStatus;

    if (cancellationReason) {
      order.cancellationReason = cancellationReason;
    }

    // ═══════════════════════════════════════════════════
    // SHARED WORKFLOW AUTOMATED CROSS-COLLECTION UPDATES
    // ═══════════════════════════════════════════════════

    // 1. PLACED -> ACCEPTED or COOKING
    if (status === 'ACCEPTED' || status === 'COOKING') {
      if (!order.preparationStartedAt) {
        order.preparationStartedAt = new Date();
      }
      await KitchenTicket.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        { status: 'PREPARING', startedAt: new Date() }
      );
    }

    // 2. COOKING -> READY_FOR_PICKUP
    else if (status === 'READY_FOR_PICKUP') {
      order.readyAt = new Date();
      await KitchenTicket.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        { status: 'READY', completedAt: new Date() }
      );
    }

    // 3. READY_FOR_PICKUP -> ASSIGNED
    else if (status === 'ASSIGNED') {
      const selectedRiderId = riderId || 'rider-1';
      const rider = await Rider.findOne({ $or: [{ _id: selectedRiderId }, { riderId: selectedRiderId }] });
      
      if (rider) {
        order.riderId = rider.riderId;
        order.riderName = rider.name;
        order.riderPhone = rider.phone;
        
        rider.status = 'assigned';
        rider.currentOrderId = order._id.toString();
        rider.currentOrderNumber = order.orderNumber;
        await rider.save();
        
        broadcastEvent('rider_updated', rider);
      }
    }

    // 4. ASSIGNED -> RIDER_ARRIVED
    else if (status === 'RIDER_ARRIVED') {
      if (order.riderId) {
        await Rider.findOneAndUpdate(
          { riderId: order.riderId },
          { status: 'arrived_at_store' }
        );
      }
    }

    // 5. RIDER_ARRIVED -> OUT_FOR_DELIVERY
    else if (status === 'OUT_FOR_DELIVERY') {
      if (order.riderId) {
        await Rider.findOneAndUpdate(
          { riderId: order.riderId },
          { status: 'on_delivery' }
        );
      }
      await KitchenTicket.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        { status: 'DISPATCHED' }
      );

      // Auto-deduct stock for items ordered
      for (const item of order.items) {
        const inventoryItem = await Inventory.findOne({ name: new RegExp(item.name, 'i') });
        if (inventoryItem) {
          inventoryItem.currentStock = Math.max(0, inventoryItem.currentStock - item.quantity);
          inventoryItem.status =
            inventoryItem.currentStock === 0
              ? 'out_of_stock'
              : inventoryItem.currentStock <= inventoryItem.minThreshold
              ? 'low_stock'
              : 'in_stock';
          inventoryItem.lastUsed = `Auto-deducted ${item.quantity} ${inventoryItem.unit} for ${order.orderNumber}`;
          await inventoryItem.save();
        }
      }
      broadcastEvent('inventory_updated', { message: 'Stock auto-deducted for dispatched order' });
    }

    // 6. OUT_FOR_DELIVERY -> DELIVERED
    else if (status === 'DELIVERED') {
      if (order.riderId) {
        await Rider.findOneAndUpdate(
          { riderId: order.riderId },
          { status: 'available', currentOrderId: null, currentOrderNumber: null, $inc: { deliveriesToday: 1 } }
        );
      }

      // Update Customer CRM LTV Metrics
      const customer = await Customer.findOne({ phone: order.customerPhone });
      if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += order.totalAmount;
        customer.avgOrderValue = Math.round(customer.totalSpent / customer.totalOrders);
        customer.lastOrderDate = 'Today';
        customer.loyaltyPoints += Math.round(order.totalAmount * 0.1); // 10% points reward
        customer.pastOrders.unshift({
          orderId: order.orderNumber,
          date: 'Today',
          amount: order.totalAmount,
          items: order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
          status: 'DELIVERED',
        });
        await customer.save();
        broadcastEvent('customer_updated', customer);
      }

      // Update Daily Reports Data
      const todayStr = '2026-07-31';
      let report = await Report.findOne({ reportDate: todayStr });
      if (!report) {
        report = new Report({
          reportDate: todayStr,
          grossRevenue: order.totalAmount,
          totalOrders: 1,
        });
      } else {
        report.grossRevenue += order.totalAmount;
        report.totalOrders += 1;
      }
      await report.save();
      broadcastEvent('report_updated', report);
    }

    await order.save();

    // Log Activity
    await ActivityLog.create({
      action: `ORDER_STATUS_${status}`,
      module: 'ORDER',
      details: `Order ${order.orderNumber} status transitioned from ${prevStatus} to ${status}.`,
      performedBy: (req as any).user?.email || 'Rajesh Sharma (Manager)',
    });

    // Broadcast Real-time Events
    broadcastEvent('order_updated', order);

    res.json({
      message: `Order ${order.orderNumber} workflow status updated to ${status}`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
