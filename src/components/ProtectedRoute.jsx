import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { HeartHandshake } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 gap-5">
        
        <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg">
          <HeartHandshake size={26} strokeWidth={1.8} />
          
          <span className="absolute inset-0 rounded-2xl border-2 border-teal-300 border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-stone-600">
            Verifying your session…
          </p>
          <p className="text-xs text-stone-400">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  // if the user is not authenticated redirect them to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // if user is authenticated
  return children;
}