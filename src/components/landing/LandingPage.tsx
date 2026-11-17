import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  Calendar,
  Layers,
  Timer,
  Heart,
  Grid2X2,
  Clock,
  ArrowRight,
  Download,
  ShieldCheck,
  Zap,
  Repeat,
  Filter,
  Keyboard,
  Users,
  Share2,
  Smartphone,
  Laptop,
  CheckCircle2,
  Flame,
  Star,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setViewMode } = useApp();
  const [activeTab, setActiveTab] = useState<'calendar' | 'kanban' | 'matrix' | 'pomodoro' | 'habits'>('kanban');

  return (
    <div className="min-h-screen w-full bg-[#080d1a] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#080d1a]/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('landing')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <CheckSquare className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">TickTick</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Official Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#preview" className="hover:text-blue-400 transition-colors">Interactive View</a>
            <a href="#download" className="hover:text-blue-400 transition-colors">Download</a>
            <a href="#suite" className="hover:text-blue-400 transition-colors">Premium</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('kanban')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            >
              <span>Launch Web App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background Radial Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Over 10 Million Productive Users Worldwide</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Stay Organized, <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Stay Creative.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join millions of people to capture ideas, organize life, track habits, and achieve focus in an all-in-one productivity suite.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setViewMode('kanban')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <span>Get Started For Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Multi-Device Apps</span>
            </button>
          </div>

          {/* Hero App Mockup Display */}
          <div className="pt-12 relative max-w-4xl mx-auto">
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-2xl shadow-blue-900/20 backdrop-blur-2xl ring-1 ring-white/10 group cursor-pointer" onClick={() => setViewMode('kanban')}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-500 font-mono ml-2">https://ticktick.com/webapp/#q/all/kanban</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-blue-400" />
                  <span>Click to Launch Live Demo</span>
                </div>
              </div>

              {/* Mockup Preview Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-left">
                {/* Column 1 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>📋 To Do</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-400">3</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border-l-4 border-red-500 border border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-200">Design System Redesign</div>
                    <div className="text-[10px] text-red-400 flex items-center gap-1">📅 Today • High Priority</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border-l-4 border-amber-500 border border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-200">Prepare Q3 Product Roadmap</div>
                    <div className="text-[10px] text-amber-400">📅 Tomorrow</div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>⚡ In Progress</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">2</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border-l-4 border-blue-500 border border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-200">Kanban Board Drag & Drop</div>
                    <div className="text-[10px] text-blue-400 flex items-center gap-1">⏱️ 3 Pomodoros Finished</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border-l-4 border-blue-500 border border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-200">Habit Check-In Integration</div>
                    <div className="text-[10px] text-emerald-400">❤️ 7 Day Streak</div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>🔍 In Review</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">1</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border-l-4 border-purple-500 border border-slate-700/60 space-y-1">
                    <div className="text-xs font-bold text-slate-200">Karma Analytics API</div>
                    <div className="text-[10px] text-purple-400">🔥 1,250 Karma Pts</div>
                  </div>
                </div>

                {/* Column 4 */}
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>✅ Completed</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">12</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/50 border-l-4 border-emerald-500 border border-slate-700/40 opacity-70">
                    <div className="text-xs font-bold line-through text-slate-400">Vite Build Optimization</div>
                    <div className="text-[10px] text-emerald-400">Done Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Showcase Section */}
      <section id="features" className="py-24 px-6 border-t border-slate-800/80 bg-slate-900/40 relative">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Organize Everything in Your Life
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Whether it's work projects, personal tasks, or study plans, TickTick gives you total control.
            </p>
          </div>

          {/* Feature 1: To-Do List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">To-Do List & Smart Views</span>
              <h3 className="text-2xl font-bold text-white">Capture tasks instantly anywhere</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart organization with Inbox, Today, Next 7 Days, and custom list folders. Natural language date parsing automatically recognizes deadlines as you type.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subtask checklists with real-time completion progress</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>4-Level priority tagging with colored indicators</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Custom list folders & hashtag tag organization</span>
                </li>
              </ul>
            </div>
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-xl space-y-3 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-700/60 pb-3">
                <span>⚡ Smart Inbox Overview</span>
                <span className="text-emerald-400">98% Completed Today</span>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly className="accent-emerald-500 w-4 h-4" />
                    <span className="line-through text-slate-400">Review quarterly marketing strategy</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold">Inbox</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="accent-blue-500 w-4 h-4" />
                    <span className="text-white font-bold">Publish new blog release notes</span>
                  </div>
                  <span className="text-[10px] text-red-400 font-bold">High Priority</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Kanban Board View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-xl space-y-3 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-700/60 pb-3">
                <span>📊 Multi-Group Kanban Workflow</span>
                <span className="text-purple-400">Drag & Drop Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-blue-400">To Do (2)</div>
                  <div className="p-2 rounded bg-slate-800 border-l-2 border-amber-500 text-[10px] font-bold text-slate-200">
                    UI Visual Polish
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400">In Progress (1)</div>
                  <div className="p-2 rounded bg-slate-800 border-l-2 border-red-500 text-[10px] font-bold text-slate-200">
                    Release v2.5 Update
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Kanban Workflow Board</span>
              <h3 className="text-2xl font-bold text-white">Visualize your project pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Group tasks by Status, Priority, List, or Date. Drag and drop cards seamlessly between custom workflow columns to maintain absolute momentum.
              </p>
              <button
                onClick={() => setViewMode('kanban')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all inline-flex items-center gap-2"
              >
                <span>Try Kanban Board Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Feature 3: Pomodoro Focus Timer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Timer className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pomodoro & Ambient Audio</span>
              <h3 className="text-2xl font-bold text-white">Stay focused with time blocking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Adopt the 25-minute Pomodoro Technique with integrated background ambient sounds (Rain, Waves, Forest, White Noise) to stay in deep flow state.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/60 shadow-xl space-y-4 text-center">
              <div className="text-4xl font-black text-amber-400 font-mono tracking-widest">25 : 00</div>
              <div className="text-xs text-slate-400 font-semibold">Focus Session • Deep Work Mode</div>
              <div className="flex items-center justify-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300">🌧️ Rain Sound</span>
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300">🌊 Ocean Waves</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive View Preview Tabs */}
      <section id="preview" className="py-20 px-6 border-t border-slate-800/80 bg-[#060a14] relative">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Powerful & Intuitive Views</h2>
            <p className="text-slate-400 text-sm">Switch views instantly to suit your productivity style</p>
          </div>

          {/* Tab Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {(['kanban', 'calendar', 'matrix', 'pomodoro', 'habits'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Interactive Preview Container */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-left max-w-4xl mx-auto min-h-[300px] flex flex-col justify-center">
            {activeTab === 'kanban' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-400" /> Dynamic Kanban Board
                  </h4>
                  <button onClick={() => setViewMode('kanban')} className="text-xs text-blue-400 hover:underline font-bold">Open Full View →</button>
                </div>
                <p className="text-xs text-slate-400">Organize workflows by status, priority, custom lists, or due dates with real-time drag-and-drop feedback.</p>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Multi-View Calendar
                  </h4>
                  <button onClick={() => setViewMode('calendar')} className="text-xs text-emerald-400 hover:underline font-bold">Open Calendar →</button>
                </div>
                <p className="text-xs text-slate-400">Schedule your month, week, or day with visual time-blocking and deadline tracking.</p>
              </div>
            )}

            {activeTab === 'matrix' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Grid2X2 className="w-5 h-5 text-indigo-400" /> Eisenhower Matrix
                  </h4>
                  <button onClick={() => setViewMode('eisenhower')} className="text-xs text-indigo-400 hover:underline font-bold">Open Matrix →</button>
                </div>
                <p className="text-xs text-slate-400">Categorize tasks into Urgent & Important (Q1), Important/Not Urgent (Q2), Urgent/Not Important (Q3), and Neither (Q4).</p>
              </div>
            )}

            {activeTab === 'pomodoro' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Timer className="w-5 h-5 text-amber-400" /> Pomodoro Timer
                  </h4>
                  <button onClick={() => setViewMode('focus')} className="text-xs text-amber-400 hover:underline font-bold">Open Focus Timer →</button>
                </div>
                <p className="text-xs text-slate-400">Synthesized audio chimes, ambient noise generator (Rain, Ocean, Forest), and focus logs.</p>
              </div>
            )}

            {activeTab === 'habits' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" /> Habit Tracker
                  </h4>
                  <button onClick={() => setViewMode('habits')} className="text-xs text-rose-400 hover:underline font-bold">Open Habit Tracker →</button>
                </div>
                <p className="text-xs text-slate-400">Track daily habits, streak achievements, and build long-term consistency effortless.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Comprehensive Feature Suite Grid */}
      <section id="suite" className="py-24 px-6 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white">A Comprehensive Suite of Features</h2>
            <p className="text-slate-400 text-sm">Everything you need to stay organized in one unified platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Recurring Rules</h4>
              <p className="text-xs text-slate-400">Flexible repeat rules (daily, weekly, monthly) so you never miss recurring commitments.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Smart Filters</h4>
              <p className="text-xs text-slate-400">Filter tasks by priority, tags, due dates, and completion status instantly.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="text-base font-bold text-white">Karma Analytics</h4>
              <p className="text-xs text-slate-400">Earn Karma score points, unlock achievements, and level up your productivity status.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Data Backup & Sync</h4>
              <p className="text-xs text-slate-400">Export and import complete JSON backups anytime to guarantee data safety.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Keyboard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Keyboard Shortcuts</h4>
              <p className="text-xs text-slate-400">Add tasks quickly with Enter, trigger search, and navigate views with high efficiency.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Custom Lists & Tags</h4>
              <p className="text-xs text-slate-400">Create custom colored lists and hashtag tags to organize complex life goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="py-20 px-6 relative overflow-hidden bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-t border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-4xl font-extrabold text-white">Ready to Master Your Productivity?</h2>
          <p className="text-slate-300 text-base max-w-lg mx-auto">
            Experience the full-featured TickTick Web App clone right now. No setup required!
          </p>
          <button
            onClick={() => setViewMode('kanban')}
            className="px-8 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
          >
            <span>Launch Web App Now</span>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </section>

      {/* 7. Footer */}
      <footer id="download" className="py-12 px-6 border-t border-slate-800/80 bg-[#050812] text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              ✓
            </div>
            <span className="font-bold text-white text-sm">TickTick Clone</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('kanban')} className="hover:text-white transition-colors">Kanban Board</button>
            <button onClick={() => setViewMode('calendar')} className="hover:text-white transition-colors">Calendar</button>
            <button onClick={() => setViewMode('focus')} className="hover:text-white transition-colors">Focus Timer</button>
            <button onClick={() => setViewMode('habits')} className="hover:text-white transition-colors">Habits</button>
            <button onClick={() => setViewMode('analytics')} className="hover:text-white transition-colors font-bold text-blue-400">Karma Stats</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
