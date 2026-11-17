import React, { useState } from 'react';
import { ChevronDown, Plus, MoreHorizontal, Hourglass } from 'lucide-react';

interface CountdownItem {
  id: string;
  icon: string;
  title: string;
  days: number;
  dateText: string;
}

export const CountdownView: React.FC = () => {
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([
    {
      id: 'c-1',
      icon: '⏳',
      title: 'Weekend',
      days: 3,
      dateText: 'Days until 25 Jul 2026',
    },
    {
      id: 'c-2',
      icon: '🏮',
      title: "New Year's Day",
      days: 163,
      dateText: 'Click the date to switch formats',
    },
    {
      id: 'c-3',
      icon: '🖥️',
      title: 'Use TickTick',
      days: 2,
      dateText: 'Days until 24 Jul 2026',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState('7');

  const handleAddCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCountdowns([
      ...countdowns,
      {
        id: `c-${Date.now()}`,
        icon: '📌',
        title: newTitle.trim(),
        days: parseInt(newDays) || 5,
        dateText: `Days remaining`,
      },
    ]);

    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] overflow-hidden select-none text-slate-200">
      
      {/* Top Header Toolbar */}
      <div className="h-12 border-b border-[#242428] px-6 flex items-center justify-between shrink-0">
        <button className="flex items-center gap-1.5 text-base font-bold text-white hover:text-slate-300 transition-colors cursor-pointer">
          <span>Countdown</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-3 text-slate-400">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 rounded hover:text-white hover:bg-[#242428] transition-colors cursor-pointer"
            title="Add Countdown Event"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button className="p-1 rounded hover:text-white hover:bg-[#242428] transition-colors cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Countdown Grid Workspace (Matches Screenshot 100%) */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
          {countdowns.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-[#1e1e22] border border-[#28282e] shadow-sm hover:border-[#383840] transition-all flex flex-col items-center justify-between text-center space-y-4"
            >
              {/* Card Title Header */}
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </div>

              {/* Giant Blue Number Digits */}
              <div className="text-6xl font-serif text-[#3b71fe] font-extrabold my-2 tracking-tight">
                {item.days}
              </div>

              {/* Subtitle / Date Info */}
              <div className="text-[11px] font-medium text-slate-500">
                {item.dateText}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Countdown Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#242428] rounded-3xl p-6 border border-[#383840] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-extrabold text-white m-0">Add Countdown</h3>
            <form onSubmit={handleAddCountdown} className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Event Title... (e.g. Birthday)"
                autoFocus
                className="w-full text-xs bg-[#161618] text-white px-3 py-2 rounded-xl border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
                placeholder="Days remaining..."
                className="w-full text-xs bg-[#161618] text-white px-3 py-2 rounded-xl border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
