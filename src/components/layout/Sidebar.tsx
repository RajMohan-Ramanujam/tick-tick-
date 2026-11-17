import React from 'react';
import {
  CheckSquare,
  Trash2,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDate, addDaysToDate } from '../../utils/storage';

// Ditto Custom SVG Icons matching TickTick Sidebar Icons
const AllTrayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8z" />
    <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);

const TodayCalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="4" />
    <path d="M16 2v4M8 2v4M3 9.5h18" />
    <text x="12" y="18" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="currentColor" stroke="none">22</text>
  </svg>
);

const YesterdayCalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="4" />
    <path d="M16 2v4M8 2v4M3 9.5h18" />
    <path d="M13 14l-3-2 3-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Sidebar: React.FC = () => {
  const {
    tasks,
    smartView,
    setSmartView,
    activeListId,
    setActiveListId,
    viewMode,
    setViewMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    allTasksTitle,
  } = useApp();

  const todayStr = getTodayDate();
  const yesterdayStr = addDaysToDate(todayStr, -1);

  const activeTasks = tasks.filter((t) => !t.deleted && !t.completed);

  const isOldTask = (t: (typeof tasks)[0]) => {
    if (t.deleted) return false;
    if (t.dueDate) return t.dueDate < yesterdayStr;
    if (t.createdAt) return t.createdAt.split('T')[0] < yesterdayStr;
    return false;
  };

  const counts = {
    all: tasks.filter((t) => !t.deleted).length,
    today: activeTasks.filter((t) => t.dueDate === todayStr).length,
    yesterday: activeTasks.filter((t) => t.dueDate === yesterdayStr).length,
    old_tasks: activeTasks.filter((t) => isOldTask(t)).length,
    completed: tasks.filter((t) => !t.deleted && t.completed).length,
    trash: tasks.filter((t) => t.deleted).length,
  };

  const handleNavClick = (targetView: typeof smartView) => {
    setSmartView(targetView);
    setActiveListId(null);
    if (targetView === 'completed' || targetView === 'trash') {
      setViewMode('list');
    } else {
      setViewMode('kanban');
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {!isSidebarCollapsed && (
        <div
          onClick={() => setIsSidebarCollapsed(true)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`bg-[#161618] border-r border-[#222226] h-full flex flex-col justify-between select-none z-30 shrink-0 text-slate-300 transition-all duration-200 ease-in-out ${
          isSidebarCollapsed
            ? 'w-0 opacity-0 overflow-hidden border-none pointer-events-none p-0'
            : 'fixed inset-y-0 left-0 z-40 w-64 md:relative md:inset-auto md:w-56 opacity-100 shadow-2xl'
        }`}
      >
      <div className="p-3 overflow-y-auto flex-1 space-y-3">
        {/* Primary Views: All, Today, Yesterday */}
        <div className="space-y-1">
          {/* All */}
          <button
            onClick={() => handleNavClick(null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === null && !activeListId
                ? 'bg-[#28282c] text-white font-bold'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-slate-400 shrink-0">
                <AllTrayIcon />
              </span>
              <span className="truncate">{allTasksTitle || 'All'}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{counts.all}</span>
          </button>

          {/* Today */}
          <button
            onClick={() => handleNavClick('today')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === 'today' && !activeListId
                ? 'bg-[#28282c] text-white font-bold'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400">
                <TodayCalIcon />
              </span>
              <span>Today</span>
            </div>
            {counts.today > 0 && (
              <span className="text-[11px] text-slate-400 font-bold">{counts.today}</span>
            )}
          </button>

          {/* Yesterday */}
          <button
            onClick={() => handleNavClick('yesterday')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === 'yesterday' && !activeListId
                ? 'bg-[#28282c] text-white font-bold'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400">
                <YesterdayCalIcon />
              </span>
              <span>Yesterday</span>
            </div>
            {counts.yesterday > 0 && (
              <span className="text-[11px] text-slate-400 font-bold">{counts.yesterday}</span>
            )}
          </button>

          {/* Old Tasks */}
          <button
            onClick={() => handleNavClick('old_tasks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === 'old_tasks' && !activeListId
                ? 'bg-[#28282c] text-white font-bold'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400">
                <History className="w-4 h-4 stroke-[1.8]" />
              </span>
              <span>Old Tasks</span>
            </div>
            {counts.old_tasks > 0 && (
              <span className="text-[11px] text-slate-400 font-bold">{counts.old_tasks}</span>
            )}
          </button>
        </div>

        {/* Divider Line */}
        <div className="border-t border-[#222226]" />

        {/* Secondary Views: Completed, Trash */}
        <div className="space-y-1">
          {/* Completed */}
          <button
            onClick={() => handleNavClick('completed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === 'completed'
                ? 'bg-[#28282c] text-white font-bold shadow-sm'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-400 stroke-[1.8]" />
              <span>Completed</span>
            </div>
            {counts.completed > 0 && (
              <span className="text-[11px] text-slate-400 font-bold">
                {counts.completed}
              </span>
            )}
          </button>

          {/* Trash (Automatically deletes after 30 days) */}
          <button
            onClick={() => handleNavClick('trash')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              smartView === 'trash'
                ? 'bg-[#28282c] text-white font-bold shadow-sm'
                : 'text-slate-300 hover:bg-[#202024] hover:text-white'
            }`}
            title="Trash (Items automatically deleted after 30 days)"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-slate-400 stroke-[1.8]" />
              <span>Trash</span>
            </div>
            {counts.trash > 0 && (
              <span className="text-[11px] text-slate-400 font-bold">
                {counts.trash}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};
