export type Role = 'Admin' | 'Department Head' | 'Asset Manager' | 'Employee';

export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  role: Role;
  status: UserStatus;
  createdAt: number;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
  parentId?: string;
  status: 'Active' | 'Inactive';
  createdAt: number;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  fields?: { name: string; type: string }[]; // e.g. warranty period
  createdAt: number;
}

export type AssetStatus = 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';

export interface Asset {
  id: string;
  tag: string; // e.g. AF-0001
  name: string;
  categoryId: string;
  serialNumber?: string;
  acquisitionDate?: number;
  acquisitionCost?: number;
  condition: string;
  location: string;
  isSharedBookable: boolean;
  status: AssetStatus;
  departmentId?: string; // which dept owns it
  assignedToId?: string; // current employee holding it
  expectedReturnDate?: number;
  createdAt: number;
}

export interface AssetHistory {
  id: string;
  assetId: string;
  type: 'Allocation' | 'Maintenance' | 'Audit' | 'StatusChange' | 'Transfer';
  description: string;
  userId: string; // who did it
  timestamp: number;
}

export type BookingStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  assetId: string;
  userId: string;
  departmentId?: string;
  startTime: number;
  endTime: number;
  status: BookingStatus;
  createdAt: number;
}

export type MaintenanceStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Resolved';

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  userId: string;
  issueDescription: string;
  priority: 'Low' | 'Medium' | 'High';
  status: MaintenanceStatus;
  technicianName?: string;
  createdAt: number;
  resolvedAt?: number;
}

export interface AuditCycle {
  id: string;
  name: string;
  departmentId?: string;
  startDate: number;
  endDate: number;
  auditorIds: string[];
  status: 'Open' | 'Closed';
  createdAt: number;
}

export type AuditStatus = 'Verified' | 'Missing' | 'Damaged';

export interface AuditRecord {
  id: string;
  auditCycleId: string;
  assetId: string;
  auditorId: string;
  status: AuditStatus;
  notes?: string;
  timestamp: number;
}
