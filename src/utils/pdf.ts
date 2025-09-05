import type { ChecklistItem, CompanyData, FuncionarioDemissao, FuncionarioAdmissao, FuncionarioTransferencia } from '../types';
import { getCurrentDateExtended, formatDateForDisplay, validateReportFields } from './index';
import { toast } from 'sonner@2.0.3';

const abreviarDescricao = (descricao: string): string => {
  const abreviacoes: Record<string, string> = {
    "Responsabilizar-se pelos encargos trabalhistas, previdenciários, fiscais e comerciais, resultantes da execução do Contrato, conforme dispõe o art. 71, Parágrafos 1° e 2°, da Lei n.º 8.666/93.": "Responsabilização por encargos trabalhistas, previdenciários, fiscais (art.71 Lei 8.666/93)",
    "Garante aos seus trabalhadores ambiente de trabalho, inclusive equipamentos e instalações, em condições adequadas ao cumprimento das normas de saúde, segurança e bem-estar no trabalho.": "Garantia de ambiente de trabalho adequado às normas de SST",
    "Cumpre a observância dos preceitos da legislação sobre a jornada de trabalho, conforme a categoria profissional.": "Cumprimento da legislação sobre jornada de trabalho",
    "Responsabilidade exclusiva da contratada sobre a quitação dos encargos trabalhistas e sociais decorrentes do contrato.": "Responsabilidade exclusiva por quitação de encargos trabalhistas/sociais",
    "Comprovante de inscrição no CNO": "Comprovante CNO",
    "Folhas de ponto (com relatório de horas, se aplicável)": "Folhas ponto + relatório horas",
    "Contracheques (ou recibos bancários)": "Contracheques/recibos bancários",
    "Folha de pagamento analítica": "Folha pagamento analítica",
    "Comprovante de fornecimento de transporte": "Comprovante transporte",
    "Guia de recolhimento da Previdência Social - GPS": "GPS - Guia Previdência Social",
    "Extratos de FGTS individuais": "Extratos FGTS individuais",
    "Relação de trabalhadores no FGTS Digital": "Relação trabalhadores FGTS Digital",
    "Guia de arrecadação de IRRF": "Guia IRRF",
    "Comprovante DCTFWEB": "Comprovante DCTFWEB",
    "Comprovante de alimentação": "Comprovante alimentação",
    "Comprovante de cesta básica": "Comprovante cesta básica",
    "Apólice de Seguro de Vida (com certificados individuais)": "Apólice Seguro Vida + certificados",
    "Relação dos empregados contendo nome completo, cargo, função, horário do posto, RG, CPF e RTs, se houver": "Relação empregados (nome, cargo, função, horário, RG, CPF, RTs)",
    "Aviso prévio / Comunicado de Dispensa / Pedido de Demissão": "Aviso prévio/Comunicado dispensa/Pedido demissão",
    "Termos de rescisão; (dos contratos de trabalho dos empregados devidamente homologados)": "Termos rescisão homologados",
    "Guias de recolhimento da contribuição previdenciária e do FGTS; (referentes às rescisões e comprovante de pagamento)": "Guias contrib.previd. e FGTS rescisões + comprov.pagto",
    "Extratos dos depósitos efetuados nas contas vinculadas individuais do FGTS de cada empregado dispensado.": "Extratos depósitos FGTS empregados dispensados",
    "Recibo de pagamento para fins rescisório; (comprovante de depósito/transferência ou recibo de pagamento assinado)": "Recibo pagamento rescisório (depósito/transf./assinado)",
    "Comprovante de pagamento de FGTS para fins rescisório, se for o caso": "Comprovante FGTS rescisório",
    "Comprovante de pagamento de multa de 40% do FGTS, se for o caso": "Comprovante multa 40% FGTS",
    "Exame demissional": "Exame demissional",
    "Folha de Ponto": "Folha Ponto",
    "Comprovante de baixa da CTPS": "Comprovante baixa CTPS",
    "Memória de cálculo de médias": "Memória cálculo médias",
    "Outros Recibos": "Outros Recibos",
    "Outros: Declarações e Ofício": "Outros: Declarações/Ofício",
    "Carteira de Trabalho e Previdência Social (CTPS)": "CTPS",
    "Exame médico admissional": "Exame admissional",
    "Documento de transferência": "Doc. transferência",
    "Atualização de dados cadastrais": "Atualização dados cadastrais"
  };

  return abreviacoes[descricao] || descricao;
};

const getFraseChaveFuncionario = (
  item: ChecklistItem,
  funcionariosAdmissao: FuncionarioAdmissao[],
  funcionariosTransferencia: FuncionarioTransferencia[]
): string => {
  const frasesChave: Record<string, string> = {
    "a)": "Aviso Prévio / Comunicado Dispensa / Pedido Demissão",
    "b)": "Termos de Rescisão Homologados",
    "c)": "Guias Contrib. Previd. e FGTS Rescisões",
    "d)": "Extratos FGTS Empregados Dispensados",
    "e)": "Recibo Pagamento Rescisório",
    "f)": "Comprovante FGTS Rescisório",
    "g)": "Comprovante Multa 40% FGTS",
    "h)": "Exame Demissional",
    "i)": "Folha de Ponto",
    "j)": "Comprovante Baixa CTPS",
    "k)": "Memória Cálculo Médias",
    "l)": "Outros Recibos",
    "m)": "Declarações e Ofício",
    "1)": item.funcionarioId && funcionariosAdmissao.find(f => f.id === item.funcionarioId) ? "CTPS" : 
          item.funcionarioId && funcionariosTransferencia.find(f => f.id === item.funcionarioId) ? "Doc. Transferência" : "CTPS",
    "2)": item.funcionarioId && funcionariosAdmissao.find(f => f.id === item.funcionarioId) ? "Exame Admissional" : 
          item.funcionarioId && funcionariosTransferencia.find(f => f.id === item.funcionarioId) ? "Atualização Dados Cadastrais" : "Exame Admissional"
  };

  return frasesChave[item.item.trim()] || abreviarDescricao(item.descricao);
};

export const createPDFContent = (
  tipagem: 'completo' | 'pendencias',
  items: ChecklistItem[],
  companyData: CompanyData,
  funcionariosDemissao: FuncionarioDemissao[],
  funcionariosAdmissao: FuncionarioAdmissao[],
  funcionariosTransferencia: FuncionarioTransferencia[]
) => {
  const pendencias = items.filter(item => item.status !== 'OK');
  const itensParaExibir = tipagem === 'completo' ? items : pendencias;

  const itensRegulares = itensParaExibir.filter(item => !item.funcionarioId);
  
  const demitidos = new Map<string, {funcionario: FuncionarioDemissao; itens: ChecklistItem[]}>();
  const admitidos = new Map<string, {funcionario: FuncionarioAdmissao; itens: ChecklistItem[]}>();  
  const transferidos = new Map<string, {funcionario: FuncionarioTransferencia; itens: ChecklistItem[]}>();

  itensParaExibir.filter(item => item.funcionarioId).forEach(item => {
    let funcionarioDemissao = funcionariosDemissao.find(f => f.id === item.funcionarioId);
    if (funcionarioDemissao) {
      if (!demitidos.has(item.funcionarioId!)) {
        demitidos.set(item.funcionarioId!, {funcionario: funcionarioDemissao, itens: []});
      }
      demitidos.get(item.funcionarioId!)!.itens.push(item);
      return;
    }
    
    let funcionarioAdmissao = funcionariosAdmissao.find(f => f.id === item.funcionarioId);
    if (funcionarioAdmissao) {
      if (!admitidos.has(item.funcionarioId!)) {
        admitidos.set(item.funcionarioId!, {funcionario: funcionarioAdmissao, itens: []});
      }
      admitidos.get(item.funcionarioId!)!.itens.push(item);
      return;
    }
    
    let funcionarioTransferencia = funcionariosTransferencia.find(f => f.id === item.funcionarioId);
    if (funcionarioTransferencia) {
      if (!transferidos.has(item.funcionarioId!)) {
        transferidos.set(item.funcionarioId!, {funcionario: funcionarioTransferencia, itens: []});
      }
      transferidos.get(item.funcionarioId!)!.itens.push(item);
    }
  });

  let tabelaItens = '';
  
  itensRegulares.forEach(item => {
    const seiValue = item.extras.numero_sei || '';
    const statusText = item.status === 'OK' ? 'OK' : 
                      item.status === 'PARCIAL' ? `Parcial${item.obs ? `: ${item.obs.substring(0, 30)}...` : ''}` : 
                      `Pend.${item.obs ? `: ${item.obs.substring(0, 30)}...` : ''}`;
    
    const descricaoAbreviada = abreviarDescricao(item.descricao);
    
    tabelaItens += `
      <tr>
        <td style="border: 1px solid #000; padding: 3px 5px; font-size: 8px; vertical-align: top; width: 65%;">
          [${item.item}] ${descricaoAbreviada}
        </td>
        <td style="border: 1px solid #000; padding: 3px 5px; font-size: 8px; vertical-align: top; width: 20%; text-align: center;">
          <span style="font-size: 7px; font-weight: bold;">SEI:</span><br>
          <span style="font-size: 7px;">${seiValue}</span>
        </td>
        <td style="border: 1px solid #000; padding: 3px 5px; font-size: 8px; vertical-align: top; text-align: center; width: 15%;">
          ${statusText}
        </td>
      </tr>
    `;
  });

  let funcionariosContent = '';

  if (admitidos.size > 0) {
    funcionariosContent += `
      <div style="margin-top: 10px;">
        <h3 style="font-family: 'Inter', sans-serif; font-weight: bold; font-size: 9px; color: #000; margin-bottom: 6px;">
          Funcionários Admitidos:
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
    `;

    let admitidosArray = Array.from(admitidos.values());
    admitidosArray.forEach(({ funcionario, itens }) => {
      funcionariosContent += `
        <div style="text-align: left;">
          <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 8px; color: #000; margin-bottom: 2px;">
            ${funcionario.nome.length > 20 ? funcionario.nome.substring(0, 20) + '...' : funcionario.nome}
          </div>
          <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: #000; margin-bottom: 4px;">
            ${formatDateForDisplay(funcionario.dataAdmissao)}
          </div>
      `;
      
      itens.forEach(item => {
        const statusText = item.status === 'OK' ? 'OK' : 
                         item.status === 'PARCIAL' ? 'P' : 'X';
        const fraseChave = getFraseChaveFuncionario(item, funcionariosAdmissao, funcionariosTransferencia);
        funcionariosContent += `
          <div style="background-color: #d9d9d9; border-radius: 4px; padding: 2px; margin-bottom: 2px; font-family: 'Inter', sans-serif; font-size: 6px; text-align: center;">
            ${item.item} ${fraseChave} - ${statusText}
          </div>
        `;
      });
      
      funcionariosContent += `</div>`;
    });

    funcionariosContent += `
        </div>
      </div>
    `;
  }

  if (transferidos.size > 0) {
    funcionariosContent += `
      <div style="margin-top: 10px;">
        <h3 style="font-family: 'Inter', sans-serif; font-weight: bold; font-size: 9px; color: #000; margin-bottom: 6px;">
          Funcionários Transferidos:
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
    `;

    let transferidosArray = Array.from(transferidos.values());
    transferidosArray.forEach(({ funcionario, itens }) => {
      funcionariosContent += `
        <div style="text-align: left;">
          <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 8px; color: #000; margin-bottom: 2px;">
            ${funcionario.nome.length > 18 ? funcionario.nome.substring(0, 18) + '...' : funcionario.nome}
          </div>
          <div style="background-color: #d9d9d9; border-radius: 4px; padding: 2px; margin-bottom: 2px; font-family: 'Inter', sans-serif; font-size: 7px; text-align: center;">
            ${funcionario.obraOrigem.length > 15 ? funcionario.obraOrigem.substring(0, 15) + '...' : funcionario.obraOrigem}
          </div>
          <div style="background-color: #d9d9d9; border-radius: 4px; padding: 2px; margin-bottom: 4px; font-family: 'Inter', sans-serif; font-size: 7px; text-align: center;">
            ${funcionario.obraDestino.length > 15 ? funcionario.obraDestino.substring(0, 15) + '...' : funcionario.obraDestino}
          </div>
      `;
      
      itens.forEach(item => {
        const statusText = item.status === 'OK' ? 'OK' : 
                         item.status === 'PARCIAL' ? 'P' : 'X';
        const fraseChave = getFraseChaveFuncionario(item, funcionariosAdmissao, funcionariosTransferencia);
        funcionariosContent += `
          <div style="background-color: #d9d9d9; border-radius: 4px; padding: 2px; margin-bottom: 2px; font-family: 'Inter', sans-serif; font-size: 6px; text-align: center;">
            ${item.item} ${fraseChave} - ${statusText}
          </div>
        `;
      });
      
      funcionariosContent += `</div>`;
    });

    funcionariosContent += `
        </div>
      </div>
    `;
  }

  if (demitidos.size > 0) {
    funcionariosContent += `
      <div style="margin-top: 10px;">
        <h3 style="font-family: 'Inter', sans-serif; font-weight: bold; font-size: 9px; color: #000; margin-bottom: 6px;">
          Funcionários Demitidos:
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
    `;

    let demitidosArray = Array.from(demitidos.values());
    demitidosArray.forEach(({ funcionario, itens }) => {
      funcionariosContent += `
        <div style="text-align: left;">
          <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 8px; color: #000; margin-bottom: 2px;">
            ${funcionario.nome.length > 25 ? funcionario.nome.substring(0, 25) + '...' : funcionario.nome}
          </div>
          <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: #000; margin-bottom: 1px;">
            Admissão: ${formatDateForDisplay(funcionario.dataAdmissao)}
          </div>
          <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: #000; margin-bottom: 4px;">
            Demissão: ${formatDateForDisplay(funcionario.dataDemissao)}
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px;">
      `;
      
      itens.forEach(item => {
        const statusText = item.status === 'OK' ? 'OK' : 
                         item.status === 'PARCIAL' ? 'P' : 'X';
        const fraseChave = getFraseChaveFuncionario(item, funcionariosAdmissao, funcionariosTransferencia);
        funcionariosContent += `
          <div style="background-color: #d9d9d9; border-radius: 3px; padding: 2px; margin-bottom: 1px; font-family: 'Inter', sans-serif; font-size: 5px; text-align: center;">
            ${item.item} ${fraseChave} - ${statusText}
          </div>
        `;
      });
      
      funcionariosContent += `
          </div>
        </div>
      `;
    });

    funcionariosContent += `
        </div>
      </div>
    `;
  }

  let pendenciasContent = '';
  const itensPendentes = itensRegulares.filter(item => item.status !== 'OK');
  if (itensPendentes.length > 0 || companyData.observacaoGeral) {
    pendenciasContent += `
      <div style="margin-top: 12px;">
        <h3 style="font-family: 'Inter', sans-serif; font-weight: bold; font-size: 9px; color: #000; margin-bottom: 6px;">
          Pendências:
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
    `;

    itensPendentes.forEach(item => {
      const statusText = item.status === 'PARCIAL' ? 'Parcial' : 'Pendente';
      const descricaoAbreviada = abreviarDescricao(item.descricao);
      pendenciasContent += `
        <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: #000; margin-bottom: 6px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
          <strong>[${item.item}] ${descricaoAbreviada.substring(0, 40)}...</strong><br>
          ${statusText}${item.obs ? `: ${item.obs.substring(0, 50)}...` : ''}
        </div>
      `;
    });

    if (companyData.observacaoGeral) {
      pendenciasContent += `
        <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: #000; margin-top: 6px; padding: 4px; border: 2px solid #2c2d94; border-radius: 3px; grid-column: 1 / -1;">
          <strong>Obs. Geral:</strong> ${companyData.observacaoGeral.substring(0, 150)}${companyData.observacaoGeral.length > 150 ? '...' : ''}
        </div>
      `;
    }

    pendenciasContent += `</div></div>`;
  }

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ANÁLISE DOS DOCUMENTOS TRABALHISTAS  - DNIT</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Jaldi:wght@400;700&display=swap');
        
        @page { 
          size: A4 portrait;
          margin: 8mm 10mm 10mm 10mm;
        }
        
        body { 
          font-family: 'Inter', sans-serif; 
          font-size: 9px; 
          line-height: 1.2; 
          margin: 0;
          padding: 0;
          color: #000;
          background: #ffffff;
        }
        
        .header {
          background: #2c2d94;
          height: 40px;
          width: 100%;
          position: relative;
          margin-bottom: 10px;
        }
        
        .sre-logo {
          position: absolute;
          left: 25px;
          top: 8px;
          width: 60px;
          height: 24px;
          background: white;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .sre-text {
          font-family: 'Jaldi', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #2c2d94;
        }
        
        .superintendencia-text {
          position: absolute;
          left: 95px;
          top: 16px;
          font-family: 'Jaldi', sans-serif;
          font-weight: 700;
          font-size: 9px;
          color: white;
        }
        
        .report-content {
          margin-bottom: 10px;
          font-family: 'Inter', sans-serif;
        }
        
        .report-title {
          font-weight: 800;
          font-size: 12px;
          color: #000;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .process-info {
          font-size: 8px;
          color: #000;
          line-height: 1.3;
          margin-bottom: 10px;
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 2px;
        }
        
        .process-info div {
          margin-bottom: 2px;
        }
        
        .content-section {
          font-family: 'Inter', sans-serif;
          font-size: 8px;
          color: #000;
          line-height: 1.3;
          margin-bottom: 10px;
        }
        
        .content-section p {
          margin-bottom: 6px;
        }
        
        .checklist-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        
        .checklist-table td {
          border: 1px solid #000;
          padding: 3px 5px;
          vertical-align: top;
          font-family: 'Inter', sans-serif;
        }
        
        .final-signature {
          margin-top: 20px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          page-break-inside: avoid;
        }
        
        .final-signature .name {
          font-size: 12px;
          color: #000;
          margin-bottom: 3px;
          font-weight: bold;
        }
        
        .final-signature .role {
          font-size: 10px;
          color: #000;
          margin-bottom: 3px;
        }
        
        .final-signature .location {
          font-size: 9px;
          color: #000;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="sre-logo">
          <div class="sre-text">SRE</div>
        </div>
        <div class="superintendencia-text">Superintendência Regional do Tocantins</div>
      </div>
      
      <div class="report-content">
        <div class="report-title">CONFERÊNCIA DOS DOCUMENTOS TRABALHISTAS</div>
        
        <div class="process-info">
          <div><strong>Processo:</strong> ${companyData.numeroProcesso}</div>
          <div><strong>Contrato:</strong> ${companyData.numeroContrato}</div>
          <div><strong>Empresa:</strong> ${companyData.empresa}</div>
          <div><strong>Medição:</strong> ${companyData.numeroMedicao} - <strong>Período:</strong> ${companyData.periodo}</div>
        </div>
      </div>
      
      <div class="content-section">
        <p><strong>1.</strong> &nbsp;&nbsp;&nbsp;Considerando protocolo, ${companyData.protocoloSEI}, no Processo SEI ${companyData.numeroProcesso}</p>
        
        <p><strong>2.</strong> &nbsp;&nbsp;&nbsp;Após análise da documentação apresentada, identificado:</p>
      </div>
      
      ${tabelaItens ? `
        <table class="checklist-table">
          ${tabelaItens}
        </table>
      ` : ''}
      
      ${funcionariosContent}
      
      ${pendenciasContent}
      
      <div style="margin-top: 15px; font-family: 'Inter', sans-serif; font-size: 8px; color: #000;">
        <strong>3.</strong> &nbsp;&nbsp;&nbsp;Para viabilizar análise e liberação da medição, encaminhamos presente relatório.
      </div>
      
      <div style="margin-top: 10px; font-family: 'Inter', sans-serif; font-size: 8px; color: #000;">
        Atenciosamente,
      </div>
      
      <div class="final-signature">
        <div class="name">${companyData.Usuario || 'Nome do Funcionário'}</div>
        <div class="role">Analista Administrativo</div>
        <div class="location">${companyData.cidade ? `${companyData.cidade} - ${companyData.uf}, ` : ''}${getCurrentDateExtended()}</div>
      </div>
    </body>
    </html>
  `;

  return content;
};

export const gerarRelatorio = (
  tipagem: 'completo' | 'pendencias',
  checklistItems: ChecklistItem[],
  companyData: CompanyData,
  funcionariosDemissao: FuncionarioDemissao[],
  funcionariosAdmissao: FuncionarioAdmissao[],
  funcionariosTransferencia: FuncionarioTransferencia[]
) => {
  console.log('Iniciando geração de relatório:', tipagem);
  
  try {
    const validation = validateReportFields(companyData, checklistItems);
    
    if (!validation.valid) {
      const errorMessage = validation.errors.map((error, index) => 
        `${index + 1}. ${error}`
      ).join('\n');

      toast.error(
        `❌ Não é possível gerar o relatório. ${validation.errors.length} problema(s) encontrado(s):\n\n${errorMessage}`,
        {
          duration: 12000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '600px'
          }
        }
      );
      return;
    }

    toast.loading('Gerando relatório PDF...', { id: 'pdf-loading' });

    console.log('Criando conteúdo HTML...');
    const htmlContent = createPDFContent(
      tipagem, 
      checklistItems, 
      companyData, 
      funcionariosDemissao, 
      funcionariosAdmissao, 
      funcionariosTransferencia
    );
    
    console.log('Tentando abrir nova janela...');
    const newWindow = window.open('', '_blank');
    
    if (!newWindow) {
      console.log('Popup bloqueado, usando método alternativo...');
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analise_documentos_trabalhistas_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Relatório baixado como HTML. Abra o arquivo no navegador e use Ctrl+P para gerar PDF.`, { id: 'pdf-loading' });
      return;
    }

    console.log('Escrevendo conteúdo na nova janela...');
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    // garante o nome do arquivo sugerido no diálogo de imprimir/Salvar como PDF
try {
  newWindow.document.title = 'ANÁLISE DOS DOCUMENTOS TRABALHISTAS - DNIT';
} catch {}

    console.log('Configurando print na nova janela...');
    setTimeout(() => {
  try {
    newWindow.document.title = 'ANÁLISE DOS DOCUMENTOS TRABALHISTAS - DNIT'; // reforça em alguns browsers
    newWindow.print();
    toast.success(`Relatório ${tipagem} gerado! Use Ctrl+P para salvar como PDF.`, { id: 'pdf-loading' });
  } catch (printError) {
    console.error('Erro na impressão:', printError);
    toast.success(`Relatório ${tipagem} gerado na nova aba. Use Ctrl+P para salvar como PDF.`, { id: 'pdf-loading' });
  }
}, 500);


  } catch (error) {
    console.error('Erro na geração do PDF:', error);
    toast.error('Erro ao gerar PDF. Verifique o console para mais detalhes.', { id: 'pdf-loading' });
  }
};