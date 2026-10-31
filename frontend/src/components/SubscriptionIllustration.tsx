import React from 'react'
import { TrendingUp, RefreshCw, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react'

export const SubscriptionIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none py-4">
      {/* Ambient background glows */}
      <div
        className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-[#4965F5]/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-8 -right-8 w-80 h-80 rounded-full bg-[#38BDF8]/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative SVG Geometric Loop & Cycle Tracks */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#141D30]/75 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-between">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        {/* Top Header of the SaaS Graphic: Status bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
              Subscription Engine
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4965F5]/20 border border-[#4965F5]/30 text-[11px] font-medium text-blue-200">
            <RefreshCw className="w-3 h-3 text-[#38BDF8] animate-spin" style={{ animationDuration: '6s' }} />
            <span>Real-time billing</span>
          </div>
        </div>

        {/* Central Graphic: Connected subscription cycle loop with central metrics */}
        <div className="relative z-10 my-auto py-2">
          {/* Main Loop Flow SVG Diagram */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 460 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto max-h-[170px]"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="orbitGrad" x1="20" y1="20" x2="440" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#4965F5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4965F5" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>

              {/* Recurring Loop Pathway */}
              <path
                d="M100 85 C40 85, 30 25, 100 25 C170 25, 290 145, 360 145 C430 145, 420 85, 360 85 C290 85, 170 85, 100 85 Z"
                stroke="url(#orbitGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="opacity-60"
              />

              <path
                d="M100 85 C30 85, 40 145, 100 145 C170 145, 290 25, 360 25 C420 25, 430 85, 360 85"
                stroke="url(#lineGlow)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Cycle nodes with pulses */}
              <circle cx="100" cy="25" r="5" fill="#38BDF8" />
              <circle cx="230" cy="85" r="6" fill="#4965F5" />
              <circle cx="360" cy="25" r="5" fill="#38BDF8" />
              <circle cx="100" cy="145" r="5" fill="#4965F5" />
              <circle cx="360" cy="145" r="5" fill="#38BDF8" />
            </svg>

            {/* Center Floating Glass Metric: MRR */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#101828]/90 border border-white/15 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Monthly Recurring Revenue</span>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-xl font-bold text-white tracking-tight">$128,450</span>
                <span className="flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +24.8%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Connected Nodes Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          {/* Node 1: Active Subscriptions */}
          <div className="bg-[#1A263E]/60 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Active Subscriptions</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-white">4,820</span>
                <span className="text-[10px] text-cyan-400 font-medium">+18 today</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-[#4965F5]/20 flex items-center justify-center text-[#38BDF8]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Node 2: Payment Success */}
          <div className="bg-[#1A263E]/60 border border-white/10 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Billing Success Rate</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-emerald-400">99.4%</span>
                <span className="text-[10px] text-slate-400">automated</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Pill Badges around illustration for dynamic depth */}
      <div className="hidden sm:flex items-center gap-2 absolute -top-3 -right-2 bg-[#1E2C48] border border-white/15 px-3 py-1.5 rounded-full shadow-lg text-xs text-slate-200">
        <span className="w-2 h-2 rounded-full bg-[#4965F5]" />
        <span>Continuous Revenue Flow</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-[#38BDF8]" />
      </div>

      <div className="hidden sm:flex items-center gap-2 absolute -bottom-3 -left-2 bg-[#1E2C48] border border-white/15 px-3 py-1.5 rounded-full shadow-lg text-xs text-slate-200">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Enterprise Smart Dunning Active</span>
      </div>
    </div>
  )
}

