
//For landing page
export const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', country: 'India' },
  { code: 'BOM', city: 'Mumbai', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', country: 'India' },
  { code: 'MAA', city: 'Chennai', country: 'India' },
  { code: 'CCU', city: 'Kolkata', country: 'India' },
  { code: 'DXB', city: 'Dubai', country: 'UAE' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore' },
  { code: 'LHR', city: 'London', country: 'UK' },
  { code: 'JFK', city: 'New York', country: 'USA' },
];



export const SEAT_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
];

export const FLIGHT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-500' },
  { value: 'delayed', label: 'Delayed', color: 'text-yellow-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-500' },
  { value: 'completed', label: 'Completed', color: 'text-green-500' },
];

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
];

export const AMENITIES = [
  { value: 'wifi', label: 'WiFi', icon: 'Wifi' },
  { value: 'meals', label: 'Meals', icon: 'UtensilsCrossed' },
  { value: 'usb', label: 'USB Charging', icon: 'Usb' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Monitor' },
  { value: 'power', label: 'Power Outlet', icon: 'Plug' },
  { value: 'extra_legroom', label: 'Extra Legroom', icon: 'Armchair' },
];

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
];

export const SORT_OPTIONS = [
  { value: 'departureTime', label: 'Departure Time' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration', label: 'Duration' },
];
