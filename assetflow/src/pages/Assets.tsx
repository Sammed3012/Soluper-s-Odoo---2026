import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asset } from '../types';
import { useAppStore } from '../store/appStore';
import { Plus, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Assets() {
  const { user } = useAuthStore();
  const { departments, categories, fetchData } = useAppStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchData();
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'assets'));
    setAssets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));
    setLoading(false);
  };

  const handleAllocate = async (asset: Asset) => {
    if (asset.status !== 'Available') {
       alert('Asset is not available for allocation. Request transfer instead.');
       return;
    }
    const newStatus = 'Allocated';
    await updateDoc(doc(db, 'assets', asset.id), { status: newStatus, assignedToId: user?.id });
    
    // Log history
    await setDoc(doc(collection(db, 'assetHistory')), {
      assetId: asset.id,
      type: 'Allocation',
      description: `Asset allocated to ${user?.name}`,
      userId: user?.id || 'system',
      timestamp: Date.now()
    });
    
    fetchAssets();
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';

  const canRegister = user?.role === 'Admin' || user?.role === 'Asset Manager';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage all physical assets and resources.</p>
        </div>
        {canRegister && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAdd ? 'Cancel' : 'Register Asset'}
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Register New Asset</h2>
          <AssetForm 
            onSuccess={() => {
              setShowAdd(false);
              fetchAssets();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by tag, name, or serial number..."
              className="pl-9 w-full rounded-md border border-gray-300 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading assets...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No assets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/70 backdrop-blur-md divide-y divide-gray-200">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.tag}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(asset.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                        asset.status === 'Available' ? 'bg-green-100 text-green-800' :
                        asset.status === 'Allocated' ? 'bg-blue-100 text-blue-800' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.departmentId ? getDeptName(asset.departmentId) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleAllocate(asset)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Allocate
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AssetForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
  const { departments, categories } = useAppStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    condition: 'New',
    location: '',
    departmentId: '',
    isSharedBookable: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newRef = doc(collection(db, 'assets'));
      // Auto generate a simple tag for demo purposes
      const tag = `AF-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newAsset: Omit<Asset, 'id'> = {
        ...formData,
        tag,
        status: 'Available',
        createdAt: Date.now()
      };
      
      await setDoc(newRef, newAsset);
      
      // Also write history log
      await setDoc(doc(collection(db, 'assetHistory')), {
        assetId: newRef.id,
        type: 'StatusChange',
        description: 'Asset registered',
        userId: user?.id || 'system',
        timestamp: Date.now()
      });
      
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Failed to register asset');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text" required
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select 
            required
            value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Category...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Serial Number</label>
          <input 
            type="text" 
            value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select 
            required
            value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Department Owner</label>
          <select 
            value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">None / Company Wide</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input 
            type="text" required
            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" 
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input 
          type="checkbox" id="isSharedBookable"
          checked={formData.isSharedBookable} onChange={e => setFormData({...formData, isSharedBookable: e.target.checked})}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isSharedBookable" className="ml-2 block text-sm text-gray-900">
          This is a shared resource that can be booked (e.g. conference room, projector)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Register Asset'}
        </button>
      </div>
    </form>
  );
}
