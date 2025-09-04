import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import {
  createFile,
  deleteFile,
  getFile,
  listFiles,
  updateFile,
  type JsonFile,
} from "../services/files";

export default function Dashboard() {
  const [files, setFiles] = useState<JsonFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de criação/edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JsonFile | null>(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [token, setToken] = useState(null);
  const tempToken = localStorage.getItem("token");

  const sortedFiles = useMemo(
    () =>
      [...files].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [files]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listFiles();
      setFiles(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao carregar arquivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onQuickUploadSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".json")) {
      alert("Selecione um arquivo .json");
      return;
    }
    setEditing(null);
    setSelectedFile(file);
    setTitle(file.name.replace(/\.json$/i, ""));
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSelectedFile(null);
    setModalOpen(true);
  };

  const openEdit = async (item: JsonFile) => {
    setError(null);
    setEditing(item);
    setTitle(item.title);
    setSelectedFile(null); // substituição de arquivo é opcional
    setModalOpen(true);
  };

  const save = async () => {
    if (!title.trim()) {
      alert("Informe um título.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateFile(editing._id, {
          title: title.trim(),
          file: selectedFile || undefined,
        });
      } else {
        if (!selectedFile) {
          alert("Selecione um arquivo .json.");
          setSaving(false);
          return;
        }
        await createFile({ title: title.trim(), file: selectedFile });
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Deseja excluir este arquivo?")) return;
    try {
      await deleteFile(id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Falha ao excluir.");
    }
  };

  const download = async (id: string) => {
    try {
      const data = await getFile(id);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title || data.filename || "arquivo"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Falha ao baixar.");
    }
  };

  const preview = async (id: string) => {
    try {
      const data = await getFile(id);
      setPreviewData(data.data);
      setPreviewOpen(true);
    } catch {
      alert("Falha ao carregar para visualização.");
    }
  };

  return (
    <div className="min-h-screen text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <label className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm cursor-pointer">
              Upload .json
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onQuickUploadSelect(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <button
              onClick={openCreate}
              className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm"
            >
              Novo (enviar arquivo)
            </button>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Token: {tempToken}</h2>
      </div>
    </div>
  );
}
