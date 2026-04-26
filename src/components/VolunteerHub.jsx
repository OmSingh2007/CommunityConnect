import { useState, useEffect } from 'react';
import { Users, MapPin, AlertCircle, Phone, CheckCircle2, UserPlus } from 'lucide-react';
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function VolunteerHub() {
  const [surveys, setSurveys] = useState([]);

  // Fetch real surveys for the Dispatch list
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

  // Mock Volunteers Data
  const volunteers = [
    { id: 1, name: "Rahul Sharma", role: "Medical Specialist", status: "Available", phone: "+91 98765 43210" },
    { id: 2, name: "Priya Patel", role: "Logistics Coordinator", status: "Deployed", phone: "+91 87654 32109" },
    { id: 3, name: "Amit Kumar", role: "General Volunteer", status: "Available", phone: "+91 76543 21098" },
    { id: 4, name: "Neha Singh", role: "Water & Sanitation", status: "Available", phone: "+91 65432 10987" }
  ];

  // Filter surveys to only show active ones needing deployment
  const actionItems = surveys.filter(s => s.status !== "Resolved");

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Dispatch Center</h1>
          <p className="text-stone-500 text-sm mt-1">Assign active volunteers to verified community needs.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 font-bold text-sm rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors">
          <UserPlus size={16} /> Add Volunteer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: ACTION ITEMS (Real Data) --- */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500" />
            <h2 className="font-bold text-stone-800">Pending Action Items</h2>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {actionItems.length === 0 ? (
              <p className="text-center text-stone-400 py-10">No pending items. Great job!</p>
            ) : (
              actionItems.map(item => (
                <div key={item.id} className="p-4 border border-stone-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all group cursor-pointer bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      item.urgency === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.urgency} Priority
                    </span>
                    <span className="text-xs font-semibold text-stone-500">{item.category}</span>
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm mb-1">{item.location}</h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3">{item.summary}</p>
                  <button className="w-full py-2 bg-stone-100 text-stone-600 font-bold text-xs rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    Assign Team →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: VOLUNTEERS (Mock Data) --- */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
            <Users size={18} className="text-teal-600" />
            <h2 className="font-bold text-stone-800">Available Responders</h2>
          </div>
          
          <div className="p-0 overflow-y-auto flex-1 divide-y divide-stone-100">
            {volunteers.map(vol => (
              <div key={vol.id} className="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 text-sm">{vol.name}</h3>
                    <p className="text-xs text-stone-500">{vol.role}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400">
                      <Phone size={10} /> {vol.phone}
                    </div>
                  </div>
                </div>
                
                {vol.status === "Available" ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-200">
                    <CheckCircle2 size={12} /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stone-200">
                    <MapPin size={12} /> Deployed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}