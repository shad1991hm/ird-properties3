import React, { useState } from 'react';
import { X, Send, Package } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Property } from '../types';

interface RequestFormProps {
  property: Property;
  onClose: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ property, onClose }) => {
  const { addRequest } = useData();
  const { user } = useAuth();
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requestedQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (requestedQuantity > property.availableQuantity) {
      setError(`Requested quantity exceeds available quantity (${property.availableQuantity})`);
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      addRequest({
        userId: user.id,
        userName: user.name,
        userDepartment: user.department || 'Unknown Department',
        propertyId: property.id,
        propertyNumber: property.number,
        propertyName: property.name,
        quantityType: property.measurement,
        requestedQuantity,
        status: 'pending'
      });

      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Request Property</h1>
            <p className="text-gray-600">Submit a request for property allocation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Property Number</p>
            <p className="font-medium text-gray-900">{property.number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Name</p>
            <p className="font-medium text-gray-900">{property.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Model Number</p>
            <p className="font-medium text-gray-900">{property.modelNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Available Quantity</p>
            <p className="font-medium text-gray-900">
              {property.availableQuantity} {property.measurement}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium text-gray-900">{property.companyName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Type</p>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              property.propertyType === 'permanent' ? 'bg-blue-100 text-blue-800' :
              property.propertyType === 'temporary' ? 'bg-gray-100 text-gray-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {property.propertyType.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-2">
                  Requester Name
                </label>
                <input
                  type="text"
                  id="requesterName"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  value={user?.department || 'Unknown Department'}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="quantityType" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Type
                </label>
                <input
                  type="text"
                  id="quantityType"
                  value={property.measurement}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="requestedQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Quantity *
                </label>
                <input
                  type="number"
                  id="requestedQuantity"
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  max={property.availableQuantity}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                  disabled={isSubmitting}
                />
                
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Request Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Property: {property.name} (#{property.number})</p>
              <p>Requested Quantity: {requestedQuantity} {property.measurement}</p>
              <p>Requester: {user?.name}</p>
              <p>Department: {user?.department}</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || requestedQuantity <= 0 || requestedQuantity > property.availableQuantity}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;