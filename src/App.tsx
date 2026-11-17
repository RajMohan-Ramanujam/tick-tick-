import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { IconDock } from './components/layout/IconDock';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DetailPanel } from './components/layout/DetailPanel';
import { TaskList } from './components/tasks/TaskList';
import { TaskKanban } from './components/tasks/TaskKanban';
import { TaskTimeline } from './components/tasks/TaskTimeline';
import { EisenhowerMatrix } from './components/tasks/EisenhowerMatrix';
import { TaskCalendar } from './components/tasks/TaskCalendar';
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer';
import { HabitList } from './components/habits/HabitList';
import { KarmaAnalytics } from './components/analytics/KarmaAnalytics';
import { CountdownView } from './components/tasks/CountdownView';
import { LandingPage } from './components/landing/LandingPage';
import { SearchModal } from './components/layout/SearchModal';
import { SettingsModal } from './components/layout/SettingsModal';
import { CreateTaskModal } from './components/layout/CreateTaskModal';
import { GoogleSheetsModal } from './components/sheets/GoogleSheetsModal';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center text-slate-300">
          <p className="text-sm font-bold text-red-400 mb-2">Something went wrong in this component.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout: React.FC = () => {
  const { viewMode, selectedTaskId } = useApp();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to open Search Modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (viewMode === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#18181a] text-slate-100 font-sans antialiased select-none">
      {/* 1. Far-Left Vertical Icon Dock Strip */}
      <IconDock onOpenSearch={() => setIsSearchOpen(true)} />

      {/* 2. Navigation Sidebar Drawer */}
      <Sidebar />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        <main className="flex-1 overflow-hidden relative flex pb-14 md:pb-0">
          <div key={viewMode} className="flex-1 flex h-full w-full overflow-hidden">
            {viewMode === 'list' && <TaskList />}
            {viewMode === 'kanban' && <TaskKanban />}
            {viewMode === 'timeline' && <TaskTimeline />}
            {viewMode === 'eisenhower' && <EisenhowerMatrix />}
            {viewMode === 'calendar' && <TaskCalendar />}
            {viewMode === 'analytics' && <KarmaAnalytics />}
            {viewMode === 'habits' && <HabitList />}
            {viewMode === 'focus' && <PomodoroTimer />}
            {viewMode === 'countdown' && <CountdownView />}
          </div>
        </main>
      </div>

      {/* 4. Right Task Detail Inspector Panel */}
      {selectedTaskId && <DetailPanel />}

      {/* 5. Global Search Floating Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 6. Global Settings & Preferences Modal */}
      <SettingsModal />

      {/* 7. Global Rich Create Task / Subtask Modal */}
      <ErrorBoundary>
        <CreateTaskModal />
      </ErrorBoundary>

      {/* 8. Google Sheets Cloud Sync Modal (Mobile + Laptop + Multi-User) */}
      <GoogleSheetsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
