import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { Activity, PieChart as PieIcon, TrendingUp } from 'lucide-react';

// Premium UI Colors
const COLORS = ['#14b8a6', '#f43f5e', '#f97316', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    // Syncing with your strict multi-tenancy ID
    const currentNgoId = "mumbai_relief_02"; 
    const q = query(collection(db, "surveys"), where("ngoId", "==", currentNgoId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setSurveys(data);
    });

    return () => unsubscribe();
  }, []);

  // --- DATA CRUNCHING ---

  // 1. Urgency Breakdown (For Pie Chart)
  const urgencyCounts = surveys.reduce((acc, survey) => {
    acc[survey.urgency] = (acc[survey.urgency] || 0) + 1;
    return acc;
  }, {});
  const urgencyData = Object.keys(urgencyCounts).map(key => ({ name: key, value: urgencyCounts[key] }));

  // 2. Category Breakdown (For Bar Chart)
  const categoryCounts = surveys.reduce((acc, survey) => {
    acc[survey.category] = (acc[survey.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.keys(categoryCounts).map(key => ({ name: key, count: categoryCounts[key] }));

  // 3. Status Pipeline (For Line/Area Chart)
  const statusCounts = surveys.reduce((acc, survey) => {
    acc[survey.status] = (acc[survey.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = [
    { name: 'Pending', count: statusCounts['Pending'] || 0 },
    { name: 'Reviewed', count: statusCounts['Reviewed'] || 0 },
    { name: 'Deployed', count: statusCounts['Deployed'] || 0 },
    { name: 'Resolved', count: statusCounts['Resolved'] || 0 }
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-stone-100 tracking-tight">Relief Analytics</h2>
        <p className="text-slate-500 dark:text-stone-400 text-sm mt-1">Live data aggregation for active field zones.</p>
      </div>

      {/* Bento Grid for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Urgency Distribution */}
        <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={18} className="text-teal-500" />
            <h3 className="font-bold text-slate-800 dark:text-stone-200">Needs by Urgency</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={urgencyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-rose-500" />
            <h3 className="font-bold text-slate-800 dark:text-stone-200">Incident Categories</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Deployment Pipeline (Spans full width at bottom) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-orange-500" />
            <h3 className="font-bold text-slate-800 dark:text-stone-200">Resolution Pipeline</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis dataKey="name" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#1c1917' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}