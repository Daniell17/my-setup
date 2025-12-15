import { useState, useEffect } from 'react';
import { User, Save, X, Upload, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useModalStore } from '@/store/modalStore';
import { api } from '@/services/api';

export default function UserProfile() {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const isOpen = useModalStore((state) => state.isModalOpen('userProfile'));
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    avatar: '',
  });

  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
    gridSnap: false,
    showTooltips: true,
  });

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadUserData();
    }
  }, [isOpen, isAuthenticated]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        setProfileData({
          username: response.data.username || '',
          email: response.data.email || '',
          bio: response.data.bio || '',
          avatar: response.data.avatar || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update profile via API
      const response = await api.updateProfile(profileData);

      if (response.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('workspace-settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => openModal('userProfile')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700 text-sm"
        title="User Profile"
      >
        <User className="w-4 h-4" />
        Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => closeModal()}>
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-6 h-6 text-cyan-400" />
                Profile & Settings
              </h2>
              <button
                onClick={() => closeModal()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Settings
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                  Loading...
                </div>
              ) : activeTab === 'profile' ? (
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl font-bold">
                      {profileData.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm">
                        <Upload className="w-4 h-4" />
                        Upload Avatar
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Notifications</label>
                      <p className="text-xs text-gray-500">Receive updates about your layouts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  {/* Auto Save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Auto Save</label>
                      <p className="text-xs text-gray-500">Automatically save your workspace</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  {/* Grid Snap */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Grid Snap</label>
                      <p className="text-xs text-gray-500">Snap objects to grid</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gridSnap}
                        onChange={(e) => setSettings({ ...settings, gridSnap: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  {/* Show Tooltips */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Show Tooltips</label>
                      <p className="text-xs text-gray-500">Display helpful tooltips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showTooltips}
                        onChange={(e) => setSettings({ ...settings, showTooltips: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

