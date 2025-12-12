import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import * as THREE from 'three';

export default function TextureManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedTextures, setUploadedTextures] = useState<Map<string, string>>(new Map());
  const selectedId = useWorkspaceStore((state) => state.selectedId);
  const updateObject = useWorkspaceStore((state) => state.updateObject);
  const objects = useWorkspaceStore((state) => state.objects);

  const selectedObject = objects.find(obj => obj.id === selectedId);

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const textureId = `texture_${Date.now()}`;
      setUploadedTextures(prev => new Map(prev).set(textureId, dataUrl));
      
      // Apply to selected object
      if (selectedObject) {
        updateObject(selectedObject.id, {
          material: {
            ...selectedObject.material,
            textureUrl: dataUrl,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const applyTexture = (textureUrl: string) => {
    if (selectedObject) {
      updateObject(selectedObject.id, {
        material: {
          ...selectedObject.material,
          textureUrl,
        },
      });
    }
  };

  const removeTexture = () => {
    if (selectedObject) {
      updateObject(selectedObject.id, {
        material: {
          ...selectedObject.material,
          textureUrl: undefined,
        },
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700 flex items-center gap-2 text-sm"
        title="Texture Manager"
      >
        <ImageIcon className="w-4 h-4" />
        Textures
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="w-full max-w-md bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 p-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Texture Manager</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!selectedObject ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                Select an object to apply textures
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Texture */}
                {selectedObject.material?.textureUrl && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Current Texture</label>
                    <div className="relative">
                      <img
                        src={selectedObject.material.textureUrl}
                        alt="Current texture"
                        className="w-full h-32 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        onClick={removeTexture}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New Texture */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Upload Texture</label>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTextureUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>

                {/* Texture Library */}
                {uploadedTextures.size > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Your Textures</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(uploadedTextures.entries()).map(([id, url]) => (
                        <button
                          key={id}
                          onClick={() => applyTexture(url)}
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden ${
                            selectedObject.material?.textureUrl === url
                              ? 'border-cyan-500'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <img src={url} alt="Texture" className="w-full h-full object-cover" />
                          {selectedObject.material?.textureUrl === url && (
                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-cyan-400" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

