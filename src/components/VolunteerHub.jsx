import React, { useState } from "react";
import { Users, AlertTriangle, Phone, CheckCircle, Clock } from "lucide-react";

export default function VolunteerHub() {
  // Mock data for volunteers
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: "Aarav Patel", phone: "+91 98765 43210", status: "Available" },
    { id: 2, name: "Priya Sharma", phone: "+91 87654 32109", status: "Deployed" },
    { id: 3, name: "Rahul Desai", phone: "+91 76543 21098", status: "Available" },
    { id: 4, name: "Ananya Singh", phone: "+91 65432 10987", status: "Deployed" },
    { id: 5, name: "Vikram Reddy", phone: "+91 54321 09876", status: "Available" },
  ]);

  // Mock data for tasks
  const [tasks, setTasks] = useState([
    { id: 101, title: "Flood Relief Supply Drop", location: "Andheri East", urgency: "Critical", status: "Pending" },
    { id: 102, title: "Medical Camp Setup", location: "Dharavi", urgency: "High", status: "Pending" },
    { id: 103, title: "Food Distribution", location: "Bandra", urgency: "Critical", status: "Assigned" },
    { id: 104, title: "Elderly Care Check", location: "Borivali", urgency: "High", status: "Pending" },
  ]);

  const handleAssign = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: "Assigned" } : task
    ));
    // Also randomly deploy an available volunteer just for UI interaction demonstration
    const available = volunteers.find(v => v.status === "Available");
    if (available) {
      setVolunteers(volunteers.map(v => 
        v.id === available.id ? { ...v, status: "Deployed" } : v
      ));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Volunteer Dispatch Hub</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Assign volunteers to Critical and High urgency field surveys.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Tasks */}
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-md overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50">
            <h2 className="text-sm font-bold tracking-wider text-stone-600 dark:text-stone-300 uppercase flex items-center gap-2">
              <AlertTriangle size={18} className="text-teal-600 dark:text-teal-400" /> Action Required
            </h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className="group relative p-5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-stone-800 dark:text-stone-100 font-bold">{task.title}</h3>
                    <p className="text-stone-500 dark:text-stone-400 text-sm flex items-center gap-1 mt-1">
                       {task.location}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    task.urgency === "Critical" 
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" 
                      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50"
                  }`}>
                    {task.urgency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    {task.status === "Pending" ? (
                      <><Clock size={14} /> Pending Assignment</>
                    ) : (
                      <><CheckCircle size={14} className="text-emerald-500" /> Team Assigned</>
                    )}
                  </span>
                  <button 
                    onClick={() => handleAssign(task.id)}
                    disabled={task.status === "Assigned"}
                    className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-150 ${
                      task.status === "Pending" 
                        ? "bg-teal-600 text-white hover:bg-teal-700 hover:shadow-md active:scale-95" 
                        : "bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {task.status === "Pending" ? "Assign Team" : "Assigned"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Volunteers */}
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-md overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 flex justify-between items-center">
             <h2 className="text-sm font-bold tracking-wider text-stone-600 dark:text-stone-300 uppercase flex items-center gap-2">
              <Users size={18} className="text-teal-600 dark:text-teal-400" /> Active Roster
            </h2>
            <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800/50">
              {volunteers.filter(v => v.status === "Available").length} Available
            </span>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-3">
             {volunteers.map(volunteer => (
               <div 
                 key={volunteer.id}
                 className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold">
                     {volunteer.name.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">{volunteer.name}</h3>
                     <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                       <Phone size={12} /> {volunteer.phone}
                     </p>
                   </div>
                 </div>
                 <span className={`flex items-center gap-1.5 text-xs font-bold ${
                   volunteer.status === "Available" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-stone-400 dark:text-stone-500"
                 }`}>
                   <span className={`w-2 h-2 rounded-full ${
                     volunteer.status === "Available" ? "bg-emerald-500" : "bg-stone-300 dark:bg-stone-600"
                   }`}></span>
                   {volunteer.status}
                 </span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
