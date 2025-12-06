import { useEffect, useRef } from 'react';
import { ArrowLeft, Trash2, Copy } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';

interface ContextMenuProps {
  objectId: string | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export default function ContextMenu({ objectId, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const removeObject = useWorkspaceStore((state) => state.removeObject);
  const duplicateObject = useWorkspaceStore((state) => state.duplicateObject);
  const updateObject = useWorkspaceStore((state) => state.updateObject);
  const objects = useWorkspaceStore((state) => state.objects);

  const object = objects.find((o) => o.id === objectId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!objectId || !position || !object) return null;

  const handleSendToBackWall = () => {
    updateObject(objectId, {
      position: [object.position[0], object.position[1], -4],
    });
    onClose();
  };

  const handleDelete = () => {
    removeObject(objectId);
    onClose();
  };

  const handleDuplicate = () => {
    duplicateObject(objectId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-800 z-[200] min-w-[180px] py-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={handleSendToBackWall}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Send to Back Wall
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <div className="border-t border-gray-800 my-1" />
      <button
        onClick={handleDelete}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}

