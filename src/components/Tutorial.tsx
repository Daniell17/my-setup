import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Workspace Studio!',
    content: 'This is a 3D workspace designer. Let\'s take a quick tour to get you started.',
    position: 'center',
  },
  {
    id: 'object-library',
    title: 'Object Library',
    content: 'Add objects to your workspace from the library on the left. Click any object to add it.',
    target: '.object-library',
    position: 'right',
  },
  {
    id: 'transform',
    title: 'Transform Tools',
    content: 'Use the toolbar at the bottom to move (G), rotate (R), or scale (S) objects. Click an object first to select it.',
    target: '.toolbar',
    position: 'top',
  },
  {
    id: 'camera',
    title: 'Camera Controls',
    content: 'Use the camera presets on the right to change your view. You can also drag to orbit, scroll to zoom.',
    target: '.camera-presets',
    position: 'left',
  },
  {
    id: 'auto-arrange',
    title: 'Auto-Arrange',
    content: 'Click "Auto-Arrange" in the toolbar to automatically organize your workspace and connect cables.',
    target: '.auto-arrange',
    position: 'top',
  },
  {
    id: 'save',
    title: 'Save Your Layout',
    content: 'Use the Layout Manager in the header to save your workspace. You can also share it with others!',
    target: '.layout-manager',
    position: 'bottom',
  },
];

export default function Tutorial() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('tutorial'));
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem('tutorial-completed') === 'true';
  });

  useEffect(() => {
    // Show tutorial on first visit
    if (!hasCompleted) {
      openModal('tutorial');
    }
  }, [hasCompleted, openModal]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    closeModal();
    setHasCompleted(true);
    localStorage.setItem('tutorial-completed', 'true');
  };

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  if (!isOpen) {
    return (
      <button
        onClick={() => openModal('tutorial')}
        className="fixed bottom-4 left-4 z-[100] p-3 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-800 text-cyan-400 hover:bg-gray-800 hover:border-cyan-500 transition-all"
        title="Show Tutorial"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Overlay with highlight */}
      <div className="absolute inset-0" onClick={handleSkip} />
      
      {/* Tutorial Card */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md p-6 z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-semibold">
              {currentStep + 1}
            </div>
            <div>
              <div className="text-xs text-gray-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              handleSkip();
              closeModal();
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">{currentStepData.title}</h3>
          <p className="text-gray-300 leading-relaxed">{currentStepData.content}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-cyan-500 w-6'
                    : index < currentStep
                    ? 'bg-cyan-500/50'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
          >
            {isLastStep ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

