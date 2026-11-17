import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Circle,
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
  Clock,
  UserCheck,
  Check,
  Pin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDate, addDaysToDate } from '../../utils/storage';
import { Priority, Task } from '../../types';

export const TaskCalendar: React.FC = () => {
  const {
    tasks,
    setSelectedTaskId,
    selectedTaskId,
    toggleTaskComplete,
    addTask,
    updateTask,
    smartView,
    activeListId,
    openCreateTaskModal,
  } = useApp();

  const todayIso = getTodayDate();
  const yesterdayIso = addDaysToDate(todayIso, -1);

  const getLocalDateIso = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Main Calendar Date State
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (smartView === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      return y;
    }
    return new Date();
  });

  // Sync date when smartView changes
  useEffect(() => {
    if (smartView === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setCurrentDate(y);
    } else if (smartView === 'today') {
      setCurrentDate(new Date());
    } else if (smartView === 'old_tasks') {
      const oldTasks = tasks.filter((t) => !t.deleted && t.dueDate && t.dueDate < yesterdayIso);
      if (oldTasks.length > 0) {
        oldTasks.sort((a, b) => b.dueDate!.localeCompare(a.dueDate!));
        setCurrentDate(new Date(oldTasks[0].dueDate!));
      } else {
        const d = new Date();
        d.setDate(d.getDate() - 3);
        setCurrentDate(d);
      }
    }
  }, [smartView, yesterdayIso]);

  // Clean, Simple View Switcher: Month, Week, Day
  const [calendarViewType, setCalendarViewType] = useState<'Month' | 'Week' | 'Day'>('Month');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Drag & Drop State for Dragging Tasks between days
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateIso, setDragOverDateIso] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigation Handlers
  const handlePrev = () => {
    if (calendarViewType === 'Month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (calendarViewType === 'Week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (calendarViewType === 'Month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (calendarViewType === 'Week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop Handlers for Rescheduling
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, dateIso: string) => {
    e.preventDefault();
    if (dragOverDateIso !== dateIso) {
      setDragOverDateIso(dateIso);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateIso: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, {
        dueDate: targetDateIso,
        assignedDate: targetDateIso,
      });
      showNotification(`Rescheduled to ${targetDateIso}!`);
    }
    setDraggedTaskId(null);
    setDragOverDateIso(null);
  };

  // Filter Tasks Helper for any date
  const getTasksForDate = (dateIso: string) => {
    return tasks
      .filter((t) => {
        if (t.deleted) return false;
        if (filterStatus === 'pending' && t.completed) return false;
        if (filterStatus === 'completed' && !t.completed) return false;
        if (smartView === 'completed' && !t.completed) return false;

        return t.dueDate === dateIso || (!t.dueDate && t.assignedDate === dateIso);
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return 0;
      });
  };

  // Month Grid Cells Calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const monthGridCells: { dayNum: number; isCurrentMonth: boolean; dateIso: string }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = totalDaysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const formattedM = String(prevDate.getMonth() + 1).padStart(2, '0');
    const formattedD = String(dayNum).padStart(2, '0');
    monthGridCells.push({
      dayNum,
      isCurrentMonth: false,
      dateIso: `${prevDate.getFullYear()}-${formattedM}-${formattedD}`,
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateIso = `${year}-${formattedMonth}-${formattedDay}`;
    monthGridCells.push({ dayNum: day, isCurrentMonth: true, dateIso });
  }

  const remainingSlots = (7 - (monthGridCells.length % 7)) % 7;
  for (let day = 1; day <= remainingSlots; day++) {
    const nextDate = new Date(year, month + 1, day);
    const formattedM = String(nextDate.getMonth() + 1).padStart(2, '0');
    const formattedD = String(day).padStart(2, '0');
    monthGridCells.push({
      dayNum: day,
      isCurrentMonth: false,
      dateIso: `${nextDate.getFullYear()}-${formattedM}-${formattedD}`,
    });
  }

  // Week View Calculations (7 days for the active week)
  const currentDayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

  const weekDays: { dayName: string; dayNum: number; dateIso: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const formattedM = String(d.getMonth() + 1).padStart(2, '0');
    const formattedD = String(d.getDate()).padStart(2, '0');
    const dateIso = `${d.getFullYear()}-${formattedM}-${formattedD}`;
    weekDays.push({
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      dateIso,
      isToday: dateIso === todayIso,
    });
  }

  // Title Resolver
  const getHeaderTitle = () => {
    if (calendarViewType === 'Month') return `${monthNames[month]} ${year}`;
    if (calendarViewType === 'Week') {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${year}`;
    }
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const priorityColorMap: Record<Priority, string> = {
    high: 'border-l-red-500 bg-red-500/10 text-red-200 border-[#4a2428]',
    medium: 'border-l-amber-500 bg-amber-500/10 text-amber-200 border-[#4a3a24]',
    low: 'border-l-blue-500 bg-blue-500/10 text-blue-200 border-[#24344a]',
    none: 'border-l-slate-500 bg-[#202026] text-slate-300 border-[#2c2c34]',
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121214] overflow-hidden select-none text-slate-200 relative">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 1. SIMPLE & CLEAN HEADER TOOLBAR */}
      <div className="min-h-14 border-b border-[#222226] bg-[#161619] px-3 sm:px-5 py-2 flex items-center justify-between shrink-0 gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Month/Year Title & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight m-0">
              {getHeaderTitle()}
            </h2>
          </div>

          {/* Simple Navigation: < Today > */}
          <div className="flex items-center rounded-xl bg-[#202024] border border-[#2e2e34] p-0.5 ml-1 sm:ml-2">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282d] transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
            <button
              onClick={handleTodayClick}
              className="px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Go to Today"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282d] transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Center: Quick Filter (All / Pending / Completed) */}
        <div className="hidden lg:flex items-center bg-[#202024] p-0.5 rounded-xl border border-[#2e2e34]">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#2a2a30] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-[#2a2a30] text-amber-300 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-[#2a2a30] text-emerald-400 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Right: View Switcher (Month, Week, Day) & Add Task Button */}
        <div className="flex items-center gap-2">
          {/* Simple View Switcher: Month, Week, Day */}
          <div className="flex items-center bg-[#202024] p-0.5 rounded-xl border border-[#2e2e34]">
            {(['Month', 'Week', 'Day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarViewType(v)}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calendarViewType === v
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#28282e]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Quick Add Task Button */}
          <button
            onClick={() =>
              openCreateTaskModal({
                dueDate: calendarViewType === 'Day' ? getLocalDateIso(currentDate) : todayIso,
              })
            }
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Add Task"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CALENDAR BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: MONTH VIEW (Clean 35/42 Cell Grid) */}
        {calendarViewType === 'Month' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-[#222226] bg-[#161619] text-center text-xs font-bold text-slate-400 py-2 shrink-0">
              <span className="text-red-400/80">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-blue-400/80">Sat</span>
            </div>

            {/* Month Day Cells */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-[#101012] gap-[1px] border-b border-[#222226] overflow-y-auto">
              {monthGridCells.map((cell, idx) => {
                const isToday = cell.dateIso === todayIso;
                const isYesterday = cell.dateIso === yesterdayIso;
                const isSelectedSmartView =
                  (smartView === 'today' && isToday) ||
                  (smartView === 'yesterday' && isYesterday);

                const dayTasks = getTasksForDate(cell.dateIso);
                const isDropTarget = dragOverDateIso === cell.dateIso;

                return (
                  <div
                    key={`${cell.dateIso}-${idx}`}
                    onDragOver={(e) => handleDragOver(e, cell.dateIso)}
                    onDrop={(e) => handleDrop(e, cell.dateIso)}
                    onClick={() => openCreateTaskModal({ dueDate: cell.dateIso })}
                    className={`p-1.5 bg-[#17171a] border-r border-b border-[#222226] min-h-[95px] flex flex-col justify-start transition-all group relative cursor-pointer hover:bg-[#1d1d22] ${
                      !cell.isCurrentMonth
                        ? 'opacity-40 bg-[#121214]'
                        : 'text-slate-200'
                    } ${
                      isDropTarget
                        ? 'ring-2 ring-blue-500 bg-[#202028] scale-[1.01] z-10'
                        : ''
                    } ${
                      isSelectedSmartView
                        ? 'ring-1 ring-amber-500/60 bg-[#1b1b22]'
                        : ''
                    }`}
                  >
                    {/* Cell Date Header */}
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span
                        className={`text-xs font-extrabold flex items-center justify-center ${
                          isToday
                            ? 'w-6 h-6 rounded-full bg-blue-600 text-white shadow-md'
                            : isYesterday
                            ? 'text-amber-400'
                            : cell.isCurrentMonth
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {cell.dayNum === 1 && cell.isCurrentMonth
                          ? `1 ${monthNames[month].slice(0, 3)}`
                          : cell.dayNum}
                      </span>

                      {/* Quick Add Plus button on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateTaskModal({ dueDate: cell.dateIso });
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282e] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title={`Add task for ${cell.dateIso}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Real Tasks List Inside Cell */}
                    <div className="space-y-1 flex-1 overflow-y-auto pr-0.5">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskId(t.id);
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border-l-2 border transition-all cursor-pointer shadow-sm flex items-center justify-between gap-1.5 hover:scale-[1.02] ${
                            priorityColorMap[t.priority]
                          } ${
                            selectedTaskId === t.id
                              ? 'ring-2 ring-blue-500 bg-blue-600/30 text-white'
                              : ''
                          } ${
                            t.completed
                              ? 'opacity-60 line-through bg-[#1a1a20] text-slate-400 border-l-emerald-500'
                              : ''
                          }`}
                          title="Click to view/edit details. Drag to reschedule."
                        >
                          <div className="flex items-center gap-1.5 truncate flex-1">
                            {/* Complete Tick Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              {t.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-400 hover:stroke-[2]" />
                              )}
                            </button>

                            <span className="truncate">{t.title}</span>
                          </div>

                          {/* Pin, Time & Assignee Badges */}
                          <div className="flex items-center gap-1 shrink-0">
                            {t.pinned && (
                              <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                            {(t.dueTime || t.assignedTime) && (
                              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5 bg-black/30 px-1 rounded">
                                <Clock className="w-2.5 h-2.5" />
                                {t.dueTime || t.assignedTime}
                              </span>
                            )}
                            {t.assignedTo && (
                              <span
                                className="text-[9px] font-bold text-blue-300 flex items-center gap-0.5 bg-blue-500/20 px-1 rounded"
                                title={`Assigned To: ${t.assignedTo}`}
                              >
                                <UserCheck className="w-2.5 h-2.5" />
                                {t.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: WEEK VIEW (7-Day Schedule Columns) */}
        {calendarViewType === 'Week' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-[#222226] bg-[#161619] divide-x divide-[#222226] py-2 shrink-0">
              {weekDays.map((wd) => (
                <div key={wd.dateIso} className="text-center">
                  <span className="text-xs font-bold text-slate-400 block">
                    {wd.dayName}
                  </span>
                  <span
                    className={`text-sm font-extrabold inline-block mt-0.5 ${
                      wd.isToday
                        ? 'w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md'
                        : 'text-slate-200'
                    }`}
                  >
                    {wd.dayNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Week Day Columns */}
            <div className="flex-1 grid grid-cols-7 divide-x divide-[#222226] bg-[#101012] overflow-y-auto p-2 gap-2">
              {weekDays.map((wd) => {
                const dayTasks = getTasksForDate(wd.dateIso);
                const isDropTarget = dragOverDateIso === wd.dateIso;

                return (
                  <div
                    key={wd.dateIso}
                    onDragOver={(e) => handleDragOver(e, wd.dateIso)}
                    onDrop={(e) => handleDrop(e, wd.dateIso)}
                    onClick={() => openCreateTaskModal({ dueDate: wd.dateIso })}
                    className={`space-y-2 p-1.5 rounded-2xl transition-all cursor-pointer ${
                      isDropTarget ? 'ring-2 ring-blue-500 bg-[#1c1c24]' : 'hover:bg-[#16161a]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                      <span>{dayTasks.length} tasks</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateTaskModal({ dueDate: wd.dateIso });
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#202024]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {dayTasks.length === 0 ? (
                      <div className="text-xs text-slate-600 text-center py-8 italic">
                        No tasks
                      </div>
                    ) : (
                      dayTasks.map((t) => (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTaskId(t.id);
                          }}
                          className={`p-2.5 rounded-xl border border-l-2 text-xs space-y-1.5 shadow-md cursor-pointer transition-all hover:scale-[1.02] ${
                            priorityColorMap[t.priority]
                          } ${
                            selectedTaskId === t.id
                              ? 'ring-2 ring-blue-500 bg-blue-600/20'
                              : ''
                          } ${
                            t.completed ? 'opacity-60 line-through bg-[#18181e]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskComplete(t.id);
                              }}
                              className="text-slate-400 hover:text-white shrink-0"
                            >
                              {t.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                            <span className="font-bold text-white truncate flex-1">
                              {t.title}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{t.priority.toUpperCase()}</span>
                            {t.assignedTo && (
                              <span className="text-blue-300 font-semibold">
                                👤 {t.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: DAY VIEW (Focused Single Day Timeline) */}
        {calendarViewType === 'Day' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between bg-[#161619] p-4 rounded-2xl border border-[#242428]">
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Schedule for{' '}
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
                <span className="text-xs text-slate-400">
                  {getTasksForDate(getLocalDateIso(currentDate)).length} active tasks scheduled
                </span>
              </div>
              <button
                onClick={() =>
                  openCreateTaskModal({ dueDate: getLocalDateIso(currentDate) })
                }
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task for this Day</span>
              </button>
            </div>

            <div className="space-y-2">
              {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map((timeSlot) => {
                const dayIso = getLocalDateIso(currentDate);
                const dayTasks = getTasksForDate(dayIso);
                const matchingTasks = dayTasks.filter(
                  (t) => t.dueTime === timeSlot || t.assignedTime === timeSlot
                );

                return (
                  <div
                    key={timeSlot}
                    className="flex items-start gap-4 p-3 rounded-2xl bg-[#161619] border border-[#222226]"
                  >
                    <span className="text-xs font-bold text-slate-400 w-20 shrink-0 font-mono mt-1">
                      {timeSlot}
                    </span>
                    <div className="flex-1 space-y-2">
                      {matchingTasks.length === 0 ? (
                        <div
                          onClick={() => {
                            openCreateTaskModal({ dueDate: dayIso, dueTime: timeSlot });
                          }}
                          className="text-xs text-slate-600 hover:text-slate-400 hover:bg-[#1a1a20] p-1.5 rounded-xl border border-dashed border-[#282830] cursor-pointer transition-colors"
                        >
                          + Click to schedule task at {timeSlot}
                        </div>
                      ) : (
                        matchingTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            className="p-3 rounded-xl bg-[#202026] border border-[#2e2e36] text-xs flex items-center justify-between cursor-pointer hover:border-blue-500"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskComplete(t.id);
                                }}
                              >
                                {t.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                              <span
                                className={`font-bold ${
                                  t.completed ? 'line-through text-slate-500' : 'text-white'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                            {t.assignedTo && (
                              <span className="text-[11px] text-blue-300 font-semibold">
                                👤 {t.assignedTo}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
