import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Pin,
  Copy,
  Trash2,
  FileEdit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TaskContextMenuProps {
  taskId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export const TaskContextMenu: React.FC<TaskContextMenuProps> = ({ taskId, x, y, onClose }) => {
  const {
    tasks,
    deleteTask,
    toggleTaskPin,
    setSelectedTaskId,
    addTask,
  } = useApp();

  const menuRef = useRef<HTMLDivElement>(null);
  const task = tasks.find((t) => t.id === taskId);

  // Close context menu on outside click or Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!task) return null;

  const handleDuplicate = () => {
    addTask({
      title: `${task.title} (Copy)`,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      listId: task.listId,
      tags: task.tags,
      kanbanStatus: task.kanbanStatus,
      assignedTo: task.assignedTo,
      assignedBy: task.assignedBy,
      assignedDate: task.assignedDate,
      assignedTime: task.assignedTime,
    });
    onClose();
  };

  // Adjust menu position so it stays on screen directly at (x, y)
  const menuWidth = 190;
  const menuHeight = 170;
  const adjustedX = Math.min(Math.max(10, x), window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(Math.max(10, y), window.innerHeight - menuHeight - 10);

  return createPortal(
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-[9999] w-[190px] bg-[#1e1e24] border border-[#2e2e38] rounded-2xl shadow-2xl p-1.5 text-slate-200 text-xs font-medium select-none space-y-1 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* View / Edit Details */}
      <button
        type="button"
        onClick={() => {
          setSelectedTaskId(taskId);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#282832] hover:text-white transition-colors cursor-pointer text-slate-300"
      >
        <FileEdit className="w-4 h-4 text-blue-400" />
        <span>Edit Details</span>
      </button>

      {/* Pin / Unpin Task */}
      <button
        type="button"
        onClick={() => {
          toggleTaskPin(taskId);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#282832] hover:text-white transition-colors cursor-pointer text-slate-300"
      >
        <Pin className={`w-4 h-4 ${task.pinned ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
        <span>{task.pinned ? 'Unpin Task' : 'Pin to Top'}</span>
      </button>

      {/* Duplicate Task */}
      <button
        type="button"
        onClick={handleDuplicate}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#282832] hover:text-white transition-colors cursor-pointer text-slate-300"
      >
        <Copy className="w-4 h-4 text-slate-400" />
        <span>Duplicate Task</span>
      </button>

      <div className="h-[1px] bg-[#2a2a34] my-1" />

      {/* Delete Task */}
      <button
        type="button"
        onClick={() => {
          deleteTask(taskId);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer font-bold"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
        <span>Delete Task</span>
      </button>
    </div>,
    document.body
  );
};
