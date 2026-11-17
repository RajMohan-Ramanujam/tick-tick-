import React, { useState } from 'react';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  FileText,
  Flame,
  Crown,
  MoreHorizontal,
  Minus,
  Square,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { EisenhowerQuadrant, Task } from '../../types';
import { getTodayDate } from '../../utils/storage';

export const EisenhowerMatrix: React.FC = () => {
  const {
    tasks,
    updateTask,
    toggleTaskComplete,
    setSelectedTaskId,
    selectedTaskId,
    addTask,
    activeListId,
    customLists,
    openCreateTaskModal,
  } = useApp();

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [addingToQuadrant, setAddingToQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const todayStr = getTodayDate();
  const activeTasks = tasks.filter((t) => !t.deleted);

  const quadrants: {
    id: EisenhowerQuadrant;
    title: string;
    badgeIcon: string;
    colorClass: string;
    badgeColor: string;
  }[] = [
    {
      id: 'q1',
      title: 'Urgent & Important',
      badgeIcon: '❶',
      colorClass: 'text-red-500',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'q2',
      title: 'Not Urgent & Important',
      badgeIcon: '❷',
      colorClass: 'text-amber-400',
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'q3',
      title: 'Urgent & Unimportant',
      badgeIcon: '❸',
      colorClass: 'text-blue-400',
      badgeColor: 'bg-blue-500 text-white',
    },
    {
      id: 'q4',
      title: 'Not Urgent & Unimportant',
      badgeIcon: '❹',
      colorClass: 'text-emerald-400',
      badgeColor: 'bg-emerald-500 text-white',
    },
  ];

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetQuadrant: EisenhowerQuadrant) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, {
        eisenhowerQuadrant: targetQuadrant,
        priority:
          targetQuadrant === 'q1'
            ? 'high'
            : targetQuadrant === 'q2'
            ? 'medium'
            : targetQuadrant === 'q3'
            ? 'low'
            : 'none',
      });
    }
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleQuickAdd = (e: React.FormEvent, qId: EisenhowerQuadrant) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: '',
      priority: qId === 'q1' ? 'high' : qId === 'q2' ? 'medium' : qId === 'q3' ? 'low' : 'none',
      dueDate: todayStr,
      listId: activeListId || 'welcome',
      tags: [],
    });

    setQuickTitle('');
    setAddingToQuadrant(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] overflow-hidden select-none text-slate-200">
      
      {/* 1. Top Header Bar (Matches User Screenshot 100%) */}
      <div className="h-12 border-b border-[#242428] bg-[#18181b] px-4 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-extrabold text-white tracking-tight m-0">
          Priority View
        </h2>

        <div className="flex items-center gap-2.5 text-slate-400">
          <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#222226] transition-colors cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main 4-Quadrant Matrix Grid */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
          {quadrants.map((q) => {
            const qTasks = activeTasks.filter((t) => {
              if (t.eisenhowerQuadrant === q.id) return true;
              if (q.id === 'q4' && !t.eisenhowerQuadrant) return true;
              return false;
            });

            // Group tasks inside quadrant: Today, Scheduled, and No Date
            const todayTasks = qTasks.filter((t) => t.dueDate === todayStr);
            const scheduledTasks = qTasks.filter((t) => t.dueDate && t.dueDate !== todayStr);
            const noDateTasks = qTasks.filter((t) => !t.dueDate);

            return (
              <div
                key={q.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, q.id)}
                className="flex flex-col rounded-2xl border border-[#26262b] bg-[#1a1a1e] p-4 overflow-hidden relative group"
              >
                {/* Quadrant Title Header */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">{q.badgeIcon}</span>
                    <h3 className={`text-xs font-bold ${q.colorClass} m-0`}>
                      {q.title}
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      openCreateTaskModal({
                        eisenhowerQuadrant: q.id,
                        priority: q.id === 'q1' ? 'high' : q.id === 'q2' ? 'medium' : q.id === 'q3' ? 'low' : 'none',
                      })
                    }
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#242428] transition-colors cursor-pointer"
                    title="Add task with options"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Quick Add Input Form */}
                {addingToQuadrant === q.id && (
                  <form
                    onSubmit={(e) => handleQuickAdd(e, q.id)}
                    className="p-2.5 mb-3 rounded-xl bg-[#242428] border border-blue-500/40 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <input
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="Task name... (Press Enter)"
                      autoFocus
                      className="w-full text-xs px-2.5 py-1 rounded-lg bg-[#161618] text-white border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToQuadrant(null);
                          openCreateTaskModal({
                            eisenhowerQuadrant: q.id,
                            priority: q.id === 'q1' ? 'high' : q.id === 'q2' ? 'medium' : q.id === 'q3' ? 'low' : 'none',
                          });
                        }}
                        className="text-[10px] text-blue-400 hover:underline font-bold"
                      >
                        More Options...
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAddingToQuadrant(null)}
                          className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Quadrant Tasks Container */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {qTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-600 select-none">
                      No Task
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Group 1: Today Tasks */}
                      {todayTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => toggleGroupCollapse(`${q.id}_today`)}
                            className="flex items-center gap-1 text-xs font-extrabold text-slate-200 hover:text-white cursor-pointer"
                          >
                            {collapsedGroups[`${q.id}_today`] ? (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>Today</span>
                            <span className="text-[11px] font-medium text-slate-500 ml-1">
                              {todayTasks.length}
                            </span>
                          </button>

                          {!collapsedGroups[`${q.id}_today`] && (
                            <div className="space-y-1.5 pl-1">
                              {[...todayTasks]
                                .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : 0))
                                .map((t) => (
                                <TaskMatrixRow
                                  key={t.id}
                                  task={t}
                                  isSelected={selectedTaskId === t.id}
                                  onSelect={() => setSelectedTaskId(t.id)}
                                  onToggleComplete={() => toggleTaskComplete(t.id)}
                                  customLists={customLists}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Group 2: Scheduled Tasks (Upcoming or Specific Date) */}
                      {scheduledTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => toggleGroupCollapse(`${q.id}_scheduled`)}
                            className="flex items-center gap-1 text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                          >
                            {collapsedGroups[`${q.id}_scheduled`] ? (
                              <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>Scheduled</span>
                            <span className="text-[11px] font-medium text-slate-500 ml-1">
                              {scheduledTasks.length}
                            </span>
                          </button>

                          {!collapsedGroups[`${q.id}_scheduled`] && (
                            <div className="space-y-1.5 pl-1">
                              {[...scheduledTasks]
                                .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : (a.dueDate || '').localeCompare(b.dueDate || '')))
                                .map((t) => (
                                <TaskMatrixRow
                                  key={t.id}
                                  task={t}
                                  isSelected={selectedTaskId === t.id}
                                  onSelect={() => setSelectedTaskId(t.id)}
                                  onToggleComplete={() => toggleTaskComplete(t.id)}
                                  customLists={customLists}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Group 3: No Date Tasks */}
                      {noDateTasks.length > 0 && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => toggleGroupCollapse(`${q.id}_nodate`)}
                            className="flex items-center gap-1 text-xs font-extrabold text-slate-200 hover:text-white cursor-pointer"
                          >
                            {collapsedGroups[`${q.id}_nodate`] ? (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>No Date</span>
                            <span className="text-[11px] font-medium text-slate-500 ml-1">
                              {noDateTasks.length}
                            </span>
                          </button>

                          {!collapsedGroups[`${q.id}_nodate`] && (
                            <div className="space-y-1.5 pl-1">
                              {[...noDateTasks]
                                .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : 0))
                                .map((t) => (
                                <TaskMatrixRow
                                  key={t.id}
                                  task={t}
                                  isSelected={selectedTaskId === t.id}
                                  onSelect={() => setSelectedTaskId(t.id)}
                                  onToggleComplete={() => toggleTaskComplete(t.id)}
                                  customLists={customLists}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Individual Matrix Task Item Row (Matches User Screenshot 100%)
const TaskMatrixRow: React.FC<{
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  customLists: any[];
}> = ({ task, isSelected, onSelect, onToggleComplete, customLists }) => {
  const listObj = customLists.find((l) => l.id === task.listId);

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
      onClick={onSelect}
      className={`group px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm hover:border-[#383840] ${
        isSelected
          ? 'bg-[#26262b] border-blue-500 ring-1 ring-blue-500/30'
          : 'bg-[#202024] border-[#2a2a2e]'
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      {/* Checkbox & Task Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="shrink-0 text-slate-400 hover:text-white cursor-pointer"
        >
          {task.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
          ) : (
            <Circle className="w-4 h-4 text-slate-400 hover:stroke-[2.5]" />
          )}
        </button>

        <span
          className={`text-xs font-medium truncate ${
            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Right List Badge, Date Badge & Note Indicator */}
      <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 font-medium">
        {task.dueDate && (
          <span className="flex items-center gap-1 text-[10px] text-slate-300 bg-[#161618] px-2 py-0.5 rounded-md border border-[#2e2e34]">
            <CalendarIcon className="w-3 h-3 text-blue-400" />
            <span>{task.dueDate}</span>
          </span>
        )}

        <div className="flex items-center gap-1 text-slate-400">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="truncate max-w-[80px]">
            {listObj ? listObj.name : 'Welcome'}
          </span>
        </div>

        {(task.description || task.subtasks.length > 0) && (
          <FileText className="w-3 h-3 text-slate-500" />
        )}
      </div>
    </div>
  );
};
