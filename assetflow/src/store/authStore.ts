import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'mock-admin-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    status: 'Active',
    createdAt: Date.now()
  },
  loading: false,
  initialize: () => {},
  logout: async () => {}
}));

