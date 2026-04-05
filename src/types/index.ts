export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  userType: 'Default User' | 'Future User Lvl 1' | 'Future User Lvl 2';
  status: 'Active' | 'Pending' | 'Inactive';
  joinedDate: string;
  avatar?: string;
}

export interface CreditRecord {
  id: string;
  name: string;
  field: string;
  credits: number;
  progress: number;
  marketValue: number;
  status: 'red' | 'yellow' | 'green';
  lastUpdated: string;
}

export interface DashboardStats {
  activeWells: number;
  totalCredits: number;
  projectedMktValue: number;
  redCount: number;
  yellowCount: number;
  greenCount: number;
}
