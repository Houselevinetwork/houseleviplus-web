// Collections
export const COLLECTIONS = {
  HOUSE_LEVI_MERCH: 'house-levi-merch',
  MC_BETT_MAASAI: 'mc-bett-maasai',
  JERO_EFFECT: 'jero-effect',
  COLLECTIBLES: 'collectibles',
  ART: 'art',
  BOOKS: 'books',
  LEVIS_OLD_MONEY: 'levis-old-money-closet',
};

export const COLLECTION_NAMES = {
  [COLLECTIONS.HOUSE_LEVI_MERCH]: 'House Levi+ Merch',
  [COLLECTIONS.MC_BETT_MAASAI]: 'MC Bett Maasai',
  [COLLECTIONS.JERO_EFFECT]: 'Jero Effect',
  [COLLECTIONS.COLLECTIBLES]: 'Collectibles',
  [COLLECTIONS.ART]: 'Art & Prints',
  [COLLECTIONS.BOOKS]: 'Books',
  [COLLECTIONS.LEVIS_OLD_MONEY]: "Levi's Old Money Closet",
};

// Shipping Locations
export const SHIPPING_LOCATIONS = {
  KENYA: 'Kenya',
  AFRICA: 'Africa',
  INTERNATIONAL: 'International',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: ' Pending',
  [ORDER_STATUS.PROCESSING]: ' Processing',
  [ORDER_STATUS.SHIPPED]: ' Shipped',
  [ORDER_STATUS.DELIVERED]: ' Delivered',
  [ORDER_STATUS.CANCELLED]: ' Cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Currency
export const CURRENCIES = {
  KES: 'KES',
  USD: 'USD',
};

export const CURRENCY_SYMBOLS = {
  KES: 'KSh',
  USD: '$',
};

// Price Ranges
export const PRICE_FILTERS = [
  { label: 'Under KSh 1,000', min: 0, max: 1000 },
  { label: 'KSh 1,000 - 5,000', min: 1000, max: 5000 },
  { label: 'KSh 5,000 - 10,000', min: 5000, max: 10000 },
  { label: 'Above KSh 10,000', min: 10000, max: Infinity },
];

// Sort Options
export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Best Selling', value: 'best-selling' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Customer Rating', value: 'rating' },
];

// Contact Info (for support)
export const SUPPORT_CONTACT = {
  WHATSAPP: '+254712345678', // Replace with actual number
  PHONE: '+254712345678',     // Replace with actual number
  EMAIL: 'support@houselevi.com',
};
