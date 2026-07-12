import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PackageCheck, PackageOpen, Wrench, CalendarClock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    available: 0,
    allocated: 0,
    maintenance: 0,
    bookings: 0,
    overdue: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      const assetsSnap = await getDocs(collection(db, 'assets'));
      let available = 0;
      let allocated = 0;
      let maintenance = 0;
      
      assetsSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Available') available++;
        if (data.status === 'Allocated') allocated++;
        if (data.status === 'Under Maintenance') maintenance++;
      });
      
      setStats(s => ({ ...s, available, allocated, maintenance }));
    };
    
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-base text-gray-500">Welcome back, {user?.name}. Here is an operational snapshot.</p>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-green-50 p-4 rounded-2xl mr-4">
            <PackageCheck className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assets Available</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.available}</p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-blue-50 p-4 rounded-2xl mr-4">
            <PackageOpen className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assets Allocated</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.allocated}</p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-yellow-50 p-4 rounded-2xl mr-4">
            <Wrench className="h-7 w-7 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Maintenance Today</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.maintenance}</p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 p-4 rounded-2xl mr-4">
            <CalendarClock className="h-7 w-7 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Bookings</h3>
            <p className="mt-1 text-3xl font-bold text-gray-900">{stats.bookings}</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Overdue Returns
            </h2>
          </div>
          <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
            <PackageCheck className="h-10 w-10 text-gray-200 mb-3" />
            No overdue items found.
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <PackageCheck className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
            <CalendarClock className="h-10 w-10 text-gray-200 mb-3" />
            No recent activity.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
