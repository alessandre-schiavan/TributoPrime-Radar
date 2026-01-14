
import { GoogleGenAI } from "@google/genai";
import { TaxData, ComparisonResult, BusinessSector } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const prompt = `
    Aja como um Auditor Fiscal e Consultor Tributário Sênior especializado na PEC 45/2019 (Reforma Tributária). 
    Sua missão é entregar um parecer técnico de ALTA DENSIDADE para uma empresa do setor de ${data.sector}.

    DADOS OPERACIONAIS:
    - Faturamento Mensal: R$ ${data.monthlyRevenue}
    - Compras/Insumos: R$ ${data.monthlyPurchases} (Geram crédito pleno de 27,5% no IBS/CBS)
    - Folha de Pagamento: R$ ${data.payroll} (Não gera crédito direto no modelo de valor adicionado)
    - Outros Custos Fixos (Energia, Aluguel PJ, Telecom): R$ ${data.otherInputs} (Geram crédito pleno)
    - Alíquota Efetiva Atual no Simples: ${data.customSimplesRate}%

    REQUISITOS DA ANÁLISE:
    1. EXATIDÃO MATEMÁTICA: Calcule o IBS/CBS usando a alíquota padrão de 27,5% sobre o faturamento, subtraindo integralmente os créditos sobre compras e custos operacionais.
    2. PARECER TÉCNICO ("analysis"): Explique a transição do modelo de "cumulatividade" para "não-cumulatividade plena". Compare o custo de oportunidade.
    3. DETALHAMENTO ("technicalDetails"): Descreva a decomposição do imposto (IBS vs CBS) e o impacto no preço de venda.
    4. OTIMIZAÇÃO LEGAL ("legalOptimizations"): Liste 3 estratégias de elisão fiscal (legal) para reduzir a carga, como homologação de fornecedores que dão crédito cheio e gestão de resíduos/insumos.
    5. ROTEIRO ("strategicRoadmap"): Ações práticas e densas com foco em governança fiscal.

    IMPORTANTE: O texto deve ser rico, profissional e encorajador, mostrando como a lei permite pagar menos se bem gerida.

    RETORNE EM JSON:
    {
      "monthlyRevenue": ${data.monthlyRevenue},
      "simplesTotal": number,
      "reformTotal": number,
      "savings": number,
      "annualSavings": number,
      "recommendation": "SIMPLES" | "REFORMA",
      "analysis": "texto longo",
      "technicalDetails": "detalhamento técnico dos tributos",
      "ibsAmount": number,
      "cbsAmount": number,
      "creditsTaken": number,
      "effectiveRateSimples": ${data.customSimplesRate},
      "effectiveRateReform": number,
      "healthScore": number,
      "legalOptimizations": [{"title": string, "howToImplement": string, "benefitExpected": string}],
      "strategicRoadmap": [{"title": string, "description": string, "impactLevel": "ALTO" | "MÉDIO" | "BAIXO"}]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return { ...result, sector: data.sector } as ComparisonResult;
  } catch (error) {
    console.error("Erro na consultoria técnica:", error);
    // Fallback estruturado se a IA falhar
    const sRate = (data.customSimplesRate || 10.81) / 100;
    const rRate = 0.275;
    const simplesTotal = data.monthlyRevenue * sRate;
    const credits = (data.monthlyPurchases + data.otherInputs) * rRate;
    const reformTotal = (data.monthlyRevenue * rRate) - credits;
    const savings = Math.abs(simplesTotal - reformTotal);

    return {
      monthlyRevenue: data.monthlyRevenue,
      sector: data.sector,
      simplesTotal,
      reformTotal,
      savings,
      annualSavings: savings * 12,
      effectiveRateSimples: sRate * 100,
      effectiveRateReform: (reformTotal / data.monthlyRevenue) * 100,
      healthScore: 80,
      recommendation: simplesTotal < reformTotal ? 'SIMPLES' : 'REFORMA',
      analysis: `A análise demonstra que a transição para o IBS/CBS altera a dinâmica competitiva. No modelo atual (Simples), o imposto incide sobre a receita bruta sem direito a créditos significativos. Na Reforma, a não-cumulatividade permite que os créditos sobre insumos reduzam a carga final.`,
      technicalDetails: `O CBS (Federal) e o IBS (Subnacional) somam 27,5%. O diferencial está na apropriação de R$ ${credits.toLocaleString()} em créditos mensais.`,
      ibsAmount: reformTotal * 0.6,
      cbsAmount: reformTotal * 0.4,
      creditsTaken: credits,
      legalOptimizations: [
        { title: "Gestão de Créditos de Insumos", howToImplement: "Certificar-se de que 100% dos fornecedores são emitentes de NF-e e estão em conformidade para repasse de crédito.", benefitExpected: "Redução direta de 27,5% no custo de aquisição tributária." }
      ],
      strategicRoadmap: [
        { title: "REVISÃO DA CADEIA DE SUPRIMENTOS", description: "Avaliar se fornecedores atuais permitem a recuperação total de créditos de IBS/CBS.", impactLevel: "ALTO" }
      ]
    };
  }
};
