import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import MenuItem from './models/MenuItem';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-ordering-system';

const mockItems = [
  // 4 Featured Items
  {
    name: "Truffle Parmesan Fries",
    description: "Crispy shoestring fries tossed in white truffle oil and aged parmesan.",
    price: 8.99,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    isFeatured: true,
    featuredPosition: 1,
    featuredBadge: "Chef's Special",
    dietaryPreferences: ["Vegetarian"],
    discountPercent: 10
  },
  {
    name: "Classic Cheeseburger Combo",
    description: "Angus beef patty, cheddar, lettuce, tomato, house sauce. Comes with fries and a drink.",
    price: 15.99,
    category: "Combos",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    isFeatured: true,
    featuredPosition: 2,
    featuredBadge: "Combo",
    dietaryPreferences: [],
    discountPercent: 20
  },
  {
    name: "Spicy Tuna Crispy Rice",
    description: "Pan-seared crispy sushi rice topped with spicy tuna, jalapeño, and eel sauce.",
    price: 12.50,
    category: "Sushi & Sashimi",
    imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    isFeatured: true,
    featuredPosition: 3,
    featuredBadge: "Popular",
    dietaryPreferences: ["Pescatarian"]
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla bean ice cream.",
    price: 9.50,
    category: "Desserts",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    isFeatured: true,
    featuredPosition: 4,
    featuredBadge: "Sale",
    dietaryPreferences: ["Vegetarian"],
    discountPercent: 15
  },
  
  // 16 Regular Items
  {
    name: "Margherita Pizza",
    description: "San Marzano tomato sauce, fresh mozzarella, basil, extra virgin olive oil.",
    price: 16.00,
    category: "Pizzas",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian"]
  },
  {
    name: "Caesar Salad",
    description: "Romaine lettuce, garlic croutons, parmesan, house-made Caesar dressing.",
    price: 11.00,
    category: "Salads",
    imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian"]
  },
  {
    name: "Grilled Salmon Bowl",
    description: "Atlantic salmon, quinoa, edamame, avocado, cucumber, sesame soy dressing.",
    price: 19.50,
    category: "Rice Bowls",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Pescatarian", "Gluten-Free"],
    discountPercent: 5
  },
  {
    name: "Chicken Pad Thai",
    description: "Rice noodles, egg, peanuts, bean sprouts, tamarind sauce.",
    price: 15.00,
    category: "Noodles & Ramen",
    imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Gluten-Free"]
  },
  {
    name: "Avocado Toast",
    description: "Sourdough, smashed avocado, cherry tomatoes, radish, microgreens.",
    price: 12.00,
    category: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegan", "Vegetarian"]
  },
  {
    name: "Matcha Latte",
    description: "Premium ceremonial grade matcha, steamed oat milk.",
    price: 5.50,
    category: "Coffee & Tea",
    imageUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian", "Vegan"]
  },
  {
    name: "Beef Tacos",
    description: "Three corn tortillas, slow-cooked beef barbacoa, cilantro, onions, lime.",
    price: 13.50,
    category: "Tacos & Burritos",
    imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Gluten-Free"]
  },
  {
    name: "Pesto Penne",
    description: "Penne pasta, basil pesto, cherry tomatoes, pine nuts, parmesan.",
    price: 14.50,
    category: "Pasta",
    imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian"]
  },
  {
    name: "Miso Soup",
    description: "Traditional Japanese broth with tofu, seaweed, and scallions.",
    price: 4.00,
    category: "Starters",
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegan", "Vegetarian", "Gluten-Free"]
  },
  {
    name: "Iced Caramel Macchiato",
    description: "Espresso, vanilla syrup, milk, ice, caramel drizzle.",
    price: 6.00,
    category: "Coffee & Tea",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian"]
  },
  {
    name: "Mango Smoothie",
    description: "Fresh mango, yogurt, honey, blended with ice.",
    price: 6.50,
    category: "Juices & Smoothies",
    imageUrl: "https://images.unsplash.com/photo-1623065422900-0e20e64c504d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian", "Gluten-Free"]
  },
  {
    name: "Vegetable Dumplings",
    description: "Steamed dumplings filled with cabbage, mushrooms, and glass noodles.",
    price: 8.50,
    category: "Dim Sum & Dumplings",
    imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegan", "Vegetarian"]
  },
  {
    name: "Ribeye Steak",
    description: "12oz grilled ribeye, garlic herb butter, roasted asparagus.",
    price: 34.00,
    category: "Steaks & Grills",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Gluten-Free"]
  },
  {
    name: "Edamame",
    description: "Steamed soybeans sprinkled with sea salt.",
    price: 5.00,
    category: "Snacks",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegan", "Vegetarian", "Gluten-Free"]
  },
  {
    name: "Chicken Wings",
    description: "6 pieces of crispy wings tossed in buffalo or BBQ sauce.",
    price: 10.99,
    category: "Appetizers",
    imageUrl: "https://images.unsplash.com/photo-1524114664604-cd8133cd67ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Gluten-Free"]
  },
  {
    name: "Tiramisu",
    description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa powder.",
    price: 8.50,
    category: "Desserts",
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    customizationGroups: [],
    dietaryPreferences: ["Vegetarian"]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB at', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');
    
    console.log('Clearing old menu items...');
    await MenuItem.deleteMany({});
    
    console.log('Inserting 20 mock items...');
    await MenuItem.insertMany(mockItems);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
