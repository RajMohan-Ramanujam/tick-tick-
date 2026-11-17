import { Task, CustomList, Habit, PomodoroSettings, KarmaStats, ViewMode, SmartView, KanbanSection } from '../types';

const STORAGE_KEYS = {
  TASKS: 'ticktick_clone_tasks',
  LISTS: 'ticktick_clone_lists',
  HABITS: 'ticktick_clone_habits',
  POMODORO: 'ticktick_clone_pomodoro',
  KARMA: 'ticktick_clone_karma',
  THEME: 'ticktick_clone_theme',
};

// Helper for navigation state persistence
export const loadSavedViewMode = (): ViewMode => {
  try {
    const saved = localStorage.getItem('ticktick_clone_view_mode');
    if (saved) return saved as ViewMode;
  } catch {
    // fallback
  }
  return 'kanban';
};

export const saveViewMode = (mode: ViewMode) => {
  try {
    localStorage.setItem('ticktick_clone_view_mode', mode);
  } catch {
    // fallback
  }
};

export const loadSavedSmartView = (): SmartView | null => {
  try {
    const saved = localStorage.getItem('ticktick_clone_smart_view');
    if (saved === 'null') return null;
    if (saved) return saved as SmartView;
  } catch {
    // fallback
  }
  return null;
};

export const saveSmartView = (sv: SmartView | null) => {
  try {
    localStorage.setItem('ticktick_clone_smart_view', sv || 'null');
  } catch {
    // fallback
  }
};

export const loadSavedActiveListId = (): string | null => {
  try {
    const saved = localStorage.getItem('ticktick_clone_active_list_id');
    if (saved === 'null') return null;
    if (saved) return saved;
  } catch {
    // fallback
  }
  return 'welcome';
};

export const saveActiveListId = (id: string | null) => {
  try {
    localStorage.setItem('ticktick_clone_active_list_id', id || 'null');
  } catch {
    // fallback
  }
};

// Helper for today's ISO date (YYYY-MM-DD) in local timezone
export const getTodayDate = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper for adding/subtracting days from date in local timezone
export const addDaysToDate = (dateStr: string, days: number): string => {
  if (!dateStr) return getTodayDate();
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return getTodayDate();
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_LISTS: CustomList[] = [
  { id: 'welcome', name: 'Welcome', color: '#F59E0B', icon: '👋', defaultView: 'kanban' },
  { id: 'work', name: 'Work Project', color: '#3B82F6', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal & Home', color: '#10B981', icon: 'User' },
  { id: 'fitness', name: 'Health & Fitness', color: '#EF4444', icon: 'Activity' },
  { id: 'shopping', name: 'Shopping List', color: '#F59E0B', icon: 'ShoppingBag' },
];

const today = getTodayDate();
const tomorrow = addDaysToDate(today, 1);
const nextWeek = addDaysToDate(today, 5);

const DEFAULT_TASKS: Task[] = [
  // Getting Started Section Tasks (from screenshot)
  {
    id: 'w-1',
    title: 'Click the input box to create a task',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'todo',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-2',
    title: 'Use lists to manage tasks',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'todo',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  // Feature Modules Section Tasks
  {
    id: 'w-3',
    title: 'Calendar: Check your schedule',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_progress',
    eisenhowerQuadrant: 'q2',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-4',
    title: 'Eisenhower Matrix: Prioritize tasks',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [
      {
        id: 'st-1',
        title: 'hiii',
        completed: false,
        subtasks: [
          {
            id: 'st-1-1',
            title: 'hijiu',
            completed: false,
          },
        ],
      },
    ],
    pinned: false,
    kanbanStatus: 'in_progress',
    eisenhowerQuadrant: 'q1',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-5',
    title: 'Pomodoro: Rescue from procrastination',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_progress',
    eisenhowerQuadrant: 'q2',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-6',
    title: 'Habit: Visualize your efforts',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_progress',
    eisenhowerQuadrant: 'q2',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  // Explore More Section Tasks
  {
    id: 'w-7',
    title: 'Kanban, Timeline View: Visual management',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q3',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-8',
    title: 'Sticky Note: Record ideas at any time',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-9',
    title: 'Subscription Calendar: Never miss events',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-10',
    title: 'More unique features',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-11',
    title: 'Premium',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w-12',
    title: 'Follow Us',
    description: '',
    completed: false,
    priority: 'none',
    dueDate: today,
    listId: 'welcome',
    tags: [],
    subtasks: [],
    pinned: false,
    kanbanStatus: 'in_review',
    eisenhowerQuadrant: 'q4',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'Morning Hydration (1L Water)',
    icon: 'Droplet',
    color: '#06B6D4',
    targetDaysPerWeek: 7,
    completedDates: [addDaysToDate(today, -2), addDaysToDate(today, -1), today],
    currentStreak: 3,
    bestStreak: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-2',
    name: '15 Mins Mindfulness Meditation',
    icon: 'Heart',
    color: '#8B5CF6',
    targetDaysPerWeek: 5,
    completedDates: [addDaysToDate(today, -1), today],
    currentStreak: 2,
    bestStreak: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-3',
    name: 'Daily Code Practice & Review',
    icon: 'Code',
    color: '#10B981',
    targetDaysPerWeek: 6,
    completedDates: [addDaysToDate(today, -3), addDaysToDate(today, -2), addDaysToDate(today, -1)],
    currentStreak: 3,
    bestStreak: 24,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_POMODORO: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  ambientSound: 'none',
  ambientVolume: 0.8,
};

const DEFAULT_KARMA: KarmaStats = {
  score: 650,
  level: 'Intermediate 🌟',
  tasksCompletedTotal: 18,
  focusMinutesTotal: 215,
  habitsCompletedTotal: 29,
  dailyPoints: {
    [today]: 45,
    [addDaysToDate(today, -1)]: 60,
    [addDaysToDate(today, -2)]: 30,
  },
  achievements: [
    { id: 'a-1', title: 'First Task Complete', description: 'Complete your first task in TickTick', icon: 'CheckCircle2', unlocked: true },
    { id: 'a-2', title: 'Focus Master', description: 'Log over 100 minutes of Pomodoro focus', icon: 'Timer', unlocked: true },
    { id: 'a-3', title: 'Streak Builder', description: 'Maintain a habit streak of 3 days or more', icon: 'Flame', unlocked: true },
    { id: 'a-4', title: 'Grandmaster Karma', description: 'Reach 2000 Karma Points', icon: 'Trophy', unlocked: false },
  ],
};

// Storage Loaders
export const loadTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : DEFAULT_TASKS;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const loadCustomLists = (): CustomList[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LISTS);
  return data ? JSON.parse(data) : DEFAULT_LISTS;
};

export const saveCustomLists = (lists: CustomList[]) => {
  localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
};

export const loadHabits = (): Habit[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HABITS);
  return data ? JSON.parse(data) : DEFAULT_HABITS;
};

export const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const loadPomodoroSettings = (): PomodoroSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.POMODORO);
  return data ? JSON.parse(data) : DEFAULT_POMODORO;
};

export const savePomodoroSettings = (settings: PomodoroSettings) => {
  localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(settings));
};

export const loadKarmaStats = (): KarmaStats => {
  const data = localStorage.getItem(STORAGE_KEYS.KARMA);
  return data ? JSON.parse(data) : DEFAULT_KARMA;
};

export const saveKarmaStats = (karma: KarmaStats) => {
  localStorage.setItem(STORAGE_KEYS.KARMA, JSON.stringify(karma));
};

export const getKarmaLevel = (score: number): string => {
  if (score >= 2000) return 'Grandmaster 🏆';
  if (score >= 1200) return 'Master ⚡';
  if (score >= 800) return 'Advanced 🚀';
  if (score >= 400) return 'Intermediate 🌟';
  return 'Beginner 🌱';
};

export const KANBAN_SECTIONS_STORAGE_KEY = 'ticktick_kanban_sections_v2';

export const DEFAULT_KANBAN_SECTIONS: KanbanSection[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
];

export const loadKanbanSections = (): KanbanSection[] => {
  try {
    const data = localStorage.getItem(KANBAN_SECTIONS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_KANBAN_SECTIONS;
};

export const saveKanbanSections = (sections: KanbanSection[]) => {
  try {
    localStorage.setItem(KANBAN_SECTIONS_STORAGE_KEY, JSON.stringify(sections));
  } catch {}
};
