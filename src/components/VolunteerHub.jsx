import { useState, useEffect } from 'react';
import { Users, MapPin, AlertCircle, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { db } from "../firebase";
import DispatchForm from './DispatchForm';
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function VolunteerHub() {
  const [surveys, setSurveys] = useState([]);
  
  // Assignment Modal State
  const [assigningSurvey, setAssigningSurvey] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch real surveys
  // Fetch real surveys (FILTERED BY NGO)
  useEffect(() => {
    const currentNgoId = "mumbai_relief_02"; 
    const q = query(collection(db, "surveys"), where("ngoId", "==", currentNgoId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveyData = [];
      snapshot.forEach((doc) => surveyData.push({ id: doc.id, ...doc.data() }));
      setSurveys(surveyData);
    });
    return () => unsubscribe();
  }, []);

  // 1. Start with an empty array
  const [volunteers, setVolunteers] = useState([]);

  // 2. Add the real-time Firebase listener
  // Fetch real-time volunteers (FILTERED BY NGO)
  useEffect(() => {
    // 1. Define the ID of the currently logged-in NGO
    const currentNgoId = "mumbai_relief_02"; 

    // 2. Create a specific query instead of fetching the whole collection
    const volunteersRef = collection(db, "volunteers");
    const q = query(volunteersRef, where("ngoId", "==", currentNgoId));

    // 3. Listen ONLY to the results of that query
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVolunteers(liveData);
    });
    
    return () => unsubscribe();
  }, []); // <-- Make sure query and where are imported at the top!
  const actionItems = surveys.filter(s => s.status !== "Deployed" && s.status !== "Resolved");
  const availableVolunteers = volunteers.filter(v => v.status === "Available");

  const handleToggleVolunteer = (vol) => {
    if (selectedTeam.find(v => v.id === vol.id)) {
      setSelectedTeam(selectedTeam.filter(v => v.id !== vol.id)); 
    } else {
      setSelectedTeam([...selectedTeam, vol]); 
    }
  };

  const handleConfirmDeployment = async () => {
    if (selectedTeam.length === 0) return alert("Please select at least one volunteer.");
    setIsDeploying(true);
    
    try {
      const surveyRef = doc(db, "surveys", assigningSurvey.id);
      await updateDoc(surveyRef, {
        status: "Deployed",
        assignedTeam: selectedTeam.map(v => v.name) 
      });
      
      // ADD THIS NEW BLOCK: Update the local mock data status!
      setVolunteers(prevVolunteers => 
        prevVolunteers.map(vol => 
          selectedTeam.find(selected => selected.id === vol.id) 
            ? { ...vol, status: "Deployed" } 
            : vol
        )
      );
      
      setAssigningSurvey(null);
      setSelectedTeam([]);
    } catch (error) {
      console.error("Error deploying team:", error);
      alert("Failed to deploy team.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    // Note the added text transitions for smooth dark mode toggling
    <div className="space-y-8 pb-12 transition-colors duration-200">
      
      <div className="flex justify-between items-end">
        {/* ... header stuff ... */}
      </div>

      {/* --- TOP COMMAND ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: The Dispatch Form */}
        <div className="lg:col-span-1">
          <DispatchForm /> 
        </div>

        {/* Right Side: A placeholder for your future map or analytics */}
        <div className="lg:col-span-2 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center h-full min-h-[250px] transition-colors">
          <p className="text-stone-400 dark:text-stone-500 font-medium tracking-wide text-sm">
            Live Deployment Map / Analytics Space
          </p>
        </div>
      </div>

      {/* --- BOTTOM ROW: ACTION ITEMS & VOLUNTEERS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: ACTION ITEMS --- */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
          <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500 dark:text-orange-400" />
            <h2 className="font-bold text-stone-800 dark:text-white">Pending Action Items</h2>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {actionItems.length === 0 ? (
              <p className="text-center text-stone-400 dark:text-stone-500 py-10">No pending items. Great job!</p>
            ) : (
              actionItems.map(item => (
                <div key={item.id} className="p-4 border border-stone-200 dark:border-stone-700 rounded-xl hover:border-teal-300 dark:hover:border-teal-500 hover:shadow-md transition-all group bg-white dark:bg-stone-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.urgency === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                      {item.urgency || "Standard"} Priority
                    </span>
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{item.category}</span>
                  </div>

                  {/* THIS IS NEW: Render the uploaded image if it exists! */}
                  {item.imageUrl && (
                    <div className="my-3">
                      <img
                        src={item.imageUrl}
                        alt="Emergency Evidence"
                        className="w-full h-32 object-cover rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm"
                      />
                    </div>
                  )}

                  <h3 className="font-bold text-stone-800 dark:text-white text-sm mb-1">{item.location || "Location pending"}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">{item.summary}</p>

                  <button
                    onClick={() => { setAssigningSurvey(item); setSelectedTeam([]); }}
                    className="w-full py-2 bg-stone-100 dark:bg-stone-700/50 text-stone-600 dark:text-stone-300 font-bold text-xs rounded-lg hover:bg-teal-600 dark:hover:bg-teal-600 hover:text-white transition-colors"
                  >
                    Assign Team →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: ALL VOLUNTEERS --- */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
          <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex items-center gap-2">
            <Users size={18} className="text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-stone-800 dark:text-white">All Responders</h2>
          </div>
          
          <div className="p-0 overflow-y-auto flex-1 divide-y divide-stone-100 dark:divide-stone-800">
            {volunteers.map(vol => (
              <div key={vol.id} className="p-5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">{vol.name}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{vol.role}</p>
                  </div>
                </div>
                
                {vol.status === "Available" ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-800/50">
                    <CheckCircle2 size={12} /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stone-200 dark:border-stone-700">
                    <MapPin size={12} /> Deployed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- THE DEPLOYMENT MODAL --- */}
      {assigningSurvey && (
        <div className="fixed inset-0 bg-stone-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-transparent dark:border-stone-800 transition-colors">
            
            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h2 className="text-lg font-bold text-stone-800 dark:text-white">Deploy Team</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Select available volunteers for: <span className="font-bold text-stone-700 dark:text-stone-200">{assigningSurvey.location}</span></p>
              </div>
              <button onClick={() => setAssigningSurvey(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3">
              <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Available Volunteers</p>
              
              {availableVolunteers.map(vol => {
                const isSelected = selectedTeam.find(v => v.id === vol.id);
                return (
                  <div 
                    key={vol.id}
                    onClick={() => handleToggleVolunteer(vol)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "border-teal-500 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20" 
                        : "border-stone-200 dark:border-stone-700 hover:border-teal-300 dark:hover:border-teal-700"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-stone-800 dark:text-stone-100 text-sm">{vol.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{vol.role}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? "bg-teal-500 border-teal-500 text-white" 
                        : "border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                    }`}>
                      {isSelected && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
              <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                {selectedTeam.length} selected
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAssigningSurvey(null)}
                  className="px-4 py-2 text-sm font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDeployment}
                  disabled={isDeploying || selectedTeam.length === 0}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all disabled:opacity-50"
                >
                  {isDeploying ? "Deploying..." : <><ShieldCheck size={16} /> Confirm Deployment</>}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}