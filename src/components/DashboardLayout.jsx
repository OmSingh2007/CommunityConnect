import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  Settings,
  HeartHandshake,
  Bell,
  ChevronDown,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/upload", label: "Upload Survey", icon: UploadCloud },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-stone-50 font-sans overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="flex flex-col w-64 shrink-0 bg-white border-r border-stone-200">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-stone-100">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 text-white">
            <HeartHandshake size={20} strokeWidth={1.8} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-stone-800 tracking-tight">
              ImpactBase
            </p>
            <p className="text-[11px] text-stone-400 font-medium tracking-wide uppercase">
              NGO Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest uppercase text-stone-400">
            Main Menu
          </p>
          {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={isActive ? "text-teal-600" : "text-stone-400"}
                  />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-stone-100">
          <p className="text-[11px] text-stone-300 text-center">
            ImpactBase v1.0.0
          </p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200 shrink-0">
          {/* Page title injected via context or breadcrumb — placeholder */}
          <div>
            <h1 className="text-lg font-semibold text-stone-800 tracking-tight">
              Welcome back 👋
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors">
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 border-2 border-white" />
            </button>

            {/* Divider */}
            <div className="w-px h-7 bg-stone-200" />

            {/* User profile */}
            <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-stone-100 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                AU
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-sm font-semibold text-stone-700">
                  Admin User
                </p>
                <p className="text-[11px] text-stone-400">Program Manager</p>
              </div>
              <ChevronDown
                size={14}
                className="text-stone-400 group-hover:text-stone-600 transition-colors"
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}