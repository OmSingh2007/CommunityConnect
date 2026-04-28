import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import {
  Edit2,
  X,
  Save,
  AlertCircle,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  Users,
  Maximize2
} from "lucide-react";
import VolunteerMap from "./VolunteerMap";

export default function DashboardPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeVolunteersCount, setActiveVolunteersCount] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  // --- Real-time Firebase Listener ---
  useEffect(() => {
    // 1. We still check if the user is logged in
    if (!auth.currentUser) return;

    // 2. Define your specific NGO ID
    const currentNgoId = "mumbai_relief_02";

    // 3. Query Firebase for ALL surveys belonging to this NGO
    const q = query(
      collection(db, "surveys"),
      where("ngoId", "==", currentNgoId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveyData = [];
      snapshot.forEach((doc) => {
        surveyData.push({ id: doc.id, ...doc.data() });
      });

      // Sort newest to oldest
      surveyData.sort((a, b) => {
        const timeA = a.uploadedAt?.toMillis() || a.createdAt?.toMillis() || 0; // Added fallback for createdAt from dispatch form
        const timeB = b.uploadedAt?.toMillis() || b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setSurveys(surveyData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  // --- Real-time Firebase Listener for VOLUNTEERS ---
  useEffect(() => {
    // Make sure this matches Rishabh's app perfectly!
    const currentNgoId = "mumbai_relief_02"; 

    const q = query(
      collection(db, "volunteers"),
      where("ngoId", "==", currentNgoId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let availableCount = 0;
      
      // Loop through all volunteers for this NGO and count the available ones
      snapshot.forEach((doc) => {
        if (doc.data().status === "Available") {
          availableCount++;
        }
      });
      
      setActiveVolunteersCount(availableCount);
    });

    return () => unsubscribe();
  }, []);
  // --- Dynamic Dashboard Math ---
  // We calculate these live based on whatever is in the database!
  const totalSurveysCount = surveys.length;
  const criticalNeedsCount = surveys.filter(s => s.urgency === "Critical").length;

  // --- Handle Updating the Data ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const surveyRef = doc(db, "surveys", editingSurvey.id);
      await updateDoc(surveyRef, {
        category: editingSurvey.category,
        location: editingSurvey.location,
        urgency: editingSurvey.urgency,
        summary: editingSurvey.summary,
        status: "Reviewed"
      });
      setEditingSurvey(null);
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Export Data to CSV ---
  const handleExportCSV = () => {
    if (surveys.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Date", "Category", "Location", "Urgency", "Status", "Summary"];
    const csvRows = surveys.map(survey => {
      const date = survey.uploadedAt
        ? survey.uploadedAt.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Unknown Date";
      const safeLocation = `"${(survey.location || "").replace(/"/g, '""') }"`;
      const safeSummary = `"${(survey.summary || "").replace(/"/g, '""') }"`;
      return [date, survey.category, safeLocation, survey.urgency, survey.status, safeSummary].join(",");
    });
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "community_needs_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 space-y-5">

      {/* â”€â”€ BENTO GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-3 gap-4" style={{height: '260px'}}>

        {/* LEFT: Live Deployment Map Placeholder */}
        <div 
          onClick={() => setIsMapExpanded(true)}
          className="col-span-2 relative bg-stone-900 border border-sky-200 dark:border-stone-700/50 rounded-2xl overflow-hidden hover:border-teal-500 hover:shadow-lg cursor-pointer transition-all duration-300 group"
        >
          {/* Overlay Tags (z-[400] to sit above Leaflet tiles) */}
          <div className="absolute top-4 left-5 z-[400]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-teal-500/50 text-teal-400 text-[10px] font-bold uppercase tracking-widest shadow-lg">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
              Live Tracking
            </span>
          </div>
          
          {/* Hover "Expand" Hint */}
          <div className="absolute top-4 right-5 z-[400] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900/90 text-stone-200 text-xs font-bold border border-white/10">
              <Maximize2 size={14} /> Expand Map
            </span>
          </div>

          {/* The Static Map Thumbnail */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <VolunteerMap interactive={false} />
          </div>
        </div>

        {/* RIGHT: 3 Stat Cards */}
        <div className="col-span-1 flex flex-col gap-3">

          {/* Stat 1: Total Surveys */}
          <div className="flex-1 bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl px-4 flex items-center gap-4 hover:border-sky-300 dark:hover:border-teal-500/40 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(45,212,191,0.07)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-teal-500/15 border border-sky-300 dark:border-teal-500/30 text-sky-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-200 dark:group-hover:bg-teal-500/25 transition-colors">
              <ClipboardList size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest">Total Surveys</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 leading-none">{totalSurveysCount}</h3>
              <span className="text-[10px] font-semibold text-sky-600 dark:text-teal-400">↗ +4 this week</span>
            </div>
          </div>

          {/* Stat 2: Critical Needs */}
          <div className="flex-1 bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl px-4 flex items-center gap-4 hover:border-rose-300 dark:hover:border-rose-500/40 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(251,113,133,0.07)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/25 transition-colors">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest">Critical Needs</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 leading-none">{criticalNeedsCount}</h3>
              {criticalNeedsCount > 0 && (
                <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">↗ {criticalNeedsCount} escalated</span>
              )}
            </div>
          </div>

          {/* Stat 3: Active Volunteers */}
          <div className="flex-1 bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl px-4 flex items-center gap-4 hover:border-orange-300 dark:hover:border-orange-500/40 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(251,146,60,0.07)] transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 text-orange-500 dark:text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/25 transition-colors">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest">Active Volunteers</p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 leading-none">{activeVolunteersCount}</h3>
              <span className="text-[10px] font-semibold text-orange-500 dark:text-orange-400">Field-ready</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-sky-300 dark:hover:border-stone-600/60 shadow-sm dark:shadow-none">
        <div className="px-6 py-5 border-b border-sky-100 dark:border-stone-700/50 flex items-center justify-between bg-sky-50/50 dark:bg-stone-950/30">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-stone-100 tracking-tight">Community Needs Registry</h2>
            <p className="text-slate-500 dark:text-stone-500 text-xs mt-0.5">{totalSurveysCount} active field entries</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-sky-100 dark:bg-teal-500/15 border border-sky-200 dark:border-teal-500/30 text-sky-600 dark:text-teal-400 hover:bg-sky-200 dark:hover:bg-teal-500/25 hover:text-sky-700 dark:hover:text-teal-300 transition-all"
          >
            Export CSV →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-sky-50/80 dark:bg-stone-950/40 border-b border-sky-100 dark:border-stone-700/50 text-slate-500 dark:text-stone-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-5 py-4">Image</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Urgency</th>
                <th className="px-5 py-4">Summary</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500 dark:text-stone-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading data...
                    </div>
                  </td>
                </tr>
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-500 dark:text-stone-500 text-sm">
                    No surveys uploaded yet. Head to the Upload page to get started!
                  </td>
                </tr>
              ) : (
                surveys.map((survey, index) => (
                  <tr
                    key={survey.id}
                    className={`border-b border-sky-100/50 dark:border-stone-700/30 hover:bg-sky-50 dark:hover:bg-teal-500/5 transition-all duration-150 ${index % 2 === 0 ? 'bg-transparent' : 'bg-slate-50 dark:bg-stone-800/20'}`}
                  >
                    <td className="px-5 py-3.5">
                      <a href={survey.imageUrl} target="_blank" rel="noreferrer">
                        <img src={survey.imageUrl} alt="Survey" className="w-11 h-11 object-cover rounded-lg border border-sky-200 dark:border-stone-700/60 hover:opacity-80 hover:border-sky-400 dark:hover:border-teal-500/50 transition-all" />
                      </a>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-stone-200">{survey.category}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-stone-400">{survey.location}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        survey.urgency === "Critical" ? "bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400" :
                        survey.urgency === "High" ? "bg-orange-50 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400" :
                        "bg-slate-100 dark:bg-stone-700/40 border border-slate-200 dark:border-stone-600/50 text-slate-600 dark:text-stone-400"
                      }`}>{survey.urgency}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-slate-600 dark:text-stone-400 truncate cursor-help text-xs" title={survey.summary}>{survey.summary || "No summary available"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          survey.status === "Deployed" ? "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30" :
                          survey.status === "Reviewed" ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" :
                          "bg-sky-50 dark:bg-teal-500/15 text-sky-600 dark:text-teal-400 border-sky-200 dark:border-teal-500/30"
                        }`}>
                          {survey.status === "In Progress" && <AlertCircle size={11} />}
                          {survey.status === "Deployed" && <ShieldCheck size={11} />}
                          {survey.status}
                        </span>
                        {survey.status === "Deployed" && survey.assignedTeam && (
                          <span className="text-[10px] text-slate-500 dark:text-stone-600 font-medium leading-tight">
                            Team: {survey.assignedTeam.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setEditingSurvey(survey)}
                        className="p-2 text-slate-400 dark:text-stone-500 hover:text-sky-600 dark:hover:text-teal-400 hover:bg-sky-50 dark:hover:bg-teal-500/15 border border-transparent hover:border-sky-300 dark:hover:border-teal-500/30 rounded-lg transition-all"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* â”€â”€ EDIT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {editingSurvey && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700/60 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-stone-700/50 bg-stone-950/30">
              <h2 className="text-base font-bold text-stone-100">Review AI Extraction</h2>
              <button onClick={() => setEditingSurvey(null)} className="text-stone-500 hover:text-stone-300 hover:bg-stone-700/50 p-1.5 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2">
                <p className="text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-2">Original Image</p>
                <img src={editingSurvey.imageUrl} alt="Survey" className="w-full rounded-xl border border-sky-200 dark:border-stone-700/60" />
              </div>
              <form id="edit-form" onSubmit={handleUpdate} className="w-full md:w-1/2 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select value={editingSurvey.category} onChange={(e) => setEditingSurvey({ ...editingSurvey, category: e.target.value })} className="w-full px-3 py-2.5 bg-white dark:bg-stone-950/60 border border-sky-200 dark:border-stone-700 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-teal-500/50 focus:border-sky-500/50 dark:focus:border-teal-500/50 outline-none transition-all">
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Water & Sanitation</option>
                    <option>Infrastructure</option>
                    <option>Other</option>
                    <option>Uncategorized</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-1.5">Location</label>
                  <input type="text" value={editingSurvey.location} onChange={(e) => setEditingSurvey({ ...editingSurvey, location: e.target.value })} className="w-full px-3 py-2.5 bg-white dark:bg-stone-950/60 border border-sky-200 dark:border-stone-700 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-teal-500/50 focus:border-sky-500/50 dark:focus:border-teal-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-1.5">Urgency</label>
                  <select value={editingSurvey.urgency} onChange={(e) => setEditingSurvey({ ...editingSurvey, urgency: e.target.value })} className="w-full px-3 py-2.5 bg-white dark:bg-stone-950/60 border border-sky-200 dark:border-stone-700 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-teal-500/50 focus:border-sky-500/50 dark:focus:border-teal-500/50 outline-none transition-all">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-1.5">Summary</label>
                  <textarea rows={4} value={editingSurvey.summary} onChange={(e) => setEditingSurvey({ ...editingSurvey, summary: e.target.value })} className="w-full px-3 py-2.5 bg-white dark:bg-stone-950/60 border border-sky-200 dark:border-stone-700 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-teal-500/50 focus:border-sky-500/50 dark:focus:border-teal-500/50 outline-none resize-none transition-all" />
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-sky-100 dark:border-stone-700/50 flex justify-end gap-3 bg-sky-50/50 dark:bg-stone-950/20">
              <button onClick={() => setEditingSurvey(null)} className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-stone-500 hover:text-slate-700 dark:hover:text-stone-300 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-stone-700/30">
                Cancel
              </button>
              <button form="edit-form" type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 dark:bg-teal-600 dark:hover:bg-teal-500 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(2,132,199,0.25)] dark:shadow-[0_0_20px_rgba(45,212,191,0.25)]">
                {isSaving ? "Saving..." : <><Save size={15} /> Save & Verify</>}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── EXPANDED MAP MODAL ─────────────────────────────────────────────────── */}
      {isMapExpanded && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-stone-900 border border-teal-500/30 rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-700/50 bg-stone-950/50">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-bold text-stone-100">Live Field Deployment</h2>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700">
                  {activeVolunteersCount} Active Responders
                </span>
              </div>
              <button 
                onClick={() => setIsMapExpanded(false)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-700 hover:border-rose-500/30 rounded-lg transition-all"
              >
                <X size={16} /> Close Map
              </button>
            </div>

            {/* The Fully Interactive Map */}
            <div className="flex-1 w-full h-full relative z-0">
              <VolunteerMap interactive={true} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
