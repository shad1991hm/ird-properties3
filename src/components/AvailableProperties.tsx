import React, { useState } from 'react';
import { Package, Search, ShoppingCart } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Property } from '../types';
import RequestForm from './RequestForm';

const AvailableProperties: React.FC = () => {
  const { properties } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  const availableProperties = properties.filter(property => property.availableQuantity > 0);

  const filteredProperties = availableProperties
    .filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || property.propertyType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'availability': return b.availableQuantity - a.availableQuantity;
        case 'type': return a.propertyType.localeCompare(b.propertyType);
        default: return 0;
      }
    });

  const handleRequestProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowRequestForm(true);
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">{property.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">#{property.number}</p>
              <p className="text-sm text-gray-500">{property.companyName}</p>
            </div>
            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                property.propertyType === 'permanent' ? 'bg-blue-100 text-blue-800' :
                property.propertyType === 'temporary' ? 'bg-gray-100 text-gray-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {property.propertyType.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Model Number</p>
              <p className="text-sm font-medium text-gray-900">{property.modelNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Serial Number</p>
              <p className="text-sm font-medium text-gray-900">{property.serialNumber}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleRequestProperty(property)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Request Property
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showRequestForm && selectedProperty) {
    return (
      <RequestForm
        property={selectedProperty}
        onClose={() => {
          setShowRequestForm(false);
          setSelectedProperty(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Properties</h1>
          <p className="text-gray-600">Browse and request available properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Properties</p>
              <p className="text-2xl font-bold text-gray-900">{availableProperties.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Permanent</p>
              <p className="text-2xl font-bold text-blue-600">
                {availableProperties.filter(p => p.propertyType === 'permanent').length}
              </p>
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
              <p className="text-2xl font-bold text-gray-600">
                {availableProperties.filter(p => p.propertyType === 'temporary').length}
              </p>
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
              <p className="text-2xl font-bold text-purple-600">
                {availableProperties.filter(p => p.propertyType === 'permanent-temporary').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">PT</span>
            </div>
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
                placeholder="Search available properties..."
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
              aria-label="Sort properties"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="availability">Sort by Availability</option>
              <option value="type">Sort by Type</option>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No available properties found</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No properties are currently available for request'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableProperties;