export interface ChecklistItem {
  id: string;
  item: string;
  descricao: string;
  status: 'OK' | 'PARCIAL' | 'FALTA';
  obs: string;
  qtd: string;
  extras: Record<string, string>;
  sortOrder: number;
  funcionarioId?: string;
  lembrete?: string;
}

export interface CompanyData {
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
  uf: string;
  observacaoGeral?: string;
}

export interface FuncionarioDemissao {
  id: string;
  nome: string;
  dataAdmissao: string;
  dataDemissao: string;
  expanded: boolean;
}

export interface FuncionarioAdmissao {
  id: string;
  nome: string;
  dataAdmissao: string;
  expanded: boolean;
}

export interface FuncionarioTransferencia {
  id: string;
  nome: string;
  dataTransferencia: string;
  obraOrigem: string;
  obraDestino: string;
  expanded: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ExtraFieldConfig {
  id: string;
  label: string;
  type: string;
  currency?: boolean;
  mmAAAA?: boolean;
}