import { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Make sure this path is correct!
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  ClipboardList, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  MapPin, 
  Tag 
} from "lucide-react";

export default function DashboardPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Real-time Firebase Listener ---
  // --- Real-time Firebase Listener ---
  useEffect(() => {
    // Safety check: Make sure someone is actually logged in
    if (!auth.currentUser) return;

    // 1. Point to your surveys, but FILTER by the current user's email
    const q = query(
      collection(db, "surveys"), 
      where("uploaderEmail", "==", auth.currentUser.email)
    );

    // 2. Set up the listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveyData = [];
      snapshot.forEach((doc) => {
        surveyData.push({ id: doc.id, ...doc.data() });
      });

      // 3. Sort them newest to oldest (We do this in JavaScript to avoid Firebase indexing errors)
      surveyData.sort((a, b) => {
        const timeA = a.uploadedAt?.toMillis() || 0;
        const timeB = b.uploadedAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setSurveys(surveyData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching surveys:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Helper for Status Colors ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-emerald-50 text-emerald-700";
      case "In Progress": return "bg-sky-50 text-sky-700";
      case "Pending AI Processing": return "bg-purple-50 text-purple-700";
      default: return "bg-stone-100 text-stone-600";
    }
  };

  // --- Helper for Urgency Colors ---
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Critical": return "text-rose-700 border-rose-200 bg-rose-50";
      case "High": return "text-orange-700 border-orange-200 bg-orange-50";
      case "Medium": return "text-yellow-700 border-yellow-200 bg-yellow-50";
      case "Pending": return "text-purple-700 border-purple-200 bg-purple-50";
      default: return "text-stone-600 border-stone-200 bg-stone-50";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-t-4 border-teal-400 rounded-xl p-6 shadow-sm border-x border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
              <ClipboardList size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
              <ArrowUpRight size={14} /> +4 this week
            </span>
          </div>
          <div className="mt-4">
            {/* Make this number dynamic based on the actual database count! */}
            <h3 className="text-3xl font-bold text-stone-800">{surveys.length}</h3>
            <p className="text-xs font-bold tracking-wider text-stone-400 uppercase mt-1">Total Surveys</p>
          </div>
        </div>

        <div className="bg-white border-t-4 border-rose-400 rounded-xl p-6 shadow-sm border-x border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
              <ArrowUpRight size={14} /> 3 escalated today
            </span>
          </div>
          <div className="mt-4">
            {/* Count how many are marked Critical */}
            <h3 className="text-3xl font-bold text-stone-800">
              {surveys.filter(s => s.urgency === "Critical").length}
            </h3>
            <p className="text-xs font-bold tracking-wider text-stone-400 uppercase mt-1">Critical Needs</p>
          </div>
        </div>

        <div className="bg-white border-t-4 border-amber-400 rounded-xl p-6 shadow-sm border-x border-b border-stone-200">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Users size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
              <ArrowUpRight size={14} /> +17 this month
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-stone-800">128</h3>
            <p className="text-xs font-bold tracking-wider text-stone-400 uppercase mt-1">Active Volunteers</p>
          </div>
        </div>
      </div>

      {/* --- LIVE DATA TABLE --- */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-stone-800">Community Needs</h3>
            <p className="text-sm text-stone-500">{surveys.length} active entries</p>
          </div>
          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Export CSV →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-stone-400 uppercase">Image</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-stone-400 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-stone-400 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-stone-400 uppercase">Urgency</th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-stone-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-stone-500">
                    Loading live data...
                  </td>
                </tr>
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-stone-500">
                    No surveys uploaded yet. Head to the Upload page to get started!
                  </td>
                </tr>
              ) : (
                surveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* The Image Thumbnail! */}
                    <td className="px-6 py-4">
                      <a href={survey.imageUrl} target="_blank" rel="noreferrer">
                        <img 
                          src={survey.imageUrl} 
                          alt="Survey" 
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 hover:opacity-80 transition-opacity"
                        />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-stone-400" />
                        <span className="text-sm font-semibold text-stone-700">{survey.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <MapPin size={14} />
                        {survey.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getUrgencyColor(survey.urgency)}`}>
                        {survey.urgency === "Critical" && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>}
                        {survey.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}