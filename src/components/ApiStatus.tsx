import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

export default function ApiStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  const checkConnection = async () => {
    setStatus('checking');
    const response = await api.checkHealth();
    if (response.success) {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={checkConnection}
      className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors border"
      title={`API Status: ${status === 'connected' ? 'Connected' : status === 'checking' ? 'Checking...' : 'Disconnected'}. Click to refresh.`}
      style={{ pointerEvents: 'auto' }}
    >
      {status === 'checking' ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
          <span className="text-gray-400">Checking...</span>
        </>
      ) : status === 'connected' ? (
        <>
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400">API Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-400" />
          <span className="text-red-400">API Offline</span>
        </>
      )}
    </button>
  );
}

