import {
  ClipboardList,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Tag,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────────

const SUMMARY_CARDS = [
  {
    label: "Pending Surveys",
    value: "34",
    change: "+4 this week",
    trend: "up",
    icon: ClipboardList,
    accent: "teal",
  },
  {
    label: "Critical Needs",
    value: "12",
    change: "3 escalated today",
    trend: "up",
    icon: AlertTriangle,
    accent: "rose",
  },
  {
    label: "Active Volunteers",
    value: "128",
    change: "+17 this month",
    trend: "up",
    icon: Users,
    accent: "amber",
  },
];

const COMMUNITY_NEEDS = [
  {
    id: "CN-001",
    category: "Food Security",
    location: "Dharavi, Mumbai",
    urgency: "High",
    status: "In Progress",
  },
  {
    id: "CN-002",
    category: "Medical Aid",
    location: "Govandi, Mumbai",
    urgency: "Critical",
    status: "Pending",
  },
  {
    id: "CN-003",
    category: "Education",
    location: "Kurla West, Mumbai",
    urgency: "Medium",
    status: "Resolved",
  },
  {
    id: "CN-004",
    category: "Sanitation",
    location: "Mankhurd, Mumbai",
    urgency: "High",
    status: "In Progress",
  },
  {
    id: "CN-005",
    category: "Shelter",
    location: "Chembur, Mumbai",
    urgency: "Low",
    status: "Pending",
  },
];

// ── Badge config ───────────────────────────────────────────────────────────────

const URGENCY_STYLES = {
  Critical: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  High: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const STATUS_STYLES = {
  Pending: "bg-stone-100 text-stone-500",
  "In Progress": "bg-sky-50 text-sky-700",
  Resolved: "bg-teal-50 text-teal-700",
};

const ACCENT_STYLES = {
  teal: {
    bg: "bg-teal-50",
    icon: "bg-teal-600 text-white",
    text: "text-teal-600",
    bar: "bg-teal-400",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-500 text-white",
    text: "text-rose-500",
    bar: "bg-rose-400",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-500 text-white",
    text: "text-amber-500",
    bar: "bg-amber-400",
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, change, icon: Icon, accent }) {
  const a = ACCENT_STYLES[accent];
  return (
    <div className="relative bg-white rounded-2xl border border-stone-200 p-6 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Decorative corner blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 ${a.bg}`}
      />

      <div className="flex items-start justify-between relative">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-xl ${a.icon} shadow-sm`}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${a.text}`}
        >
          <TrendingUp size={12} />
          <span>{change}</span>
        </span>
      </div>

      <div className="mt-5 relative">
        <p className="text-3xl font-bold text-stone-800 tracking-tight">
          {value}
        </p>
        <p className="mt-1 text-xs font-semibold text-stone-400 uppercase tracking-widest">
          {label}
        </p>
      </div>

      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${a.bar} opacity-50`} />
    </div>
  );
}

function UrgencyBadge({ urgency }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        URGENCY_STYLES[urgency] ?? "bg-stone-100 text-stone-500"
      }`}
    >
      {urgency === "Critical" && (
        <span className="mr-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
      )}
      {urgency}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-stone-100 text-stone-500"
      }`}
    >
      {status}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Page heading ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800 tracking-tight">
            Active Needs Dashboard
          </h2>
          <p className="text-sm text-stone-400 mt-0.5">
            Real-time overview of field surveys and community needs.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-sm">
          View Full Report
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {SUMMARY_CARDS.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Community Needs Table ── */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-800">
              Community Needs
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {COMMUNITY_NEEDS.length} active entries
            </p>
          </div>
          <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Export CSV →
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                {["ID", "Category", "Location", "Urgency", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-widest"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {COMMUNITY_NEEDS.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-stone-50/70 transition-colors group cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* ID */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                      {row.id}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-medium text-stone-700">
                      <Tag
                        size={13}
                        className="text-stone-300 shrink-0"
                        strokeWidth={2}
                      />
                      {row.category}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-stone-500">
                      <MapPin
                        size={13}
                        className="text-stone-300 shrink-0"
                        strokeWidth={2}
                      />
                      {row.location}
                    </span>
                  </td>

                  {/* Urgency */}
                  <td className="px-6 py-4">
                    <UrgencyBadge urgency={row.urgency} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-stone-100 bg-stone-50/50">
          <p className="text-xs text-stone-400">
            Showing 1–{COMMUNITY_NEEDS.length} of {COMMUNITY_NEEDS.length}{" "}
            results
          </p>
          <div className="flex gap-1">
            {["←", "→"].map((arrow) => (
              <button
                key={arrow}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors text-sm"
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}