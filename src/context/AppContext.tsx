import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type {
  Task,
  Subtask,
  CustomList,
  Habit,
  PomodoroSettings,
  KarmaStats,
  ViewMode,
  SmartView,
  ThemeId,
  SortBy,
  KanbanStatus,
  Priority,
  EisenhowerQuadrant,
  KanbanSection,
} from '../types';
import {
  loadTasks,
  saveTasks,
  loadCustomLists,
  saveCustomLists,
  loadHabits,
  saveHabits,
  loadPomodoroSettings,
  savePomodoroSettings,
  loadKarmaStats,
  saveKarmaStats,
  getTodayDate,
  getKarmaLevel,
  loadSavedViewMode,
  saveViewMode,
  loadSavedSmartView,
  saveSmartView,
  loadSavedActiveListId,
  saveActiveListId,
  loadKanbanSections,
  saveKanbanSections,
} from '../utils/storage';
import { soundEngine } from '../utils/audio';
import {
  getSheetsSyncUrl,
  setSheetsSyncUrl,
  getLastSyncTime,
  setLastSyncTime,
  pullFromSheets,
  pushToSheets,
  testSheetsConnection,
  mergeTasks,
} from '../services/sheetsSync';

interface AppContextType {
  tasks: Task[];
  customLists: CustomList[];
  habits: Habit[];
  pomodoroSettings: PomodoroSettings;
  karma: KarmaStats;
  viewMode: ViewMode;
  smartView: SmartView | null;
  activeListId: string | null;
  selectedTaskId: string | null;
  searchQuery: string;
  activeTheme: ThemeId;
  sortBy: SortBy;
  activeFocusTaskId: string | null;
  isSettingsModalOpen: boolean;
  isSidebarCollapsed: boolean;
  
  // State Setters & Actions
  setViewMode: (mode: ViewMode) => void;
  setSmartView: (sv: SmartView | null) => void;
  setActiveListId: (listId: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemeId) => void;
  setSortBy: (sort: SortBy) => void;
  setActiveFocusTaskId: (id: string | null) => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks' | 'kanbanStatus' | 'eisenhowerQuadrant' | 'estimatedPomodoros' | 'completedPomodoros' | 'pinned'> & { kanbanStatus?: KanbanStatus; eisenhowerQuadrant?: EisenhowerQuadrant; subtasks?: Subtask[] }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  permanentlyDeleteTask: (id: string) => void;
  toggleTaskPin: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  addNestedSubtask: (taskId: string, parentSubtaskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  startTaskTimer: (taskId: string) => void;
  pauseTaskTimer: (taskId: string) => void;
  stopTaskTimer: (taskId: string) => void;
  resetTaskTimer: (taskId: string) => void;

  // Custom List Actions
  addCustomList: (name: string, color: string, icon: string) => void;
  deleteCustomList: (id: string) => void;
  reorderCustomLists: (newLists: CustomList[]) => void;
  updateCustomList: (id: string, updates: Partial<CustomList>) => void;

  // Kanban Sections
  sections: KanbanSection[];
  addSection: (title: string) => KanbanSection;
  updateSection: (id: string, title: string) => void;
  deleteSection: (id: string) => void;
  reorderSections: (newSections: KanbanSection[]) => void;

  // View Title & Icon Customization (Rename Feature)
  allTasksTitle: string;
  setAllTasksTitle: (title: string) => void;
  allTasksIcon: string;
  setAllTasksIcon: (icon: string) => void;
  smartViewCustomTitles: Record<string, string>;
  updateSmartViewTitle: (key: string, title: string) => void;

  // Habit Actions
  addHabit: (name: string, color: string, icon: string, targetDaysPerWeek: number) => void;
  toggleHabitCheckIn: (habitId: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;

  // Pomodoro Actions
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  addFocusTime: (minutes: number, taskId?: string) => void;

  // Data Import / Export Backup
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Karma & Animations
  addKarmaPoints: (points: number) => void;
  triggerConfetti: () => void;

  // Global Rich Create Task Modal
  isCreateTaskModalOpen: boolean;
  createTaskModalDefaults: {
    title?: string;
    dueDate?: string;
    dueTime?: string;
    kanbanStatus?: KanbanStatus;
    eisenhowerQuadrant?: EisenhowerQuadrant;
    priority?: Priority;
    parentTaskId?: string;
  };
  openCreateTaskModal: (defaults?: {
    title?: string;
    dueDate?: string;
    dueTime?: string;
    kanbanStatus?: KanbanStatus;
    eisenhowerQuadrant?: EisenhowerQuadrant;
    priority?: Priority;
    parentTaskId?: string;
  }) => void;
  closeCreateTaskModal: () => void;

  // Google Sheets Cloud Sync (Laptop + Mobile + Multi-User)
  sheetsSyncUrl: string | null;
  isSheetsSyncing: boolean;
  sheetsLastSyncTime: string | null;
  sheetsSyncError: string | null;
  isSheetsModalOpen: boolean;
  setIsSheetsModalOpen: (open: boolean) => void;
  triggerSheetsSync: () => Promise<void>;
  connectSheets: (url: string) => Promise<boolean>;
  disconnectSheets: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [customLists, setCustomLists] = useState<CustomList[]>(loadCustomLists);
  const [sections, setSections] = useState<KanbanSection[]>(loadKanbanSections);
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(loadPomodoroSettings);
  const [karma, setKarma] = useState<KarmaStats>(loadKarmaStats);

  const [viewMode, setViewMode] = useState<ViewMode>(loadSavedViewMode);
  const [smartView, setSmartView] = useState<SmartView | null>(loadSavedSmartView);
  const [activeListId, setActiveListId] = useState<string | null>(loadSavedActiveListId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<ThemeId>('ticktick-dark');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskModalDefaults, setCreateTaskModalDefaults] = useState<{
    title?: string;
    dueDate?: string;
    dueTime?: string;
    kanbanStatus?: KanbanStatus;
    eisenhowerQuadrant?: EisenhowerQuadrant;
    priority?: Priority;
    parentTaskId?: string;
  }>({});

  const openCreateTaskModal = (defaults: {
    title?: string;
    dueDate?: string;
    dueTime?: string;
    kanbanStatus?: KanbanStatus;
    eisenhowerQuadrant?: EisenhowerQuadrant;
    priority?: Priority;
    parentTaskId?: string;
  } = {}) => {
    setCreateTaskModalDefaults(defaults);
    setIsCreateTaskModalOpen(true);
  };

  const closeCreateTaskModal = () => {
    setIsCreateTaskModalOpen(false);
    setCreateTaskModalDefaults({});
  };

  // Google Sheets Cloud Sync State (Laptop + Mobile + Multi-User)
  const [sheetsSyncUrl, setSheetsSyncUrlState] = useState<string | null>(getSheetsSyncUrl);
  const [isSheetsSyncing, setIsSheetsSyncing] = useState<boolean>(false);
  const [sheetsLastSyncTime, setSheetsLastSyncTime] = useState<string | null>(getLastSyncTime);
  const [sheetsSyncError, setSheetsSyncError] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  const connectSheets = async (url: string): Promise<boolean> => {
    setIsSheetsSyncing(true);
    setSheetsSyncError(null);
    try {
      const test = await testSheetsConnection(url);
      if (!test.success) {
        setSheetsSyncError(test.message);
        setIsSheetsSyncing(false);
        return false;
      }

      setSheetsSyncUrl(url);
      setSheetsSyncUrlState(url);

      const remote = await pullFromSheets(url);
      const mergedTasks = remote && remote.tasks.length > 0 ? mergeTasks(tasks, remote.tasks) : tasks;
      const mergedSections = remote && remote.sections && remote.sections.length > 0 ? remote.sections : sections;
      const mergedLists = remote && remote.lists && remote.lists.length > 0 ? remote.lists : customLists;

      setTasks(mergedTasks);
      setSections(mergedSections);
      setCustomLists(mergedLists);

      // Explicitly push and await to ensure tasks are written to the sheet immediately
      const pushRes = await pushToSheets(url, {
        tasks: mergedTasks,
        sections: mergedSections,
        lists: mergedLists,
      });

      if (!pushRes.success) {
        setSheetsSyncError(pushRes.message || 'Could not write tasks to sheet. Check Apps Script permissions.');
        setIsSheetsSyncing(false);
        return false;
      }

      setSheetsLastSyncTime(new Date().toISOString());
      setIsSheetsSyncing(false);
      return true;
    } catch (err: any) {
      setSheetsSyncError(err.message || 'Connection failed');
      setIsSheetsSyncing(false);
      return false;
    }
  };

  const disconnectSheets = () => {
    setSheetsSyncUrl(null);
    setSheetsSyncUrlState(null);
    setSheetsSyncError(null);
  };

  const triggerSheetsSync = async (): Promise<void> => {
    if (!sheetsSyncUrl) return;
    setIsSheetsSyncing(true);
    setSheetsSyncError(null);
    try {
      const remote = await pullFromSheets(sheetsSyncUrl);
      const mergedTasks = remote && remote.tasks.length > 0 ? mergeTasks(tasks, remote.tasks) : tasks;
      const mergedSections = remote && remote.sections && remote.sections.length > 0 ? remote.sections : sections;
      const mergedLists = remote && remote.lists && remote.lists.length > 0 ? remote.lists : customLists;

      setTasks(mergedTasks);
      setSections(mergedSections);
      setCustomLists(mergedLists);

      const pushRes = await pushToSheets(sheetsSyncUrl, {
        tasks: mergedTasks,
        sections: mergedSections,
        lists: mergedLists,
      });

      if (pushRes.success) {
        setSheetsLastSyncTime(new Date().toISOString());
      } else {
        setSheetsSyncError(pushRes.message || 'Sync failed while writing to Google Sheet.');
      }
    } catch (err: any) {
      setSheetsSyncError(err.message || 'Sync error');
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  // 1. Initial Sync on App Load (Mobile or Laptop)
  useEffect(() => {
    if (sheetsSyncUrl) {
      triggerSheetsSync();
    }
  }, []);

  // 2. Auto-Sync when user switches back to this tab/window (e.g. from Mobile to Laptop)
  useEffect(() => {
    const handleFocus = () => {
      if (sheetsSyncUrl && !isSheetsSyncing) {
        triggerSheetsSync();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [sheetsSyncUrl, isSheetsSyncing]);

  // 3. Periodic Background Sync every 60 seconds
  useEffect(() => {
    if (!sheetsSyncUrl) return;
    const interval = setInterval(() => {
      if (!isSheetsSyncing && document.visibilityState === 'visible') {
        triggerSheetsSync();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [sheetsSyncUrl, isSheetsSyncing]);

  // 4. Debounced Push to Google Sheet whenever tasks, sections, or customLists change locally
  useEffect(() => {
    if (!sheetsSyncUrl || isSheetsSyncing) return;
    const timeout = setTimeout(() => {
      pushToSheets(sheetsSyncUrl, {
        tasks,
        sections,
        lists: customLists,
      });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [tasks, sections, customLists, sheetsSyncUrl]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ticktick_clone_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [allTasksTitle, setAllTasksTitleState] = useState<string>(() => {
    try {
      return localStorage.getItem('ticktick_all_tasks_title') || 'All Tasks';
    } catch {
      return 'All Tasks';
    }
  });

  const setAllTasksTitle = (title: string) => {
    const finalTitle = title.trim() || 'All Tasks';
    setAllTasksTitleState(finalTitle);
    try {
      localStorage.setItem('ticktick_all_tasks_title', finalTitle);
    } catch {}
  };

  const [allTasksIcon, setAllTasksIconState] = useState<string>(() => {
    try {
      return localStorage.getItem('ticktick_all_tasks_icon') || '📋';
    } catch {
      return '📋';
    }
  });

  const setAllTasksIcon = (icon: string) => {
    setAllTasksIconState(icon);
    try {
      localStorage.setItem('ticktick_all_tasks_icon', icon);
    } catch {}
  };

  const [smartViewCustomTitles, setSmartViewCustomTitles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ticktick_smart_view_titles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateSmartViewTitle = (key: string, title: string) => {
    setSmartViewCustomTitles((prev) => {
      const updated = { ...prev, [key]: title };
      try {
        localStorage.setItem('ticktick_smart_view_titles', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync state to local storage
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveCustomLists(customLists); }, [customLists]);
  useEffect(() => { saveKanbanSections(sections); }, [sections]);
  useEffect(() => { saveHabits(habits); }, [habits]);
  useEffect(() => { savePomodoroSettings(pomodoroSettings); }, [pomodoroSettings]);
  useEffect(() => { saveKarmaStats(karma); }, [karma]);
  useEffect(() => { saveViewMode(viewMode); }, [viewMode]);
  useEffect(() => { saveSmartView(smartView); }, [smartView]);
  useEffect(() => { saveActiveListId(activeListId); }, [activeListId]);
  useEffect(() => {
    try {
      localStorage.setItem('ticktick_clone_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {
      // fallback
    }
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // 30-Day Auto Purge for Trash (Permanently deletes tasks in Trash older than 30 days)
  useEffect(() => {
    const purgeExpiredTrash = () => {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      setTasks((prev) => {
        let changed = false;
        const updated = prev.filter((t) => {
          if (!t.deleted) return true;
          const deleteTimestamp = t.deletedAt
            ? new Date(t.deletedAt).getTime()
            : (t.createdAt ? new Date(t.createdAt).getTime() : now);
          
          if (now - deleteTimestamp > thirtyDaysMs) {
            changed = true;
            return false; // Automatically delete permanently after 30 days
          }
          return true;
        });

        // Set deletedAt if missing on deleted tasks
        const withDeletedAt = updated.map((t) => {
          if (t.deleted && !t.deletedAt) {
            changed = true;
            return { ...t, deletedAt: new Date().toISOString() };
          }
          return t;
        });

        return changed ? withDeletedAt : prev;
      });
    };

    purgeExpiredTrash();
    const interval = setInterval(purgeExpiredTrash, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply Theme Class to <html>
  useEffect(() => {
    document.documentElement.className = `theme-${activeTheme}`;
    if (activeTheme === 'ticktick-light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [activeTheme]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch {
      // fallback
    }
  };

  const addKarmaPoints = (points: number) => {
    const today = getTodayDate();
    setKarma((prev) => {
      const newScore = Math.max(0, prev.score + points);
      const newDailyPoints = {
        ...prev.dailyPoints,
        [today]: (prev.dailyPoints[today] || 0) + points,
      };
      return {
        ...prev,
        score: newScore,
        level: getKarmaLevel(newScore),
        dailyPoints: newDailyPoints,
      };
    });
  };

  // Task Handlers with Full Unified Cross-View Sync
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'subtasks' | 'kanbanStatus' | 'eisenhowerQuadrant' | 'estimatedPomodoros' | 'completedPomodoros' | 'pinned'> & { kanbanStatus?: KanbanStatus; eisenhowerQuadrant?: EisenhowerQuadrant; subtasks?: Subtask[] }) => {
    const priority = taskData.priority || 'none';
    const dueDate = taskData.dueDate || (taskData.assignedDate ? taskData.assignedDate : null);
    const assignedDate = taskData.assignedDate || (dueDate ? dueDate : undefined);
    const dueTime = taskData.dueTime || (taskData.assignedTime ? taskData.assignedTime : null);
    const assignedTime = taskData.assignedTime || (dueTime ? dueTime : undefined);

    const defaultQuadrant: EisenhowerQuadrant =
      priority === 'high' ? 'q1' : priority === 'medium' ? 'q2' : priority === 'low' ? 'q3' : 'q4';

    const defaultSection =
      taskData.kanbanStatus || (sections.length > 0 ? sections[0].id : 'todo');

    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
      completed: false,
      pinned: false,
      priority,
      dueDate,
      dueTime,
      assignedDate,
      assignedTime,
      subtasks: taskData.subtasks || [],
      kanbanStatus: defaultSection,
      eisenhowerQuadrant: taskData.eisenhowerQuadrant || defaultQuadrant,
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const updated: Task = { ...t, ...updates };

        // 1. Automatic Priority <-> Eisenhower Matrix Quadrant Sync
        if (updates.priority && !updates.eisenhowerQuadrant) {
          updated.eisenhowerQuadrant =
            updates.priority === 'high'
              ? 'q1'
              : updates.priority === 'medium'
              ? 'q2'
              : updates.priority === 'low'
              ? 'q3'
              : 'q4';
        } else if (updates.eisenhowerQuadrant && !updates.priority) {
          updated.priority =
            updates.eisenhowerQuadrant === 'q1'
              ? 'high'
              : updates.eisenhowerQuadrant === 'q2'
              ? 'medium'
              : updates.eisenhowerQuadrant === 'q3'
              ? 'low'
              : 'none';
        }

        // 2. Automatic DueDate <-> AssignedDate Sync
        if ('dueDate' in updates && !('assignedDate' in updates)) {
          updated.assignedDate = updates.dueDate || undefined;
        } else if ('assignedDate' in updates && !('dueDate' in updates)) {
          updated.dueDate = updates.assignedDate || null;
        }

        // 3. Automatic DueTime <-> AssignedTime Sync
        if ('dueTime' in updates && !('assignedTime' in updates)) {
          updated.assignedTime = updates.dueTime || undefined;
        } else if ('assignedTime' in updates && !('dueTime' in updates)) {
          updated.dueTime = updates.assignedTime || null;
        }

        // 4. Ensure valid Kanban Section
        if (!updated.kanbanStatus) {
          updated.kanbanStatus = sections.length > 0 ? sections[0].id : 'todo';
        }

        return updated;
      })
    );
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = !t.completed;
          if (isCompleting) {
            soundEngine.playCompleteChime();
            addKarmaPoints(15);
            setKarma((k) => ({ ...k, tasksCompletedTotal: k.tasksCompletedTotal + 1 }));
            triggerConfetti();
          } else {
            addKarmaPoints(-10);
          }
          return {
            ...t,
            completed: isCompleting,
            completedAt: isCompleting ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deleted: true, deletedAt: new Date().toISOString() } : t))
    );
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const restoreTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deleted: false, deletedAt: null } : t))
    );
  };

  const permanentlyDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const toggleTaskPin = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtask = { id: `s-${Date.now()}`, title: title.trim(), completed: false, subtasks: [] };
          return { ...t, subtasks: [...t.subtasks, newSubtask] };
        }
        return t;
      })
    );
  };

  const addNestedSubtask = (taskId: string, parentSubtaskId: string, title: string) => {
    if (!title.trim()) return;

    const addRecursive = (list: Subtask[]): Subtask[] => {
      return list.map((s) => {
        if (s.id === parentSubtaskId) {
          const newChild: Subtask = {
            id: `s-${Date.now()}`,
            title: title.trim(),
            completed: false,
            subtasks: [],
          };
          return {
            ...s,
            subtasks: [...(s.subtasks || []), newChild],
          };
        }
        if (s.subtasks && s.subtasks.length > 0) {
          return { ...s, subtasks: addRecursive(s.subtasks) };
        }
        return s;
      });
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: addRecursive(t.subtasks) };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const toggleRecursive = (list: Subtask[]): Subtask[] => {
      return list.map((s) => {
        if (s.id === subtaskId) {
          if (!s.completed) soundEngine.playCompleteChime();
          return { ...s, completed: !s.completed };
        }
        if (s.subtasks && s.subtasks.length > 0) {
          return { ...s, subtasks: toggleRecursive(s.subtasks) };
        }
        return s;
      });
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: toggleRecursive(t.subtasks) };
        }
        return t;
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) };
        }
        return t;
      })
    );
  };

  const startTaskTimer = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            isTimerRunning: true,
            timerStartedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const pauseTaskTimer = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.isTimerRunning && t.timerStartedAt) {
          const startedAt = new Date(t.timerStartedAt).getTime();
          const sessionSecs = Math.floor((Date.now() - startedAt) / 1000);
          const accumulated = (t.timerPausedSeconds || 0) + Math.max(0, sessionSecs);
          return {
            ...t,
            isTimerRunning: false,
            timerStartedAt: null,
            timerPausedSeconds: accumulated,
          };
        }
        return t;
      })
    );
  };

  const stopTaskTimer = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          let sessionSecs = 0;
          if (t.isTimerRunning && t.timerStartedAt) {
            const startedAt = new Date(t.timerStartedAt).getTime();
            sessionSecs = Math.floor((Date.now() - startedAt) / 1000);
          }
          const totalToAdd = (t.timerPausedSeconds || 0) + Math.max(0, sessionSecs);
          return {
            ...t,
            isTimerRunning: false,
            timerStartedAt: null,
            timerPausedSeconds: 0,
            totalTimeSpent: (t.totalTimeSpent || 0) + totalToAdd,
          };
        }
        return t;
      })
    );
  };

  const resetTaskTimer = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            isTimerRunning: false,
            timerStartedAt: null,
            timerPausedSeconds: 0,
            totalTimeSpent: 0,
          };
        }
        return t;
      })
    );
  };

  // Custom List Handlers
  const addCustomList = (name: string, color: string, icon: string) => {
    const newList: CustomList = {
      id: `list-${Date.now()}`,
      name,
      color,
      icon,
    };
    setCustomLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
    setSmartView(null);
  };

  const deleteCustomList = (id: string) => {
    setCustomLists((prev) => prev.filter((l) => l.id !== id));
    if (activeListId === id) {
      setActiveListId(null);
      setSmartView('inbox');
    }
  };

  const reorderCustomLists = (newLists: CustomList[]) => {
    setCustomLists(newLists);
  };

  const updateCustomList = (id: string, updates: Partial<CustomList>) => {
    setCustomLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  // Kanban Sections Handlers
  const addSection = (title: string): KanbanSection => {
    const trimmed = title.trim() || 'New Section';
    const newSec: KanbanSection = {
      id: `section_${Date.now()}`,
      title: trimmed,
    };
    setSections((prev) => [...prev, newSec]);
    return newSec;
  };

  const updateSection = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: title.trim() } : s))
    );
  };

  const deleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const reorderSections = (newSections: KanbanSection[]) => {
    setSections(newSections);
  };

  // Habit Handlers
  const addHabit = (name: string, color: string, icon: string, targetDaysPerWeek: number) => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name,
      icon,
      color,
      targetDaysPerWeek,
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const toggleHabitCheckIn = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const exists = h.completedDates.includes(dateStr);
          let newDates: string[];
          if (exists) {
            newDates = h.completedDates.filter((d) => d !== dateStr);
          } else {
            newDates = [...h.completedDates, dateStr].sort();
            soundEngine.playCompleteChime();
            addKarmaPoints(10);
            triggerConfetti();
          }

          // Streak calculation
          let streak = 0;
          let checkDate = new Date(getTodayDate());
          while (true) {
            const iso = checkDate.toISOString().split('T')[0];
            if (newDates.includes(iso)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          const bestStreak = Math.max(h.bestStreak, streak);

          return {
            ...h,
            completedDates: newDates,
            currentStreak: streak,
            bestStreak: bestStreak,
          };
        }
        return h;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Pomodoro Actions
  const updatePomodoroSettings = (settings: Partial<PomodoroSettings>) => {
    setPomodoroSettings((prev) => ({ ...prev, ...settings }));
  };

  const addFocusTime = (minutes: number, taskId?: string) => {
    soundEngine.playTimerFinishBell();
    addKarmaPoints(20);
    triggerConfetti();

    setKarma((prev) => ({
      ...prev,
      focusMinutesTotal: prev.focusMinutesTotal + minutes,
    }));

    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
            : t
        )
      );
    }
  };

  // Import / Export Backup
  const exportDataJSON = () => {
    const backupObj = {
      tasks,
      customLists,
      habits,
      pomodoroSettings,
      karma,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tasks && Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (parsed.customLists && Array.isArray(parsed.customLists)) setCustomLists(parsed.customLists);
      if (parsed.habits && Array.isArray(parsed.habits)) setHabits(parsed.habits);
      if (parsed.karma) setKarma(parsed.karma);
      triggerConfetti();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        customLists,
        habits,
        pomodoroSettings,
        karma,
        viewMode,
        smartView,
        activeListId,
        selectedTaskId,
        searchQuery,
        activeTheme,
        sortBy,
        activeFocusTaskId,
        isSettingsModalOpen,
        isSidebarCollapsed,
        setIsSettingsModalOpen,
        toggleSidebar,
        setIsSidebarCollapsed,
        setViewMode,
        setSmartView: (sv) => {
          setSmartView(sv);
          if (sv) setActiveListId(null);
        },
        setActiveListId: (lid) => {
          setActiveListId(lid);
          if (lid) setSmartView(null);
        },
        setSelectedTaskId,
        setSearchQuery,
        setTheme: setActiveTheme,
        setSortBy,
        setActiveFocusTaskId,

        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        restoreTask,
        permanentlyDeleteTask,
        toggleTaskPin,
        addSubtask,
        addNestedSubtask,
        toggleSubtask,
        deleteSubtask,
        startTaskTimer,
        pauseTaskTimer,
        stopTaskTimer,
        resetTaskTimer,

        addCustomList,
        deleteCustomList,
        reorderCustomLists,
        updateCustomList,

        sections,
        addSection,
        updateSection,
        deleteSection,
        reorderSections,

        allTasksTitle,
        setAllTasksTitle,
        allTasksIcon,
        setAllTasksIcon,
        smartViewCustomTitles,
        updateSmartViewTitle,

        addHabit,
        toggleHabitCheckIn,
        deleteHabit,

        updatePomodoroSettings,
        addFocusTime,

        exportDataJSON,
        importDataJSON,

        addKarmaPoints,
        triggerConfetti,

        isCreateTaskModalOpen,
        createTaskModalDefaults,
        openCreateTaskModal,
        closeCreateTaskModal,

        sheetsSyncUrl,
        isSheetsSyncing,
        sheetsLastSyncTime,
        sheetsSyncError,
        isSheetsModalOpen,
        setIsSheetsModalOpen,
        triggerSheetsSync,
        connectSheets,
        disconnectSheets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
