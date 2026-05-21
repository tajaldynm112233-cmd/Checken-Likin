/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NutritionInfo {
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
}

export interface CustomizeOption {
  id: string;
  name: string;
  type: 'toggle' | 'count' | 'choice';
  currentVal: boolean | number | string;
  choices?: string[];
  unitCalories?: number;
  unitPrice?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Burgers' | 'Chicken & Fish' | 'Sides' | 'Drinks' | 'Desserts';
  description: string;
  price: number;
  image: string;
  nutrition: NutritionInfo;
  isAvailable: boolean;
  isLTO?: boolean; // Limited Time Offer (has countdown timers)
  allergens: string[];
  customizable: boolean;
  defaultCustomizations?: CustomizeOption[];
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  customizations: CustomizeOption[];
  quantity: number;
  finalPrice: number;
  finalNutrition: NutritionInfo;
}

export type OrderStatus = 'Preparing' | 'Ready' | 'Delivering' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  customerName: string;
  deliveryAddress: string;
  timestamp: string; // ISO string
  pointsEarned: number;
}

export interface AutomationStep {
  label: string;
  durationMs: number;
  status: 'pending' | 'active' | 'completed';
  description: string;
}

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  icon: string;
  triggerType: 'Event' | 'Scheduled' | 'Delayed';
  steps: AutomationStep[];
  currentStepIndex: number;
  isRunning: boolean;
  log: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
