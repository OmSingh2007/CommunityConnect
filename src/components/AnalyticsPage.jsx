import { useState, useEffect } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AnalyticsPage() {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "surveys"),
      where("uploaderEmail", "==", auth.currentUser.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveyData = [];
      snapshot.forEach((doc) => surveyData.push({ id: doc.id, ...doc.data() }));
      setSurveys(surveyData);
    });
    return () => unsubscribe();
  }, []);

  const total = surveys.length || 1;
  const critical = surveys.filter(s => s.urgency === 'Critical').length;
  const high     = surveys.filter(s => s.urgency === 'High').length;
  const medium   = surveys.filter(s => s.urgency === 'Medium').length;
  const low      = surveys.filter(s => s.urgency === 'Low').length;

  const categories = {
    "Healthcare":        surveys.filter(s => s.category === 'Healthcare').length,
    "Education":         surveys.filter(s => s.category === 'Education').length,
    "Water & Sanitation":surveys.filter(s => s.category === 'Water & Sanitation').length,
    "Infrastructure":    surveys.filter(s => s.category === 'Infrastructure').length,
    "Other":             surveys.filter(s => s.category === 'Other').length,
  };

  // Reusable bar row
  const Bar = ({ label, count, color }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-bold text-slate-700 dark:text-stone-300">{label}</span>
        <span className="text-slate-500 dark:text-stone-400">
          {count} ({Math.round((count / total) * 100)}%)
        </span>
      </div>
      <div className="w-full bg-sky-100 dark:bg-stone-700/40 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(count / total) * 100}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-stone-100 tracking-tight">Donor Transparency Report</h1>
        <p className="text-slate-500 dark:text-stone-400 text-sm mt-1">Real-time breakdown of community needs and urgency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Urgency Distribution ── */}
        <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl shadow-sm dark:shadow-none p-6 hover:border-sky-300 dark:hover:border-stone-600/60 transition-all">
          <div className="flex items-center gap-2 mb-6 border-b border-sky-100 dark:border-stone-700/50 pb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-lg border border-transparent dark:border-rose-500/20">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Urgency Distribution</h2>
          </div>
          <div className="space-y-5">
            <Bar label="Critical" count={critical} color="bg-rose-500" />
            <Bar label="High"     count={high}     color="bg-orange-400" />
            <Bar label="Medium"   count={medium}   color="bg-amber-400" />
            <Bar label="Low"      count={low}      color="bg-slate-300 dark:bg-stone-500" />
          </div>
        </div>

        {/* ── Category Breakdown ── */}
        <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl shadow-sm dark:shadow-none p-6 hover:border-sky-300 dark:hover:border-stone-600/60 transition-all">
          <div className="flex items-center gap-2 mb-6 border-b border-sky-100 dark:border-stone-700/50 pb-4">
            <div className="p-2 bg-sky-50 dark:bg-teal-500/15 text-sky-600 dark:text-teal-400 rounded-lg border border-transparent dark:border-teal-500/20">
              <PieChart size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Needs by Category</h2>
          </div>
          <div className="space-y-5">
            {Object.entries(categories).map(([cat, count]) => (
              <Bar key={cat} label={cat} count={count} color="bg-sky-500 dark:bg-teal-500" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}