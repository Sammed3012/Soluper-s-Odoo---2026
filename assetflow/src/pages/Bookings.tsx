import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asset, Booking } from '../types';
import { format } from 'date-fns';
import { CalendarDays, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Bookings() {
  const [bookableAssets, setBookableAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      // Get shared bookable assets
      const q = query(collection(db, 'assets'), where('isSharedBookable', '==', true));
      const snap = await getDocs(q);
      setBookableAssets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));
      
      // Get bookings
      const bSnap = await getDocs(collection(db, 'bookings'));
      setBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Book shared resources like conference rooms and vehicles.</p>
        </div>
        <button className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </button>
      </div>
      
      <div className="bg-white/70 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg p-6">
        {loading ? (
           <div className="text-center py-8 text-gray-500">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <CalendarDays className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active bookings</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by booking a shared resource.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {bookings.map(b => (
               <div key={b.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
                 <div>
                    <p className="font-medium text-gray-900">Resource ID: {b.assetId}</p>
                    <p className="text-sm text-gray-500">{format(b.startTime, 'MMM d, yyyy h:mm a')} - {format(b.endTime, 'h:mm a')}</p>
                 </div>
                 <div>
                   <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">{b.status}</span>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
