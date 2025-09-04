import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

type Props = { code?: number; message?: string };

export default function ErrorPage({ code, message }: Props) {
  const routeError = useRouteError() as unknown;

  // Determina status e mensagem a partir do erro de rota (quando existir),
  // ou usa os valores passados por props como fallback.
  const status =
    code ?? (isRouteErrorResponse(routeError) ? routeError.status : 500);
  const text =
    message ??
    (isRouteErrorResponse(routeError)
      ? routeError.statusText || "Erro de rota"
      : (routeError as any)?.message || "Ops! Algo deu errado.");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-black text-slate-600 mb-4">{status}</div>
        <h1 className="text-2xl font-semibold mb-2">{text}</h1>
        <p className="text-slate-400 mb-6">
          Tente recarregar a página. Se persistir, verifique o console do
          navegador (F12).
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
          >
            Recarregar
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
