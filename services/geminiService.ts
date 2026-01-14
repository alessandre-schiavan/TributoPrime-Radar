
import { TaxData, ComparisonResult, BusinessSector } from "../types";

export const calculateTaxComparison = async (data: TaxData): Promise<ComparisonResult> => {
  const prompt = `
    Aja como um Auditor Fiscal e Consultor Tributário Sênior. Sua missão é entregar um parecer técnico de ALTA DENSIDADE, OBJETIVO e ROBUSTO para uma empresa do setor de ${data.sector}.

    DADOS OPERACIONAIS:
    - Receita Bruta Mensal: R$ ${data.monthlyRevenue}
    - Compras/Insumos: R$ ${data.monthlyPurchases}
    - Folha de Pagamento: R$ ${data.payroll}
    - Custos Fixos Creditáveis (Aluguel PJ, Energia, etc): R$ ${data.otherInputs}
    - Alíquota Simples Atual: ${data.customSimplesRate}%

    REQUISITOS DA ANÁLISE:
    1. Seja matemático e direto. Use os valores de R$ informados.
    2. Calcule o volume de créditos (27,5% sobre compras e insumos) e como eles abatem o débito bruto.
    3. O tom deve ser profissional: "Como Auditor Fiscal e Consultor, analiso que..."
    4. IMPORTANTE: Retorne APENAS o JSON, sem textos explicativos fora do JSON.

    ESTRUTURA JSON OBRIGATÓRIA (VALORES NUMÉRICOS):
    {
      "monthlyRevenue": ${data.monthlyRevenue},
      "simplesTotal": number,
      "reformTotal": number,
      "savings": number,
      "annualSavings": number,
      "recommendation": "SIMPLES" | "REFORMA",
      "analysis": "Texto robusto",
      "technicalDetails": "Detalhamento técnico",
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
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Você é um consultor tributário especialista que responde exclusivamente em JSON puro e válido.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        jsonMode: true
      }),
    });

    const textResponse = await response.text();
    
    // Tenta extrair o JSON caso a IA envie markdown ou texto extra
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
    
    const parsed = JSON.parse(jsonStr);

    // Sanitização defensiva para garantir que nenhum campo numérico seja undefined/null
    // Isso evita o erro "toFixed of undefined" no componente React
    const sanitizedResult: ComparisonResult = {
      monthlyRevenue: Number(parsed.monthlyRevenue || data.monthlyRevenue || 0),
      simplesTotal: Number(parsed.simplesTotal || 0),
      reformTotal: Number(parsed.reformTotal || 0),
      savings: Number(parsed.savings || 0),
      annualSavings: Number(parsed.annualSavings || 0),
      recommendation: parsed.recommendation === 'SIMPLES' ? 'SIMPLES' : 'REFORMA',
      analysis: String(parsed.analysis || "Análise indisponível no momento."),
      technicalDetails: String(parsed.technicalDetails || "Detalhes técnicos não fornecidos."),
      ibsAmount: Number(parsed.ibsAmount || 0),
      cbsAmount: Number(parsed.cbsAmount || 0),
      creditsTaken: Number(parsed.creditsTaken || 0),
      effectiveRateSimples: Number(parsed.effectiveRateSimples || data.customSimplesRate || 0),
      effectiveRateReform: Number(parsed.effectiveRateReform || 0),
      healthScore: Number(parsed.healthScore || 0),
      sector: data.sector,
      strategicRoadmap: Array.isArray(parsed.strategicRoadmap) ? parsed.strategicRoadmap : [],
      legalOptimizations: Array.isArray(parsed.legalOptimizations) ? parsed.legalOptimizations : []
    };

    return sanitizedResult;
  } catch (error) {
    console.error("Erro na consultoria técnica via Pollinations:", error);
    
    // Fallback Matemático Robusto (Garante que a tela nunca fique branca)
    const sRate = (data.customSimplesRate || 10.81) / 100;
    const standardRate = 0.275;
    const simplesTotal = data.monthlyRevenue * sRate;
    
    const taxableInputs = data.monthlyPurchases + data.otherInputs;
    const credits = taxableInputs * standardRate;
    const grossReform = data.monthlyRevenue * standardRate;
    const reformTotal = grossReform - credits;
    
    const isReformaBetter = reformTotal < simplesTotal;
    const savings = Math.abs(simplesTotal - reformTotal);
    const effReform = (reformTotal / data.monthlyRevenue) * 100;

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
      analysis: `Como Auditor Fiscal e Consultor, analiso que a estrutura de custos da sua empresa apresenta um cenário onde a ${isReformaBetter ? 'migração para o regime de não-cumulatividade plena (IVA Dual) supera a eficiência do Simples Nacional' : 'permanência no Simples Nacional ainda se mostra matematicamente superior'}. No modelo atual, você é tributado sobre a receita bruta de R$ ${data.monthlyRevenue.toLocaleString()}. Com a PEC 45/2019, a lógica inverte-se para o Valor Adicionado. Dado que seus insumos creditáveis (R$ ${taxableInputs.toLocaleString()}) representam uma parcela relevante do faturamento, o volume de créditos gerados (R$ ${credits.toLocaleString()}) abate drasticamente o débito do imposto bruto.`,
      technicalDetails: `Decomposição Técnica: IBS (17.7%) e CBS (8.8%) totalizando 27,5%. Créditos totais apurados: R$ ${credits.toLocaleString()}.`,
      ibsAmount: reformTotal * 0.64,
      cbsAmount: reformTotal * 0.36,
      creditsTaken: credits,
      legalOptimizations: [
        { title: "Saneamento de Fornecedores", howToImplement: "Substituir fornecedores informais por parceiros que garantam o repasse de 27,5% em créditos de IBS/CBS.", benefitExpected: "Redução de custo líquido em 27,5% nas compras." },
        { title: "Segregação de Insumos", howToImplement: "Auditagem rigorosa de notas fiscais de serviços tomados para aproveitamento integral.", benefitExpected: "Aumento do fluxo de caixa via créditos financeiros." }
      ],
      strategicRoadmap: [
        { title: "AUDITORIA DA CADEIA", description: "Mapear quais fornecedores atuais estão no Simples Nacional e recalcular o markup removendo o 'custo oculto'.", impactLevel: "ALTO" },
        { title: "ADADEQUAÇÃO DO ERP", description: "Atualizar o sistema de faturamento para suportar o Split Payment e a tributação 'por fora'.", impactLevel: "ALTO" },
        { title: "REPRECIFICAÇÃO ESTRATÉGICA", description: "Recalcular preços considerando a desoneração dos insumos e o destaque do IBS/CBS na NF-e.", impactLevel: "MÉDIO" }
      ]
    };
  }
};
