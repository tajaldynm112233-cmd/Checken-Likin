/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Users, TrendingUp, ChevronRight, CornerDownRight, CheckSquare, Clock } from 'lucide-react';

interface SystemPhasesProps {
  onAskArchitect: (topic: string) => void;
}

export default function SystemPhases({ onAskArchitect }: SystemPhasesProps) {
  const buildPhases = [
    {
      num: 'Phase 1 — 6 weeks',
      title: 'Order Core Engine',
      summary: 'Establishing filterable menu grids, complex customizer modals calculating macros, basic Stripe, and SendGrid.',
      items: [
        'Menu grid and product customizer drawers',
        'Zustand state-driven customer cart checkout',
        'Stripe processing endpoints mock and real API checks',
        'SendGrid automatic transactional receipt mailers',
        'Admin POS live orders screen interface'
      ],
      color: 'border-red-600'
    },
    {
      num: 'Phase 2 — 4 weeks',
      title: 'Placement & Discovery',
      summary: 'Deploying store geo-locating modules and count-downs to structure conversion urgency.',
      items: [
        'Interactive store map nodes search widget',
        'Limited Time Offers (LTO) automatic countdowns',
        'Advanced Google Maps location grounding integration',
        'Structured micro-metadata indexing schemas for local SEO'
      ],
      color: 'border-amber-600'
    },
    {
      num: 'Phase 3 — 4 weeks',
      title: 'CRM Rewards & Loyalty',
      summary: 'Incentivizing recurring checkouts via Soul loyalty points balances, gating, and milestone triggers.',
      items: [
        'CL Soul points transaction ledger',
        'User history profile pages and address vaults',
        'App-gating exclusive discount vouchers',
        'Day-0 to Day-7 promotional welcome drips'
      ],
      color: 'border-purple-600'
    },
    {
      num: 'Phase 4 — 3 weeks',
      title: 'Workflow Automation',
      summary: 'Integrating auto-recovering idle carts, real-time socket delivery maps, and rating checkers.',
      items: [
        'Redis-triggered 15-min abandoned cart workflows',
        'Socket-driven live delivery path tracking overlays',
        'Twilio SMS customer satisfaction checker SMS',
        'Zendesk recovery escalation for lower ratings'
      ],
      color: 'border-emerald-600'
    },
    {
      num: 'Phase 5 — 3 weeks',
      title: 'Operations Franchise Scaling',
      summary: 'Supporting franchise owners with aggregate reports, analytics dashboards, and marketing builders.',
      items: [
        'A/B test dashboards inspecting conversion drop-offs',
        'Contentful custom promotion layout builders',
        'Multi-store revenue aggregate summaries for managers',
        'GDPR and local compliance audits'
      ],
      color: 'border-blue-600'
    }
  ];

  const agileTeam = [
    { role: '2 × Frontend Engineers', focus: 'Next.js, Tailwind, state sync' },
    { role: '2 × Backend Developers', focus: 'Express, PostgreSQL, Redis caches, APIs' },
    { role: '1 × UI/UX Designer', focus: 'Figma templates, asset preparation' },
    { role: '1 × DevOps professional', focus: 'AWS clusters, Cloudeflare configs, CD/CD' },
    { role: '1 × Product Manager', focus: 'Sprint management, coordinate with stakeholders' }
  ];

  return (
    <div className="space-y-6" id="sprints-project-roadmap">
      {/* Upper header summary */}
      <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 flex flex-wrap md:flex-nowrap justify-between gap-4 items-center">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-widest flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Omnichannel Product Roadmap
          </span>
          <h3 className="font-extrabold text-stone-900 text-sm">System Build Phases & Agile Team Structure</h3>
          <p className="text-[10px] text-stone-500 leading-normal">
            A comprehensive, modular structure mapping the lifecycle from code zero to scalable production cluster deployment.
          </p>
        </div>

        <button
          onClick={() => onAskArchitect('Give me a detailed Agile sprint plan breakdown for the full roadmap')}
          className="text-[10px] font-bold px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1"
        >
          Consult Complete Sprint Schedule →
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 8 cols: Phase timelines */}
        <div className="xl:col-span-8 space-y-4">
          <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Recommended Build Phases</span>

          <div className="space-y-4">
            {buildPhases.map((phase, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl border-l-[5px] ${phase.color} border-y border-r border-stone-100 p-5 shadow-xs`}
              >
                <div className="flex flex-wrap md:flex-nowrap justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10.5px] font-mono font-bold text-stone-400 block">{phase.num}</span>
                    <h4 className="font-extrabold text-stone-900 text-xs mt-0.5">{phase.title}</h4>
                  </div>
                  <button
                    onClick={() => onAskArchitect(`Detail Sprint Plan for Phase ${idx + 1}: ${phase.title}`)}
                    className="text-[9.5px] font-bold text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-50 rounded-lg cursor-pointer transition-colors"
                  >
                    Ask for Phase {idx + 1} Sprint plan ↗
                  </button>
                </div>

                <p className="text-[10px] text-stone-550 leading-relaxed mb-4">
                  {phase.summary}
                </p>

                {/* Bullets grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {phase.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-1.5 text-xs text-stone-600">
                      <CheckSquare className="w-3.5 h-3.5 mt-0.5 text-stone-400 shrink-0" />
                      <span className="text-[10px] line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 cols: Team & Estimates */}
        <div className="xl:col-span-4 space-y-6">
          {/* Estimated Team */}
          <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider mb-4 pb-2 border-b border-stone-150 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-700" />
              Optimal Engineering Agile Team
            </h3>

            <div className="space-y-3.5">
              {agileTeam.map((member, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <span className="font-extrabold text-stone-850 block">{member.role}</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">{member.focus}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics estimation */}
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 shadow-xs space-y-4">
            <h3 className="font-black text-xs text-stone-900 uppercase tracking-wider border-b border-amber-100/60 pb-2">
              Project Estimates
            </h3>

            <div className="space-y-4 text-xs font-semibold text-stone-700">
              <div className="flex justify-between">
                <span>Total Roadmap Duration</span>
                <span className="font-bold text-stone-900">20 Weeks</span>
              </div>
              <div className="flex justify-between">
                <span>Sprint Interval cycle</span>
                <span className="font-bold text-stone-900">2 Weeks (Agile scrum)</span>
              </div>
              <div className="flex justify-between">
                <span>Primary SQL Engine</span>
                <span className="font-bold text-stone-900">PostgreSQL (Relational core)</span>
              </div>
              <div className="flex justify-between">
                <span>Caching & Lock leases</span>
                <span className="font-bold text-stone-900">Redis cluster Nodes</span>
              </div>
            </div>

            <div className="text-[9px] text-stone-400 italic">
              *ROADMAP estimates based on clean, decoupled system structures, matching physical restaurant kitchen POS inputs.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
