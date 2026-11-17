import React, { useState } from 'react';
import { Search, X, CheckCircle2, Circle, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { tasks, searchQuery, setSearchQuery, setSelectedTaskId, toggleTaskComplete, customLists } = useApp();

  const [activeFilterTab, setActiveFilterTab] = useState<'task' | 'list'>('task');

  if (!isOpen) return null;

  const matchedTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const matchedLists = customLists.filter((l) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return l.name.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop click listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Floating Dark Modal Container (Matches Screenshot 100%) */}
      <div className="relative z-50 w-full max-w-lg bg-[#1f1f23] border border-[#2e2e36] rounded-2xl shadow-2xl p-5 text-slate-200 animate-in fade-in zoom-in-95 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerated space-y-4">
        
        {/* Top Search Input Bar */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#2d2d34]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            autoFocus
            className="flex-1 text-xs bg-transparent text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills - Character Size Fit */}
        <div className="inline-flex items-center gap-1.5 w-fit">
          <button
            onClick={() => setActiveFilterTab('task')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center ${
              activeFilterTab === 'task'
                ? 'bg-[#35353d] text-white shadow-sm border border-[#404048]'
                : 'text-slate-400 hover:text-slate-200 bg-[#17171a]'
            }`}
          >
            Task
          </button>
          <button
            onClick={() => setActiveFilterTab('list')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center ${
              activeFilterTab === 'list'
                ? 'bg-[#35353d] text-white shadow-sm border border-[#404048]'
                : 'text-slate-400 hover:text-slate-200 bg-[#17171a]'
            }`}
          >
            List
          </button>
        </div>

        {/* Search Content / Results / Binoculars Illustration */}
        {!searchQuery.trim() ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            {/* Binoculars Graphic Illustration */}
            <div className="w-32 h-24 rounded-3xl bg-[#161618] border border-[#2a2a30] flex items-center justify-center relative shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-lg shadow-md">
                  🔭
                </div>
                <div className="text-blue-400 text-xs font-bold">
                  ✦
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Enter keywords to search
            </span>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1 pt-1">
            {activeFilterTab === 'task' ? (
              matchedTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  No matching tasks found.
                </div>
              ) : (
                matchedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-[#17171a] border border-[#26262c] hover:border-[#383840] flex items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(task.id);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-white truncate">
                        {task.title}
                      </span>
                    </div>

                    {task.dueDate && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                ))
              )
            ) : (
              matchedLists.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  No matching lists found.
                </div>
              ) : (
                matchedLists.map((list) => (
                  <div
                    key={list.id}
                    className="p-3 rounded-xl bg-[#17171a] border border-[#26262c] flex items-center gap-3"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="text-xs font-bold text-white">{list.name}</span>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
