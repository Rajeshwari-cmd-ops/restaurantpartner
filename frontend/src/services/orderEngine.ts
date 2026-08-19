import type { Order, OrderItem, InventoryItem } from '../types';
import { mockOrders } from '../mock/orders';
import { mockInventory } from '../mock/inventory';

// Web Audio API Notification Sound Synthesizer
export function playNewOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: High crisp ding
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Tone 2: Harmonic resolution
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain2.gain.setValueAtTime(0.2, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.6);
    }, 120);
  } catch (err) {
    console.log('Audio chime blocked by browser autoplay policy until user interaction.', err);
  }
}

// Random Generator Datasets
const MOCK_GUESTS = [
  { name: 'Sunita Rao', phone: '+91 98765 88201', address: 'Flat 302, Palm Meadows, Electronic City Phase 1' },
  { name: 'Karan Patel', phone: '+91 99887 44321', address: 'Villa 14, Green Glen Layout, Bellandur' },
  { name: 'Anish Kapoor', phone: '+91 97654 11223', address: 'Tower C - 804, Prestige Lakeside, Marathahalli' },
  { name: 'Meera Joshi', phone: '+91 98123 99887', address: 'Plot 88, HSR Layout Sector 2' },
  { name: 'Deepak Nair', phone: '+91 96543 55443', address: 'Apt 501, Shobha Iris, Devarabesanahalli' },
  { name: 'Sanjay Kumar', phone: '+91 98000 66778', address: 'House 12, NeoTown Layout, Electronic City' },
];

const MOCK_ITEMS_CATALOG = [
  { name: 'Paneer Butter Masala', price: 340, isVeg: true, skuDeductions: [{ skuCode: '#SKU-102', qty: 0.2 }, { skuCode: '#SKU-108', qty: 0.03 }] },
  { name: 'Chicken Dum Biryani', price: 380, isVeg: false, skuDeductions: [{ skuCode: '#SKU-201', qty: 0.35 }, { skuCode: '#SKU-101', qty: 0.25 }] },
  { name: 'Dal Makhani Slow Cooked', price: 290, isVeg: true, skuDeductions: [{ skuCode: '#SKU-104', qty: 0.15 }] },
  { name: 'Garlic Butter Naan', price: 75, isVeg: true, skuDeductions: [{ skuCode: '#SKU-103', qty: 0.12 }] },
  { name: 'Mango Lassi Thick', price: 120, isVeg: true, skuDeductions: [{ skuCode: '#SKU-106', qty: 0.2 }] },
];

type OrderSubscriber = (newOrder: Order, updatedInventory: InventoryItem[]) => void;

class MockOrderEngine {
  private subscribers: Set<OrderSubscriber> = new Set();
  private timerId: any = null;
  private currentOrders: Order[] = [...mockOrders];
  private currentInventory: InventoryItem[] = [...mockInventory];
  private isRunning = false;
  private isOnline = true;

  public subscribe(cb: OrderSubscriber) {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
    if (!online) {
      this.stopEngine();
    } else {
      this.startEngine();
    }
  }

  public startEngine() {
    if (this.isRunning || !this.isOnline) return;
    this.isRunning = true;
    this.scheduleNextOrder();
  }

  public stopEngine() {
    if (this.timerId) clearTimeout(this.timerId);
    this.isRunning = false;
  }

  private scheduleNextOrder() {
    if (!this.isRunning || !this.isOnline) return;
    const intervalMs = Math.floor(20000 + Math.random() * 30000);
    this.timerId = setTimeout(() => {
      if (this.isOnline) {
        this.generateRandomOrder();
      }
      if (this.isRunning && this.isOnline) {
        this.scheduleNextOrder();
      }
    }, intervalMs);
  }

  public generateRandomOrder(): Order {
    const guest = MOCK_GUESTS[Math.floor(Math.random() * MOCK_GUESTS.length)];
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const selectedDishes: OrderItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const dish = MOCK_ITEMS_CATALOG[Math.floor(Math.random() * MOCK_ITEMS_CATALOG.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      selectedDishes.push({
        id: `itm-${Date.now()}-${i}`,
        name: dish.name,
        quantity: qty,
        price: dish.price,
        isVeg: dish.isVeg,
      });

      dish.skuDeductions.forEach(deduction => {
        this.currentInventory = this.currentInventory.map(invItem => {
          if (invItem.code === deduction.skuCode) {
            const nextStock = Math.max(0, parseFloat((invItem.currentStock - deduction.qty * qty).toFixed(2)));
            return {
              ...invItem,
              currentStock: nextStock,
              status: nextStock === 0 ? 'out_of_stock' : nextStock <= invItem.minThreshold ? 'low_stock' : 'in_stock',
              lastUsed: `Just now (-${(deduction.qty * qty).toFixed(1)} ${invItem.unit})`,
            };
          }
          return invItem;
        });
      });
    }

    const subtotal = selectedDishes.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + tax;
    const orderNumber = `#FIC-${Math.floor(8895 + Math.random() * 200)}`;

    const deliveryTypes: ('delivery' | 'pickup' | 'dine_in')[] = ['delivery', 'delivery', 'pickup', 'dine_in'];
    const deliveryType = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: guest.name,
      customerPhone: guest.phone,
      deliveryType,
      status: 'new',
      paymentStatus: 'paid',
      estimatedPrepTime: 15 + Math.floor(Math.random() * 10),
      items: selectedDishes,
      totalAmount,
      createdAt: new Date().toISOString(),
      timeline: [{ status: 'new', timestamp: new Date().toISOString(), note: 'Order received via Engine' }],
    };

    this.currentOrders = [newOrder, ...this.currentOrders];

    playNewOrderChime();

    this.subscribers.forEach(cb => cb(newOrder, this.currentInventory));

    return newOrder;
  }
}

export const orderEngine = new MockOrderEngine();
