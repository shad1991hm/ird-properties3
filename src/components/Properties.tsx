import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Eye, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Property } from '../types';
import PropertyForm from './PropertyForm';
import PropertyDetails from './PropertyDetails';
import { jsPDF } from 'jspdf';

const Properties: React.FC = () => {
  const { properties, addProperty, updateProperty, deleteProperty } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Generate PDF for a specific group
  const generateGroupPDF = (group: { prefix: string; properties: Property[] }) => {
    const doc = new jsPDF();
    let yPos = 20;
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Property Group: Class ${group.prefix}`, 14, yPos);
    yPos += 10;
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, yPos);
    yPos += 15;
    
    // Add table headers
    doc.setFontSize(12);
    doc.text('#', 14, yPos);
    doc.text('Name', 24, yPos);
    doc.text('Number', 64, yPos);
    doc.text('Quantity', 94, yPos);
    doc.text('Value', 134, yPos);
    doc.text('Status', 164, yPos);
    yPos += 8;
    
    // Draw line under headers
    doc.line(14, yPos, 190, yPos);
    yPos += 10;
    
    // Add table rows
    doc.setFontSize(10);
    group.properties.forEach((property, idx) => {
      const stockStatus = getStockStatus(property);
      doc.text((idx + 1).toString(), 14, yPos);
      doc.text(property.name.substring(0, 20), 24, yPos);
      doc.text(property.number, 64, yPos);
      doc.text(`${property.availableQuantity}/${property.quantity} ${property.measurement}`, 94, yPos);
      doc.text(`${property.totalPrice.toLocaleString()} ETB`, 134, yPos);
      doc.text(stockStatus.status, 164, yPos);
      yPos += 8;
      
      // Add space between rows
      if (idx < group.properties.length - 1) {
        yPos += 4;
      }
      
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Add summary
    yPos += 15;
    doc.setFontSize(12);
    const totalValue = group.properties.reduce((sum, p) => sum + p.totalPrice, 0);
    const totalItems = group.properties.length;
    doc.text(`Total Items: ${totalItems}`, 14, yPos);
    yPos += 8;
    doc.text(`Total Value: ${totalValue.toLocaleString()} ETB`, 14, yPos);
    
    doc.save(`Property_Group_${group.prefix}.pdf`);
  };

  // Filter properties based on search and filter type
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.serialNumber && property.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || property.propertyType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'date': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'quantity': return b.quantity - a.quantity;
      case 'value': return b.totalPrice - a.totalPrice;
      default: return 0;
    }
  });

  // Group properties by their number prefix
  const groupedProperties = filteredProperties.reduce((acc, property) => {
    if (filterType !== 'all') return acc;
    
    const prefix = property.number.split('-')[0];
    if (!acc[prefix]) {
      acc[prefix] = [];
    }
    acc[prefix].push(property);
    return acc;
  }, {} as Record<string, Property[]>);

  // Sort groups and properties within groups
  const sortedGroups = Object.entries(groupedProperties)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prefix, props]) => ({
      prefix,
      properties: props.sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'date': return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'quantity': return b.quantity - a.quantity;
          case 'value': return b.totalPrice - a.totalPrice;
          default: return 0;
        }
      })
    }));

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      deleteProperty(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

  const handleSubmitProperty = (property: Property) => {
    if (editingProperty) {
      // If editing, update the specific property
      updateProperty(editingProperty.id, property);
    } else {
      addProperty(property);
    }
    handleCloseForm();
  };

  const toggleGroup = (prefix: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [prefix]: !prev[prefix]
    }));
  };

  const getStockStatus = (property: Property) => {
    const percentage = (property.availableQuantity / property.quantity) * 100;
    if (percentage <= 10) return { status: 'Critical', color: 'bg-red-100 text-red-800' };
    if (percentage <= 25) return { status: 'Low', color: 'bg-orange-100 text-orange-800' };
    if (percentage <= 50) return { status: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Good', color: 'bg-green-100 text-green-800' };
  };

  if (showForm) {
    return (
      <PropertyForm
        property={editingProperty}
        onClose={handleCloseForm}
        onSubmit={handleSubmitProperty}
      />
    );
  }

  if (viewingProperty) {
    return (
      <PropertyDetails
        property={viewingProperty}
        onClose={() => setViewingProperty(null)}
        onEdit={() => {
          setEditingProperty(viewingProperty);
          setViewingProperty(null);
          setShowForm(true);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage your property inventory</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          title="Add new property"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {properties.reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString()} ETB
              </p>
            </div>
            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
              <span className="text-secondary-600 font-bold">ETB</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {properties.filter(p => (p.availableQuantity / p.quantity) <= 0.25).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xl">⚠</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Items</p>
              <p className="text-2xl font-bold text-green-600">
                {properties.reduce((sum, p) => sum + p.availableQuantity, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
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
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                aria-label="Search properties"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Filter by property type"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="permanent-temporary">Permanent-Temporary</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Sort properties by"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="value">Sort by Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filterType === 'all' ? (
          /* Grouped View (All Types) */
          sortedGroups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedGroups.map((group, groupIndex) => {
                    const totalItems = group.properties.length;
                    const totalValue = group.properties.reduce((sum, p) => sum + p.totalPrice, 0);
                    const isExpanded = expandedGroups[group.prefix] ?? true;

                    return (
                      <React.Fragment key={group.prefix}>
                        <tr 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleGroup(group.prefix)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {groupIndex + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">Class {group.prefix}</div>
                                <div className="text-sm text-gray-500">{totalItems} items</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {totalItems}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {totalValue.toLocaleString()} ETB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                generateGroupPDF(group);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Download PDF"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(group.prefix);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                              title={isExpanded ? "Collapse group" : "Expand group"}
                            >
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && group.properties.map((property, idx) => {
                          const stockStatus = getStockStatus(property);
                          return (
                            <tr key={property.id} className="bg-gray-50 hover:bg-gray-100">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{property.name}</div>
                                    <div className="text-sm text-gray-500">#{property.number}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {property.availableQuantity} / {property.quantity} {property.measurement}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {property.totalPrice.toLocaleString()} ETB
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                                  {stockStatus.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                  onClick={() => setViewingProperty(property)}
                                  className="text-primary-600 hover:text-primary-900"
                                  title="View details"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleEdit(property)}
                                  className="text-secondary-600 hover:text-secondary-900"
                                  title="Edit property"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(property.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete property"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first property'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  title="Add new property"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Property
                </button>
              )}
            </div>
          )
        ) : (
          /* Flat View (Filtered by Type) */
          sortedProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedProperties.map((property, idx) => {
                    const stockStatus = getStockStatus(property);
                    return (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{property.name}</div>
                              <div className="text-sm text-gray-500">#{property.number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {property.availableQuantity} / {property.quantity} {property.measurement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {property.totalPrice.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setViewingProperty(property)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(property)}
                            className="text-secondary-600 hover:text-secondary-900"
                            title="Edit property"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete property"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'No properties of this type found'
                }
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Properties;