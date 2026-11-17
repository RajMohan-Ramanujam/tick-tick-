import React, { useState, useRef, useEffect } from 'react';
import { Menu, Edit2, Check, X, Smile, Table, RefreshCw, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenSearch?: () => void;
}

const emojiPalette = [
  '📋', '👋', '🎯', '🚀', '🔥', '⭐', '💡', '📌', '💼', '🏠',
  '🏋️', '📝', '🎉', '✨', '⚡', '✅', '🗓️', '📂', '❤️', '🌟'
];

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const {
    viewMode,
    activeListId,
    customLists,
    updateCustomList,
    toggleSidebar,
    smartView,
    allTasksTitle,
    setAllTasksTitle,
    allTasksIcon,
    setAllTasksIcon,
    smartViewCustomTitles,
    updateSmartViewTitle,
    sheetsSyncUrl,
    isSheetsSyncing,
    setIsSheetsModalOpen,
    triggerSheetsSync,
    activeTheme,
    setTheme,
  } = useApp();

  const smartViewLabels: Record<string, { name: string; icon: string }> = {
    today: { name: 'Today', icon: '📅' },
    yesterday: { name: 'Yesterday', icon: '⏪' },
    old_tasks: { name: 'Old Tasks', icon: '🕰️' },
    inbox: { name: 'Inbox', icon: '📥' },
    next7: { name: 'Next 7 Days', icon: '🗓️' },
    high_priority: { name: 'High Priority', icon: '🔴' },
    completed: { name: 'Completed', icon: '✅' },
    trash: { name: 'Trash', icon: '🗑️' },
  };

  let displayName = 'All Tasks';
  let displayIcon = '📋';

  if (viewMode === 'calendar') {
    displayName = smartView && smartViewLabels[smartView] ? `Calendar (${smartViewLabels[smartView].name})` : 'Calendar';
    displayIcon = '🗓️';
  } else if (activeListId) {
    const currentList = customLists.find((l) => l.id === activeListId);
    displayName = currentList?.name || 'Welcome';
    displayIcon = currentList?.icon || '👋';
  } else if (smartView && smartViewLabels[smartView]) {
    displayName = smartViewCustomTitles?.[smartView] || smartViewLabels[smartView].name;
    displayIcon = smartViewLabels[smartView].icon;
  } else {
    displayName = allTasksTitle || 'All Tasks';
    displayIcon = allTasksIcon || '📋';
  }

  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(displayName);
  const [tempIcon, setTempIcon] = useState(displayIcon);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync state if displayName changes from outside
  useEffect(() => {
    if (!isEditing) {
      setTempTitle(displayName);
      setTempIcon(displayIcon);
    }
  }, [displayName, displayIcon, isEditing]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const startEditing = () => {
    setTempTitle(displayName);
    setTempIcon(displayIcon);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTempTitle(displayName);
    setTempIcon(displayIcon);
    setIsEditing(false);
    setShowEmojiPicker(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = tempTitle.trim() || displayName;

    if (activeListId) {
      updateCustomList(activeListId, { name: finalTitle, icon: tempIcon });
    } else if (smartView) {
      updateSmartViewTitle(smartView, finalTitle);
    } else {
      setAllTasksTitle(finalTitle);
      setAllTasksIcon(tempIcon);
    }

    setIsEditing(false);
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setTempIcon(emoji);
    if (!isEditing) {
      // Immediate update when not in full rename edit mode
      if (activeListId) {
        updateCustomList(activeListId, { icon: emoji });
      } else if (!smartView) {
        setAllTasksIcon(emoji);
      }
    }
    setShowEmojiPicker(false);
  };

  return (
    <header className="h-12 border-b border-[#222226] bg-[#161618] px-4 flex items-center justify-between z-20 shrink-0 select-none text-slate-200">
      {/* Left Title & Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleSidebar()}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
          title="Toggle Navigation Menu (Collapse/Expand)"
        >
          <Menu className="w-4 h-4 stroke-[2]" />
        </button>

        {isEditing ? (
          /* Inline Rename Form */
          <form
            onSubmit={handleSave}
            className="flex items-center gap-2 relative animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Emoji Selector Trigger */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-7 h-7 rounded-lg bg-[#222226] hover:bg-[#2c2c34] flex items-center justify-center text-sm transition-all cursor-pointer shrink-0 border border-[#34343c]"
              title="Change icon"
            >
              <span>{tempIcon}</span>
            </button>

            {/* Title Input */}
            <input
              ref={inputRef}
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEditing();
              }}
              placeholder="Name..."
              className="text-sm font-extrabold text-white bg-[#121215] border border-blue-500/80 px-2.5 py-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-44 sm:w-60 shadow-inner"
            />

            {/* Action Buttons */}
            <button
              type="submit"
              className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm"
              title="Save Rename (Enter)"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#26262a] transition-colors cursor-pointer"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Emoji Dropdown */}
            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute top-9 left-0 z-50 p-2 bg-[#202026] border border-[#34343e] rounded-2xl shadow-2xl grid grid-cols-5 gap-1.5 animate-in zoom-in-95 duration-100"
              >
                {emojiPalette.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className="w-7 h-7 rounded-lg hover:bg-[#2c2c36] flex items-center justify-center text-sm transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </form>
        ) : (
          /* Normal Display with Hover Rename Trigger */
          <div className="flex items-center gap-1.5 relative group/header-title">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-base p-1 rounded-lg hover:bg-[#222226] transition-colors cursor-pointer shrink-0"
              title="Click to change emoji"
            >
              <span>{displayIcon}</span>
            </button>

            <div
              onClick={startEditing}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-[#222226] cursor-pointer transition-colors group/rename"
              title="Click to rename"
            >
              <h2 className="text-sm font-extrabold text-white tracking-tight m-0 select-text">
                {displayName}
              </h2>

              <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover/rename:opacity-100 group-hover/rename:text-blue-400 transition-all shrink-0" />
            </div>

            {/* Emoji Dropdown in Normal Mode */}
            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute top-10 left-0 z-50 p-2 bg-[#202026] border border-[#34343e] rounded-2xl shadow-2xl grid grid-cols-5 gap-1.5 animate-in zoom-in-95 duration-100"
              >
                {emojiPalette.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className="w-7 h-7 rounded-lg hover:bg-[#2c2c36] flex items-center justify-center text-sm transition-transform hover:scale-125 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side: Dark/Light Mode Toggle & Google Sheets Cloud Sync Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dark Mode / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={() =>
            setTheme(activeTheme === 'ticktick-light' ? 'ticktick-dark' : 'ticktick-light')
          }
          className="p-1.5 rounded-xl border border-[#2c2c36] bg-[#18181c] hover:bg-[#222228] text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
          title={activeTheme === 'ticktick-light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {activeTheme === 'ticktick-light' ? (
            <Moon className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          )}
        </button>

        {/* Google Sheets Sync Pill */}
        <button
          type="button"
          onClick={() => setIsSheetsModalOpen(true)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm ${
            sheetsSyncUrl
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 hover:border-emerald-500/60'
              : 'bg-[#18181c] border-[#2c2c36] text-slate-300 hover:text-white hover:bg-[#222228]'
          }`}
          title={
            sheetsSyncUrl
              ? 'Google Sheets Sync Active (Click to view details)'
              : 'Connect to Google Sheets for Mobile & Multi-Device Sync'
          }
        >
          <Table className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden sm:inline">
            {sheetsSyncUrl ? 'Sheets Synced' : 'Sync Google Sheet'}
          </span>
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              sheetsSyncUrl ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
            }`}
          />
        </button>

        {sheetsSyncUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerSheetsSync();
            }}
            disabled={isSheetsSyncing}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#222228] transition-colors cursor-pointer disabled:opacity-50"
            title="Sync with Google Sheet now"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSheetsSyncing ? 'animate-spin text-blue-400' : ''}`}
            />
          </button>
        )}
      </div>
    </header>
  );
};
