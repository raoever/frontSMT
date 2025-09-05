import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <RouterProvider
        router={router}
        fallbackElement={
          <div className="flex items-center justify-center h-screen text-slate-300">
            Carregando...
          </div>
        }
      />
    </div>
  );
}
