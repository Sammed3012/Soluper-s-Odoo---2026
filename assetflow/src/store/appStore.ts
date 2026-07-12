import { create } from 'zustand';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Department, AssetCategory } from '../types';

interface AppState {
  departments: Department[];
  categories: AssetCategory[];
  loading: boolean;
  fetchData: () => Promise<void>;
  addDepartment: (dept: Omit<Department, 'id'>) => Promise<void>;
  updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
  addCategory: (category: Omit<AssetCategory, 'id'>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  departments: [],
  categories: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true });
    try {
      const [deptsSnap, catsSnap] = await Promise.all([
        getDocs(collection(db, 'departments')),
        getDocs(collection(db, 'categories'))
      ]);
      set({
        departments: deptsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Department)),
        categories: catsSnap.docs.map(c => ({ id: c.id, ...c.data() } as AssetCategory)),
        loading: false
      });
    } catch (error) {
      console.error("Error fetching app data:", error);
      set({ loading: false });
    }
  },
  addDepartment: async (dept) => {
    const newRef = doc(collection(db, 'departments'));
    const newDept = { id: newRef.id, ...dept };
    await setDoc(newRef, newDept);
    set(state => ({ departments: [...state.departments, newDept] }));
  },
  updateDepartment: async (id, data) => {
    await updateDoc(doc(db, 'departments', id), data);
    set(state => ({
      departments: state.departments.map(d => d.id === id ? { ...d, ...data } : d)
    }));
  },
  addCategory: async (category) => {
    const newRef = doc(collection(db, 'categories'));
    const newCat = { id: newRef.id, ...category };
    await setDoc(newRef, newCat);
    set(state => ({ categories: [...state.categories, newCat] }));
  }
}));
