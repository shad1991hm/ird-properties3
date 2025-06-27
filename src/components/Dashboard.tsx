import React, { useEffect, useState } from 'react';
import { Package, FileText, CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { dashboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { properties, requests, issuedProperties, loading } = useData();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [, setDashboardStats] = useState<any>({});

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const getStats = () => {
    const totalProperties = properties.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = properties.reduce((sum, p) => sum + p.totalPrice, 0);
    const lowStockItems = properties.filter(p => (p.availableQuantity / p.quantity) <= 0.25).length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'adjusted').length;
    const issuedToday = issuedProperties.filter(ip => 
      new Date(ip.issuedAt).toDateString() === new Date().toDateString()
    ).length;

    return {
      totalProperties,
      totalValue,
      lowStockItems,
      pendingRequests,
      approvedRequests,
      issuedToday,
      userRequests: requests.filter(r => r.userId === user?.id).length,
      userPendingRequests: requests.filter(r => r.userId === user?.id && r.status === 'pending').length
    };
  };

  const stats = getStats();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 xl:p-4 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 xl:w-7 xl:h-7 text-white" />
        </div>
        {change && (
          <span className="text-sm xl:text-base text-green-600 dark:text-green-400 font-medium">{change}</span>
        )}
      </div>
      <div>
        <p className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm xl:text-base text-gray-600 dark:text-gray-300">{title}</p>
      </div>
    </div>
  );

  const RecentActivity: React.FC = () => {
    const recentRequests = requests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-warning-100 dark:bg-yellow-900/20 text-warning-800 dark:text-yellow-400';
        case 'approved': return 'bg-success-100 dark:bg-green-900/20 text-success-800 dark:text-green-400';
        case 'rejected': return 'bg-error-100 dark:bg-red-900/20 text-error-800 dark:text-red-400';
        case 'adjusted': return 'bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400';
        case 'issued': return 'bg-secondary-100 dark:bg-secondary-900/20 text-secondary-800 dark:text-secondary-400';
        default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
        <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
              <div className="flex-1">
                <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{request.propertyName}</p>
                <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">
                  Requested by {request.userName} • {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 xl:px-3 xl:py-1.5 text-xs xl:text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <p className="text-sm xl:text-base text-gray-500 dark:text-gray-400 text-center py-4 xl:py-6">No recent activity</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 xl:w-16 xl:h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 text-base xl:text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title={t('dashboard.totalProperties')}
          value={stats.totalProperties}
          icon={Package}
          color="bg-primary-600"
          change="+12%"
        />
        <StatCard
          title={t('dashboard.totalValue')}
          value={`${stats.totalValue.toLocaleString()} ETB`}
          icon={TrendingUp}
          color="bg-secondary-600"
          change="+8%"
        />
        <StatCard
          title={t('dashboard.pendingRequests')}
          value={stats.pendingRequests}
          icon={FileText}
          color="bg-warning-600"
        />
        <StatCard
          title={t('dashboard.lowStock')}
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="bg-error-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <RecentActivity />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button 
              onClick={() => navigate('/properties')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Package className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Register New Property</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/requests')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">View Pending Requests</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-accent-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderUserDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title="Available Properties"
          value={properties.length}
          icon={Package}
          color="bg-primary-600"
        />
        <StatCard
          title="My Requests"
          value={stats.userRequests}
          icon={FileText}
          color="bg-secondary-600"
        />
        <StatCard
          title="Pending Requests"
          value={stats.userPendingRequests}
          icon={AlertTriangle}
          color="bg-warning-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">My Recent Requests</h3>
          <div className="space-y-4">
            {requests
              .filter(r => r.userId === user?.id)
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
                  <div className="flex-1">
                    <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{request.propertyName}</p>
                    <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {request.requestedQuantity} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 xl:px-3 xl:py-1.5 text-xs xl:text-sm font-medium rounded-full ${
                    request.status === 'pending' ? 'bg-warning-100 dark:bg-yellow-900/20 text-warning-800 dark:text-yellow-400' :
                    request.status === 'approved' ? 'bg-success-100 dark:bg-green-900/20 text-success-800 dark:text-green-400' :
                    request.status === 'rejected' ? 'bg-error-100 dark:bg-red-900/20 text-error-800 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button 
              onClick={() => navigate('/available-properties')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Package className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Browse Available Properties</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/my-requests')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">View My Requests</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderStoreManagerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6 mb-6 xl:mb-8">
        <StatCard
          title="Approved Requests"
          value={stats.approvedRequests}
          icon={CheckSquare}
          color="bg-primary-600"
        />
        <StatCard
          title="Issued Today"
          value={stats.issuedToday}
          icon={Package}
          color="bg-secondary-600"
        />
        <StatCard
          title="Total Issued"
          value={issuedProperties.length}
          icon={TrendingUp}
          color="bg-accent-600"
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Pending Issuance</h3>
          <div className="space-y-4">
            {requests
              .filter(r => r.status === 'approved' || r.status === 'adjusted')
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between py-2 xl:py-3">
                  <div className="flex-1">
                    <p className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">{request.propertyName}</p>
                    <p className="text-xs xl:text-sm text-gray-500 dark:text-gray-400">
                      {request.userName} • Qty: {request.approvedQuantity || request.requestedQuantity}
                    </p>
                  </div>
                  <button className="px-3 py-1 xl:px-4 xl:py-2 text-xs xl:text-sm font-medium text-primary-600 hover:text-primary-700">
                    Issue
                  </button>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 xl:p-6">
          <h3 className="text-lg xl:text-xl font-semibold text-gray-900 dark:text-white mb-4 xl:mb-6">Quick Actions</h3>
          <div className="space-y-3 xl:space-y-4">
            <button 
              onClick={() => navigate('/properties')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Package className="w-5 h-5 xl:w-6 xl:h-6 text-primary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Manage Properties</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/issue-properties')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <CheckSquare className="w-5 h-5 xl:w-6 xl:h-6 text-secondary-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Issue Properties</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/issued-properties')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <FileText className="w-5 h-5 xl:w-6 xl:h-6 text-accent-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">View Issued Properties</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full text-left p-3 xl:p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3 xl:space-x-4">
                <TrendingUp className="w-5 h-5 xl:w-6 xl:h-6 text-green-600" />
                <span className="text-sm xl:text-base font-medium text-gray-900 dark:text-white">Generate Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6 xl:space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white">
            {t('common.welcome')}, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base xl:text-lg">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="text-left xl:text-right">
          <p className="text-sm xl:text-base text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-lg xl:text-xl font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'user' && renderUserDashboard()}
      {user?.role === 'store_manager' && renderStoreManagerDashboard()}
    </div>
  );
};

export default Dashboard;