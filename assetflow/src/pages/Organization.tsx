import { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Department, AssetCategory } from '../types';
import { cn } from '../lib/utils';
import { Shield, Building2, Package, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { motion } from 'motion/react';

export default function Organization() {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');
  const fetchData = useAppStore(state => state.fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organization Setup</h1>
        <p className="mt-1 text-sm text-gray-500">Manage master data, departments, categories, and user roles.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'departments', name: 'Departments', icon: Building2 },
            { id: 'categories', name: 'Asset Categories', icon: Package },
            { id: 'employees', name: 'Employee Directory', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center'
                )}
              >
                <Icon className={cn('mr-2 h-5 w-5', activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400')} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg">
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'employees' && <EmployeesTab />}
      </div>
    </motion.div>
  );
}

function DepartmentsTab() {
  const { departments, addDepartment, updateDepartment } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await addDepartment({
      name: newDeptName,
      status: 'Active',
      createdAt: Date.now()
    });
    setNewDeptName('');
    setShowAdd(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Departments</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {showAdd ? 'Cancel' : 'Add Department'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <input 
              type="text" 
              value={newDeptName}
              onChange={e => setNewDeptName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required 
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Save
          </button>
        </form>
      )}

      {departments.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-12 border border-dashed rounded-md border-gray-300">No departments found.</div>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {departments.map(dept => (
            <li key={dept.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                <p className="text-xs text-gray-500">Status: {dept.status}</p>
              </div>
              <button 
                onClick={() => updateDepartment(dept.id, { status: dept.status === 'Active' ? 'Inactive' : 'Active' })}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Toggle Status
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { categories, addCategory } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addCategory({
      name: newName,
      createdAt: Date.now()
    });
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Asset Categories</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          {showAdd ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Category Name (e.g. Electronics)</label>
            <input 
              type="text" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required 
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
            Save
          </button>
        </form>
      )}

      {categories.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-12 border border-dashed rounded-md border-gray-300">No categories found.</div>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {categories.map(cat => (
            <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmployeesTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, role: string) => {
    await updateDoc(doc(db, 'users', userId), { role });
    setUsers(users.map(u => u.id === userId ? { ...u, role: role as any } : u));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Employee Directory</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white/70 backdrop-blur-md placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-md divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.departmentId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    user.status === 'Active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
