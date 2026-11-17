import React, { useState, useEffect } from 'react';
import {
  X,
  Pin,
  Trash2,
  Calendar,
  AlertCircle,
  CheckSquare,
  Plus,
  Timer,
  Folder,
  Kanban as KanbanIcon,
  Grid2X2,
  Repeat,
  Flag,
  Type,
  MessageSquare,
  MoreHorizontal,
  Circle,
  CheckCircle2,
  ExternalLink,
  Play,
  Pause,
  Square,
  RotateCcw,
  UserCheck,
  User,
  Clock,
  Check,
  Edit2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Priority, KanbanStatus, EisenhowerQuadrant, RepeatRule } from '../../types';
import { getTodayDate, formatFriendlyDate, normalizeDateStr, formatFriendlyTime } from '../../utils/storage';

export const DetailPanel: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    toggleTaskPin,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    startTaskTimer,
    pauseTaskTimer,
    stopTaskTimer,
    resetTaskTimer,
    customLists,
    setViewMode,
    setActiveFocusTaskId,
    sections,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [liveElapsed, setLiveElapsed] = useState(0);

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [formAssignedTo, setFormAssignedTo] = useState(task?.assignedTo || '');
  const [formAssignedBy, setFormAssignedBy] = useState(task?.assignedBy || '');
  const [formAssignedDate, setFormAssignedDate] = useState(task?.assignedDate || '');
  const [formAssignedTime, setFormAssignedTime] = useState(task?.assignedTime || '');
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  useEffect(() => {
    setFormAssignedTo(task?.assignedTo || '');
    setFormAssignedBy(task?.assignedBy || '');
    setFormAssignedDate(task?.assignedDate || '');
    setFormAssignedTime(task?.assignedTime || '');
    setIsEditingAssignment(!task?.assignedTo && !task?.assignedBy);
  }, [task?.id, task?.assignedTo, task?.assignedBy, task?.assignedDate, task?.assignedTime]);

  const hasAssignment = Boolean(task?.assignedTo || task?.assignedBy || task?.assignedDate || task?.assignedTime);

  const handleSaveAssignment = () => {
    if (!task) return;
    updateTask(task.id, {
      assignedTo: formAssignedTo.trim() || undefined,
      assignedBy: formAssignedBy.trim() || undefined,
      assignedDate: formAssignedDate || undefined,
      assignedTime: formAssignedTime || undefined,
      dueDate: formAssignedDate || task.dueDate || null,
      dueTime: formAssignedTime || task.dueTime || null,
    });
    setIsEditingAssignment(false);
  };

  const handleClearAssignment = () => {
    if (!task) return;
    setFormAssignedTo('');
    setFormAssignedBy('');
    setFormAssignedDate('');
    setFormAssignedTime('');
    updateTask(task.id, {
      assignedTo: undefined,
      assignedBy: undefined,
      assignedDate: undefined,
      assignedTime: undefined,
      dueDate: null,
      dueTime: null,
    });
    setIsEditingAssignment(true);
  };

  const isTimerPaused = !task?.isTimerRunning && Boolean((task?.timerPausedSeconds || 0) > 0);

  // Live Timer Interval Updates
  useEffect(() => {
    let interval: any = null;
    if (task?.isTimerRunning && task?.timerStartedAt) {
      const calc = () => {
        const started = new Date(task.timerStartedAt!).getTime();
        const currentSecs = Math.floor((Date.now() - started) / 1000);
        const totalLive = (task.timerPausedSeconds || 0) + Math.max(0, currentSecs);
        setLiveElapsed(totalLive);
      };
      calc();
      interval = setInterval(calc, 1000);
    } else if (task?.timerPausedSeconds) {
      setLiveElapsed(task.timerPausedSeconds);
    } else {
      setLiveElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task?.isTimerRunning, task?.timerStartedAt, task?.timerPausedSeconds]);

  if (!task) return null;

  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDigitalTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress =
    task.subtasks.length > 0
      ? Math.round((completedSubtasksCount / task.subtasks.length) * 100)
      : 0;

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!tag || task.tags.includes(tag)) return;
    updateTask(task.id, { tags: [...task.tags, tag] });
    setNewTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    updateTask(task.id, {
      tags: task.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <aside className="fixed inset-0 z-50 md:relative md:inset-auto md:w-[380px] w-full bg-[#202024] md:border-l border-[#2d2d34] h-full flex flex-col justify-between shadow-2xl shrink-0 select-none text-slate-200 animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* 1. Header Bar */}
      <div className="p-4 border-b border-[#2d2d34] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className="text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400 hover:stroke-[2.5]" />
            )}
          </button>

          {/* Native interactive Date picker */}
          <div className="relative flex items-center">
            <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#161618] hover:bg-[#26262a] text-slate-300 text-xs font-semibold border border-[#303036] transition-colors cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.dueDate ? `Due ${formatFriendlyDate(task.dueDate)}` : 'Set Due Date'}</span>
              <input
                type="date"
                value={normalizeDateStr(task.dueDate) || ''}
                onChange={(e) => {
                  const newDate = e.target.value || null;
                  updateTask(task.id, {
                    dueDate: newDate,
                    assignedDate: newDate || undefined,
                  });
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
            {task.dueDate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(task.id, { dueDate: null, assignedDate: undefined });
                }}
                className="ml-1 p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                title="Clear due date"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          {/* Priority Flag */}
          <button
            onClick={() => {
              const nextPriority: Priority =
                task.priority === 'none'
                  ? 'low'
                  : task.priority === 'low'
                  ? 'medium'
                  : task.priority === 'medium'
                  ? 'high'
                  : 'none';
              updateTask(task.id, { priority: nextPriority });
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              task.priority === 'high'
                ? 'text-red-500 bg-red-500/10'
                : task.priority === 'medium'
                ? 'text-amber-500 bg-amber-500/10'
                : task.priority === 'low'
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Priority: ${task.priority} (Click to toggle)`}
          >
            <Flag className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Delete Task */}
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#28282d] transition-colors cursor-pointer"
            title="Move to Trash"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Close Panel Button */}
          <button
            onClick={() => setSelectedTaskId(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282d] transition-colors cursor-pointer"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-left">
        {/* Task Title */}
        <div>
          <input
            type="text"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            placeholder="Task title..."
            className="w-full text-base font-extrabold text-white bg-transparent border-b border-transparent hover:border-[#383840] focus:border-blue-500 focus:outline-none py-1 transition-all"
          />
        </div>

        {/* Section (Kanban) and Matrix (Eisenhower) Real-Time Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          {/* Section dropdown */}
          <div className="flex items-center gap-1.5 bg-[#18181c] px-2.5 py-1 rounded-xl border border-[#2e2e36]" title="Kanban Section">
            <KanbanIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-semibold">Section:</span>
            <select
              value={task.kanbanStatus || (sections[0]?.id || '')}
              onChange={(e) => updateTask(task.id, { kanbanStatus: e.target.value as KanbanStatus })}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-[#1c1c20] text-white">
                  {sec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Eisenhower Quadrant dropdown */}
          <div className="flex items-center gap-1.5 bg-[#18181c] px-2.5 py-1 rounded-xl border border-[#2e2e36]" title="Eisenhower Matrix Quadrant">
            <Grid2X2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={task.eisenhowerQuadrant || 'q4'}
              onChange={(e) => {
                const q = e.target.value as EisenhowerQuadrant;
                updateTask(task.id, {
                  eisenhowerQuadrant: q,
                  priority: q === 'q1' ? 'high' : q === 'q2' ? 'medium' : q === 'q3' ? 'low' : 'none',
                });
              }}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="q1" className="bg-[#1c1c20] text-red-400">❶ Urgent & Important</option>
              <option value="q2" className="bg-[#1c1c20] text-amber-400">❷ Important</option>
              <option value="q3" className="bg-[#1c1c20] text-blue-400">❸ Urgent</option>
              <option value="q4" className="bg-[#1c1c20] text-emerald-400">❹ Normal</option>
            </select>
          </div>
        </div>

        {/* Feature Quick Navigation Action Link */}
        {task.title.includes('Eisenhower Matrix') && (
          <button
            onClick={() => setViewMode('eisenhower')}
            className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 w-full"
          >
            <span>👉 Go Priority View</span>
          </button>
        )}

        {task.title.includes('Calendar') && (
          <button
            onClick={() => setViewMode('calendar')}
            className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 w-full"
          >
            <span>👉 Go Calendar View</span>
          </button>
        )}

        {task.title.includes('Pomodoro') && (
          <button
            onClick={() => setViewMode('focus')}
            className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 w-full"
          >
            <span>👉 Go Pomodoro Focus Timer</span>
          </button>
        )}

        {/* Task Notes / Description Body */}
        <div className="space-y-2">
          {isEditingDescription ? (
            <textarea
              rows={6}
              value={task.description}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              onBlur={() => setIsEditingDescription(false)}
              placeholder="Add description..."
              autoFocus
              className="w-full text-xs bg-[#161618] text-slate-200 p-3 rounded-xl border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="min-h-[100px] text-xs text-slate-300 leading-relaxed p-2 rounded-xl hover:bg-[#26262a] transition-colors cursor-pointer whitespace-pre-wrap font-sans space-y-3"
            >
              {task.description || (
                <span className="text-slate-500 italic">Click to add description or notes...</span>
              )}
            </div>
          )}
        </div>

        {/* ⏱️ WORK TIME TRACKER SECTION */}
        <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#2e2e36] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Work Time Tracker
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Total: {formatSeconds((task.totalTimeSpent || 0) + liveElapsed)}
            </span>
          </div>

          {/* Live Digital Counter & Action Buttons */}
          <div className="flex items-center justify-between bg-[#121214] p-3 rounded-xl border border-[#26262c]">
            <div className="font-mono font-black text-lg text-white tracking-widest">
              {formatDigitalTimer(liveElapsed)}
            </div>

            <div className="flex items-center gap-2">
              {task.isTimerRunning ? (
                <>
                  {/* Pause Button */}
                  <button
                    type="button"
                    onClick={() => pauseTaskTimer(task.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Pause Work Timer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>

                  {/* Stop Button */}
                  <button
                    type="button"
                    onClick={() => stopTaskTimer(task.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Stop and save time"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </>
              ) : isTimerPaused ? (
                <>
                  {/* Resume Button */}
                  <button
                    type="button"
                    onClick={() => startTaskTimer(task.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Resume Work Timer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>

                  {/* Stop Button */}
                  <button
                    type="button"
                    onClick={() => stopTaskTimer(task.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Stop and save time"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop</span>
                  </button>
                </>
              ) : (
                /* Start Work Button */
                <button
                  type="button"
                  onClick={() => startTaskTimer(task.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title="Start Work Timer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Work</span>
                </button>
              )}

              {(task.totalTimeSpent || 0) > 0 && !task.isTimerRunning && !isTimerPaused && (
                <button
                  type="button"
                  onClick={() => resetTaskTimer(task.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-[#202024] transition-colors cursor-pointer"
                  title="Reset Tracked Time"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 👥 WORK ASSIGNED TO SECTION */}
        <div className="p-3.5 rounded-2xl bg-[#18181b] border border-[#2e2e36] space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Work Assigned To
              </span>
            </div>
            {hasAssignment && !isEditingAssignment && (
              <button
                type="button"
                onClick={() => setIsEditingAssignment(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* If assignment details exist and not currently in edit mode, display the summary */}
          {hasAssignment && !isEditingAssignment ? (
            <div className="bg-[#121214] p-3 rounded-xl border border-[#26262c] space-y-2.5 text-xs">
              {/* Assigned To */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Work Assigned To:</span>
                </span>
                <span className="font-bold text-white bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                  {task.assignedTo || 'Unassigned'}
                </span>
              </div>

              {/* Work Soldravanga Name (Given by) */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Work Given By:</span>
                </span>
                <span className="font-bold text-slate-200 bg-[#1e1e24] px-2 py-0.5 rounded-lg border border-[#303038]">
                  {task.assignedBy || 'Not specified'}
                </span>
              </div>

              {/* Date & Time */}
              {(task.assignedDate || task.assignedTime) && (
                <div className="flex items-center justify-between pt-1 border-t border-[#222228] text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{task.assignedDate ? formatFriendlyDate(task.assignedDate) : 'No date'}</span>
                  </span>
                  {task.assignedTime && (
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{formatFriendlyTime(task.assignedTime)}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Input / Edit Form */
            <div className="space-y-2.5 bg-[#121214] p-3 rounded-xl border border-[#26262c] animate-in fade-in zoom-in-95 duration-100">
              {/* Work Assigned To (Worker Name) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-blue-400" />
                  <span>Work Assigned To:</span>
                </label>
                <input
                  type="text"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  placeholder="Enter worker / assignee name..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#18181c] text-white border border-[#2e2e36] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Work Soldravanga Name (Given By / Client) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Work Given By (Work Soldravanga Name):</span>
                </label>
                <input
                  type="text"
                  value={formAssignedBy}
                  onChange={(e) => setFormAssignedBy(e.target.value)}
                  placeholder="Enter who gave this task (manager, client)..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#18181c] text-white border border-[#2e2e36] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>Date:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormAssignedDate(getTodayDate())}
                      className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Today
                    </button>
                  </div>
                  <input
                    type="date"
                    value={normalizeDateStr(formAssignedDate) || ''}
                    onChange={(e) => setFormAssignedDate(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded-xl bg-[#18181c] text-white border border-[#2e2e36] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>Time:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                        setFormAssignedTime(timeStr);
                      }}
                      className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                    >
                      Now
                    </button>
                  </div>
                  <input
                    type="time"
                    value={formAssignedTime}
                    onChange={(e) => setFormAssignedTime(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded-xl bg-[#18181c] text-white border border-[#2e2e36] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222228]">
                {hasAssignment && (
                  <button
                    type="button"
                    onClick={handleClearAssignment}
                    className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer mr-auto"
                  >
                    Clear
                  </button>
                )}
                {hasAssignment && (
                  <button
                    type="button"
                    onClick={() => setIsEditingAssignment(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveAssignment}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Assignment</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feature Overview Bullet List (If description contains features) */}
        {task.title.includes('unique features') && (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed pt-2 border-t border-[#2e2e34]">
            <p className="font-semibold text-slate-200 m-0">Here are some of our unique features:</p>
            
            <div className="space-y-2 pl-1">
              <div>
                <span className="font-bold text-white">• Cross-platform support: </span>
                <span>we support nearly all devices and operating systems, including phones, computers, and watches. </span>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
                  [👀 Check out our supported platforms]
                </a>
              </div>

              <div>
                <span className="font-bold text-white">• Collaboration: </span>
                <span>Need to work on a project with colleagues? Quickly invite them to join your list and easily assign tasks to members. </span>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-blue-400 hover:underline inline-flex items-center gap-0.5">
                  [🔗 How to share a list]
                </a>
              </div>

              <div>
                <span className="font-bold text-white">• Tag: </span>
                <span>Want to personalize task management? Try adding tags to tasks for easy categorization and filtering.</span>
              </div>
            </div>
          </div>
        )}

        {/* Subtask / Checklist Manager */}
        <div className="space-y-3 pt-2 border-t border-[#2e2e34]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" /> Checklist & Subtasks
            </label>
            {task.subtasks.length > 0 && (
              <span className="text-xs text-slate-400 font-medium">
                {completedSubtasksCount}/{task.subtasks.length} ({subtaskProgress}%)
              </span>
            )}
          </div>

          {/* Subtask Items */}
          <div className="space-y-1.5">
            {[...task.subtasks]
              .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : 0))
              .map((s) => (
              <div
                key={s.id}
                className="group flex items-center justify-between p-2 rounded-xl bg-[#18181a] border border-[#2e2e34] text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => toggleSubtask(task.id, s.id)}
                    className="cursor-pointer accent-emerald-500"
                  />
                  <span
                    className={`truncate ${
                      s.completed ? 'line-through text-slate-400 opacity-60' : 'text-slate-200'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteSubtask(task.id, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Add subtask item..."
              className="flex-1 text-xs bg-[#161618] text-slate-200 px-3 py-1.5 rounded-xl border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Tags Section */}
        <div className="space-y-2 pt-2 border-t border-[#2e2e34]">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddTagSubmit} className="inline-block">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="+ Add tag"
                className="text-xs bg-[#161618] text-slate-200 px-2 py-0.5 rounded-full border border-[#303036] w-20 focus:w-28 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
};
