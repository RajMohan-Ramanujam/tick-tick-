import React, { useState } from 'react';
import { Megaphone, Activity, Bell, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { tasks } = useApp();

  const [activeTab, setActiveTab] = useState<'notifications' | 'activities'>('notifications');

  if (!isOpen) return null;

  // Generated activity log items
  const recentActivities = [
    { id: 'act-1', text: 'Created task "Click input box to create task"', time: '10 mins ago', type: 'add' },
    { id: 'act-2', text: 'Completed task "Welcome tour"', time: '1 hour ago', type: 'complete' },
    { id: 'act-3', text: 'Updated Eisenhower Matrix status', time: '2 hours ago', type: 'update' },
  ];

  return (
    <>
      {/* Backdrop listener */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Popover Drawer (Matches User Screenshot 100%) */}
      <div className="absolute left-14 bottom-12 z-50 w-80 bg-[#1f1f23] border border-[#2e2e36] rounded-2xl shadow-2xl p-4 text-slate-200 animate-in fade-in zoom-in-95 duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerated select-none space-y-5">
        
        {/* Top Mode Switcher Pill - Shortened to Character Size */}
        <div className="bg-[#26262a] p-1 rounded-2xl border border-[#303036] inline-flex items-center gap-1 w-fit">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center ${
              activeTab === 'notifications'
                ? 'bg-[#383840] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center ${
              activeTab === 'activities'
                ? 'bg-[#383840] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activities
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'notifications' ? (
          /* Empty Megaphone Graphic Illustration */
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            {/* Megaphone Graphic Badge */}
            <div className="w-32 h-24 rounded-3xl bg-[#161618] border border-[#2a2a30] flex items-center justify-center relative shadow-inner">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-lg shadow-md">
                  📢
                </div>
                <div className="text-blue-400 text-xs font-bold">
                  ✦
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white m-0">
                No task updates
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Task update notifications will appear here
              </p>
            </div>
          </div>
        ) : (
          /* Activities Log List */
          <div className="space-y-2 py-2 max-h-64 overflow-y-auto pr-1">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-[#17171a] border border-[#26262c] flex items-start gap-2.5 text-xs"
              >
                {act.type === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="text-slate-200 font-medium block">{act.text}</span>
                  <span className="text-[10px] text-slate-500">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
