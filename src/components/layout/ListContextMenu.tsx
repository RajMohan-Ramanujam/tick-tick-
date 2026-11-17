import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

interface ListContextMenuProps {
  listId: string;
  x: number;
  y: number;
  onClose: () => void;
  onEditList?: (listId: string) => void;
}

export const ListContextMenu: React.FC<ListContextMenuProps> = ({
  listId,
  x,
  y,
  onClose,
  onEditList,
}) => {
  const {
    customLists,
    reorderCustomLists,
    deleteCustomList,
    tasks,
    addTask,
    setActiveListId,
    setViewMode,
  } = useApp();

  const menuRef = useRef<HTMLDivElement>(null);

  const list = customLists.find((l) => l.id === listId);

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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust menu position so it doesn't overflow screen bounds
  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - 280);

  // Actions
  const handleEdit = () => {
    onClose();
    if (onEditList) {
      onEditList(listId);
    }
  };

  const handlePin = () => {
    onClose();
    if (!list) return;
    const fromIdx = customLists.findIndex((l) => l.id === listId);
    if (fromIdx > 0) {
      const updated = [...customLists];
      const [moved] = updated.splice(fromIdx, 1);
      updated.unshift(moved);
      reorderCustomLists(updated);
    }
  };

  const handleDuplicate = () => {
    onClose();
    if (!list) return;
    const newListId = `list-${Date.now()}`;
    const newList = {
      ...list,
      id: newListId,
      name: `${list.name} (Copy)`,
    };
    reorderCustomLists([...customLists, newList]);

    // Copy associated tasks
    const listTasks = tasks.filter((t) => t.listId === listId);
    listTasks.forEach((t) => {
      addTask({
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate,
        listId: newListId,
        tags: t.tags,
      });
    });
  };

  const handleShare = () => {
    onClose();
    navigator.clipboard.writeText(window.location.href);
    alert('List share link copied to clipboard!');
  };

  const handleOpenNewWindow = () => {
    onClose();
    window.open(window.location.href, '_blank', 'width=1000,height=700');
  };

  const handleArchive = () => {
    onClose();
    if (!list) return;
    if (confirm(`Archive list "${list.name}"?`)) {
      deleteCustomList(listId);
    }
  };

  const handleDelete = () => {
    onClose();
    if (!list) return;
    if (confirm(`Delete list "${list.name}" permanently?`)) {
      deleteCustomList(listId);
      setActiveListId('welcome');
      setViewMode('kanban');
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 bg-[#242428] border border-[#36363e] rounded-2xl shadow-2xl py-2 px-1 min-w-[175px] backdrop-blur-md select-none text-slate-200 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex flex-col space-y-0.5">
        <button
          onClick={handleEdit}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Edit
        </button>

        <button
          onClick={handlePin}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Pin
        </button>

        <button
          onClick={handleDuplicate}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Duplicate
        </button>

        <button
          onClick={handleShare}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Share
        </button>

        <button
          onClick={handleOpenNewWindow}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Open in new window
        </button>

        <button
          onClick={handleArchive}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#323238] rounded-xl transition-colors text-slate-200 cursor-pointer"
        >
          Archive
        </button>

        <div className="border-t border-[#34343a] my-1" />

        <button
          onClick={handleDelete}
          className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-red-500/20 text-red-400 rounded-xl transition-colors cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
