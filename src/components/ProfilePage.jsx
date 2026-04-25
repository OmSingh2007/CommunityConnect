import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Building2, Mail, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profile, setProfile] = useState({ ngoName: "", email: "" });
  const [originalProfile, setOriginalProfile] = useState(null);

  const hasChanges = originalProfile && profile.ngoName !== originalProfile.ngoName;

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
          };
          setProfile(fetchedData);
          setOriginalProfile(fetchedData);
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    if (!hasChanges) return; 
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ngoName: profile.ngoName,
      });
      setOriginalProfile(profile);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save profile." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) return <div className="p-8 text-stone-500 dark:text-stone-400">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">My Profile</h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Manage your organisation's public details.</p>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-4 text-sm border rounded-xl transition-all ${
          message.type === "success" ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30" : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm p-8 space-y-6 transition-colors">
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
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-stone-500 dark:text-stone-400 uppercase mb-2">
            <Mail size={14} /> Primary Contact Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-500 dark:text-stone-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-150
            ${!hasChanges ? "bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none" : saving ? "bg-emerald-400 cursor-wait text-white" : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"}`}
        >
          {saving ? "Saving..." : <><Save size={16} /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}