import React, { useState, useEffect } from 'react';

const KANBAN_SECTIONS_STORAGE_KEY = 'ticktick_kanban_sections_v2';
const KANBAN_COLLAPSED_STORAGE_KEY = 'ticktick_kanban_collapsed_v2';
import {
  Plus,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  Circle,
  X,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Minimize2,
  Maximize2,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  UserCheck,
  Pin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { KanbanStatus, Task } from '../../types';
import { getTodayDate, addDaysToDate, normalizeDateStr } from '../../utils/storage';
import { TaskContextMenu } from './TaskContextMenu';

interface Section {
  id: string;
  title: string;
}

export const TaskKanban: React.FC = () => {
  const {
    tasks,
    updateTask,
    toggleTaskComplete,
    toggleSubtask,
    addNestedSubtask,
    setSelectedTaskId,
    selectedTaskId,
    addTask,
    activeListId,
    smartView,
    searchQuery,
    openCreateTaskModal,
    sections,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
  } = useApp();

  const [contextMenu, setContextMenu] = useState<{ taskId: string; x: number; y: number } | null>(null);
  const [collapsedTaskIds, setCollapsedTaskIds] = useState<Record<string, boolean>>({});
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(KANBAN_COLLAPSED_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {}
    }
    return {};
  });
  const [addingSubtaskParentId, setAddingSubtaskParentId] = useState<string | null>(null);
  const [nestedTitle, setNestedTitle] = useState('');

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, a, select, option, label, [draggable="true"]')) return;

    if (scrollContainerRef.current) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: scrollContainerRef.current.scrollLeft,
        scrollTop: scrollContainerRef.current.scrollTop,
      });
    }
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (!isPanning || !scrollContainerRef.current) return;
    e.preventDefault();
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    scrollContainerRef.current.scrollLeft = panStart.scrollLeft - dx;
    scrollContainerRef.current.scrollTop = panStart.scrollTop - dy;
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
  };

  const toggleTaskCollapse = (id: string) => {
    setCollapsedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSectionCollapse = (id: string) => {
    setCollapsedSectionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    localStorage.setItem(KANBAN_COLLAPSED_STORAGE_KEY, JSON.stringify(collapsedSectionIds));
  }, [collapsedSectionIds]);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetColId, setDropTargetColId] = useState<string | null>(null);
  const [addingToColId, setAddingToColId] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState<string>('');

  // Section Creation State
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [sectionMenuOpenId, setSectionMenuOpenId] = useState<string | null>(null);

  const todayStr = getTodayDate();
  const yesterdayStr = addDaysToDate(todayStr, -1);
  const next7Str = addDaysToDate(todayStr, 7);

  // Master Task Filter for Sidebar Navigation & Search
  const filteredTasks = tasks.filter((task) => {
    // 1. Search Query Filter
    if (searchQuery && searchQuery.trim()) {
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

    // Hide deleted tasks for all normal views
    if (task.deleted) return false;

    // 3. Completed View
    if (smartView === 'completed') {
      return task.completed;
    }

    // 4. Custom or Specific List Selected (e.g., 'welcome', 'work', 'personal', 'fitness', 'shopping', 'inbox')
    if (activeListId) {
      if (activeListId === 'welcome') {
        return task.listId === 'welcome' || task.listId === 'inbox' || !task.listId;
      }
      return task.listId === activeListId;
    }

    // 5. Smart Views
    if (smartView === 'inbox') {
      return task.listId === 'inbox';
    }
    const taskDue = normalizeDateStr(task.dueDate);
    if (smartView === 'today') {
      return taskDue === todayStr;
    }
    if (smartView === 'yesterday') {
      return taskDue === yesterdayStr;
    }
    if (smartView === 'old_tasks') {
      return taskDue ? taskDue < yesterdayStr : (task.createdAt && task.createdAt.split('T')[0] < yesterdayStr);
    }
    if (smartView === 'next7') {
      return taskDue && taskDue >= todayStr && taskDue <= next7Str;
    }
    if (smartView === 'high_priority') {
      return task.priority === 'high';
    }

    // Default 'All' View: Show all non-deleted, non-completed tasks
    return true;
  });

  // Drag and Drop Event Handlers
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.setData('text/section', sectionId);
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedSectionId && draggedSectionId !== sectionId) {
      setDragOverSectionId(sectionId);
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const sourceSecId = e.dataTransfer.getData('text/section') || draggedSectionId;
    if (sourceSecId && sourceSecId !== targetSectionId) {
      const fromIdx = sections.findIndex((s) => s.id === sourceSecId);
      const toIdx = sections.findIndex((s) => s.id === targetSectionId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const updated = [...sections];
        const [movedSec] = updated.splice(fromIdx, 1);
        updated.splice(toIdx, 0, movedSec);
        reorderSections(updated);
      }
    }
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dropTargetColId !== colId) {
      setDropTargetColId(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatusId: string) => {
    e.preventDefault();
    if (draggedSectionId) {
      handleSectionDrop(e, targetStatusId);
      return;
    }
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTask(taskId, { kanbanStatus: targetStatusId as KanbanStatus });
    }
    setDraggedTaskId(null);
    setDropTargetColId(null);
  };

  const handleQuickAdd = (e: React.FormEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: '',
      priority: 'none',
      dueDate: smartView === 'yesterday' ? yesterdayStr : smartView === 'old_tasks' ? addDaysToDate(yesterdayStr, -1) : todayStr,
      listId: activeListId || 'welcome',
      tags: [],
      kanbanStatus: targetSectionId as KanbanStatus,
    });

    setQuickTitle('');
    setAddingToColId(null);
  };

  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;

    addSection(newSectionTitle.trim());
    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) {
      alert('Cannot delete the last section.');
      return;
    }
    deleteSection(id);
    setSectionMenuOpenId(null);
  };

  const handleRenameSection = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    const newName = prompt('Rename Section:', section.title);
    if (newName && newName.trim()) {
      updateSection(id, newName.trim());
    }
    setSectionMenuOpenId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181a] overflow-hidden select-none text-slate-200">
      {/* Main Kanban Columns Grid (Drag-to-Scroll / Pan Enabled) */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDownPan}
        onMouseMove={handleMouseMovePan}
        onMouseUp={handleMouseUpPan}
        onMouseLeave={handleMouseUpPan}
        className={`flex-1 p-6 overflow-x-auto ${
          isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        <div className="flex items-start gap-5 h-full min-w-max">
          {sections.map((col, colIdx) => {
            const colTasks = filteredTasks.filter((t) => {
              if (smartView === 'completed') {
                return (
                  t.kanbanStatus === col.id ||
                  (col.title && t.kanbanStatus === col.title) ||
                  (col.id === 'done' && t.completed) ||
                  (colIdx === 0 && !t.kanbanStatus)
                );
              }
              if (t.kanbanStatus === col.id) return true;
              if (col.title && t.kanbanStatus === col.title) return true;
              if (col.id === 'todo' && (!t.kanbanStatus || t.kanbanStatus === 'todo')) return true;
              if (
                colIdx === 0 &&
                (!t.kanbanStatus ||
                  !sections.some((s) => s.id === t.kanbanStatus || s.title === t.kanbanStatus))
              )
                return true;
              return false;
            });

            // Pinned tasks go to the top, active tasks in middle, completed tasks at the bottom
            const sortedColTasks = [...colTasks].sort((a, b) => {
              // 1. Completed tasks always go to the bottom
              if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
              }
              // 2. Pinned tasks go to the very top
              if (a.pinned !== b.pinned) {
                return a.pinned ? -1 : 1;
              }
              return 0;
            });
            const isDropTarget = dropTargetColId === col.id;
            const isSectionCollapsed = collapsedSectionIds[col.id];

            // Trello-style Minimized Column Strip View (Fits Text Size / Character Length)
            if (isSectionCollapsed) {
              return (
                <div
                  key={col.id}
                  draggable
                  onDragStart={(e) => handleSectionDragStart(e, col.id)}
                  onClick={() => toggleSectionCollapse(col.id)}
                  onDragOver={(e) => {
                    handleDragOver(e, col.id);
                    handleSectionDragOver(e, col.id);
                  }}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`w-12 h-fit bg-[#1b1b1e] border border-[#2c2c32] rounded-2xl flex flex-col items-center py-3.5 px-1 gap-3 justify-start cursor-grab active:cursor-grabbing hover:bg-[#222226] hover:border-blue-500/40 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] animate-in fade-in zoom-in-95 shrink-0 shadow-md hover:shadow-xl relative group ${
                    draggedSectionId === col.id ? 'opacity-40 scale-90 border-dashed border-blue-500/60' : ''
                  } ${
                    dragOverSectionId === col.id ? 'ring-2 ring-amber-500/80 bg-[#25252a] scale-105 translate-x-1' : ''
                  } ${isDropTarget ? 'ring-2 ring-blue-500/50 bg-[#1d1d22]' : ''}`}
                  title={`Drag to reorder section or Click to Expand ${col.title}`}
                >
                  {/* Top Expand Chevrons */}
                  <div className="p-1 rounded-lg text-slate-400 group-hover:text-blue-400 bg-[#242428] shadow-sm transition-colors duration-200 shrink-0">
                    <ChevronsRight className="w-4 h-4" />
                  </div>

                  {/* Vertical Section Title - Sized to Text Length */}
                  <div className="flex items-center justify-center py-1">
                    <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-extrabold tracking-wider text-slate-300 group-hover:text-white transition-colors duration-200 whitespace-nowrap">
                      {col.title}
                    </span>
                  </div>

                  {/* Task Count Badge */}
                  <div className="w-6 h-6 rounded-full bg-[#242428] text-blue-400 border border-[#35353c] text-[10px] font-bold flex items-center justify-center shadow-inner shrink-0">
                    {colTasks.length}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  handleDragOver(e, col.id);
                  handleSectionDragOver(e, col.id);
                }}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-80 h-full flex flex-col rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] animate-in fade-in zoom-in-95 shrink-0 relative ${
                  draggedSectionId === col.id ? 'opacity-40 scale-95 border-2 border-dashed border-blue-500/60' : ''
                } ${
                  dragOverSectionId === col.id ? 'ring-2 ring-amber-500/80 bg-[#222228] scale-[1.02] translate-x-1.5 shadow-2xl' : ''
                } ${isDropTarget ? 'ring-2 ring-blue-500/50 bg-[#1d1d22]' : ''}`}
              >
                {/* Section Header Bar - Draggable Section Handle */}
                <div
                  draggable
                  onDragStart={(e) => handleSectionDragStart(e, col.id)}
                  className="flex items-center justify-between py-2 px-1 mb-3 relative cursor-grab active:cursor-grabbing hover:bg-[#202024] rounded-xl p-1 transition-colors group/header"
                  title="Drag header to reorder section column"
                >
                  <div className="flex items-center gap-1.5">
                    <GripVertical className="w-4 h-4 text-slate-600 group-hover/header:text-slate-300 transition-colors shrink-0" />
                    <button
                      type="button"
                      onClick={() => toggleSectionCollapse(col.id)}
                      className="flex items-center gap-2 text-left group/title cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click topic title to minimize section"
                    >
                      <h3 className="text-sm font-extrabold text-white tracking-tight group-hover/title:text-blue-400 transition-colors">
                        {col.title}
                      </h3>
                      <span className="text-xs font-bold text-slate-400 bg-[#222226] px-2 py-0.5 rounded-full border border-[#2e2e34]">
                        {colTasks.length}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => toggleSectionCollapse(col.id)}
                      className="p-1 rounded hover:text-white hover:bg-[#26262a] transition-colors cursor-pointer"
                      title="Minimize Section (Collapse)"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openCreateTaskModal({ kanbanStatus: col.id as KanbanStatus })}
                      className="p-1 rounded hover:text-white hover:bg-[#26262a] transition-colors cursor-pointer"
                      title="Add task with options"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setSectionMenuOpenId(sectionMenuOpenId === col.id ? null : col.id)
                      }
                      className="p-1 rounded hover:text-white hover:bg-[#26262a] transition-colors cursor-pointer"
                      title="Section Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section Options Dropdown Menu */}
                  {sectionMenuOpenId === col.id && (
                    <div className="absolute right-0 top-9 z-30 w-44 bg-[#242428] border border-[#303036] rounded-xl shadow-2xl p-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => handleRenameSection(col.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#2e2e34] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Rename Section</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSection(col.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete Section</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Add Inline Animated Input Form */}
                {addingToColId === col.id && (
                  <form
                    onSubmit={(e) => handleQuickAdd(e, col.id)}
                    className="p-3 mb-3 rounded-2xl bg-[#242428] border border-blue-500/40 shadow-xl animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
                  >
                    <input
                      type="text"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="Task name... (Press Enter)"
                      autoFocus
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#161618] text-white border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAddingToColId(null);
                          openCreateTaskModal({ kanbanStatus: col.id as KanbanStatus });
                        }}
                        className="text-xs text-blue-400 hover:underline font-bold"
                      >
                        More Options...
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingToColId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {sortedColTasks.map((task) => {
                    const isSelected = selectedTaskId === task.id;
                    const isCollapsed = collapsedTaskIds[task.id];
                    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setContextMenu({ taskId: task.id, x: e.clientX, y: e.clientY });
                        }}
                        className={`group p-3.5 rounded-2xl bg-[#242428] border transition-all duration-200 ease-out cursor-pointer shadow-sm hover:border-[#42424b] hover:-translate-y-0.5 hover:shadow-lg ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40 bg-[#28282d]'
                            : task.pinned
                            ? 'border-amber-500/40 bg-[#262529]'
                            : 'border-[#2d2d32]'
                        } ${task.completed ? 'opacity-60 bg-[#1e1e22]' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Collapsible Chevron Arrow v / > */}
                          {hasSubtasks ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskCollapse(task.id);
                              }}
                              className="mt-0.5 text-slate-500 hover:text-white transition-transform duration-200 cursor-pointer shrink-0"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <div className="w-3.5 shrink-0" />
                          )}

                          {/* Main Round Tick Box */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task.id);
                            }}
                            className="mt-0.5 shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 hover:stroke-[2.5]" />
                            )}
                          </button>

                          {/* Task Title with Pin Symbol */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-1.5">
                              {task.pinned && (
                                <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mt-0.5 shrink-0" />
                              )}
                              <h4
                                className={`text-xs font-semibold leading-relaxed break-words flex-1 ${
                                  task.completed ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {task.title}
                              </h4>
                            </div>

                            {/* Note Icon Indicator */}
                            {task.description && (
                              <div className="mt-1 text-slate-500">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                            )}

                            {/* Work Assigned To Pill */}
                            {(task.assignedTo || task.assignedBy) && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 w-fit">
                                <UserCheck className="w-3 h-3 shrink-0" />
                                {task.assignedTo && (
                                  <span className="font-bold text-white">To: {task.assignedTo}</span>
                                )}
                                {task.assignedBy && (
                                  <span className="text-slate-300">By: {task.assignedBy}</span>
                                )}
                                {task.assignedDate && (
                                  <span className="text-slate-400 font-mono">({task.assignedDate}{task.assignedTime ? ` @ ${task.assignedTime}` : ''})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Subtasks Tree Rendered Inside Main Task Card */}
                        {!isCollapsed && hasSubtasks && (
                          <div className="mt-2.5 pl-6 border-l border-[#34343a] space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                             {[...task.subtasks]
                              .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : 0))
                              .map((st) => (
                              <div key={st.id} className="space-y-1.5">
                                <div className="flex items-center justify-between group/sub">
                                  <div className="flex items-center gap-2 text-xs flex-1">
                                    {st.subtasks && st.subtasks.length > 0 ? (
                                      <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
                                    ) : (
                                      <div className="w-3 shrink-0" />
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubtask(task.id, st.id);
                                      }}
                                      className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                    >
                                      {st.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                    </button>
                                    <span
                                      className={`text-xs font-semibold ${
                                        st.completed ? 'line-through text-slate-400 opacity-60' : 'text-slate-200'
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                  </div>

                                  {/* Add Nested Child Subtask Button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAddingSubtaskParentId(
                                        addingSubtaskParentId === st.id ? null : st.id
                                      );
                                    }}
                                    className="p-0.5 rounded text-slate-400 hover:text-white transition-opacity cursor-pointer"
                                    title="Add Subtask inside this Subtask"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Inline Form to Add Subtask inside Subtask */}
                                {addingSubtaskParentId === st.id && (
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      if (!nestedTitle.trim()) return;
                                      addNestedSubtask(task.id, st.id, nestedTitle);
                                      setNestedTitle('');
                                      setAddingSubtaskParentId(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="pl-5 py-1 flex items-center gap-1.5 animate-in fade-in zoom-in-95"
                                  >
                                    <input
                                      type="text"
                                      value={nestedTitle}
                                      onChange={(e) => setNestedTitle(e.target.value)}
                                      placeholder="Child subtask title..."
                                      autoFocus
                                      className="text-[11px] px-2 py-1 rounded-lg bg-[#18181c] text-white border border-[#33333a] focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
                                    />
                                    <button
                                      type="submit"
                                      className="px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm"
                                    >
                                      Add
                                    </button>
                                  </form>
                                )}

                                {/* Nested Level 2 Subtasks */}
                                {st.subtasks && st.subtasks.length > 0 && (
                                  <div className="pl-6 space-y-1.5">
                                    {[...st.subtasks]
                                      .sort((a, b) => (a.completed !== b.completed ? (a.completed ? 1 : -1) : 0))
                                      .map((childSt) => (
                                      <div key={childSt.id} className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleSubtask(task.id, childSt.id);
                                            }}
                                            className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                                          >
                                            {childSt.completed ? (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                              <Circle className="w-3.5 h-3.5 text-slate-400" />
                                            )}
                                          </button>
                                          <span
                                            className={`text-xs font-medium ${
                                              childSt.completed
                                                ? 'line-through text-slate-400 opacity-60'
                                                : 'text-slate-300'
                                            }`}
                                          >
                                            {childSt.title}
                                          </span>
                                        </div>

                                        <div className="pl-5 text-slate-500">
                                          <FileText className="w-3 h-3" />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Sleek Animated Section Creation Form / Button */}
          {isAddingSection ? (
            <form
              onSubmit={handleAddSectionSubmit}
              className="w-80 p-4 rounded-2xl bg-[#242428] border border-blue-500/50 shadow-2xl space-y-3 shrink-0 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white m-0">Add New Section</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Section Title... (e.g. Work Section)"
                autoFocus
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#161618] text-white border border-[#303036] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSectionTitle('');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Section
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-2 shrink-0">
              <button
                onClick={() => setIsAddingSection(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-500 hover:text-blue-400 hover:bg-[#222226] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Right-Click Context Menu */}
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
