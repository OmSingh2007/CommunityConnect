import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
      // 1. Changed "tasks" to "surveys" so it goes to the right place
      await addDoc(collection(db, "surveys"), {
        location: taskTitle,         // Matches the bold title on your card
        summary: description,        // Matches the description text
        category: "Manual Dispatch", // Shows up in the top right of the card
        urgency: "Critical",         // Triggers your red priority badge!
        status: "Pending",           // Keeps it in the "Pending" column
        ngoId: "mumbai_relief_02",   // Keeps our multi-tenancy secure
        createdAt: serverTimestamp()
      });

      // Clear the form
      setTaskTitle("");
      setDescription("");
      alert("Task Dispatched Successfully!");
      
    } catch (error) {
      console.error("Error dispatching task:", error);
      alert("Failed to send task.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dispatch Command Center</h2>
      
      <form onSubmit={handleDispatch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Title</label>
          <input 
            type="text" 
            placeholder="e.g., Flood Rescue at Sector 4"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Details & Location</label>
          <textarea 
            placeholder="We need 50 food packets immediately..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-24"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSending}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors"
        >
          {isSending ? "Transmitting..." : "DISPATCH TO TEAM"}
          {!isSending && <Send size={18} />}
        </button>
      </form>
    </div>
  );
}