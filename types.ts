
export enum BusinessSector {
  COMMERCE = 'Comércio',
  SERVICES = 'Serviços',
  INDUSTRY = 'Indústria'
}

export interface TaxData {
  monthlyRevenue: number;
  monthlyPurchases: number;
  payroll: number;
  otherInputs: number;
  accumulatedRevenue: number;
  sector: BusinessSector;
  simplesAnnex: number; 
  customSimplesRate?: number; // Alíquota efetiva personalizada pelo usuário
}

export interface B2BSensitivity {
  scenario: string;
  simplesStrategicImpact: string;
  reformStrategicImpact: string;
  bestChoice: string;
}

export interface StrategicPoint {
  title: string;
  description: string;
  impactLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
}

export interface ComparisonResult {
  monthlyRevenue: number;
  simplesTotal: number;
  reformTotal: number;
  savings: number;
  annualSavings: number;
  recommendation: 'SIMPLES' | 'REFORMA';
  analysis: string;
  ibsAmount: number;
  cbsAmount: number;
  creditsTaken: number;
  effectiveRateSimples: number;
  effectiveRateReform: number;
  b2bAnalysis: B2BSensitivity[];
  strategicRoadmap: StrategicPoint[];
  healthScore: number; 
}
