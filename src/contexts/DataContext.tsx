import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyRequest, IssuedProperty } from '../types';
import { propertiesAPI, requestsAPI, issuanceAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface DataContextType {
  properties: Property[];
  requests: PropertyRequest[];
  issuedProperties: IssuedProperty[];
  loading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addRequest: (request: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRequest: (id: string, updates: Partial<PropertyRequest>) => Promise<void>;
  issueProperty: (requestId: string, model22Number?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [issuedProperties, setIssuedProperties] = useState<IssuedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const transformProperty = (dbProperty: any): Property => ({
    id: dbProperty.id,
    number: dbProperty.number,
    name: dbProperty.name,
    modelNumber: dbProperty.model_number,
    model19Number: dbProperty.model_19_number,
    serialNumber: dbProperty.serial_number,
    date: dbProperty.date,
    companyName: dbProperty.company_name,
    measurement: dbProperty.measurement,
    quantity: dbProperty.quantity,
    unitPrice: dbProperty.unit_price,
    totalPrice: dbProperty.total_price,
    propertyType: dbProperty.property_type,
    availableQuantity: dbProperty.available_quantity,
    createdAt: dbProperty.created_at,
    updatedAt: dbProperty.updated_at
  });

  const transformRequest = (dbRequest: any): PropertyRequest => ({
    id: dbRequest.id,
    userId: dbRequest.user_id,
    userName: dbRequest.user_name,
    userDepartment: dbRequest.user_department,
    propertyId: dbRequest.property_id,
    propertyNumber: dbRequest.property_number,
    propertyName: dbRequest.property_name,
    quantityType: dbRequest.quantity_type,
    requestedQuantity: dbRequest.requested_quantity,
    approvedQuantity: dbRequest.approved_quantity,
    status: dbRequest.status,
    reason: dbRequest.reason,
    adminId: dbRequest.admin_id,
    storeManagerId: dbRequest.store_manager_id,
    createdAt: dbRequest.created_at,
    updatedAt: dbRequest.updated_at,
    issuedAt: dbRequest.issued_at,
    propertyType: dbRequest.property_type
  });

  const transformIssuedProperty = (dbIssued: any): IssuedProperty => ({
    id: dbIssued.id,
    requestId: dbIssued.request_id,
    propertyId: dbIssued.property_id,
    userId: dbIssued.user_id,
    userName: dbIssued.user_name,
    userDepartment: dbIssued.user_department,
    propertyNumber: dbIssued.property_number,
    propertyName: dbIssued.property_name,
    modelNumber: dbIssued.model_number,
    model19Number: dbIssued.model_19_number,
    model22Number: dbIssued.model_22_number,
    serialNumber: dbIssued.serial_number,
    quantityType: dbIssued.quantity_type,
    issuedQuantity: dbIssued.issued_quantity,
    issuedAt: dbIssued.issued_at,
    storeManagerId: dbIssued.store_manager_id,
    storeManagerName: dbIssued.store_manager_name,
    isPermanent: dbIssued.is_permanent,
    propertyType: dbIssued.property_type
  });

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [propertiesRes, requestsRes, issuedRes] = await Promise.all([
        propertiesAPI.getAll(),
        requestsAPI.getAll(),
        issuanceAPI.getIssuedProperties()
      ]);

      // 1. Map and set properties first
      const mappedProperties = propertiesRes.data.map(transformProperty);
      setProperties(mappedProperties);

      // 2. Map requests using the up-to-date properties
      const transformRequestWithProps = (dbRequest: any): PropertyRequest => {
        const property = mappedProperties.find((p: Property) => p.id === dbRequest.property_id);
        return {
          id: dbRequest.id,
          userId: dbRequest.user_id,
          userName: dbRequest.user_name,
          userDepartment: dbRequest.user_department,
          propertyId: dbRequest.property_id,
          propertyNumber: dbRequest.property_number,
          propertyName: dbRequest.property_name,
          quantityType: dbRequest.quantity_type,
          requestedQuantity: dbRequest.requested_quantity,
          approvedQuantity: dbRequest.approved_quantity,
          status: dbRequest.status,
          reason: dbRequest.reason,
          adminId: dbRequest.admin_id,
          storeManagerId: dbRequest.store_manager_id,
          createdAt: dbRequest.created_at,
          updatedAt: dbRequest.updated_at,
          issuedAt: dbRequest.issued_at,
          propertyType: property?.propertyType
        };
      };
      setRequests(requestsRes.data.map(transformRequestWithProps));

      // 3. Map issued properties using the up-to-date properties
      const transformIssuedPropertyWithProps = (dbIssued: any): IssuedProperty => {
        const property = mappedProperties.find((p: Property) => p.id === dbIssued.property_id);
        return {
          id: dbIssued.id,
          requestId: dbIssued.request_id,
          propertyId: dbIssued.property_id,
          userId: dbIssued.user_id,
          userName: dbIssued.user_name,
          userDepartment: dbIssued.user_department,
          propertyNumber: dbIssued.property_number,
          propertyName: dbIssued.property_name,
          modelNumber: dbIssued.model_number,
          model19Number: dbIssued.model_19_number,
          model22Number: dbIssued.model_22_number,
          serialNumber: dbIssued.serial_number,
          quantityType: dbIssued.quantity_type,
          issuedQuantity: dbIssued.issued_quantity,
          issuedAt: dbIssued.issued_at,
          storeManagerId: dbIssued.store_manager_id,
          storeManagerName: dbIssued.store_manager_name,
          isPermanent: dbIssued.is_permanent,
          propertyType: property?.propertyType
        };
      };
      setIssuedProperties(issuedRes.data.map(transformIssuedPropertyWithProps));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbData = {
        number: propertyData.number,
        name: propertyData.name,
        model_number: propertyData.modelNumber,
        model_19_number: propertyData.model19Number,
        serial_number: propertyData.serialNumber,
        date: propertyData.date,
        company_name: propertyData.companyName,
        measurement: propertyData.measurement,
        quantity: propertyData.quantity,
        unit_price: propertyData.unitPrice,
        property_type: propertyData.propertyType
      };

      await propertiesAPI.create(dbData);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.number) dbUpdates.number = updates.number;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.modelNumber) dbUpdates.model_number = updates.modelNumber;
      if (updates.model19Number) dbUpdates.model_19_number = updates.model19Number;
      if (updates.serialNumber) dbUpdates.serial_number = updates.serialNumber;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.companyName) dbUpdates.company_name = updates.companyName;
      if (updates.measurement) dbUpdates.measurement = updates.measurement;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
      if (updates.propertyType) dbUpdates.property_type = updates.propertyType;

      await propertiesAPI.update(id, dbUpdates);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await propertiesAPI.delete(id);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  };

  const addRequest = async (requestData: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbData = {
        property_id: requestData.propertyId,
        property_number: requestData.propertyNumber,
        property_name: requestData.propertyName,
        quantity_type: requestData.quantityType,
        requested_quantity: requestData.requestedQuantity
      };

      await requestsAPI.create(dbData);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding request:', error);
      throw error;
    }
  };

  const updateRequest = async (id: string, updates: Partial<PropertyRequest>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.approvedQuantity !== undefined) dbUpdates.approved_quantity = updates.approvedQuantity;
      if (updates.reason !== undefined) dbUpdates.reason = updates.reason;

      await requestsAPI.update(id, dbUpdates);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  };

  const issueProperty = async (requestId: string, model22Number?: string) => {
    try {
      await issuanceAPI.issueProperty(requestId, model22Number);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error issuing property:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const value: DataContextType = {
    properties,
    requests,
    issuedProperties,
    loading,
    addProperty,
    updateProperty,
    deleteProperty,
    addRequest,
    updateRequest,
    issueProperty,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};