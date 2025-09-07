import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings, t } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'about'>('general');

  const handleLanguageChange = async (language: 'vi' | 'en') => {
    setSettings({ ...settings, language });
    await soundService.playClickSound();
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    setSettings({ ...settings, theme });
    await soundService.playClickSound();
  };

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
    setSettings({ ...settings, fontSize });
    await soundService.playClickSound();
  };

  const handleNotificationChange = async (notifications: boolean) => {
    setSettings({ ...settings, notifications });
    
    if (notifications) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        await soundService.playSuccessSound();
        // Show a test notification
        await notificationService.showNotification(
          'Mora Sensei',
          {
            body: 'Thông báo đã được bật! Bạn sẽ nhận được nhắc nhở học tập.',
            tag: 'settings-test'
          }
        );
      } else {
        await soundService.playErrorSound();
        alert('Không thể bật thông báo. Vui lòng cho phép thông báo trong cài đặt trình duyệt.');
      }
    } else {
      await soundService.playClickSound();
    }
  };

  const handleSoundChange = async (soundEnabled: boolean) => {
    setSettings({ ...settings, soundEnabled });
    soundService.setEnabled(soundEnabled);
    
    if (soundEnabled) {
      await soundService.playSuccessSound();
    }
  };

  const handleTestNotification = async () => {
    if (settings.notifications) {
      await notificationService.showStudyReminder();
      await soundService.playNotificationSound();
    } else {
      alert('Vui lòng bật thông báo trước khi test.');
    }
  };

  const handleTestSound = async () => {
    if (settings.soundEnabled) {
      await soundService.playNotificationSound();
    } else {
      alert('Vui lòng bật âm thanh trước khi test.');
    }
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
    { id: 'appearance', label: 'Giao diện', icon: '🎨' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'about', label: 'Giới thiệu', icon: 'ℹ️' },
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="settings-modal rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="settings-header p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Cài đặt</h2>
              <p className="text-sm opacity-90">Tùy chỉnh ứng dụng theo ý muốn</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await soundService.playClickSound();
              onClose();
            }}
            className="p-2 hover:bg-brand-blue hover:bg-opacity-20 rounded-full transition-colors"
            title="Đóng cài đặt"
          >
            <svg className="w-6 h-6 text-brand-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 settings-sidebar border-r p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={async () => {
                    setActiveTab(tab.id);
                    await soundService.playClickSound();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'settings-tab-active'
                      : 'settings-tab-inactive'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 settings-content">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-brand-text-primary">Cài đặt chung</h3>
                
                {/* Language */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-brand-text-secondary">Ngôn ngữ</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleLanguageChange('vi')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        settings.language === 'vi'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      🇻🇳 Tiếng Việt
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        settings.language === 'en'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                {/* Auto-save */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Tự động lưu tiến độ</label>
                    <p className="text-sm text-brand-text-secondary">Tự động lưu kết quả bài làm</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>

                {/* Study reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Nhắc nhở học tập</label>
                    <p className="text-sm text-brand-text-secondary">Nhắc nhở luyện tập hàng ngày</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.studyReminders}
                      onChange={(e) => setSettings({ ...settings, studyReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-brand-text-primary">Giao diện</h3>
                
                {/* Theme */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-brand-text-secondary">Chủ đề</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-3 rounded-lg border transition-colors ${
                        settings.theme === 'light'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">☀️</div>
                        <div className="text-sm font-medium">Sáng</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-3 rounded-lg border transition-colors ${
                        settings.theme === 'dark'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🌙</div>
                        <div className="text-sm font-medium">Tối</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={`p-3 rounded-lg border transition-colors ${
                        settings.theme === 'auto'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🔄</div>
                        <div className="text-sm font-medium">Tự động</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-brand-text-secondary">Kích thước chữ</label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleFontSizeChange('small')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        settings.fontSize === 'small'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      Nhỏ
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('medium')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        settings.fontSize === 'medium'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      Vừa
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('large')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        settings.fontSize === 'large'
                          ? 'bg-brand-blue text-white border-brand-blue'
                          : 'settings-button-secondary'
                      }`}
                    >
                      Lớn
                    </button>
                  </div>
                </div>

                {/* Compact mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Chế độ compact</label>
                    <p className="text-sm text-brand-text-secondary">Hiển thị nhiều nội dung hơn trên màn hình</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-brand-text-primary">Thông báo</h3>
                
                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Thông báo</label>
                    <p className="text-sm text-brand-text-secondary">Nhận thông báo từ ứng dụng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleNotificationChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Âm thanh</label>
                    <p className="text-sm text-brand-text-secondary">Phát âm thanh khi có thông báo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => handleSoundChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>

                {/* Study reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary">Nhắc nhở học tập</label>
                    <p className="text-sm text-brand-text-secondary">Nhắc nhở luyện tập hàng ngày</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.studyReminders}
                      onChange={(e) => setSettings({ ...settings, studyReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 settings-toggle-bg peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-brand-bg after:settings-divider after:border after:rounded-full after:h-5 after:w-5 after:transition-all settings-toggle-checked"></div>
                  </label>
                </div>

                {/* Test buttons */}
                <div className="pt-4 border-t settings-divider">
                  <h4 className="text-sm font-medium text-brand-text-secondary mb-3">Test tính năng</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleTestNotification}
                      className="px-4 py-2 settings-button-primary rounded-lg transition-colors text-sm font-medium"
                    >
                      🔔 Test thông báo
                    </button>
                    <button
                      onClick={handleTestSound}
                      className="px-4 py-2 settings-button-primary rounded-lg transition-colors text-sm font-medium"
                    >
                      🔊 Test âm thanh
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-brand-text-primary">Giới thiệu</h3>
                
                <div className="settings-card rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-brand-text-primary mb-2">Mora Sensei</h4>
                    <p className="text-gray-600 mb-4">Ứng dụng luyện thi Kaigo Fukushi (介護福祉士)</p>
                    <p className="text-sm text-brand-text-secondary">Phiên bản 1.0.0</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b settings-divider">
                    <span className="text-sm font-medium text-brand-text-secondary">Phiên bản</span>
                    <span className="text-sm text-brand-text-secondary">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b settings-divider">
                    <span className="text-sm font-medium text-brand-text-secondary">Nhà phát triển</span>
                    <span className="text-sm text-brand-text-secondary">Mora Team</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b settings-divider">
                    <span className="text-sm font-medium text-brand-text-secondary">Email hỗ trợ</span>
                    <span className="text-sm text-brand-text-secondary">support@mora-sensei.com</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-brand-text-secondary">Website</span>
                    <span className="text-sm text-brand-text-secondary">www.mora-sensei.com</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full settings-button-primary py-3 px-4 rounded-lg transition-colors font-medium">
                    Kiểm tra cập nhật
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
