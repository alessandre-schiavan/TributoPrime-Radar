
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ChevronRight, Percent, TrendingUp, Settings2, HeartPulse, Target, ArrowUpRight, 
  Activity, Zap, Landmark, Award, BookOpen, CheckCircle2, Gavel, Info, BarChart3, Rocket, Clock, Gauge, ArrowRight, X
} from 'lucide-react';
import { calculateTaxComparison } from './services/geminiService';
import { TaxData, ComparisonResult, BusinessSector } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Mock de ações concretas para cada pilar do roteiro
const IMMEDIATE_ACTIONS_MAP: Record<number, string[]> = {
  0: [
    "Listar os 20 principais fornecedores por volume de compras anual.",
    "Solicitar declaração formal de enquadramento tributário (Simples vs. Lucro Real) de cada parceiro.",
    "Mapear quais insumos possuem regimes especiais que podem reduzir seu crédito (ex: ZFM ou Isenções).",
    "Calcular o 'Custo Real' comparando fornecedores informais vs. fornecedores que geram crédito pleno.",
    "Iniciar processo de homologação de fornecedores substitutos que garantam o repasse de 27,5% em créditos."
  ],
  1: [
    "Contatar o suporte do ERP para verificar o cronograma de atualização para o módulo de Split Payment.",
    "Mapear os fluxos de caixa atuais para identificar o momento exato da segregação do imposto.",
    "Configurar as novas regras de cálculo de IBS/CBS dentro do motor fiscal do software.",
    "Realizar testes de emissão de NF-e simulando a liquidação com retenção automática do tributo.",
    "Treinar a equipe financeira na conciliação de extratos bancários com valores líquidos recebidos."
  ],
  2: [
    "Auditar a precificação atual para isolar o 'imposto por dentro' (PIS/COFINS/ICMS/ISS).",
    "Recalcular o Markup de todos os SKUs considerando o abatimento dos créditos de insumos.",
    "Simular o preço de venda 'por fora' para clientes B2B (Líquido + 27,5% destacado).",
    "Ajustar a percepção de valor para clientes B2C, comunicando a transparência da carga tributária.",
    "Revisar contratos de fornecimento com gatilhos de reajuste baseados na variação da carga líquida."
  ]
};

const Header: React.FC = () => (
  <header className="bg-slate-900 text-white py-6 px-4 shadow-xl sticky top-0 z-50">
    <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <img 
          src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" 
          alt="TributoPrime Radar Logo" 
          className="w-12 h-12 rounded-lg object-cover shadow-lg border border-slate-700"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight">TributoPrime <span className="text-emerald-400">Radar</span></h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Inteligência em Transição Tributária</p>
        </div>
      </div>
      <nav className="flex gap-6 text-sm font-bold">
        <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Zap className="w-4 h-4"/> Análise</Link>
        <Link to="/sobre" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Landmark className="w-4 h-4"/> Base Legal</Link>
      </nav>
    </div>
  </header>
);

const TaxForm: React.FC<{ onCalculate: (data: TaxData) => void, loading: boolean }> = ({ onCalculate, loading }) => {
  const [isExpert, setIsExpert] = useState(true);
  const [formData, setFormData] = useState<TaxData>({
    monthlyRevenue: 208000,
    monthlyPurchases: 120000,
    payroll: 29852,
    otherInputs: 15000,
    accumulatedRevenue: 2500000,
    sector: BusinessSector.COMMERCE,
    simplesAnnex: 1,
    customSimplesRate: 10.81 
  });

  const annexes = [
    { value: 1, label: "Anexo I: Comércio", desc: "Venda de mercadorias em geral (Lojas, Varejo, Atacado, E-commerce)." },
    { value: 2, label: "Anexo II: Indústria", desc: "Empresas que industrializam produtos ou transformam matérias-primas." },
    { value: 3, label: "Anexo III: Serviços (Geral)", desc: "Locação, TI, academias, contabilidade, clínicas e maioria dos serviços." },
    { value: 4, label: "Anexo IV: Construção/Vigilância", desc: "Limpeza, obras e advocacia (Cálculo de INSS patronal fora da guia)." },
    { value: 5, label: "Anexo V: Serviços Intelectuais", desc: "Engenharia, auditoria e tecnologia (Sujeito ao Fator R)." }
  ];

  const currentAnnex = annexes.find(a => a.value === formData.simplesAnnex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-10 space-y-8 relative overflow-hidden">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">CONFIGURAÇÃO OPERACIONAL</h2>
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Ajuste os valores para obter exatidão no diagnóstico.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Receita Bruta Mensal</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="number"
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-emerald-500 outline-none font-bold text-slate-800"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({...formData, monthlyRevenue: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compras (Mercadorias/Insumos)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="number"
                required
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-emerald-500 outline-none font-bold text-slate-800"
                value={formData.monthlyPurchases}
                onChange={(e) => setFormData({...formData, monthlyPurchases: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => setIsExpert(!isExpert)}
          className="flex items-center gap-3 w-fit text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Settings2 className={`w-4 h-4 transition-transform ${isExpert ? 'rotate-180' : ''}`} />
          {isExpert ? 'Ocultar Detalhes Técnicos' : 'Personalizar Folha/Taxa'}
        </button>

        {isExpert && (
          <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 animate-in fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alíquota Efetiva (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                  value={formData.customSimplesRate}
                  onChange={(e) => setFormData({...formData, customSimplesRate: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outros Custos NF-e</label>
                <input
                  type="number"
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                  value={formData.otherInputs}
                  onChange={(e) => setFormData({...formData, otherInputs: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Folha Salarial (Total)</label>
                <input
                  type="number"
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                  value={formData.payroll}
                  onChange={(e) => setFormData({...formData, payroll: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Despesas Fixas</label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 outline-none font-bold"
                  onChange={(e) => setFormData({...formData, otherInputs: formData.otherInputs + Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setor</label>
            <select
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              value={formData.sector}
              onChange={(e) => setFormData({...formData, sector: e.target.value as BusinessSector})}
            >
              <option value={BusinessSector.COMMERCE}>Comércio</option>
              <option value={BusinessSector.SERVICES}>Serviços</option>
              <option value={BusinessSector.INDUSTRY}>Indústria</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enquadramento</label>
            <select
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-emerald-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              value={formData.simplesAnnex}
              onChange={(e) => setFormData({...formData, simplesAnnex: Number(e.target.value)})}
            >
              {annexes.map(annex => (
                <option key={annex.value} value={annex.value}>{annex.label}</option>
              ))}
            </select>
          </div>
        </div>

        {currentAnnex && (
          <div className="flex items-start gap-4 p-5 bg-blue-50/70 border border-blue-100 rounded-[1.8rem]">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em]">Definição Legal do Anexo</p>
              <p className="text-[12px] text-blue-700 font-bold leading-relaxed">{currentAnnex.desc}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? <div className="w-5 h-5 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <>PROCESSAR DIAGNÓSTICO <ChevronRight className="w-5 h-5" /></>}
        </button>
      </form>
    </div>
  );
};

const ActionsModal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, actions: string[] }> = ({ isOpen, onClose, title, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[4rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-12 text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
               <Zap size={24} className="text-emerald-400" />
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Plano de Execução</p>
            </div>
            <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{title}</h4>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors relative z-10">
            <X size={24} />
          </button>
          <Landmark size={200} className="absolute -right-20 -bottom-20 opacity-10 rotate-12" />
        </div>
        <div className="p-16 space-y-10">
          <p className="text-xl text-slate-500 font-bold leading-relaxed">
            Implemente estas 5 ações diretas e concretas para garantir que sua transição entregue a economia projetada:
          </p>
          <div className="grid grid-cols-1 gap-4">
            {actions.map((action, i) => (
              <div key={i} className="flex items-start gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black text-lg shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                  {i + 1}
                </div>
                <p className="text-lg text-slate-800 font-bold leading-snug pt-1">
                  {action}
                </p>
              </div>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
          >
            ENTENDI, VOU EXECUTAR
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportView: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const isSimplesBetter = result.recommendation === 'SIMPLES';
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const projectionData = Array.from({ length: 5 }, (_, i) => ({
    name: `Ano ${i + 1}`,
    acumulado: result.annualSavings * (i + 1)
  }));

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* 1. Veredito Estratégico */}
      <div className={`p-14 md:p-16 rounded-[4.5rem] border-2 shadow-2xl relative overflow-hidden transition-all ${isSimplesBetter ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className={`p-10 rounded-[3.5rem] shadow-xl bg-white ${isSimplesBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isSimplesBetter ? <ShieldCheck size={64} /> : <AlertTriangle size={64} />}
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className={`text-[11px] font-black uppercase px-6 py-2 rounded-full tracking-widest inline-block ${isSimplesBetter ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
              RECOMENDAÇÃO DE ENQUADRAMENTO
            </span>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase">
              {isSimplesBetter ? 'Manter Simples Nacional' : 'Migrar para Modelo Reforma'}
            </h3>
            <p className="text-2xl text-slate-700 font-bold leading-tight italic">"{result.analysis}"</p>
          </div>
        </div>
      </div>

      {/* 2. Estrutura da Carga Tributária (Full Width) */}
      <div className="bg-white p-14 md:p-16 rounded-[4.5rem] shadow-2xl border border-slate-100 flex flex-col gap-10 group">
        <h4 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
          <Percent className="text-emerald-500 w-8 h-8" />
          ESTRUTURA DA CARGA TRIBUTÁRIA COMPARATIVA
        </h4>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="p-12 bg-[#0f172a] rounded-[3.5rem] text-white flex flex-col items-center justify-center text-center gap-4 flex-1 shadow-lg group-hover:scale-[1.01] transition-transform">
            <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.3em]">Simples Nacional</p>
            <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{result.effectiveRateSimples.toFixed(2)}<span className="text-3xl text-slate-500 ml-2">%</span></p>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Alíquota Efetiva Real</p>
          </div>
          <div className="p-12 bg-emerald-600 rounded-[3.5rem] text-white flex flex-col items-center justify-center text-center gap-4 flex-1 shadow-lg group-hover:scale-[1.01] transition-transform">
            <p className="text-[14px] font-black text-emerald-100 uppercase tracking-[0.3em]">Reforma (IBS/CBS)</p>
            <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{result.effectiveRateReform.toFixed(2)}<span className="text-3xl text-emerald-200 ml-2">%</span></p>
            <p className="text-[12px] font-bold text-emerald-100 uppercase tracking-widest">Líquido Estimado c/ Créditos</p>
          </div>
        </div>
      </div>

      {/* 3. Manual de Otimização Legal */}
      <div className="bg-slate-900 text-white p-16 rounded-[5rem] shadow-2xl">
        <div className="flex items-center gap-8 mb-16">
          <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-lg">
            <Gavel size={40} className="text-slate-900" />
          </div>
          <div className="space-y-1 text-left">
            <h4 className="text-3xl font-black uppercase tracking-tighter">OTIMIZAÇÃO LEGAL</h4>
            <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em]">Maximizando o Fluxo de Créditos Fiscais</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="space-y-4">
              <h5 className="text-xl font-black uppercase border-l-4 border-emerald-500 pl-6">Créditos de Valor Adicionado</h5>
              <p className="text-lg text-slate-300 leading-relaxed font-medium">
                No novo modelo, sua lucratividade depende diretamente da sua rede de fornecedores. Cada real em compras PJ formalizadas recupera imposto, barateando seu custo operacional.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-[3rem] border border-slate-700 italic text-emerald-100 font-bold text-lg leading-snug">
              "{result.technicalDetails}"
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {result.legalOptimizations?.map((tip, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex items-start gap-6 hover:bg-white/10 transition-all">
                <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />
                <div className="space-y-3">
                  <h6 className="text-xl font-black uppercase tracking-tight">{tip.title}</h6>
                  <p className="text-slate-400 font-medium leading-snug">{tip.howToImplement}</p>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Impacto: {tip.benefitExpected}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Roteiro Estratégico (3 Caixas Horizontais Distintas - Clicáveis) */}
      <div className="bg-white p-16 md:p-20 rounded-[5rem] shadow-2xl border border-slate-100 space-y-16">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-slate-100 rounded-[3rem] flex items-center justify-center">
            <Target size={48} className="text-emerald-600" />
          </div>
          <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">ROTEIRO DE EXPANSÃO ESTRATÉGICA</h4>
        </div>

        <div className="space-y-10">
          {result.strategicRoadmap?.slice(0, 3).map((point, i) => (
            <div 
              key={i} 
              onClick={() => setActiveModal(i)}
              className="bg-slate-50 p-12 md:p-14 rounded-[4.5rem] border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all duration-700 shadow-sm hover:shadow-2xl flex flex-col md:flex-row items-center gap-12 group cursor-pointer"
            >
              {/* Ícone e Impacto */}
              <div className="flex flex-col items-center gap-6 md:w-56 shrink-0">
                 <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    {i === 0 ? <Rocket size={44} /> : i === 1 ? <Gauge size={44} /> : <Clock size={44} />}
                 </div>
                 <span className={`text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-sm ${
                  point.impactLevel === 'ALTO' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {point.impactLevel} IMPACTO
                </span>
              </div>
              
              {/* Informações Úteis e Descrição */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <h5 className="text-[2.2rem] font-black text-slate-900 leading-[1.05] uppercase tracking-tighter">
                    {point.title}
                  </h5>
                  <div className="px-4 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0">
                    EFEITO RÁPIDO
                  </div>
                </div>
                <div className="text-xl text-slate-600 font-bold leading-relaxed italic border-t border-slate-200 pt-6">
                  {point.description}
                </div>
              </div>

              {/* Box de Ação Sugerida - Gatilho da Modal */}
              <div className="md:w-72 shrink-0 p-10 bg-slate-900 rounded-[3.5rem] text-white flex flex-col items-center justify-center text-center gap-4 shadow-xl group-hover:bg-emerald-600 transition-colors">
                 <Zap className="w-10 h-10 text-emerald-400 group-hover:text-white" />
                 <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 group-hover:text-emerald-100">Próximo Passo</p>
                 <div className="flex items-center gap-2 text-sm font-black uppercase group/btn">
                   Ações Imediatas <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Capital Acumulado (Último Bloco da Página - Gráfico Maior e Visível) */}
      <div className="bg-white p-16 md:p-20 rounded-[5rem] shadow-2xl border border-slate-100 space-y-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-emerald-500 rounded-[3rem] flex items-center justify-center text-slate-900 shadow-2xl shadow-emerald-200/50">
              <BarChart3 size={48} />
            </div>
            <div>
              <h4 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">CAPITAL ACUMULADO PROJETADO</h4>
              <p className="text-slate-500 font-bold uppercase text-[12px] tracking-widest">Visão consolidada da economia no fluxo de caixa (5 anos)</p>
            </div>
          </div>
          <div className="flex items-baseline gap-5 bg-slate-900 px-12 py-10 rounded-[3.5rem] text-white shadow-2xl">
            <div className="flex flex-col text-left">
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">TOTAL EXTRA (60 MESES):</p>
               <p className="text-5xl font-black tracking-tighter leading-none">{formatBRL(result.annualSavings * 5)}</p>
            </div>
          </div>
        </div>

        {/* Gráfico Final Grande */}
        <div className="h-[650px] w-full bg-slate-50 rounded-[4.5rem] p-12 md:p-20 border border-slate-100 shadow-inner relative overflow-hidden">
           <div className="absolute top-12 left-12 flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-white/90 px-8 py-3 rounded-full border border-slate-200 backdrop-blur-sm z-10 shadow-sm">
             <TrendingUp size={16} className="text-emerald-500" /> Curva de Crescimento Tributário-Financeiro
           </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorLarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="#cbd5e1" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 18, fontWeight: 900, fill: '#1e293b'}} dy={40} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 14, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `R$ ${v/1000}k`} dx={-15} />
              <Tooltip 
                contentStyle={{ borderRadius: '40px', border: 'none', boxShadow: '0 60px 120px -30px rgba(0,0,0,0.3)', padding: '32px', backgroundColor: '#fff' }}
                labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', marginBottom: '10px', color: '#94a3b8', fontSize: '14px' }}
                itemStyle={{ fontWeight: 'black', color: '#0f172a', fontSize: '24px' }}
                formatter={(v) => [formatBRL(v as number), 'Capital Acumulado']} 
              />
              <Area type="monotone" dataKey="acumulado" stroke="#10b981" strokeWidth={15} fillOpacity={1} fill="url(#colorLarge)" dot={{ r: 22, fill: '#10b981', strokeWidth: 12, stroke: '#fff' }} activeDot={{ r: 28, fill: '#10b981' }} animationDuration={4000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Valores Visíveis Ano a Ano */}
        <div className="flex flex-col md:flex-row gap-8">
          {projectionData.map((d, i) => (
            <div key={i} className="bg-slate-900 p-12 rounded-[3.5rem] flex-1 flex flex-col items-center justify-center text-center gap-4 hover:bg-emerald-600 transition-all group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-white group-hover:scale-150 transition-transform">
                <BarChart3 size={100} />
              </div>
              <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest mb-2 group-hover:text-white">{d.name}</span>
              <p className="text-3xl font-black text-white tracking-tighter leading-none">{formatBRL(d.acumulado)}</p>
              <div className="px-5 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mt-2 border border-emerald-500/30 group-hover:bg-white group-hover:text-emerald-600 group-hover:border-white">
                Capital Consolidado
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Ações Imediatas */}
      {activeModal !== null && (
        <ActionsModal 
          isOpen={activeModal !== null} 
          onClose={() => setActiveModal(null)}
          title={result.strategicRoadmap?.[activeModal]?.title || "Plano de Ação"}
          actions={IMMEDIATE_ACTIONS_MAP[activeModal] || []}
        />
      )}
    </div>
  );
};

const SimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCalculate = async (data: TaxData) => {
    setLoading(true);
    try {
      const res = await calculateTaxComparison(data);
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1800px] mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-12 no-print">
          {/* Banner Principal Restaurado com Enquadramento de Texto Ajustado */}
          <section className="bg-emerald-600 text-white p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 space-y-8 max-w-[85%]">
              <h2 className="text-6xl font-black leading-[0.85] tracking-tighter uppercase italic drop-shadow-lg">
                A REFORMA <br/>NÃO ESPERA.
              </h2>
              <p className="text-2xl text-emerald-50 font-bold leading-tight max-w-sm">
                Empresas do Simples Nacional correm o risco de perder competitividade. Simule agora e descubra seu novo equilíbrio fiscal.
              </p>
              <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.3em] bg-slate-900/30 px-8 py-4 rounded-full border border-emerald-400/30 backdrop-blur-xl w-fit">
                <Award className="w-6 h-6" /> PEC 45/2019 • ATUALIZADO 2025
              </div>
            </div>
            <Landmark size={400} className="absolute -right-24 -bottom-24 opacity-10 group-hover:rotate-6 transition-transform duration-1000 pointer-events-none" />
          </section>
          
          <TaxForm onCalculate={handleCalculate} loading={loading} />
        </div>

        <div className="lg:col-span-8">
          {result ? <ReportView result={result} /> : (
            <div className="h-full min-h-[850px] flex flex-col items-center justify-center text-center p-24 border-8 border-dashed border-slate-200 rounded-[5.5rem] bg-white/40 backdrop-blur-xl relative shadow-inner group">
               <div className="bg-slate-900 p-14 rounded-[3.5rem] shadow-2xl mb-12 animate-pulse group-hover:scale-110 transition-transform">
                <BookOpen size={96} className="text-emerald-400" />
              </div>
              <h3 className="text-5xl font-black text-slate-800 tracking-tighter uppercase mb-6">Diagnóstico Pronto para Gerar</h3>
              <p className="text-2xl text-slate-500 max-w-2xl font-bold leading-snug">
                Insira as variáveis fiscais à esquerda para que nossa Inteligência de Auditoria Financeira calcule sua exata economia acumulada.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const AboutPage: React.FC = () => (
  <main className="max-w-[1400px] mx-auto px-6 py-32 space-y-24">
    <div className="text-center space-y-8">
      <span className="text-sm font-black text-emerald-600 uppercase tracking-[0.5em] bg-emerald-50 px-12 py-4 rounded-full shadow-inner">Guia Técnico e Base Legal</span>
      <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">ESTRATÉGIA FISCAL</h1>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      <div className="bg-white p-16 rounded-[4.5rem] shadow-2xl border border-slate-100 space-y-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">O CONCEITO DO IVA DUAL</h2>
        <p className="text-xl text-slate-600 font-medium leading-relaxed">
          A unificação do PIS, COFINS, IPI, ICMS e ISS mudará como o Simples Nacional opera. No novo modelo, a economia não vem apenas da alíquota, mas da capacidade de recuperar 27,5% em créditos sobre todos os insumos.
        </p>
      </div>
      <div className="bg-slate-900 text-white p-16 rounded-[4.5rem] shadow-2xl space-y-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-emerald-400">VISÃO DE FUTURO</h2>
        <p className="text-xl text-slate-300 font-medium leading-relaxed">
          Sua competitividade comercial depende da formalização total da cadeia. Compras de fornecedores informais encarecerão seu produto, pois você perderá o direito ao crédito fiscal pleno.
        </p>
      </div>
    </div>
  </main>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<SimulatorPage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>
        </div>
        <footer className="bg-white border-t border-slate-200 py-32 mt-20 no-print">
          <div className="max-w-[1800px] mx-auto px-10 text-center space-y-12">
            <div className="flex justify-center">
              <img 
                src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" 
                alt="Logo Footer" 
                className="w-20 h-20 grayscale opacity-40 hover:grayscale-0 transition-all cursor-pointer"
              />
            </div>
            <p className="text-slate-400 text-sm font-black uppercase tracking-[0.8em]">TRIBUTOPRIME RADAR &copy; 2025</p>
            <p className="text-[13px] text-slate-400 max-w-4xl mx-auto leading-relaxed font-bold italic uppercase tracking-widest">
              SIMULADOR ESTRATÉGICO ALIMENTADO PELA PEC 45/2019. TODOS OS CÁLCULOS TÊM CARÁTER CONSULTIVO. NÃO SUBSTITUEM O PARECER FORMAL DE UM PLANEJADOR TRIBUTÁRIO REGISTRADO.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
