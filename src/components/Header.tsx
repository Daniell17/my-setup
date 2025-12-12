import { Box, Share2, User as UserIcon } from 'lucide-react';
import LayoutManager from './LayoutManager';
import CommunityGallery from './CommunityGallery';
import TemplateGallery from './TemplateGallery';
import UserProfile from './UserProfile';
import ApiStatus from './ApiStatus';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import { compressLayout } from '@/utils/compression';
import { useState } from 'react';

export default function Header() {
  const [copySuccess, setCopySuccess] = useState(false);
  const openModal = useModalStore((state) => state.openModal);
  
  const objects = useWorkspaceStore((state) => state.objects);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleShare = () => {
    const compressed = compressLayout(objects);
    const url = new URL(window.location.href);
    url.searchParams.set('layout', compressed);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex items-center justify-between" style={{ pointerEvents: 'auto' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
          <Box className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-semibold text-white flex items-center gap-2">
            Workspace Studio
            <span className="text-xs text-gray-400 font-normal">3D</span>
          </h1>
          <p className="text-xs text-gray-400">3D Desk Layout Designer</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <UserProfile />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.username}</span>
                <button 
                  onClick={logout} 
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
              <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => openModal('auth')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all text-sm"
          >
            <UserIcon className="w-4 h-4" />
            <span>Login / Sign Up</span>
          </button>
        )}
        
        <div className="h-6 w-px bg-gray-800 mx-2" />

        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border ${
            copySuccess 
              ? 'bg-green-500/20 text-green-400 border-green-500/50' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">{copySuccess ? 'Copied!' : 'Share'}</span>
        </button>
        <ApiStatus />
        <TemplateGallery />
        <CommunityGallery />
        <LayoutManager />
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <span>Click to select • Drag to move</span>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300">G</kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300">R</kbd>
            <span>Rotate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300">S</kbd>
            <span>Scale</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300">Ctrl+Z</kbd>
            <span>Undo</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-[10px] font-mono text-gray-300">Ctrl+Y</kbd>
            <span>Redo</span>
          </div>
        </div>
      </div>
    </header>
  );
}

