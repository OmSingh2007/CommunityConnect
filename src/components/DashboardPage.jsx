import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { 
  Edit2, 
  X, 
  Save, 
  AlertCircle, 
  ClipboardList, 
  AlertTriangle, 
  Users 
} from "lucide-react";

export default function DashboardPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Real-time Firebase Listener ---
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

      surveyData.sort((a, b) => {
        const timeA = a.uploadedAt?.toMillis() || 0;
        const timeB = b.uploadedAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setSurveys(surveyData);
      setLoading(false);
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

    // 1. Create the CSV headers
    const headers = ["Date", "Category", "Location", "Urgency", "Status", "Summary"];
    
    // 2. Format the rows
    const csvRows = surveys.map(survey => {
      const date = survey.uploadedAt 
      ? survey.uploadedAt.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) 
      : "Unknown Date";
      
      // We wrap text in quotes so commas inside the summary don't break the CSV columns!
      const safeLocation = `"${(survey.location || "").replace(/"/g, '""')}"`;
      const safeSummary = `"${(survey.summary || "").replace(/"/g, '""')}"`;
      
      return [date, survey.category, safeLocation, survey.urgency, survey.status, safeSummary].join(",");
    });

    // 3. Combine it all
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // 4. Trigger the download in the browser
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
    <div className="space-y-8 pb-12">
      
      {/* --- RESTORED TOP CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Surveys Card */}
        <div className="bg-white p-6 rounded-2xl border-2 border-teal-400 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <span className="text-xs font-bold text-teal-600">↗ +4 this week</span>
          </div>
          <h3 className="text-3xl font-bold text-stone-800">{totalSurveysCount}</h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Total Surveys</p>
        </div>

        {/* Critical Needs Card */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            {criticalNeedsCount > 0 && (
              <span className="text-xs font-bold text-rose-500">↗ {criticalNeedsCount} escalated</span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-stone-800">{criticalNeedsCount}</h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Critical Needs</p>
        </div>

        {/* Active Volunteers Card (Static for now) */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-stone-800">128</h3>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">Active Volunteers</p>
        </div>

      </div>

      {/* --- TABLE HEADER & EXPORT BUTTON --- */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden mt-8">
        
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-800 tracking-tight">Community Needs</h2>
            <p className="text-stone-500 text-sm mt-0.5">{totalSurveysCount} active entries</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 active:scale-95 transition-all"
          >
            Export CSV →
          </button>
        </div>

        {/* --- THE DATA TABLE --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Urgency</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-stone-400">Loading data...</td>
                </tr>
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-stone-400">No surveys uploaded yet. Head to the Upload page to get started!</td>
                </tr>
              ) : (
                surveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <a href={survey.imageUrl} target="_blank" rel="noreferrer">
                        <img src={survey.imageUrl} alt="Survey" className="w-12 h-12 object-cover rounded-lg border border-stone-200 hover:opacity-80 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-700">{survey.category}</td>
                    <td className="px-6 py-4 text-stone-600">{survey.location}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        survey.urgency === "Critical" ? "bg-rose-100 text-rose-700" :
                        survey.urgency === "High" ? "bg-orange-100 text-orange-700" :
                        "bg-stone-100 text-stone-700"
                      }`}>
                        {survey.urgency}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-stone-600 truncate cursor-help" title={survey.summary}>
                        {survey.summary || "No summary available"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        {survey.status === "In Progress" && <AlertCircle size={12} />}
                        {survey.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setEditingSurvey(survey)}
                        className="p-2 text-stone-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- THE EDIT MODAL --- */}
      {editingSurvey && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-800">Review AI Extraction</h2>
              <button onClick={() => setEditingSurvey(null)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              
              <div className="w-full md:w-1/2">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Original Image</p>
                <img src={editingSurvey.imageUrl} alt="Survey" className="w-full rounded-xl border border-stone-200" />
              </div>

              <form id="edit-form" onSubmit={handleUpdate} className="w-full md:w-1/2 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={editingSurvey.category} 
                    onChange={(e) => setEditingSurvey({...editingSurvey, category: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Water & Sanitation</option>
                    <option>Infrastructure</option>
                    <option>Other</option>
                    <option>Uncategorized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Location</label>
                  <input 
                    type="text"
                    value={editingSurvey.location} 
                    onChange={(e) => setEditingSurvey({...editingSurvey, location: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Urgency</label>
                  <select 
                    value={editingSurvey.urgency} 
                    onChange={(e) => setEditingSurvey({...editingSurvey, urgency: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Summary</label>
                  <textarea 
                    rows={4}
                    value={editingSurvey.summary} 
                    onChange={(e) => setEditingSurvey({...editingSurvey, summary: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  />
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button 
                onClick={() => setEditingSurvey(null)}
                className="px-4 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                form="edit-form"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : <><Save size={16} /> Save & Verify</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}