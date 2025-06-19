import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Save, Users, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserManagement from './UserManagement';
import ProfileSettings from './ProfileSettings';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    notifications: {
      email: true,
      push: true,
      requests: true,
      approvals: true,
    },
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev] as any,
            [child]: checkbox.checked,
          },
        }));
      }
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    setSuccessMessage(t('messages.saved'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'am') => {
    setLanguage(newLanguage);
    setSuccessMessage(t('messages.saved'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = () => {
    console.log('Saving settings:', formData);
    setSuccessMessage(t('messages.saved'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'profile', name: t('settings.profile'), icon: User },
      { id: 'notifications', name: t('settings.notifications'), icon: Bell },
      { id: 'preferences', name: t('settings.preferences'), icon: Globe },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseTabs,
        { id: 'users', name: t('settings.userManagement'), icon: Users },
        { id: 'security', name: t('settings.security'), icon: Shield },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabsForRole();

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 xl:space-x-4">
        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 xl:w-7 xl:h-7 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-base xl:text-lg">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base">
          {successMessage}
        </div>
      )}

      {/* Full Responsive Tabs and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 xl:px-4 xl:py-4 text-sm xl:text-base font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="mr-3 xl:mr-4 h-5 w-5 xl:h-6 xl:w-6" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 xl:p-8">
            {/* Profile */}
            {activeTab === 'profile' && <ProfileSettings />}

            {/* User Management */}
            {activeTab === 'users' && user?.role === 'admin' && <UserManagement />}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">{t('settings.notifications')}</h3>
                  <div className="space-y-4 xl:space-y-6">
                    {[
                      {
                        key: 'email',
                        title: t('settings.emailNotifications'),
                        desc: t('settings.emailNotificationsDesc'),
                      },
                      {
                        key: 'push',
                        title: t('settings.pushNotifications'),
                        desc: t('settings.pushNotificationsDesc'),
                      },
                      {
                        key: 'requests',
                        title: t('settings.requestUpdates'),
                        desc: t('settings.requestUpdatesDesc'),
                      },
                      {
                        key: 'approvals',
                        title: t('settings.approvalNotifications'),
                        desc: t('settings.approvalNotificationsDesc'),
                      },
                    ].map(({ key, title, desc }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{title}</h4>
                          <p className="text-sm xl:text-base text-gray-500 dark:text-gray-400">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id={`notifications.${key}`}
                            type="checkbox"
                            name={`notifications.${key}`}
                            checked={formData.notifications[key as keyof typeof formData.notifications]}
                            onChange={handleInputChange}
                            className="sr-only peer"
                            aria-label={`${key} notification toggle`}
                          />
                          <div className="w-11 h-6 xl:w-12 xl:h-7 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 xl:after:h-6 xl:after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Application Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                    <div>
                      <label htmlFor="language" className="block text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.language')}
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'am')}
                        className="w-full px-4 py-3 xl:py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base xl:text-lg"
                      >
                        <option value="en">English</option>
                        <option value="am">አማርኛ (Amharic)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm xl:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.theme')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'light', label: t('settings.light'), icon: Sun },
                          { value: 'dark', label: t('settings.dark'), icon: Moon },
                          { value: 'auto', label: t('settings.auto'), icon: Monitor }
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => handleThemeChange(value as 'light' | 'dark' | 'auto')}
                            className={`flex flex-col items-center p-3 xl:p-4 border rounded-lg transition-colors ${
                              theme === value
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            <Icon className="w-5 h-5 xl:w-6 xl:h-6 mb-2" />
                            <span className="text-xs xl:text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 xl:p-6">
                  <h4 className="text-sm xl:text-base font-medium text-blue-800 dark:text-blue-400 mb-2">About IRD Properties</h4>
                  <p className="text-sm xl:text-base text-blue-700 dark:text-blue-300">
                    Version 1.0.0 - {t('org.fullName')} Property Management System
                  </p>
                  <p className="text-sm xl:text-base text-blue-700 dark:text-blue-300 mt-1">
                    Developed for the {t('org.department')}
                  </p>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && user?.role === 'admin' && (
              <div className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">{t('settings.security')}</h3>
                  <div className="space-y-4 xl:space-y-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 xl:p-6">
                      <h4 className="text-sm xl:text-base font-medium text-yellow-800 dark:text-yellow-400 mb-2">System Security</h4>
                      <ul className="text-sm xl:text-base text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• All user passwords are encrypted using bcrypt</li>
                        <li>• JWT tokens are used for secure authentication</li>
                        <li>• Database access is restricted to authenticated users</li>
                        <li>• All actions are logged for audit purposes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 xl:p-6">
                      <h4 className="text-sm xl:text-base font-medium text-green-800 dark:text-green-400 mb-2">Best Practices</h4>
                      <ul className="text-sm xl:text-base text-green-700 dark:text-green-300 space-y-1">
                        <li>• Regularly update user passwords</li>
                        <li>• Review user permissions periodically</li>
                        <li>• Monitor system access logs</li>
                        <li>• Keep the system updated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab === 'notifications' && (
              <div className="flex justify-end pt-6 xl:pt-8 border-t border-gray-200 dark:border-gray-700 mt-6 xl:mt-8">
                <button
                  onClick={handleSave}
                  className="flex items-center px-6 py-3 xl:px-8 xl:py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
                >
                  <Save className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                  {t('settings.saveChanges')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;