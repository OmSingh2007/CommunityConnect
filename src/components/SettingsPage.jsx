import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  Building2, 
  Mail, 
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Moon,
  Sun
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 1. We need TWO states now. One for editing, one for memory.
  const [profile, setProfile] = useState({
    ngoName: "",
    email: "",
    region: "Mumbai Metropolitan Region",
  });
  const [originalProfile, setOriginalProfile] = useState(null);

  // 2. Check if the current form matches our memory
  const hasChanges = originalProfile && (
    profile.ngoName !== originalProfile.ngoName ||
    profile.region !== originalProfile.region
  );

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedData = {
            ngoName: data.ngoName || "",
            email: data.email || user.email,
            region: data.region || "Mumbai Metropolitan Region",
          };
          
          // Save the data to BOTH states when the page loads
          setProfile(fetchedData);
          setOriginalProfile(fetchedData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Initialize dark mode state
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setIsDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    // Extra safety: don't save if nothing changed
    if (!hasChanges) return; 

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user logged in");

      const docRef = doc(db, "users", user.uid);
      
      await updateDoc(docRef, {
        ngoName: profile.ngoName,
        region: profile.region,
      });

      // IMPORTANT: Update our "memory" so the button goes back to grey!
      setOriginalProfile(profile);
      setMessage({ type: "success", text: "Preferences saved successfully!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: "Failed to save changes. Please try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Settings</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Manage your organisation profile and regional preferences.
        </p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-4 text-sm border rounded-xl transition-all ${
          message.type === "success" 
            ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
            : "text-rose-700 bg-rose-50 border-rose-200"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm overflow-hidden">
        
        <div className="p-8 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase">
              Organisation
            </h2>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase mb-2">
                <Building2 size={14} /> NGO Organisation Name
              </label>
              <input
                type="text"
                name="ngoName"
                value={profile.ngoName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">This name appears on all exported reports.</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase mb-2">
                <Mail size={14} /> Primary Contact Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-500 dark:text-stone-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">
                Used for system notifications. To change your login email, please contact support.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xs font-bold tracking-wider text-stone-400 dark:text-stone-500 uppercase mb-6">
            Regional
          </h2>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase mb-2">
              <MapPin size={14} /> Default Operating Region
            </label>
            <select
              name="region"
              value={profile.region}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all appearance-none"
            >
              <option value="Mumbai Metropolitan Region">Mumbai Metropolitan Region</option>
              <option value="Pune District">Pune District</option>
              <option value="Thane District">Thane District</option>
              <option value="Palghar District">Palghar District</option>
              <option value="Other / National">Other / National</option>
            </select>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1.5">Filters dashboard data to your primary field area.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {/* Reset button now actually works by pulling from our original memory! */}
        <button 
          onClick={() => setProfile(originalProfile)}
          disabled={!hasChanges}
          className="text-sm font-semibold text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset to defaults
        </button>
        
        {/* Dynamic Button Styling based on hasChanges */}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-150
            ${
              !hasChanges 
                ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none" 
                : saving 
                ? "bg-emerald-400 text-white cursor-wait" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
            }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Preferences
            </>
          )}
        </button>
      </div>

    </div>
  );
}