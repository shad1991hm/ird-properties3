import React, { useState } from 'react';
import { X, CheckSquare, Package, User, Calendar, FileText, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { PropertyRequest } from '../types';
import jsPDF from 'jspdf';

interface IssueFormProps {
  request: PropertyRequest;
  onClose: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ request, onClose }) => {
  const { issueProperty, properties } = useData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [model22Number, setModel22Number] = useState('');

  const property = properties.find(p => p.id === request.propertyId);
  const quantityToIssue = request.approvedQuantity || request.requestedQuantity;

  const handleIssue = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (!model22Number.trim()) {
        alert('Model 22 Number is required!');
        setIsSubmitting(false);
        return;
      }
      await issueProperty(request.id, model22Number);
      
      // Generate PDF if it's a permanent property
      if (property?.propertyType === 'permanent') {
        generateIssuanceReport();
      }
      
      onClose();
    } catch (error) {
      console.error('Error issuing property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateIssuanceReport = () => {
    if (!property) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY ISSUANCE REPORT', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Ethiopian Defence University', pageWidth / 2, 45, { align: 'center' });
    doc.text('Institute of Research and Development (IRD)', pageWidth / 2, 55, { align: 'center' });

    // Property Information
    let yPos = 80;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Information', margin, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const propertyInfo = [
      ['Property Number:', property.number],
      ['Property Name:', property.name],
      ['Model Number:', property.modelNumber],
      ['Model 19 Number:', property.model19Number],
      ['Model 22 Number:', model22Number],
      ['Serial Number:', property.serialNumber],
      ['Quantity Type:', property.measurement],
      ['Issued Quantity:', `${quantityToIssue}`],
      ['Company:', property.companyName]
    ];

    propertyInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 60, yPos);
      yPos += 10;
    });

    // Recipient Information
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recipient Information', margin, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const recipientInfo = [
      ['Name:', request.userName],
      ['Department:', request.userDepartment],
      ['Request Date:', new Date(request.createdAt).toLocaleDateString()],
      ['Approval Date:', new Date(request.updatedAt).toLocaleDateString()],
      ['Issuance Date:', new Date().toLocaleDateString()]
    ];

    recipientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 60, yPos);
      yPos += 10;
    });

    // Store Manager Information
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Issued By', margin, yPos);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Store Manager:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name || '', margin + 60, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date & Time:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString(), margin + 60, yPos);

    // Signature section
    yPos += 30;
    doc.setFont('helvetica', 'bold');
    doc.text('Signatures:', margin, yPos);
    
    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.text('Recipient: ________________________', margin, yPos);
    doc.text('Date: ____________', margin + 120, yPos);
    
    yPos += 20;
    doc.text('Store Manager: ________________________', margin, yPos);
    doc.text('Date: ____________', margin + 120, yPos);

    // Footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an official document generated by IRD Properties Management System', pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF
    doc.save(`Property_Issuance_${property.number}_${request.userName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Issue Property</h1>
            <p className="text-gray-600">Process property issuance and generate documentation</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Issuance Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Property Number</p>
                <p className="font-medium text-gray-900">{request.propertyNumber}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Property Name</p>
                <p className="font-medium text-gray-900">{request.propertyName}</p>
              </div>
            </div>
            {property && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model Number</p>
                    <p className="font-medium text-gray-900">{property.modelNumber}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M19</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model 19 Number</p>
                    <p className="font-medium text-gray-900">{property.model19Number}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M22</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Model 22 Number *</p>
                    <input
                      type="text"
                      value={model22Number}
                      onChange={(e) => setModel22Number(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter Model 22 Number"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="font-medium text-gray-900">{property.serialNumber}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-400 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{property.companyName}</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-primary-500 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">#</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity to Issue</p>
                <p className="font-medium text-gray-900">
                  {quantityToIssue} {request.quantityType}
                </p>
                {request.status === 'adjusted' && (
                  <p className="text-xs text-gray-500">
                    Originally requested: {request.requestedQuantity} {request.quantityType}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipient Details</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{request.userName}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-gray-400 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{request.userDepartment}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Request Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Approval Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(request.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded mt-1 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {request.reason && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Approval Notes</p>
              <p className="font-medium text-gray-900">{request.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Store Manager Notes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Issuance Notes (Optional)</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          placeholder="Add any notes about the issuance process..."
        />
      </div>

      {/* Property Type Notice */}
      {property?.propertyType === 'permanent' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Download className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Permanent Property Notice</h4>
              <p className="text-blue-800 mb-3">
                This is a permanent property. Upon issuance, a detailed PDF report will be automatically generated 
                containing all property details, recipient information, and signature fields for official documentation.
              </p>
              <div className="text-sm text-blue-700">
                <p><strong>The report will include:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Complete property information and specifications</li>
                  <li>Recipient details and department information</li>
                  <li>Issuance date and store manager signature</li>
                  <li>Official university letterhead and formatting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleIssue}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <CheckSquare className="w-5 h-5 mr-2" />
          )}
          {property?.propertyType === 'permanent' ? 'Issue & Generate Report' : 'Issue Property'}
        </button>
      </div>
    </div>
  );
};

export default IssueForm;