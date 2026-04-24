import { useState } from "react";
import { Building2, Mail, MapPin, CheckCircle2, Save } from "lucide-react";

const REGIONS = [
  "Mumbai Metropolitan Region",
  "Pune District",
  "Nashik Division",
  "Aurangabad Division",
  "Nagpur Division",
  "Konkan Division",
  "Pan-India",
];

const INITIAL = {
  orgName: "Asha Foundation",
  email: "contact@ashafoundation.org",
  region: "Mumbai Metropolitan Region",
};

function FieldWrapper({ label, hint, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">
        <Icon size={12} className="text-stone-400" />
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-stone-400 pl-0.5">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (saving) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  };

  const inputBase =
    "w-full px-4 py-2.5 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl placeholder:text-stone-300 " +
    "focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 transition-all duration-150 hover:border-stone-300";

  return (
    <div className="max-w-xl mx-auto space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 tracking-tight">Settings</h2>
        <p className="text-sm text-stone-400 mt-1">
          Manage your organisation profile and regional preferences.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
        {/* Section: Organisation */}
        <div className="px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-5">
            Organisation
          </p>
          <div className="space-y-5">
            <FieldWrapper
              label="NGO Organisation Name"
              icon={Building2}
              hint="This name appears on all exported reports."
            >
              <input
                type="text"
                value={form.orgName}
                onChange={handleChange("orgName")}
                placeholder="e.g. Asha Foundation"
                className={inputBase}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Primary Contact Email"
              icon={Mail}
              hint="Used for system notifications and AI processing alerts."
            >
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="e.g. contact@ngo.org"
                className={inputBase}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Section: Regional */}
        <div className="px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-5">
            Regional
          </p>
          <FieldWrapper
            label="Default Operating Region"
            icon={MapPin}
            hint="Filters dashboard data to your primary field area."
          >
            <div className="relative">
              <select
                value={form.region}
                onChange={handleChange("region")}
                className={`${inputBase} appearance-none pr-10 cursor-pointer`}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {/* Custom chevron */}
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </FieldWrapper>
        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">
            Preferences saved successfully.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => { setForm(INITIAL); setSaved(false); }}
          className="text-sm text-stone-400 hover:text-stone-600 font-medium transition-colors"
        >
          Reset to defaults
        </button>

        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all duration-150
            ${!isDirty
              ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
              : saving
              ? "bg-teal-400 cursor-wait"
              : "bg-teal-600 hover:bg-teal-700 active:scale-95"
            }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <Save size={15} />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}