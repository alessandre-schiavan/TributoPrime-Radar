
import { TaxData, ComparisonResult, BusinessSector } from "../types";

/**
 * SERVIÇO DE CONSULTORIA FISCAL VIA POLLINATIONS AI
 * Este serviço utiliza IA para gerar um parecer técnico baseado na Reforma Tributária.
 * A sanitização é crítica para evitar erros de renderização no React (toFixed).
 */
export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const prompt = `
    Aja como um Auditor Fiscal e Consultor Tributário Sênior. Sua missão é entregar um parecer técnico de ALTA DENSIDADE, OBJETIVO e ROBUSTO para uma empresa do setor de ${data.sector}.

    DADOS OPERACIONAIS PARA CÁLCULO:
    - Receita Bruta Mensal: R$ ${data.monthlyRevenue}
    - Compras/Insumos: R$ ${data.monthlyPurchases}
    - Folha de Pagamento: R$ ${data.payroll}
    - Custos Fixos Creditáveis (Aluguel PJ, Energia, etc): R$ ${data.otherInputs}
    - Alíquota Simples Nacional Atual: ${data.customSimplesRate}%

    REQUISITOS DA ANÁLISE:
    1. Calcule o volume de créditos (27,5% sobre compras e insumos) e como eles abatem o débito bruto.
    2. O tom deve ser profissional: "Como Auditor Fiscal e Consultor, analiso que..."
    3. Retorne APENAS o JSON puro. Sem markdown, sem introduções.

    ESTRUTURA JSON OBRIGATÓRIA (TODOS OS CAMPOS NUMÉRICOS DEVEM SER NÚMEROS):
    {
      "monthlyRevenue": ${data.monthlyRevenue},
      "simplesTotal": number,
      "reformTotal": number,
      "savings": number,
      "annualSavings": number,
      "recommendation": "SIMPLES" | "REFORMA",
      "analysis": "Parecer técnico detalhado",
      "technicalDetails": "Detalhamento de IBS (17.7%) e CBS (8.8%)",
      "ibsAmount": number,
      "cbsAmount": number,
      "creditsTaken": number,
      "effectiveRateSimples": ${data.customSimplesRate},
      "effectiveRateReform": number,
      "healthScore": number,
      "legalOptimizations": [{"title": "string", "howToImplement": "string", "benefitExpected": "string"}],
      "strategicRoadmap": [{"title": "string", "description": "string", "impactLevel": "ALTO" | "MÉDIO" | "BAIXO"}]
    }
  `;

  try {
    // Chamada para Pollinations AI (Não requer API Key do Google)
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Você é um Auditor Fiscal especialista em Reforma Tributária. Você responde exclusivamente em JSON puro e válido.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        jsonMode: true
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const textResponse = await response.text();
    
    // Extração robusta do JSON (remove markdown se houver)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
    
    const parsed = JSON.parse(jsonStr);

    /**
     * SANITIZAÇÃO DE DADOS (CRÍTICO)
     * Garante que mesmo que a IA falhe em algum campo, o app não quebre (white screen).
     */
    const result: ComparisonResult = {
      monthlyRevenue: Number(parsed.monthlyRevenue || data.monthlyRevenue || 0),
      simplesTotal: Number(parsed.simplesTotal || (data.monthlyRevenue * ((data.customSimplesRate || 0) / 100)) || 0),
      reformTotal: Number(parsed.reformTotal || 0),
      savings: Number(parsed.savings || 0),
      annualSavings: Number(parsed.annualSavings || 0),
      recommendation: String(parsed.recommendation || 'SIMPLES') === 'REFORMA' ? 'REFORMA' : 'SIMPLES',
      analysis: String(parsed.analysis || "Análise técnica gerada com sucesso."),
      technicalDetails: String(parsed.technicalDetails || "Cálculo baseado na alíquota padrão estimada de 27,5%."),
      ibsAmount: Number(parsed.ibsAmount || 0),
      cbsAmount: Number(parsed.cbsAmount || 0),
      creditsTaken: Number(parsed.creditsTaken || 0),
      effectiveRateSimples: Number(parsed.effectiveRateSimples || data.customSimplesRate || 0),
      effectiveRateReform: Number(parsed.effectiveRateReform || 0),
      healthScore: Number(parsed.healthScore || 80),
      sector: data.sector,
      strategicRoadmap: Array.isArray(parsed.strategicRoadmap) ? parsed.strategicRoadmap : [],
      legalOptimizations: Array.isArray(parsed.legalOptimizations) ? parsed.legalOptimizations : []
    };

    return result;
  } catch (error) {
    console.error("Erro na consultoria técnica via Pollinations:", error);
    
    // FALLBACK MATEMÁTICO DE SEGURANÇA (Evita tela branca se a IA falhar)
    const sRate = (data.customSimplesRate || 10.81) / 100;
    const standardRate = 0.275;
    const simplesTotal = data.monthlyRevenue * sRate;
    
    const taxableInputs = data.monthlyPurchases + data.otherInputs;
    const credits = taxableInputs * standardRate;
    const grossReform = data.monthlyRevenue * standardRate;
    const reformTotal = Math.max(0, grossReform - credits);
    
    const isReformaBetter = reformTotal < simplesTotal;
    const savings = Math.abs(simplesTotal - reformTotal);
    const effReform = (reformTotal / (data.monthlyRevenue || 1)) * 100;

    return {
      monthlyRevenue: data.monthlyRevenue,
      sector: data.sector,
      simplesTotal,
      reformTotal,
      savings,
      annualSavings: savings * 12,
      effectiveRateSimples: sRate * 100,
      effectiveRateReform: effReform,
      healthScore: 85,
      recommendation: isReformaBetter ? 'REFORMA' : 'SIMPLES',
      analysis: `Como Auditor Fiscal e Consultor, analiso que a estrutura de custos da sua empresa apresenta um cenário onde a ${isReformaBetter ? 'migração para o regime de IVA Dual supera a eficiência do Simples' : 'permanência no Simples ainda se mostra superior'}. (Nota: Resultado gerado via motor de segurança devido a instabilidade na rede).`,
      technicalDetails: `Análise técnica offline: Créditos de R$ ${credits.toLocaleString()} apurados sobre insumos de R$ ${taxableInputs.toLocaleString()}.`,
      ibsAmount: reformTotal * 0.64,
      cbsAmount: reformTotal * 0.36,
      creditsTaken: credits,
      legalOptimizations: [],
      strategicRoadmap: []
    };
  }
};
