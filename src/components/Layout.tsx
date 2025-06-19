import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Home,
  ShoppingCart,
  CheckSquare,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { name: t('nav.dashboard'), href: '/dashboard', icon: Home }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: t('nav.properties'), href: '/properties', icon: Package },
        { name: t('nav.requests'), href: '/requests', icon: FileText },
        { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
        { name: t('nav.settings'), href: '/settings', icon: Settings }
      ];
    } else if (user?.role === 'user') {
      return [
        ...baseItems,
        { name: t('nav.availableProperties'), href: '/available-properties', icon: Package },
        { name: t('nav.myRequests'), href: '/my-requests', icon: ShoppingCart },
        { name: t('nav.settings'), href: '/settings', icon: Settings }
      ];
    } else if (user?.role === 'store_manager') {
      return [
        ...baseItems,
        { name: t('nav.issueProperties'), href: '/issue-properties', icon: CheckSquare },
        { name: t('nav.issuedProperties'), href: '/issued-properties', icon: FileText },
        { name: t('nav.reports'), href: '/reports', icon: BarChart3 },
        { name: t('nav.settings'), href: '/settings', icon: Settings }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/settings');
    setProfileDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 xl:w-72 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 xl:h-20 px-4 xl:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 xl:w-10 xl:h-10 text-primary-600" />
            <div>
              <h1 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-white">{t('org.name')}</h1>
              <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">EDU - IRD</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 xl:px-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 xl:px-4 py-3 xl:py-3.5 text-sm xl:text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="mr-3 xl:mr-4 h-5 w-5 xl:h-6 xl:w-6" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 xl:p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400 capitalize">
                {user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 xl:px-4 py-2.5 xl:py-3 text-sm xl:text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 xl:mr-4 h-4 w-4 xl:h-5 xl:w-5" />
            {t('auth.signOut')}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'pl-64 xl:pl-72' : 'pl-0'}`}>
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between h-16 xl:h-20 px-4 xl:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 xl:space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">{user?.department}</p>
                </div>
                <div className="w-8 h-8 xl:w-10 xl:h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 xl:w-5 xl:h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <ChevronDown className={`w-4 h-4 xl:w-5 xl:h-5 text-gray-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 xl:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">{user?.email || 'No email set'}</p>
                    <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center px-4 py-3 text-sm xl:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 xl:w-5 xl:h-5 mr-3" />
                    {t('nav.settings')} & Profile
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm xl:text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 xl:w-5 xl:h-5 mr-3" />
                    {t('auth.signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 xl:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;