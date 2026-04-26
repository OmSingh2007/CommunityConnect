import { useState, useEffect } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function AnalyticsPage() {
  // --- 1. State to hold the data ---
  const [surveys, setSurveys] = useState([]);

  // --- 2. Fetch data from Firebase in Real-time ---
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "surveys"), 
      where("uploaderEmail", "==", auth.currentUser.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveyData = [];
      snapshot.forEach((doc) => {
        surveyData.push({ id: doc.id, ...doc.data() });
      });
      setSurveys(surveyData);
    });

    return () => unsubscribe();
  }, []);

  // --- 3. Data Calculations ---
  const total = surveys.length || 1; // Prevent division by zero if empty
  
  // Calculate Urgency
  const critical = surveys.filter(s => s.urgency === 'Critical').length;
  const high = surveys.filter(s => s.urgency === 'High').length;
  const medium = surveys.filter(s => s.urgency === 'Medium').length;
  const low = surveys.filter(s => s.urgency === 'Low').length;

  // Calculate Categories
  const categories = {
    "Healthcare": surveys.filter(s => s.category === 'Healthcare').length,
    "Education": surveys.filter(s => s.category === 'Education').length,
    "Water & Sanitation": surveys.filter(s => s.category === 'Water & Sanitation').length,
    "Infrastructure": surveys.filter(s => s.category === 'Infrastructure').length,
    "Other": surveys.filter(s => s.category === 'Other').length,
  };

  // --- 4. Render the UI ---
  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Donor Transparency Report</h1>
        <p className="text-stone-500 text-sm mt-1">Real-time breakdown of community needs and urgency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- URGENCY LEVELS CARD --- */}
        <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><BarChart3 size={20} /></div>
            <h2 className="text-lg font-bold text-stone-800">Urgency Distribution</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-stone-700">Critical</span>
                <span className="text-stone-500">{critical} surveys ({Math.round((critical/total)*100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${(critical/total)*100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-stone-700">High</span>
                <span className="text-stone-500">{high} surveys ({Math.round((high/total)*100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: `${(high/total)*100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-stone-700">Medium</span>
                <span className="text-stone-500">{medium} surveys ({Math.round((medium/total)*100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${(medium/total)*100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-stone-700">Low</span>
                <span className="text-stone-500">{low} surveys ({Math.round((low/total)*100)}%)</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5">
                <div className="bg-stone-300 h-2.5 rounded-full" style={{ width: `${(low/total)*100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CATEGORY BREAKDOWN CARD --- */}
        <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><PieChart size={20} /></div>
            <h2 className="text-lg font-bold text-stone-800">Needs by Category</h2>
          </div>
          
          <div className="space-y-5">
            {Object.entries(categories).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-stone-700">{category}</span>
                  <span className="text-stone-500">{count} ({surveys.length > 0 ? Math.round((count/total)*100) : 0}%)</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${(count/total)*100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}