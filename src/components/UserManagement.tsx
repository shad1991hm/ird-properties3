import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Eye, EyeOff, Shield, Users as UsersIcon, Key, UserCog } from 'lucide-react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user' | 'store_manager';
  department?: string;
  email?: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user' | 'store_manager',
    department: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!editingUser && !formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Please confirm the password';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, {
          name: formData.name,
          role: formData.role,
          department: formData.department,
          email: formData.email
        });
      } else {
        await usersAPI.create(formData);
      }

      await fetchUsers();
      handleCloseForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !passwordUser) return;

    setIsSubmitting(true);

    try {
      await usersAPI.changePassword(passwordUser.id, {
        newPassword: passwordData.newPassword
      });

      await fetchUsers();
      handleClosePasswordModal();
      alert('Password changed successfully!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      department: user.department || '',
      email: user.email || ''
    });
    setShowForm(true);
  };

  const handleChangePassword = (user: User) => {
    setPasswordUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.delete(id);
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'user',
      department: '',
      email: ''
    });
    setErrors({});
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordUser(null);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'store_manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'store_manager': return UsersIcon;
      case 'user': return User;
      default: return User;
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length,
      storeManagers: users.filter(u => u.role === 'store_manager').length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 xl:w-16 xl:h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 text-base xl:text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6 xl:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 xl:space-x-4">
            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 xl:w-7 xl:h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h1>
              <p className="text-gray-600 text-base xl:text-lg">
                {editingUser ? 'Update user information' : 'Add a new user to the system'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseForm}
            className="px-4 py-2 xl:px-6 xl:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 xl:p-8 space-y-6 xl:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
              <div>
                <label htmlFor="username" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!!editingUser}
                  className={`w-full px-4 py-3 xl:px-5 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${editingUser ? 'bg-gray-50 text-gray-500' : ''}`}
                  placeholder="Enter username"
                />
                {errors.username && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 xl:px-5 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.name}</p>}
              </div>

              {!editingUser && (
                <div>
                  <label htmlFor="password" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 xl:px-5 xl:py-4 pr-12 xl:pr-14 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 xl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.password}</p>}
                </div>
              )}

              <div>
                <label htmlFor="role" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 xl:px-5 xl:py-4 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                    errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="user">User</option>
                  <option value="store_manager">Store Manager</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && <p className="mt-1 text-sm xl:text-base text-red-600">{errors.role}</p>}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 xl:px-5 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg"
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 xl:px-5 xl:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base">
                {errors.submit}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 xl:gap-6 pt-6 xl:pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 sm:flex-none px-6 py-3 xl:px-8 xl:py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-base xl:text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 xl:px-8 xl:py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Plus className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                )}
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 xl:gap-6">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 text-base xl:text-lg">Manage system users and their permissions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 xl:px-6 xl:py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
        >
          <Plus className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm xl:text-base text-gray-600">Total Users</p>
              <p className="text-2xl xl:text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <UsersIcon className="w-8 h-8 xl:w-10 xl:h-10 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm xl:text-base text-gray-600">Admins</p>
              <p className="text-2xl xl:text-3xl font-bold text-red-600">{stats.admins}</p>
            </div>
            <Shield className="w-8 h-8 xl:w-10 xl:h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm xl:text-base text-gray-600">Store Managers</p>
              <p className="text-2xl xl:text-3xl font-bold text-blue-600">{stats.storeManagers}</p>
            </div>
            <UsersIcon className="w-8 h-8 xl:w-10 xl:h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm xl:text-base text-gray-600">Regular Users</p>
              <p className="text-2xl xl:text-3xl font-bold text-green-600">{stats.users}</p>
            </div>
            <User className="w-8 h-8 xl:w-10 xl:h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xl:p-6">
        <div className="flex flex-col lg:flex-row gap-4 xl:gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 xl:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl:w-6 xl:h-6" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 xl:pl-12 pr-4 py-2 xl:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base xl:text-lg"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 xl:gap-6">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 xl:px-5 xl:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base xl:text-lg"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="store_manager">Store Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
          {filteredUsers.map((user) => {
            const RoleIcon = getRoleIcon(user.role);
            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="p-6 xl:p-8">
                  <div className="flex items-start justify-between mb-4 xl:mb-6">
                    <div className="flex items-center space-x-3 xl:space-x-4">
                      <div className="w-12 h-12 xl:w-14 xl:h-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <RoleIcon className="w-6 h-6 xl:w-7 xl:h-7 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg xl:text-xl font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm xl:text-base text-gray-600">@{user.username}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 xl:space-y-4 mb-6 xl:mb-8">
                    {user.department && (
                      <div>
                        <p className="text-xs xl:text-sm text-gray-500 uppercase tracking-wide">Department</p>
                        <p className="text-sm xl:text-base font-medium text-gray-900">{user.department}</p>
                      </div>
                    )}
                    {user.email && (
                      <div>
                        <p className="text-xs xl:text-sm text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm xl:text-base font-medium text-gray-900">{user.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs xl:text-sm text-gray-500 uppercase tracking-wide">Created</p>
                      <p className="text-sm xl:text-base font-medium text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 xl:gap-3">
                    <div className="flex gap-2 xl:gap-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex-1 flex items-center justify-center px-3 py-2 xl:px-4 xl:py-3 text-sm xl:text-base font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        <UserCog className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => handleChangePassword(user)}
                        className="flex-1 flex items-center justify-center px-3 py-2 xl:px-4 xl:py-3 text-sm xl:text-base font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                        Password
                      </button>
                    </div>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="w-full flex items-center justify-center px-3 py-2 xl:px-4 xl:py-3 text-sm xl:text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 xl:p-16 text-center">
          <UsersIcon className="w-16 h-16 xl:w-20 xl:h-20 text-gray-300 mx-auto mb-4 xl:mb-6" />
          <h3 className="text-lg xl:text-xl font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 text-base xl:text-lg">
            {searchTerm || roleFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first user'
            }
          </p>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 xl:p-8">
            <h3 className="text-lg xl:text-xl font-semibold text-gray-900 mb-4 xl:mb-6">
              Change Password for {passwordUser.name}
            </h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 xl:space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm xl:text-base font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 xl:px-5 xl:py-4 pr-12 xl:pr-14 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                      errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
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
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 xl:px-5 xl:py-4 pr-12 xl:pr-14 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-base xl:text-lg ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
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

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 xl:px-6 xl:py-4 rounded-lg text-sm xl:text-base">
                  {errors.submit}
                </div>
              )}

              <div className="flex space-x-3 xl:space-x-4 pt-4 xl:pt-6">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="flex-1 px-4 py-2 xl:px-6 xl:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-base xl:text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center px-4 py-2 xl:px-6 xl:py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-base xl:text-lg"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Key className="w-5 h-5 xl:w-6 xl:h-6 mr-2" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;