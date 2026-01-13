
import { GoogleGenAI, Type } from "@google/genai";
import { TaxData, ComparisonResult, BusinessSector } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const prompt = `
    Aja como um Consultor Tributário Sênior de alto nível.
    Sua missão é entregar um diagnóstico de precisão cirúrgica comparando o Simples Nacional vs Reforma Tributária.
    
    DADOS DA EMPRESA:
    - Faturamento Mensal: R$ ${data.monthlyRevenue}
    - Faturamento Acumulado (12m): R$ ${data.accumulatedRevenue}
    - Compras/Insumos: R$ ${data.monthlyPurchases}
    - Folha de Pagamento: R$ ${data.payroll}
    - Outros Custos (Energia/Aluguel): R$ ${data.otherInputs}
    - Setor: ${data.sector}
    - Anexo Atual: ${data.simplesAnnex}
    - Alíquota Efetiva do Simples Informada: ${data.customSimplesRate || 'Calcular baseada no anexo'}%

    PARÂMETROS DA REFORMA (IBS/CBS):
    1. Alíquota Combinada: 27,5%.
    2. Créditos: 27,5% sobre Compras e Custos Operacionais.
    3. Simples Nacional: Se data.customSimplesRate for fornecido, use ele como base. Caso contrário, calcule a alíquota progressiva real.

    RETORNE APENAS UM JSON:
    {
      "monthlyRevenue": ${data.monthlyRevenue},
      "simplesTotal": number,
      "reformTotal": number,
      "savings": number,
      "annualSavings": number,
      "recommendation": "SIMPLES" | "REFORMA",
      "analysis": "Análise técnica executiva",
      "ibsAmount": number,
      "cbsAmount": number,
      "creditsTaken": number,
      "effectiveRateSimples": number,
      "effectiveRateReform": number,
      "healthScore": number,
      "b2bAnalysis": [...],
      "strategicRoadmap": [...]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    return JSON.parse(response.text || "{}") as ComparisonResult;
  } catch (error) {
    console.error("Erro na consultoria IA:", error);
    const usedSimplesRate = (data.customSimplesRate || 10) / 100;
    const totalCredits = data.monthlyPurchases + data.otherInputs;
    const reformRate = 0.275;
    const simplesTotal = data.monthlyRevenue * usedSimplesRate;
    const reformTotal = (data.monthlyRevenue * reformRate) - (totalCredits * reformRate);
    const savings = Math.abs(simplesTotal - reformTotal);
    
    return {
      monthlyRevenue: data.monthlyRevenue,
      simplesTotal,
      reformTotal,
      savings,
      annualSavings: savings * 12,
      effectiveRateSimples: usedSimplesRate * 100,
      effectiveRateReform: (reformTotal / data.monthlyRevenue) * 100,
      healthScore: 70,
      recommendation: simplesTotal < reformTotal ? 'SIMPLES' : 'REFORMA',
      analysis: "Análise realizada via motor de contingência. A alíquota informada foi determinante para o veredito.",
      ibsAmount: (data.monthlyRevenue * 0.185) - (totalCredits * 0.185),
      cbsAmount: (data.monthlyRevenue * 0.09) - (totalCredits * 0.09),
      creditsTaken: totalCredits * 0.275,
      b2bAnalysis: [],
      strategicRoadmap: []
    };
  }
};
