/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, Order, OrderItem, ChatMessage, AutomationTrigger } from './types';
import MenuStudio from './components/MenuStudio';
import AdminCockpit from './components/AdminCockpit';
import AutomationLab from './components/AutomationLab';
import SystemArchitect from './components/SystemArchitect';
import SystemPhases from './components/SystemPhases';
import { Flame, Coffee, ShieldCheck, HelpCircle, Terminal, Layers, Sparkles, BookOpen, Settings, CheckSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pages' | 'automations' | 'tech' | 'admin' | 'phases'>('pages');
  
  // Back-and-front state sync
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  // Custom automated timeline logs list
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [pendingAutomationRemote, setPendingAutomationRemote] = useState<AutomationTrigger | null>(null);

  // Notifications banner toast state
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warn' }[]>([]);

  // AI chat logs preloaded greeting
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 **Welcome to Chicken Licken Systems Architect Co-Pilot!**\n\nI am your Enterprise Tech Architect specializing in Chicken Licken's omnichannel engineering. I am preloaded with the exact details of the **5-Phase build roadmap**, our **PostgreSQL schemas**, and **automations algorithms** (SendGrid transactional SMTP receipts, Firebase FCM pushes, and Redis cart leases).\n\nFeel free to write custom prompts or use our suggested topics to generate real Next.js/Node snippets, sprint plans, or integration maps!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Initial loading
  useEffect(() => {
    fetchMenu();
    fetchOrders();

    // Setup initial system logs
    setConsoleLogs([
      `[INFO] [${new Date().toLocaleTimeString()}] Systems Simulator booted successfully.`,
      `[INFO] [${new Date().toLocaleTimeString()}] Bound to Port 3000, Environment: Development simulation`,
      `[INFO] [${new Date().toLocaleTimeString()}] In-memory relational PostgreSQL emulator active.`,
      `[INFO] [${new Date().toLocaleTimeString()}] All systems green. Consuming Guest ordering flows.`
    ]);
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
      }
    } catch (e) {
      console.error('Error fetching menu menu:', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (e) {
      console.error('Error fetching orders queue:', e);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        // Refresh orders immediately
        fetchOrders();
        addNotification(`Order ${id} advanced to status: ${status}`, 'success');
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleToggleMenuItemAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/menu/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable })
      });
      if (response.ok) {
        // Sync menu
        fetchMenu();
        const item = menu.find(m => m.id === id);
        addNotification(`${item?.name || 'Item'} is now ${isAvailable ? 'In Stock' : 'Out of Stock'} on POS`, isAvailable ? 'info' : 'warn');
        
        // Also add system console logs for this action
        const timestamp = new Date().toLocaleTimeString();
        setConsoleLogs(prev => [
          `[CRITICAL_SYNC] [${timestamp}] Menu ID "${id}" toggled stock status on POS to ${isAvailable ? 'IN_STOCK' : 'OUT_OF_STOCK'}. All client sessions updated.`,
          ...prev
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addNotification = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    const id = `notif_${Date.now()}`;
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Launch preconfigured timeline visualizer inside the Automations Lab Tab
  const handleTriggerAutomationRemote = (type: string, details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Add toast notifications
    if (type === 'order_placed') {
      addNotification(`🔔 Checkout Success: New transaction parsed! Running receipt pipelines.`, 'success');
      setConsoleLogs(prev => [
        `[TRANSACTION] [${timestamp}] Customer confirmed Stripe order ${details || ''}. Initializing event pipelines.`,
        ...prev
      ]);
    } else if (type === 'order_status_change') {
      addNotification(`📦 POS Notification: Order advanced tracking. Dispatched SMS updates.`, 'info');
      setConsoleLogs(prev => [
        `[POS_KITCHEN] [${timestamp}] Status change captured for transaction ${details || ''}. Synchronizing sockets.`,
        ...prev
      ]);
    }

    // Pass active signal to run automatically
    setPendingAutomationRemote({ id: 'order_confirm' } as any);
  };

  // Triggered when clicking chips/sprints in other tabs to ask AI Architect questions
  const askArchitectSearch = (topic: string) => {
    setActiveTab('tech'); // Redirect to systems tab
    // We target the chat widget in Technical System Tab
    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: 'user',
      text: topic,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, userMsg]);
    
    // Auto query backend
    triggerArchitectAPI(topic);
  };

  const triggerArchitectAPI = async (text: string) => {
    try {
      // Small timeout to assure tab rendered before load state
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.length > 1 ? chatHistory : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, {
          id: `chat_${Date.now() + 1}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const tabs = [
    { id: 'pages', label: 'Customer Ordering', icon: Coffee },
    { id: 'admin', label: 'Admin POS Cockpit', icon: Layers },
    { id: 'automations', label: 'Automations Studio', icon: Terminal },
    { id: 'tech', label: 'Systems & AI Architect', icon: Sparkles },
    { id: 'phases', label: 'Milestones & Roadmap', icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans select-none antialiased">
      {/* Top Header bar */}
      <header className="bg-orange-850 text-amber-50 py-4 px-6 border-b border-orange-950 flex flex-wrap justify-between items-center gap-4 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center p-1 border border-amber-350 shadow-sm animate-pulse">
            <Flame className="w-5 h-5 text-white fill-yellow-450 animate-bounce" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight uppercase leading-none">Chicken Licken</h1>
            <span className="text-[10px] text-amber-200 font-bold block mt-1 tracking-wider">OMNICHANNEL OPERATIONS BLUEPRINT</span>
          </div>
        </div>

        {/* Global system status counters */}
        <div className="flex items-center gap-6 text-[11px] font-bold">
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Kitchen POS Sync: online</span>
          </div>
          <div className="bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/30">
            <span>Orders Queue: <strong>{orders.filter(o => o.status !=='Delivered' && o.status !== 'Cancelled').length} Active</strong></span>
          </div>
        </div>
      </header>

      {/* Primary Sub Tabs Navigator */}
      <nav className="bg-amber-50/55 border-b border-amber-100 flex overflow-x-auto py-2.5 px-6 gap-2 flex-shrink-0 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl cursor-pointer transition-all whitespace-nowrap border ${
                activeTab === tab.id
                  ? 'bg-white text-stone-950 border-amber-200 shadow-sm'
                  : 'bg-transparent text-stone-500 hover:text-stone-900 border-transparent hover:bg-stone-100/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-amber-800' : 'text-stone-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 overflow-hidden">
        
        {/* Dynamic visual tab layout panels */}
        <div className="h-full">
          {activeTab === 'pages' && (
            <MenuStudio
              menu={menu}
              cart={cart}
              setCart={setCart}
              onOrderPlaced={fetchOrders}
              onRunAutomation={handleTriggerAutomationRemote}
            />
          )}

          {activeTab === 'admin' && (
            <AdminCockpit
              orders={orders}
              menu={menu}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onToggleMenuItemAvailability={handleToggleMenuItemAvailability}
              onRefreshData={() => {
                fetchOrders();
                addNotification('POS queue updated.', 'info');
              }}
              onRunAutomation={handleTriggerAutomationRemote}
            />
          )}

          {activeTab === 'automations' && (
            <AutomationLab
              activeTrigger={pendingAutomationRemote}
              onRunAutomationDirectly={() => setPendingAutomationRemote(null)}
              logs={consoleLogs}
              setLogs={setConsoleLogs}
            />
          )}

          {activeTab === 'tech' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Architecture Blueprint schematic (Left column) */}
              <div className="xl:col-span-5 bg-white p-5 rounded-3xl border border-stone-100 shadow-sm space-y-5">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5 leading-tight">
                    <Settings className="w-5 h-5 text-amber-800" />
                    System Architecture Blueprint
                  </h3>
                  <p className="text-[10px] text-stone-500 mt-1">
                    An interactive overview of our modern client-server topology. Select components to consult AI.
                  </p>
                </div>

                {/* Vertical interactive schematic diagrams */}
                <div className="space-y-3.5 pl-3 border-l border-amber-100">
                  <div className="relative group p-2.5 hover:bg-amber-50/50 rounded-xl transition-all border border-transparent hover:border-amber-100 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-amber-900 uppercase">TIER 1 — Consumer UI</span>
                      <button
                        onClick={() => askArchitectSearch('How is Zustand cart state structured on frontend?')}
                        className="text-[9px] font-bold text-stone-400 hover:text-stone-900"
                      >
                        Ask Stack Details ↗
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Vite + React (v19) SPA implementing responsive components styled with Tailwind CSS, synced with Zustand store elements.
                    </p>
                  </div>

                  <div className="p-2.5 hover:bg-amber-50/50 rounded-xl transition-all border border-transparent hover:border-amber-100 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-amber-900 uppercase">TIER 2 — API Core Gate</span>
                      <button
                        onClick={() => askArchitectSearch('Tell me the main Node Express router setup file details')}
                        className="text-[9px] font-bold text-stone-400 hover:text-stone-900"
                      >
                        Ask Stack Details ↗
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Node.js Express microservice routing static bundle assets, and exposing JSON endpoints for POS queues and AI engines.
                    </p>
                  </div>

                  <div className="p-2.5 hover:bg-amber-50/50 rounded-xl transition-all border border-transparent hover:border-amber-100 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-amber-900 uppercase">TIER 3 — Relational DB</span>
                      <button
                        onClick={() => askArchitectSearch('Give me the complete PostgreSQL schemas for orders, menus and customers')}
                        className="text-[9px] font-bold text-stone-400 hover:text-stone-900"
                      >
                        Ask Stack Details ↗
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal">
                      PostgreSQL cluster storing permanent transaction ledgers, item listings, and user loyal points balances.
                    </p>
                  </div>

                  <div className="p-2.5 hover:bg-amber-50/50 rounded-xl transition-all border border-transparent hover:border-amber-100 select-none">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-amber-900 uppercase">TIER 4 — Integrations</span>
                      <button
                        onClick={() => askArchitectSearch('What APIs does Chicken Licken integrate? (Stripe, SendGrid, Twilio FCM)')}
                        className="text-[9px] font-bold text-stone-400 hover:text-stone-900"
                      >
                        Ask Stack Details ↗
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal">
                      Stripe for digital pay, Sendgrid for receipt mailers, Twilio for ETA alerts SMS, Algolia for item search.
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-700 block uppercase tracking-wide mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Security Key Compliance
                  </span>
                  <p className="text-[9.5px] text-stone-500 leading-relaxed">
                    Omnichannel credentials like Stripe tokens, SMTP configs, and the Google Gemini API key always execute on server-side nodes.
                  </p>
                </div>
              </div>

              {/* Technical Conversational Co-pilot (Right column) */}
              <div className="xl:col-span-7">
                <SystemArchitect
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                />
              </div>

            </div>
          )}

          {activeTab === 'phases' && (
            <SystemPhases
              onAskArchitect={askArchitectSearch}
            />
          )}
        </div>

      </main>

      {/* Slide notifications banner (Floating cards stack) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(notif => {
          let typeClass = 'bg-stone-900 text-white border-stone-700';
          if (notif.type === 'success') typeClass = 'bg-emerald-800 text-white border-emerald-900';
          else if (notif.type === 'warn') typeClass = 'bg-amber-900 text-amber-50 border-amber-950';

          return (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border shadow-xl max-w-sm pointer-events-auto flex items-center gap-2 text-xs font-bold leading-normal transform transition-all duration-300 animate-slide-in ${typeClass}`}
            >
              <span>{notif.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
