/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, MenuItem, OrderStatus } from '../types';
import { ChefHat, ShoppingBag, Loader, CheckCircle, Truck, RefreshCw, Layers, ToggleLeft, ToggleRight, DollarSign, TrendingUp, Sparkles, MapPin, Inbox, Ban } from 'lucide-react';

interface AdminCockpitProps {
  orders: Order[];
  menu: MenuItem[];
  onUpdateOrderStatus: (id: string, nextStatus: OrderStatus) => void;
  onToggleMenuItemAvailability: (id: string, isAvailable: boolean) => void;
  onRefreshData: () => void;
  onRunAutomation: (type: string, details?: string) => void;
}

export default function AdminCockpit({
  orders,
  menu,
  onUpdateOrderStatus,
  onToggleMenuItemAvailability,
  onRefreshData,
  onRunAutomation
}: AdminCockpitProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Preparing' | 'Ready' | 'Delivering' | 'Delivered'>('All');

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'All') return true;
    return o.status === activeFilter;
  });

  // Calculate live core KPI metrics
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const orderCount = orders.filter(o => o.status !== 'Cancelled').length;
  const avgOrderValue = orderCount > 0 ? (totalRevenue / orderCount).toFixed(2) : '0.00';
  const totalPoints = orders.reduce((sum, o) => sum + o.pointsEarned, 0);

  // Advanced calculations for inline category SVG charts
  const categoryRevenue = {
    Burgers: 0,
    'Chicken & Fish': 0,
    Sides: 0,
    Drinks: 0,
    Desserts: 0
  };

  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    o.items.forEach(it => {
      const cat = it.menuItem.category;
      if (categoryRevenue.hasOwnProperty(cat)) {
        categoryRevenue[cat] += it.finalPrice * it.quantity;
      }
    });
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return <ChefHat className="w-4 h-4 text-amber-600 animate-bounce" />;
      case 'Ready':
        return <Inbox className="w-4 h-4 text-blue-600" />;
      case 'Delivering':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Cancelled':
        return <Ban className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Ready': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Delivering': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-50 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  const handleNextStatus = (order: Order) => {
    let next: OrderStatus = 'Preparing';
    if (order.status === 'Preparing') next = 'Ready';
    else if (order.status === 'Ready') next = 'Delivering';
    else if (order.status === 'Delivering') next = 'Delivered';

    onUpdateOrderStatus(order.id, next);

    // Run order status transition tracking automation simulation!
    onRunAutomation('order_status_change', `${order.id} is now ${next}`);
  };

  return (
    <div className="space-y-6" id="admin-analytics-pos">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wide">Live POS Revenue</span>
            <span className="block text-lg font-black text-stone-900 mt-1">${totalRevenue.toFixed(2)}</span>
            <span className="text-[9px] text-green-600 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +14.2% vs yesterday
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-green-50 border border-green-100/50">
            <DollarSign className="w-5 h-5 text-green-700" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wide">Simulated Orders</span>
            <span className="block text-lg font-black text-stone-900 mt-1">{orderCount} completed</span>
            <span className="text-[9px] text-stone-400 mt-0.5 block">Excluding cancellations</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <ShoppingBag className="w-5 h-5 text-stone-700" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wide">Avg Ticket Size (AOV)</span>
            <span className="block text-lg font-black text-stone-900 mt-1">${avgOrderValue}</span>
            <span className="text-[9px] text-amber-700 font-medium block mt-0.5">High Upsell Rate</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100/50">
            <TrendingUp className="w-5 h-5 text-amber-800" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-stone-500 font-bold uppercase tracking-wide">Soul Points Granted</span>
            <span className="block text-lg font-black text-stone-900 mt-1">{totalPoints} points</span>
            <span className="text-[9px] text-red-600 font-medium flex items-center gap-0.5 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" /> 100% Loyalty Sync
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100/50">
            <ChefHat className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Orders Feed */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-800" />
              <h3 className="font-extrabold text-stone-900 text-sm">Active POS Orders</h3>
            </div>

            {/* Status Tabs Filters */}
            <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-[10px] font-bold">
              {['All', 'Preparing', 'Ready', 'Delivering', 'Delivered'].map(status => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status as any)}
                  className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === status
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-900 transition-all cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Active Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center shadow-xs">
              <Inbox className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 text-xs font-semibold">No transactions active in this category.</p>
              <p className="text-stone-400 text-[10px] mt-1">Simulated customers can submit orders from the Customer Menu tab.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  id={`pos-order-${order.id}`}
                  className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
                >
                  {/* Item Header */}
                  <div className="bg-stone-50 p-3 border-b border-stone-100/80 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-stone-950">{order.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer & Address */}
                    <div className="space-y-1 md:border-r md:border-stone-100 pr-2">
                      <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest text-[8px]">Session Consumer</span>
                      <strong className="block text-xs text-stone-900 font-extrabold">{order.customerName}</strong>
                      <span className="text-[10px] text-stone-500 flex items-start gap-1 leading-normal">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        {order.deliveryAddress}
                      </span>
                    </div>

                    {/* Bill Contents */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="text-xs text-stone-700 flex justify-between items-start">
                            <div className="font-medium pr-4">
                              <span><strong>{item.quantity}x</strong> {item.menuItem.name}</span>
                              
                              {/* Customize lists */}
                              {item.customizations.some(c => {
                                const def = item.menuItem.defaultCustomizations?.find(d => d.id === c.id)?.currentVal;
                                return c.currentVal !== def;
                              }) && (
                                <div className="text-[9px] text-stone-400 pl-4 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                  {item.customizations
                                    .filter(c => {
                                      const def = item.menuItem.defaultCustomizations?.find(d => d.id === c.id)?.currentVal;
                                      return c.currentVal !== def;
                                    })
                                    .map(c => {
                                      let label = '';
                                      if (c.type === 'count') label = `${c.currentVal}x ${c.name}`;
                                      else if (c.type === 'toggle') label = c.currentVal ? `+${c.name}` : `No ${c.name}`;
                                      else if (c.type === 'choice') label = `${c.currentVal}`;
                                      return <span key={c.id}>• {label}</span>;
                                    })}
                                </div>
                              )}
                            </div>
                            <span className="font-mono text-stone-900 text-[11px]">${(item.finalPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Lower Action bar */}
                      <div className="pt-3 mt-3 border-t border-stone-50 flex justify-between items-center">
                        <div>
                          <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Bill Total</span>
                          <div className="font-black text-amber-900 text-xs">${order.totalPrice.toFixed(2)}</div>
                        </div>

                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleNextStatus(order)}
                            className="bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-lg mr-2 cursor-pointer transition-all flex items-center gap-1 uppercase"
                          >
                            Proceed {order.status === 'Preparing' ? 'Ready for Handover' : order.status === 'Ready' ? 'Ship Delivery' : 'Mark Delivered'} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Inventory Controller & Category Revenue */}
        <div className="space-y-6">
          {/* Inventory Manager */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-extrabold text-stone-900 text-sm mb-4 flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <Layers className="w-5 h-5 text-amber-700" />
              Kitchen Stock Controller
            </h3>

            <p className="text-[10px] text-stone-500 leading-normal mb-4">
              Disable items below. Toggling items immediately affects consumer-facing ordering catalog in real-time.
            </p>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {menu.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-stone-850 block leading-tight">{item.name}</span>
                    <span className="text-[9px] text-stone-400 uppercase">{item.category}</span>
                  </div>

                  <button
                    onClick={() => onToggleMenuItemAvailability(item.id, !item.isAvailable)}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    {item.isAvailable ? (
                      <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1 bg-emerald-50 border border-emerald-100 py-0.5 px-1.5 rounded">
                        Available
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      </span>
                    ) : (
                      <span className="text-red-700 font-bold text-[10px] flex items-center gap-1 bg-red-50 border border-red-100 py-0.5 px-1.5 rounded">
                        OOS
                        <ToggleLeft className="w-5 h-5 text-stone-400" />
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue distribution mini-visual (SVG bars) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-extrabold text-stone-900 text-sm mb-4">Revenue by Category</h3>
            
            <div className="space-y-3.5">
              {Object.entries(categoryRevenue).map(([cat, val]) => {
                const maxVal = Math.max(10, ...Object.values(categoryRevenue));
                const widthPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-stone-700">{cat}</span>
                      <span className="font-mono text-stone-900">${val.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-800 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(4, widthPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
