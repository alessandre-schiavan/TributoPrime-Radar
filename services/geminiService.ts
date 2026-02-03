
import { TaxData, ComparisonResult, BusinessSector } from "../types";
import { fetchWithProxy } from "../lib/api";

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const simplesRate = data.customSimplesRate || 10.81;
  const maxAttempts = 15;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Prompt ultra-comprimido com definição explícita de chaves para evitar campos vazios
      const prompt = `Auditor PEC45.Data:Sec:${data.sector},Rev:${data.monthlyRevenue},Inp:${data.monthlyPurchases},Rate:${simplesRate}%.Rule:IVA26.5%,FullCred on ${data.monthlyPurchases+data.otherInputs}.JSON:{simplesTotal,reformTotal,ibsAmount,cbsAmount,creditsTaken,effectiveRateSimples,effectiveRateReform,analysis(min600char pt-BR),decisionDrivers(5str),legalOptimizations(4obj:title,howToImplement,benefitExpected),strategicRoadmap:[{title,description,impactLevel(ALTO|MÉDIO|BAIXO),actions(5obj:task,description,implementation)}]}.No markdown.No text.`;
      
      const aiResult = await fetchWithProxy<any>(encodeURIComponent(prompt));

      // Validação de Volumetria (Matriz 3x5 e Otimizações)
      const has3Levels = aiResult?.strategicRoadmap?.length === 3;
      const has5Actions = aiResult?.strategicRoadmap?.every((r: any) => r.actions?.length === 5);
      const hasLegal = aiResult?.legalOptimizations?.length >= 1;

      if (aiResult?.simplesTotal && has3Levels && has5Actions && hasLegal) {
        const base = getDeterministicFallback(data, simplesRate);
        return {
          ...base, ...aiResult,
          savings: Math.abs(aiResult.simplesTotal - aiResult.reformTotal),
          annualSavings: Math.abs(aiResult.simplesTotal - aiResult.reformTotal) * 12,
          recommendation: aiResult.reformTotal < aiResult.simplesTotal ? 'REFORMA' : 'SIMPLES'
        };
      }
      throw new Error("Retry: Matriz incompleta.");
    } catch (e) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  return getDeterministicFallback(data, simplesRate);
};

const getDeterministicFallback = (data: TaxData, simplesRate: number): ComparisonResult => {
  const sTotal = data.monthlyRevenue * (simplesRate / 100);
  const rTotal = (data.monthlyRevenue * 0.265) - ((data.monthlyPurchases + data.otherInputs) * 0.265);
  const getActions = (lvl: string) => Array.from({length: 5}, (_, i) => ({
    task: `Tarefa ${lvl} ${i+1}`, 
    description: `Ajuste técnico ${lvl} impacto.`, 
    implementation: `Execução via Auditoria.`
  }));
  return {
    monthlyRevenue: data.monthlyRevenue, sector: data.sector, simplesTotal: sTotal, reformTotal: rTotal,
    savings: Math.abs(sTotal - rTotal), annualSavings: Math.abs(sTotal - rTotal) * 12,
    recommendation: rTotal < sTotal ? 'REFORMA' : 'SIMPLES',
    analysis: "O sistema aplicou cálculos baseados na PEC 45/2019. A viabilidade depende do aproveitamento de créditos.",
    decisionDrivers: ["Crédito Pleno", "Não-Cumulatividade", "Eficiência", "Gestão NF", "Compliance"],
    technicalDetails: "PEC 45/2019", ibsAmount: rTotal * 0.6, cbsAmount: rTotal * 0.4, creditsTaken: (data.monthlyPurchases + data.otherInputs) * 0.265,
    effectiveRateSimples: simplesRate, effectiveRateReform: (rTotal / data.monthlyRevenue) * 100, healthScore: 90,
    legalOptimizations: [{ title: "Créditos Insumos", howToImplement: "Mapear NF", benefitExpected: "Cash Flow" }],
    strategicRoadmap: [
      { title: "ALTO IMPACTO", description: "Estratégico", impactLevel: "ALTO", actions: getActions("A") },
      { title: "MÉDIO IMPACTO", description: "Operacional", impactLevel: "MÉDIO", actions: getActions("B") },
      { title: "BAIXO IMPACTO", description: "Compliance", impactLevel: "BAIXO", actions: getActions("C") }
    ]
  };
};
