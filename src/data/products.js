/** GetLoud merch & products — update links, prices, and images as inventory is ready */
export const products = [
  {
    id: 'getloud-tee',
    name: 'GetLoud Official Tee',
    category: 'Apparel',
    priceAud: 45,
    priceLabel: '$45 AUD',
    description: 'Premium cotton tee featuring the GetLoud Perth emblem. Wear the movement.',
    badge: 'Best Seller',
    image: null,
    shopUrl: null, // e.g. 'https://shop.krashproductions.com/getloud-tee'
    inStock: true,
  },
  {
    id: 'running-cap',
    name: 'GetLoud Running Cap',
    category: 'Accessories',
    priceAud: 35,
    priceLabel: '$35 AUD',
    description: 'Lightweight cap for Perth sunrise runs. Embroidered #GetLoud logo.',
    badge: null,
    image: null,
    shopUrl: null,
    inStock: true,
  },
  {
    id: 'sticker-pack',
    name: 'GetLoud Sticker Pack',
    category: 'Accessories',
    priceAud: 12,
    priceLabel: '$12 AUD',
    description: '5 weatherproof stickers — slap them on your bottle, laptop, or guitar case.',
    badge: null,
    image: null,
    shopUrl: null,
    inStock: true,
  },
  {
    id: 'donation-bundle',
    name: 'Merch + Donation Bundle',
    category: 'Bundle',
    priceAud: 60,
    priceLabel: '$60 AUD',
    description: 'GetLoud tee + $20 direct donation to crisis helpline partners. Maximum impact.',
    badge: 'Impact Bundle',
    image: null,
    shopUrl: null,
    inStock: true,
  },
];

export const merchConfig = {
  shopEmail: 'krashproductionsperth@gmail.com',
  shopNote: 'Online store launching soon — email us to pre-order or enquire about custom sizes.',
  currency: 'AUD',
};
