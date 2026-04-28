import { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path if needed
import { Send } from 'lucide-react';

export default function DispatchForm() {
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!taskTitle) return alert("Please enter a task title!");
    
    setIsSending(true);
    
    try {
      // 1. Save Survey to Firebase
      await addDoc(collection(db, "surveys"), {
        location: taskTitle,         
        summary: description,        
        category: "Manual Dispatch", 
        urgency: "Critical",         
        status: "Pending",           
        ngoId: "mumbai_relief_02",   
        createdAt: serverTimestamp()
      });

      // 2. Create Web Dashboard Notification
      await addDoc(collection(db, "notifications"), {
        title: "Manual Dispatch Issued",
        message: `Emergency: ${taskTitle} has been dispatched to the field.`,
        ngoId: "mumbai_relief_02",
        isRead: false,
        timestamp: serverTimestamp()
      });

      // 3. Fetch FCM Tokens for Push Notifications
      // This looks through your database to find the phones of your volunteers
      const q = query(collection(db, "volunteers"), where("ngoId", "==", "mumbai_relief_02"));
      const querySnapshot = await getDocs(q);
      
      const deviceTokens = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fcmToken) {
          deviceTokens.push(data.fcmToken);
        }
      });

      // 4. Trigger the live Render Backend!
      // This uses your Vercel Environment Variable automatically
      if (deviceTokens.length > 0) {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        
        const response = await fetch(`${API_BASE_URL}/api/dispatch-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokens: deviceTokens,
            category: "Manual Dispatch",
            location: taskTitle
          }),
        });

        if (!response.ok) console.error("Render Backend failed to send push alerts.");
      } else {
        console.warn("No volunteer devices found with active FCM tokens.");
      }

      // Clear the form
      setTaskTitle("");
      setDescription("");
      alert("Task Dispatched & Team Alerted Successfully!");
      
    } catch (error) {
      console.error("Error dispatching task:", error);
      alert("Failed to send task.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-sky-200 dark:border-stone-700/50 rounded-2xl p-6 shadow-sm h-full flex flex-col transition-colors duration-300">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100 tracking-tight">
          Dispatch Command Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
          Manually inject high-priority tasks into the field.
        </p>
      </div>

      <form onSubmit={handleDispatch} className="flex-1 flex flex-col gap-5">
        
        {/* Emergency Title Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-2">
            Emergency Title
          </label>
          <input 
            type="text" 
            placeholder="e.g., Flood Rescue at Sector 4"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-stone-950/40 border border-sky-200 dark:border-stone-700/60 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-stone-600"
          />
        </div>

        {/* Details & Location Textarea */}
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-stone-500 uppercase tracking-widest mb-2">
            Details & Location
          </label>
          <textarea 
            rows={5}
            placeholder="We need 50 food packets immediately..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-full min-h-[120px] px-4 py-3 bg-slate-50 dark:bg-stone-950/40 border border-sky-200 dark:border-stone-700/60 rounded-xl text-sm text-slate-800 dark:text-stone-200 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-stone-600"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSending}
          className="w-full mt-2 py-3.5 bg-teal-600 hover:bg-teal-500 dark:bg-teal-600/90 dark:hover:bg-teal-500 text-white font-bold text-sm rounded-xl flex justify-center items-center gap-2 transition-all shadow-[0_0_20px_rgba(13,148,136,0.2)] dark:shadow-[0_0_20px_rgba(45,212,191,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "TRANSMITTING..." : "DISPATCH TO TEAM"} 
          {!isSending && <Send size={16} className="ml-1" />}
        </button>

      </form>
    </div>
  );
}