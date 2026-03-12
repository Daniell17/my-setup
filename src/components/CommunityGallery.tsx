import { useState, useEffect } from 'react';
import { Globe, Download, X, User, MessageSquare, GitFork, Heart } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useModalStore } from '@/store/modalStore';
import { api, LayoutResponse, CollectionResponse } from '@/services/api';
import LayoutComments from './LayoutComments';

export default function CommunityGallery() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('communityGallery'));
  const isCommentsOpen = useModalStore((state) => state.isModalOpen('layoutComments'));
  const [layouts, setLayouts] = useState<LayoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [activeLayoutForCollection, setActiveLayoutForCollection] = useState<LayoutResponse | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const loadLayout = useWorkspaceStore((state) => state.importLayout);
  const objects = useWorkspaceStore((state) => state.objects);

  useEffect(() => {
    if (isOpen) {
      loadCommunityLayouts();
    }
  }, [isOpen]);

  const loadCommunityLayouts = async () => {
    setIsLoading(true);
    try {
      const response = await api.getPublicLayouts();
      if (response.success && response.data) {
        setLayouts(response.data);
      }
    } catch (error) {
      console.error('Failed to load community layouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await api.getCollections();
      if (response.success && response.data) {
        setCollections(response.data);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const handleLoad = (layout: LayoutResponse) => {
    if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
      return;
    }
    loadLayout(layout.objects);
    closeModal();
  };

  const handleFork = async (layout: LayoutResponse) => {
    if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
      return;
    }
    
    // Fork: Load the layout and create a new private remix on the server
    loadLayout(layout.objects);
    
    try {
      await api.remixLayout(layout.id);
      alert('Layout remixed into your workspace!');
    } catch (error) {
      console.error('Failed to fork layout:', error);
    }
    closeModal();
  };

  const handleLike = async (layout: LayoutResponse) => {
    try {
      await api.likeLayout(layout.id);
      await loadCommunityLayouts();
    } catch (error) {
      console.error('Failed to like layout:', error);
    }
  };

  const openCollectionsForLayout = async (layout: LayoutResponse) => {
    setActiveLayoutForCollection(layout);
    await loadCollections();
    setShowCollectionsModal(true);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!activeLayoutForCollection) return;
    try {
      await api.addLayoutToCollection(collectionId, activeLayoutForCollection.id);
      setShowCollectionsModal(false);
      setActiveLayoutForCollection(null);
    } catch (error) {
      console.error('Failed to add to collection:', error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !activeLayoutForCollection) return;
    try {
      const res = await api.createCollection(newCollectionName.trim());
      if (res.success && res.data) {
        await api.addLayoutToCollection(res.data.id, activeLayoutForCollection.id);
        setNewCollectionName('');
        setShowCollectionsModal(false);
        setActiveLayoutForCollection(null);
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => openModal('communityGallery')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Community Gallery"
      >
        <Globe className="w-4 h-4" />
        Community
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => closeModal()}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-6 h-6 text-cyan-400" />
                  Community Gallery
                </h2>
                <p className="text-sm text-gray-400 mt-1">Discover layouts created by the community</p>
              </div>
              <button
                onClick={() => closeModal()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                  Loading gallery...
                </div>
              ) : layouts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No community layouts found yet.</p>
                  <p className="text-sm">Be the first to share yours!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {layouts.map((layout) => (
                    <div
                      key={layout.id}
                      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all group flex flex-col"
                    >
                      {/* Placeholder Preview - in future we could save thumbnails */}
                      <div className="h-40 bg-gray-900/50 flex items-center justify-center border-b border-gray-700 group-hover:bg-gray-900/80 transition-colors relative">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-700 mb-2">{layout.objects.length}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Objects</div>
                        </div>
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleLoad(layout)}
                            className="bg-cyan-500 text-black px-3 py-2 rounded-lg font-semibold transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Load
                          </button>
                          <button
                            onClick={() => handleFork(layout)}
                            className="bg-purple-500 text-white px-3 py-2 rounded-lg font-semibold transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2 text-sm"
                          >
                            <GitFork className="w-4 h-4" />
                            Fork
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLayoutId(layout.id);
                              openModal('layoutComments');
                            }}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2 text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Comments
                          </button>
                          <button
                            onClick={() => openCollectionsForLayout(layout)}
                            className="bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2 text-sm"
                          >
                            +
                            Collections
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">{layout.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <User className="w-3 h-3" />
                          <span>User Layout</span>
                          <span>•</span>
                          <span>{new Date(layout.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                          <button
                            onClick={() => handleLike(layout)}
                            className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Heart className={`w-3 h-3 ${layout.stats && layout.stats.likes > 0 ? 'fill-current text-red-400' : ''}`} />
                            <span>{layout.stats?.likes ?? 0}</span>
                          </button>
                          <span>
                            {layout.stats?.remixes ?? 0} remix{(layout.stats?.remixes ?? 0) === 1 ? '' : 'es'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCommentsOpen && selectedLayoutId && (
        <LayoutComments
          layoutId={selectedLayoutId}
          isOpen={isCommentsOpen}
          onClose={() => {
            closeModal();
            setSelectedLayoutId(null);
          }}
        />
      )}

      {showCollectionsModal && activeLayoutForCollection && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCollectionsModal(false)}>
          <div
            className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md max-h-[80vh] flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">
                Add “{activeLayoutForCollection.name}” to collection
              </h3>
              <button
                onClick={() => setShowCollectionsModal(false)}
                className="p-1 rounded hover:bg-gray-800"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {collections.length === 0 ? (
                <div className="text-xs text-gray-500">
                  You don&apos;t have any collections yet. Create one below.
                </div>
              ) : (
                collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAddToCollection(c.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs text-gray-100"
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-500">
                      {c.layoutIds.length} layout{c.layoutIds.length === 1 ? '' : 's'}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-800 pt-3 space-y-2">
              <div className="text-[11px] text-gray-400">Create new collection</div>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="w-full px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-xs font-medium text-black disabled:opacity-40"
              >
                Create and add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

