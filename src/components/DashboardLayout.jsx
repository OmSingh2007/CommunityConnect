import { useState, useEffect} from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { auth,db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  UploadCloud,
  HeartHandshake,
  BarChart3,
  Users,
  Sun,
  Moon,
  CheckCheck
} from "lucide-react";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  

  // ── Theme: read localStorage, default = dark ──────────────────────
  const [isDarkMode, setIsDarkMode] = useState(
    () => (localStorage.getItem("theme") ?? "dark") === "dark"
  );

  // Toggles the .dark class on <html> and persists the choice
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // ── Firebase user helpers ──────────────────────────────────────────
  // 1. Get the current user from Firebase
  const currentUser = auth.currentUser;

  // 2. Generate their initials (e.g. "om@email.com" → "OM")
  const userInitials = currentUser?.email
    ? currentUser.email.substring(0, 2).toUpperCase()
    : "AU";

  // 3. Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  // ── NOTIFICATION STATE & LOGIC ──────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const currentNgoId = "mumbai_relief_02";

    const q = query(
      collection(db, "notifications"),
      where("ngoId", "==", currentNgoId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = [];
      snapshot.forEach((doc) => {
        notifData.push({ id: doc.id, ...doc.data() });
      });

      // Sort newest to the top
      notifData.sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      setNotifications(notifData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.isRead) markAsRead(n.id);
    });
  };

  // ── Shared nav-link class builder ─────────────────────────────────
  const navLink = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
      location.pathname === path
        ? "bg-sky-100 dark:bg-teal-500/20 text-sky-700 dark:text-teal-400 border-sky-300 dark:border-teal-500/30"
        : "text-slate-500 dark:text-stone-400 border-transparent hover:bg-sky-50 dark:hover:bg-stone-700/40 hover:text-sky-700 dark:hover:text-stone-200"
    }`;

  return (
    <div className="flex h-screen bg-sky-50 dark:bg-stone-950 font-sans">

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <div className="w-64 bg-white dark:bg-stone-900/80 backdrop-blur-xl border-r border-sky-200 dark:border-stone-700/50 flex flex-col shadow-sm dark:shadow-none">

        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-sky-200 dark:border-stone-700/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-sky-100 dark:bg-teal-500/20 text-sky-600 dark:text-teal-400 border border-sky-300 dark:border-teal-500/30">
              <HeartHandshake size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-stone-100 leading-tight">CommunityConnect</p>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 dark:text-stone-500 uppercase">NGO Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-stone-600 uppercase mb-3">General</p>

          <Link to="/" className={navLink("/")}>
            <LayoutDashboard size={17} /> Dashboard
          </Link>

          <Link to="/upload" className={navLink("/upload")}>
            <UploadCloud size={17} /> Upload Survey
          </Link>

          <Link to="/analytics" className={navLink("/analytics")}>
            <BarChart3 size={17} /> Analytics
          </Link>

          <Link to="/volunteer-hub" className={navLink("/volunteer-hub")}>
            <Users size={17} /> Volunteer Hub
          </Link>

          <div className="pt-5 pb-1">
            <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-stone-600 uppercase mb-3">Settings</p>
          </div>

          <Link to="/settings" className={navLink("/settings")}>
            <Settings size={17} /> Settings
          </Link>
        </nav>

        {/* Bottom user strip — click to log out */}
        <div className="p-4 border-t border-sky-200 dark:border-stone-700/50">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-stone-700/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-teal-500/20 text-sky-600 dark:text-teal-400 font-bold text-xs border border-sky-300 dark:border-teal-500/30 flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-stone-300 truncate">{currentUser?.email || "NGO User"}</p>
              <p className="text-[10px] text-slate-400 dark:text-stone-600">Program Manager</p>
            </div>
            <LogOut size={14} className="text-slate-400 dark:text-stone-600 group-hover:text-rose-400 transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="relative z-50 flex items-center justify-between px-8 py-4 bg-white/90 dark:bg-stone-900/60 backdrop-blur-xl border-b border-sky-200 dark:border-stone-700/50 shadow-sm dark:shadow-none">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100">Welcome back 👋</h2>
            <p className="text-sm text-slate-500 dark:text-stone-500">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-sky-200 dark:border-stone-700 bg-sky-50 dark:bg-stone-800/60 text-sky-700 dark:text-stone-400 hover:bg-sky-100 dark:hover:bg-stone-700/50 transition-all"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              {isDarkMode ? "Light" : "Dark"}
            </button>

            {/* ── Bell ── */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-400 dark:text-stone-500 hover:text-sky-600 dark:hover:text-stone-200 rounded-lg hover:bg-sky-50 dark:hover:bg-stone-700/40 transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-stone-900 rounded-full">
                    <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75"></span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-stone-900 border border-sky-200 dark:border-stone-700/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden z-[200]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-sky-100 dark:border-stone-800 bg-slate-50 dark:bg-stone-950/50">
                    <h3 className="font-bold text-slate-800 dark:text-stone-200 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-sky-600 dark:text-teal-400 hover:text-sky-700 dark:hover:text-teal-300 uppercase tracking-wider flex items-center gap-1"
                      >
                        <CheckCheck size={12} /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 dark:text-stone-500 text-sm">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-sky-50 dark:border-stone-800/50 cursor-pointer transition-colors ${
                            notif.isRead 
                              ? "bg-transparent opacity-60" 
                              : "bg-sky-50/50 dark:bg-teal-500/5 hover:bg-sky-100/50 dark:hover:bg-teal-500/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-bold ${notif.isRead ? "text-slate-600 dark:text-stone-400" : "text-slate-800 dark:text-stone-200"}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && <span className="w-2 h-2 bg-sky-500 dark:bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-7 bg-sky-200 dark:bg-stone-700/70"></div>

            {/* ── Profile Dropdown ── */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-sky-50 dark:hover:bg-stone-700/40 p-2 rounded-xl transition-all"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-100 dark:bg-teal-500/20 text-sky-600 dark:text-teal-400 font-bold text-sm border border-sky-300 dark:border-teal-500/30">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-stone-200 truncate max-w-[150px]">
                    {currentUser?.email || "NGO User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-stone-500">Program Manager</p>
                </div>
                <ChevronDown size={15} className="text-slate-400 dark:text-stone-500" />
              </button>

              {/* Dropdown — z-[200] ensures it floats above every page component */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-stone-900 border border-sky-200 dark:border-stone-700/60 rounded-2xl shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)] py-2 z-[200]">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-700/40 hover:text-sky-700 dark:hover:text-stone-100 transition-colors mx-1 rounded-xl"
                  >
                    <User size={15} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-stone-300 hover:bg-sky-50 dark:hover:bg-stone-700/40 hover:text-sky-700 dark:hover:text-stone-100 transition-colors mx-1 rounded-xl"
                  >
                    <Settings size={15} /> Account Settings
                  </Link>
                  <div className="h-px bg-sky-100 dark:bg-stone-700/50 my-2 mx-3"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 transition-colors mx-1 rounded-xl w-[calc(100%-8px)]"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── PAGE CONTENT (Outlet renders child routes here) ── */}
        <main className="flex-1 overflow-y-auto p-6 bg-sky-50 dark:bg-stone-950">
          <Outlet />
        </main>

      </div>
    </div>
  );
}