/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, OrderItem, CustomizeOption, NutritionInfo } from '../types';
import { Flame, Info, Check, Plus, Minus, ShoppingBag, Eye, X, Sparkles, MapPin, User, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuStudioProps {
  menu: MenuItem[];
  cart: OrderItem[];
  setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  onOrderPlaced: (order: any) => void;
  onRunAutomation: (type: string, details?: string) => void;
}

export default function MenuStudio({ menu, cart, setCart, onOrderPlaced, onRunAutomation }: MenuStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Burgers');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<CustomizeOption[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'cart' | 'confirming'>('browse');

  // Checkout inputs
  const [custName, setCustName] = useState('Sarah Jenkins');
  const [custAddress, setCustAddress] = useState('Apt 42, 18 Great Portland St, W1W 6PH');

  // LTO Countdown state
  const [countdown, setCountdown] = useState({ h: 3, m: 24, s: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { h: prev.h, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return { h: 6, m: 0, s: 0 }; // Loop back
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startCustomizing = (item: MenuItem) => {
    setCustomizingItem(item);
    if (item.defaultCustomizations) {
      // Deep copy standard defaults
      setCustomizations(JSON.parse(JSON.stringify(item.defaultCustomizations)));
    } else {
      setCustomizations([]);
    }
  };

  const handleToggleOption = (id: string) => {
    setCustomizations(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, currentVal: !opt.currentVal };
      }
      return opt;
    }));
  };

  const handleCountOption = (id: string, dir: 'inc' | 'dec') => {
    setCustomizations(prev => prev.map(opt => {
      if (opt.id === id && typeof opt.currentVal === 'number') {
        const nextVal = dir === 'inc' ? opt.currentVal + 1 : opt.currentVal - 1;
        if (nextVal >= 0 && nextVal <= 4) { // Limit to 4 mods of any item
          return { ...opt, currentVal: nextVal };
        }
      }
      return opt;
    }));
  };

  const handleChoiceOption = (id: string, choice: string) => {
    setCustomizations(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, currentVal: choice };
      }
      return opt;
    }));
  };

  // Dynamic calculations for calories, price, nutrients
  const calculateDerivedValues = () => {
    if (!customizingItem) return { price: 0, calories: 0, carbs: 0, protein: 0, fat: 0 };
    
    let basePrice = customizingItem.price;
    let baseCals = customizingItem.nutrition.calories;
    let baseProtein = customizingItem.nutrition.protein;
    let baseCarbs = customizingItem.nutrition.carbs;
    let baseFat = customizingItem.nutrition.fat;

    customizations.forEach(opt => {
      if (opt.type === 'count' && typeof opt.currentVal === 'number') {
        // Standard template: find delta vs original value (Whopper begins with 1 Patty for instance)
        const defaultValue = customizingItem.defaultCustomizations?.find(d => d.id === opt.id)?.currentVal as number || 0;
        const delta = opt.currentVal - defaultValue;
        if (delta !== 0) {
          basePrice += delta * (opt.unitPrice || 0);
          baseCals += delta * (opt.unitCalories || 0);
          // Recalculating ratios (patties/cheese are protein/fats rich)
          if (opt.id === 'patty') {
            baseProtein += delta * 18;
            baseFat += delta * 15;
            baseCarbs += delta * 1;
          } else if (opt.id === 'cheese') {
            baseProtein += delta * 4;
            baseFat += delta * 5;
            baseCarbs += delta * 0.5;
          } else if (opt.id === 'bacon') {
            baseProtein += delta * 6;
            baseFat += delta * 7;
          }
        }
      } else if (opt.type === 'toggle') {
        const defaultValue = customizingItem.defaultCustomizations?.find(d => d.id === opt.id)?.currentVal as boolean;
        if (opt.currentVal !== defaultValue) {
          if (opt.currentVal) {
            basePrice += opt.unitPrice || 0;
            baseCals += opt.unitCalories || 0;
            if (opt.id === 'jalapenos') baseCarbs += 1;
          } else {
            // Subtracting customized items
            baseCals -= opt.unitCalories || 0;
          }
        }
      } else if (opt.type === 'choice') {
        const defaultValue = customizingItem.defaultCustomizations?.find(d => d.id === opt.id)?.currentVal as string;
        if (opt.currentVal !== defaultValue) {
          if (opt.currentVal === 'None') baseCals -= 90;
          else if (opt.currentVal === 'Light') baseCals -= 45;
          else if (opt.currentVal === 'Extra') baseCals += 45;
        }
      }
    });

    return {
      price: Math.max(2.00, Number(basePrice.toFixed(2))),
      calories: Math.max(10, baseCals),
      protein: Math.max(0, baseProtein),
      carbs: Math.max(0, baseCarbs),
      fat: Math.max(0, baseFat)
    };
  };

  const addToCartFromCustomizer = () => {
    if (!customizingItem) return;
    const derived = calculateDerivedValues();
    
    const newCartItem: OrderItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      menuItem: customizingItem,
      customizations: customizations,
      quantity: 1,
      finalPrice: derived.price,
      finalNutrition: {
        calories: derived.calories,
        protein: derived.protein,
        carbs: derived.carbs,
        fat: derived.fat
      }
    };

    setCart(prev => [...prev, newCartItem]);
    setCustomizingItem(null);
  };

  const handleSimpleAddToCart = (item: MenuItem) => {
    const newCartItem: OrderItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      menuItem: item,
      customizations: [],
      quantity: 1,
      finalPrice: item.price,
      finalNutrition: item.nutrition
    };
    setCart(prev => [...prev, newCartItem]);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const handleCartQuantity = (id: string, dir: 'inc' | 'dec') => {
    setCart(prev => prev.map(c => {
      if (c.id === id) {
        const newQty = dir === 'inc' ? c.quantity + 1 : c.quantity - 1;
        if (newQty > 0) return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setCheckoutStep('confirming');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerName: custName,
          deliveryAddress: custAddress
        })
      });

      if (response.ok) {
        const placed = await response.json();
        onOrderPlaced(placed);
        setCart([]);
        setCheckoutStep('browse');
        // Automatically run Order Confirmed automation timeline!
        onRunAutomation('order_placed', `${placed.id} by ${custName}`);
      } else {
        alert('Order submission failed. Please try again.');
        setCheckoutStep('cart');
      }
    } catch (e) {
      console.error(e);
      setCheckoutStep('cart');
    }
  };

  const currentDerived = calculateDerivedValues();
  const categories = ['Burgers', 'Chicken & Fish', 'Sides', 'Drinks', 'Desserts'];

  return (
    <div className="space-y-6" id="customer-ordering-hub">
      {/* Categories Bar */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              id={`cat-tab-${cat.toLowerCase().replace(/ & /g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-800 text-white shadow-md'
                  : 'bg-white hover:bg-amber-100/50 text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Floating Cart Button */}
        <button
          id="toggle-cart-btn"
          onClick={() => setCheckoutStep(checkoutStep === 'cart' ? 'browse' : 'cart')}
          className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm ml-auto md:ml-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({cart.reduce((s, c) => s + c.quantity, 0)})</span>
          {cart.length > 0 && (
            <span className="bg-white text-red-600 px-1.5 py-0.5 rounded-full font-extrabold text-[10px] ml-0.5">
              ${cartTotal.toFixed(2)}
            </span>
          )}
        </button>
      </div>

      {checkoutStep === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu
            .filter(item => item.category === selectedCategory)
            .map(item => {
              const formattedCountdown = `${String(countdown.h).padStart(2, '0')}h ${String(countdown.m).padStart(2, '0')}m ${String(countdown.s).padStart(2, '0')}s`;

              return (
                <div
                  key={item.id}
                  id={`menu-card-${item.id}`}
                  className={`bg-white rounded-2xl border ${
                    item.isAvailable ? 'border-amber-100/50 hover:border-amber-200' : 'border-stone-200 opacity-60'
                  } overflow-hidden shadow-sm transition-all duration-200 flex flex-col`}
                >
                  {/* Image container with LTO Tag */}
                  <div className="relative h-44 bg-amber-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center p-2">
                        <span className="bg-stone-900 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg border border-stone-700">
                          Out of Stock on POS
                        </span>
                      </div>
                    )}
                    {item.isLTO && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                        <span>Soulfire Deal</span>
                      </div>
                    )}
                    {item.isLTO && (
                      <div className="absolute bottom-3 right-3 bg-stone-950/80 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/30">
                        Expires: {formattedCountdown}
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-extrabold text-stone-900 text-sm leading-tight">{item.name}</h4>
                        <span className="text-amber-800 font-black text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                    </div>

                    <div className="space-y-3">
                      {/* Calories indicator */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-900 text-[10px] px-2 py-1 rounded font-bold border border-amber-100">
                          <Flame className="w-3 h-3 text-amber-700 fill-amber-600" />
                          {item.nutrition.calories} kcal
                        </span>
                        {item.allergens.length > 0 && (
                          <span className="text-stone-500 text-[9px]">
                            Allergens: {item.allergens.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Action trigger row */}
                      <div className="pt-2 border-t border-stone-100 flex gap-2">
                        {item.customizable && item.isAvailable ? (
                          <button
                            id={`cust-btn-${item.id}`}
                            onClick={() => startCustomizing(item)}
                            className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-extrabold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Info className="w-3.5 h-3.5" />
                            Customize Whopper
                          </button>
                        ) : (
                          <span className="inline-block flex-1 bg-stone-50 text-stone-400 text-[10px] text-center font-semibold py-2">
                            Standard Grill Only
                          </span>
                        )}
                        <button
                          id={`add-btn-${item.id}`}
                          disabled={!item.isAvailable}
                          onClick={() => handleSimpleAddToCart(item)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                            item.isAvailable
                              ? 'bg-amber-800 hover:bg-amber-900 text-white'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Cart & Checkout Panel */
        <div className="bg-amber-50/30 rounded-3xl border border-amber-100 p-6 max-w-2xl mx-auto shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-amber-100">
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              Your Simulated checkout System ({cart.reduce((s, c) => s + c.quantity, 0)} items)
            </h3>
            <button
              id="back-to-browse"
              onClick={() => setCheckoutStep('browse')}
              className="text-stone-500 hover:text-stone-900 text-xs font-bold cursor-pointer"
            >
              ← Keep Browsing
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 text-xs mb-4">You have no items in your simulated cart.</p>
              <button
                id="cart-empty-browse-btn"
                onClick={() => setCheckoutStep('browse')}
                className="bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Go Back to Menu
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items List */}
              <div className="space-y-3">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-amber-100 flex justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <h4 className="font-black text-stone-950 text-xs">{item.menuItem.name}</h4>
                      {item.customizations.some(c => {
                        const def = item.menuItem.defaultCustomizations?.find(d => d.id === c.id)?.currentVal;
                        return c.currentVal !== def;
                      }) && (
                        <div className="text-[10px] text-stone-500 space-y-0.5 mt-1 list-none pl-0">
                          {item.customizations
                            .filter(c => {
                              const def = item.menuItem.defaultCustomizations?.find(d => d.id === c.id)?.currentVal;
                              return c.currentVal !== def;
                            })
                            .map(c => {
                              let modLabel = '';
                              if (c.type === 'count') {
                                modLabel = `${c.currentVal}x ${c.name}`;
                              } else if (c.type === 'toggle') {
                                modLabel = c.currentVal ? `Add ${c.name}` : `No ${c.name}`;
                              } else if (c.type === 'choice') {
                                modLabel = `${c.currentVal} ${c.name}`;
                              }
                              return (
                                <div key={c.id} className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  <span>{modLabel}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                      <div className="flex gap-2.5 items-center mt-2">
                        <span className="text-xs font-black text-amber-800">${item.finalPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-400">|</span>
                        <span className="text-[10px] text-stone-800">{item.finalNutrition.calories} kcal each</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 bg-stone-50 p-1 rounded-lg border border-stone-200">
                        <button
                          onClick={() => handleCartQuantity(item.id, 'dec')}
                          className="p-1 hover:bg-stone-200 text-stone-600 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleCartQuantity(item.id, 'inc')}
                          className="p-1 hover:bg-stone-200 text-stone-600 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Card */}
              <div className="bg-amber-800 text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
                <div>
                  <div className="text-[10px] text-amber-200 font-extrabold uppercase tracking-widest">Aggregate Bill</div>
                  <div className="text-xl font-black">${cartTotal.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-amber-200 font-extrabold uppercase">CL Soul Loyalty Points</div>
                  <div className="text-xs font-bold font-mono">+{Math.round(cartTotal * 10)} Soul rewards</div>
                </div>
              </div>

              {/* Delivery info form */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-amber-100">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  Simulated Billing & Delivery Destination
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">CUSTOMER NAME</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input
                        id="checkout-name-input"
                        type="text"
                        value={custName}
                        onChange={e => setCustName(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="E.g. James Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">DELIVERY INSTANCE ADDRESS</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                      <input
                        id="checkout-address-input"
                        type="text"
                        value={custAddress}
                        onChange={e => setCustAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="E.g. Street Node 14B"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgent Action */}
              <button
                id="stripe-checkout-btn"
                disabled={checkoutStep === 'confirming'}
                onClick={submitOrder}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {checkoutStep === 'confirming' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Transmitting POS transaction...
                  </span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Place Simulated Order (Stripe Pay)
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* SOULSTER CUSTOMIZATION PANEL (AnimatePresence) */}
      <AnimatePresence>
        {customizingItem && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              id="whopper-customizer-modal"
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-100 max-w-2xl w-full flex flex-col max-h-[90vh]"
            >
              {/* Modal Head */}
              <div className="p-4 bg-amber-50 flex justify-between items-center border-b border-amber-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-800 fill-yellow-450 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">{customizingItem.name}</h3>
                    <p className="text-[10px] text-stone-500">Live Nutritional Sandbox Recalculator</p>
                  </div>
                </div>
                <button
                  id="close-customizer-btn"
                  onClick={() => setCustomizingItem(null)}
                  className="p-1.5 rounded-full hover:bg-amber-100 transition-all cursor-pointer text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-stone-100">
                  {/* Left Column: Image & Calorie recalculation bars */}
                  <div className="space-y-4">
                    <div className="h-44 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
                      <img
                        src={customizingItem.image}
                        alt={customizingItem.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Caloric & Macro recrystallisation details */}
                    <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-stone-700 tracking-wide flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-700" />
                          Calorie Metrics
                        </span>
                        <span className="font-mono text-xs font-extrabold text-amber-950">{currentDerived.calories} kcal</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (currentDerived.calories / 1300) * 100)}%` }}
                        ></div>
                      </div>

                      {/* Nutrient detailed meters */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-white p-2 border border-amber-100/50 rounded-xl">
                          <div className="text-[9px] font-bold text-stone-500 uppercase">Protein</div>
                          <div className="text-xs font-black text-emerald-700">{Math.round(currentDerived.protein)}g</div>
                        </div>
                        <div className="bg-white p-2 border border-amber-100/50 rounded-xl">
                          <div className="text-[9px] font-bold text-stone-500 uppercase">Carbs</div>
                          <div className="text-xs font-black text-amber-800">{Math.round(currentDerived.carbs)}g</div>
                        </div>
                        <div className="bg-white p-2 border border-amber-100/50 rounded-xl">
                          <div className="text-[9px] font-bold text-stone-500 uppercase">fats</div>
                          <div className="text-xs font-black text-red-700">{Math.round(currentDerived.fat)}g</div>
                        </div>
                      </div>
                      <div className="text-[8px] text-center text-stone-400">Nutritional estimations are dynamic based on chosen variables.</div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Modifiers scrollable */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-stone-900 border-b border-stone-100 pb-2 uppercase tracking-wide">
                      Select Your Add-ons
                    </h4>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {customizations.map(opt => (
                        <div key={opt.id} className="flex items-center justify-between p-2 hover:bg-stone-50 rounded-xl gap-4">
                          <div>
                            <span className="block text-xs font-extrabold text-stone-800">{opt.name}</span>
                            <span className="block text-[10px] text-stone-500">
                              {opt.unitPrice ? `+$${opt.unitPrice.toFixed(2)} | ` : ''}
                              +{opt.unitCalories || 0} kcal
                            </span>
                          </div>

                          {/* Options actions switcher */}
                          {opt.type === 'count' && typeof opt.currentVal === 'number' && (
                            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
                              <button
                                onClick={() => handleCountOption(opt.id, 'dec')}
                                className="p-1 hover:bg-stone-200 text-stone-600 rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-extrabold text-xs w-4 text-center">{opt.currentVal}</span>
                              <button
                                onClick={() => handleCountOption(opt.id, 'inc')}
                                className="p-1 hover:bg-stone-200 text-stone-600 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {opt.type === 'toggle' && (
                            <button
                              onClick={() => handleToggleOption(opt.id)}
                              className={`w-10 h-6 flex items-center rounded-full p-1 transition-all cursor-pointer ${
                                opt.currentVal ? 'bg-amber-800 justify-end' : 'bg-stone-300 justify-start'
                              }`}
                            >
                              <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                            </button>
                          )}

                          {opt.type === 'choice' && (
                            <div className="flex gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                              {opt.choices?.map(ch => (
                                <button
                                  key={ch}
                                  onClick={() => handleChoiceOption(opt.id, ch)}
                                  className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                                    opt.currentVal === ch
                                      ? 'bg-amber-800 text-white shadow-sm'
                                      : 'text-stone-600 hover:bg-stone-200'
                                  }`}
                                >
                                  {ch}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergen check warning */}
                {customizingItem.allergens.length > 0 && (
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-stone-700 font-bold uppercase tracking-wider mb-0.5">Allergen Safety Check</p>
                      <p className="text-[10px] text-stone-500 leading-normal">
                        This item natively contains: <strong className="text-stone-700">{customizingItem.allergens.join(', ')}</strong>. May be subjected to kitchen cross-contact. Consult clinical dietary limits if sensitive.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wide">Customized Subtotal</div>
                  <div className="text-lg font-black text-amber-900">${currentDerived.price.toFixed(2)}</div>
                </div>
                <button
                  id="confirm-customization-btn"
                  onClick={addToCartFromCustomizer}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-black py-2.5 px-6 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Apply Customization
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
