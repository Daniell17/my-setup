import { useState, useEffect } from 'react';
import { Layout, Sparkles, Download, Save, X, TrendingUp } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useModalStore } from '@/store/modalStore';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  objects: any[];
  thumbnailUrl?: string;
  usageCount: number;
  userId?: string;
}

const defaultTemplates: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal Setup',
    description: 'Clean and simple workspace',
    category: 'Minimal',
    objects: [
      { type: 'desk', position: [0, 0, 0], scale: [2, 0.05, 1], rotation: [0, 0, 0] },
      { type: 'monitor', position: [0, 0.78, 0], scale: [0.8, 0.5, 0.05], rotation: [0, 0, 0] },
      { type: 'keyboard', position: [0, 0.78, 0.5], scale: [0.5, 0.03, 0.18], rotation: [0, 0, 0] },
      { type: 'mouse', position: [0.3, 0.78, 0.5], scale: [0.08, 0.03, 0.12], rotation: [0, 0, 0] },
      { type: 'chair', position: [0, 0.3, 1.5], scale: [0.6, 1.2, 0.6], rotation: [0, Math.PI, 0] },
    ],
    usageCount: 0,
  },
  {
    id: 'gaming',
    name: 'Gaming Setup',
    description: 'Full gaming workstation',
    category: 'Gaming',
    objects: [
      { type: 'desk', position: [0, 0, 0], scale: [2.5, 0.05, 1.2], rotation: [0, 0, 0] },
      { type: 'monitor', position: [-0.4, 0.78, 0], scale: [0.8, 0.5, 0.05], rotation: [0, 0, 0] },
      { type: 'monitor', position: [0.4, 0.78, 0], scale: [0.8, 0.5, 0.05], rotation: [0, 0, 0] },
      { type: 'pc-tower', position: [-1.2, 0.225, 0], scale: [0.3, 0.6, 0.5], rotation: [0, Math.PI / 4, 0] },
      { type: 'keyboard', position: [0, 0.78, 0.5], scale: [0.5, 0.03, 0.18], rotation: [0, 0, 0] },
      { type: 'mouse', position: [0.3, 0.78, 0.5], scale: [0.08, 0.03, 0.12], rotation: [0, 0, 0] },
      { type: 'headphones', position: [0.6, 0.78, -0.3], scale: [0.25, 0.25, 0.1], rotation: [0, Math.PI / 2, 0] },
      { type: 'speaker', position: [-0.6, 0.78, -0.3], scale: [0.2, 0.35, 0.2], rotation: [0, -Math.PI / 2, 0] },
      { type: 'speaker', position: [0.6, 0.78, -0.3], scale: [0.2, 0.35, 0.2], rotation: [0, Math.PI / 2, 0] },
      { type: 'chair', position: [0, 0.3, 1.5], scale: [0.6, 1.2, 0.6], rotation: [0, Math.PI, 0] },
    ],
    usageCount: 0,
  },
  {
    id: 'productivity',
    name: 'Productivity Setup',
    description: 'Optimized for work and focus',
    category: 'Productivity',
    objects: [
      { type: 'desk', position: [0, 0, 0], scale: [2, 0.05, 1], rotation: [0, 0, 0] },
      { type: 'monitor', position: [0, 0.78, 0], scale: [0.8, 0.5, 0.05], rotation: [0, 0, 0] },
      { type: 'monitor-stand', position: [0, 0.78, 0], scale: [0.6, 0.1, 0.3], rotation: [0, 0, 0] },
      { type: 'keyboard', position: [0, 0.78, 0.5], scale: [0.5, 0.03, 0.18], rotation: [0, 0, 0] },
      { type: 'mouse', position: [0.3, 0.78, 0.5], scale: [0.08, 0.03, 0.12], rotation: [0, 0, 0] },
      { type: 'lamp', position: [-0.6, 0.78, 0.3], scale: [0.15, 0.4, 0.15], rotation: [0, Math.PI / 4, 0] },
      { type: 'plant', position: [0.6, 0.78, -0.3], scale: [0.2, 0.35, 0.2], rotation: [0, 0, 0] },
      { type: 'chair', position: [0, 0.3, 1.5], scale: [0.6, 1.2, 0.6], rotation: [0, Math.PI, 0] },
    ],
    usageCount: 0,
  },
];

export default function TemplateGallery() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('templateGallery'));
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Custom');
  const [templateDescription, setTemplateDescription] = useState('');

  const objects = useWorkspaceStore((state) => state.objects);
  const importLayout = useWorkspaceStore((state) => state.importLayout);
  const { isAuthenticated } = useAuthStore();

  const categories = ['All', 'Minimal', 'Gaming', 'Productivity', 'Custom'];

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Try to load from API, fallback to defaults
      const response = await api.getTemplates();
      if (response.success && response.data && Array.isArray(response.data)) {
        setTemplates([...defaultTemplates, ...response.data]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (template: Template) => {
    if (objects.length > 0 && !confirm('This will replace your current workspace. Continue?')) {
      return;
    }
    importLayout(template.objects);
    closeModal();
  };

  const handleSaveAsTemplate = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save templates');
      return;
    }

    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createTemplate({
        name: templateName.trim(),
        description: templateDescription,
        category: templateCategory,
        objects: objects,
        isPublic: true,
      });

      if (response.success) {
        alert('Template saved successfully!');
        setShowSaveDialog(false);
        setTemplateName('');
        setTemplateDescription('');
        loadTemplates();
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => 
    selectedCategory === 'All' || t.category === selectedCategory
  );

  return (
    <>
      <button
        onClick={() => openModal('templateGallery')}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Layout Templates"
      >
        <Layout className="w-4 h-4" />
        Templates
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => closeModal()}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Layout Templates
                </h2>
                <p className="text-sm text-gray-400 mt-1">Choose a template or save your current layout</p>
              </div>
              <button
                onClick={() => closeModal()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Categories */}
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === category
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Template Button */}
            {isAuthenticated && objects.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-800">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Current Layout as Template
                </button>
              </div>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Template name..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)..."
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Custom">Custom</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveAsTemplate}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : 'Save Template'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setTemplateName('');
                        setTemplateDescription('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                  Loading templates...
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No templates found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all group flex flex-col"
                    >
                      {/* Thumbnail Placeholder */}
                      <div className="h-40 bg-gray-900/50 flex items-center justify-center border-b border-gray-700 group-hover:bg-gray-900/80 transition-colors relative">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-700 mb-2">{template.objects.length}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Objects</div>
                        </div>
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleApplyTemplate(template)}
                            className="bg-cyan-500 text-black px-4 py-2 rounded-lg font-semibold transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Apply
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                          {template.usageCount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <TrendingUp className="w-3 h-3" />
                              {template.usageCount}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{template.description || 'No description'}</p>
                        <div className="mt-auto">
                          <span className="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                            {template.category}
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
    </>
  );
}

