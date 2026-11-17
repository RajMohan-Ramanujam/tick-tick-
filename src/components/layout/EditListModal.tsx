import React, { useState } from 'react';
import {
  AlignLeft,
  Columns,
  Kanban,
  GitCommit,
  Crown,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomList } from '../../types';

interface EditListModalProps {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  { hex: '#64748b', isNone: true },
  { hex: '#ef4444' },
  { hex: '#f97316' },
  { hex: '#f59e0b' },
  { hex: '#eab308' },
  { hex: '#10b981' },
  { hex: '#06b6d4' },
  { hex: '#3b82f6' },
  { hex: '#8b5cf6' },
  { hex: 'gradient', isGradient: true },
];

const emojiOptions = ['👋', '🎯', '🚀', '🔥', '⭐', '💡', '📌', '💼', '🏠', '🏋️', '📝', '🎉'];

export const EditListModal: React.FC<EditListModalProps> = ({
  listId,
  isOpen,
  onClose,
}) => {
  const { customLists, reorderCustomLists, setViewMode } = useApp();

  const list = customLists.find((l) => l.id === listId) || {
    id: listId,
    name: 'Welcome',
    color: '#f59e0b',
    icon: '👋',
    defaultView: 'kanban',
    folder: 'None',
    type: 'task',
    showInSmartList: 'all',
  };

  const [name, setName] = useState(list.name);
  const [color, setColor] = useState(list.color || '#f59e0b');
  const [icon, setIcon] = useState(list.icon || '👋');
  const [defaultView, setDefaultView] = useState<'list' | 'kanban' | 'timeline'>(
    list.defaultView || 'kanban'
  );
  const [folder, setFolder] = useState(list.folder || 'None');
  const [type, setType] = useState<'task' | 'note'>(list.type || 'task');
  const [showInSmartList, setShowInSmartList] = useState<'all' | 'none' | 'today'>(
    list.showInSmartList || 'all'
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedList: CustomList = {
      ...list,
      name: name.trim() || 'Untitled List',
      color,
      icon,
      defaultView,
      folder,
      type,
      showInSmartList,
    };

    const exists = customLists.some((l) => l.id === listId);
    if (exists) {
      reorderCustomLists(
        customLists.map((l) => (l.id === listId ? updatedList : l))
      );
    } else {
      reorderCustomLists([...customLists, updatedList]);
    }

    // Switch view mode to list's default view
    setViewMode(defaultView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-[#1a1a1e] border border-[#2a2a32] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden text-slate-200 flex flex-col md:flex-row">
        {/* Left Column: Form Controls */}
        <div className="flex-1 p-6 md:p-7 space-y-5">
          <h2 className="text-lg font-bold text-white text-center tracking-tight m-0 mb-4">
            Edit List
          </h2>

          {/* 1. Title & Emoji Input */}
          <div className="relative">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-[#121215] border border-[#30303a] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 rounded-2xl transition-all">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-7 h-7 rounded-xl bg-[#24242c] hover:bg-[#2d2d36] flex items-center justify-center text-sm transition-colors cursor-pointer shrink-0"
                title="Choose Emoji Icon"
              >
                {icon}
              </button>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="List Title..."
                className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Emoji Selector Dropdown */}
            {showEmojiPicker && (
              <div className="absolute top-12 left-0 z-20 p-2 bg-[#222228] border border-[#34343e] rounded-2xl shadow-xl grid grid-cols-6 gap-1.5 animate-in zoom-in-95 duration-150">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      setIcon(e);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 rounded-xl hover:bg-[#2e2e38] flex items-center justify-center text-base transition-colors cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Color Palette Selector */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">Color</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {colorOptions.map((c, idx) => {
                const isSelected = color === c.hex;

                if (c.isNone) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-5 h-5 rounded-full border border-[#3a3a44] flex items-center justify-center relative cursor-pointer transition-transform ${
                        isSelected ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                      }`}
                    >
                      <div className="w-3.5 h-0.5 bg-red-400 rotate-45 rounded-full" />
                    </button>
                  );
                }

                if (c.isGradient) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setColor('gradient')}
                      className={`w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 cursor-pointer transition-transform ${
                        color === 'gradient' ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                      }`}
                    />
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                      isSelected ? 'scale-125 ring-2 ring-blue-500 shadow-md' : 'hover:scale-110'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 3. View Mode Switcher */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">View</span>
            <div className="flex items-center gap-2">
              {/* List View Option */}
              <button
                type="button"
                onClick={() => setDefaultView('list')}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  defaultView === 'list'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/30'
                    : 'bg-[#121215] border-[#2e2e36] text-slate-400 hover:text-white hover:bg-[#1a1a20]'
                }`}
                title="List View"
              >
                <AlignLeft className="w-4.5 h-4.5" />
              </button>

              {/* Kanban Board Option (Selected by Default in Screenshot) */}
              <button
                type="button"
                onClick={() => setDefaultView('kanban')}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  defaultView === 'kanban'
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/30'
                    : 'bg-[#121215] border-[#2e2e36] text-slate-400 hover:text-white hover:bg-[#1a1a20]'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="w-4.5 h-4.5" />
              </button>

              {/* Timeline Option with Crown Badge */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDefaultView('timeline')}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    defaultView === 'timeline'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/30'
                      : 'bg-[#121215] border-[#2e2e36] text-slate-400 hover:text-white hover:bg-[#1a1a20]'
                  }`}
                  title="Timeline / Gantt View"
                >
                  <GitCommit className="w-4.5 h-4.5" />
                </button>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center shadow-sm">
                  <Crown className="w-2.5 h-2.5 fill-slate-900 stroke-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Folder Dropdown */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">Folder</span>
            <div className="relative flex-1 max-w-[200px]">
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full appearance-none bg-[#121215] border border-[#2e2e36] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="None">None</option>
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Projects">Projects</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* 5. Type Dropdown */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">Type</span>
            <div className="relative flex-1 max-w-[200px]">
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'task' | 'note')}
                className="w-full appearance-none bg-[#121215] border border-[#2e2e36] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="task">Task List</option>
                <option value="note">Note List</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* 6. Show in Smart List Dropdown */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">Show in Smart List</span>
            <div className="relative flex-1 max-w-[200px]">
              <select
                value={showInSmartList}
                onChange={(e) => setShowInSmartList(e.target.value as any)}
                className="w-full appearance-none bg-[#121215] border border-[#2e2e36] text-xs font-medium text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All tasks</option>
                <option value="none">Do not show</option>
                <option value="today">Only today</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#222228] hover:bg-[#2a2a32] border border-[#34343e] text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Column: Live Mockup Preview Box (Matches User Screenshot 100%) */}
        <div className="w-full md:w-80 bg-[#121215] p-6 border-t md:border-t-0 md:border-l border-[#26262e] flex flex-col justify-center items-center select-none">
          <div className="w-full bg-[#18181c] border border-[#282830] rounded-2xl p-4 shadow-2xl space-y-4">
            {/* Header Preview */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#24242c]">
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-bold text-white truncate">{name || 'Welcome'}</span>
            </div>

            {/* Dynamic View Mockup */}
            {defaultView === 'kanban' && (
              <div className="grid grid-cols-3 gap-2 py-2">
                {[1, 2, 3].map((col) => (
                  <div key={col} className="bg-[#202024] rounded-lg p-2 space-y-1.5 border border-[#2a2a32]">
                    <div className="w-6 h-1.5 bg-slate-600 rounded-full" />
                    <div className="w-full h-8 bg-[#161619] rounded border border-[#2e2e36] p-1 space-y-1">
                      <div className="w-3 h-3 border border-blue-400 rounded-sm" />
                      <div className="w-10 h-1 bg-slate-500 rounded" />
                    </div>
                    <div className="w-full h-8 bg-[#161619] rounded border border-[#2e2e36] p-1 space-y-1">
                      <div className="w-3 h-3 border border-blue-400 rounded-sm" />
                      <div className="w-8 h-1 bg-slate-500 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {defaultView === 'list' && (
              <div className="space-y-2 py-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 bg-[#202024] rounded-lg border border-[#2a2a32]">
                    <div className="w-3.5 h-3.5 border border-blue-400 rounded-sm shrink-0" />
                    <div className="w-3/4 h-2 bg-slate-400 rounded" />
                  </div>
                ))}
              </div>
            )}

            {defaultView === 'timeline' && (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((bar) => (
                  <div key={bar} className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-slate-600 rounded" />
                    <div className="flex-1 h-4 bg-blue-500/20 border border-blue-500/40 rounded-lg p-1">
                      <div className="w-full h-full bg-blue-500 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
