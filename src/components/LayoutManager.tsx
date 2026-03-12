import { useState, useRef } from 'react';
import { Save, FolderOpen, Trash2, Upload, X, Download, Sparkles } from 'lucide-react';
import { useWorkspaceStore, SavedLayout, WorkspaceObject, LayoutSnapshot } from '@/store/workspaceStore';
import { useModalStore } from '@/store/modalStore';

const minimalPreset: WorkspaceObject[] = [
  { id: 'preset-desk', type: 'desk', name: 'Desk', position: [0, 0, 0], rotation: [0, 0, 0], scale: [2, 0.05, 1], color: '#8B4513' },
  { id: 'preset-monitor', type: 'monitor', name: 'Monitor', position: [0, 0.78, 0], rotation: [0, 0, 0], scale: [0.8, 0.5, 0.05], color: '#1a1a2e' },
  { id: 'preset-keyboard', type: 'keyboard', name: 'Keyboard', position: [0, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.5, 0.03, 0.18], color: '#404040' },
  { id: 'preset-mouse', type: 'mouse', name: 'Mouse', position: [0.3, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.08, 0.03, 0.12], color: '#303030' },
  { id: 'preset-chair', type: 'chair', name: 'Chair', position: [0, 0.3, 1.5], rotation: [0, Math.PI, 0], scale: [0.6, 1.2, 0.6], color: '#1a1a1a' },
];

const gamingPreset: WorkspaceObject[] = [
  { id: 'g-desk', type: 'desk', name: 'Desk', position: [0, 0, 0], rotation: [0, 0, 0], scale: [2.5, 0.05, 1.2], color: '#8B4513' },
  { id: 'g-monitor-1', type: 'monitor', name: 'Monitor', position: [-0.4, 0.78, 0], rotation: [0, 0, 0], scale: [0.8, 0.5, 0.05], color: '#1a1a2e' },
  { id: 'g-monitor-2', type: 'monitor', name: 'Monitor', position: [0.4, 0.78, 0], rotation: [0, 0, 0], scale: [0.8, 0.5, 0.05], color: '#1a1a2e' },
  { id: 'g-pc', type: 'pc-tower', name: 'PC Tower', position: [-1.2, 0.225, 0], rotation: [0, Math.PI / 4, 0], scale: [0.3, 0.6, 0.5], color: '#2d2d2d' },
  { id: 'g-keyboard', type: 'keyboard', name: 'Keyboard', position: [0, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.5, 0.03, 0.18], color: '#404040' },
  { id: 'g-mouse', type: 'mouse', name: 'Mouse', position: [0.3, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.08, 0.03, 0.12], color: '#303030' },
  { id: 'g-headphones', type: 'headphones', name: 'Headphones', position: [0.6, 0.78, -0.3], rotation: [0, Math.PI / 2, 0], scale: [0.25, 0.25, 0.1], color: '#1a1a1a' },
  { id: 'g-speaker-1', type: 'speaker', name: 'Speaker', position: [-0.6, 0.78, -0.3], rotation: [0, -Math.PI / 2, 0], scale: [0.2, 0.35, 0.2], color: '#333333' },
  { id: 'g-speaker-2', type: 'speaker', name: 'Speaker', position: [0.6, 0.78, -0.3], rotation: [0, Math.PI / 2, 0], scale: [0.2, 0.35, 0.2], color: '#333333' },
  { id: 'g-chair', type: 'chair', name: 'Chair', position: [0, 0.3, 1.5], rotation: [0, Math.PI, 0], scale: [0.6, 1.2, 0.6], color: '#1a1a1a' },
];

const productivityPreset: WorkspaceObject[] = [
  { id: 'p-desk', type: 'desk', name: 'Desk', position: [0, 0, 0], rotation: [0, 0, 0], scale: [2, 0.05, 1], color: '#8B4513' },
  { id: 'p-monitor', type: 'monitor', name: 'Monitor', position: [0, 0.78, 0], rotation: [0, 0, 0], scale: [0.8, 0.5, 0.05], color: '#1a1a2e' },
  { id: 'p-stand', type: 'monitor-stand', name: 'Monitor Stand', position: [0, 0.78, 0], rotation: [0, 0, 0], scale: [0.6, 0.1, 0.3], color: '#2d2d2d' },
  { id: 'p-keyboard', type: 'keyboard', name: 'Keyboard', position: [0, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.5, 0.03, 0.18], color: '#404040' },
  { id: 'p-mouse', type: 'mouse', name: 'Mouse', position: [0.3, 0.78, 0.5], rotation: [0, 0, 0], scale: [0.08, 0.03, 0.12], color: '#303030' },
  { id: 'p-lamp', type: 'lamp', name: 'Lamp', position: [-0.6, 0.78, 0.3], rotation: [0, Math.PI / 4, 0], scale: [0.15, 0.4, 0.15], color: '#f4d03f' },
  { id: 'p-plant', type: 'plant', name: 'Plant', position: [0.6, 0.78, -0.3], rotation: [0, 0, 0], scale: [0.2, 0.35, 0.2], color: '#228B22' },
  { id: 'p-chair', type: 'chair', name: 'Chair', position: [0, 0.3, 1.5], rotation: [0, Math.PI, 0], scale: [0.6, 1.2, 0.6], color: '#1a1a1a' },
];

export default function LayoutManager() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('layoutManager'));
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objects = useWorkspaceStore((state) => state.objects);
  const saveLayout = useWorkspaceStore((state) => state.saveLayout);
  const loadLayout = useWorkspaceStore((state) => state.loadLayout);
  const deleteLayout = useWorkspaceStore((state) => state.deleteLayout);
  const getSavedLayouts = useWorkspaceStore((state) => state.getSavedLayouts);
  const importLayout = useWorkspaceStore((state) => state.importLayout);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);
  const snapshots = useWorkspaceStore((state) => state.snapshots);
  const saveSnapshot = useWorkspaceStore((state) => state.saveSnapshot);
  const deleteSnapshot = useWorkspaceStore((state) => state.deleteSnapshot);
  const restoreSnapshot = useWorkspaceStore((state) => state.restoreSnapshot);

  const savedLayouts = getSavedLayouts();

  const handleSave = async () => {
    if (saveName.trim()) {
      await saveLayout(saveName.trim());
      setSaveName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoad = (layout: SavedLayout) => {
    if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
      return;
    }
    loadLayout(layout.id);
    closeModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this layout?')) {
      deleteLayout(id);
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
              return;
            }
            importLayout(json);
            closeModal();
          } else {
            alert('Invalid JSON format. Expected an array of objects.');
          }
        } catch (error) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportCurrent = () => {
    const data = JSON.stringify(objects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveSnapshot = () => {
    const defaultName = `Snapshot ${new Date().toLocaleTimeString()}`;
    saveSnapshot(defaultName);
  };

  return (
    <>
      <button
        onClick={() => openModal('layoutManager')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Manage Layouts"
      >
        <FolderOpen className="w-4 h-4" />
        Layouts
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => closeModal()}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                Layout Manager
              </h2>
              <button
                onClick={() => closeModal()}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowNewDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  New Layout
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Current
                </button>
                <button
                  onClick={handleImportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import JSON
                </button>
                <button
                  onClick={handleExportCurrent}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Current
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Save Dialog */}
              {showSaveDialog && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <input
                    type="text"
                    placeholder="Layout name..."
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') {
                        setShowSaveDialog(false);
                        setSaveName('');
                      }
                    }}
                    autoFocus
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm text-white mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setSaveName('');
                      }}
                      className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* New Layout Presets */}
              {showNewDialog && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-medium text-white mb-3">Start a new layout</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => {
                        if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
                          return;
                        }
                        importLayout(minimalPreset.map(o => ({ ...o, id: crypto.randomUUID() })));
                        setShowNewDialog(false);
                        closeModal();
                      }}
                      className="p-3 rounded-lg bg-gray-900 hover:bg-gray-700 border border-gray-700 text-left text-xs text-gray-200"
                    >
                      <div className="font-semibold mb-1">Minimal</div>
                      <div className="text-gray-500">Clean single-monitor desk</div>
                    </button>
                    <button
                      onClick={() => {
                        if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
                          return;
                        }
                        importLayout(gamingPreset.map(o => ({ ...o, id: crypto.randomUUID() })));
                        setShowNewDialog(false);
                        closeModal();
                      }}
                      className="p-3 rounded-lg bg-gray-900 hover:bg-gray-700 border border-gray-700 text-left text-xs text-gray-200"
                    >
                      <div className="font-semibold mb-1">Gaming</div>
                      <div className="text-gray-500">Dual monitors, PC tower, audio</div>
                    </button>
                    <button
                      onClick={() => {
                        if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
                          return;
                        }
                        importLayout(productivityPreset.map(o => ({ ...o, id: crypto.randomUUID() })));
                        setShowNewDialog(false);
                        closeModal();
                      }}
                      className="p-3 rounded-lg bg-gray-900 hover:bg-gray-700 border border-gray-700 text-left text-xs text-gray-200"
                    >
                      <div className="font-semibold mb-1">Productivity</div>
                      <div className="text-gray-500">Focused work setup</div>
                    </button>
                    <button
                      onClick={() => {
                        if (objects.length > 0 && !confirm('This will clear your workspace. Continue?')) {
                          return;
                        }
                        clearWorkspace();
                        setShowNewDialog(false);
                        closeModal();
                      }}
                      className="p-3 rounded-lg bg-gray-900 hover:bg-gray-700 border border-gray-700 text-left text-xs text-gray-200"
                    >
                      <div className="font-semibold mb-1">Blank</div>
                      <div className="text-gray-500">Start from an empty room</div>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewDialog(false)}
                    className="w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Saved Layouts List */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Saved Layouts ({savedLayouts.length})</h3>
                {savedLayouts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No saved layouts yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedLayouts.map((layout) => (
                      <div
                        key={layout.id}
                        onClick={() => handleLoad(layout)}
                        className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 cursor-pointer transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{layout.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {layout.objects.length} objects • {new Date(layout.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(layout.id, e)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Local Snapshots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Snapshots ({snapshots.length})</h3>
                  <button
                    onClick={handleSaveSnapshot}
                    disabled={objects.length === 0}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 disabled:opacity-40"
                  >
                    Quick snapshot
                  </button>
                </div>
                {snapshots.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    Snapshots let you quickly save and restore states while editing a layout.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {snapshots.map((snap: LayoutSnapshot) => (
                      <div
                        key={snap.id}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-gray-700 text-xs"
                      >
                        <div>
                          <div className="text-gray-100">{snap.name}</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(snap.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => restoreSnapshot(snap.id)}
                            className="px-2 py-1 rounded bg-cyan-600 text-white"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => deleteSnapshot(snap.id)}
                            className="px-2 py-1 rounded bg-gray-700 text-gray-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

