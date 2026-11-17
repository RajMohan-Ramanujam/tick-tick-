import React, { useState } from 'react';
import {
  Milestone,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  CheckSquare,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDate, addDaysToDate } from '../../utils/storage';
import { Task } from '../../types';

export const TaskTimeline: React.FC = () => {
  const {
    tasks,
    updateTask,
    toggleTaskComplete,
    setSelectedTaskId,
    selectedTaskId,
    openCreateTaskModal,
    activeListId,
    customLists,
  } = useApp();

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [showUnscheduled, setShowUnscheduled] = useState<boolean>(false);

  const todayStr = getTodayDate();

  // Calculate 7-day week dates starting from Sunday or current week
  const getWeekDates = (offsetWeeks: number) => {
    const today = new Date(todayStr);
    // Find Monday of the current week
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + offsetWeeks * 7);

    const weekDays: {
      dateStr: string;
      dayName: string;
      dayShort: string;
      dayNum: number;
      isToday: boolean;
    }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      weekDays.push({
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }

    return weekDays;
  };

  const days = getWeekDates(weekOffset);

  const activeTasks = tasks.filter((t) => !t.deleted);
  const scheduledTasks = activeTasks.filter((t) => t.dueDate);
  const unscheduledTasks = activeTasks.filter((t) => !t.dueDate);

  const totalActive = activeTasks.length;
  const completedActive = tasks.filter((t) => !t.deleted && t.completed).length;
  const progressPercent = totalActive > 0 ? Math.round((completedActive / totalActive) * 100) : 0;
  const highPriorityCount = activeTasks.filter((t) => !t.completed && t.priority === 'high').length;

  // Month range title for header (e.g., Nov 16 - Nov 22, 2026)
  const firstDay = new Date(days[0].dateStr);
  const lastDay = new Date(days[6].dateStr);
  const weekLabel = `${firstDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${lastDay.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const handleAddMilestone = () => {
    openCreateTaskModal({
      priority: 'high',
      dueDate: todayStr,
    });
  };

  const handleAddForDate = (dateStr: string) => {
    openCreateTaskModal({
      dueDate: dateStr,
      priority: 'medium',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] overflow-hidden select-none text-slate-200">
      {/* 1. Header Toolbar */}
      <div className="px-6 py-3.5 border-b border-[#242428] bg-[#18181b] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
            <Milestone className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight m-0">
                Roadmap & Milestones
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                Weekly Timeline
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simple visual timeline for scheduled tasks and upcoming milestones
            </p>
          </div>
        </div>

        {/* Date Navigation & Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Week Selector */}
          <div className="flex items-center bg-[#202024] rounded-xl border border-[#2a2a2e] p-1 text-xs">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282c] transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Jump to Current Week"
            >
              {weekOffset === 0 ? 'This Week' : weekLabel}
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282c] transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddMilestone}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* 2. Simple Progress & KPI Bar */}
      <div className="px-6 py-2.5 bg-[#161619] border-b border-[#222226] flex items-center justify-between gap-4 text-xs shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Progress:</span>
            <span className="font-bold text-white">
              {completedActive} / {totalActive} Tasks ({progressPercent}%)
            </span>
          </div>
          {highPriorityCount > 0 && (
            <div className="flex items-center gap-1.5 text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded-lg border border-red-500/20">
              <Flag className="w-3.5 h-3.5 fill-current" />
              <span>{highPriorityCount} Urgent Milestones</span>
            </div>
          )}
        </div>

        {/* Unscheduled Tasks Toggle */}
        <button
          onClick={() => setShowUnscheduled(!showUnscheduled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
            showUnscheduled
              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
              : 'bg-[#202024] border-[#2e2e34] text-slate-400 hover:text-white'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Unscheduled Backlog ({unscheduledTasks.length})</span>
        </button>
      </div>

      {/* 3. Main 7-Day Timeline Columns */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[450px]">
          {days.map((day) => {
            const dayTasks = scheduledTasks.filter((t) => t.dueDate === day.dateStr);

            return (
              <div
                key={day.dateStr}
                className={`flex flex-col rounded-2xl border transition-all ${
                  day.isToday
                    ? 'bg-[#1b1b22] border-purple-500/50 shadow-lg shadow-purple-500/5'
                    : 'bg-[#18181c] border-[#242428]'
                }`}
              >
                {/* Column Date Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between ${
                    day.isToday
                      ? 'border-purple-500/30 bg-purple-500/10'
                      : 'border-[#242428] bg-[#161618]'
                  } rounded-t-2xl`}
                >
                  <div>
                    <div
                      className={`text-xs font-bold uppercase tracking-wider ${
                        day.isToday ? 'text-purple-400 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {day.dayShort}
                    </div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {day.dayNum}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {day.isToday && (
                      <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-md">
                        Today
                      </span>
                    )}
                    <button
                      onClick={() => handleAddForDate(day.dateStr)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282e] transition-colors cursor-pointer"
                      title={`Add task for ${day.dateStr}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px]">
                  {dayTasks.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center text-slate-600 text-[11px] gap-1 select-none">
                      <span>No tasks</span>
                      <button
                        onClick={() => handleAddForDate(day.dateStr)}
                        className="text-[10px] text-purple-400/80 hover:text-purple-300 font-semibold cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ) : (
                    dayTasks.map((task) => {
                      const isSelected = selectedTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm group ${
                            isSelected
                              ? 'bg-[#24242e] border-purple-500 ring-1 ring-purple-500/30'
                              : 'bg-[#1e1e24] border-[#2c2c34] hover:border-[#383842]'
                          } ${task.completed ? 'opacity-50' : ''}`}
                        >
                          {/* Checkbox & Title */}
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(task.id);
                              }}
                              className="mt-0.5 text-slate-400 hover:text-white cursor-pointer shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 hover:stroke-[2.5]" />
                              )}
                            </button>
                            <span
                              className={`text-xs font-semibold leading-snug line-clamp-2 ${
                                task.completed
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-100 group-hover:text-purple-300'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {/* Footer: Priority & Details */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#26262e]">
                            <div className="flex items-center gap-1.5">
                              {task.priority !== 'none' && (
                                <Flag
                                  className={`w-3 h-3 ${
                                    task.priority === 'high'
                                      ? 'text-red-500 fill-red-500'
                                      : task.priority === 'medium'
                                      ? 'text-amber-500 fill-amber-500'
                                      : 'text-blue-500 fill-blue-500'
                                  }`}
                                />
                              )}
                              {task.dueTime && (
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{task.dueTime}</span>
                                </span>
                              )}
                            </div>

                            {task.subtasks.length > 0 && (
                              <span className="text-[10px] text-slate-400">
                                {task.subtasks.filter((s) => s.completed).length}/
                                {task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Optional Unscheduled Backlog Drawer */}
        {showUnscheduled && (
          <div className="mt-6 p-4 rounded-2xl bg-[#18181c] border border-[#26262e] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider m-0">
                  Unscheduled Tasks Backlog ({unscheduledTasks.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any task to open its inspector and set a schedule date
              </span>
            </div>

            {unscheduledTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">
                All tasks are currently scheduled! Great job!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                {unscheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTaskId(t.id)}
                    className="p-3 rounded-xl bg-[#202024] hover:bg-[#26262c] border border-[#2c2c34] hover:border-purple-500/40 cursor-pointer transition-all flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="font-semibold text-slate-200 truncate">{t.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTask(t.id, { dueDate: todayStr, assignedDate: todayStr });
                      }}
                      className="px-2 py-0.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-bold transition-all shrink-0 cursor-pointer"
                      title="Schedule for Today"
                    >
                      + Today
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
