import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { signInWithGoogle, logout, auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Login() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
        <div className="w-16 h-3 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="w-4 h-4 text-slate-500" />
          )}
          <span className="text-sm font-medium text-slate-700 hidden md:inline">{user.displayName}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </button>
  );
}
