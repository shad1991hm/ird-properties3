export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user' | 'store_manager';
  department?: string;
  email?: string;
}

export interface Property {
  id: string;
  number: string;
  name: string;
  modelNumber: string;
  serialNumber: string;
  date: string;
  companyName: string;
  measurement: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  propertyType: 'permanent' | 'temporary' | 'permanent-temporary';
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyRequest {
  id: string;
  userId: string;
  userName: string;
  userDepartment: string;
  propertyId: string;
  propertyNumber: string;
  propertyName: string;
  quantityType: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  status: 'pending' | 'approved' | 'rejected' | 'adjusted' | 'issued';
  reason?: string;
  adminId?: string;
  storeManagerId?: string;
  createdAt: string;
  updatedAt: string;
  issuedAt?: string;
  propertyType?: 'permanent' | 'temporary' | 'permanent-temporary';
}

export interface IssuedProperty {
  id: string;
  requestId: string;
  propertyId: string;
  userId: string;
  userName: string;
  userDepartment: string;
  propertyNumber: string;
  propertyName: string;
  modelNumber: string;
  serialNumber: string;
  quantityType: string;
  issuedQuantity: number;
  issuedAt: string;
  storeManagerId: string;
  storeManagerName: string;
  isPermanent: boolean;
  propertyType?: 'permanent' | 'temporary' | 'permanent-temporary';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface Language {
  code: 'en' | 'am';
  name: string;
}