export const STORAGE_KEY = "checklist_medição_v7";

export const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]; 

export const ITENS_PADRAO = [
  ["Declaração", "Responsabilizar-se pelos encargos trabalhistas, previdenciários, fiscais e comerciais, resultantes da execução do Contrato, conforme dispõe o art. 71, Parágrafos 1° e 2°, da Lei n.º 8.666/93."],
  ["Declaração", "Garante aos seus trabalhadores ambiente de trabalho, inclusive equipamentos e instalações, em condições adequadas ao cumprimento das normas de saúde, segurança e bem-estar no trabalho."],
  ["Declaração", "Cumpre a observância dos preceitos da legislação sobre a jornada de trabalho, conforme a categoria profissional."],
  ["Declaração", "Responsabilidade exclusiva da contratada sobre a quitação dos encargos trabalhistas e sociais decorrentes do contrato."],
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
  ["01", "Relação dos empregados contendo nome completo, cargo, função, horário do posto, RG, CPF e RTs, se houver"]
];

export const ITENS_DEMISSAO = [
  ["a)", "Aviso prévio / Comunicado de Dispensa / Pedido de Demissão"],
  ["b)", "Termos de rescisão; (dos contratos de trabalho dos empregados devidamente homologados)"],
  ["c)", "Guias de recolhimento da contribuição previdenciária e do FGTS; (referentes às rescisões e comprovante de pagamento)"],
  ["d)", "Extratos dos depósitos efetuados nas contas vinculadas individuais do FGTS de cada empregado dispensado."],
  ["e)", "Recibo de pagamento para fins rescisório; (comprovante de depósito/transferência ou recibo de pagamento assinado)"],
  ["f)", "Comprovante de pagamento de FGTS para fins rescisório, se for o caso"],
  ["g)", "Comprovante de pagamento de multa de 40% do FGTS, se for o caso"],
  ["h)", "Exame demissional"],
  ["i)", "Folha de Ponto"],
  ["j)", "Comprovante de baixa da CTPS"],
  ["k)", "Memória de cálculo de médias"],
  ["l)", "Outros Recibos"],
  ["m)", "Outros: Declarações e Ofício"]
];

export const ITENS_ADMISSAO = [
  ["1)", "Carteira de Trabalho e Previdência Social (CTPS)"],
  ["2)", "Exame médico admissional"]
];

export const ITENS_TRANSFERENCIA = [
  ["1)", "Documento de transferência"],
  ["2)", "Atualização de dados cadastrais"]
];

export const ITENS_COM_QTD = new Set(["II","III","IV","V","VII","VIII","XI","XII","XIII","01","02","03"]);

export const EXTRAS_CONFIG: Record<string, Array<{id: string, label: string, type: string, currency?: boolean, mmAAAA?: boolean}>> = {
  "DECLARAÇÃO": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"data_declaracao", label:"Data:", type:"date"},
    {id:"cidade_declaracao", label:"Cidade:", type:"text"},
    {id:"uf_declaracao", label:"UF:", type:"text"}
  ],
  "I": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"Comprovante", label:"Nº CNO:", type:"text"},
    {id:"cidadeObra", label:"Cidade-UF:", type:"text"},
    {id:"Obra", label:"Obra:", type:"text"}
  ],
  "II": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"}
  ],
  "III": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"dt_pagto", label:"Data de pagamento", type:"date"}
  ],
  "IV": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"Folha_analitica", label:"Mês/Ano ref. (MM/AAAA)", type:"text", mmAAAA:true}
  ],
  "V": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"dt_assin", label:"Data de assinatura do recibo", type:"date"}
  ],
  "VI": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"guia_num", label:"Nº/Ident. da guia", type:"text"},
    {id:"guia_val", label:"Valor", type:"text",currency: true },
    {id:"guia_venc", label:"Vencimento", type:"date"},
    {id:"guia_pgto", label:"Data de pagamento", type:"date"}
  ],
  "VII": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"fgts_ult", label:"Último recolhimento (data)", type:"date"},
    {id:"fgts_comp", label:"Mês/Ano ref. (MM/AAAA)", type:"text", mmAAAA:true},
    {id:"fgts_atualização", label:"Última atualização(data)", type:"date"}
  ],
  "VIII": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"doc_comp", label:"Mês/Ano ref. do documento (MM/AAAA)", type:"text", mmAAAA:true},
    {id:"guia_val", label:"Valor", type:"text", currency:true},
    {id:"guia_venc", label:"Vencimento", type:"date"},
    {id:"guia_pgto", label:"Data de pagamento", type:"date"}
  ],
  "IX": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"irrf_comp", label:"Mês de Competência (MM/AAAA)", type:"text", mmAAAA:true},
    {id:"guia_val", label:"Valor", type:"text",currency: true },
    {id:"irrf_venc", label:"Vencimento", type:"date"},
    {id:"irrf_pgto", label:"Data de pagamento", type:"date"}
  ],
  "X": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"dctf_rec", label:"Nº recibo de entrega", type:"text"},
    {id:"dctf_comp", label:"Comprovante de pagamento (descrição)", type:"text"},
    {id:"dctf_per", label:"Período de apuração (MM/AAAA)", type:"text", mmAAAA:true}
  ],
  "XI": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"ali_assin", label:"Data de assinatura do recibo", type:"date"}
  ],
  "XII": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"cesta_assin", label:"Data de assinatura do recibo", type:"date"}
  ],
  "XIII": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"apo_num", label:"Nº da Apólice", type:"text"},
    {id:"apo_ini", label:"Início de vigência", type:"date"},
    {id:"apo_fim", label:"Fim de vigência", type:"date"},
    {id:"apo_seg", label:"Seguradora", type:"text"}
  ],
  "01": [
    {id:"numero_sei", label:"Nº SEI:", type:"text"},
    {id:"mes_ref", label:"Mês de Referência (MM/AAAA)", type:"text", mmAAAA:true}
  ]
};