import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';

import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Properties from './components/Properties';
import Requests from './components/Requests';
import AvailableProperties from './components/AvailableProperties';
import MyRequests from './components/MyRequests';
import IssueProperties from './components/IssueProperties';
import IssuedProperties from './components/IssuedProperties';
import Reports from './components/Reports';
import Settings from './components/Settings';

// Protected layout that checks authentication before rendering nested routes
const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <DataProvider>
      <Layout />
    </DataProvider>
  );
};

// Initial route handling: redirect authenticated users to dashboard
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
};

// Define the route structure outside of components to avoid unnecessary re-creation
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'properties', element: <Properties /> },
      { path: 'requests', element: <Requests /> },
      { path: 'available-properties', element: <AvailableProperties /> },
      { path: 'my-requests', element: <MyRequests /> },
      { path: 'issue-properties', element: <IssueProperties /> },
      { path: 'issued-properties', element: <IssuedProperties /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

// Mount the Router
const AppContent: React.FC = () => <RouterProvider router={router} />;

// Root application with providers
const App: React.FC = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
