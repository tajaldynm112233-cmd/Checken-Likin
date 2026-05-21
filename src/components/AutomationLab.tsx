/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Check, AlertCircle, Terminal, RefreshCw, Mail, HelpCircle, Flame, Server, Cpu, Clock, Bell, Settings } from 'lucide-react';
import { AutomationTrigger, AutomationStep } from '../types';

interface AutomationLabProps {
  activeTrigger: AutomationTrigger | null;
  onRunAutomationDirectly: (trigger: AutomationTrigger) => void;
  logs: string[];
  setLogs: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AutomationLab({
  activeTrigger,
  onRunAutomationDirectly,
  logs,
  setLogs
}: AutomationLabProps) {
  // Preset list of ultimate operational automations
  const [triggers, setTriggers] = useState<AutomationTrigger[]>([
    {
      id: 'order_confirm',
      name: 'Omnichannel POS Ingestion Engine',
      description: 'Dispatched instantly when Stripe confirms a client payment.',
      icon: 'Server',
      triggerType: 'Event',
      currentStepIndex: -1,
      isRunning: false,
      log: [],
      steps: [
        { label: 'POS SQLite DB Sync', durationMs: 1200, status: 'pending', description: 'Locks order parameters and commits record in global PostgreSQL cluster.' },
        { label: 'SendGrid Receipts dispatch', durationMs: 1400, status: 'pending', description: 'Assembles transactional HTML email template and dispatches via SMTP.' },
        { label: 'Twilio SMS ETA Dispatch', durationMs: 1200, status: 'pending', description: 'Pings consumer with confirmation token and live countdown URL.' },
        { label: 'Kitchen KDS push', durationMs: 1000, status: 'pending', description: 'Beeps visual dashboard of the designated physical restaurant node.' },
        { label: 'CL Rewards ledger update', durationMs: 1000, status: 'pending', description: 'Deposits +10 Soul reward points per dollar spent into user profile.' }
      ]
    },
    {
      id: 'abandoned_cart',
      name: 'Simulated Abandoned Cart Recovery',
      description: 'Scheduled trigger for guest sessions who added food to cart but stalled.',
      icon: 'Clock',
      triggerType: 'Scheduled',
      currentStepIndex: -1,
      isRunning: false,
      log: [],
      steps: [
        { label: 'Fetch idle sessions', durationMs: 1000, status: 'pending', description: 'Scans Redis state cache for shopping carts inactive for a specific timeframe.' },
        { label: 'Dispatch Day 1 email drip', durationMs: 1500, status: 'pending', description: 'Generates Klaviyo trigger with subject "Did you forget your Soulster®?"' },
        { label: 'Mobile FCM Push alert', durationMs: 1200, status: 'pending', description: 'Sends high-priority Firebase Cloud message containing free fries voucher.' },
        { label: 'Discount conversion audit', durationMs: 1000, status: 'pending', description: 'Monitors if user resumes checkout session and claims the LTO promotion.' }
      ]
    },
    {
      id: 'post_order_feedback',
      name: 'Reassurance Feedback Filter (Post-Delivery)',
      description: 'Fired 30 minutes post-delivery. Handles support or SEO reviews dynamically.',
      icon: 'Bell',
      triggerType: 'Delayed',
      currentStepIndex: -1,
      isRunning: false,
      log: [],
      steps: [
        { label: 'Dispatch review prompt SMS', durationMs: 1200, status: 'pending', description: 'Sends clean interactive 1-5 star rating questionnaire to consumer.' },
        { label: 'Evaluate score criteria', durationMs: 1000, status: 'pending', description: 'System checks input score: 4-5 stars are routed to public SEO; 1-3 go to internal triage.' },
        { label: 'Low rating: Zendesk SLA trigger', durationMs: 1400, status: 'pending', description: 'Spawns high-priority customer recovery ticket for staff to call back.' },
        { label: 'High rating: Google Business invite', durationMs: 1205, status: 'pending', description: 'Dispatches automated email with a 1-tap link to post a Google Review.' }
      ]
    },
    {
      id: 'out_of_stock_handshake',
      name: 'Out-Of-Stock POS Emergency Sync',
      description: 'Fires when kitchen signals an ingredient shortfall (e.g. out of chicken patties).',
      icon: 'Cpu',
      triggerType: 'Event',
      currentStepIndex: -1,
      isRunning: false,
      log: [],
      steps: [
        { label: 'Ingest kitchen POS alert', durationMs: 1000, status: 'pending', description: 'Receives inventory threshold notifications from the smart fryer system.' },
        { label: 'Global Menu gray out', durationMs: 1200, status: 'pending', description: 'Sets item status to unavailable. Website grays out item immediately.' },
        { label: 'Dynamic substitute selection', durationMs: 1200, status: 'pending', description: 'Recommends Soulfire® Hot Wings to cart sessions that previously had missing chicken items.' },
        { label: 'Send replenishment notification', durationMs: 1100, status: 'pending', description: 'Triggers local logistics broker supply dispatch for next day delivery.' }
      ]
    }
  ]);

  const [simulatedEngine, setSimulatedEngine] = useState<AutomationTrigger | null>(null);

  useEffect(() => {
    if (activeTrigger) {
      // Direct remote launch from MenuStudio checkouts!
      const found = triggers.find(t => t.id === 'order_confirm');
      if (found) {
        handleFireAutomation(found);
      }
    }
  }, [activeTrigger]);

  const handleFireAutomation = (trigger: AutomationTrigger) => {
    if (simulatedEngine && simulatedEngine.isRunning) return;

    // Deep copy triggered engine to preserve steps state
    const copied: AutomationTrigger = JSON.parse(JSON.stringify(trigger));
    copied.isRunning = true;
    copied.currentStepIndex = 0;
    copied.steps[0].status = 'active';
    
    // Add logs
    const initLogs = [
      `[INFO] [${new Date().toLocaleTimeString()}] Initializing Automation pipeline: ${copied.name}`,
      `[INFO] [${new Date().toLocaleTimeString()}] Event category: ${copied.triggerType} Trigger`,
      `[INFO] [${new Date().toLocaleTimeString()}] Phase 4 Automation engine firing task [node_0]...`
    ];
    copied.log = initLogs;
    setLogs(prev => [...initLogs, ...prev]);
    setSimulatedEngine(copied);

    runNextStep(copied, 0);
  };

  const runNextStep = (currentEngine: AutomationTrigger, index: number) => {
    const step = currentEngine.steps[index];
    if (!step) return;

    setTimeout(() => {
      setSimulatedEngine(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        
        // Mark current completed
        updated.steps[index].status = 'completed';
        const timestamp = new Date().toLocaleTimeString();
        updated.log.push(`[COMPLETED] [${timestamp}] Resolved phase: "${step.label}"`);
        setLogs(l => [`[COMPLETED] [${timestamp}] [${updated.name}] Resolved: ${step.label}`, ...l]);

        const nextIndex = index + 1;
        if (nextIndex < updated.steps.length) {
          updated.currentStepIndex = nextIndex;
          updated.steps[nextIndex].status = 'active';
          updated.log.push(`[ACTIVE] [${timestamp}] Launching step ${nextIndex + 1}: "${updated.steps[nextIndex].label}"`);
          setLogs(l => [`[ACTIVE] [${timestamp}] [${updated.name}] In progress: ${updated.steps[nextIndex].label}`, ...l]);
          
          // Recurrent trigger
          runNextStep(updated, nextIndex);
        } else {
          updated.isRunning = false;
          updated.currentStepIndex = -1;
          updated.log.push(`[SUCCESS] [${timestamp}] Automation fully resolved. Operational states synced.`);
          setLogs(l => [`[SUCCESS] [${timestamp}] [${updated.name}] Automation pipeline fully resolved safely.`, ...l]);
        }
        return updated;
      });
    }, step.durationMs);
  };

  const clearAllLogs = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-6" id="omnichannel-automation-lab">
      <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 flex flex-wrap md:flex-nowrap justify-between gap-4 items-center">
        <div>
          <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5 leading-tight">
            <Cpu className="w-5 h-5 text-amber-800" />
            Phase 4 Operations & Marketing Automations Simulator
          </h3>
          <p className="text-[10px] text-stone-500 mt-1 leading-normal">
            Fire the events below to visually inspect the background cron routines, third-party messaging handshakes, and database relays.
          </p>
        </div>

        <button
          onClick={clearAllLogs}
          className="text-stone-500 hover:text-stone-900 bg-white hover:bg-amber-100/50 border border-stone-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ml-auto shrink-0 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Console Logs
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left column: Trigger Switch board (Cards) */}
        <div className="xl:col-span-4 space-y-4">
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Available Simulators</span>
          
          <div className="space-y-3">
            {triggers.map(trig => {
              const isActiveSim = simulatedEngine?.id === trig.id;
              const isRunningSim = simulatedEngine?.isRunning && isActiveSim;

              return (
                <div
                  key={trig.id}
                  id={`automation-card-${trig.id}`}
                  className={`bg-white p-4 rounded-xl border transition-all ${
                    isActiveSim ? 'border-amber-700 bg-amber-50/10 shadow-md' : 'border-stone-100 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider rounded bg-stone-100 text-stone-600">
                      {trig.triggerType}
                    </span>
                    {isRunningSim && (
                      <span className="text-red-600 font-extrabold text-[9px] animate-pulse flex items-center gap-1 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                        ● Running
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-stone-900 text-xs leading-tight mb-1">{trig.name}</h4>
                  <p className="text-[10px] text-stone-550 mb-3.5 leading-normal">{trig.description}</p>

                  <button
                    disabled={simulatedEngine?.isRunning}
                    onClick={() => handleFireAutomation(trig)}
                    className={`text-[10px] font-black w-full py-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 uppercase ${
                      simulatedEngine?.isRunning
                        ? 'bg-stone-50 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-amber-800 hover:bg-amber-900 text-white border-transparent cursor-pointer'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Test Event Trigger
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right columns: Progress Flow Timeline and Live Logs Console */}
        <div className="xl:col-span-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Timeline visualization */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide border-b border-stone-100 pb-2 mb-4">
                Active Execution Timeline
              </h4>

              {simulatedEngine ? (
                <div className="space-y-4">
                  <div className="mb-4">
                    <strong className="text-xs text-stone-900 font-extrabold block mb-0.5">{simulatedEngine.name}</strong>
                    <span className="text-[10px] text-stone-500">{simulatedEngine.description}</span>
                  </div>

                  {/* Vertical Progression timeline stepper */}
                  <div className="relative pl-6 space-y-5">
                    {/* Line behind steps */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-stone-150"></div>

                    {simulatedEngine.steps.map((step, idx) => {
                      let stepDotClass = 'bg-stone-200 border-stone-300';
                      let stepLabelClass = 'text-stone-400';

                      if (step.status === 'active') {
                        stepDotClass = 'bg-amber-500 border-amber-600 scale-125 animate-pulse';
                        stepLabelClass = 'text-stone-900 font-extrabold';
                      } else if (step.status === 'completed') {
                        stepDotClass = 'bg-emerald-600 border-emerald-700';
                        stepLabelClass = 'text-stone-700 font-medium';
                      }

                      return (
                        <div key={idx} className="relative text-xs">
                          {/* Circle dot checkpoint */}
                          <div className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border transition-all duration-300 ${stepDotClass}`} />
                          
                          <div className={stepLabelClass}>
                            <div className="flex justify-between items-center pr-1">
                              <span>Step {idx + 1}: {step.label}</span>
                              <span className="text-[9px] font-mono font-bold text-stone-400">{step.durationMs / 1000}s</span>
                            </div>
                            <p className="text-[9.5px] text-stone-500 font-normal leading-normal mt-0.5">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Terminal className="w-10 h-10 text-stone-300 mb-3" />
                  <p className="text-stone-500 text-xs font-semibold">Workflow Engine Dormant</p>
                  <p className="text-stone-400 text-[10px] max-w-xs mt-1">
                    Select any Event trigger from the left panel to execute an interactive background simulation cycle.
                  </p>
                </div>
              )}
            </div>

            {simulatedEngine?.isRunning && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mt-4 flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></span>
                <span className="text-[10px] text-amber-900 font-bold">Pipeline executing... Stream logs updating in real-time.</span>
              </div>
            )}
          </div>

          {/* Real-time Streaming Command Console */}
          <div className="bg-stone-950 text-stone-250 p-5 rounded-2xl flex flex-col justify-between font-mono shadow-inner border border-stone-800">
            <div>
              <div className="flex justify-between items-center text-[10px] text-stone-400 border-b border-stone-850 pb-2 mb-3">
                <span className="font-bold flex items-center gap-1 text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  SYSTEM CONSOLE LOGS
                </span>
                <span>Active</span>
              </div>

              <div className="space-y-1.5 h-[340px] overflow-y-auto scoller-custom pr-1 text-[10px]">
                {logs.length === 0 ? (
                  <div className="text-stone-500 italic py-12 text-center text-[10px]">
                    No terminal output gathered. Trigger an automation to begin streaming POS, SendGrid and Cron events...
                  </div>
                ) : (
                  logs.map((log, idx) => {
                    let logColor = 'text-stone-300';
                    if (log.includes('[SUCCESS]')) logColor = 'text-emerald-400 font-semibold';
                    else if (log.includes('[ACTIVE]')) logColor = 'text-amber-400';
                    else if (log.includes('[COMPLETED]')) logColor = 'text-blue-300';

                    return (
                      <div key={idx} className={`leading-relaxed ${logColor}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-stone-900 pt-3 mt-3 text-[9px] text-stone-500 flex justify-between">
              <span>Host Engine: AIS-CloudRun Node</span>
              <span>Port: 3000 (Mocked POS Sync)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
