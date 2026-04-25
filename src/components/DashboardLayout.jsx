import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase"; // Make sure this path points to your firebase.js
import { signOut } from "firebase/auth";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  LayoutDashboard,
  UploadCloud,
  HeartHandshake
} from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // 1. Get the current user from Firebase
  const currentUser = auth.currentUser;

  // 2. Generate their initials (e.g., "om@email.com" becomes "OM")
  const userInitials = currentUser?.email 
    ? currentUser.email.substring(0, 2).toUpperCase() 
    : "AU";

  // 3. The logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="flex h-screen bg-stone-50 font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-white border-r border-stone-200 flex flex-col">
        {/* Sidebar Logo */}
        <div className="h-20 flex items-center px-6 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white">
              <HeartHandshake size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-stone-800 leading-tight">CommunityConnect</p>
              <p className="text-[10px] font-semibold tracking-widest text-stone-400 uppercase">NGO Portal</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-2 text-xs font-bold tracking-wider text-stone-400 uppercase mb-4">Main Menu</p>
          
          <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          <Link to="/upload" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/upload' ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
            <UploadCloud size={18} />
            Upload Survey
          </Link>
          
          <Link to="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'bg-teal-50 text-teal-700' : 'text-stone-600 hover:bg-stone-50'}`}>
            <Settings size={18} />
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200">
          <div>
            <h2 className="text-xl font-bold text-stone-800">Welcome back 👋</h2>
            <p className="text-sm text-stone-500">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-stone-400 hover:text-stone-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="w-px h-8 bg-stone-200"></div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-stone-800 truncate max-w-[150px]">
                    {currentUser?.email || "NGO User"}
                  </p>
                  <p className="text-xs text-stone-500">Program Manager</p>
                </div>
                <ChevronDown size={16} className="text-stone-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50">
                  <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                    <Settings size={16} />
                    Account Settings
                  </Link>
                  <div className="h-px bg-stone-100 my-2"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- PAGE CONTENT (Outlet injects the active page here) --- */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}