import { useAuth } from "../context/AuthContext";
import ConnectionBadge from "./ConnectionBadge";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 text-slate-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="font-semibold">Checklist Automático</div>
        <div className="flex items-center gap-4">
          {/* <ConnectionBadge /> */}
          <div className="text-sm text-slate-300">{user?.email}</div>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
