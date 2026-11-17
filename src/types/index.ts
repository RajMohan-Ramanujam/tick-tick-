export type Priority = 'high' | 'medium' | 'low' | 'none';

export type KanbanStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | string;

export interface KanbanSection {
  id: string;
  title: string;
}

export type KanbanGroupBy = 'status' | 'priority' | 'list' | 'date';

export type EisenhowerQuadrant = 'q1' | 'q2' | 'q3' | 'q4';

export type ViewMode = 'landing' | 'list' | 'kanban' | 'timeline' | 'eisenhower' | 'calendar' | 'habits' | 'focus' | 'analytics' | 'countdown';

export type SmartView = 'inbox' | 'today' | 'yesterday' | 'old_tasks' | 'next7' | 'high_priority' | 'completed' | 'trash';

export type ThemeId = 'ticktick-dark' | 'ticktick-light' | 'neon-cyberpunk' | 'matcha-green' | 'sunset-amber' | 'deep-ocean';

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';

export type SortBy = 'dueDate' | 'priority' | 'title' | 'createdAt';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: Subtask[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD format
  dueTime?: string | null; // HH:mm format
  listId: string; // 'inbox', or custom list id like 'work', 'personal'
  tags: string[];
  subtasks: Subtask[];
  pinned: boolean;
  kanbanStatus: KanbanStatus;
  eisenhowerQuadrant: EisenhowerQuadrant;
  estimatedPomodoros: number;
  completedPomodoros: number;
  repeatRule?: RepeatRule;
  createdAt: string;
  completedAt?: string | null;
  deleted?: boolean;
  deletedAt?: string | null; // ISO timestamp when task was moved to trash
  totalTimeSpent?: number; // Total seconds spent on this task
  isTimerRunning?: boolean;
  timerStartedAt?: string | null; // ISO string timestamp when timer was started
  timerPausedSeconds?: number; // Accumulated live seconds before pause
  assignedTo?: string; // Work assigned to (Assignee)
  assignedBy?: string; // Work soldravanga name (Assigner / Given by)
  assignedDate?: string; // Assignment Date (YYYY-MM-DD)
  assignedTime?: string; // Assignment Time (HH:mm)
}

export interface CustomList {
  id: string;
  name: string;
  color: string;
  icon: string;
  defaultView?: 'list' | 'kanban' | 'timeline';
  folder?: string;
  type?: 'task' | 'note';
  showInSmartList?: 'all' | 'none' | 'today';
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetDaysPerWeek: number;
  completedDates: string[]; // YYYY-MM-DD strings
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
}

export type AmbientSoundType = 'none' | 'rain' | 'forest' | 'waves' | 'cafe' | 'whitenoise';

export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number; // 0 to 1
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface KarmaStats {
  score: number;
  level: string;
  tasksCompletedTotal: number;
  focusMinutesTotal: number;
  habitsCompletedTotal: number;
  dailyPoints: Record<string, number>; // YYYY-MM-DD -> score gained
  achievements: Achievement[];
}
