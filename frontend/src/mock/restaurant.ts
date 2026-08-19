import type { RestaurantProfile } from '../types';

export const mockRestaurant: RestaurantProfile = {
  id: 'rest-101',
  name: 'Spice Junction Indian Kitchen',
  tagline: 'Authentic North & South Indian Culinary Delights',
  rating: 4.8,
  totalRatings: 1420,
  isOnline: true,
  activeOutletId: 'out-1',
  currency: 'INR',
  managerName: 'Rajesh Sharma',
  phone: '+91 98801 43210',
  email: 'electroniccity@spicejunction.in',
  fssaiLicense: '11221002004891',
  address: 'Plot 84, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100',
  outlets: [
    {
      id: 'out-1',
      name: 'Spice Junction - Electronic City Phase 1',
      city: 'Bengaluru',
      address: 'Plot 84, Electronic City Phase 1, Hosur Road, Bengaluru',
      isPrimary: true,
    },
  ],
};
