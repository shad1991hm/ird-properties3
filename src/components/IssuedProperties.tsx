import React, { useState } from 'react';
import { Package, Search, User, Calendar, Download, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IssuedProperty } from '../types';
import IssuedPropertyDetails from './IssuedPropertyDetails';

const IssuedProperties: React.FC = () => {
  const { issuedProperties } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewingProperty, setViewingProperty] = useState<IssuedProperty | null>(null);

  const filteredProperties = issuedProperties
    .filter(property => {
      const matchesSearch = property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const type = (property as any).propertyType?.toLowerCase();
      const matchesFilter = filterType === 'all' ||
        (filterType === 'permanent' && (type === 'permanent' || (type === undefined && property.isPermanent))) ||
        (filterType === 'temporary' && (type === 'temporary' || (type === undefined && !property.isPermanent))) ||
        (filterType === 'permanent-temporary' && type === 'permanent-temporary');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime();
        case 'property': return a.propertyName.localeCompare(b.propertyName);
        case 'user': return a.userName.localeCompare(b.userName);
        case 'quantity': return b.issuedQuantity - a.issuedQuantity;
        default: return 0;
      }
    });

  const getStats = () => {
    return {
      total: issuedProperties.length,
      permanent: issuedProperties.filter(p => p.propertyType === 'permanent').length,
      temporary: issuedProperties.filter(p => p.propertyType === 'temporary').length,
      permanentTemporary: issuedProperties.filter(p => p.propertyType === 'permanent-temporary').length,
      totalQuantity: issuedProperties.reduce((sum, p) => sum + p.issuedQuantity, 0),
      thisMonth: issuedProperties.filter(p => {
        const issuedDate = new Date(p.issuedAt);
        const now = new Date();
        return issuedDate.getMonth() === now.getMonth() && issuedDate.getFullYear() === now.getFullYear();
      }).length
    };
  };

  const stats = getStats();

  // If viewing property details, show the details component
  if (viewingProperty) {
    return (
      <IssuedPropertyDetails
        issuedProperty={viewingProperty}
        onClose={() => setViewingProperty(null)}
      />
    );
  }

  const PropertyCard: React.FC<{ property: IssuedProperty }> = ({ property }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">{property.propertyName}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-1">#{property.propertyNumber}</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{property.userName}</span>
            </div>
            <p className="text-xs text-gray-400">{property.userDepartment}</p>
          </div>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              (property as any).propertyType === 'permanent-temporary'
                ? 'bg-purple-100 text-purple-800'
                : (property as any).propertyType === 'permanent'
                  ? 'bg-blue-100 text-blue-800'
                  : (property as any).propertyType === 'temporary'
                    ? 'bg-gray-100 text-gray-800'
                    : property.isPermanent
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
            }`}>
              {(property as any).propertyType === 'permanent-temporary'
                ? 'Permanent-Temporary'
                : (property as any).propertyType === 'permanent'
                  ? 'Permanent'
                  : (property as any).propertyType === 'temporary'
                    ? 'Temporary'
                    : property.isPermanent
                      ? 'Permanent'
                      : 'Temporary'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Issued Quantity</p>
            <p className="text-lg font-semibold text-gray-900">
              {property.issuedQuantity} {property.quantityType}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Issued Date</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(property.issuedAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(property.issuedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Model Number</p>
            <p className="text-sm font-medium text-gray-900">{property.modelNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Model 19 Number</p>
            <p className="text-sm font-medium text-gray-900">{property.model19Number}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Model 22 Number</p>
            <p className="text-sm font-medium text-gray-900">{property.model22Number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
            <p className="text-sm font-medium text-gray-900">{property.serialNumber}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Issued by: {property.storeManagerName}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setViewingProperty(property)}
            className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Details
          </button>
          {property.isPermanent && (
            <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-secondary-600 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issued Properties</h1>
          <p className="text-gray-600">Track and manage all issued properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permanent</p>
              <p className="text-2xl font-bold text-blue-600">{stats.permanent}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">P</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temporary</p>
              <p className="text-2xl font-bold text-gray-600">{stats.temporary}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xl">T</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permanent-Temporary</p>
              <p className="text-2xl font-bold text-purple-600">{stats.permanentTemporary}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">PT</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalQuantity}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">#</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600">{stats.thisMonth}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
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
                placeholder="Search issued properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              aria-label="Filter by property type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="permanent-temporary">Permanent-Temporary</option>
            </select>
            <select
              aria-label="Sort issued properties"
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

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issued properties found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No properties have been issued yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default IssuedProperties;