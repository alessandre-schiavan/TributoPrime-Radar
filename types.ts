
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

export interface StrategicAction {
  task: string;
  description: string;
  implementation: string;
}

export interface StrategicPoint {
  title: string;
  description: string;
  impactLevel: 'ALTO' | 'MÉDIO' | 'BAIXO';
  actions: StrategicAction[]; // Passos detalhados gerados pela IA
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
  decisionDrivers: string[]; // Pontos chave que levaram à decisão
  technicalDetails: string; 
  ibsAmount: number;
  cbsAmount: number;
  creditsTaken: number;
  effectiveRateSimples: number;
  effectiveRateReform: number;
  strategicRoadmap: StrategicPoint[];
  legalOptimizations: LegalOptimization[]; 
  healthScore: number; 
  sector: BusinessSector;
}
