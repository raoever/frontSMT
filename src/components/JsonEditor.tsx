// src/components/JsonEditor.tsx
import { useEffect, useRef, useState } from "react";

type Props = { value: any; onChange: (v: any) => void };

export default function JsonEditor({ value, onChange }: Props) {
  const [text, setText] = useState<string>("");
  const lastValueRef = useRef<any>();

  useEffect(() => {
    if (lastValueRef.current !== value) {
      setText(JSON.stringify(value ?? {}, null, 2));
      lastValueRef.current = value;
    }
  }, [value]);

  const handleChange = (t: string) => {
    setText(t);
    try {
      const parsed = JSON.parse(t);
      lastValueRef.current = parsed;
      onChange(parsed);
    } catch {
      // mantém edição mesmo com JSON inválido, só não chama onChange
    }
  };

  return (
    <textarea
      className="w-full h-64 p-3 font-mono text-sm bg-slate-900 text-slate-100 border border-slate-700 rounded"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder='{"nome":"Exemplo","itens":[1,2,3]}'
    />
  );
}
