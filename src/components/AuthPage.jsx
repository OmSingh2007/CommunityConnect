import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  HeartHandshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";


const STATS = [
  { icon: Users, value: "12,400+", label: "Beneficiaries reached" },
  { icon: BarChart3, value: "3,200+", label: "Surveys processed" },
  { icon: Globe, value: "40+", label: "Communities served" },
];


function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}


function InputField({ label, type = "text", placeholder, icon: Icon, value, onChange, suffix }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">
          <Icon size={15} strokeWidth={1.8} />
        </span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pl-10 pr-10 py-2.5 text-sm text-stone-700 bg-white border border-stone-200 rounded-xl placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 hover:border-stone-300 transition-all duration-150"
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
  };

  // ── Firebase Email/Password Handler ──
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        await createUserWithEmailAndPassword(auth, form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      // Map Firebase errors to readable text
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      // Ignore error if user just closed the popup manually
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-50 font-sans">

      
      <div className="relative hidden lg:flex flex-col justify-between w-[44%] shrink-0 bg-teal-700 px-12 py-12 overflow-hidden">

       
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-600 opacity-40" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-teal-800 opacity-30" />
        <div className="absolute -bottom-20 left-12 w-56 h-56 rounded-full bg-teal-600 opacity-20" />

       
        <div className="relative flex items-center gap-3 z-10">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white backdrop-blur-sm">
            <HeartHandshake size={22} strokeWidth={1.8} />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold text-white tracking-tight">ImpactBase</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-teal-200">NGO Portal</p>
          </div>
        </div>

        
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-white/15 text-teal-100 text-[11px] font-semibold rounded-full tracking-widest uppercase">
              Community Impact Platform
            </span>
            <h1 className="text-3xl font-bold text-white leading-snug tracking-tight">
              Turning field surveys into <span className="text-teal-200">meaningful change.</span>
            </h1>
            <p className="text-sm text-teal-100 leading-relaxed max-w-xs">
              ImpactBase helps NGOs digitise handwritten surveys with AI, track community needs in real time, and make data-driven decisions that matter.
            </p>
          </div>

          
          <div className="grid grid-cols-3 gap-4 pt-2">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="space-y-1">
                <Icon size={16} className="text-teal-300" strokeWidth={1.8} />
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[11px] text-teal-200 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        
        <div className="relative z-10">
          <p className="text-xs text-teal-300 italic">
            "We rise by lifting others."
          </p>
          <p className="text-[11px] text-teal-400 mt-1">— Robert Ingersoll</p>
        </div>
      </div>

      
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 text-white">
              <HeartHandshake size={20} strokeWidth={1.8} />
            </span>
            <p className="text-base font-bold text-stone-800 tracking-tight">ImpactBase</p>
          </div>

          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-stone-800 tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-stone-400">
              {isLogin
                ? "Sign in to access your NGO dashboard."
                : "Start managing your community impact today."}
            </p>
          </div>

          
          <div className="flex bg-stone-100 rounded-xl p-1">
            {["Sign In", "Create Account"].map((label, i) => (
              <button
                key={label}
                onClick={() => { 
                  setIsLogin(i === 0); 
                  setForm({ email: "", password: "" }); 
                  setError(""); 
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isLogin === (i === 0)
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          
          <form 
            onSubmit={(e) => handleSubmit(e)} 
            className="space-y-4"
          >
            
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <InputField
              label="Email address"
              type="email"
              placeholder="you@organisation.org"
              icon={Mail}
              value={form.email}
              onChange={handleChange("email")}
            />
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange("password")}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-stone-300 hover:text-stone-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              }
            />

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

           
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all duration-150
                ${loading ? "bg-teal-400 cursor-wait" : "bg-teal-600 hover:bg-teal-700 active:scale-95"}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            
            <button 
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-600 hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all duration-150 shadow-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          
          <p className="text-center text-xs text-stone-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin((v) => !v); setForm({ email: "", password: "" }); setError(""); }}
              className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

          <p className="text-center text-[11px] text-stone-300 leading-relaxed">
            By continuing, you agree to ImpactBase's{" "}
            <span className="underline cursor-pointer hover:text-stone-500 transition-colors">Terms</span>{" "}
            and{" "}
            <span className="underline cursor-pointer hover:text-stone-500 transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}