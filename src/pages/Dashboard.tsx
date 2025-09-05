import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import {
  createFile,
  deleteFile,
  getFile,
  listFiles,
  updateFile,
  type JsonFile,
} from "./../services/files";

//importes Leo
import { Button } from "./../components/ui/button";
import { Input } from "./../components/ui/input";
import { Label } from "./../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../components/ui/card";
import { Textarea } from "./../components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./../components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./../components/ui/dialog";
import {
  Trash2,
  Plus,
  FileText,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  User,
  X,
  AlertCircle,
  Bold,
  Italic,
  Type,
  Palette,
  Minus,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

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

  // Rich Text Editor Component incício do código Leo
  interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }

  function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
  }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const fontSizeRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    const [showFontSize, setShowFontSize] = useState(false);
    const [showColors, setShowColors] = useState(false);

    const applyFormat = (command: string, value?: string) => {
      document.execCommand(command, false, value);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const insertDivider = () => {
      document.execCommand(
        "insertHTML",
        false,
        '<hr style="border: none; border-top: 1px solid #ccc; margin: 10px 0;">'
      );
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const handleInput = () => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    const fontSizes = [
      "10px",
      "12px",
      "14px",
      "16px",
      "18px",
      "20px",
      "24px",
      "32px",
    ];
    const colors = [
      "#000000",
      "#FFFFFF",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
      "#800080",
      "#008000",
      "#FFC0CB",
      "#A52A2A",
      "#808080",
      "#000080",
      "#800000",
      "#008080",
      "#FF69B4",
      "#32CD32",
      "#FFD700",
      "#FF6347",
      "#4169E1",
      "#DA70D6",
      "#20B2AA",
      "#FF1493",
      "#7B68EE",
      "#98FB98",
      "#F0E68C",
      "#DDA0DD",
      "#87CEEB",
      "#F4A460",
      "#9370DB",
    ];

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          fontSizeRef.current &&
          !fontSizeRef.current.contains(event.target as Node)
        ) {
          setShowFontSize(false);
        }
        if (
          colorPickerRef.current &&
          !colorPickerRef.current.contains(event.target as Node)
        ) {
          setShowColors(false);
        }
      };

      if (showFontSize || showColors) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [showFontSize, showColors]);

    useEffect(() => {
      if (editorRef.current && value !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }
    }, [value]);

    // Add placeholder styling through CSS
    const placeholderStyle: React.CSSProperties = {
      position: "relative",
    };

    const placeholderCSS = `
    .rich-editor-content:empty:before {
      content: "${placeholder || ""}";
      color: #9CA3AF;
      pointer-events: none;
      position: absolute;
    }
  `;

    const handleFontSizeClick = (size: string) => {
      applyFormat("fontSize", size.replace("px", ""));
      setShowFontSize(false);
    };

    const handleColorClick = (color: string) => {
      applyFormat("foreColor", color);
      setShowColors(false);
    };
    // final do código Leo

    return (
      <div>
        {/* início código Leo */}

        <div className={`border rounded-md ${className}`}>
          <style>{placeholderCSS}</style>

          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("bold")}
              className="h-8 w-8 p-0"
              title="Negrito"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("italic")}
              className="h-8 w-8 p-0"
              title="Itálico"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("underline")}
              className="h-8 w-8 p-0"
              title="Sublinhado"
            >
              <span className="text-sm font-bold underline">U</span>
            </Button>

            <div className="border-l mx-2 h-6" />

            {/* Font Size */}
            <div className="relative" ref={fontSizeRef}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFontSize(!showFontSize);
                }}
                className="h-8 px-2"
                title="Tamanho da fonte"
              >
                <Type className="h-4 w-4" />
              </Button>
              {showFontSize && (
                <div
                  className="absolute top-8 left-0 z-50 bg-white border rounded-md shadow-lg p-1 min-w-[80px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {fontSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-sm rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFontSizeClick(size);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Picker */}
            <div className="relative" ref={colorPickerRef}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColors(!showColors);
                }}
                className="h-8 w-8 p-0"
                title="Cor do texto"
              >
                <Palette className="h-4 w-4" />
              </Button>
              {showColors && (
                <div
                  className="absolute top-8 left-0 z-50 bg-white border rounded-md shadow-lg p-2 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-6 h-6 rounded border hover:scale-110 transition-transform cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColorClick(color);
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        applyFormat("removeFormat");
                        setShowColors(false);
                      }}
                    >
                      Remover cor
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-l mx-2 h-6" />

            {/* Divider Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertDivider}
              className="h-8 w-8 p-0"
              title="Inserir divisão"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="border-l mx-2 h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("removeFormat")}
              className="h-8 px-2 text-xs"
              title="Limpar formatação"
            >
              Limpar
            </Button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="rich-editor-content min-h-[60px] p-3 outline-none focus:bg-gray-50/30 transition-colors"
            style={{ ...placeholderStyle, minHeight: "60px" }}
            suppressContentEditableWarning={true}
          />
        </div>

        {/* final código Leo */}
      </div>
    );
  }

  // Inline types código Leo
  interface ChecklistItem {
    id: string;
    item: string;
    descricao: string;
    status: "NONE" | "OK" | "PARCIAL" | "FALTA" | "PENDENCIA_PROXIMA_MP";
    obs: string;
    qtd: string;
    extras: Record<string, string>;
    sortOrder: number;
    funcionarioId?: string;
    lembrete?: string;
    expanded?: boolean;
  }

  interface CompanyData {
    conferencia: string;
    empresa: string;
    periodo: string;
    localData: string;
    numeroProcesso: string;
    numeroMedicao: string;
    protocoloSEI: string;
    numeroContrato: string;
    mesReferencia: string;
    cidade: string;
    Usuario: string;
    cargo: string;
    dataConferencia: string;
    observacaoAmostragem?: string;
    observacaoGeral?: string;
  }

  interface FuncionarioDemissao {
    id: string;
    nome: string;
    dataAdmissao: string;
    dataDemissao: string;
    expanded: boolean;
  }

  interface FuncionarioAdmissao {
    id: string;
    nome: string;
    dataAdmissao: string;
    expanded: boolean;
  }

  interface FuncionarioTransferencia {
    id: string;
    nome: string;
    dataTransferencia: string;
    obraOrigem: string;
    obraDestino: string;
    expanded: boolean;
  }

  // Inline constants
  const STORAGE_KEY = "checklist_medição_v9";

  const USUARIOS = [
    "Alane Bezerra de Sousa",
    "Leticia Rodrigues de Amorin Rocha",
    "Leonardo de Souza Silva",
    "Mirian Lins da Silva Moura",
    "Renê Alves de Oliveira",
    "Aldoniro Ribeiro Chagas",
    "Lucio Paulo Magalhães Aires",
    "Waldo Henrique Costa Borges",
  ];

  const CARGOS = [
    "Fiscal Administrativo",
    "Assistente Técnica Administrativa de Nível Superior Jr",
    "Técnico em Secretariado",
    "Chefe do Setor de Manutenção Terrestre",
  ];

  const ITENS_PADRAO = [
    [
      "Declaração",
      "Responsabilizar-se pelos encargos trabalhistas, previdenciários, fiscais e comerciais, resultantes da execução do Contrato, conforme dispõe o art. 71, Parágrafos 1° e 2°, da Lei n.º 8.666/93.",
    ],
    [
      "Declaração",
      "Garante aos seus trabalhadores ambiente de trabalho, inclusive equipamentos e instalações, em condições adequadas ao cumprimento das normas de saúde, segurança e bem-estar no trabalho.",
    ],
    [
      "Declaração",
      "Cumpre a observância dos preceitos da legislação sobre a jornada de trabalho, conforme a categoria profissional.",
    ],
    [
      "Declaração",
      "Responsabilidade exclusiva da contratada sobre a quitação dos encargos trabalhistas e sociais decorrentes do contrato.",
    ],
    ["I", "Comprovante de inscrição no CNO"],
    ["II", "Folhas de ponto (com relatório de horas, se aplicável)"],
    ["III", "Contracheques (ou recibos bancários)"],
    ["IV", "Folha de pagamento analítica"],
    ["V", "Comprovante de fornecimento de transporte"],
    ["VI", "Guia de recolhimento da Previdência Social - GPS"],
    ["VII", "Extratos de FGTS individuais"],
    ["VIII", "Relação de trabalhadores no FGTS Digital"],
    ["IX", "Guia de arrecadação de IRRF"],
    ["X", "Comprovante DCTFWEB"],
    ["XI", "Comprovante de alimentação"],
    ["XII", "Comprovante de cesta básica"],
    ["XIII", "Apólice de Seguro de Vida (com certificados individuais)"],
    [
      "01",
      "Relação dos empregados contendo nome completo, cargo, função, horário do posto, RG, CPF e RTs, se houver",
    ],
    ["SE1", "Saldo de Empenho"],
  ];

  const ITENS_DEMISSAO = [
    ["a)", "Aviso prévio / Comunicado de Dispensa / Pedido de Demissão"],
    [
      "b)",
      "Termos de rescisão; (dos contratos de trabalho dos empregados devidamente homologados)",
    ],
    [
      "c)",
      "Guias de recolhimento da contribuição previdenciária e do FGTS; (referentes às rescisões e comprovante de pagamento)",
    ],
    [
      "d)",
      "Extratos dos depósitos efetuados nas contas vinculadas individuais do FGTS de cada empregado dispensado.",
    ],
    [
      "e)",
      "Recibo de pagamento para fins rescisório; (comprovante de depósito/transferência ou recibo de pagamento assinado)",
    ],
    [
      "f)",
      "Comprovante de pagamento de FGTS para fins rescisório, se for o caso",
    ],
    ["g)", "Comprovante de pagamento de multa de 40% do FGTS, se for o caso"],
    ["h)", "Exame demissional"],
    ["i)", "Folha de Ponto"],
    ["j)", "Comprovante de baixa da CTPS"],
    ["k)", "Memória de cálculo de médias"],
    ["l)", "Outros Recibos"],
    ["m)", "Outros: Declarações e Ofício"],
  ];

  const ITENS_ADMISSAO = [
    ["1)", "Carteira de Trabalho e Previdência Social (CTPS)"],
    ["2)", "Exame médico admissional"],
  ];

  const ITENS_TRANSFERENCIA = [
    ["1)", "Documento de transferência"],
    ["2)", "Atualização de dados cadastrais"],
  ];

  const ITENS_COM_QTD = new Set([
    "II",
    "III",
    "IV",
    "V",
    "VII",
    "VIII",
    "XI",
    "XII",
    "XIII",
    "01",
    "02",
    "03",
  ]);

  const EXTRAS_CONFIG: Record<
    string,
    Array<{
      id: string;
      label: string;
      type: string;
      currency?: boolean;
      mmAAAA?: boolean;
    }>
  > = {
    DECLARAÇÃO: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      { id: "data_declaracao", label: "Data:", type: "date" },
      { id: "cidade_declaracao", label: "Cidade:", type: "text" },
      { id: "uf_declaracao", label: "UF:", type: "text" },
    ],
    SE1: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "valor_saldo",
        label: "Valor do Saldo:",
        type: "text",
        currency: true,
      },
    ],
    I: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      { id: "Comprovante", label: "Nº CNO:", type: "text" },
      { id: "cidadeObra", label: "Cidade-UF:", type: "text" },
      { id: "Obra", label: "Obra:", type: "text" },
    ],
    II: [{ id: "numero_sei", label: "Nº SEI:", type: "text" }],
    III: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "dt_pagto",
        label: "Data de pagamento",
        type: "date",
      },
    ],
    IV: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "Folha_analitica",
        label: "Mês/Ano ref. (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
    ],
    V: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "dt_assin",
        label: "Data de assinatura do recibo",
        type: "date",
      },
    ],
    VI: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "guia_num",
        label: "Nº/Ident. da guia",
        type: "text",
      },
      {
        id: "guia_val",
        label: "Valor",
        type: "text",
        currency: true,
      },
      { id: "guia_venc", label: "Vencimento", type: "date" },
      {
        id: "guia_pgto",
        label: "Data de pagamento",
        type: "date",
      },
    ],
    VII: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "fgts_ult",
        label: "Último recolhimento (data)",
        type: "date",
      },
      {
        id: "fgts_comp",
        label: "Mês/Ano ref. (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
      {
        id: "fgts_atualização",
        label: "Última atualização(data)",
        type: "date",
      },
    ],
    VIII: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "doc_comp",
        label: "Mês/Ano ref. do documento (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
      {
        id: "guia_val",
        label: "Valor",
        type: "text",
        currency: true,
      },
      { id: "guia_venc", label: "Vencimento", type: "date" },
      {
        id: "guia_pgto",
        label: "Data de pagamento",
        type: "date",
      },
    ],
    IX: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "irrf_comp",
        label: "Mês de Competência (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
      {
        id: "guia_val",
        label: "Valor",
        type: "text",
        currency: true,
      },
      { id: "irrf_venc", label: "Vencimento", type: "date" },
      {
        id: "irrf_pgto",
        label: "Data de pagamento",
        type: "date",
      },
    ],
    X: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "dctf_rec",
        label: "Nº recibo de entrega",
        type: "text",
      },
      {
        id: "dctf_comp",
        label: "Comprovante de pagamento (descrição)",
        type: "text",
      },
      {
        id: "dctf_per",
        label: "Período de apuração (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
    ],
    XI: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "ali_assin",
        label: "Data de assinatura do recibo",
        type: "date",
      },
    ],
    XII: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "cesta_assin",
        label: "Data de assinatura do recibo",
        type: "date",
      },
    ],
    XIII: [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      { id: "apo_num", label: "Nº da Apólice", type: "text" },
      {
        id: "apo_ini",
        label: "Início de vigência",
        type: "date",
      },
      { id: "apo_fim", label: "Fim de vigência", type: "date" },
      { id: "apo_seg", label: "Seguradora", type: "text" },
    ],
    "01": [
      { id: "numero_sei", label: "Nº SEI:", type: "text" },
      {
        id: "mes_ref",
        label: "Mês de Referência (MM/AAAA)",
        type: "text",
        mmAAAA: true,
      },
    ],
  };

  // Inline utility functions
  const generateUniqueId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    } else {
      const timestamp = performance.now();
      const random1 = Math.random().toString(36).substring(2, 15);
      const random2 = Math.random().toString(36).substring(2, 15);
      return `${timestamp}-${random1}${random2}`;
    }
  };

  const getCurrentDateExtended = (): string => {
    const date = new Date();
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const getCurrentDate = (): string => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  // Fixed date formatting to avoid timezone issues
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";

    // Parse the date string as local date to avoid timezone issues
    // dateString comes in format 'YYYY-MM-DD' from input[type="date"]
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);

    // Create date in local timezone
    const date = new Date(year, month, day);

    // Verify the date is valid
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: string): string => {
    if (!value) return "";

    // Remove todos os caracteres que não são dígitos, vírgulas ou pontos
    let cleanValue = value.replace(/[^\d,.]/g, "");
    if (!cleanValue) return "";

    let number: number;

    // Detectar formato brasileiro vs americano
    const hasComma = cleanValue.includes(",");
    const hasDot = cleanValue.includes(".");

    if (hasComma && hasDot) {
      // Tem ambos - verificar qual vem por último para determinar o decimal
      const lastCommaIndex = cleanValue.lastIndexOf(",");
      const lastDotIndex = cleanValue.lastIndexOf(".");

      if (lastCommaIndex > lastDotIndex) {
        // Formato brasileiro: 1.500.000,50
        // Remover todos os pontos (separadores de milhares) e trocar vírgula por ponto (decimal)
        const normalized = cleanValue.replace(/\./g, "").replace(",", ".");
        number = parseFloat(normalized);
      } else {
        // Formato americano: 1,500,000.50
        // Remover todas as vírgulas (separadores de milhares) e manter ponto (decimal)
        const normalized = cleanValue.replace(/,/g, "");
        number = parseFloat(normalized);
      }
    } else if (hasComma && !hasDot) {
      // Só vírgula - assumir formato brasileiro (vírgula como decimal)
      // Verificar se é separador de milhares ou decimal baseado na posição
      const commaIndex = cleanValue.indexOf(",");
      const afterComma = cleanValue.substring(commaIndex + 1);

      if (afterComma.length <= 2 && !afterComma.includes(",")) {
        // Provável decimal: 1500,50
        number = parseFloat(cleanValue.replace(",", "."));
      } else {
        // Provável separador de milhares: 1,500 (formato americano sem decimais)
        number = parseFloat(cleanValue.replace(/,/g, ""));
      }
    } else if (hasDot && !hasComma) {
      // Só ponto - pode ser ambíguo
      const dotIndex = cleanValue.lastIndexOf(".");
      const afterDot = cleanValue.substring(dotIndex + 1);

      if (afterDot.length <= 2) {
        // Provável decimal: 1500.50
        number = parseFloat(cleanValue);
      } else {
        // Provável separador de milhares: 1.500 (formato brasileiro sem decimais)
        number = parseFloat(cleanValue.replace(/\./g, ""));
      }
    } else {
      // Só números - sem separadores
      number = parseFloat(cleanValue);
    }

    // Verificar se o número é válido
    if (isNaN(number)) return value;

    // Formatar para o padrão brasileiro
    return `R$ ${number.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const validateMMAAAA = (value: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(value);
  };

  const normalizeMMAAAA = (value: string): string => {
    if (!value) return "";

    let normalized = value.replace(/\s+/g, "").replace(/[-.]/g, "/");

    if (/^[1-9]\/\d{4}$/.test(normalized)) {
      normalized = "0" + normalized;
    }

    if (/^\d{6}$/.test(normalized)) {
      normalized = normalized.substring(0, 2) + "/" + normalized.substring(2);
    }

    if (/^\d{5}$/.test(normalized)) {
      normalized =
        "0" + normalized.substring(0, 1) + "/" + normalized.substring(1);
    }

    return normalized;
  };

  const createItemKey = (code: string, description: string): string => {
    return `${code.trim()}|${description.trim()}`;
  };

  // Function to remove duplicate items based on item code and description
  const removeDuplicateItems = (items: ChecklistItem[]): ChecklistItem[] => {
    const seen = new Set<string>();
    const uniqueItems: ChecklistItem[] = [];

    // Sort items to prioritize by sortOrder (keeping the earliest ones)
    const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const item of sortedItems) {
      const key = createItemKey(item.item, item.descricao);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      } else {
        // Remove the duplicate item's ID from tracking
        if (item.id) {
          console.log(
            `Removendo item duplicado: [${item.item}] ${item.descricao}`
          );
        }
      }
    }

    return uniqueItems;
  };

  // Function to clean up old saldo de empenho items and ensure only SE1 exists
  const cleanSaldoEmpenhoItems = (items: ChecklistItem[]): ChecklistItem[] => {
    // Remove all saldo de empenho items (SE1, SE2, or any variations)
    const filteredItems = items.filter((item) => !item.item.match(/^SE\d*$/i));

    // Check if we need to add the new SE1 item
    const hasSE1 = filteredItems.some(
      (item) =>
        createItemKey(item.item, item.descricao) ===
        createItemKey("SE1", "Saldo de Empenho")
    );

    if (!hasSE1) {
      const newSE1: ChecklistItem = {
        id: generateUniqueId(),
        item: "SE1",
        descricao: "Saldo de Empenho",
        status: "NONE" as const,
        obs: "",
        qtd: "",
        extras: {},
        sortOrder: Date.now(),
        lembrete: "",
        expanded: false,
      };
      filteredItems.push(newSE1);
    }

    return filteredItems;
  };

  const isItemDemissao = (itemCode: string): boolean => {
    return /^[a-m]\)$/.test(itemCode.trim());
  };

  const getItemSortOrder = (itemCode: string): number => {
    if (itemCode === "Declaração") return 0;

    const romanNumerals = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
      "XI",
      "XII",
      "XIII",
    ];
    const romanIndex = romanNumerals.indexOf(itemCode);
    if (romanIndex !== -1) return 100 + romanIndex;

    const arabicMatch = itemCode.match(/^(\d+)$/);
    if (arabicMatch) return 200 + parseInt(arabicMatch[1]);

    // Saldo de Empenho item
    if (itemCode === "SE1") return 210;

    const demissaoMatch = itemCode.match(/^([a-z])\)$/);
    if (demissaoMatch) return 300 + demissaoMatch[1].charCodeAt(0) - 97;

    const admissaoMatch = itemCode.match(/^(\d+)\)$/);
    if (admissaoMatch) return 400 + parseInt(admissaoMatch[1]);

    return 999;
  };

  const sortItems = (items: ChecklistItem[]): ChecklistItem[] => {
    return [...items].sort((a, b) => {
      const orderA = getItemSortOrder(a.item.trim());
      const orderB = getItemSortOrder(b.item.trim());

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.sortOrder - b.sortOrder;
    });
  };

  const validateReportFields = (
    companyData: CompanyData,
    checklistItems: ChecklistItem[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const requiredCompanyFields = [
      { field: "numeroProcesso", label: "Número do Processo" },
      { field: "numeroContrato", label: "Número do Contrato" },
      { field: "empresa", label: "Empresa" },
      { field: "numeroMedicao", label: "Número da Medição" },
      { field: "Usuario", label: "Usuário" },
      { field: "cargo", label: "Cargo" },
      { field: "conferencia", label: "Número da Conferência" },
      { field: "periodo", label: "Período da Medição" },
      {
        field: "mesReferencia",
        label: "Mês/Ano de Referência da MP",
      },
      {
        field: "dataConferencia",
        label: "Data de Conferência da Documentação",
      },
      { field: "protocoloSEI", label: "Protocolo SEI" },
    ];

    requiredCompanyFields.forEach(({ field, label }) => {
      if (!companyData[field as keyof CompanyData]?.trim()) {
        errors.push(`${label} é obrigatório`);
      }
    });

    if (checklistItems.length === 0) {
      errors.push("Adicione pelo menos um item ao checklist");
    }

    checklistItems.forEach((item) => {
      if (
        (item.status === "FALTA" ||
          item.status === "PARCIAL" ||
          item.status === "PENDENCIA_PROXIMA_MP") &&
        !item.obs.trim()
      ) {
        errors.push(
          `Informe a observação para o item [${
            item.item
          }] - ${item.descricao.substring(0, 30)}...`
        );
      }
    });

    const itemsWithMissingSEI = checklistItems.filter(
      (item) => !item.funcionarioId && !item.extras.numero_sei?.trim()
    );

    if (itemsWithMissingSEI.length > 0) {
      errors.push(
        `${itemsWithMissingSEI.length} item(ns) sem número SEI preenchido`
      );
    }

    checklistItems.forEach((item) => {
      const config = EXTRAS_CONFIG[item.item.toUpperCase()];
      if (config) {
        config.forEach((field) => {
          if (field.mmAAAA && item.extras[field.id]) {
            const value = item.extras[field.id];
            if (value && !validateMMAAAA(value)) {
              errors.push(
                `Campo "${field.label}" no item [${item.item}] deve estar no formato MM/AAAA`
              );
            }
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const showValidationReport = (
    companyData: CompanyData,
    checklistItems: ChecklistItem[]
  ) => {
    const validation = validateReportFields(companyData, checklistItems);

    if (validation.valid) {
      toast.success(
        "✅ Todos os campos obrigatórios estão preenchidos! O relatório pode ser gerado."
      );
      return;
    }

    const errorMessage = validation.errors
      .map((error, index) => `${index + 1}. ${error}`)
      .join("\n");

    toast.error(
      `❌ ${validation.errors.length} problema(s) encontrado(s):\n\n${errorMessage}`,
      {
        duration: 10000,
        style: {
          whiteSpace: "pre-line",
          maxWidth: "500px",
        },
      }
    );
  };

  const getFieldValidationClass = (
    fieldName: keyof CompanyData,
    companyData: CompanyData
  ): string => {
    const requiredFields = [
      "numeroProcesso",
      "numeroContrato",
      "empresa",
      "numeroMedicao",
      "Usuario",
      "cargo",
      "conferencia",
      "periodo",
      "mesReferencia",
      "dataConferencia",
      "protocoloSEI",
    ];

    if (requiredFields.includes(fieldName) && !companyData[fieldName]?.trim()) {
      return "border-red-500 bg-red-50";
    }
    return "";
  };

  // Function to get item color based on status
  const getItemStatusColor = (status: string): string => {
    switch (status) {
      case "OK":
        return "bg-green-100 border-green-300 text-green-800";
      case "PARCIAL":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "FALTA":
        return "bg-red-100 border-red-300 text-red-800";
      case "PENDENCIA_PROXIMA_MP":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "NONE":
        return "bg-white border-gray-300 text-gray-700 border-2 border-dashed";
      default:
        return "bg-white border-gray-300 text-gray-700 border-2 border-dashed";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "OK":
        return "✅";
      case "PARCIAL":
        return "⚠️";
      case "FALTA":
        return "❌";
      case "PENDENCIA_PROXIMA_MP":
        return "🔄";
      case "NONE":
        return "❓";
      default:
        return "❓";
    }
  };

  // Strip HTML tags for plain text display in PDF
  const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Enhanced HTML to text converter that preserves line breaks from <hr> elements
  const convertHtmlToText = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Replace <hr> elements with line breaks
    const hrElements = doc.querySelectorAll("hr");
    hrElements.forEach((hr) => {
      hr.replaceWith("\n─────────────────\n");
    });

    return doc.body.textContent || "";
  };

  // PDF generator with Saldo de Empenho section
  const gerarRelatorio = (
    tipagem: "completo" | "pendencias",
    checklistItems: ChecklistItem[],
    companyData: CompanyData,
    funcionariosDemissao: FuncionarioDemissao[],
    funcionariosAdmissao: FuncionarioAdmissao[],
    funcionariosTransferencia: FuncionarioTransferencia[]
  ) => {
    console.log("Gerando relatório:", tipagem);

    const validation = validateReportFields(companyData, checklistItems);

    if (!validation.valid) {
      const errorMessage = validation.errors
        .map((error, index) => `${index + 1}. ${error}`)
        .join("\n");

      toast.error(
        `❌ Não é possível gerar o relatório. ${validation.errors.length} problema(s) encontrado(s):\n\n${errorMessage}`,
        {
          duration: 12000,
          style: {
            whiteSpace: "pre-line",
            maxWidth: "600px",
          },
        }
      );
      return;
    }

    // Filter items based on report type
    const itemsToShow =
      tipagem === "pendencias"
        ? checklistItems.filter(
            (item) =>
              item.status === "FALTA" ||
              item.status === "PARCIAL" ||
              item.status === "PENDENCIA_PROXIMA_MP"
          )
        : checklistItems;

    // Separate items by status
    const standardItems = itemsToShow.filter((item) => !item.funcionarioId);
    const itemsApresentados = standardItems.filter(
      (item) => item.status === "OK"
    );
    const itemsPendentes = standardItems.filter(
      (item) =>
        item.status === "PARCIAL" ||
        item.status === "FALTA" ||
        item.status === "PENDENCIA_PROXIMA_MP"
    );

    // Generate table rows for presented items
    const generatePresentedItemsTable = () => {
      if (itemsApresentados.length === 0) return "";

      return `
      <div class="avoid-break">
        <h3 style="color: #2D5A27;">
          📋 Documentos Apresentados (${itemsApresentados.length} itens)
        </h3>
        <table>
          <thead>
            <tr>
              <th style="width: 60%;">Item/Descrição</th>
              <th style="width: 25%;">SEI nº</th>
              <th style="width: 15%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${itemsApresentados
              .map((item) => {
                const seiInfo = item.extras.numero_sei
                  ? `<br>${item.extras.numero_sei}`
                  : "SEI:<br>Ilustrativo";
                const qtdInfo = item.qtd ? `<br>Qtd: ${item.qtd}` : "";
                const valorInfo = item.extras.valor_saldo
                  ? `<br>Valor: ${item.extras.valor_saldo}`
                  : "";
                return `
                <tr>
                  <td>
                    <strong>[${item.item}]</strong> ${item.descricao}${qtdInfo}${valorInfo}
                  </td>
                  <td class="text-center text-small">
                    ${seiInfo}
                  </td>
                  <td class="text-center" style="font-weight: bold; color: #2D5A27;">
                    ✅ OK
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    };

    // Generate table rows for pending items
    const generatePendingItemsTable = () => {
      if (itemsPendentes.length === 0) return "";

      return `
      <div class="avoid-break">
        <h3 style="color: #CC0000;">
          ⚠️ Documentos Pendentes/Parciais (${itemsPendentes.length} itens)
        </h3>
        <table>
          <thead>
            <tr>
              <th class="pending" style="width: 40%;">Item/Descrição</th>
              <th class="pending" style="width: 35%;">Observação</th>
              <th class="pending" style="width: 15%;">SEI</th>
              <th class="pending" style="width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${itemsPendentes
              .map((item) => {
                const seiInfo = item.extras.numero_sei || "N/A";
                const statusColor =
                  item.status === "PARCIAL"
                    ? "#FF8C00"
                    : item.status === "PENDENCIA_PROXIMA_MP"
                    ? "#8B5CF6"
                    : "#CC0000";
                const statusIcon =
                  item.status === "PARCIAL"
                    ? "⚠️"
                    : item.status === "PENDENCIA_PROXIMA_MP"
                    ? "🔄"
                    : "❌";
                const qtdInfo = item.qtd ? `<br>Qtd: ${item.qtd}` : "";
                const valorInfo = item.extras.valor_saldo
                  ? `<br>Valor: ${item.extras.valor_saldo}`
                  : "";
                return `
                <tr>
                  <td>
                    <strong>[${item.item}]</strong> ${
                  item.descricao
                }${qtdInfo}${valorInfo}
                  </td>
                  <td>
                    ${convertHtmlToText(item.obs)}
                  </td>
                  <td class="text-center text-small">
                    ${seiInfo}
                  </td>
                  <td class="text-center" style="font-weight: bold; color: ${statusColor};">
                    ${statusIcon}
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
    };

    // Generate sampling observations section
    const generateSamplingObservationsSection = () => {
      if (!companyData.observacaoAmostragem?.trim()) {
        return "";
      }

      // Process HTML content to maintain formatting in PDF
      let processedObservation = companyData.observacaoAmostragem;

      // Replace <hr> elements with visual separators for PDF
      processedObservation = processedObservation.replace(
        /<hr[^>]*>/gi,
        '<div style="border-top: 1px solid #ccc; margin: 10px 0; width: 100%;"></div>'
      );

      return `
      <div class="avoid-break">
        <h3 style="color: #333;">👥 Observações sobre Funcionários da Amostragem:</h3>
        <div class="observations">
          ${processedObservation}
        </div>
      </div>
    `;
    };

    // Generate additional observations section with proper HTML formatting
    const generateObservationsSection = () => {
      if (!companyData.observacaoGeral?.trim()) {
        return "";
      }

      // Process HTML content to maintain formatting in PDF
      let processedObservation = companyData.observacaoGeral;

      // Replace <hr> elements with visual separators for PDF
      processedObservation = processedObservation.replace(
        /<hr[^>]*>/gi,
        '<div style="border-top: 1px solid #ccc; margin: 10px 0; width: 100%;"></div>'
      );

      return `
      <div class="avoid-break">
        <h3 style="color: #333;">📝 Observações (para ciência do Fiscal Administrativo):</h3>
        <div class="observations">
          ${processedObservation}
        </div>
      </div>
    `;
    };

    // Generate signature section
    const generateSignatureSection = () => {
      const usuario = companyData.Usuario || "Usuário";
      const cargo = companyData.cargo || "Cargo";

      return `
      <div class="footer avoid-break">
        <p>Atenciosamente,</p>
        <br><br>
        <p><strong>${usuario}</strong></p>
        <p><em>${cargo}</em></p>
        <p>Palmas-TO, ${
          formatDateForDisplay(companyData.dataConferencia) ||
          getCurrentDateExtended()
        }</p>
        <br>
        <p class="text-center text-small" style="color: #666;">
          Relatório gerado automaticamente pelo Sistema de Checklist - Medição Parcial
        </p>
      </div>
    `;
    };

    // Complete HTML content with DNIT styling optimized for A4
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Medição Parcial</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 20mm;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 11px;
          line-height: 1.3;
          margin: 0;
          padding: 0;
          color: #000;
          background: white;
          width: 210mm;
          min-height: 297mm;
        }
        
        .container {
          width: 100%;
          max-width: 170mm;
          margin: 0 auto;
          padding: 0;
        }
        
        .header {
          background: #4472C4;
          color: white;
          padding: 12px 15px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 3px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .header .logo {
          background: white;
          color: #4472C4;
          padding: 6px 10px;
          font-weight: bold;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .header .title {
          font-size: 14px;
          font-weight: bold;
          text-align: center;
          flex: 1;
          margin: 0 10px;
        }
        
        h1 {
          text-align: center;
          font-size: 16px;
          margin: 15px 0;
          font-weight: bold;
          color: #000;
        }
        
        .company-info {
          margin-bottom: 15px;
          font-size: 11px;
          line-height: 1.4;
        }
        
        .company-info div {
          margin-bottom: 2px;
        }
        
        .content-section {
          margin-bottom: 12px;
          font-size: 11px;
        }
        
        h3 {
          font-size: 12px;
          font-weight: bold;
          margin: 15px 0 8px 0;
          color: #333;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 10px;
        }
        
        th {
          background: #E8F5E8;
          border: 1px solid #000;
          padding: 6px;
          font-weight: bold;
          text-align: center;
          font-size: 10px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        th.pending {
          background: #FFE6E6;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        td {
          border: 1px solid #000;
          padding: 6px;
          vertical-align: top;
          font-size: 10px;
          line-height: 1.2;
        }
        
        .observations {
          border: 1px solid #000;
          padding: 12px;
          margin: 10px 0;
          background: #F9F9F9;
          line-height: 1.4;
          font-size: 11px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          font-size: 10px;
          line-height: 1.3;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .avoid-break {
          page-break-inside: avoid;
        }
        
        strong {
          font-weight: bold;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-small {
          font-size: 9px;
        }
        
        @media print {
          .no-print { 
            display: none !important; 
          }
          
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .header,
          th,
          .observations {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SRE</div>
          <div class="title">Superintendência Regional do Tocantins</div>
        </div>
        
        <h1>
          CONFERÊNCIA DOS DOCUMENTOS TRABALHISTAS ${
            tipagem === "pendencias" ? "- PENDÊNCIAS" : "- COMPLETO"
          }
        </h1>
        
        <div class="company-info avoid-break">
          <div><strong>Processo:</strong> ${
            companyData.numeroProcesso || "Não informado"
          }</div>
          <div><strong>Contrato:</strong> ${
            companyData.numeroContrato || "Não informado"
          }</div>
          <div><strong>Empresa:</strong> ${
            companyData.empresa || "Não informado"
          }</div>
          <div><strong>Medição - Período:</strong> ${
            companyData.numeroMedicao || "Não informado"
          } - ${companyData.periodo || "Período não informado"}</div>
          ${
            companyData.conferencia
              ? `<div><strong>Conferência:</strong> ${companyData.conferencia}</div>`
              : ""
          }
          ${
            companyData.mesReferencia
              ? `<div><strong>Mês/Ano de Referência da MP:</strong> ${companyData.mesReferencia}</div>`
              : ""
          }
          ${
            companyData.dataConferencia
              ? `<div><strong>Data da Conferência:</strong> ${formatDateForDisplay(
                  companyData.dataConferencia
                )}</div>`
              : ""
          }
        </div>

        <div class="content-section">
          <strong>1.</strong> Considerando protocolo SEI ${
            companyData.protocoloSEI || "Não informado"
          } no Processo SEI ${companyData.numeroProcesso || "Não informado"}.
        </div>

        <div class="content-section">
          <strong>2.</strong> Após análise da documentação apresentada, identificado:
        </div>

        ${generateSamplingObservationsSection()}

        ${generatePresentedItemsTable()}
        ${generatePendingItemsTable()}
        ${generateObservationsSection()}

        <div class="content-section avoid-break">
          <strong>3.</strong> Diante do exposto e considerando as análises realizadas sobre a documentação apresentada pela contratada, para viabilizar a análise completa e posterior liberação da medição em questão, encaminhamos o presente relatório para conhecimento e demais providências que se fizerem necessárias.
        </div>

        ${generateSignatureSection()}
      </div>
    </body>
    </html>
  `;

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 1000);
    }

    toast.success(`Relatório ${tipagem} gerado com sucesso!`);
  };

  //export default function App() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    conferencia: "",
    empresa: "",
    periodo: "",
    localData: "",
    numeroProcesso: "",
    numeroMedicao: "",
    protocoloSEI: "",
    numeroContrato: "",
    mesReferencia: "",
    cidade: "Palmas-TO",
    Usuario: "",
    cargo: "",
    dataConferencia: getCurrentDate(),
    observacaoAmostragem: "",
    observacaoGeral: "",
  });

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [funcionariosDemissao, setFuncionariosDemissao] = useState<
    FuncionarioDemissao[]
  >([]);
  const [funcionariosAdmissao, setFuncionariosAdmissao] = useState<
    FuncionarioAdmissao[]
  >([]);
  const [funcionariosTransferencia, setFuncionariosTransferencia] = useState<
    FuncionarioTransferencia[]
  >([]);

  const [demissaoForm, setDemissaoForm] = useState({
    nome: "",
    dataAdmissao: "",
    dataDemissao: "",
    numeroSei: "",
    descricaoDocumento: "",
  });
  const [showDemissaoDialog, setShowDemissaoDialog] = useState(false);

  const [admissaoForm, setAdmissaoForm] = useState({
    nome: "",
    dataAdmissao: "",
    numeroSei: "",
    descricaoDocumento: "",
  });
  const [showAdmissaoDialog, setShowAdmissaoDialog] = useState(false);

  const [transferenciaForm, setTransferenciaForm] = useState({
    nome: "",
    dataTransferencia: "",
    obraOrigem: "",
    obraDestino: "",
    numeroSei: "",
    descricaoDocumento: "",
  });
  const [showTransferenciaDialog, setShowTransferenciaDialog] = useState(false);

  //const fileInputRef = useRef<HTMLInputElement>(null);
  const usedIdsRef = useRef(new Set<string>());

  // Effects
  useEffect(() => {
    restoreState();
    // Mostrar mensagem informativa ao carregar
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTimeout(() => {
        // Verificar quantos saldos de empenho existem após carregar
        const saldosCount = checklistItems.filter((item) =>
          item.item.match(/^SE\d*$/i)
        ).length;
        if (saldosCount > 1) {
          toast.info(
            `Dados carregados - ${saldosCount} saldos de empenho encontrados e corrigidos automaticamente para apenas 1`
          );
        } else {
          toast.info("Dados carregados - Status dos itens preservados");
        }
      }, 1500);
    }
  }, []);

  // Inicializar todos os itens padrão automaticamente e remover duplicatas
  useEffect(() => {
    // First, remove any existing duplicates and clean saldo de empenho items
    setChecklistItems((prev) => {
      let cleanItems = removeDuplicateItems(prev);
      cleanItems = cleanSaldoEmpenhoItems(cleanItems);

      // Then check for missing standard items
      const standardItems = cleanItems.filter((item) => !item.funcionarioId);
      const existingItems = new Set(
        standardItems.map((item) => createItemKey(item.item, item.descricao))
      );

      const missingItems = ITENS_PADRAO.filter(
        ([code, desc]) => !existingItems.has(createItemKey(code, desc))
      );

      if (missingItems.length > 0) {
        const newItems: ChecklistItem[] = missingItems.map(
          ([code, desc], index) => ({
            id: generateUniqueId(),
            item: code,
            descricao: desc,
            status: "NONE" as const,
            obs: "",
            qtd: "",
            extras: {},
            sortOrder: Date.now() + index,
            lembrete: "",
            expanded: false,
          })
        );

        return [...cleanItems, ...newItems];
      }

      return cleanItems;
    });
  }, []);

  useEffect(() => {
    updateLocalData();
  }, [companyData.cidade, companyData.dataConferencia]);

  useEffect(() => {
    setChecklistItems((prev) => {
      const sorted = sortItems(prev);
      const orderChanged = sorted.some(
        (item, index) => item.id !== prev[index]?.id
      );
      return orderChanged ? sorted : prev;
    });
  }, [checklistItems.length]);

  useEffect(() => {
    saveState();
  }, [
    companyData,
    checklistItems,
    funcionariosDemissao,
    funcionariosAdmissao,
    funcionariosTransferencia,
  ]);

  const updateLocalData = () => {
    const cidade = companyData.cidade.trim() || "Palmas-TO";
    const dataConferencia = companyData.dataConferencia || getCurrentDate();
    const dateText =
      formatDateForDisplay(dataConferencia) || getCurrentDateExtended();
    const newLocalData = `${cidade}, ${dateText}`;

    if (newLocalData !== companyData.localData) {
      setCompanyData((prev) => ({
        ...prev,
        localData: newLocalData,
      }));
    }
  };

  const saveState = () => {
    const data = {
      meta: companyData,
      itens: checklistItems,
      funcionarios: funcionariosDemissao,
      funcionariosAdmissao: funcionariosAdmissao,
      funcionariosTransferencia: funcionariosTransferencia,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const restoreState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.meta) {
          setCompanyData((prev) => ({
            ...prev,
            ...data.meta,
            cidade: data.meta.cidade || "Palmas-TO",
            dataConferencia: data.meta.dataConferencia || getCurrentDate(),
            cargo: data.meta.cargo || "",
            observacaoAmostragem: data.meta.observacaoAmostragem || "",
            observacaoGeral: data.meta.observacaoGeral || "",
          }));
        }
        if (data.itens) {
          const itemsWithUniqueIds = data.itens.map(
            (item: ChecklistItem, index: number) => {
              const id =
                item.id && !usedIdsRef.current.has(item.id)
                  ? item.id
                  : generateUniqueId();
              usedIdsRef.current.add(id);
              return {
                ...item,
                id,
                // Preservar o status salvo no localStorage
                status: item.status || ("NONE" as const),
                sortOrder: item.sortOrder || index,
                lembrete: item.lembrete || "",
                expanded: item.expanded || false,
              };
            }
          );

          // Remove duplicates and clean saldo de empenho items after restoring state
          let cleanItems = removeDuplicateItems(itemsWithUniqueIds);
          cleanItems = cleanSaldoEmpenhoItems(cleanItems);
          setChecklistItems(cleanItems);
        }
        if (data.funcionarios) {
          setFuncionariosDemissao(data.funcionarios);
        }
        if (data.funcionariosAdmissao) {
          setFuncionariosAdmissao(data.funcionariosAdmissao);
        }
        if (data.funcionariosTransferencia) {
          setFuncionariosTransferencia(data.funcionariosTransferencia);
        }
      }
    } catch (error) {
      console.warn("Erro ao restaurar estado:", error);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExtraFieldChange = (
    itemId: string,
    fieldId: string,
    value: string,
    config?: { currency?: boolean; mmAAAA?: boolean }
  ) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              extras: { ...item.extras, [fieldId]: value },
            }
          : item
      )
    );
  };

  const handleExtraFieldBlur = (
    itemId: string,
    fieldId: string,
    value: string,
    config?: { currency?: boolean; mmAAAA?: boolean }
  ) => {
    let processedValue = value;

    if (config?.currency && value.trim()) {
      processedValue = formatCurrency(value);
    } else if (config?.mmAAAA && value.trim()) {
      processedValue = normalizeMMAAAA(value);
      if (processedValue && !validateMMAAAA(processedValue)) {
        toast.error("Formato inválido. Use MM/AAAA (ex.: 05/2025)");
        return;
      }
    }

    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              extras: {
                ...item.extras,
                [fieldId]: processedValue,
              },
            }
          : item
      )
    );
  };

  const toggleItemExpansion = (itemId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const adicionarItem = (
    item: string = "",
    descricao: string = "",
    status:
      | "NONE"
      | "OK"
      | "PARCIAL"
      | "FALTA"
      | "PENDENCIA_PROXIMA_MP" = "NONE",
    obs: string = "",
    qtd: string = "",
    extras: Record<string, string> = {},
    funcionarioId?: string
  ) => {
    const newItem: ChecklistItem = {
      id: generateUniqueId(),
      item,
      descricao,
      status,
      obs,
      qtd,
      extras,
      sortOrder: Date.now(),
      funcionarioId,
      lembrete: "",
      expanded: false,
    };
    setChecklistItems((prev) => [...prev, newItem]);
  };

  const adicionarFuncionarioDemitido = () => {
    if (!demissaoForm.nome.trim()) {
      toast.error("Nome do funcionário é obrigatório");
      return;
    }
    if (!demissaoForm.dataAdmissao) {
      toast.error("Data de admissão é obrigatória");
      return;
    }
    if (!demissaoForm.dataDemissao) {
      toast.error("Data de demissão é obrigatória");
      return;
    }

    const funcionarioId = generateUniqueId();

    const novoFuncionario: FuncionarioDemissao = {
      id: funcionarioId,
      nome: demissaoForm.nome,
      dataAdmissao: demissaoForm.dataAdmissao,
      dataDemissao: demissaoForm.dataDemissao,
      expanded: false,
    };

    setFuncionariosDemissao((prev) => [...prev, novoFuncionario]);

    const newItems: ChecklistItem[] = [];

    ITENS_DEMISSAO.forEach(([code, desc], index) => {
      newItems.push({
        id: generateUniqueId(),
        item: code,
        descricao: desc,
        status: "NONE" as const,
        obs: "",
        qtd: "",
        extras: {
          nome_funcionario: demissaoForm.nome,
          data_admissao: demissaoForm.dataAdmissao,
          data_demissao: demissaoForm.dataDemissao,
          numero_sei: demissaoForm.numeroSei || "",
          descricao_documento: demissaoForm.descricaoDocumento || "",
        },
        sortOrder: Date.now() + index,
        funcionarioId: funcionarioId,
        lembrete: "",
        expanded: false,
      });
    });

    setChecklistItems((prev) => [...prev, ...newItems]);

    setDemissaoForm({
      nome: "",
      dataAdmissao: "",
      dataDemissao: "",
      numeroSei: "",
      descricaoDocumento: "",
    });
    setShowDemissaoDialog(false);

    toast.success(`Itens de demissão adicionados para ${demissaoForm.nome}`);
  };

  const adicionarFuncionarioAdmitido = () => {
    if (!admissaoForm.nome.trim()) {
      toast.error("Nome do funcionário é obrigatório");
      return;
    }
    if (!admissaoForm.dataAdmissao) {
      toast.error("Data de admissão é obrigatória");
      return;
    }

    const funcionarioId = generateUniqueId();

    const novoFuncionario: FuncionarioAdmissao = {
      id: funcionarioId,
      nome: admissaoForm.nome,
      dataAdmissao: admissaoForm.dataAdmissao,
      expanded: false,
    };

    setFuncionariosAdmissao((prev) => [...prev, novoFuncionario]);

    const newItems: ChecklistItem[] = [];

    ITENS_ADMISSAO.forEach(([code, desc], index) => {
      newItems.push({
        id: generateUniqueId(),
        item: code,
        descricao: desc,
        status: "NONE" as const,
        obs: "",
        qtd: "",
        extras: {
          nome_funcionario: admissaoForm.nome,
          data_admissao: admissaoForm.dataAdmissao,
          numero_sei: admissaoForm.numeroSei || "",
          descricao_documento: admissaoForm.descricaoDocumento || "",
        },
        sortOrder: Date.now() + index,
        funcionarioId: funcionarioId,
        lembrete: "",
        expanded: false,
      });
    });

    setChecklistItems((prev) => [...prev, ...newItems]);

    setAdmissaoForm({
      nome: "",
      dataAdmissao: "",
      numeroSei: "",
      descricaoDocumento: "",
    });
    setShowAdmissaoDialog(false);

    toast.success(`Itens de admissão adicionados para ${admissaoForm.nome}`);
  };

  const adicionarFuncionarioTransferido = () => {
    if (!transferenciaForm.nome.trim()) {
      toast.error("Nome do funcionário é obrigatório");
      return;
    }
    if (!transferenciaForm.dataTransferencia) {
      toast.error("Data de transferência é obrigatória");
      return;
    }
    if (!transferenciaForm.obraOrigem.trim()) {
      toast.error("Obra de origem é obrigatória");
      return;
    }
    if (!transferenciaForm.obraDestino.trim()) {
      toast.error("Obra de destino é obrigatória");
      return;
    }

    const funcionarioId = generateUniqueId();

    const novoFuncionario: FuncionarioTransferencia = {
      id: funcionarioId,
      nome: transferenciaForm.nome,
      dataTransferencia: transferenciaForm.dataTransferencia,
      obraOrigem: transferenciaForm.obraOrigem,
      obraDestino: transferenciaForm.obraDestino,
      expanded: false,
    };

    setFuncionariosTransferencia((prev) => [...prev, novoFuncionario]);

    const newItems: ChecklistItem[] = [];

    ITENS_TRANSFERENCIA.forEach(([code, desc], index) => {
      newItems.push({
        id: generateUniqueId(),
        item: code,
        descricao: desc,
        status: "NONE" as const,
        obs: "",
        qtd: "",
        extras: {
          nome_funcionario: transferenciaForm.nome,
          data_transferencia: transferenciaForm.dataTransferencia,
          obra_origem: transferenciaForm.obraOrigem,
          obra_destino: transferenciaForm.obraDestino,
          numero_sei: transferenciaForm.numeroSei || "",
          descricao_documento: transferenciaForm.descricaoDocumento || "",
        },
        sortOrder: Date.now() + index,
        funcionarioId: funcionarioId,
        lembrete: "",
        expanded: false,
      });
    });

    setChecklistItems((prev) => [...prev, ...newItems]);

    setTransferenciaForm({
      nome: "",
      dataTransferencia: "",
      obraOrigem: "",
      obraDestino: "",
      numeroSei: "",
      descricaoDocumento: "",
    });
    setShowTransferenciaDialog(false);

    toast.success(
      `Itens de transferência adicionados para ${transferenciaForm.nome}`
    );
  };

  const updateChecklistItem = (
    id: string,
    field: keyof ChecklistItem,
    value: any
  ) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
    usedIdsRef.current.delete(id);
  };

  const removeFuncionarioDemitido = (funcionarioId: string) => {
    setFuncionariosDemissao((prev) =>
      prev.filter((f) => f.id !== funcionarioId)
    );
    setChecklistItems((prev) =>
      prev.filter((item) => item.funcionarioId !== funcionarioId)
    );
    toast.success("Funcionário demitido removido");
  };

  const removeFuncionarioAdmitido = (funcionarioId: string) => {
    setFuncionariosAdmissao((prev) =>
      prev.filter((f) => f.id !== funcionarioId)
    );
    setChecklistItems((prev) =>
      prev.filter((item) => item.funcionarioId !== funcionarioId)
    );
    toast.success("Funcionário admitido removido");
  };

  const removeFuncionarioTransferido = (funcionarioId: string) => {
    setFuncionariosTransferencia((prev) =>
      prev.filter((f) => f.id !== funcionarioId)
    );
    setChecklistItems((prev) =>
      prev.filter((item) => item.funcionarioId !== funcionarioId)
    );
    toast.success("Funcionário transferido removido");
  };

  const toggleFuncionarioExpansion = (
    tipo: "demissao" | "admissao" | "transferencia",
    funcionarioId: string
  ) => {
    if (tipo === "demissao") {
      setFuncionariosDemissao((prev) =>
        prev.map((f) =>
          f.id === funcionarioId ? { ...f, expanded: !f.expanded } : f
        )
      );
    } else if (tipo === "admissao") {
      setFuncionariosAdmissao((prev) =>
        prev.map((f) =>
          f.id === funcionarioId ? { ...f, expanded: !f.expanded } : f
        )
      );
    } else if (tipo === "transferencia") {
      setFuncionariosTransferencia((prev) =>
        prev.map((f) =>
          f.id === funcionarioId ? { ...f, expanded: !f.expanded } : f
        )
      );
    }
  };

  const limparChecklist = () => {
    // Separar itens padrão dos itens de funcionários
    const itensPadrao = checklistItems.filter((item) => !item.funcionarioId);
    const itensFuncionarios = checklistItems.filter(
      (item) => item.funcionarioId
    );

    // Remover IDs dos itens de funcionários do tracking
    itensFuncionarios.forEach((item) => usedIdsRef.current.delete(item.id));

    // Resetar apenas os itens padrão, mantendo-os mas limpando os dados
    const itensLimpos = itensPadrao.map((item) => ({
      ...item,
      status: "NONE" as const,
      obs: "",
      qtd: "",
      extras: {},
      lembrete: "",
      expanded: false,
    }));

    // Manter apenas os itens padrão limpos
    setChecklistItems(itensLimpos);

    // Remover todos os funcionários
    setFuncionariosDemissao([]);
    setFuncionariosAdmissao([]);
    setFuncionariosTransferencia([]);

    // Limpar observações
    setCompanyData((prev) => ({
      ...prev,
      observacaoAmostragem: "",
      observacaoGeral: "",
    }));

    toast.success(
      "Checklist limpo - Todos os itens padrão foram resetados e funcionários removidos"
    );
  };

  const removerDuplicatas = () => {
    const originalCount = checklistItems.length;
    let cleanItems = removeDuplicateItems(checklistItems);
    cleanItems = cleanSaldoEmpenhoItems(cleanItems);
    const duplicatesRemoved = originalCount - cleanItems.length;

    if (duplicatesRemoved > 0) {
      setChecklistItems(cleanItems);
      toast.success(
        `${duplicatesRemoved} item(ns) duplicado(s) removido(s) e saldos de empenho corrigidos`
      );
    } else {
      // Ainda aplicar a limpeza mesmo se não houver duplicatas óbvias
      setChecklistItems(cleanItems);
      toast.success("Itens verificados e saldos de empenho corrigidos");
    }
  };

  const corrigirSaldosEmpenho = () => {
    const originalCount = checklistItems.length;
    const cleanItems = cleanSaldoEmpenhoItems(checklistItems);
    const itemsRemoved = originalCount - cleanItems.length;

    setChecklistItems(cleanItems);

    if (itemsRemoved > 0) {
      toast.success(
        `✅ ${itemsRemoved} saldo(s) de empenho duplicado(s) removido(s). Agora há apenas um saldo de empenho.`
      );
    } else {
      toast.success(
        "✅ Verificação concluída - apenas um saldo de empenho está presente"
      );
    }
  };

  const limparDadosEmpresa = () => {
    setCompanyData({
      conferencia: "",
      empresa: "",
      periodo: "",
      localData: "",
      numeroProcesso: "",
      numeroMedicao: "",
      protocoloSEI: "",
      numeroContrato: "",
      mesReferencia: "",
      cidade: "Palmas-TO",
      Usuario: "",
      cargo: "",
      dataConferencia: getCurrentDate(),
      observacaoAmostragem: companyData.observacaoAmostragem,
      observacaoGeral: companyData.observacaoGeral,
    });
    toast.success("Dados da empresa limpos");
  };

  const generateFileName = (): string => {
    const conferencia = companyData.conferencia?.trim() || "SemConferencia";
    const medicao = companyData.numeroMedicao?.trim() || "SemMedicao";
    const contrato = companyData.numeroContrato?.trim() || "SemContrato";
    const empresa = companyData.empresa?.trim() || "SemEmpresa";

    // Remove caracteres especiais e espaços
    const clean = (str: string) =>
      str.replace(/[^\w\-]/g, "_").replace(/_{2,}/g, "_");

    return `${clean(conferencia)}_${clean(medicao)}_${clean(contrato)}_${clean(
      empresa
    )}.json`;
  };

  const exportarJSON = () => {
    const data = {
      meta: companyData,
      itens: checklistItems,
      funcionarios: funcionariosDemissao,
      funcionariosAdmissao: funcionariosAdmissao,
      funcionariosTransferencia: funcionariosTransferencia,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generateFileName();
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON completo exportado com sucesso");
  };

  const exportarJSONPendenciasProximaMP = () => {
    // Filtrar apenas itens com status PENDENCIA_PROXIMA_MP
    const itensPendenciasProximaMP = checklistItems.filter(
      (item) => item.status === "PENDENCIA_PROXIMA_MP"
    );

    if (itensPendenciasProximaMP.length === 0) {
      toast.warning(
        'Nenhum item com status "Pendência para Próxima MP" encontrado'
      );
      return;
    }

    // Filtrar funcionários que tenham pelo menos um item com PENDENCIA_PROXIMA_MP
    const funcionariosDemissaoComPendencias = funcionariosDemissao.filter(
      (funcionario) =>
        checklistItems.some(
          (item) =>
            item.funcionarioId === funcionario.id &&
            item.status === "PENDENCIA_PROXIMA_MP"
        )
    );

    const funcionariosAdmissaoComPendencias = funcionariosAdmissao.filter(
      (funcionario) =>
        checklistItems.some(
          (item) =>
            item.funcionarioId === funcionario.id &&
            item.status === "PENDENCIA_PROXIMA_MP"
        )
    );

    const funcionariosTransferenciaComPendencias =
      funcionariosTransferencia.filter((funcionario) =>
        checklistItems.some(
          (item) =>
            item.funcionarioId === funcionario.id &&
            item.status === "PENDENCIA_PROXIMA_MP"
        )
      );

    const data = {
      meta: {
        ...companyData,
        // Adicionar identificação de que é exportação de pendências
        tipoExportacao: "PENDENCIAS_PROXIMA_MP",
        dataExportacao: new Date().toISOString(),
        totalItensPendentes: itensPendenciasProximaMP.length,
      },
      itens: itensPendenciasProximaMP,
      funcionarios: funcionariosDemissaoComPendencias,
      funcionariosAdmissao: funcionariosAdmissaoComPendencias,
      funcionariosTransferencia: funcionariosTransferenciaComPendencias,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Gerar nome específico para exportação de pendências
    const generatePendenciasFileName = (): string => {
      const conferencia = companyData.conferencia?.trim() || "SemConferencia";
      const medicao = companyData.numeroMedicao?.trim() || "SemMedicao";
      const contrato = companyData.numeroContrato?.trim() || "SemContrato";
      const empresa = companyData.empresa?.trim() || "SemEmpresa";

      // Remove caracteres especiais e espaços
      const clean = (str: string) =>
        str.replace(/[^\w\-]/g, "_").replace(/_{2,}/g, "_");

      return `PENDENCIAS_PROXIMA_MP_${clean(conferencia)}_${clean(
        medicao
      )}_${clean(contrato)}_${clean(empresa)}.json`;
    };

    a.download = generatePendenciasFileName();
    a.click();
    URL.revokeObjectURL(url);

    toast.success(
      `JSON de Pendências exportado com sucesso! (${itensPendenciasProximaMP.length} itens)`
    );
  };

  const importarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Verificar se é importação de pendências ou completa
        const isExportacaoPendencias =
          data.meta?.tipoExportacao === "PENDENCIAS_PROXIMA_MP";

        if (data.meta) {
          // Para exportações de pendências, não sobrescrever todos os dados da empresa
          if (isExportacaoPendencias) {
            // Preservar apenas alguns campos essenciais e não sobrescrever tudo
            setCompanyData((prev) => ({
              ...prev,
              // Manter dados básicos se estão vazios
              empresa: prev.empresa || data.meta.empresa || "",
              numeroProcesso:
                prev.numeroProcesso || data.meta.numeroProcesso || "",
              numeroContrato:
                prev.numeroContrato || data.meta.numeroContrato || "",
              numeroMedicao:
                prev.numeroMedicao || data.meta.numeroMedicao || "",
              // Sempre preservar observações
              observacaoAmostragem:
                prev.observacaoAmostragem ||
                data.meta.observacaoAmostragem ||
                "",
              observacaoGeral:
                prev.observacaoGeral || data.meta.observacaoGeral || "",
            }));
          } else {
            // Importação completa - sobrescrever todos os dados
            setCompanyData((prev) => ({
              ...prev,
              ...data.meta,
              cidade: data.meta.cidade || "Palmas-TO",
              dataConferencia: data.meta.dataConferencia || getCurrentDate(),
              cargo: data.meta.cargo || "",
              observacaoAmostragem: data.meta.observacaoAmostragem || "",
              observacaoGeral: data.meta.observacaoGeral || "",
            }));
          }
        }

        if (data.itens) {
          const itemsWithUniqueIds = data.itens.map(
            (item: ChecklistItem, index: number) => {
              const id = generateUniqueId();
              return {
                ...item,
                id,
                // Preservar o status original do JSON importado
                status: item.status || ("NONE" as const),
                sortOrder: item.sortOrder || Date.now() + index,
                lembrete: item.lembrete || "",
                expanded: item.expanded || false,
              };
            }
          );

          if (isExportacaoPendencias) {
            // Para pendências, adicionar aos itens existentes ao invés de substituir
            setChecklistItems((prev) => {
              // Remover itens duplicados baseado em item + descrição
              const existingKeys = new Set(
                prev.map((item) => createItemKey(item.item, item.descricao))
              );
              const newItems = itemsWithUniqueIds.filter(
                (item) =>
                  !existingKeys.has(createItemKey(item.item, item.descricao))
              );

              let allItems = [...prev, ...newItems];
              allItems = removeDuplicateItems(allItems);
              allItems = cleanSaldoEmpenhoItems(allItems);
              return allItems;
            });
          } else {
            // Importação completa - substituir todos os itens
            checklistItems.forEach((item) =>
              usedIdsRef.current.delete(item.id)
            );

            let cleanItems = removeDuplicateItems(itemsWithUniqueIds);
            cleanItems = cleanSaldoEmpenhoItems(cleanItems);
            setChecklistItems(cleanItems);
          }
        }

        // Para funcionários, sempre mesclar ou substituir conforme o tipo
        if (data.funcionarios) {
          if (isExportacaoPendencias) {
            // Mesclar funcionários de demissão
            setFuncionariosDemissao((prev) => {
              const existingIds = new Set(
                prev.map((f) => f.nome + f.dataAdmissao + f.dataDemissao)
              );
              const newFuncionarios = data.funcionarios.filter(
                (f: FuncionarioDemissao) =>
                  !existingIds.has(f.nome + f.dataAdmissao + f.dataDemissao)
              );
              return [...prev, ...newFuncionarios];
            });
          } else {
            setFuncionariosDemissao(data.funcionarios);
          }
        }

        if (data.funcionariosAdmissao) {
          if (isExportacaoPendencias) {
            // Mesclar funcionários de admissão
            setFuncionariosAdmissao((prev) => {
              const existingIds = new Set(
                prev.map((f) => f.nome + f.dataAdmissao)
              );
              const newFuncionarios = data.funcionariosAdmissao.filter(
                (f: FuncionarioAdmissao) =>
                  !existingIds.has(f.nome + f.dataAdmissao)
              );
              return [...prev, ...newFuncionarios];
            });
          } else {
            setFuncionariosAdmissao(data.funcionariosAdmissao);
          }
        }

        if (data.funcionariosTransferencia) {
          if (isExportacaoPendencias) {
            // Mesclar funcionários de transferência
            setFuncionariosTransferencia((prev) => {
              const existingIds = new Set(
                prev.map(
                  (f) =>
                    f.nome + f.dataTransferencia + f.obraOrigem + f.obraDestino
                )
              );
              const newFuncionarios = data.funcionariosTransferencia.filter(
                (f: FuncionarioTransferencia) =>
                  !existingIds.has(
                    f.nome + f.dataTransferencia + f.obraOrigem + f.obraDestino
                  )
              );
              return [...prev, ...newFuncionarios];
            });
          } else {
            setFuncionariosTransferencia(data.funcionariosTransferencia);
          }
        }

        const tipoImportacao = isExportacaoPendencias
          ? "Pendências para Próxima MP"
          : "Completo";
        const quantidadeItens = data.itens?.length || 0;
        toast.success(
          `JSON ${tipoImportacao} importado com sucesso! (${quantidadeItens} itens)`
        );
      } catch (error) {
        toast.error("Arquivo JSON inválido");
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderExtraFields = (item: ChecklistItem) => {
    const config = EXTRAS_CONFIG[item.item.toUpperCase()];

    // Para itens de funcionários, renderizar campos específicos
    if (item.funcionarioId) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Informações Adicionais:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Nº SEI:</Label>
              <Input
                type="text"
                value={item.extras.numero_sei || ""}
                onChange={(e) =>
                  handleExtraFieldChange(item.id, "numero_sei", e.target.value)
                }
                className="text-sm"
                placeholder="Número do SEI"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                Descrição do Documento:
              </Label>
              <Textarea
                value={item.extras.descricao_documento || ""}
                onChange={(e) =>
                  handleExtraFieldChange(
                    item.id,
                    "descricao_documento",
                    e.target.value
                  )
                }
                className="text-sm min-h-[60px]"
                placeholder="Descrição do documento apresentado..."
              />
            </div>
          </div>
        </div>
      );
    }

    // Para itens de Saldo de Empenho, renderizar campos especiais
    if (item.item === "SE1") {
      return (
        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-700 mb-3">
            💰 Informações do Saldo de Empenho:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Nº SEI:</Label>
              <Input
                type="text"
                value={item.extras.numero_sei || ""}
                onChange={(e) =>
                  handleExtraFieldChange(item.id, "numero_sei", e.target.value)
                }
                className={`text-sm ${
                  !item.extras.numero_sei?.trim()
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
                placeholder="Número do SEI"
              />
              {!item.extras.numero_sei?.trim() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Campo obrigatório para relatório
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Valor do Saldo:</Label>
              <Input
                type="text"
                value={item.extras.valor_saldo || ""}
                onChange={(e) =>
                  handleExtraFieldChange(
                    item.id,
                    "valor_saldo",
                    e.target.value,
                    { currency: true }
                  )
                }
                onBlur={(e) =>
                  handleExtraFieldBlur(item.id, "valor_saldo", e.target.value, {
                    currency: true,
                  })
                }
                className="text-sm"
                placeholder="R$ 150.000,00"
              />
              <p className="text-xs text-gray-500">
                💡 Aceita formatos: 1.500,50 (brasileiro), 1500,50
                (simplificado) ou 1500.50 (americano).
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!config) {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded border">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Informações Adicionais:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Nº SEI:</Label>
              <Input
                type="text"
                value={item.extras.numero_sei || ""}
                onChange={(e) =>
                  handleExtraFieldChange(item.id, "numero_sei", e.target.value)
                }
                className={`text-sm ${
                  !item.extras.numero_sei?.trim()
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
                placeholder="Número do SEI"
              />
              {!item.extras.numero_sei?.trim() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Campo obrigatório para relatório
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded border">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Informações Adicionais:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.map((field, fieldIndex) => {
            const value = item.extras[field.id] || "";
            const isRequired = field.id === "numero_sei";
            const hasError = isRequired && !value.trim();

            return (
              <div
                key={`extra-${item.id}-${field.id}-${fieldIndex}`}
                className="space-y-1"
              >
                <Label className="text-sm font-medium">{field.label}</Label>
                <Input
                  type={field.type}
                  value={value}
                  onChange={(e) =>
                    handleExtraFieldChange(
                      item.id,
                      field.id,
                      e.target.value,
                      field
                    )
                  }
                  onBlur={(e) =>
                    handleExtraFieldBlur(
                      item.id,
                      field.id,
                      e.target.value,
                      field
                    )
                  }
                  className={`text-sm ${
                    hasError ? "border-red-500 bg-red-50" : ""
                  }`}
                  placeholder={
                    field.id === "numero_sei"
                      ? "Número do SEI"
                      : field.currency
                      ? "Digite valores como: 1.500,50 ou 1500,50 ou 1500.50"
                      : field.mmAAAA
                      ? "Digite livremente (ex: 052025 ou 05/2025)"
                      : ""
                  }
                />
                {hasError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Campo obrigatório para relatório
                  </p>
                )}
                {field.currency && (
                  <p className="text-xs text-gray-500">
                    💡 Aceita formatos: 1.500,50 (brasileiro), 1500,50
                    (simplificado) ou 1500.50 (americano). A formatação será
                    aplicada automaticamente.
                  </p>
                )}
                {field.mmAAAA && (
                  <p className="text-xs text-gray-500">
                    💡 Digite livremente. Será formatado para MM/AAAA
                    automaticamente.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white py-4 text-center">
        <h1 className="text-xl font-medium">
          Checklist Automático - Medição Parcial
        </h1>
      </div>

      <div className="flex gap-2 px-3 py-3">
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
          Enviar Json
        </button>
      </div>

      <h2 className="text-black font-semibold">Token: {tempToken}</h2>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              Dados da Empresa
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limparDadosEmpresa}
                  className="text-xs"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Limpar Dados
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    showValidationReport(companyData, checklistItems)
                  }
                  className="text-xs"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Verificar Campos
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroProcesso">Número do Processo *</Label>
                <Input
                  id="numeroProcesso"
                  value={companyData.numeroProcesso}
                  onChange={(e) =>
                    handleInputChange("numeroProcesso", e.target.value)
                  }
                  placeholder="XXXXX.XXXXXX/20XX-XX"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "numeroProcesso",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Input
                  id="empresa"
                  value={companyData.empresa}
                  onChange={(e) => handleInputChange("empresa", e.target.value)}
                  placeholder="Empresa"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "empresa",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroMedicao">Nº da Medição *</Label>
                <Input
                  id="numeroMedicao"
                  value={companyData.numeroMedicao}
                  onChange={(e) =>
                    handleInputChange("numeroMedicao", e.target.value)
                  }
                  placeholder="XXª MP"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "numeroMedicao",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroContrato">Número do Contrato *</Label>
                <Input
                  id="numeroContrato"
                  value={companyData.numeroContrato}
                  onChange={(e) =>
                    handleInputChange("numeroContrato", e.target.value)
                  }
                  placeholder="123/2024"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "numeroContrato",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conferencia">Número da Conferência *</Label>
                <Input
                  id="conferencia"
                  value={companyData.conferencia}
                  onChange={(e) =>
                    handleInputChange("conferencia", e.target.value)
                  }
                  placeholder="XXª Conferência"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "conferencia",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodo">Período da Medição *</Label>
                <Input
                  id="periodo"
                  value={companyData.periodo}
                  onChange={(e) => handleInputChange("periodo", e.target.value)}
                  placeholder="01/01/2025 a 31/01/2025"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "periodo",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mesReferencia">
                  Mês/Ano de Referência da MP *
                </Label>
                <Input
                  id="mesReferencia"
                  value={companyData.mesReferencia}
                  onChange={(e) =>
                    handleInputChange("mesReferencia", e.target.value)
                  }
                  placeholder="01/2025"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "mesReferencia",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidadeDataConferencia">
                  Cidade e Data de Conferência *
                </Label>
                <div className="space-y-2">
                  <Input
                    value="Palmas-TO"
                    disabled
                    className="bg-gray-100 text-gray-600"
                  />
                  <Input
                    id="dataConferencia"
                    type="date"
                    value={companyData.dataConferencia}
                    onChange={(e) =>
                      handleInputChange("dataConferencia", e.target.value)
                    }
                    className={`placeholder-gray-400 ${getFieldValidationClass(
                      "dataConferencia",
                      companyData
                    )}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protocoloSEI">Protocolo SEI *</Label>
                <Input
                  id="protocoloSEI"
                  value={companyData.protocoloSEI}
                  onChange={(e) =>
                    handleInputChange("protocoloSEI", e.target.value)
                  }
                  placeholder="21859309"
                  className={`placeholder-gray-400 ${getFieldValidationClass(
                    "protocoloSEI",
                    companyData
                  )}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usuario">Usuário *</Label>
                <Select
                  value={companyData.Usuario}
                  onValueChange={(value) => handleInputChange("Usuario", value)}
                >
                  <SelectTrigger
                    className={getFieldValidationClass("Usuario", companyData)}
                  >
                    <SelectValue placeholder="Selecione o usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {USUARIOS.map((usuario) => (
                      <SelectItem key={usuario} value={usuario}>
                        {usuario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Select
                  value={companyData.cargo}
                  onValueChange={(value) => handleInputChange("cargo", value)}
                >
                  <SelectTrigger
                    className={getFieldValidationClass("cargo", companyData)}
                  >
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGOS.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">
              Observação de Funcionários da Amostragem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={companyData.observacaoAmostragem || ""}
              onChange={(value) =>
                handleInputChange("observacaoAmostragem", value)
              }
              placeholder="Digite aqui observações específicas sobre os funcionários que compõem a amostragem para verificação documental..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Este campo aparecerá no relatório antes da lista de documentos.
              Use para especificar critérios da amostragem, funcionários
              selecionados ou observações relevantes sobre a seleção.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">
              Checklist Documental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklistItems
                .filter((item) => !item.funcionarioId)
                .map((item) => {
                  const showQuantity = ITENS_COM_QTD.has(item.item.trim());
                  const isSaldoEmpenho = item.item === "SE1";
                  const statusColorClass = getItemStatusColor(item.status);
                  const statusIcon = getStatusIcon(item.status);

                  return (
                    <Collapsible
                      key={`checklist-item-${item.id}`}
                      open={item.expanded}
                      onOpenChange={() => toggleItemExpansion(item.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${statusColorClass} ${
                            isSaldoEmpenho
                              ? "border-l-4 border-l-yellow-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">
                                <span className="mr-2">
                                  {isSaldoEmpenho ? "💰" : statusIcon}
                                </span>
                                [{item.item}] {item.descricao}
                                {showQuantity && item.qtd && (
                                  <span className="ml-2 text-sm opacity-75">
                                    (Qtd: {item.qtd})
                                  </span>
                                )}
                                {isSaldoEmpenho && item.extras.valor_saldo && (
                                  <span className="ml-2 text-sm opacity-75">
                                    ({item.extras.valor_saldo})
                                  </span>
                                )}
                              </div>
                              {item.obs && item.status !== "OK" && (
                                <div className="text-sm opacity-75 mt-1">
                                  Obs: {stripHtml(item.obs).substring(0, 50)}
                                  ...
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-2xl">
                            {isSaldoEmpenho ? "💰" : statusIcon}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-2">
                        <div className="border rounded-lg p-4 bg-white">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-2">
                              <Label className="text-sm">Item</Label>
                              <Input
                                value={item.item}
                                onChange={(e) =>
                                  updateChecklistItem(
                                    item.id,
                                    "item",
                                    e.target.value
                                  )
                                }
                                placeholder="Item"
                                className="mt-1"
                              />
                            </div>
                            <div
                              className={
                                showQuantity ? "col-span-4" : "col-span-5"
                              }
                            >
                              <Label className="text-sm">Descrição</Label>
                              <Textarea
                                value={item.descricao}
                                onChange={(e) =>
                                  updateChecklistItem(
                                    item.id,
                                    "descricao",
                                    e.target.value
                                  )
                                }
                                placeholder="Descrição"
                                className="mt-1 min-h-[40px]"
                              />
                            </div>
                            {showQuantity && (
                              <div className="col-span-1">
                                <Label className="text-sm">Qtd</Label>
                                <Input
                                  value={item.qtd}
                                  onChange={(e) =>
                                    updateChecklistItem(
                                      item.id,
                                      "qtd",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Qtd"
                                  className="mt-1"
                                />
                              </div>
                            )}
                            <div className="col-span-5">
                              <Label className="text-sm">Status</Label>
                              <div className="space-y-2 mt-1">
                                <Select
                                  value={item.status}
                                  onValueChange={(
                                    value:
                                      | "NONE"
                                      | "OK"
                                      | "PARCIAL"
                                      | "FALTA"
                                      | "PENDENCIA_PROXIMA_MP"
                                  ) =>
                                    updateChecklistItem(
                                      item.id,
                                      "status",
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="NONE">
                                      ❓ Não verificado
                                    </SelectItem>
                                    <SelectItem value="OK">
                                      ✅ Apresentado
                                    </SelectItem>
                                    <SelectItem value="PARCIAL">
                                      ⚠️ Parcial
                                    </SelectItem>
                                    <SelectItem value="FALTA">
                                      ❌ Pendente
                                    </SelectItem>
                                    <SelectItem value="PENDENCIA_PROXIMA_MP">
                                      🔄 Pendência para Próxima MP
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {(item.status === "FALTA" ||
                                  item.status === "PARCIAL" ||
                                  item.status === "PENDENCIA_PROXIMA_MP") && (
                                  <div className="space-y-1">
                                    <Label className="text-sm">
                                      Observação:
                                    </Label>
                                    <RichTextEditor
                                      value={item.obs}
                                      onChange={(value) =>
                                        updateChecklistItem(
                                          item.id,
                                          "obs",
                                          value
                                        )
                                      }
                                      placeholder="Observação geral do item..."
                                      className={
                                        !item.obs.trim()
                                          ? "border-red-500 bg-red-50"
                                          : ""
                                      }
                                    />
                                  </div>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeChecklistItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <Label className="text-sm font-medium text-blue-700">
                              Lembrete:
                            </Label>
                            <RichTextEditor
                              value={item.lembrete || ""}
                              onChange={(value) =>
                                updateChecklistItem(item.id, "lembrete", value)
                              }
                              placeholder="Digite aqui lembretes ou anotações internas para este item..."
                              className="mt-1 bg-white"
                            />
                          </div>

                          {renderExtraFields(item)}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                onClick={() => setShowAdmissaoDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Admissão
              </Button>

              <Button
                onClick={() => setShowDemissaoDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Demissão
              </Button>

              <Button
                onClick={() => setShowTransferenciaDialog(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Transferência
              </Button>

              <Button
                onClick={limparChecklist}
                variant="outline"
                className="border-purple-400 text-purple-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar Dados
              </Button>
            </div>

            {/* Seções de Funcionários mantidas como estavam antes */}
            {funcionariosDemissao.length > 0 && (
              <Card className="mt-6 border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Funcionários Demitidos ({funcionariosDemissao.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {funcionariosDemissao.map((funcionario) => {
                    const funcionarioItems = checklistItems.filter(
                      (item) => item.funcionarioId === funcionario.id
                    );

                    return (
                      <Collapsible
                        key={`demissao-${funcionario.id}`}
                        open={funcionario.expanded}
                        onOpenChange={() =>
                          toggleFuncionarioExpansion("demissao", funcionario.id)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100">
                            <div className="flex items-center gap-3">
                              {funcionario.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <User className="h-4 w-4 text-red-600" />
                              <div>
                                <span className="font-medium text-red-800">
                                  {funcionario.nome}
                                </span>
                                <div className="text-sm text-red-600">
                                  Admissão:{" "}
                                  {formatDateForDisplay(
                                    funcionario.dataAdmissao
                                  )}{" "}
                                  | Demissão:{" "}
                                  {formatDateForDisplay(
                                    funcionario.dataDemissao
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFuncionarioDemitido(funcionario.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-2">
                          {funcionarioItems.map((item) => (
                            <div
                              key={`funcionario-item-${item.id}`}
                              className="border rounded-lg p-4 bg-white ml-6"
                            >
                              <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-2">
                                  <Label className="text-sm">Item</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.item}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Descrição</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.descricao}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Status</Label>
                                  <div className="space-y-2 mt-1">
                                    <Select
                                      value={item.status}
                                      onValueChange={(
                                        value:
                                          | "NONE"
                                          | "OK"
                                          | "PARCIAL"
                                          | "FALTA"
                                          | "PENDENCIA_PROXIMA_MP"
                                      ) =>
                                        updateChecklistItem(
                                          item.id,
                                          "status",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="NONE">
                                          ❓ Não verificado
                                        </SelectItem>
                                        <SelectItem value="OK">
                                          ✅ Apresentado
                                        </SelectItem>
                                        <SelectItem value="PARCIAL">
                                          ⚠️ Parcial
                                        </SelectItem>
                                        <SelectItem value="FALTA">
                                          ❌ Pendente
                                        </SelectItem>
                                        <SelectItem value="PENDENCIA_PROXIMA_MP">
                                          🔄 Pendência para Próxima MP
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {(item.status === "FALTA" ||
                                      item.status === "PARCIAL" ||
                                      item.status ===
                                        "PENDENCIA_PROXIMA_MP") && (
                                      <div className="space-y-1">
                                        <Label className="text-sm">
                                          Observação:
                                        </Label>
                                        <RichTextEditor
                                          value={item.obs}
                                          onChange={(value) =>
                                            updateChecklistItem(
                                              item.id,
                                              "obs",
                                              value
                                            )
                                          }
                                          placeholder="Observação..."
                                          className="min-h-[60px]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {renderExtraFields(item)}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {funcionariosAdmissao.length > 0 && (
              <Card className="mt-6 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Funcionários Admitidos ({funcionariosAdmissao.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {funcionariosAdmissao.map((funcionario) => {
                    const funcionarioItems = checklistItems.filter(
                      (item) => item.funcionarioId === funcionario.id
                    );

                    return (
                      <Collapsible
                        key={`admissao-${funcionario.id}`}
                        open={funcionario.expanded}
                        onOpenChange={() =>
                          toggleFuncionarioExpansion("admissao", funcionario.id)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100">
                            <div className="flex items-center gap-3">
                              {funcionario.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <User className="h-4 w-4 text-green-600" />
                              <div>
                                <span className="font-medium text-green-800">
                                  {funcionario.nome}
                                </span>
                                <div className="text-sm text-green-600">
                                  Admissão:{" "}
                                  {formatDateForDisplay(
                                    funcionario.dataAdmissao
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFuncionarioAdmitido(funcionario.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-2">
                          {funcionarioItems.map((item) => (
                            <div
                              key={`funcionario-item-${item.id}`}
                              className="border rounded-lg p-4 bg-white ml-6"
                            >
                              <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-2">
                                  <Label className="text-sm">Item</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.item}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Descrição</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.descricao}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Status</Label>
                                  <div className="space-y-2 mt-1">
                                    <Select
                                      value={item.status}
                                      onValueChange={(
                                        value:
                                          | "NONE"
                                          | "OK"
                                          | "PARCIAL"
                                          | "FALTA"
                                          | "PENDENCIA_PROXIMA_MP"
                                      ) =>
                                        updateChecklistItem(
                                          item.id,
                                          "status",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="NONE">
                                          ❓ Não verificado
                                        </SelectItem>
                                        <SelectItem value="OK">
                                          ✅ Apresentado
                                        </SelectItem>
                                        <SelectItem value="PARCIAL">
                                          ⚠️ Parcial
                                        </SelectItem>
                                        <SelectItem value="FALTA">
                                          ❌ Pendente
                                        </SelectItem>
                                        <SelectItem value="PENDENCIA_PROXIMA_MP">
                                          🔄 Pendência para Próxima MP
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {(item.status === "FALTA" ||
                                      item.status === "PARCIAL" ||
                                      item.status ===
                                        "PENDENCIA_PROXIMA_MP") && (
                                      <div className="space-y-1">
                                        <Label className="text-sm">
                                          Observação:
                                        </Label>
                                        <RichTextEditor
                                          value={item.obs}
                                          onChange={(value) =>
                                            updateChecklistItem(
                                              item.id,
                                              "obs",
                                              value
                                            )
                                          }
                                          placeholder="Observação..."
                                          className="min-h-[60px]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {renderExtraFields(item)}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {funcionariosTransferencia.length > 0 && (
              <Card className="mt-6 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Funcionários Transferidos (
                    {funcionariosTransferencia.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {funcionariosTransferencia.map((funcionario) => {
                    const funcionarioItems = checklistItems.filter(
                      (item) => item.funcionarioId === funcionario.id
                    );

                    return (
                      <Collapsible
                        key={`transferencia-${funcionario.id}`}
                        open={funcionario.expanded}
                        onOpenChange={() =>
                          toggleFuncionarioExpansion(
                            "transferencia",
                            funcionario.id
                          )
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100">
                            <div className="flex items-center gap-3">
                              {funcionario.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <User className="h-4 w-4 text-orange-600" />
                              <div>
                                <span className="font-medium text-orange-800">
                                  {funcionario.nome}
                                </span>
                                <div className="text-sm text-orange-600">
                                  Data:{" "}
                                  {formatDateForDisplay(
                                    funcionario.dataTransferencia
                                  )}{" "}
                                  | De: {funcionario.obraOrigem} → Para:{" "}
                                  {funcionario.obraDestino}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFuncionarioTransferido(funcionario.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-2">
                          {funcionarioItems.map((item) => (
                            <div
                              key={`funcionario-item-${item.id}`}
                              className="border rounded-lg p-4 bg-white ml-6"
                            >
                              <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-2">
                                  <Label className="text-sm">Item</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.item}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Descrição</Label>
                                  <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                                    {item.descricao}
                                  </div>
                                </div>
                                <div className="col-span-5">
                                  <Label className="text-sm">Status</Label>
                                  <div className="space-y-2 mt-1">
                                    <Select
                                      value={item.status}
                                      onValueChange={(
                                        value:
                                          | "NONE"
                                          | "OK"
                                          | "PARCIAL"
                                          | "FALTA"
                                          | "PENDENCIA_PROXIMA_MP"
                                      ) =>
                                        updateChecklistItem(
                                          item.id,
                                          "status",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="NONE">
                                          ❓ Não verificado
                                        </SelectItem>
                                        <SelectItem value="OK">
                                          ✅ Apresentado
                                        </SelectItem>
                                        <SelectItem value="PARCIAL">
                                          ⚠️ Parcial
                                        </SelectItem>
                                        <SelectItem value="FALTA">
                                          ❌ Pendente
                                        </SelectItem>
                                        <SelectItem value="PENDENCIA_PROXIMA_MP">
                                          🔄 Pendência para Próxima MP
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    {(item.status === "FALTA" ||
                                      item.status === "PARCIAL" ||
                                      item.status ===
                                        "PENDENCIA_PROXIMA_MP") && (
                                      <div className="space-y-1">
                                        <Label className="text-sm">
                                          Observação:
                                        </Label>
                                        <RichTextEditor
                                          value={item.obs}
                                          onChange={(value) =>
                                            updateChecklistItem(
                                              item.id,
                                              "obs",
                                              value
                                            )
                                          }
                                          placeholder="Observação..."
                                          className="min-h-[60px]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {renderExtraFields(item)}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() =>
                  gerarRelatorio(
                    "completo",
                    checklistItems,
                    companyData,
                    funcionariosDemissao,
                    funcionariosAdmissao,
                    funcionariosTransferencia
                  )
                }
                className="bg-blue-700 hover:bg-blue-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF Completo
              </Button>
              <Button
                onClick={() =>
                  gerarRelatorio(
                    "pendencias",
                    checklistItems,
                    companyData,
                    funcionariosDemissao,
                    funcionariosAdmissao,
                    funcionariosTransferencia
                  )
                }
                className="bg-blue-700 hover:bg-blue-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerar PDF Pendências
              </Button>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={importarJSON}
              />
              <Button
                onClick={exportarJSON}
                className="bg-blue-700 hover:bg-blue-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON Completo
              </Button>
              <Button
                onClick={exportarJSONPendenciasProximaMP}
                className="bg-purple-600 hover:bg-purple-700"
                title="Exporta apenas itens com status 'Pendência para Próxima MP'"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON Pendências MP
              </Button>
            </div>

            {/* Observação Geral */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Observações (para ciência do Fiscal Administrativo):
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={companyData.observacaoGeral || ""}
                  onChange={(value) =>
                    handleInputChange("observacaoGeral", value)
                  }
                  placeholder="Digite aqui observações gerais que aparecerão no final do relatório..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Use o botão "—" na barra de ferramentas para inserir
                  divisões e separar diferentes informações.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Dialogs Integrados */}
        <Dialog open={showDemissaoDialog} onOpenChange={setShowDemissaoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Funcionário Demitido</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário para adicionar todos os itens
                de demissão relacionados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome-funcionario-demissao">
                  Nome do Funcionário
                </Label>
                <Input
                  id="nome-funcionario-demissao"
                  value={demissaoForm.nome}
                  onChange={(e) =>
                    setDemissaoForm((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Nome completo do funcionário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-admissao-demissao">Data de Admissão</Label>
                <Input
                  id="data-admissao-demissao"
                  type="date"
                  value={demissaoForm.dataAdmissao}
                  onChange={(e) =>
                    setDemissaoForm((prev) => ({
                      ...prev,
                      dataAdmissao: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-demissao">Data de Demissão</Label>
                <Input
                  id="data-demissao"
                  type="date"
                  value={demissaoForm.dataDemissao}
                  onChange={(e) =>
                    setDemissaoForm((prev) => ({
                      ...prev,
                      dataDemissao: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero-sei-demissao">Nº SEI</Label>
                <Input
                  id="numero-sei-demissao"
                  value={demissaoForm.numeroSei}
                  onChange={(e) =>
                    setDemissaoForm((prev) => ({
                      ...prev,
                      numeroSei: e.target.value,
                    }))
                  }
                  placeholder="Número do SEI (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao-documento-demissao">
                  Descrição do Documento
                </Label>
                <Textarea
                  id="descricao-documento-demissao"
                  value={demissaoForm.descricaoDocumento}
                  onChange={(e) =>
                    setDemissaoForm((prev) => ({
                      ...prev,
                      descricaoDocumento: e.target.value,
                    }))
                  }
                  placeholder="Descrição do documento apresentado (opcional)"
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={adicionarFuncionarioDemitido}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDemissaoDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAdmissaoDialog} onOpenChange={setShowAdmissaoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Funcionário Admitido</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário para adicionar todos os itens
                de admissão relacionados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome-funcionario-admissao">
                  Nome do Funcionário
                </Label>
                <Input
                  id="nome-funcionario-admissao"
                  value={admissaoForm.nome}
                  onChange={(e) =>
                    setAdmissaoForm((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Nome completo do funcionário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-admissao">Data de Admissão</Label>
                <Input
                  id="data-admissao"
                  type="date"
                  value={admissaoForm.dataAdmissao}
                  onChange={(e) =>
                    setAdmissaoForm((prev) => ({
                      ...prev,
                      dataAdmissao: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero-sei-admissao">Nº SEI</Label>
                <Input
                  id="numero-sei-admissao"
                  value={admissaoForm.numeroSei}
                  onChange={(e) =>
                    setAdmissaoForm((prev) => ({
                      ...prev,
                      numeroSei: e.target.value,
                    }))
                  }
                  placeholder="Número do SEI (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao-documento-admissao">
                  Descrição do Documento
                </Label>
                <Textarea
                  id="descricao-documento-admissao"
                  value={admissaoForm.descricaoDocumento}
                  onChange={(e) =>
                    setAdmissaoForm((prev) => ({
                      ...prev,
                      descricaoDocumento: e.target.value,
                    }))
                  }
                  placeholder="Descrição do documento apresentado (opcional)"
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={adicionarFuncionarioAdmitido}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdmissaoDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showTransferenciaDialog}
          onOpenChange={setShowTransferenciaDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Funcionário Transferido</DialogTitle>
              <DialogDescription>
                Preencha os dados do funcionário para adicionar todos os itens
                de transferência relacionados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome-funcionario-transferencia">
                  Nome do Funcionário
                </Label>
                <Input
                  id="nome-funcionario-transferencia"
                  value={transferenciaForm.nome}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      nome: e.target.value,
                    }))
                  }
                  placeholder="Nome completo do funcionário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-transferencia">
                  Data de Transferência
                </Label>
                <Input
                  id="data-transferencia"
                  type="date"
                  value={transferenciaForm.dataTransferencia}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      dataTransferencia: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obra-origem">Obra de Origem</Label>
                <Input
                  id="obra-origem"
                  value={transferenciaForm.obraOrigem}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      obraOrigem: e.target.value,
                    }))
                  }
                  placeholder="Nome da obra de origem"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obra-destino">Obra de Destino</Label>
                <Input
                  id="obra-destino"
                  value={transferenciaForm.obraDestino}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      obraDestino: e.target.value,
                    }))
                  }
                  placeholder="Nome da obra de destino"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero-sei-transferencia">Nº SEI</Label>
                <Input
                  id="numero-sei-transferencia"
                  value={transferenciaForm.numeroSei}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      numeroSei: e.target.value,
                    }))
                  }
                  placeholder="Número do SEI (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao-documento-transferencia">
                  Descrição do Documento
                </Label>
                <Textarea
                  id="descricao-documento-transferencia"
                  value={transferenciaForm.descricaoDocumento}
                  onChange={(e) =>
                    setTransferenciaForm((prev) => ({
                      ...prev,
                      descricaoDocumento: e.target.value,
                    }))
                  }
                  placeholder="Descrição do documento apresentado (opcional)"
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={adicionarFuncionarioTransferido}
                  className="flex-1 bg-blue-700 hover:bg-blue-800"
                >
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTransferenciaDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
