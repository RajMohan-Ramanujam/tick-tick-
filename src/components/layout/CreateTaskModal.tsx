import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDate, addDaysToDate, normalizeDateStr } from '../../utils/storage';
import { Priority, KanbanStatus } from '../../types';

export const CreateTaskModal: React.FC = () => {
  const {
    isCreateTaskModalOpen,
    createTaskModalDefaults,
    closeCreateTaskModal,
    tasks,
    addTask,
    addSubtask,
    activeListId,
    sections,
    addSection,
  } = useApp();

  const todayStr = getTodayDate();
  const tomorrowStr = addDaysToDate(todayStr, 1);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>(''); // '' = Main Task, or taskId
  const [selectedSectionId, setSelectedSectionId] = useState<string>('todo');
  const [isCreatingNewSection, setIsCreatingNewSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('none');

  // Subtasks Checklist Items (when creating as Main Task)
  const [subtaskItems, setSubtaskItems] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync defaults whenever modal opens
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isCreateTaskModalOpen && !prevIsOpenRef.current) {
      setTitle(createTaskModalDefaults.title || '');
      setSelectedParentId(createTaskModalDefaults.parentTaskId || '');
      setSelectedSectionId(
        createTaskModalDefaults.kanbanStatus || (sections.length > 0 ? sections[0].id : 'todo')
      );
      setIsCreatingNewSection(false);
      setNewSectionTitle('');
      setAssignedTo('');
      setAssignedBy('');
      setDueDate(createTaskModalDefaults.dueDate || todayStr);
      setDueTime(createTaskModalDefaults.dueTime || '');
      setPriority(createTaskModalDefaults.priority || 'none');
      setSubtaskItems([]);
      setNewSubtaskInput('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
    prevIsOpenRef.current = isCreateTaskModalOpen;
  }, [isCreateTaskModalOpen, createTaskModalDefaults, todayStr, sections]);

  // Only show tasks that strictly belong to the currently selected section!
  // If creating a brand new section or if the section has no tasks, sectionTasks is completely empty.
  const sectionTasks = useMemo(() => {
    if (!isCreateTaskModalOpen || isCreatingNewSection || !selectedSectionId) return [];
    const selectedSection = sections.find((s) => s.id === selectedSectionId);

    return tasks.filter((t) => {
      if (t.deleted || t.completed) return false;
      // 1. Direct ID match
      if (t.kanbanStatus === selectedSectionId) return true;
      // 2. Direct Section Title match
      if (selectedSection && t.kanbanStatus === selectedSection.title) return true;
      // 3. Strict 'todo' match ONLY if this section's ID is specifically 'todo'
      if (selectedSectionId === 'todo' && t.kanbanStatus === 'todo') return true;
      return false;
    });
  }, [isCreateTaskModalOpen, isCreatingNewSection, selectedSectionId, sections, tasks]);

  // If selected parent task is not in the active section, reset to Main Task
  useEffect(() => {
    if (isCreateTaskModalOpen && selectedParentId) {
      const stillValid = sectionTasks.some((t) => t.id === selectedParentId);
      if (!stillValid) setSelectedParentId('');
    }
  }, [isCreateTaskModalOpen, sectionTasks, selectedParentId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreateTaskModalOpen) {
        closeCreateTaskModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateTaskModalOpen, closeCreateTaskModal]);

  if (!isCreateTaskModalOpen) return null;

  const handleAddSubtaskItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setSubtaskItems([...subtaskItems, newSubtaskInput.trim()]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtaskItem = (index: number) => {
    setSubtaskItems(subtaskItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let targetSection = selectedSectionId;
    if (isCreatingNewSection) {
      const secName = newSectionTitle.trim() || 'New Section';
      const created = addSection(secName);
      targetSection = created.id;
    }

    // Case A: Adding as a Subtask to a selected previous/existing task
    if (selectedParentId) {
      addSubtask(selectedParentId, title.trim());
      subtaskItems.forEach((st) => {
        addSubtask(selectedParentId, st);
      });
    } else {
      // Case B: Creating as a New Main Task
      const formattedSubtasks = subtaskItems.map((st, i) => ({
        id: `st_${Date.now()}_${i}`,
        title: st,
        completed: false,
        subtasks: [],
      }));

      addTask({
        title: title.trim(),
        description: '',
        priority,
        dueDate: dueDate || null,
        dueTime: dueTime.trim() || null,
        assignedTo: assignedTo.trim() || undefined,
        assignedBy: assignedBy.trim() || undefined,
        assignedDate: dueDate || undefined,
        assignedTime: dueTime.trim() || undefined,
        subtasks: formattedSubtasks,
        kanbanStatus: targetSection as KanbanStatus,
        eisenhowerQuadrant:
          priority === 'high'
            ? 'q1'
            : priority === 'medium'
            ? 'q2'
            : priority === 'low'
            ? 'q3'
            : 'q4',
        listId: activeListId || 'welcome',
        tags: [],
      });
    }

    closeCreateTaskModal();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#18181c] border border-[#2c2c34] rounded-2xl shadow-2xl p-5 text-slate-200 text-xs flex flex-col max-h-[90vh] space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#26262e]">
          <h3 className="text-sm font-bold text-white tracking-tight m-0">
            {selectedParentId ? 'Add Subtask' : 'New Task'}
          </h3>
          <button
            type="button"
            onClick={closeCreateTaskModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 overflow-y-auto pr-1">
          {/* 1. Destination Section & Parent Task in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Section Dropdown (Existing / Previous Sections or New Section) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Section
              </label>
              <select
                value={isCreatingNewSection ? '__new__' : selectedSectionId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreatingNewSection(true);
                  } else {
                    setIsCreatingNewSection(false);
                    setSelectedSectionId(e.target.value);
                  }
                }}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
                <option value="__new__">+ New Section...</option>
              </select>

              {/* New Section Inline Creator */}
              {isCreatingNewSection && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="New section name..."
                    autoFocus
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#141418] text-white border border-blue-500/60 focus:outline-none placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSectionTitle.trim()) {
                        const created = addSection(newSectionTitle.trim());
                        setSelectedSectionId(created.id);
                        setNewSectionTitle('');
                        setIsCreatingNewSection(false);
                      }
                    }}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewSection(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Parent Task / Subtask Dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Task Type
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">Main Task</option>
                {sectionTasks.length > 0 && (
                  <optgroup label="Subtask of Existing Task:">
                    {sectionTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        ↳ {t.title}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* 2. Task Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {selectedParentId ? 'Subtask Title *' : 'Task Title *'}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedParentId ? 'Enter subtask title...' : 'Enter task title...'
              }
              required
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* 3. Professional Work Assignment (Assignee & Assigned By) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Assign to..."
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Assigned By
              </label>
              <input
                type="text"
                value={assignedBy}
                onChange={(e) => setAssignedBy(e.target.value)}
                placeholder="Assigned by (Manager / Lead)..."
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* 4. Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Due Date
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDueDate(todayStr)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      dueDate === todayStr
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDueDate(tomorrowStr)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      dueDate === tomorrowStr
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tmrw
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={normalizeDateStr(dueDate) || ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  Time (Optional)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
                        now.getMinutes()
                      ).padStart(2, '0')}`;
                      setDueTime(timeStr);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      dueTime
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Now
                  </button>
                  {dueTime && (
                    <button
                      type="button"
                      onClick={() => setDueTime('')}
                      className="px-1 py-0.5 rounded text-[10px] text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear time"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Priority Segmented Control */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: 'none', label: 'None', activeClass: 'border-slate-500 bg-slate-500/10 text-white' },
                  { key: 'low', label: 'Low', activeClass: 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold' },
                  { key: 'medium', label: 'Medium', activeClass: 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold' },
                  { key: 'high', label: 'High', activeClass: 'border-red-500 bg-red-500/10 text-red-400 font-bold' },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPriority(item.key)}
                  className={`py-2 rounded-xl border text-xs transition-all cursor-pointer ${
                    priority === item.key
                      ? item.activeClass
                      : 'border-[#2c2c34] bg-[#121214] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Subtasks Checklist (when creating Main Task) */}
          {!selectedParentId && (
            <div className="space-y-2 pt-2 border-t border-[#26262e]">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Subtasks (Optional)
              </label>

              {subtaskItems.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
                  {subtaskItems.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#141418] border border-[#282830] text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{st}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtaskItem(idx)}
                        className="text-slate-500 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtaskItem();
                    }
                  }}
                  placeholder="Add a subtask... (Press Enter)"
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#121214] text-white border border-[#2c2c34] focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubtaskItem()}
                  className="px-3.5 py-2 rounded-xl bg-[#222228] hover:bg-[#2c2c34] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#26262e]">
            <button
              type="button"
              onClick={closeCreateTaskModal}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer text-xs"
            >
              {selectedParentId ? 'Add Subtask' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
