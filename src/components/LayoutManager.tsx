import { useState, useRef } from 'react';
import { Save, FolderOpen, Trash2, Upload, X, Download } from 'lucide-react';
import { useWorkspaceStore, SavedLayout } from '@/store/workspaceStore';

export default function LayoutManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objects = useWorkspaceStore((state) => state.objects);
  const saveLayout = useWorkspaceStore((state) => state.saveLayout);
  const loadLayout = useWorkspaceStore((state) => state.loadLayout);
  const deleteLayout = useWorkspaceStore((state) => state.deleteLayout);
  const getSavedLayouts = useWorkspaceStore((state) => state.getSavedLayouts);
  const importLayout = useWorkspaceStore((state) => state.importLayout);

  const savedLayouts = getSavedLayouts();

  const handleSave = () => {
    if (saveName.trim()) {
      saveLayout(saveName.trim());
      setSaveName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoad = (layout: SavedLayout) => {
    if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
      return;
    }
    loadLayout(layout.id);
    setIsOpen(false);
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
            setIsOpen(false);
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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Manage Layouts"
      >
        <FolderOpen className="w-4 h-4" />
        Layouts
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                Layout Manager
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}

