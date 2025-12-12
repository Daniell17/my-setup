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

