import React, { useState, useEffect } from 'react';
import { User, Save, Eye, EyeOff, Lock, Mail, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const ProfileSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    department: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm() || !user) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await usersAPI.update(user.id, profileData);
      
      // Update local storage with new user data
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('ird-user', JSON.stringify(updatedUser));
      
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh the page to update the auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !user) return;

    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      await usersAPI.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccessMessage('Password changed successfully! Please log in again.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Log out user after password change
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setErrors({ submit: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'password', name: 'Change Password', icon: Lock }
  ];

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 xl:space-x-4">
        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <User className="w-6 h-6 xl:w-7 xl:h-7 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 text-base xl:text-lg">Manage your account information and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 xl:px-4 xl:py-4 text-sm xl:text-base font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 xl:mr-4 h-5 w-5 xl:h-6 xl:w-6" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 xl:p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 xl:mb-8 bg-green-50 border border-green-200 text-green-600 px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 xl:mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base">
                {errors.submit}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                    <div>
                      <label htmlFor="name" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className={`w-full pl-10 xl:pl-12 pr-4 py-3 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="w-full pl-10 xl:pl-12 pr-4 py-3 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={profileData.department}
                          onChange={handleProfileChange}
                          className="w-full pl-10 xl:pl-12 pr-4 py-3 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg"
                          placeholder="Enter your department"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role?.replace('_', ' ').toUpperCase() || ''}
                        disabled
                        className="w-full px-4 py-3 xl:py-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-base xl:text-lg"
                      />
                      <p className="mt-1 text-xs xl:text-sm text-gray-500">Role cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 xl:pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 xl:px-8 xl:py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 xl:space-y-8">
                <div>
                  <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">Change Password</h3>
                  <div className="space-y-6 xl:space-y-8">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Current Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          id="currentPassword"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full pl-10 xl:pl-12 pr-12 xl:pr-14 py-3 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                            errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                        </button>
                      </div>
                      {errors.currentPassword && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.currentPassword}</p>}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full pl-10 xl:pl-12 pr-12 xl:pr-14 py-3 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                            errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.newPassword}</p>}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full pl-10 xl:pl-12 pr-12 xl:pr-14 py-3 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                            errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 xl:p-6">
                  <h4 className="text-sm xl:text-base font-medium text-yellow-800 mb-2">Password Requirements</h4>
                  <ul className="text-sm xl:text-base text-yellow-700 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Use a combination of letters, numbers, and special characters</li>
                    <li>• Avoid using personal information</li>
                    <li>• Don't reuse recent passwords</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-6 xl:pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 xl:px-8 xl:py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
                  >
                    {loading ? (
                      <div className="w-5 h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Lock className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                    )}
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;