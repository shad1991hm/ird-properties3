import React, { useState } from 'react';
import { CheckSquare, Search, Filter, Package, User, Calendar, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { PropertyRequest } from '../types';
import IssueForm from './IssueForm';

const IssueProperties: React.FC = () => {
  const { requests, properties } = useData();
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('date');

  // Get approved and adjusted requests that haven't been issued yet
  const pendingIssuance = requests.filter(request => 
    (request.status === 'approved' || request.status === 'adjusted') && !request.issuedAt
  );

  const filteredRequests = pendingIssuance
    .filter(request => {
      const matchesSearch = request.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'property': return a.propertyName.localeCompare(b.propertyName);
        case 'user': return a.userName.localeCompare(b.userName);
        case 'quantity': return (b.approvedQuantity || b.requestedQuantity) - (a.approvedQuantity || a.requestedQuantity);
        default: return 0;
      }
    });

  const getStats = () => {
    return {
      total: pendingIssuance.length,
      approved: pendingIssuance.filter(r => r.status === 'approved').length,
      adjusted: pendingIssuance.filter(r => r.status === 'adjusted').length,
      totalQuantity: pendingIssuance.reduce((sum, r) => sum + (r.approvedQuantity || r.requestedQuantity), 0)
    };
  };

  const stats = getStats();

  const RequestCard: React.FC<{ request: PropertyRequest }> = ({ request }) => {
    const quantityToIssue = request.approvedQuantity || request.requestedQuantity;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">{request.propertyName}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">#{request.propertyNumber}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{request.userName}</span>
              </div>
              <p className="text-xs text-gray-400">{request.userDepartment}</p>
            </div>
            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                request.propertyType === 'permanent-temporary'
                  ? 'bg-purple-100 text-purple-800'
                  : request.propertyType === 'permanent'
                    ? 'bg-blue-100 text-blue-800'
                    : request.propertyType === 'temporary'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {request.propertyType === 'permanent-temporary'
                  ? 'Permanent-Temporary'
                  : request.propertyType === 'permanent'
                    ? 'Permanent'
                    : request.propertyType === 'temporary'
                      ? 'Temporary'
                      : 'Temporary'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Quantity to Issue</p>
              <p className="text-lg font-semibold text-gray-900">
                {quantityToIssue} {request.quantityType}
              </p>
              {request.status === 'adjusted' && (
                <p className="text-xs text-gray-500">
                  Originally: {request.requestedQuantity} {request.quantityType}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Approved Date</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(request.updatedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(request.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {request.reason && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Notes</p>
              <p className="text-sm text-gray-700">{request.reason}</p>
            </div>
          )}

          <button
            onClick={() => setSelectedRequest(request)}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            Issue Property
          </button>
        </div>
      </div>
    );
  };

  if (selectedRequest) {
    return (
      <IssueForm
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Properties</h1>
          <p className="text-gray-600">Process approved property requests for issuance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Issuance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Adjusted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.adjusted}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">~</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalQuantity}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
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
                placeholder="Search pending requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="property">Sort by Property</option>
              <option value="user">Sort by User</option>
              <option value="quantity">Sort by Quantity</option>
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
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending issuance</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'No requests match your search criteria'
              : 'All approved requests have been issued'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default IssueProperties;