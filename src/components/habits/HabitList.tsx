import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  ChevronDown,
  LayoutGrid,
  Heart,
  Droplet,
  Code,
  Activity,
  BookOpen,
  Coffee,
  Zap,
  Check,
  Trash2,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDate, addDaysToDate } from '../../utils/storage';

export const HabitList: React.FC = () => {
  const { habits, addHabit, toggleHabitCheckIn, deleteHabit } = useApp();

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Droplet');
  const [targetDays, setTargetDays] = useState(7);

  const todayIso = getTodayDate();
  const dateObjToday = new Date(todayIso);

  // Generate 7-day strip (e.g., Thu 16, Fri 17, Sat 18, Sun 19, Mon 20, Tue 21, Wed 22)
  const daysStrip: { dateIso: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const iso = addDaysToDate(todayIso, -i);
    const d = new Date(iso);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    daysStrip.push({
      dateIso: iso,
      dayName,
      dayNum,
      isToday: iso === todayIso,
    });
  }

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit(name.trim(), color, icon, targetDays);
    setName('');
    setIsAddingHabit(false);
  };

  const getIconElement = (iconName: string) => {
    switch (iconName) {
      case 'Droplet':
        return <Droplet className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Code':
        return <Code className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181b] overflow-hidden select-none text-slate-200 relative">
      
      {/* 1. Top Header Toolbar */}
      <div className="h-12 border-b border-[#242428] px-6 flex items-center justify-between shrink-0">
        <button className="flex items-center gap-1.5 text-base font-bold text-white hover:text-slate-300 transition-colors cursor-pointer">
          <span>Habit</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-3 text-slate-400">
          <button className="p-1 rounded hover:text-white hover:bg-[#242428] transition-colors cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="p-1 rounded hover:text-white hover:bg-[#242428] transition-colors cursor-pointer"
            title="Create New Habit"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button className="p-1 rounded hover:text-white hover:bg-[#242428] transition-colors cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Weekly Date Tracker Strip (Matches Screenshot 100%) */}
      <div className="px-6 py-3 border-b border-[#242428] bg-[#161618] flex items-center justify-center gap-8 shrink-0">
        {daysStrip.map((d) => (
          <div key={d.dateIso} className="flex flex-col items-center gap-1">
            <span
              className={`text-[11px] font-semibold ${
                d.isToday ? 'text-blue-500 font-bold' : 'text-slate-400'
              }`}
            >
              {d.dayName}
            </span>
            <span
              className={`text-xs font-bold ${
                d.isToday ? 'text-blue-500' : 'text-slate-200'
              }`}
            >
              {d.dayNum}
            </span>
            <div className="w-5 h-5 rounded-full border border-[#2d2d32] bg-[#202024] flex items-center justify-center text-slate-600 text-[10px]">
              ⊘
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Workspace / Empty Graphic Illustration */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center text-center max-w-sm space-y-4">
            {/* Alarm Clock & Badge Graphic Illustration */}
            <div className="w-36 h-28 rounded-3xl bg-[#242428] border border-[#2e2e34] flex items-center justify-center relative shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 text-xs font-bold">
                  😊
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-xl shadow-lg">
                  ⏰
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white m-0">
                Develop a habit
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Every little bit counts
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: habit.color }}
                  >
                    {getIconElement(habit.icon)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white m-0">
                      {habit.name}
                    </h4>
                    <span className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {habit.currentStreak} day streak
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {daysStrip.map((d) => {
                    const isChecked = habit.completedDates.includes(d.dateIso);
                    return (
                      <button
                        key={d.dateIso}
                        onClick={() => toggleHabitCheckIn(habit.id, d.dateIso)}
                        className={`w-7 h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-500 text-white font-bold shadow-md'
                            : 'bg-[#18181b] border border-[#2d2d32] text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '•'}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add Habit Modal */}
      {isAddingHabit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#242428] rounded-3xl p-6 border border-[#383840] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-white m-0">
              Create New Habit
            </h3>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Jog, Drink Water..."
                  autoFocus
                  className="w-full text-xs bg-[#161618] text-white px-3 py-2 rounded-xl border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Icon
                </label>
                <div className="flex items-center gap-2">
                  {['Droplet', 'Heart', 'Code', 'Activity', 'BookOpen', 'Coffee'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl border text-slate-300 transition-all ${
                        icon === ic
                          ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                          : 'border-[#303036] bg-[#18181b]'
                      }`}
                    >
                      {getIconElement(ic)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-blue-400' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
