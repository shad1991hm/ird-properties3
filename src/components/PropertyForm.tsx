import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Property } from '../types';

interface PropertyFormProps {
  property: Property | null;
  onClose: () => void;
  onSubmit: (property: Property) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSubmit }) => {
  const { addProperty, updateProperty } = useData();
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    modelNumber: '',
    model19Number: '',
    serialNumber: '',
    date: '',
    companyName: '',
    measurement: '',
    quantity: 0,
    unitPrice: 0,
    propertyType: 'permanent' as 'permanent' | 'temporary' | 'permanent-temporary'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        number: property.number,
        name: property.name,
        modelNumber: property.modelNumber,
        model19Number: property.model19Number,
        serialNumber: property.serialNumber,
        date: property.date,
        companyName: property.companyName,
        measurement: property.measurement,
        quantity: property.quantity,
        unitPrice: property.unitPrice,
        propertyType: property.propertyType
      });
    }
  }, [property]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) newErrors.number = 'Property number is required';
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.modelNumber.trim()) newErrors.modelNumber = 'Model number is required';
    if (!formData.model19Number.trim()) newErrors.model19Number = 'Model19 number is required';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.measurement.trim()) newErrors.measurement = 'Measurement unit is required';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (formData.unitPrice <= 0) newErrors.unitPrice = 'Unit price must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        number: formData.number,
        name: formData.name,
        modelNumber: formData.modelNumber,
        model19Number: formData.model19Number,
        serialNumber: formData.serialNumber,
        date: formData.date,
        companyName: formData.companyName,
        measurement: formData.measurement,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        totalPrice: formData.quantity * formData.unitPrice,
        propertyType: formData.propertyType,
        availableQuantity: formData.quantity
      };

      if (property) {
        updateProperty(property.id, propertyData as Property);
      } else {
        addProperty(propertyData as Property);
      }

      onSubmit(propertyData as Property);
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
            <h1 className="text-2xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600">
              {property ? 'Update property information' : 'Register a new property in the system'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Number *
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Class 1"
                />
                {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Desktop Computer"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number *
                </label>
                <input
                  type="text"
                  id="modelNumber"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.modelNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., HP-ProDesk-400"
                />
                {errors.modelNumber && <p className="mt-1 text-sm text-red-600">{errors.modelNumber}</p>}
              </div>

              <div>
                <label htmlFor="model19Number" className="block text-sm font-medium text-gray-700 mb-2">
                  Model19 Number *
                </label>
                <input
                  type="text"
                  id="model19Number"
                  name="model19Number"
                  value={formData.model19Number}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.model19Number ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., HP123456789"
                />
                {errors.model19Number && <p className="mt-1 text-sm text-red-600">{errors.model19Number}</p>}
              </div>

              <div>
                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number *
                </label>
                <input
                  type="text"
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.serialNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., HP123456789"
                />
                {errors.serialNumber && <p className="mt-1 text-sm text-red-600">{errors.serialNumber}</p>}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., HP Inc."
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
            </div>
          </div>

          {/* Quantity and Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="measurement" className="block text-sm font-medium text-gray-700 mb-2">
                  Measurement Unit *
                </label>
                <select
                  id="measurement"
                  name="measurement"
                  value={formData.measurement}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.measurement ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select unit</option>
                  <option value="pieces">Pieces</option>
                  <option value="liters">Liters</option>
                  <option value="meters">Meters</option>
                  <option value="kilograms">Kilograms</option>
                  <option value="boxes">Boxes</option>
                  <option value="reams">Reams</option>
                  <option value="sets">Sets</option>
                </select>
                {errors.measurement && <p className="mt-1 text-sm text-red-600">{errors.measurement}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.quantity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>

              <div>
                <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price (ETB) *
                </label>
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    errors.unitPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Price (ETB)
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                  {(formData.quantity * formData.unitPrice).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Classification</h3>
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
                <option value="permanent-temporary">Permanent-Temporary</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {formData.propertyType === 'permanent' && 'Items that are durable and long-lasting'}
                {formData.propertyType === 'temporary' && 'Consumable items or short-term use'}
                {formData.propertyType === 'permanent-temporary' && 'Items that can be both permanent and temporary'}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {property ? 'Update Property' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;