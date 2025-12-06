import { useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";

export function useKeyboardShortcuts() {
  const setTransformMode = useWorkspaceStore((state) => state.setTransformMode);
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const removeObject = useWorkspaceStore((state) => state.removeObject);
  const undo = useWorkspaceStore((state) => state.undo);
  const redo = useWorkspaceStore((state) => state.redo);
  const canUndo = useWorkspaceStore((state) => state.canUndo);
  const canRedo = useWorkspaceStore((state) => state.canRedo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo/Redo
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" || event.key === "Z") {
          event.preventDefault();
          if (event.shiftKey) {
            if (canRedo()) redo();
          } else {
            if (canUndo()) undo();
          }
          return;
        } else if (event.key === "y" || event.key === "Y") {
          event.preventDefault();
          if (canRedo()) redo();
          return;
        }
      }

      // Transform modes
      if (event.key === "g" || event.key === "G") {
        setTransformMode("translate");
      } else if (event.key === "r" || event.key === "R") {
        setTransformMode("rotate");
      } else if (event.key === "s" || event.key === "S") {
        setTransformMode("scale");
      }

      // Delete selected object
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        removeObject(selectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setTransformMode, selectedId, removeObject, undo, redo, canUndo, canRedo]);
}
