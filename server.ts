/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MenuItem, Order, OrderStatus, CustomizeOption, ChatMessage } from './src/types.js';

dotenv.config();

// In-memory Database state
let activeMenu: MenuItem[] = [
  {
    id: 'whopper',
    name: 'Soulster® Chicken Burger',
    category: 'Burgers',
    description: 'Chicken Licken’s legendary chicken breast fillet coated in our secret recipe blend, topped with fresh lettuce and our famous, mouth-watering secret Soulster® sauce on a soft toasted bun.',
    price: 6.49,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 660, protein: 28, carbs: 49, fat: 40 },
    isAvailable: true,
    allergens: ['Wheat', 'Egg', 'Sesame', 'Soy'],
    customizable: true,
    defaultCustomizations: [
      { id: 'patty', name: 'Crispy Chicken Breast Fillet', type: 'count', currentVal: 1, unitCalories: 220, unitPrice: 2.00 },
      { id: 'cheese', name: 'American Cheese Slices', type: 'count', currentVal: 0, unitCalories: 60, unitPrice: 0.60 },
      { id: 'bacon', name: 'Smoked Crispy Bacon', type: 'count', currentVal: 0, unitCalories: 80, unitPrice: 0.90 },
      { id: 'mayo', name: 'Secret Soulster® Sauce', type: 'choice', currentVal: 'Regular', choices: ['None', 'Light', 'Regular', 'Extra'], unitCalories: 90 },
      { id: 'pickles', name: 'Crunchy Pickles', type: 'toggle', currentVal: true, unitCalories: 5 },
      { id: 'onions', name: 'Sliced Onions', type: 'toggle', currentVal: true, unitCalories: 10 },
      { id: 'lettuce', name: 'Fresh Lettuce', type: 'toggle', currentVal: true, unitCalories: 5 }
    ]
  },
  {
    id: 'double-whopper',
    name: 'Double Soulster® with Cheese',
    category: 'Burgers',
    description: 'Two legendary crispy chicken breast fillets piled high with melted American cheese, fresh lettuce, and our famous signature secret Soulster® sauce.',
    price: 8.79,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 900, protein: 48, carbs: 51, fat: 58 },
    isAvailable: true,
    allergens: ['Wheat', 'Egg', 'Milk', 'Sesame', 'Soy'],
    customizable: true,
    defaultCustomizations: [
      { id: 'patty', name: 'Crispy Chicken Breast Fillet', type: 'count', currentVal: 2, unitCalories: 220, unitPrice: 2.00 },
      { id: 'cheese', name: 'American Cheese Slices', type: 'count', currentVal: 2, unitCalories: 60, unitPrice: 0.60 },
      { id: 'bacon', name: 'Smoked Crispy Bacon', type: 'count', currentVal: 0, unitCalories: 80, unitPrice: 0.90 },
      { id: 'mayo', name: 'Secret Soulster® Sauce', type: 'choice', currentVal: 'Regular', choices: ['None', 'Light', 'Regular', 'Extra'], unitCalories: 90 },
      { id: 'pickles', name: 'Crunchy Pickles', type: 'toggle', currentVal: true, unitCalories: 5 },
      { id: 'onions', name: 'Sliced Onions', type: 'toggle', currentVal: true, unitCalories: 10 }
    ]
  },
  {
    id: 'bacon-king',
    name: 'Rock My Soul® Bacon King',
    category: 'Burgers',
    description: 'Two crispy chicken breast fillets with a hearty portion of thick-cut smoked bacon, melted American cheese, and rich, savory soul-basting sauce.',
    price: 9.29,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 1040, protein: 57, carbs: 48, fat: 74 },
    isAvailable: true,
    allergens: ['Wheat', 'Egg', 'Milk', 'Sesame', 'Soy'],
    customizable: true,
    defaultCustomizations: [
      { id: 'patty', name: 'Crispy Chicken Breast Fillet', type: 'count', currentVal: 2, unitCalories: 220, unitPrice: 2.00 },
      { id: 'cheese', name: 'American Cheese Slices', type: 'count', currentVal: 2, unitCalories: 60, unitPrice: 0.60 },
      { id: 'bacon', name: 'Smoked Crispy Bacon', type: 'count', currentVal: 4, unitCalories: 80, unitPrice: 0.90 },
      { id: 'mayo', name: 'Whipped Mayonnaise', type: 'choice', currentVal: 'Regular', choices: ['None', 'Light', 'Regular', 'Extra'], unitCalories: 90 }
    ]
  },
  {
    id: 'texas-double',
    name: 'Soulfire® Hot Double',
    category: 'Burgers',
    isLTO: true,
    description: 'Two crispy chicken breast fillets, thick-cut smoked bacon, spicy sliced jalapeños, melted American cheese, and rich legendary Soulfire® sauce with fresh lettuce and tomatoes.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 1020, protein: 52, carbs: 54, fat: 68 },
    isAvailable: true,
    allergens: ['Wheat', 'Milk', 'Soy'],
    customizable: true,
    defaultCustomizations: [
      { id: 'patty', name: 'Crispy Chicken Breast Fillet', type: 'count', currentVal: 2, unitCalories: 220, unitPrice: 2.00 },
      { id: 'cheese', name: 'American Cheese Slices', type: 'count', currentVal: 2, unitCalories: 60, unitPrice: 0.60 },
      { id: 'bacon', name: 'Smoked Crispy Bacon', type: 'count', currentVal: 2, unitCalories: 80, unitPrice: 0.90 },
      { id: 'jalapenos', name: 'Spicy Jalapeños', type: 'toggle', currentVal: true, unitCalories: 15, unitPrice: 0.40 },
      { id: 'bbq', name: 'Soulfire® Hot Sauce', type: 'toggle', currentVal: true, unitCalories: 45 }
    ]
  },
  {
    id: 'chicken-royal',
    name: 'Love Me Tender® Burger',
    category: 'Chicken & Fish',
    description: 'Our tender, incredibly juicy crispy chicken breast fileted and cooked to a beautiful deep-golden state, topped with shredded mountain lettuce and cool whipped mayonnaise on a toasted bun.',
    price: 5.99,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 580, protein: 32, carbs: 42, fat: 28 },
    isAvailable: true,
    allergens: ['Wheat', 'Egg', 'Soy'],
    customizable: true,
    defaultCustomizations: [
      { id: 'chicken', name: 'Crispy Chicken Strip', type: 'count', currentVal: 1, unitCalories: 190, unitPrice: 2.30 },
      { id: 'cheese', name: 'American Cheese Slices', type: 'count', currentVal: 0, unitCalories: 60, unitPrice: 0.60 },
      { id: 'mayo', name: 'Whipped Mayonnaise', type: 'choice', currentVal: 'Regular', choices: ['None', 'Light', 'Regular', 'Extra'], unitCalories: 90 },
      { id: 'lettuce', name: 'Fresh Lettuce', type: 'toggle', currentVal: true, unitCalories: 5 }
    ]
  },
  {
    id: 'big-fish',
    name: 'Soulfire® Hot Wings (6 Piece)',
    category: 'Chicken & Fish',
    description: 'Six of our universally famous, crispy-coated spicy wings tossed in a secret, incredibly savory Soulfire® spice dusting.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 510, protein: 18, carbs: 46, fat: 26 },
    isAvailable: true,
    allergens: ['Wheat', 'Egg', 'Soy'],
    customizable: false
  },
  {
    id: 'onion-rings',
    name: 'Soulfire® Onion Rings',
    category: 'Sides',
    description: 'Deliciously crunchy, battered and golden-fried onion rings sprinkled with our trademark Licken Dust® seasoning.',
    price: 3.29,
    image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 360, protein: 5, carbs: 41, fat: 18 },
    isAvailable: true,
    allergens: ['Wheat', 'Soy'],
    customizable: false
  },
  {
    id: 'french-fries',
    name: 'Soul Fries with Licken Dust®',
    category: 'Sides',
    description: 'Thick cut, fluffy and golden-fried salted potatoes sprinkled in our legendary savory secret Licken Dust® spices.',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 320, protein: 4, carbs: 44, fat: 14 },
    isAvailable: true,
    allergens: [],
    customizable: false
  },
  {
    id: 'warm-brownie',
    name: 'Fudge Brownie with Soft-Serve Core',
    category: 'Desserts',
    description: 'Hot, rich chocolate fudge pastry paired elegantly with a generous scoop of vanilla soft-serve ice cream.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 480, protein: 7, carbs: 64, fat: 22 },
    isAvailable: true,
    allergens: ['Milk', 'Egg', 'Soy', 'Wheat'],
    customizable: false
  },
  {
    id: 'coke',
    name: 'Coca-Cola (Regular)',
    category: 'Drinks',
    description: 'Sweet, carbonated classic refresher loaded with cooling ice.',
    price: 2.29,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&h=400&q=80',
    nutrition: { calories: 140, protein: 0, carbs: 39, fat: 0 },
    isAvailable: true,
    allergens: [],
    customizable: false
  }
];

let orders: Order[] = [
  {
    id: 'CL-1081',
    customerName: 'Marcus Evans',
    deliveryAddress: '14 Royal Crescent, Kensington, W11 4SL',
    status: 'Delivered',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    totalPrice: 24.17,
    pointsEarned: 242,
    items: [
      {
        id: 'o_item_1',
        menuItem: activeMenu[0],
        customizations: activeMenu[0].defaultCustomizations || [],
        quantity: 2,
        finalPrice: 12.98,
        finalNutrition: activeMenu[0].nutrition
      },
      {
        id: 'o_item_2',
        menuItem: activeMenu[8],
        customizations: [],
        quantity: 1,
        finalPrice: 3.99,
        finalNutrition: activeMenu[8].nutrition
      },
      {
        id: 'o_item_3',
        menuItem: activeMenu[7],
        customizations: [],
        quantity: 2,
        finalPrice: 5.98,
        finalNutrition: activeMenu[7].nutrition
      }
    ]
  },
  {
    id: 'CL-1082',
    customerName: 'Sophia Lin',
    deliveryAddress: 'Flat 5B, St Pauls Row, EC4M 8AD',
    status: 'Delivering',
    timestamp: new Date(Date.now() - 3600000 * 0.75).toISOString(),
    totalPrice: 15.28,
    pointsEarned: 153,
    items: [
      {
        id: 'o_item_4',
        menuItem: activeMenu[1],
        customizations: activeMenu[1].defaultCustomizations || [],
        quantity: 1,
        finalPrice: 8.79,
        finalNutrition: activeMenu[1].nutrition
      },
      {
        id: 'o_item_5',
        menuItem: activeMenu[6],
        customizations: [],
        quantity: 1,
        finalPrice: 3.29,
        finalNutrition: activeMenu[6].nutrition
      },
      {
        id: 'o_item_6',
        menuItem: activeMenu[9],
        customizations: [],
        quantity: 1,
        finalPrice: 2.29,
        finalNutrition: activeMenu[9].nutrition
      }
    ]
  },
  {
    id: 'CL-1083',
    customerName: 'Devon Carter',
    deliveryAddress: '32 Waverley Gardens, Greenwich, SE10 8PR',
    status: 'Preparing',
    timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
    totalPrice: 9.49,
    pointsEarned: 95,
    items: [
      {
        id: 'o_item_7',
        menuItem: activeMenu[3],
        customizations: activeMenu[3].defaultCustomizations || [],
        quantity: 1,
        finalPrice: 9.49,
        finalNutrition: activeMenu[3].nutrition
      }
    ]
  }
];

// Lazy initialization of GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. AI System Architect will run in rule-based fallback mode.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // REST Endpoints
  app.get('/api/menu', (req, res) => {
    res.json(activeMenu);
  });

  app.put('/api/menu/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const item = activeMenu.find(m => m.id === id);
    if (item) {
      item.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !item.isAvailable;
      return res.json({ success: true, item });
    }
    res.status(404).json({ error: 'Menu item not found' });
  });

  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const { items, customerName, deliveryAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order cannot be empty' });
    }

    const trackingID = `CL-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalPrice = items.reduce((sum: number, it: any) => sum + (it.finalPrice * it.quantity), 0);
    const roundedPrice = Math.round(totalPrice * 100) / 100;
    
    const newOrder: Order = {
      id: trackingID,
      customerName: customerName || 'Guest User',
      deliveryAddress: deliveryAddress || 'Chicken Licken Local Area',
      status: 'Preparing',
      timestamp: new Date().toISOString(),
      totalPrice: roundedPrice,
      pointsEarned: Math.round(roundedPrice * 10),
      items: items
    };

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status as OrderStatus;
      return res.json({ success: true, order });
    }
    res.status(404).json({ error: 'Order not found' });
  });

  // Gemini AI Assistant Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    const client = getGenAI();

    if (!client) {
      // Elegant fallback simulation if GEMINI_API_KEY is not configured
      let fallbackText = '';
      const lower = message.toLowerCase();

      if (lower.includes('schema') || lower.includes('database') || lower.includes('postgres')) {
        fallbackText = `### CL Omnichannel Core PostgreSQL Database Schema (Fallback Response)

This schema covers Phase 1 and 2 database requirements for storing menu items, active customized orders, customer loyalty metrics, and restaurant details.

\`\`\`sql
-- 1. STORES TABLE
CREATE TABLE stores (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    postcode VARCHAR(15) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    operating_hours JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. MENU ITEMS
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Burgers', 'Sides', 'Drinks', etc.
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    calories INTEGER,
    allergens VARCHAR(50)[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    is_lto BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER PROFILES (Loyalty Engine ready)
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDERS HEADER
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    store_id VARCHAR(50) REFERENCES stores(id),
    status VARCHAR(30) NOT NULL DEFAULT 'Preparing', -- 'Preparing', 'Ready', 'Delivering', 'Delivered'
    total_price DECIMAL(10,2) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDER LINE ITEMS WITH CUSTOMIZATIONS
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    customization_details JSONB DEFAULT '{}', -- Saved options: {patty_count: 2, extra_cheese: 1, mayo: 'Extra'}
    item_total DECIMAL(10,2) NOT NULL
);
\`\`\`

*Note: In production workloads, Redis cluster acts as our distributed state cache to keep lock leases on shopping carts before they flush to PostgreSQL.*`;
      } else if (lower.includes('sprint') || lower.includes('phase 1') || lower.includes('sprint plan')) {
        fallbackText = `### Sprint Plan Strategy: Phase 1 — Order Core (6-Week Scope)

Here is the strategic execution broken down into three 2-week agile sprints.

#### Sprint 1 (Weeks 1-2): Menu & Customization Architecture
*   **Engineering Deliverables:**
    *   Initialize React Next.js boilerplate and Tailwind CSS theme config.
    *   Construct \`MenuPage\` client grid with sidebar filtering (Burgers, Sides, Drinks).
    *   Build the modular \`CustomizerDrawer\` supporting real-time weight/calorie recalculated state logic.
    *   Design local UI cart drawer with Zustand state synchronization.
*   **QA Validation:** Ensure customized Soulsters recalculate price values immediately on double-click selection.

#### Sprint 2 (Weeks 3-4): Checkout, Stripe Gates & Order Entity
*   **Engineering Deliverables:**
    *   Extend REST Node.js Express server to handle JSON payload orders.
    *   Integrate official stripe SDK client on backend proxy endpoint (\`/api/checkout/session\`).
    *   Construct transactional success response layout with digital ticket.
    *   Implement user verification checkpoints for Guest checkout flows.
*   **QA Validation:** Verify mock credit cards return correct status and persist order instances into PostgreSQL engine.

#### Sprint 3 (Weeks 5-6): SendGrid Receipts & Kitchen POS Intake Admin
*   **Engineering Deliverables:**
    *   Establish SendGrid SMTP adapter microservice triggering automatically upon payment events.
    *   Develop the real-time \`AdminDashboard\` representing physical kitchen POS.
    *   Ensure order status changes trigger reactive server events.
*   **QA Validation:** Full integration check: Placing test order -> Email receipt dispatches -> Live order appears in Admin queue.`;
      } else if (lower.includes('marketing') || lower.includes('automation') || lower.includes('tools')) {
        fallbackText = `### CL Omnichannel Marketing Automation Tool Recommendations

To support millions of digital guest sessions and automate multi-channel engagement, we recommend this enterprise-grade integration stack:

1.  **Transactional Messaging Platform: SendGrid API**
    *   *Purpose:* Real-time checkout receipts, double-opt-in signups, and password requests.
    *   *Why:* Deliverability rates >99% and modular template builder allows changing marketing copy without deployment.
2.  **Campaign Segments & Marketing Drip: Klaviyo**
    *   *Purpose:* Abandoned cart drip cues, monthly LTO newsletters, birthday rewards, and cohort surveys.
    *   *Why:* Native deep-links with transactional SQL metrics to target users who bought "Rock My Soul® Burger" but haven't returned in 14 days.
3.  **Real-time Push & SMS Broadcaster: Twilio SMS + Firebase Cloud Messaging (FCM)**
    *   *Purpose:* Order ETA alert pings, geo-fenced local vouchers, time-sensitive lunch deals.
    *   *Why:* FCM provides zero-cost web push rails; Twilio handles international carrier compliance fallback.`;
      } else {
        fallbackText = `### Welcome to CL Systems Architect Co-Pilot

Hello! I am your Technical Architecture Co-Pilot specializing in Chicken Licken's digital system builder and POS ecosystem.

I've configured your system schemas, automations, and tech stack details. You can ask me questions such as:
*   "Show PostgreSQL schema for orders and menu"
*   "Detail Sprint Plan for Phase 1 Order Core"
*   "What tool integrations power the marketing drip systems?"
*   "Explain the abandoned cart automation trigger logic"

How can I help you design the soul-satisfying digital infrastructure today?`;
      }

      return res.json({ text: fallbackText });
    }

    try {
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      formattedHistory.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedHistory,
        config: {
          systemInstruction: `You are CL-ARCHITECT, a Senior Enterprise Systems Architect & Digital strategist specializing in Chicken Licken's global omnichannel build phases, marketing automation stack, and CRM platform.
Your response MUST be extremely descriptive, professional, objective, and authoritative, helping engineers and product managers implement the requested Chicken Licken features. Use elegant Markdown schedules, bullet points, and SQL code blocks when requested.`
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "AI response failed. Fallback operational." });
    }
  });

  // Serve frontend build static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite development middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chicken Licken System Simulator listening on port ${PORT}`);
  });
}

startServer();
