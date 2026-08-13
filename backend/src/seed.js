import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();
await connectDB();

await User.deleteMany();
await Product.deleteMany();

await User.create({
  name: 'FreshMart Admin',
  email: 'admin@freshmart.com',
  password: 'Admin@12345',
  phone: '9999999999',
  role: 'admin'
});

await Product.insertMany([
  {
    name: 'Organic Tomatoes',
    slug: 'organic-tomatoes',
    description: 'Juicy farm-picked tomatoes for salads, curries, and sauces.',
    category: 'Vegetables',
    price: 48,
    mrp: 60,
    unit: 'kg',
    countInStock: 80,
    images: [{ url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' }],
    isFeatured: true
  },
  {
    name: 'Fresh Bananas',
    slug: 'fresh-bananas',
    description: 'Naturally sweet bananas, perfect for breakfast and snacks.',
    category: 'Fruits',
    price: 55,
    mrp: 70,
    unit: 'dozen',
    countInStock: 120,
    images: [{ url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80' }],
    isFeatured: true
  },
  {
    name: 'Pure Cow Milk',
    slug: 'pure-cow-milk',
    description: 'Fresh pasteurized cow milk delivered chilled.',
    category: 'Dairy',
    price: 68,
    mrp: 72,
    unit: 'ltr',
    countInStock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Whole Wheat Bread',
    slug: 'whole-wheat-bread',
    description: 'Soft whole wheat bread baked fresh every morning.',
    category: 'Bakery',
    price: 45,
    mrp: 50,
    unit: 'pack',
    countInStock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Cold Pressed Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: 'Bright, pulpy orange juice with no added sugar.',
    category: 'Beverages',
    price: 120,
    mrp: 145,
    unit: '1 ltr',
    countInStock: 55,
    images: [{ url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80' }],
    isFeatured: true
  },
  {
    name: 'Tender Coconut Water',
    slug: 'tender-coconut-water',
    description: 'Naturally hydrating coconut water packed fresh and chilled.',
    category: 'Beverages',
    price: 65,
    mrp: 80,
    unit: 'bottle',
    countInStock: 70,
    images: [{ url: 'https://images.unsplash.com/photo-1588413335653-34b770bca7c1?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Masala Chai Ready Mix',
    slug: 'masala-chai-ready-mix',
    description: 'Aromatic tea blend with warming spices for quick evening chai.',
    category: 'Beverages',
    price: 155,
    mrp: 180,
    unit: '250 g',
    countInStock: 44,
    images: [{ url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Lemon Mint Cooler',
    slug: 'lemon-mint-cooler',
    description: 'Refreshing lemon and mint drink for hot afternoons.',
    category: 'Beverages',
    price: 45,
    mrp: 60,
    unit: '300 ml',
    countInStock: 90,
    images: [{ url: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Roasted Masala Makhana',
    slug: 'roasted-masala-makhana',
    description: 'Crunchy fox nuts roasted with light masala seasoning.',
    category: 'Snacks',
    price: 99,
    mrp: 125,
    unit: '80 g',
    countInStock: 65,
    images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80' }],
    isFeatured: true
  },
  {
    name: 'Baked Banana Chips',
    slug: 'baked-banana-chips',
    description: 'Crisp banana chips baked with a light salted finish.',
    category: 'Snacks',
    price: 85,
    mrp: 105,
    unit: '150 g',
    countInStock: 58,
    images: [{ url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Trail Mix Energy Pack',
    slug: 'trail-mix-energy-pack',
    description: 'A balanced mix of nuts, seeds, raisins, and dried fruit.',
    category: 'Snacks',
    price: 180,
    mrp: 220,
    unit: '200 g',
    countInStock: 36,
    images: [{ url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80' }]
  },
  {
    name: 'Classic Salted Popcorn',
    slug: 'classic-salted-popcorn',
    description: 'Light, crunchy popcorn for movie nights and quick munching.',
    category: 'Snacks',
    price: 60,
    mrp: 75,
    unit: '100 g',
    countInStock: 82,
    images: [{ url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80' }]
  }
]);

console.log('Seed data inserted. Admin login: admin@freshmart.com / Admin@12345');
process.exit(0);
