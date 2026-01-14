
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
  customSimplesRate?: number;
}

export interface StrategicPoint {
  title: string;
  description: string;
  impactLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
}

export interface LegalOptimization {
  title: string;
  howToImplement: string;
  benefitExpected: string;
}

export interface ComparisonResult {
  monthlyRevenue: number;
  simplesTotal: number;
  reformTotal: number;
  savings: number;
  annualSavings: number;
  recommendation: 'SIMPLES' | 'REFORMA';
  analysis: string;
  technicalDetails: string; // Novo campo para detalhamento técnico
  ibsAmount: number;
  cbsAmount: number;
  creditsTaken: number;
  effectiveRateSimples: number;
  effectiveRateReform: number;
  strategicRoadmap: StrategicPoint[];
  legalOptimizations: LegalOptimization[]; // Novo campo para dicas de elisão fiscal
  healthScore: number; 
  sector: BusinessSector;
}
