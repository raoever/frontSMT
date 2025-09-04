import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import ConnectionBadge from "../components/ConnectionBadge";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post(
        `https://backsmt.onrender.com/api/auth/login`,
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", data.token);
      console.log(data.token);
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Falha no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold text-white">Entrar</h1>
          <ConnectionBadge />
        </div>
        <p className="text-sm text-slate-300 mb-6">
          Acesse o painel para gerenciar seus JSONs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Senha</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-rose-400 text-sm">{error}</div>}

          <button
            disabled={loading}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="text-sm text-slate-300 mt-4">
          Não tem conta?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
