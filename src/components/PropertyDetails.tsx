import React from 'react';
import { X, Edit, Package, Calendar, Building, Hash, Barcode, DollarSign } from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onEdit: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onEdit }) => {
  const getStockStatus = () => {
    const percentage = (property.availableQuantity / property.quantity) * 100;
    if (percentage <= 10) return { status: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' };
    if (percentage <= 25) return { status: 'Low', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (percentage <= 50) return { status: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { status: 'Good', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Package className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-gray-600">Property #{property.number}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Property Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Hash className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Property Number</p>
                  <p className="font-medium text-gray-900">{property.number}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Property Name</p>
                  <p className="font-medium text-gray-900">{property.name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Barcode className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Model Number</p>
                  <p className="font-medium text-gray-900">{property.modelNumber}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Barcode className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium text-gray-900">{property.serialNumber}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(property.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium text-gray-900">{property.companyName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Measurement Unit</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{property.measurement}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Quantity</p>
                <p className="text-lg font-medium text-gray-900">
                  {property.quantity.toLocaleString()} {property.measurement}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Unit Price</p>
                <p className="text-lg font-medium text-gray-900">
                  {property.unitPrice.toLocaleString()} ETB
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Value</p>
                <p className="text-lg font-medium text-gray-900">
                  {property.totalPrice.toLocaleString()} ETB
                </p>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification</h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                property.propertyType === 'permanent' ? 'bg-blue-100 text-blue-800' :
                property.propertyType === 'temporary' ? 'bg-gray-100 text-gray-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {property.propertyType.replace('-', ' ').toUpperCase()}
              </span>
              <p className="text-sm text-gray-500">
                {property.propertyType === 'permanent' && 'Durable and long-lasting items'}
                {property.propertyType === 'temporary' && 'Consumable or short-term use items'}
                {property.propertyType === 'permanent-temporary' && 'Items that can be both permanent and temporary'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Available</span>
                  <span className="text-sm font-medium text-gray-900">
                    {property.availableQuantity} / {property.quantity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      stockStatus.status === 'Critical' ? 'bg-red-500' :
                      stockStatus.status === 'Low' ? 'bg-orange-500' :
                      stockStatus.status === 'Medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(property.availableQuantity / property.quantity) * 100}%` }}
                  />
                </div>
              </div>
              <div className={`px-3 py-2 rounded-lg border ${stockStatus.color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status: {stockStatus.status}</span>
                  <span className="text-sm">
                    {Math.round((property.availableQuantity / property.quantity) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Issued Quantity</span>
                <span className="text-sm font-medium text-gray-900">
                  {property.quantity - property.availableQuantity} {property.measurement}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Remaining Value</span>
                <span className="text-sm font-medium text-gray-900">
                  {(property.availableQuantity * property.unitPrice).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Issued Value</span>
                <span className="text-sm font-medium text-gray-900">
                  {((property.quantity - property.availableQuantity) * property.unitPrice).toLocaleString()} ETB
                </span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(property.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(property.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;