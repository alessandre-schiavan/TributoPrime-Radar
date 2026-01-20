
import { TaxData, ComparisonResult, BusinessSector } from "../types";

const cleanAIResponse = (text: string): string => {
  return text
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    .trim();
};

const extractDataFromTags = (text: string): Record<string, string> => {
  const data: Record<string, string> = {};
  const cleaned = cleanAIResponse(text);
  const regex = /<([^>]+)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = regex.exec(cleaned)) !== null) {
    data[match[1]] = match[2].trim();
  }
  return data;
};

const validateRoadmap = (roadmap: any[]): boolean => {
  if (!Array.isArray(roadmap) || roadmap.length !== 3) return false;
  const allTasks = roadmap.flatMap(r => r.actions.map((a: any) => a.task.toLowerCase()));
  const uniqueTasks = new Set(allTasks);
  // Se houver menos de 13 tarefas únicas em 15, consideramos repetitivo
  return uniqueTasks.size >= 13;
};

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const simplesRate = data.customSimplesRate || 10.81;
  let attempts = 0;
  const maxAttempts = 3;

  const prompt = `
    Aja como um Auditor Fiscal Sênior. Responda APENAS em tags XML.
    
    DADOS:
    - Faturamento: R$ ${data.monthlyRevenue}
    - Simples: ${simplesRate}%
    - Compras: R$ ${data.monthlyPurchases + data.otherInputs}
    - Setor: ${data.sector}

    CÁLCULO OBRIGATÓRIO:
    1. Simples Total = ${data.monthlyRevenue} * (${simplesRate}/100)
    2. Reforma (26,5%): Débito (${data.monthlyRevenue}*0.265) - Crédito (${data.monthlyPurchases + data.otherInputs}*0.265)

    REGRAS DO ROTEIRO (15 AÇÕES):
    - Gere 3 blocos (Alto, Médio, Baixo Impacto).
    - Cada bloco deve ter 5 ações.
    - TOTALMENTE PROIBIDO REPETIR DESCRIÇÕES.
    - Cada 'description' deve ser um parágrafo técnico sobre o setor de ${data.sector}.
    - Cada 'implementation' deve ser um passo prático (ex: "Acesse o menu fiscal...", "Revisar NCM...").

    TAGS XML:
    <simplesTotal>Valor</simplesTotal>
    <reformTotal>Valor</reformTotal>
    <ibsAmount>65% da reforma</ibsAmount>
    <cbsAmount>35% da reforma</cbsAmount>
    <creditsTaken>Total de créditos</creditsTaken>
    <effectiveRateSimples>${simplesRate}</effectiveRateSimples>
    <effectiveRateReform>Taxa</effectiveRateReform>
    <analysis>Análise real mencionando os R$ de economia</analysis>
    <decisionDrivers>Motivo 1; Motivo 2; Motivo 3</decisionDrivers>
    <technicalDetails>Nota sobre crédito de R$ ${(data.monthlyPurchases + data.otherInputs)}</technicalDetails>
    <legalOptimizations>[{"title":"Recuperação Monofásica","howToImplement":"Identificar produtos PIS/COFINS monofásicos.","benefitExpected":"Redução do Simples"},{"title":"Ajuste de NCM","howToImplement":"Saneamento de códigos de produtos.","benefitExpected":"Crédito pleno"},{"title":"Compliance de Insumos","howToImplement":"Revisão de notas de entrada.","benefitExpected":"Segurança Jurídica"}]</legalOptimizations>
    <strategicRoadmap>[{"title":"Alto Impacto","description":"Transição Imediata","impactLevel":"ALTO","actions":[{},{},{},{},{}]},{"title":"Médio Impacto","description":"Otimização","impactLevel":"MÉDIO","actions":[{},{},{},{},{}]},{"title":"Baixo Impacto","description":"Compliance","impactLevel":"BAIXO","actions":[{},{},{},{},{}]}]</strategicRoadmap>
  `;

  while (attempts < maxAttempts) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-fast&seed=${Math.floor(Math.random() * 99999)}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const rawText = await response.text();
      const extracted = extractDataFromTags(rawText);

      if (!extracted.strategicRoadmap || !extracted.simplesTotal) throw new Error("Incompleto");

      const roadmap = JSON.parse(extracted.strategicRoadmap);
      if (!validateRoadmap(roadmap)) throw new Error("Repetitivo");

      return {
        monthlyRevenue: data.monthlyRevenue,
        sector: data.sector,
        simplesTotal: parseFloat(extracted.simplesTotal),
        reformTotal: parseFloat(extracted.reformTotal),
        savings: Math.abs(parseFloat(extracted.simplesTotal) - parseFloat(extracted.reformTotal)),
        annualSavings: Math.abs(parseFloat(extracted.simplesTotal) - parseFloat(extracted.reformTotal)) * 12,
        recommendation: parseFloat(extracted.reformTotal) < parseFloat(extracted.simplesTotal) ? 'REFORMA' : 'SIMPLES',
        analysis: extracted.analysis,
        decisionDrivers: extracted.decisionDrivers.split(';').map(s => s.trim()),
        technicalDetails: extracted.technicalDetails,
        ibsAmount: parseFloat(extracted.ibsAmount),
        cbsAmount: parseFloat(extracted.cbsAmount),
        creditsTaken: parseFloat(extracted.creditsTaken),
        effectiveRateSimples: parseFloat(extracted.effectiveRateSimples),
        effectiveRateReform: parseFloat(extracted.effectiveRateReform),
        healthScore: 100,
        legalOptimizations: JSON.parse(extracted.legalOptimizations || "[]"),
        strategicRoadmap: roadmap
      } as ComparisonResult;

    } catch (err) {
      attempts++;
      clearTimeout(timeoutId);
      if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 500));
    }
  }

  return getDeterministicFallback(data, simplesRate);
};

const getDeterministicFallback = (data: TaxData, simplesRate: number): ComparisonResult => {
  const sTotal = data.monthlyRevenue * (simplesRate / 100);
  const debitoIVA = data.monthlyRevenue * 0.265;
  const creditoIVA = (data.monthlyPurchases + data.otherInputs) * 0.265;
  const rTotal = debitoIVA - creditoIVA;

  const actionsPool = {
    "ALTO": [
      { task: "Auditoria e Saneamento de NCM", desc: "Revisão técnica de todos os códigos NCM para garantir que os R$ " + data.monthlyPurchases + " em compras gerem o crédito máximo permitido de 26,5%.", impl: "Extraia a listagem de produtos do seu ERP e cruze com a tabela TIPI 2025 no portal da Receita." },
      { task: "Parametrização do IVA Dual", desc: "Configuração das alíquotas separadas de IBS (estadual/municipal) e CBS (federal) para emissão correta de notas fiscais.", impl: "Abra um chamado com seu suporte de TI e solicite a criação das novas tabelas de impostos conforme PEC 45." },
      { task: "Revisão de Margem Líquida", desc: "Cálculo do impacto dos novos tributos no preço de venda para garantir que a margem de lucro não seja corroída pelo débito de R$ " + debitoIVA.toFixed(0) + ".", impl: "Utilize uma planilha de formação de preços 'por dentro' e simule o cenário com o fim da cumulatividade." },
      { task: "Planejamento de Fluxo de Caixa", desc: "Análise das datas de vencimento do IBS/CBS vs Simples Nacional para evitar descasamento financeiro no capital de giro.", impl: "Projete seu fluxo para os próximos 12 meses considerando a nova agenda tributária de recolhimento." },
      { task: "Migração de Regime Jurídico", desc: "Análise societária para verificar se a empresa deve permanecer como Simples Nacional ou optar pelo regime normal para fruição total de créditos.", impl: "Consulte seu contador para realizar um estudo de viabilidade jurídica e tributária comparativa." }
    ],
    "MÉDIO": [
      { task: "Segregação de Receitas Monofásicas", desc: "Identificação de produtos com tributação concentrada (monofásica) para evitar o pagamento indevido na guia do Simples.", impl: "Filtre os produtos por CST/CSOSN 060 e configure o sistema para excluir essas receitas da base de cálculo." },
      { task: "Auditoria de Fornecedores PJ", desc: "Certificação de que todos os fornecedores de insumos são pessoas jurídicas que permitem o aproveitamento de créditos fiscais.", impl: "Realize um KYC (Know Your Supplier) e verifique o regime tributário de cada parceiro comercial." },
      { task: "Implementação de Auditoria Digital", desc: "Uso de ferramentas tecnológicas para validar 100% dos XMLs de entrada antes do fechamento mensal.", impl: "Contrate ou ative o módulo de entrada de notas com conferência automática de alíquotas e impostos." },
      { task: "Treinamento do Setor de Compras", desc: "Capacitação dos compradores para negociar preços considerando o crédito de 26,5% que será recuperado pela empresa.", impl: "Realize um treinamento interno demonstrando que um produto de R$ 100 agora custa R$ 73,50 líquidos após créditos." },
      { task: "Saneamento de Inventário", desc: "Organização do estoque físico vs fiscal para evitar divergências que geram multas na transição para o novo modelo.", impl: "Realize um inventário rotativo e ajuste as quantidades no bloco K do SPED/EFD." }
    ],
    "BAIXO": [
      { task: "Monitoramento Legislativo", desc: "Acompanhamento diário das Leis Complementares que definem as regras finas da Reforma Tributária.", impl: "Inscreva-se em portais de notícias especializados e acompanhe as decisões do Comitê Gestor do IBS." },
      { task: "Digitalização de Arquivos", desc: "Organização de toda documentação fiscal em nuvem para facilitar fiscalizações retroativas de até 5 anos.", impl: "Configure um backup automático dos arquivos XML e PDF das notas fiscais em serviço de storage seguro." },
      { task: "Check-list de Conformidade", desc: "Criação de protocolo mensal de conferência de tributos para eliminar erros humanos no preenchimento de guias.", impl: "Implemente um software de gestão de tarefas (Trello/Asana) com as datas críticas do calendário fiscal." },
      { task: "Revisão de Cadastro de Clientes", desc: "Atualização dos dados de clientes (CPF/CNPJ e endereço) para garantir a correta aplicação do princípio do destino.", impl: "Solicite a atualização cadastral via e-mail ou portal do cliente para todos os parceiros ativos." },
      { task: "Alinhamento Contábil Trimestral", desc: "Reuniões periódicas com a contabilidade externa para validar a estratégia de transição adotada.", impl: "Agende uma reunião de 30 minutos a cada fechamento de trimestre para revisar o dashboard de economia tributária." }
    ]
  };

  const generateActions = (level: "ALTO" | "MÉDIO" | "BAIXO") => {
    return actionsPool[level].map(a => ({
      task: a.task,
      description: a.desc,
      implementation: a.impl
    }));
  };

  return {
    monthlyRevenue: data.monthlyRevenue,
    sector: data.sector,
    simplesTotal: sTotal,
    reformTotal: rTotal,
    savings: Math.abs(sTotal - rTotal),
    annualSavings: Math.abs(sTotal - rTotal) * 12,
    recommendation: rTotal < sTotal ? 'REFORMA' : 'SIMPLES',
    analysis: `DIAGNÓSTICO DE ALTA PRECISÃO: Para sua empresa no setor de ${data.sector}, com faturamento mensal de R$ ${data.monthlyRevenue.toLocaleString()}, o Simples Nacional (alíquota ${simplesRate}%) gera um custo de R$ ${sTotal.toLocaleString()}. Na Reforma (IVA 26,5%), após o aproveitamento de R$ ${creditoIVA.toLocaleString()} em créditos sobre seus insumos, o custo líquido cai para R$ ${rTotal.toLocaleString()}.`,
    decisionDrivers: ["Cálculo de Eficiência de Crédito", "Análise de Transição PEC 45", "Equilíbrio de Caixa"],
    technicalDetails: `Motor de Cálculo Ativado: Débito Bruto de R$ ${debitoIVA.toFixed(2)} compensado por Créditos de R$ ${creditoIVA.toFixed(2)}.`,
    ibsAmount: rTotal * 0.65,
    cbsAmount: rTotal * 0.35,
    creditsTaken: creditoIVA,
    effectiveRateSimples: simplesRate,
    effectiveRateReform: (rTotal / data.monthlyRevenue) * 100,
    healthScore: 95,
    legalOptimizations: [
      { title: "Gestão de Créditos IVA", howToImplement: "Certificar compras de insumos apenas via NF-e para garantir o crédito de 26,5%.", benefitExpected: "Redução do Custo Líquido" },
      { title: "Revisão de NCM Monofásico", howToImplement: "Identificar itens de revenda com tributação antecipada para excluir do PGDAS.", benefitExpected: "Recuperação de até 4% do faturamento" },
      { title: "Compliance Digital", howToImplement: "Padronizar o recebimento de arquivos XML para automação da escrita fiscal.", benefitExpected: "Segurança contra Malha Fina" }
    ],
    strategicRoadmap: [
      { title: "Plano de Alto Impacto", description: "Foco em Transição Estrutural.", impactLevel: "ALTO", actions: generateActions("ALTO") },
      { title: "Plano de Médio Impacto", description: "Otimização de Processos.", impactLevel: "MÉDIO", actions: generateActions("MÉDIO") },
      { title: "Plano de Baixo Impacto", description: "Manutenção e Compliance.", impactLevel: "BAIXO", actions: generateActions("BAIXO") }
    ]
  };
};
