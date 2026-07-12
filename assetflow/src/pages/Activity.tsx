import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AssetHistory } from '../types';
import { format } from 'date-fns';
import { Activity as ActivityIcon, ArrowRightLeft, Wrench, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Activity() {
  const [logs, setLogs] = useState<AssetHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'assetHistory'), orderBy('timestamp', 'desc'), limit(50));
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AssetHistory)));
      } catch (e) {
        console.error("Error fetching logs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Allocation': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />;
      case 'Maintenance': return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'Audit': return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
      case 'StatusChange': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <ActivityIcon className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Track all asset movements, updates, and maintenance across the organization.</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading activity...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No recent activity logs.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {logs.map((log, index) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={log.id} 
                className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
              >
                <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-100">
                  {getIcon(log.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">User:</span> {log.userId} • <span className="font-medium">Asset ID:</span> {log.assetId}
                  </p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {format(log.timestamp || Date.now(), 'MMM d, h:mm a')}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
