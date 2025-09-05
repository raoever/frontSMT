import { toast } from 'sonner@2.0.3';
import type { ChecklistItem, CompanyData, ValidationResult } from '../types';
import { EXTRAS_CONFIG } from '../constants';

export const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    const timestamp = performance.now();
    const random1 = Math.random().toString(36).substring(2, 15);
    const random2 = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random1}${random2}`;
  }
};

export const getItemSortOrder = (itemCode: string): number => {
  if (itemCode === 'Declaração') return 0;
  
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
  const romanIndex = romanNumerals.indexOf(itemCode);
  if (romanIndex !== -1) return 100 + romanIndex;
  
  const arabicMatch = itemCode.match(/^(\d+)$/);
  if (arabicMatch) return 200 + parseInt(arabicMatch[1]);
  
  const demissaoMatch = itemCode.match(/^([a-z])\)$/);
  if (demissaoMatch) return 300 + demissaoMatch[1].charCodeAt(0) - 97;
  
  const admissaoMatch = itemCode.match(/^(\d+)\)$/);
  if (admissaoMatch) return 400 + parseInt(admissaoMatch[1]);
  
  return 999;
};

export const sortItems = (items: ChecklistItem[]): ChecklistItem[] => {
  return [...items].sort((a, b) => {
    const orderA = getItemSortOrder(a.item.trim());
    const orderB = getItemSortOrder(b.item.trim());
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.sortOrder - b.sortOrder;
  });
};

export const formatCurrency = (value: string): string => {
  if (!value) return '';
  
  let cleanValue = value.replace(/[^\d,.]/g, '');
  if (!cleanValue) return '';
  
  let number: number;
  
  if (cleanValue.includes(',') && cleanValue.lastIndexOf(',') > cleanValue.lastIndexOf('.')) {
    const normalized = cleanValue.replace(/\./g, '').replace(',', '.');
    number = parseFloat(normalized);
  }
  else if (cleanValue.includes('.') && cleanValue.lastIndexOf('.') > cleanValue.lastIndexOf(',')) {
    const normalized = cleanValue.replace(/,/g, '');
    number = parseFloat(normalized);
  }
  else if (!cleanValue.includes('.') && !cleanValue.includes(',')) {
    number = parseFloat(cleanValue);
  }
  else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
    number = parseFloat(cleanValue.replace(',', '.'));
  }
  else if (cleanValue.includes('.') && !cleanValue.includes(',')) {
    number = parseFloat(cleanValue);
  }
  else {
    number = parseFloat(cleanValue.replace(',', '.'));
  }
  
  if (isNaN(number)) return value;
  
  return `R$ ${number.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

export const validateMMAAAA = (value: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(value);
};

export const normalizeMMAAAA = (value: string): string => {
  if (!value) return '';
  
  let normalized = value.replace(/\s+/g, "").replace(/[-.]/g, "/");
  
  if (/^[1-9]\/\d{4}$/.test(normalized)) {
    normalized = "0" + normalized;
  }
  
  if (/^\d{6}$/.test(normalized)) {
    normalized = normalized.substring(0, 2) + "/" + normalized.substring(2);
  }
  
  if (/^\d{5}$/.test(normalized)) {
    normalized = "0" + normalized.substring(0, 1) + "/" + normalized.substring(1);
  }
  
  return normalized;
};

export const getCurrentDateExtended = (): string => {
  const date = new Date();
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const isItemDemissao = (itemCode: string): boolean => {
  return /^[a-m]\)$/.test(itemCode.trim());
};

export const isItemAdmissao = (itemCode: string): boolean => {
  return /^[1-2]\)$/.test(itemCode.trim());
};

export const isItemTransferencia = (itemCode: string): boolean => {
  return /^[1-2]\)$/.test(itemCode.trim());
};

export const createItemKey = (code: string, description: string): string => {
  return `${code.trim()}|${description.trim()}`;
};

export const validateReportFields = (
  companyData: CompanyData, 
  checklistItems: ChecklistItem[]
): ValidationResult => {
  const errors: string[] = [];
  
  const requiredCompanyFields = [
    { field: 'numeroProcesso', label: 'Número do Processo' },
    { field: 'numeroContrato', label: 'Número do Contrato' },
    { field: 'empresa', label: 'Empresa' },
    { field: 'numeroMedicao', label: 'Número da Medição' },
    { field: 'Usuario', label: 'Usuário' },
    { field: 'cidade', label: 'Cidade' },
    { field: 'uf', label: 'UF' }
  ];

  requiredCompanyFields.forEach(({ field, label }) => {
    if (!companyData[field as keyof CompanyData]?.trim()) {
      errors.push(`${label} é obrigatório`);
    }
  });

  if (checklistItems.length === 0) {
    errors.push('Adicione pelo menos um item ao checklist');
  }

  checklistItems.forEach(item => {
    if ((item.status === 'FALTA' || item.status === 'PARCIAL') && !item.obs.trim()) {
      errors.push(`Informe a observação para o item [${item.item}] - ${item.descricao.substring(0, 30)}...`);
    }
  });

  const itemsWithMissingSEI = checklistItems.filter(item => 
    !item.funcionarioId && 
    !item.extras.numero_sei?.trim()
  );

  if (itemsWithMissingSEI.length > 0) {
    errors.push(`${itemsWithMissingSEI.length} item(ns) sem número SEI preenchido`);
  }

  checklistItems.forEach(item => {
    const config = EXTRAS_CONFIG[item.item.toUpperCase()];
    if (config) {
      config.forEach(field => {
        if (field.mmAAAA && item.extras[field.id]) {
          const value = item.extras[field.id];
          if (value && !validateMMAAAA(value)) {
            errors.push(`Campo "${field.label}" no item [${item.item}] deve estar no formato MM/AAAA`);
          }
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const showValidationReport = (
  companyData: CompanyData, 
  checklistItems: ChecklistItem[]
) => {
  const validation = validateReportFields(companyData, checklistItems);
  
  if (validation.valid) {
    toast.success('✅ Todos os campos obrigatórios estão preenchidos! O relatório pode ser gerado.');
    return;
  }

  const errorMessage = validation.errors.map((error, index) => 
    `${index + 1}. ${error}`
  ).join('\n');

  toast.error(
    `❌ ${validation.errors.length} problema(s) encontrado(s):\n\n${errorMessage}`,
    {
      duration: 10000,
      style: {
        whiteSpace: 'pre-line',
        maxWidth: '500px'
      }
    }
  );
};

export const getFieldValidationClass = (
  fieldName: keyof CompanyData,
  companyData: CompanyData
): string => {
  const requiredFields = ['numeroProcesso', 'numeroContrato', 'empresa', 'numeroMedicao', 'Usuario', 'cidade', 'uf'];
  
  if (requiredFields.includes(fieldName) && !companyData[fieldName]?.trim()) {
    return 'border-red-500 bg-red-50';
  }
  return '';
};