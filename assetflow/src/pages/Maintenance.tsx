import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MaintenanceRequest } from '../types';
import { Wrench, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, 'maintenance'));
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceRequest)));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="mt-1 text-sm text-gray-500">Track repair requests and asset maintenance.</p>
        </div>
        <button className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Raise Request
        </button>
      </div>

      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
           <div className="text-center py-12 text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <Wrench className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No maintenance requests</h3>
            <p className="mt-1 text-sm text-gray-500">Everything is running smoothly.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/70 backdrop-blur-md divide-y divide-gray-200">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.assetId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {req.issueDescription}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={cn("px-2 py-1 text-xs rounded-full font-medium", 
                          req.priority === 'High' ? 'bg-red-100 text-red-800' :
                          req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                       )}>{req.priority}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
    </motion.div>
  );
}
