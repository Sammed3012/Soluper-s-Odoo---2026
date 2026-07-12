import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Asset, MaintenanceRequest } from '../types';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Reports() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aSnap, mSnap] = await Promise.all([
          getDocs(collection(db, 'assets')),
          getDocs(collection(db, 'maintenance'))
        ]);
        setAssets(aSnap.docs.map(d => d.data() as Asset));
        setMaintenance(mSnap.docs.map(d => d.data() as MaintenanceRequest));
      } catch (e) {
        console.error("Error fetching reports data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute status distribution
  const statusCounts = assets.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280', '#ef4444'];

  // Compute maintenance priority
  const maintCounts = maintenance.reduce((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const barData = Object.entries(maintCounts).map(([name, value]) => ({ name, value }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Operational insights and resource utilization trends.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white/70 backdrop-blur-md p-16 text-center rounded-lg shadow-sm border border-gray-200">
          Loading charts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-medium text-gray-900 flex items-center mb-6">
              <PieChartIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Asset Status Distribution
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-medium text-gray-900 flex items-center mb-6">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-500" />
              Maintenance Priority Mix
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
