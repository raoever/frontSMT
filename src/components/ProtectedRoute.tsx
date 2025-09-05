// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-300">
        Verificando sessão...
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
}
