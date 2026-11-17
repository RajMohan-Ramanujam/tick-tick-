import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Pin,
  Calendar,
  Plus,
  Trash2,
  RotateCcw,
  CheckSquare,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Printer,
  AlignLeft,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import { getTodayDate, addDaysToDate } from '../../utils/storage';
import { TaskContextMenu } from './TaskContextMenu';

export const TaskList: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{ taskId: string; x: number; y: number } | null>(null);

  const {
    tasks,
    smartView,
    activeListId,
    customLists,
    selectedTaskId,
    setSelectedTaskId,
    toggleTaskComplete,
    deleteTask,
    restoreTask,
    permanentlyDeleteTask,
    toggleTaskPin,
    searchQuery,
    addTask,
    allTasksTitle,
    openCreateTaskModal,
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('none');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(getTodayDate());

  const [isCompletedAccordionOpen, setIsCompletedAccordionOpen] = useState(true);

  const today = getTodayDate();
  const next7 = addDaysToDate(today, 7);

  // Filter Tasks based on current navigation state
  const baseFilteredTasks = tasks.filter((task) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // 2. Trash View
    if (smartView === 'trash') {
      return task.deleted;
    }
    if (task.deleted) return false;

    // 3. Completed View (Shows all completed tasks)
    if (smartView === 'completed') {
      return task.completed;
    }

    // 4. Custom List View
    if (activeListId) {
      if (activeListId === 'welcome') {
        return task.listId === 'welcome' || task.listId === 'inbox' || !task.listId;
      }
      return task.listId === activeListId;
    }

    // 5. Smart Views
    if (smartView === 'inbox') {
      return task.listId === 'inbox' || !task.listId;
    }
    if (smartView === 'today') {
      return task.dueDate === today;
    }
    if (smartView === 'yesterday') {
      const yesterday = addDaysToDate(today, -1);
      return task.dueDate === yesterday;
    }
    if (smartView === 'old_tasks') {
      const yesterday = addDaysToDate(today, -1);
      return task.dueDate ? task.dueDate < yesterday : (task.createdAt && task.createdAt.split('T')[0] < yesterday);
    }
    if (smartView === 'next7') {
      return task.dueDate && task.dueDate >= today && task.dueDate <= next7;
    }
    if (smartView === 'high_priority') {
      return task.priority === 'high';
    }

    return true;
  });

  // Active (incomplete) tasks for current view
  const activeTasksList = baseFilteredTasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Completed tasks for current view or completed archive view
  const completedTasksList = baseFilteredTasks
    .filter((t) => t.completed)
    .sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });

  // Group completed tasks by date (e.g., "Today Fri", "22 Jul Wed") matching TickTick Completed view 100%
  const getGroupedCompletedTasks = () => {
    const groups: { dateLabel: string; tasks: Task[] }[] = [];
    const map = new Map<string, Task[]>();

    completedTasksList.forEach((t) => {
      let dateObj = new Date();
      if (t.completedAt) {
        dateObj = new Date(t.completedAt);
      } else if (t.dueDate) {
        dateObj = new Date(t.dueDate);
      }

      const iso = dateObj.toISOString().split('T')[0];
      const todayIso = getTodayDate();
      const yesterdayIso = addDaysToDate(todayIso, -1);

      let dateLabel = '';
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      if (iso === todayIso) {
        dateLabel = `Today ${dayName}`;
      } else if (iso === yesterdayIso) {
        dateLabel = `Yesterday ${dayName}`;
      } else {
        const dayNum = dateObj.getDate();
        const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
        dateLabel = `${dayNum} ${monthShort} ${dayName}`;
      }

      if (!map.has(dateLabel)) {
        map.set(dateLabel, []);
      }
      map.get(dateLabel)!.push(t);
    });

    map.forEach((taskList, label) => {
      groups.push({ dateLabel: label, tasks: taskList });
    });

    return groups;
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      description: '',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || today,
      listId: activeListId || 'inbox',
      tags: [],
    });

    setNewTaskTitle('');
    setNewTaskPriority('none');
  };

  // Header Title Resolver
  const getHeaderTitle = () => {
    if (activeListId) {
      const list = customLists.find((l) => l.id === activeListId);
      return list ? list.name : 'Custom List';
    }
    switch (smartView) {
      case 'inbox':
        return '📥 Inbox Tasks';
      case 'today':
        return '📅 Today';
      case 'yesterday':
        return '⏪ Yesterday';
      case 'old_tasks':
        return '🕰️ Old Tasks';
      case 'next7':
        return '🗓️ Next 7 Days';
      case 'high_priority':
        return '🔴 High Priority Tasks';
      case 'completed':
        return '✅ Completed Archive';
      case 'trash':
        return '🗑️ Trash (Auto-deletes after 30 days)';
      default:
        return allTasksTitle || 'My Tasks';
    }
  };

  const priorityColors: Record<Priority, string> = {
    high: 'text-red-500 border-red-500/40 bg-red-500/10',
    medium: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
    low: 'text-blue-500 border-blue-500/40 bg-blue-500/10',
    none: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181c] text-slate-100 overflow-hidden">
      {/* List Header */}
      {smartView === 'completed' ? (
        <div className="p-6 pb-2 space-y-3.5 border-b border-[#242428] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlignLeft className="w-5 h-5 text-slate-400 stroke-[2.2]" />
              <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">
                Completed
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
              title="Print / Export Completed Tasks"
            >
              <Printer className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              className="px-3 py-1 rounded-xl bg-[#202024] hover:bg-[#28282d] text-xs font-semibold text-slate-300 border border-[#303036] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>All Dates</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-xl bg-[#202024] hover:bg-[#28282d] text-xs font-semibold text-slate-300 border border-[#303036] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>All Lists</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded-xl bg-[#202024] hover:bg-[#28282d] text-xs font-semibold text-slate-300 border border-[#303036] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>All Completed</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight m-0">
              {getHeaderTitle()}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {baseFilteredTasks.length} {baseFilteredTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
        </div>
      )}

      {/* Add Task Quick Bar */}
      {smartView !== 'trash' && smartView !== 'completed' && (
        <div className="px-6 py-3">
          <form
            onSubmit={handleAddNewTask}
            className="flex items-center gap-3 p-2.5 bg-[#1e1e22] rounded-2xl border border-[#2e2e34] shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all"
          >
            <Plus className="w-5 h-5 text-blue-500" />
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="+ Add task to this list... Press Enter"
              className="flex-1 text-sm bg-transparent text-white placeholder-slate-400 focus:outline-none"
            />
            {/* Quick Priority Selector */}
            <div className="flex items-center gap-1">
              {(['high', 'medium', 'low', 'none'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTaskPriority(p)}
                  className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center transition-transform ${
                    newTaskPriority === p ? 'scale-125 ring-2 ring-blue-500' : 'opacity-60'
                  }`}
                  style={{
                    borderColor:
                      p === 'high'
                        ? '#ef4444'
                        : p === 'medium'
                        ? '#f59e0b'
                        : p === 'low'
                        ? '#3b82f6'
                        : '#94a3b8',
                  }}
                  title={`Priority: ${p}`}
                >
                  !
                </button>
              ))}
            </div>
            {/* Quick Due Date */}
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="text-xs bg-[#141416] text-slate-300 px-2 py-1 rounded-lg border border-[#2e2e34] focus:outline-none"
            />
            {/* More Options / Assignee / Subtasks */}
            <button
              type="button"
              onClick={() => {
                openCreateTaskModal({
                  dueDate: newTaskDueDate || today,
                  priority: newTaskPriority,
                  title: newTaskTitle.trim() || undefined,
                });
                setNewTaskTitle('');
              }}
              className="px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Open full options (subtasks, assignees, attach to previous task)"
            >
              Options...
            </button>
          </form>
        </div>
      )}

      {/* Task List Items Container */}
      <div className="flex-1 p-6 pt-2 overflow-y-auto space-y-5">
        {activeTasksList.length === 0 && completedTasksList.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800/80">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3 animate-bounce" />
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No tasks in this view!
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Add a new task using the input bar above or select a different smart list from the sidebar.
            </p>
          </div>
        ) : (
          <>
            {/* Active (Incomplete) Tasks List */}
            {activeTasksList.length > 0 && (
              <div className="space-y-2.5">
                {activeTasksList.map((task) => {
                  const isSelected = selectedTaskId === task.id;
                  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ taskId: task.id, x: e.clientX, y: e.clientY });
                      }}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e22] border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 ring-1 ring-blue-500/50 bg-[#24242e]'
                          : 'border-[#2a2a30] hover:border-[#383842]'
                      }`}
                    >
                      {/* Left Side: Checkbox & Task info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {smartView === 'trash' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreTask(task.id);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-500 transition-colors"
                            title="Restore Task"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                            title="Mark as complete"
                          >
                            {task.completed
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                              : <Circle className="w-5 h-5" />}
                          </button>
                        )}

                        <div className="truncate flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                              {task.title}
                            </span>

                            {task.pinned && (
                              <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>

                          {/* Sub-info Row */}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {task.dueDate && (
                              <span
                                className={`flex items-center gap-1 ${
                                  task.dueDate === today ? 'text-emerald-500 font-semibold' : ''
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                              </span>
                            )}

                            {task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            )}

                            {(task.assignedTo || task.assignedBy) && (
                              <span className="flex items-center gap-1 text-blue-400 font-medium">
                                <UserCheck className="w-3 h-3" />
                                {task.assignedTo ? `To: ${task.assignedTo}` : ''}
                                {task.assignedBy ? ` (By: ${task.assignedBy})` : ''}
                              </span>
                            )}

                            {smartView === 'trash' && (
                              <span className="text-amber-400 font-semibold">
                                ⏳ Auto-deletes in {Math.max(1, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - (task.deletedAt ? new Date(task.deletedAt).getTime() : new Date(task.createdAt).getTime()))) / (24 * 60 * 60 * 1000)))}d
                              </span>
                            )}

                            {task.tags.map((tag) => (
                              <span key={tag} className="text-blue-500 font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Priority Badge & Actions */}
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        {smartView === 'trash' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              permanentlyDeleteTask(task.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Permanently Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Tasks Render Section */}
            {completedTasksList.length > 0 && (
              <>
                {smartView === 'completed' ? (
                  /* 100% Pixel-Perfect TickTick Completed View matching user screenshot */
                  <div className="space-y-6 pt-1">
                    {getGroupedCompletedTasks().map((group) => (
                      <div key={group.dateLabel} className="space-y-1">
                        {/* Collapsible Date Group Header */}
                        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-200 py-1 select-none">
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{group.dateLabel}</span>
                          <span className="text-slate-500 text-[11px] font-normal">{group.tasks.length}</span>
                        </div>

                        {/* Date Group Tasks */}
                        <div className="space-y-0.5 pl-1">
                          {group.tasks.map((task) => {
                            const isSelected = selectedTaskId === task.id;
                            const foundList = customLists.find((l) => l.id === task.listId);
                            const listName = foundList
                              ? `${foundList.icon || '👋'} ${foundList.name}`
                              : task.listId === 'welcome' || !task.listId
                              ? '👋 Welcome'
                              : '📥 Inbox';

                            return (
                              <div
                                key={task.id}
                                onClick={() => setSelectedTaskId(task.id)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setContextMenu({ taskId: task.id, x: e.clientX, y: e.clientY });
                                }}
                                className={`group flex items-center justify-between py-2.5 px-3 rounded-xl transition-all cursor-pointer hover:bg-slate-200/50 dark:hover:bg-[#202024] border-b border-slate-200/50 dark:border-[#1c1c20] ${
                                  isSelected ? 'bg-blue-500/10 dark:bg-[#242428] ring-1 ring-blue-500/40' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskComplete(task.id);
                                    }}
                                    className="shrink-0 w-4 h-4 flex items-center justify-center text-emerald-500 hover:text-slate-400 transition-colors cursor-pointer"
                                    title="Mark as incomplete"
                                  >
                                    <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                                  </button>
                                  <span className="text-xs font-medium line-through text-slate-400 dark:text-slate-500 truncate">
                                    {task.title}
                                  </span>
                                </div>

                                {/* Far-Right List Badge (Matches User Screenshot) */}
                                <div className="flex items-center gap-1.5 shrink-0 ml-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                  <span>{listName}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Collapsible Accordion Fold in Normal List Views */
                  <div className="space-y-3 pt-3 border-t border-[#26262e]">
                    <button
                      type="button"
                      onClick={() => setIsCompletedAccordionOpen(!isCompletedAccordionOpen)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                    >
                      {isCompletedAccordionOpen ? (
                        <ChevronDown className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span>Completed Tasks ({completedTasksList.length})</span>
                    </button>

                    {isCompletedAccordionOpen && (
                      <div className="space-y-2.5">
                        {completedTasksList.map((task) => {
                          const isSelected = selectedTaskId === task.id;
                          const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTaskId(task.id)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({ taskId: task.id, x: e.clientX, y: e.clientY });
                              }}
                              className={`group flex items-center justify-between p-3.5 rounded-2xl bg-[#1e1e22]/80 border transition-all cursor-pointer opacity-85 hover:opacity-100 ${
                                isSelected
                                  ? 'border-blue-500 ring-1 ring-blue-500/50 bg-[#24242e]'
                                  : 'border-[#2a2a30] hover:border-[#383842]'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskComplete(task.id);
                                  }}
                                  className="shrink-0 w-5 h-5 flex items-center justify-center text-emerald-500 hover:text-slate-400 transition-colors cursor-pointer"
                                  title="Mark as incomplete"
                                >
                                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                                </button>

                                <div className="truncate flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold truncate line-through text-slate-400 dark:text-slate-500">
                                      {task.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                    {task.completedAt && (
                                      <span className="flex items-center gap-1 text-emerald-500/90 font-medium">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Completed
                                      </span>
                                    )}

                                    {task.subtasks.length > 0 && (
                                      <span className="flex items-center gap-1">
                                        <CheckSquare className="w-3 h-3" />
                                        {completedSubtasks}/{task.subtasks.length}
                                      </span>
                                    )}

                                    {(task.assignedTo || task.assignedBy) && (
                              <span className="flex items-center gap-1 text-blue-400 font-medium">
                                <UserCheck className="w-3 h-3" />
                                {task.assignedTo ? `To: ${task.assignedTo}` : ''}
                                {task.assignedBy ? ` (By: ${task.assignedBy})` : ''}
                              </span>
                            )}

                            {smartView === 'trash' && (
                              <span className="text-amber-400 font-semibold">
                                ⏳ Auto-deletes in {Math.max(1, Math.ceil((30 * 24 * 60 * 60 * 1000 - (Date.now() - (task.deletedAt ? new Date(task.deletedAt).getTime() : new Date(task.createdAt).getTime()))) / (24 * 60 * 60 * 1000)))}d
                              </span>
                            )}

                            {task.tags.map((tag) => (
                                      <span key={tag} className="text-slate-400 font-medium">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 ml-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border text-slate-400 border-slate-500/20 bg-slate-500/5">
                                  Completed
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <TaskContextMenu
          taskId={contextMenu.taskId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
