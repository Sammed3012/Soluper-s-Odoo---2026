import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AuditCycle } from '../types';
import { ClipboardCheck, Plus, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Audit() {
  const { user } = useAuthStore();
  const [audits, setAudits] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'auditCycles'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setAudits(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditCycle)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createAudit = async () => {
    const newRef = doc(collection(db, 'auditCycles'));
    const cycle: Omit<AuditCycle, 'id'> = {
      name: `Q3 Organization Audit - ${Math.floor(Math.random() * 1000)}`,
      startDate: Date.now(),
      endDate: Date.now() + 86400000 * 7,
      auditorIds: [user?.id || 'system'],
      status: 'Open',
      createdAt: Date.now()
    };
    
    await setDoc(newRef, cycle);
    setShowAdd(false);
    fetchAudits();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asset Audits</h1>
            <p className="mt-1 text-sm text-gray-500">Run structured verification cycles and track discrepancies.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showAdd ? 'Cancel' : 'Create Cycle'}
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm border border-indigo-100 bg-indigo-50/30 mb-6 flex flex-col items-center text-center">
              <ClipboardCheck className="h-10 w-10 text-indigo-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a New Audit Cycle</h3>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                This will lock selected assets for auditing and assign an auditor to verify condition and presence.
              </p>
              <button 
                onClick={createAudit}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-all shadow-sm"
              >
                Launch Verification Cycle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
           <div className="p-12 text-center text-gray-500">Loading audit cycles...</div>
        ) : audits.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
             <ClipboardCheck className="h-16 w-16 text-gray-200 mb-4" />
             <h2 className="text-xl font-medium text-gray-900">No active audits</h2>
             <p className="mt-2 text-sm text-gray-500 max-w-sm">Start a new audit cycle to assign auditors and verify physical assets.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {audits.map(audit => (
              <li key={audit.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{audit.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                        Due: {format(audit.endDate, 'MMM d, yyyy')}
                      </div>
                      <div>
                        Assigned Auditors: {audit.auditorIds.length}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={cn(
                      "px-3 py-1.5 inline-flex items-center text-sm font-medium rounded-full",
                      audit.status === 'Open' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {audit.status === 'Open' && <CheckCircle className="h-4 w-4 mr-1.5" />}
                      {audit.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
