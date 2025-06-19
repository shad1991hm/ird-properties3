import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, Check, X, Edit3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { PropertyRequest } from '../types';
import RequestDetails from './RequestDetails';

const Requests: React.FC = () => {
  const { requests, updateRequest } = useData();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const filteredRequests = requests
    .filter(request => {
      const matchesSearch = request.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'property': return a.propertyName.localeCompare(b.propertyName);
        case 'user': return a.userName.localeCompare(b.userName);
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'adjusted': return <AlertCircle className="w-4 h-4" />;
      case 'issued': return <Check className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'adjusted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'issued': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprove = (requestId: string) => {
    updateRequest(requestId, { 
      status: 'approved', 
      adminId: user?.id,
      updatedAt: new Date().toISOString()
    });
  };

  const handleReject = (requestId: string, reason?: string) => {
    updateRequest(requestId, { 
      status: 'rejected', 
      reason,
      adminId: user?.id,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAdjust = (requestId: string, approvedQuantity: number, reason?: string) => {
    updateRequest(requestId, { 
      status: 'adjusted', 
      approvedQuantity,
      reason,
      adminId: user?.id,
      updatedAt: new Date().toISOString()
    });
  };

  const getStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved' || r.status === 'adjusted').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      issued: requests.filter(r => r.status === 'issued').length
    };
  };

  const stats = getStats();

  const RequestCard: React.FC<{ request: PropertyRequest }> = ({ request }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">{request.propertyName}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">#{request.propertyNumber}</p>
            <p className="text-sm text-gray-500">Requested by {request.userName}</p>
            <p className="text-xs text-gray-400">{request.userDepartment}</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-1 capitalize">{request.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Requested Quantity</p>
            <p className="text-lg font-semibold text-gray-900">
              {request.requestedQuantity} {request.quantityType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {request.status === 'adjusted' ? 'Approved Quantity' : 'Status'}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {request.status === 'adjusted' && request.approvedQuantity 
                ? `${request.approvedQuantity} ${request.quantityType}`
                : request.status.charAt(0).toUpperCase() + request.status.slice(1)
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setSelectedRequest(request)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </button>
          
          {user?.role === 'admin' && request.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(request.id)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (selectedRequest) {
    return (
      <RequestDetails
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onAdjust={handleAdjust}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Requests</h1>
          <p className="text-gray-600">Manage and review property requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-purple-600">{stats.issued}</p>
            </div>
            <Check className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="adjusted">Adjusted</option>
              <option value="rejected">Rejected</option>
              <option value="issued">Issued</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="property">Sort by Property</option>
              <option value="user">Sort by User</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No property requests have been submitted yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Requests;