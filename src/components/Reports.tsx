import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar, Package, FileText, TrendingUp, PieChart } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const { properties, requests, issuedProperties } = useData();
  const [selectedReport, setSelectedReport] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');

  const getFilteredData = () => {
    let filteredProperties = properties;
    let filteredRequests = requests;
    let filteredIssued = issuedProperties;

    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      filteredProperties = properties.filter(p => p.propertyType === propertyTypeFilter);
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredRequests = requests.filter(r => new Date(r.createdAt) >= startDate);
      filteredIssued = issuedProperties.filter(ip => new Date(ip.issuedAt) >= startDate);
    }

    return { filteredProperties, filteredRequests, filteredIssued };
  };

  const { filteredProperties, filteredRequests, filteredIssued } = getFilteredData();

  const getOverviewStats = () => {
    const totalProperties = filteredProperties.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = filteredProperties.reduce((sum, p) => sum + p.totalPrice, 0);
    const availableItems = filteredProperties.reduce((sum, p) => sum + p.availableQuantity, 0);
    const issuedItems = filteredIssued.reduce((sum, ip) => sum + ip.issuedQuantity, 0);
    const pendingRequests = filteredRequests.filter(r => r.status === 'pending').length;
    const approvedRequests = filteredRequests.filter(r => r.status === 'approved' || r.status === 'adjusted').length;

    return {
      totalProperties: filteredProperties.length,
      totalItems: totalProperties,
      totalValue,
      availableItems,
      issuedItems,
      pendingRequests,
      approvedRequests,
      utilizationRate: totalProperties > 0 ? ((totalProperties - availableItems) / totalProperties * 100) : 0
    };
  };

  const getPropertyTypeData = () => {
    const permanent = filteredProperties.filter(p => p.propertyType === 'permanent').length;
    const temporary = filteredProperties.filter(p => p.propertyType === 'temporary').length;
    const permanentTemp = filteredProperties.filter(p => p.propertyType === 'permanent-temporary').length;

    return {
      labels: ['Permanent', 'Temporary', 'Permanent-Temporary'],
      datasets: [{
        data: [permanent, temporary, permanentTemp],
        backgroundColor: ['#3B82F6', '#6B7280', '#8B5CF6'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  const getMonthlyRequestsData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map((month, index) => {
      return filteredRequests.filter(r => {
        const requestDate = new Date(r.createdAt);
        return requestDate.getMonth() === index && requestDate.getFullYear() === currentYear;
      }).length;
    });

    return {
      labels: months,
      datasets: [{
        label: 'Requests',
        data: monthlyData,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    };
  };

  const getTopRequestedProperties = () => {
    const propertyRequests = filteredRequests.reduce((acc, request) => {
      const key = request.propertyName;
      acc[key] = (acc[key] || 0) + (request.approvedQuantity || request.requestedQuantity);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(propertyRequests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const stats = getOverviewStats();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY MANAGEMENT REPORT', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Ethiopian Defence University', pageWidth / 2, 45, { align: 'center' });
    doc.text('Institute of Research and Development (IRD)', pageWidth / 2, 55, { align: 'center' });

    // Report Info
    let yPos = 75;
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
    doc.text(`Report Type: ${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)}`, margin, yPos + 10);
    doc.text(`Date Range: ${dateRange === 'all' ? 'All Time' : dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, margin, yPos + 20);

    // Overview Statistics
    yPos += 40;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview Statistics', margin, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const overviewData = [
      ['Total Properties:', stats.totalProperties.toString()],
      ['Total Items:', stats.totalItems.toLocaleString()],
      ['Total Value:', `${stats.totalValue.toLocaleString()} ETB`],
      ['Available Items:', stats.availableItems.toLocaleString()],
      ['Issued Items:', stats.issuedItems.toLocaleString()],
      ['Pending Requests:', stats.pendingRequests.toString()],
      ['Approved Requests:', stats.approvedRequests.toString()],
      ['Utilization Rate:', `${stats.utilizationRate.toFixed(1)}%`]
    ];

    overviewData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 80, yPos);
      yPos += 10;
    });

    // Property Breakdown
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Breakdown by Type', margin, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const permanent = filteredProperties.filter(p => p.propertyType === 'permanent').length;
    const temporary = filteredProperties.filter(p => p.propertyType === 'temporary').length;
    const permanentTemp = filteredProperties.filter(p => p.propertyType === 'permanent-temporary').length;

    doc.text(`Permanent Properties: ${permanent}`, margin, yPos);
    doc.text(`Temporary Properties: ${temporary}`, margin, yPos + 10);
    doc.text(`Permanent-Temporary Properties: ${permanentTemp}`, margin, yPos + 20);

    // Top Requested Properties
    if (selectedReport === 'requests') {
      yPos += 40;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Requested Properties', margin, yPos);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const topRequested = getTopRequestedProperties().slice(0, 5);
      topRequested.forEach(([property, quantity], index) => {
        doc.text(`${index + 1}. ${property}: ${quantity} units`, margin, yPos);
        yPos += 10;
      });
    }

    // Footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This report was generated by IRD Properties Management System', pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF
    doc.save(`Property_Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const stats = getOverviewStats();

  const ReportCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
  }> = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span className="text-sm text-green-600 font-medium">{change}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into property management</p>
        </div>
        <button
          onClick={generatePDFReport}
          className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="properties">Properties</option>
              <option value="requests">Requests</option>
              <option value="issued">Issued Properties</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <select
              value={propertyTypeFilter}
              onChange={(e) => setPropertyTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="temporary">Temporary</option>
              <option value="permanent-temporary">Permanent-Temporary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Package}
          color="bg-primary-600"
        />
        <ReportCard
          title="Total Value"
          value={`${stats.totalValue.toLocaleString()} ETB`}
          icon={TrendingUp}
          color="bg-secondary-600"
        />
        <ReportCard
          title="Available Items"
          value={stats.availableItems.toLocaleString()}
          icon={Package}
          color="bg-green-600"
        />
        <ReportCard
          title="Utilization Rate"
          value={`${stats.utilizationRate.toFixed(1)}%`}
          icon={BarChart3}
          color="bg-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
          <div className="h-64">
            <Pie
              data={getPropertyTypeData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Requests (2024)</h3>
          <div className="h-64">
            <Bar
              data={getMonthlyRequestsData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      {selectedReport === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Requested Properties</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Property Name</th>
                  <th className="px-6 py-3">Total Requested</th>
                  <th className="px-6 py-3">Requests Count</th>
                </tr>
              </thead>
              <tbody>
                {getTopRequestedProperties().map(([property, quantity], index) => {
                  const requestCount = filteredRequests.filter(r => r.propertyName === property).length;
                  return (
                    <tr key={property} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4">{property}</td>
                      <td className="px-6 py-4">{quantity}</td>
                      <td className="px-6 py-4">{requestCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'properties' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Inventory Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Property</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Total Quantity</th>
                  <th className="px-6 py-3">Available</th>
                  <th className="px-6 py-3">Issued</th>
                  <th className="px-6 py-3">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.slice(0, 10).map((property) => {
                  const issued = property.quantity - property.availableQuantity;
                  const utilization = (issued / property.quantity) * 100;
                  return (
                    <tr key={property.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{property.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          property.propertyType === 'permanent' ? 'bg-blue-100 text-blue-800' :
                          property.propertyType === 'temporary' ? 'bg-gray-100 text-gray-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {property.propertyType}
                        </span>
                      </td>
                      <td className="px-6 py-4">{property.quantity}</td>
                      <td className="px-6 py-4">{property.availableQuantity}</td>
                      <td className="px-6 py-4">{issued}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{utilization.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;