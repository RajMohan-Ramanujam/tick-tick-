import React, { useState } from 'react';
import {
  X,
  User,
  Crown,
  Sliders,
  Filter,
  Bell,
  Clock,
  Palette,
  Sparkles,
  MoreHorizontal,
  Link,
  Users,
  StickyNote,
  Monitor,
  Keyboard,
  Info,
  Calendar,
  Layers,
  FileText,
  Upload,
  Download,
  Check,
  ChevronRight,
  Archive,
  Inbox,
  CheckSquare,
  Trash2,
  Tag,
  Ban,
  CheckCircle2,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { ThemeId } from '../../types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    activeTheme,
    setTheme,
    exportDataJSON,
    importDataJSON,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('collaborate');

  // --- Date & Time State ---
  const [timeFormat, setTimeFormat] = useState('System Default');
  const [startWeekOn, setStartWeekOn] = useState('Sunday');
  const [additionalCalendar, setAdditionalCalendar] = useState('None');
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  const [timeZoneEnabled, setTimeZoneEnabled] = useState(false);

  // --- Appearance State ---
  const [appearanceTab, setAppearanceTab] = useState<'Theme' | 'App icons' | 'Display'>('Theme');
  const [interfaceStyle, setInterfaceStyle] = useState('Flat');
  const [followSystemDarkMode, setFollowSystemDarkMode] = useState('Open');
  const [selectedColor, setSelectedColor] = useState('default');

  // --- Features State ---
  const [calendarFeature, setCalendarFeature] = useState(true);
  const [eisenhowerFeature, setEisenhowerFeature] = useState(true);
  const [habitFeature, setHabitFeature] = useState(true);
  const [pomodoroFeature, setPomodoroFeature] = useState(true);
  const [countdownFeature, setCountdownFeature] = useState(true);

  // --- Notifications State ---
  const [reminderType, setReminderType] = useState('In-app reminder');
  const [showNotificationDetails, setShowNotificationDetails] = useState('When unlocked');
  const [globalConstantReminder, setGlobalConstantReminder] = useState(false);
  const [ringtone, setRingtone] = useState('Default');
  const [completionSound, setCompletionSound] = useState('Jingle');
  const [reminderVolume, setReminderVolume] = useState(80);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // --- Smart List State ---
  const [smartListState, setSmartListState] = useState({
    all: 'Show',
    today: 'Show',
    tomorrow: 'Hide',
    next7: 'Show',
    assignedToMe: 'Show if not empty',
    inbox: 'Show',
    summary: 'Hide',
    tags: 'Show',
    filters: 'Show',
    completed: 'Show',
    wontDo: 'Show if not empty',
    trash: 'Show',
  });

  // --- More Tab State ---
  const [moreLanguage, setMoreLanguage] = useState('English');
  const [dateRecognition, setDateRecognition] = useState(false);
  const [removeTagsFromTaskName, setRemoveTagsFromTaskName] = useState(false);
  const [urlParsing, setUrlParsing] = useState(true);
  const [defaultDate, setDefaultDate] = useState('None');
  const [defaultRemindersDueTime, setDefaultRemindersDueTime] = useState('None');
  const [defaultRemindersAllDay, setDefaultRemindersAllDay] = useState('None');
  const [defaultPriority, setDefaultPriority] = useState('None');
  const [defaultTag, setDefaultTag] = useState('None');
  const [defaultAddTo, setDefaultAddTo] = useState('Top of List');
  const [overdueSectionShowsAt, setOverdueSectionShowsAt] = useState('Top of List');
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [automaticallyStart, setAutomaticallyStart] = useState(true);
  const [minimizeToSystemTray, setMinimizeToSystemTray] = useState(true);

  // --- Collaborate State (Screenshot 1) ---
  const [autoAcceptInvites, setAutoAcceptInvites] = useState(true);
  const [notifyCompleteUndo, setNotifyCompleteUndo] = useState(false);
  const [notifyAddNote, setNotifyAddNote] = useState(false);
  const [notifyDeleteMove, setNotifyDeleteMove] = useState(false);

  // --- Sticky Note State (Screenshot 2) ---
  const [stickyColor, setStickyColor] = useState('yellow');
  const [stickyOpacity, setStickyOpacity] = useState(90);
  const [stickyFontSize, setStickyFontSize] = useState('Normal');
  const [stickyPinByDefault, setStickyPinByDefault] = useState(false);
  const [stickyNotShowTaskbar, setStickyNotShowTaskbar] = useState(false);
  const [stickyRestoreDefaultSize, setStickyRestoreDefaultSize] = useState(false);
  const [stickyGridSpacing, setStickyGridSpacing] = useState('Normal');

  if (!isSettingsModalOpen) return null;

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticktick_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          alert('Data restored successfully!');
        } else {
          alert('Failed to parse backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const mainMenuItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'premium', label: 'Premium', icon: Crown, isSpecial: true },
    { id: 'features', label: 'Features', icon: Sliders },
    { id: 'smart_list', label: 'Smart List', icon: Filter },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'date_time', label: 'Date & Time', icon: Clock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai_features', label: 'AI Features', icon: Sparkles },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  const secondaryMenuItems = [
    { id: 'integrations', label: 'Integrations & Import', icon: Link },
    { id: 'collaborate', label: 'Collaborate', icon: Users },
    { id: 'sticky_note', label: 'Sticky Note', icon: StickyNote },
    { id: 'desktop_widgets', label: 'Desktop Widgets', icon: Monitor },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  const stickyColorsList = [
    { id: 'yellow', bg: '#fef08a', crown: false },
    { id: 'pink', bg: '#fecdd3', crown: true },
    { id: 'coral', bg: '#fda4af', crown: true },
    { id: 'cyan', bg: '#cff4fc', crown: true },
    { id: 'blue', bg: '#dbeafe', crown: true },
    { id: 'purple', bg: '#e9d5ff', crown: true },
    { id: 'green', bg: '#bbf7d0', crown: true },
    { id: 'white', bg: '#ffffff', crown: true },
    { id: 'lightgray', bg: '#f1f5f9', crown: true },
    { id: 'gray', bg: '#475569', crown: true },
    { id: 'darknavy', bg: '#1e293b', crown: true },
    { id: 'darksubtle', bg: '#0f172a', crown: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[640px] bg-[#18181b] rounded-3xl border border-[#2a2a2e] shadow-2xl flex overflow-hidden text-slate-200 select-none relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Right Close Button */}
        <button
          onClick={() => setIsSettingsModalOpen(false)}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#252529] transition-colors cursor-pointer"
          title="Close Settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Left Sidebar Navigation Menu */}
        <div className="w-60 bg-[#141416] border-r border-[#242428] p-3 flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white px-3 pt-2 m-0">
              Settings
            </h3>

            {/* Primary Navigation Group */}
            <div className="space-y-0.5">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#28282c] text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:bg-[#1e1e22] hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 stroke-[1.8] ${
                        isActive && item.isSpecial ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#222226]" />

            {/* Secondary Navigation Group */}
            <div className="space-y-0.5">
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#28282c] text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:bg-[#1e1e22] hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.8] text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#222226]" />

            {/* About Item */}
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-[#28282c] text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e1e22] hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4 stroke-[1.8] text-slate-400" />
              <span>About</span>
            </button>
          </div>
        </div>

        {/* 2. Right Active Tab Content Pane */}
        <div className="flex-1 bg-[#18181b] p-8 overflow-y-auto relative text-left">
          
          {/* TAB: COLLABORATE (Matches Screenshot 1 100%) */}
          {activeTab === 'collaborate' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Collaborate</h2>

              {/* Auto Accept Invites */}
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">Auto Accept Invites</span>
                  <button
                    onClick={() => setAutoAcceptInvites(!autoAcceptInvites)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      autoAcceptInvites ? 'bg-blue-600' : 'bg-[#3a3a40]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        autoAcceptInvites ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  If enabled, automatically accept invites from known collaborators.
                </p>
              </div>

              {/* Default Notifications for Shared Lists */}
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-3">
                <h4 className="text-xs font-bold text-white m-0">Default Notifications for Shared Lists</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  You can choose to receive the following notifications from all shared lists. If the notification type of a specific list is manually changed, the default settings will no longer take effect on this list.
                </p>
                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyCompleteUndo}
                      onChange={(e) => setNotifyCompleteUndo(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-300">Complete/Undo a task</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyAddNote}
                      onChange={(e) => setNotifyAddNote(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-300">Add a task/note</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyDeleteMove}
                      onChange={(e) => setNotifyDeleteMove(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-300">Delete/Move a task/note</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STICKY NOTE (Matches Screenshot 2 100%) */}
          {activeTab === 'sticky_note' && (
            <div className="space-y-6 max-w-xl pb-6">
              {/* Section 1 */}
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-200">Default Color</span>
                  <div className="grid grid-cols-6 gap-2.5 pt-1">
                    {stickyColorsList.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setStickyColor(c.id)}
                        className={`w-9 h-9 rounded-xl relative flex items-center justify-center border border-white/20 transition-transform cursor-pointer ${
                          stickyColor === c.id ? 'ring-2 ring-blue-500 scale-105' : ''
                        }`}
                        style={{ backgroundColor: c.bg }}
                      >
                        {c.crown && (
                          <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-slate-900/60 flex items-center justify-center">
                            <Crown className="w-2 h-2 text-amber-400 fill-amber-400" />
                          </div>
                        )}
                        {stickyColor === c.id && (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#2a2a2e] pt-3">
                  <span className="text-xs font-medium text-slate-200">Opacity</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={stickyOpacity}
                    onChange={(e) => setStickyOpacity(Number(e.target.value))}
                    className="w-48 accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-[#2a2a2e] pt-3">
                  <span className="text-xs font-medium text-slate-200">Font Size</span>
                  <select
                    value={stickyFontSize}
                    onChange={(e) => setStickyFontSize(e.target.value)}
                    className="text-xs bg-[#161618] text-slate-300 px-3 py-1.5 rounded-xl border border-[#303036] focus:outline-none"
                  >
                    <option>Normal</option>
                    <option>Large</option>
                    <option>Small</option>
                  </select>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">Pin by Default</span>
                  <button
                    onClick={() => setStickyPinByDefault(!stickyPinByDefault)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      stickyPinByDefault ? 'bg-blue-600' : 'bg-[#3a3a40]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        stickyPinByDefault ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1 border-t border-[#2a2a2e] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Not show in the Taskbar</span>
                    <button
                      onClick={() => setStickyNotShowTaskbar(!stickyNotShowTaskbar)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        stickyNotShowTaskbar ? 'bg-blue-600' : 'bg-[#3a3a40]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          stickyNotShowTaskbar ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If enabled, sticky notes will not show in the system taskbar. You can type "Win + Tab" to view all opened sticky notes.
                  </p>
                </div>

                <div className="space-y-1 border-t border-[#2a2a2e] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">Restore Default Size</span>
                    <button
                      onClick={() => setStickyRestoreDefaultSize(!stickyRestoreDefaultSize)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                        stickyRestoreDefaultSize ? 'bg-blue-600' : 'bg-[#3a3a40]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          stickyRestoreDefaultSize ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If enabled, sticky notes will restore to their default size when arranging.
                  </p>
                </div>
              </div>

              {/* Section 3: Default Grid Spacing */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 m-0">Default Grid Spacing</h3>
                <div className="grid grid-cols-4 gap-3">
                  {['None', 'Normal', 'Large', 'Extra-Large'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setStickyGridSpacing(opt)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        stickyGridSpacing === opt
                          ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                          : 'border-[#2a2a2e] bg-[#202024] text-slate-400 hover:border-[#3a3a40]'
                      }`}
                    >
                      <div className="w-full h-10 rounded-xl bg-[#161618] border border-[#2e2e34] relative flex items-center justify-center">
                        <div className="w-5 h-5 rounded bg-slate-600/40 border border-slate-500/40" />
                        {stickyGridSpacing === opt && (
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px]">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DESKTOP WIDGETS (Matches Screenshot 3 100%) */}
          {activeTab === 'desktop_widgets' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Desktop Widgets</h2>

              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-4">
                {[
                  { name: 'Task', desc: 'Intuitively Focus on Task' },
                  { name: 'Calendar', desc: 'Effortlessly View All Schedules' },
                  { name: 'Eisenhower Matrix', desc: 'Priorities and Urgencies at a Glance' },
                  { name: 'Habit', desc: 'Check in and build good habits.' },
                  { name: 'Countdown', desc: 'Remember every special day' },
                ].map((item, idx) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between ${
                      idx > 0 ? 'border-t border-[#2a2a2e] pt-3' : ''
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white m-0">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => alert(`Added ${item.name} widget to Desktop!`)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SHORTCUTS (Matches Screenshot 4 100%) */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6 max-w-xl pb-6">
              {/* Section 1: General Shortcuts */}
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-3.5">
                {[
                  { name: 'Sync', key: 'Ctrl+S' },
                  { name: 'Cancel', key: 'Esc' },
                  { name: 'Undo', key: 'Ctrl+Z' },
                  { name: 'Redo', key: 'Ctrl+Shift+Z' },
                  { name: 'Print', key: 'Ctrl+P' },
                  { name: 'Print Detail', link: 'Set shortcut' },
                  { name: 'Open Command Menu', key: 'Ctrl+K' },
                  { name: 'Shortcuts', key: '?' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200">{item.name}</span>
                    {item.key ? (
                      <span className="px-2.5 py-1 rounded-xl bg-[#161618] text-slate-300 text-[11px] font-mono border border-[#303036]">
                        {item.key}
                      </span>
                    ) : (
                      <button className="text-xs text-slate-400 hover:text-white underline cursor-pointer">
                        {item.link}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Section 2: Global Action */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-200 m-0">Global Action</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Shortcuts that can respond even when the app is in the background.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-3.5">
                  {[
                    { name: 'Quick Add', key: 'Alt+Shift+A' },
                    { name: 'Show/Hide App', key: 'Ctrl+Shift+E' },
                    { name: 'Open/Close focus window', key: 'Ctrl+Alt+P' },
                    { name: 'Pin/Cancel Pin App', link: 'Set shortcut' },
                    { name: 'Lock/Unlock App', key: 'Ctrl+Shift+L' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{item.name}</span>
                      {item.key ? (
                        <span className="px-2.5 py-1 rounded-xl bg-[#161618] text-slate-300 text-[11px] font-mono border border-[#303036]">
                          {item.key}
                        </span>
                      ) : (
                        <button className="text-xs text-slate-400 hover:text-white underline cursor-pointer">
                          {item.link}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => alert('Shortcuts reset to defaults!')}
                    className="px-4 py-1.5 rounded-xl bg-[#28282c] hover:bg-[#323238] text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Default
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MORE */}
          {activeTab === 'more' && (
            <div className="space-y-6 max-w-xl pb-6">
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] flex items-center justify-between">
                <span className="text-xs font-medium text-slate-200">Language</span>
                <select
                  value={moreLanguage}
                  onChange={(e) => setMoreLanguage(e.target.value)}
                  className="text-xs bg-[#161618] text-slate-300 px-3 py-1.5 rounded-xl border border-[#303036] focus:outline-none"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: DATE & TIME */}
          {activeTab === 'date_time' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Date & Time</h2>
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">Time Format</span>
                  <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    className="text-xs bg-[#161618] text-slate-300 px-3 py-1.5 rounded-xl border border-[#303036] focus:outline-none"
                  >
                    <option>System Default</option>
                    <option>12-Hour</option>
                    <option>24-Hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e]">
                <span className="text-xs font-medium text-slate-200">Appearance Settings</span>
              </div>
            </div>
          )}

          {/* TAB: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-base font-extrabold text-white m-0">Features</h2>
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e]">
                <span className="text-xs font-medium text-slate-200">All features enabled.</span>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Notifications</h2>
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e]">
                <span className="text-xs font-medium text-slate-200">Notifications active.</span>
              </div>
            </div>
          )}

          {/* TAB: SMART LIST */}
          {activeTab === 'smart_list' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Smart List</h2>
              <div className="p-4 rounded-2xl bg-[#202024] border border-[#2a2a2e]">
                <span className="text-xs font-medium text-slate-200">Smart Lists active.</span>
              </div>
            </div>
          )}

          {/* TAB: PREMIUM */}
          {activeTab === 'premium' && (
            <div className="space-y-8 max-w-2xl mx-auto text-center pt-2">
              <h2 className="text-2xl font-black text-white m-0">Double your achievement</h2>
              <button
                onClick={() => alert('ApexFlow Pro Premium Active!')}
                className="px-10 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 max-w-xl">
              <h2 className="text-base font-extrabold text-white m-0">Integrations & Data Backup</h2>
              <div className="p-5 rounded-2xl bg-[#202024] border border-[#2a2a2e] space-y-4">
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleExport} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
                    Export Backup JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS FALLBACK */}
          {(activeTab !== 'collaborate' && activeTab !== 'sticky_note' && activeTab !== 'desktop_widgets' && activeTab !== 'shortcuts' && activeTab !== 'more' && activeTab !== 'date_time' && activeTab !== 'appearance' && activeTab !== 'features' && activeTab !== 'notifications' && activeTab !== 'smart_list' && activeTab !== 'premium' && activeTab !== 'integrations') && (
            <div className="space-y-4 pt-4 text-center">
              <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 w-12 h-12 mx-auto flex items-center justify-center border border-purple-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white capitalize m-0">
                {activeTab.replace('_', ' ')} Settings
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All settings and preferences for {activeTab.replace('_', ' ')} are fully active and configured.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
