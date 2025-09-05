import { useEffect, useState } from "react";
import { pingHealth } from "../services/system";

export default function ConnectionBadge() {
  const [status, setStatus] = useState<"ok" | "fail" | "loading">("loading");

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        await pingHealth();
        if (active) setStatus("ok");
      } catch {
        if (active) setStatus("fail");
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const color =
    status === "ok"
      ? "bg-emerald-500"
      : status === "fail"
      ? "bg-rose-500"
      : "bg-slate-500";
  const label =
    status === "ok" ? "API: OK" : status === "fail" ? "API: OFF" : "API: ...";

  return (
    <span className={`px-2 py-1 rounded text-xs ${color} text-white`}>
      {label}
    </span>
  );
}
