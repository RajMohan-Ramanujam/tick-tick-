import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  Clock,
  Search,
  Grid2X2,
  User,
  Camera,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface IconDockProps {
  onOpenSearch?: () => void;
}

export const IconDock: React.FC<IconDockProps> = ({ onOpenSearch }) => {
  const {
    viewMode,
    setViewMode,
    setSmartView,
  } = useApp();

  // If user was previously in removed views, fallback safely to kanban
  useEffect(() => {
    if (viewMode === 'timeline' || viewMode === 'habits') {
      setViewMode('kanban');
    }
  }, [viewMode, setViewMode]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ticktick_user_profile_photo') || null;
    } catch {
      return null;
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setProfilePhoto(base64);
        try {
          localStorage.setItem('ticktick_user_profile_photo', base64);
        } catch (err) {
          console.error('Failed to save profile photo:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* 1. Desktop Left Vertical Dock (Hidden on Mobile) */}
      <aside className="hidden md:flex w-14 bg-[#111113] border-r border-[#202024] h-full flex-col justify-between items-center py-3 select-none z-30 shrink-0 text-slate-400">
        {/* Top Section: User Photo Upload & Primary Module Switches */}
        <div className="flex flex-col items-center gap-4 w-full">
          {/* User Photo Upload Button */}
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-8 h-8 rounded-xl overflow-hidden bg-[#24242c] hover:bg-[#2e2e38] border border-[#33333e] hover:border-blue-500/60 flex items-center justify-center transition-all cursor-pointer shadow-md group-hover:scale-105"
              title="Click to add / change photo"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          </div>

          {/* Vertical Separator */}
          <div className="w-6 h-[1px] bg-[#242428]" />

          {/* Module Switcher Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2">
            {/* 1. Tasks */}
            <button
              onClick={() => {
                setViewMode('kanban');
                setSmartView(null);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'kanban' || viewMode === 'list'
                  ? 'bg-[#28282c] text-white font-bold shadow-sm'
                  : 'hover:bg-[#1d1d21] hover:text-slate-200'
              }`}
              title="Tasks"
            >
              <CheckSquare className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 2. Calendar */}
            <button
              onClick={() => {
                setViewMode('calendar');
                setSmartView(null);
              }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#28282c] text-white font-bold shadow-sm'
                  : 'hover:bg-[#1d1d21] hover:text-slate-200'
              }`}
              title="Calendar"
            >
              <Calendar className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 3. Priority View */}
            <button
              onClick={() => setViewMode('eisenhower')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'eisenhower'
                  ? 'bg-[#28282c] text-white font-bold shadow-sm'
                  : 'hover:bg-[#1d1d21] hover:text-slate-200'
              }`}
              title="Priority View"
            >
              <Grid2X2 className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 4. Focus Timer */}
            <button
              onClick={() => setViewMode('focus')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'focus'
                  ? 'bg-[#28282c] text-white font-bold shadow-sm'
                  : 'hover:bg-[#1d1d21] hover:text-slate-200'
              }`}
              title="Focus Timer"
            >
              <Clock className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 5. Search */}
            <button
              onClick={() => onOpenSearch?.()}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#1d1d21] hover:text-slate-200 transition-all cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar (Visible only on Mobile screens < md) */}
      <nav className="flex md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#141418] border-t border-[#24242c] z-40 items-center justify-around px-2 text-slate-400 select-none shadow-2xl backdrop-blur-lg">
        {/* 1. Tasks */}
        <button
          onClick={() => {
            setViewMode('kanban');
            setSmartView(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            viewMode === 'kanban' || viewMode === 'list'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 stroke-[2]" />
          <span className="text-[10px] mt-0.5">Tasks</span>
        </button>

        {/* 2. Calendar */}
        <button
          onClick={() => {
            setViewMode('calendar');
            setSmartView(null);
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            viewMode === 'calendar'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[2]" />
          <span className="text-[10px] mt-0.5">Calendar</span>
        </button>

        {/* 3. Priority View */}
        <button
          onClick={() => setViewMode('eisenhower')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            viewMode === 'eisenhower'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid2X2 className="w-4 h-4 stroke-[2]" />
          <span className="text-[10px] mt-0.5">Priority</span>
        </button>

        {/* 4. Focus Timer */}
        <button
          onClick={() => setViewMode('focus')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            viewMode === 'focus'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 stroke-[2]" />
          <span className="text-[10px] mt-0.5">Focus</span>
        </button>

        {/* 5. Search */}
        <button
          onClick={() => onOpenSearch?.()}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"
        >
          <Search className="w-4 h-4 stroke-[2]" />
          <span className="text-[10px] mt-0.5">Search</span>
        </button>
      </nav>
    </>
  );
};
