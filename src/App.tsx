import { useEffect, useState } from 'react';
import ObjectLibrary from '@/components/ObjectLibrary';
import Toolbar from '@/components/Toolbar';
import PropertiesPanel from '@/components/PropertiesPanel';
import ExportButton from '@/components/ExportButton';
import BudgetPanel from '@/components/BudgetPanel';
import SpaceAnalysis from '@/components/SpaceAnalysis';
import Header from '@/components/Header';
import Scene from '@/components/Scene';
import CameraPresetsUI from '@/components/CameraPresets';
import ContextMenu from '@/components/ContextMenu';
import { contextMenuState } from '@/components/WorkspaceObject3D';
import { LightingUI } from '@/components/LightingController';
import Tutorial from '@/components/Tutorial';
import AuthModal from '@/components/AuthModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useModalStore } from '@/store/modalStore';
import { decompressLayout } from '@/utils/compression';
import { useWorkspaceStore } from '@/store/workspaceStore';

function App() {
  useKeyboardShortcuts();
  const importLayout = useWorkspaceStore((state) => state.importLayout);
  const objects = useWorkspaceStore((state) => state.objects);
  const isAuthModalOpen = useModalStore((state) => state.isModalOpen('auth'));
  const closeModal = useModalStore((state) => state.closeModal);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    objectId: null as string | null,
    position: null as { x: number; y: number } | null,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressedLayout = params.get('layout');
    if (compressedLayout) {
      const objects = decompressLayout(compressedLayout);
      if (objects) {
        importLayout(objects);
        // Clear the URL param so refreshing doesn't reload it forever
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    contextMenuState.onChange = () => {
      setContextMenu({
        show: contextMenuState.show,
        objectId: contextMenuState.objectId,
        position: contextMenuState.position,
      });
    };
  }, []);

  return (
    <main className="w-full h-screen bg-black relative overflow-hidden" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* 3D Scene - Background layer */}
      <div className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%', backgroundColor: '#000000' }}>
        <Scene />
      </div>

      {/* UI Overlays - Foreground layer */}
      <Header />
      <ObjectLibrary />
      <Toolbar />
      <PropertiesPanel />
      <BudgetPanel />
      <SpaceAnalysis />
      <ExportButton />
      <CameraPresetsUI />
      <LightingUI />
      <Tutorial />
      {objects.length === 0 && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-[50]">
          <div className="px-4 py-3 rounded-lg bg-gray-900/90 border border-gray-700 text-xs text-gray-300 shadow-xl">
            <span className="font-semibold text-white">Tip:</span>{' '}
            Use the Object Library on the left or the Templates button in the header to start your first setup.
          </div>
        </div>
      )}
      {contextMenu.show && (
        <ContextMenu
          objectId={contextMenu.objectId}
          position={contextMenu.position}
          onClose={() => contextMenuState.setShow(false)}
        />
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => closeModal()} />
    </main>
  );
}

export default App;

