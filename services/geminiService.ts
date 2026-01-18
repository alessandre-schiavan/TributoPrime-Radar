
import { GoogleGenAI, Type } from "@google/genai";
import { TaxData, ComparisonResult, BusinessSector } from "../types";

const TIMEOUT_MS = 15000;

/**
 * SERVIÇO DE CONSULTORIA FISCAL VIA GOOGLE GEMINI API
 * Gera diagnósticos dinâmicos com roteiro de ações detalhado e análise robusta de recomendação.
 */
export const calculateTaxComparison = async (data: TaxData, attempt: number = 1): Promise<ComparisonResult> => {
  const MAX_RETRIES = 3;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Aja como um Auditor Fiscal Sênior especializado na PEC 45/2019 e Consultor de Performance Financeira. 
    Empresa de ${data.sector}.
    Faturamento: R$ ${data.monthlyRevenue} | Compras: R$ ${data.monthlyPurchases} | Folha: R$ ${data.payroll} | Outros: R$ ${data.otherInputs}.
    Simples Atual: ${data.customSimplesRate}%.

    TAREFAS CRÍTICAS:
    1. Calcule o Modelo Reforma (IVA 26.5% sobre faturamento MINUS créditos de 26.5% sobre compras e outros insumos).
    2. No campo 'analysis', forneça uma explicação PROFUNDA sobre por que a recomendação é a melhor.
    3. No campo 'decisionDrivers', gere 4 pontos técnicos fundamentais.
    4. No campo 'legalOptimizations', gere EXATAMENTE 5 estratégias de alto impacto com explicações de fácil entendimento para o empresário, focando em como isso melhora o caixa.
    5. No campo 'strategicRoadmap', gere EXATAMENTE 3 itens de impacto com as categorias: 'ALTO', 'MÉDIO' e 'BAIXO'.
       PARA CADA UM DOS 3 ITENS, você DEVE gerar EXATAMENTE 5 passos (actions) ÚNICOS, ESPECÍFICOS e EXPLICATIVOS. 
       NUNCA repita a mesma implementação ou descrição em passos diferentes. Cada passo deve ser uma etapa lógica do processo.
  `;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT_EXCEEDED")), TIMEOUT_MS)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simplesTotal: { type: Type.NUMBER },
            reformTotal: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            decisionDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalDetails: { type: Type.STRING },
            ibsAmount: { type: Type.NUMBER },
            cbsAmount: { type: Type.NUMBER },
            creditsTaken: { type: Type.NUMBER },
            effectiveRateSimples: { type: Type.NUMBER },
            effectiveRateReform: { type: Type.NUMBER },
            strategicRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impactLevel: { type: Type.STRING, description: "Deve ser 'ALTO', 'MÉDIO' ou 'BAIXO'" },
                  actions: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: {
                        task: { type: Type.STRING },
                        description: { type: Type.STRING },
                        implementation: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            legalOptimizations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  howToImplement: { type: Type.STRING },
                  benefitExpected: { type: Type.STRING }
                }
              }
            }
          },
          required: ["simplesTotal", "reformTotal", "analysis", "decisionDrivers", "strategicRoadmap", "legalOptimizations"]
        }
      }
    });

    const response = (await Promise.race([apiCall, timeoutPromise])) as any;
    const parsed = JSON.parse(response.text || "{}");
    
    const simples = parsed.simplesTotal || (data.monthlyRevenue * (data.customSimplesRate || 10) / 100);
    const reform = parsed.reformTotal || 0;
    const isReformBetter = reform < simples;

    return {
      ...parsed,
      sector: data.sector,
      monthlyRevenue: data.monthlyRevenue,
      simplesTotal: simples,
      reformTotal: reform,
      recommendation: isReformBetter ? 'REFORMA' : 'SIMPLES',
      savings: Math.abs(simples - reform),
      annualSavings: Math.abs(simples - reform) * 12,
      effectiveRateSimples: parsed.effectiveRateSimples || (simples / data.monthlyRevenue * 100),
      effectiveRateReform: parsed.effectiveRateReform || (reform / data.monthlyRevenue * 100),
      healthScore: 85
    } as ComparisonResult;

  } catch (error: any) {
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return calculateTaxComparison(data, attempt + 1);
    }
    
    const sRate = (data.customSimplesRate || 10) / 100;
    const simplesTotal = data.monthlyRevenue * sRate;
    const reformTotal = (data.monthlyRevenue * 0.265) - ((data.monthlyPurchases + data.otherInputs) * 0.265);
    const isReformBetter = reformTotal < simplesTotal;

    const generateFallbackActions = (context: string) => [
      { task: `Diagnóstico de ${context}`, description: `Mapeamento inicial das variáveis de ${context} afetadas pela PEC 45.`, implementation: "Reunião com o setor contábil para levantamento de dados." },
      { task: `Análise de Gap`, description: "Identificação de discrepâncias entre o modelo atual e o futuro IVA Dual.", implementation: "Uso de planilhas de auditoria para simulação de cenários." },
      { task: `Treinamento de Equipe`, description: "Capacitação dos gestores sobre as novas regras de tomada de crédito.", implementation: "Workshop interno com consultoria especializada." },
      { task: `Ajuste de Fluxo de Caixa`, description: "Readequação do provisionamento tributário mensal.", implementation: "Configuração de novas regras no módulo financeiro do ERP." },
      { task: `Homologação Final`, description: "Validação da nova estratégia tributária junto ao conselho.", implementation: "Apresentação de relatório final de performance fiscal." }
    ];

    return {
      monthlyRevenue: data.monthlyRevenue,
      sector: data.sector,
      simplesTotal,
      reformTotal,
      savings: Math.abs(simplesTotal - reformTotal),
      annualSavings: Math.abs(simplesTotal - reformTotal) * 12,
      effectiveRateSimples: sRate * 100,
      effectiveRateReform: (reformTotal / data.monthlyRevenue) * 100,
      recommendation: isReformBetter ? 'REFORMA' : 'SIMPLES',
      analysis: isReformBetter 
        ? "A migração para o Modelo Reforma é superior pois sua empresa possui uma cadeia de insumos robusta. No IVA Dual, esses custos geram créditos integrais de 26,5%."
        : "O Simples Nacional permanece mais vantajoso devido à sua baixa carga sobre a folha salarial.",
      decisionDrivers: ["Volume de Créditos", "Custo de Folha", "Eficiência Operacional", "Planejamento Tributário"],
      technicalDetails: "Cálculo baseado na alíquota de equilíbrio da PEC 45/2019.",
      ibsAmount: reformTotal * 0.65,
      cbsAmount: reformTotal * 0.35,
      creditsTaken: (data.monthlyPurchases + data.otherInputs) * 0.265,
      healthScore: 70,
      legalOptimizations: [
        { title: "Saneamento de Cadastro Fiscal", howToImplement: "Revisar NCMs para garantir alíquotas corretas no IVA.", benefitExpected: "EVITA BITRIBUTAÇÃO" },
        { title: "Gestão de Créditos de Insumos", howToImplement: "Formalizar todos os fornecedores para crédito de 26.5%.", benefitExpected: "REDUÇÃO DE CUSTO LÍQUIDO" }
      ],
      strategicRoadmap: [
        { title: "REPRICING ESTRATÉGICO", description: "Ajuste de margens para o IVA.", impactLevel: "ALTO", actions: generateFallbackActions("Preços") },
        { title: "OTIMIZAÇÃO DE COMPRAS", description: "Alinhamento de Supply Chain.", impactLevel: "MÉDIO", actions: generateFallbackActions("Suprimentos") },
        { title: "ADAPTAÇÃO DE TI", description: "Sistemas para IVA Dual.", impactLevel: "BAIXO", actions: generateFallbackActions("TI") }
      ]
    };
  }
};
