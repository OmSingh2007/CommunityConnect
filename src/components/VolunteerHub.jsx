import { useState, useEffect } from 'react';
import { Users, MapPin, AlertCircle, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { db } from "../firebase";
import DispatchForm from './DispatchForm';
import IncidentMap from './IncidentMap';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";

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
    // Fetch all volunteers for testing (Removed the ngoId filter)
    const volunteersRef = collection(db, "volunteers");
    
    // 3. Listen to the entire collection
    const unsubscribe = onSnapshot(volunteersRef, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVolunteers(liveData);
    });
    
    return () => unsubscribe();
  }, []); // <-- Make sure query and where are imported at the top!
  const actionItems = surveys.filter(s => s.status !== "Deployed" && s.status !== "Resolved" && s.status !== "Completed");
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
      
      // 1. Extract FCM tokens
      const extractedTokens = selectedTeam
        .map(vol => vol.fcmToken)
        .filter(token => token); 

      // 2. Update Firebase database status for the survey
      await updateDoc(surveyRef, {
        status: "Deployed",
        assignedTeam: selectedTeam.map(v => v.name)
      });

      // 3. Create tasks for volunteers so they see them on their mobile app
      const taskPromises = selectedTeam.map(vol => {
        return addDoc(collection(db, "tasks"), {
          title: `Emergency: ${assigningSurvey.category || 'Survey'}`,
          location: assigningSurvey.location || "Pending Location",
          priority: assigningSurvey.urgency === "Critical" ? "High" : "Standard",
          status: "Pending",
          ngoId: assigningSurvey.ngoId || "mumbai_relief_02",
          assignedTo: vol.id,
          surveyId: assigningSurvey.id,
          createdAt: serverTimestamp()
        });
      });
      await Promise.all(taskPromises);

      // Create a dashboard notification for the web portal
      await addDoc(collection(db, "notifications"), {
        title: "Team Deployed",
        message: `Deployed ${selectedTeam.length} responder(s) for ${assigningSurvey.category || 'Survey'} at ${assigningSurvey.location || 'Pending Location'}.`,
        ngoId: assigningSurvey.ngoId || "mumbai_relief_02",
        isRead: false,
        timestamp: serverTimestamp()
      });

      // 4. Update volunteers' statuses in Firebase to "Deployed"
      const volunteerPromises = selectedTeam.map(vol => 
        updateDoc(doc(db, "volunteers", vol.id), {
          status: "Deployed"
        })
      );
      await Promise.all(volunteerPromises);
      
      // 5. PING THE EXPRESS SERVER TO SEND NOTIFICATIONS!
      if (extractedTokens.length > 0) {
        try {
          await fetch("http://localhost:5000/api/dispatch-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokens: extractedTokens,
              category: assigningSurvey.category,
              location: assigningSurvey.location
            })
          });
        } catch (fetchErr) {
          console.warn("Notification server down, but deployment succeeded.", fetchErr);
        }
      }

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

        {/* Right Side: Active Incident Map */}
        <div className="lg:col-span-2 bg-stone-900 rounded-2xl border border-stone-800 flex flex-col h-full min-h-[300px] overflow-hidden relative shadow-lg">
          <div className="absolute top-4 left-4 z-[400] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 backdrop-blur-md border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-widest shadow-xl">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              Live Crisis Zones
            </span>
          </div>
          
          <div className="flex-1 w-full h-full z-0">
            <IncidentMap />
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: ACTION ITEMS & VOLUNTEERS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: ACTION ITEMS --- */}
        <div className="bg-white dark:bg-stone-900 border border-sky-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
          <div className="p-5 border-b border-sky-100 dark:border-stone-800 bg-sky-50 dark:bg-stone-800/50 flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-500 dark:text-orange-400" />
            <h2 className="font-bold text-slate-800 dark:text-white">Pending Action Items</h2>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {actionItems.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-stone-500 py-10">No pending items. Great job!</p>
            ) : (
              actionItems.map(item => (
                <div key={item.id} className="p-4 border border-sky-100 dark:border-stone-700 rounded-xl hover:border-sky-300 dark:hover:border-teal-500 hover:shadow-md transition-all group bg-white dark:bg-stone-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.urgency === 'Critical'
                        ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-transparent'
                        : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-transparent'
                      }`}>
                      {item.urgency || "Standard"} Priority
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-stone-400">{item.category}</span>
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

                  <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{item.location || "Location pending"}</h3>
                  <p className="text-xs text-slate-500 dark:text-stone-400 line-clamp-2 mb-3">{item.summary}</p>

                  <button
                    onClick={() => { setAssigningSurvey(item); setSelectedTeam([]); }}
                    className="w-full py-2 bg-sky-50 dark:bg-stone-700/50 text-sky-700 dark:text-stone-300 font-bold text-xs rounded-lg hover:bg-sky-600 dark:hover:bg-teal-600 hover:text-white transition-colors"
                  >
                    Assign Team →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: ALL VOLUNTEERS --- */}
        <div className="bg-white dark:bg-stone-900 border border-sky-200 dark:border-stone-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
          <div className="p-5 border-b border-sky-100 dark:border-stone-800 bg-sky-50 dark:bg-stone-800/50 flex items-center gap-2">
            <Users size={18} className="text-sky-600 dark:text-teal-400" />
            <h2 className="font-bold text-slate-800 dark:text-white">All Responders</h2>
          </div>
          
          <div className="p-0 overflow-y-auto flex-1 divide-y divide-sky-100 dark:divide-stone-800">
            {volunteers.map(vol => (
              <div key={vol.id} className="p-5 flex items-center justify-between hover:bg-sky-50/50 dark:hover:bg-stone-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-teal-900/40 flex items-center justify-center text-sky-700 dark:text-teal-400 font-bold">
                    {vol.name ? vol.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-stone-100 text-sm">{vol.name || "Unknown Volunteer"}</h3>
                    <p className="text-xs text-slate-500 dark:text-stone-400">{vol.role || "Volunteer"}</p>
                  </div>
                </div>
                
                {vol.status === "Available" ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-teal-900/20 text-emerald-700 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-teal-800/50">
                    <CheckCircle2 size={12} /> Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-stone-800 text-slate-500 dark:text-stone-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-stone-700">
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
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-sky-200 dark:border-stone-800 transition-colors">
            
            <div className="flex items-center justify-between p-6 border-b border-sky-100 dark:border-stone-800 bg-sky-50/50 dark:bg-transparent">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Deploy Team</h2>
                <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">Select available volunteers for: <span className="font-bold text-slate-700 dark:text-stone-200">{assigningSurvey.location}</span></p>
              </div>
              <button onClick={() => setAssigningSurvey(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-3">
              <p className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Available Volunteers</p>
              
              {availableVolunteers.map(vol => {
                const isSelected = selectedTeam.find(v => v.id === vol.id);
                return (
                  <div 
                    key={vol.id}
                    onClick={() => handleToggleVolunteer(vol)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "border-sky-500 dark:border-teal-500 bg-sky-50 dark:bg-teal-900/20" 
                        : "border-sky-200 dark:border-stone-700 hover:border-sky-400 dark:hover:border-teal-700"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-stone-100 text-sm">{vol.name || "Unknown Volunteer"}</h3>
                      <p className="text-xs text-slate-500 dark:text-stone-400">{vol.role || "Volunteer"}</p>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? "bg-sky-500 border-sky-500 dark:bg-teal-500 dark:border-teal-500 text-white" 
                        : "border-slate-300 dark:border-stone-600 bg-white dark:bg-stone-800"
                    }`}>
                      {isSelected && <CheckCircle2 size={14} />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-6 border-t border-sky-100 dark:border-stone-800 flex justify-between items-center bg-sky-50 dark:bg-stone-800/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-stone-300">
                {selectedTeam.length} selected
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAssigningSurvey(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-stone-400 hover:text-slate-700 dark:hover:text-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDeployment}
                  disabled={isDeploying || selectedTeam.length === 0}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 dark:bg-teal-600 dark:hover:bg-teal-700 transition-all disabled:opacity-50"
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