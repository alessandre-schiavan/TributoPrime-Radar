
// Fix: Added StrategicPoint to the imports to support explicit typing of helper functions
import { TaxData, ComparisonResult, BusinessSector, StrategicPoint } from "../types";
import { fetchWithProxy } from "../lib/api";

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  // 1. EXTRAÇÃO E PADRONIZAÇÃO DE DADOS
  const revenue = Number(data.monthlyRevenue);
  const purchases = Number(data.monthlyPurchases);
  const payroll = Number(data.payroll);
  const other = Number(data.otherInputs);
  const simplesRate = (Number(data.customSimplesRate) || 10.81) / 100;

  // 2. CONSTANTES DA REFORMA (PEC 45/2019)
  const REFORM_STANDARD_RATE = 0.265; // 26.5% total
  const CBS_SHARE = 0.088 / 0.265;    // Proporção CBS (~33%)
  const IBS_SHARE = 0.177 / 0.265;    // Proporção IBS (~67%)

  // 3. CÁLCULOS DETERMINÍSTICOS (VERDADE ABSOLUTA)
  const simplesTotal = revenue * simplesRate;
  const taxDebits = revenue * REFORM_STANDARD_RATE;
  
  // Crédito: Imposto recuperado sobre a entrada (Compras + Insumos)
  // Obs: Folha de pagamento (payroll) NÃO gera crédito de IVA
  const creditsTaken = (purchases + other) * REFORM_STANDARD_RATE;
  
  // Imposto Líquido: Débito - Créditos (Mínimo zero)
  const reformTotal = Math.max(0, taxDebits - creditsTaken);
  
  const ibsAmount = reformTotal * IBS_SHARE;
  const cbsAmount = reformTotal * CBS_SHARE;
  const savings = simplesTotal - reformTotal;
  const annualSavings = savings * 12;
  const effectiveRateReform = (revenue > 0 ? (reformTotal / revenue) : 0) * 100;
  const effectiveRateSimples = simplesRate * 100;
  const payrollRatio = (revenue > 0 ? (payroll / revenue) : 0) * 100;

  // 4. PROMPT CONDENSADO (EVITA ERRO DE URL NO PROXY)
  // Adicionamos um RequestID aleatório no final para forçar variação na resposta da IA
  const requestId = Math.floor(Math.random() * 999999);
  const condensedPrompt = `Auditor Fiscal PEC45. NÃO RECALCULE. Use: Simples R$${simplesTotal.toFixed(2)} (${effectiveRateSimples.toFixed(2)}%), Reforma R$${reformTotal.toFixed(2)} (${effectiveRateReform.toFixed(2)}%), Economia Anual R$${annualSavings.toFixed(2)}. Folha R$${payroll} (${payrollRatio.toFixed(1)}% faturamento, sem crédito). Setor: ${data.sector}. Retorne JSON: analysis (texto 600+ chars sobre folha vs créditos), decisionDrivers (5 strings), legalOptimizations (3 itens: title, howToImplement, benefitExpected), strategicRoadmap (3 fases, 5 ações cada: task, description, implementation). Sem markdown. ID:${requestId}`;

  try {
    const aiResult = await fetchWithProxy<any>(encodeURIComponent(condensedPrompt));

    // 5. MERGE DOS DADOS CALCULADOS COM A INTELIGÊNCIA DA IA
    return {
      monthlyRevenue: revenue,
      simplesTotal: simplesTotal,
      reformTotal: reformTotal,
      savings: Math.abs(savings),
      annualSavings: Math.abs(annualSavings),
      recommendation: reformTotal < simplesTotal ? 'REFORMA' : 'SIMPLES',
      ibsAmount: ibsAmount,
      cbsAmount: cbsAmount,
      creditsTaken: creditsTaken,
      effectiveRateSimples: effectiveRateSimples,
      effectiveRateReform: effectiveRateReform,
      sector: data.sector,
      healthScore: 100,
      technicalDetails: `Cálculo baseado em Débito de 26,5% sobre faturamento e Crédito de 26,5% sobre insumos (compras + outros). Folha de pagamento de R$ ${payroll.toLocaleString('pt-BR')} excluída da base de crédito conforme legislação.`,
      // Dados da IA (ou fallback se falhar)
      analysis: aiResult?.analysis || getDefaultAnalysis(data, simplesTotal, reformTotal, effectiveRateReform),
      decisionDrivers: aiResult?.decisionDrivers || ["Não-cumulatividade plena", "Recuperação de Créditos", "Impacto da Folha", "Simplificação Tributária", "Transição Gradual"],
      legalOptimizations: aiResult?.legalOptimizations || getDefaultOptimizations(),
      strategicRoadmap: aiResult?.strategicRoadmap || getDefaultRoadmap(data.sector)
    };
  } catch (e) {
    console.warn("AI Fallback triggered:", e);
    return getDeterministicFallback(data, simplesRate);
  }
};

// Fallbacks para garantir que o app nunca quebre
const getDefaultAnalysis = (data: TaxData, s: number, r: number, rateR: number) => 
  `Análise Técnica: Para o setor de ${data.sector}, a comparação revela que o modelo de ${r < s ? 'Reforma' : 'Simples'} é financeiramente superior. No IVA Dual, a alíquota de 26,5% é compensada pelos créditos de insumos (R$ ${data.monthlyPurchases + data.otherInputs}), enquanto no Simples o imposto é calculado sobre o faturamento bruto. A folha de R$ ${data.payroll} representa um custo direto sem recuperação de crédito.`;

const getDefaultOptimizations = () => [
  { title: "Gestão de Fornecedores", howToImplement: "Mapear fornecedores para maximizar créditos de 26,5%.", benefitExpected: "Redução de custo líquido" },
  { title: "Segregação de Receitas", howToImplement: "Isolar produtos com alíquotas reduzidas.", benefitExpected: "Eficiência fiscal" },
  { title: "Créditos Acumulados", howToImplement: "Implementar sistema de controle de créditos financeiros.", benefitExpected: "Melhoria no fluxo de caixa" }
];

// Fix: Added explicit return type StrategicPoint[] to satisfy TypeScript's string union requirements for impactLevel
const getDefaultRoadmap = (sector: string): StrategicPoint[] => [
  { title: "FASE 1: DIAGNÓSTICO", description: "Auditoria interna", impactLevel: "ALTO", actions: Array(5).fill({task: "Mapeamento", description: "Análise de insumos", implementation: "Revisar notas fiscais"}) },
  { title: "FASE 2: TRANSIÇÃO", description: "Adaptação de sistemas", impactLevel: "MÉDIO", actions: Array(5).fill({task: "ERP", description: "Upgrade de software", implementation: "Configurar IBS/CBS"}) },
  { title: "FASE 3: OPERAÇÃO", description: "Compliance pleno", impactLevel: "BAIXO", actions: Array(5).fill({task: "Auditoria", description: "Validação mensal", implementation: "Checklist fiscal"}) }
];

const getDeterministicFallback = (data: TaxData, simplesRate: number): ComparisonResult => {
  const revenue = Number(data.monthlyRevenue);
  const simplesTotal = revenue * simplesRate;
  const reformTotal = Math.max(0, (revenue * 0.265) - ((data.monthlyPurchases + data.otherInputs) * 0.265));
  
  return {
    monthlyRevenue: revenue,
    simplesTotal,
    reformTotal,
    savings: Math.abs(simplesTotal - reformTotal),
    annualSavings: Math.abs(simplesTotal - reformTotal) * 12,
    recommendation: reformTotal < simplesTotal ? 'REFORMA' : 'SIMPLES',
    analysis: getDefaultAnalysis(data, simplesTotal, reformTotal, (reformTotal/revenue)*100),
    decisionDrivers: ["Cálculo Determinístico", "Segurança Fiscal"],
    technicalDetails: "Fallback técnico ativado devido a instabilidade na IA.",
    ibsAmount: reformTotal * 0.67,
    cbsAmount: reformTotal * 0.33,
    creditsTaken: (data.monthlyPurchases + data.otherInputs) * 0.265,
    effectiveRateSimples: simplesRate * 100,
    effectiveRateReform: (reformTotal / revenue) * 100,
    healthScore: 100,
    sector: data.sector,
    legalOptimizations: getDefaultOptimizations(),
    strategicRoadmap: getDefaultRoadmap(data.sector)
  };
};
