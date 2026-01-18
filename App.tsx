
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ChevronRight, Percent, TrendingUp, Settings2, HeartPulse, Target, ArrowUpRight, 
  Activity, Zap, Landmark, Award, BookOpen, CheckCircle2, Gavel, Info, BarChart3, Rocket, Clock, Gauge, ArrowRight, X, PlayCircle, InfoIcon, LayoutList,
  Sparkles, Wallet, HandCoins, Microscope, Fingerprint, Lightbulb
} from 'lucide-react';
import { calculateTaxComparison } from './services/geminiService';
import { TaxData, ComparisonResult, BusinessSector, StrategicAction } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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
    monthlyPurchases: 140000,
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

const ActionsModal: React.FC<{ isOpen: boolean, onClose: () => void, title: string, actions: StrategicAction[] }> = ({ isOpen, onClose, title, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col">
        <div className="bg-slate-900 p-10 md:p-14 text-white flex justify-between items-center relative overflow-hidden shrink-0">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
               <Zap size={28} className="text-emerald-400" />
               <p className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-400">Guia de Execução Estratégica</p>
            </div>
            <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">{title}</h4>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-5 rounded-full transition-colors relative z-10">
            <X size={32} />
          </button>
          <p className="absolute -right-20 -bottom-20 text-[200px] text-white opacity-5 font-black uppercase -rotate-12 pointer-events-none">PLAN</p>
        </div>
        <div className="p-8 md:p-16 space-y-12 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
          <div className="flex items-center gap-4 text-slate-500">
            <LayoutList size={24} className="text-emerald-500" />
            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Plano de Ação Detalhado</p>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
            {actions.map((action, i) => (
              <div key={i} className="flex flex-col md:flex-row items-start gap-8 group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-slate-900 flex items-center justify-center text-emerald-400 font-black text-2xl shrink-0 shadow-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <h5 className="text-2xl font-black uppercase tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {action.task}
                    </h5>
                    <div className="flex items-start gap-3 bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                      <InfoIcon size={20} className="text-slate-400 mt-1 shrink-0" />
                      <p className="text-lg text-slate-600 font-bold leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <PlayCircle size={20} className="text-emerald-600" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Como Executar:</span>
                    </div>
                    <p className="text-lg text-slate-800 font-black leading-snug">
                      {action.implementation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-10 bg-white border-t border-slate-200 shrink-0 text-center">
          <button 
            onClick={onClose}
            className="w-full max-w-md bg-emerald-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95"
          >
            CONFIRMAR IMPLEMENTAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportView: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const isActuallySimplesBetter = result.recommendation === 'SIMPLES';
  const [activeModal, setActiveModal] = useState<number | null>(null);

  const projectionData = Array.from({ length: 5 }, (_, i) => ({
    name: `Ano ${i + 1}`,
    acumulado: result.annualSavings * (i + 1)
  }));

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 overflow-visible">
      {/* 1. Veredito Estratégico */}
      <div className={`p-8 md:p-14 rounded-[4rem] border-2 shadow-2xl relative overflow-hidden transition-all ${isActuallySimplesBetter ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className={`p-10 rounded-[3rem] shadow-2xl bg-white shrink-0 ${isActuallySimplesBetter ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isActuallySimplesBetter ? <ShieldCheck size={64} /> : <AlertTriangle size={64} />}
            </div>
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                 <span className={`text-[12px] font-black uppercase px-8 py-3 rounded-full tracking-[0.3em] inline-block shadow-sm ${isActuallySimplesBetter ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  DIAGNÓSTICO FINAL DE ENQUADRAMENTO
                </span>
                <h3 className="text-5xl md:text-6xl font-black text-slate-900 leading-none uppercase tracking-tighter">
                  {isActuallySimplesBetter ? 'MANTER SIMPLES NACIONAL' : 'MIGRAR PARA MODELO REFORMA'}
                </h3>
              </div>
              <div className="bg-white/50 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/80 shadow-inner">
                 <div className="flex items-center gap-4 mb-6">
                    <Lightbulb size={28} className={isActuallySimplesBetter ? 'text-emerald-600' : 'text-rose-600'} />
                    <p className="text-2xl text-slate-900 font-black uppercase tracking-tighter italic">
                      "Por que esta é a melhor escolha estratégica?"
                    </p>
                 </div>
                 <p className="text-xl text-slate-700 font-bold leading-relaxed">
                   {result.analysis}
                 </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {result.decisionDrivers?.map((driver, i) => (
              <div key={i} className="bg-white/40 p-6 rounded-[2rem] border border-white/60 flex items-center gap-6 shadow-sm hover:bg-white/60 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isActuallySimplesBetter ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  <Fingerprint size={24} />
                </div>
                <p className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tight">
                  {driver}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Sparkles size={500} className={`absolute -right-40 -bottom-40 opacity-5 rotate-12 ${isActuallySimplesBetter ? 'text-emerald-600' : 'text-rose-600'}`} />
      </div>

      {/* 2. Carga Tributária Comparativa */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-8 group">
        <h4 className="text-xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
          <Percent className="text-emerald-500 w-6 h-6" />
          ESTRUTURA DA CARGA TRIBUTÁRIA
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-[#0f172a] rounded-[2.5rem] text-white flex flex-col items-center justify-center text-center gap-3 shadow-lg group-hover:scale-[1.01] transition-transform">
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Simples Nacional</p>
            <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{result.effectiveRateSimples.toFixed(2)}<span className="text-2xl text-slate-500 ml-1">%</span></p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alíquota Efetiva Real</p>
          </div>
          <div className="p-8 bg-emerald-600 rounded-[2.5rem] text-white flex flex-col items-center justify-center text-center gap-3 shadow-lg group-hover:scale-[1.01] transition-transform">
            <p className="text-[12px] font-black text-emerald-100 uppercase tracking-[0.2em]">Reforma (IBS/CBS)</p>
            <p className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{result.effectiveRateReform.toFixed(2)}<span className="text-2xl text-emerald-200 ml-1">%</span></p>
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Líquido Estimado c/ Créditos</p>
          </div>
        </div>
      </div>

      {/* 3. Otimização Legal e Performance */}
      <div className="bg-[#0f172a] text-white p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 shrink-0">
              <Gavel size={42} className="text-slate-900" />
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black uppercase tracking-tighter">OTIMIZAÇÃO LEGAL E PERFORMANCE</h4>
              <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.5em]">MAXIMIZACIÓN DE FLUXO FINANCEIRO E TRIBUTÁRIO</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Lado Esquerdo: Créditos e Resumo */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Microscope size={28} className="text-emerald-500" />
                    </div>
                    <h5 className="text-2xl font-black uppercase text-emerald-500 tracking-tight leading-none">CRÉDITOS DE VALOR ADICIONADO</h5>
                 </div>
                <p className="text-xl text-slate-200 leading-relaxed font-bold">
                  Sua performance financeira futura depende da "limpeza" da sua cadeia. Cada real gasto em compras PJ formalizadas torna-se um ativo tributário líquido.
                </p>
              </div>
              
              <div className="p-10 bg-slate-800/40 rounded-[3.5rem] border-2 border-dashed border-slate-700/60 relative overflow-hidden shadow-inner w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-center">RESUMO TÉCNICO</p>
                <p className="text-lg text-emerald-100 font-black leading-relaxed italic text-center mb-10 px-4">
                  "{result.technicalDetails}"
                </p>
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-2 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IBS EST.</p>
                      <p className="text-xl font-black text-white">{formatBRL(result.ibsAmount)}</p>
                   </div>
                   <div className="space-y-2 flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CBS EST.</p>
                      <p className="text-xl font-black text-white">{formatBRL(result.cbsAmount)}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Lado Direito: Cards de Otimização - Ajuste de enquadramento para evitar transbordo */}
            <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
              {result.legalOptimizations?.map((tip, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/40 p-8 md:p-10 rounded-[3rem] flex flex-col sm:flex-row items-start gap-8 hover:bg-slate-800/50 transition-all group relative overflow-hidden shadow-xl min-w-0">
                  <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-500">
                    <CheckCircle2 size={32} className="text-emerald-400 group-hover:text-white" />
                  </div>
                  <div className="space-y-4 flex-1 min-w-0 overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      {/* Font size reduced to xl for better fit */}
                      <h6 className="text-xl font-black uppercase tracking-tight text-white break-words leading-tight">{tip.title}</h6>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/30 shrink-0 self-start">ALTO IMPACTO</span>
                    </div>
                    <p className="text-lg text-slate-300 font-bold leading-relaxed break-words">{tip.howToImplement}</p>
                    <div className="flex items-center gap-3 pt-2 text-emerald-400 bg-emerald-400/5 w-fit px-5 py-2 rounded-full border border-emerald-400/10">
                       <TrendingUp size={20} />
                       <p className="text-[12px] font-black uppercase tracking-[0.2em]">{tip.benefitExpected}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Landmark size={600} className="absolute -left-40 -bottom-40 opacity-5 -rotate-6 pointer-events-none" />
      </div>

      {/* 4. Roteiro Estratégico */}
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100 space-y-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2.2rem] flex items-center justify-center shadow-lg shrink-0">
            <Target size={40} className="text-emerald-600" />
          </div>
          <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">ROTEIRO ESTRATÉGICO</h4>
        </div>

        <div className="space-y-8">
          {result.strategicRoadmap?.sort((a,b) => {
            const order: Record<string, number> = { 'ALTO': 1, 'MÉDIO': 2, 'BAIXO': 3 };
            return (order[a.impactLevel] || 99) - (order[b.impactLevel] || 99);
          }).map((point, i) => (
            <div 
              key={i} 
              onClick={() => setActiveModal(i)}
              className="bg-slate-50/50 p-8 md:p-10 rounded-[3.5rem] border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all duration-700 shadow-sm hover:shadow-2xl flex flex-col lg:flex-row items-center gap-10 group cursor-pointer"
            >
              <div className="flex flex-col items-center gap-5 shrink-0 lg:w-48">
                 <div className="w-24 h-24 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-500">
                    {point.impactLevel === 'ALTO' ? <Rocket size={44} /> : point.impactLevel === 'MÉDIO' ? <Gauge size={44} /> : <Clock size={44} />}
                 </div>
                 <span className={`text-[11px] font-black px-8 py-2 rounded-full uppercase tracking-widest shadow-md ${
                  point.impactLevel === 'ALTO' ? 'bg-rose-600 text-white' : point.impactLevel === 'MÉDIO' ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'
                }`}>
                  {point.impactLevel}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <h5 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight border-b-2 border-slate-200 pb-4 group-hover:border-emerald-200 transition-colors duration-500">
                  {point.title}
                </h5>
                <p className="text-xl text-slate-600 font-bold leading-relaxed italic pr-4">
                  {point.description}
                </p>
              </div>

              <div className="shrink-0 w-full lg:w-64 p-10 bg-[#0f172a] rounded-[3rem] text-white flex flex-col items-center justify-center text-center gap-4 shadow-2xl group-hover:bg-emerald-600 transition-all duration-500 hover:scale-105">
                 <Zap className="w-10 h-10 text-emerald-400 group-hover:text-white group-hover:animate-pulse" />
                 <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 group-hover:text-emerald-100">PRÓXIMO PASSO</p>
                   <div className="flex items-center justify-center gap-3 text-2xl font-black uppercase tracking-tighter">
                     AÇÕES <ArrowRight size={24} />
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Capital Acumulado */}
      <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2.2rem] flex items-center justify-center text-slate-900 shadow-2xl shadow-emerald-500/20 shrink-0">
              <BarChart3 size={40} />
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">CAPITAL ACUMULADO</h4>
              <p className="text-slate-500 font-bold uppercase text-[12px] tracking-[0.4em]">PROJEÇÃO EM 5 ANOS</p>
            </div>
          </div>
          <div className="bg-[#0f172a] px-12 py-8 rounded-[3rem] text-white shadow-2xl text-center md:text-left shrink-0 border border-slate-800">
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2">TOTAL (60 MESES):</p>
             <p className="text-4xl font-black tracking-tighter leading-none">{formatBRL(result.annualSavings * 5)}</p>
          </div>
        </div>

        <div className="h-[450px] w-full bg-slate-50/50 rounded-[4rem] p-10 border border-slate-100 shadow-inner relative overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorLarge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#cbd5e1" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 14, fontWeight: 900, fill: '#1e293b'}} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(v) => `R$ ${v/1000}k`} dx={-15} />
              <Tooltip 
                contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', padding: '24px', backgroundColor: '#fff' }}
                labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', marginBottom: '8px', color: '#94a3b8', fontSize: '11px', letterSpacing: '0.2em' }}
                itemStyle={{ fontWeight: 'black', color: '#0f172a', fontSize: '18px' }}
                formatter={(v) => [formatBRL(v as number), 'Acumulado']} 
              />
              <Area type="monotone" dataKey="acumulado" stroke="#10b981" strokeWidth={8} fillOpacity={1} fill="url(#colorLarge)" dot={{ r: 10, fill: '#10b981', strokeWidth: 5, stroke: '#fff' }} activeDot={{ r: 14, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {activeModal !== null && (
        <ActionsModal 
          isOpen={activeModal !== null} 
          onClose={() => setActiveModal(null)}
          title={result.strategicRoadmap?.[activeModal]?.title || "Plano de Execução"}
          actions={result.strategicRoadmap?.[activeModal]?.actions || []}
        />
      )}
    </div>
  );
};

const SimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCalculate = async (data: TaxData) => {
    setResult(null);
    setLoading(true);
    try {
      const res = await calculateTaxComparison(data);
      setResult(res);
    } catch (e) {
      console.error("Falha no simulador:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1800px] mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="w-full lg:w-[420px] shrink-0 space-y-8 no-print">
          <section className="bg-emerald-600 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-emerald-500">
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl font-black leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
                A REFORMA <br/>NÃO ESPERA.
              </h2>
              <p className="text-xl text-emerald-50 font-bold leading-tight max-w-[280px]">
                Simule agora e descubra seu novo equilíbrio fiscal alimentado pela PEC 45/2019.
              </p>
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] bg-slate-900/40 px-8 py-4 rounded-full border border-emerald-400/30 backdrop-blur-2xl w-fit shadow-lg">
                <Award className="w-5 h-5 text-emerald-400" /> ATUALIZADO 2025
              </div>
            </div>
            <Landmark size={300} className="absolute -right-20 -bottom-20 opacity-10 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none" />
          </section>
          
          <TaxForm onCalculate={handleCalculate} loading={loading} />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
             <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-8 md:p-24 border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/50 backdrop-blur-2xl shadow-inner animate-in zoom-in-95">
               <div className="w-40 h-40 border-[12px] border-emerald-500 border-t-transparent rounded-full animate-spin mb-12 shadow-2xl"></div>
               <h3 className="text-5xl font-black text-slate-800 tracking-tighter uppercase mb-6 animate-pulse">Auditando Variáveis...</h3>
               <p className="text-2xl text-slate-500 max-w-2xl font-bold leading-snug">
                 Nossa inteligência está processando os dados fiscais e consultando as diretrizes da PEC 45/2019 para gerar seu diagnóstico de precisão.
               </p>
             </div>
          ) : result ? <ReportView result={result} /> : (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-8 md:p-24 border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/40 backdrop-blur-2xl shadow-inner group">
               <div className="bg-slate-900 p-14 rounded-[3.5rem] shadow-2xl mb-10 animate-pulse group-hover:scale-110 transition-transform duration-700">
                <BookOpen size={80} className="text-emerald-400" />
              </div>
              <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-6">Diagnóstico Pronto para Gerar</h3>
              <p className="text-xl text-slate-500 max-w-2xl font-bold leading-relaxed">
                Insira as variáveis fiscais à esquerda para que nossa Inteligência calcule sua economia acumulada baseada na PEC 45/2019.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const AboutPage: React.FC = () => (
  <main className="max-w-[1200px] mx-auto px-6 py-24 space-y-20">
    <div className="text-center space-y-8">
      <span className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.5em] bg-emerald-50 px-10 py-4 rounded-full border border-emerald-100">Base Legal</span>
      <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">ESTRATÉGIA FISCAL</h1>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="bg-white p-14 rounded-[4rem] shadow-2xl border border-slate-100 space-y-8 hover:scale-105 transition-transform">
        <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600">
          <Landmark size={32} />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">IVA DUAL</h2>
        <p className="text-xl text-slate-600 font-bold leading-relaxed">
          A unificação dos impostos mudará como o Simples Nacional opera. A economia virá da capacidade de recuperar créditos sobre insumos.
        </p>
      </div>
      <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-2xl space-y-8 hover:scale-105 transition-transform">
        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-slate-900">
          <TrendingUp size={32} />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-emerald-400">VISÃO DE FUTURO</h2>
        <p className="text-xl text-slate-300 font-bold leading-relaxed">
          Sua competitividade comercial depende da formalização total da cadeia. Compras informais encarecerão seu produto.
        </p>
      </div>
    </div>
  </main>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f1f5f9] overflow-x-hidden">
        <Header />
        <div className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<SimulatorPage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>
        </div>
        <footer className="bg-white border-t border-slate-200 py-24 mt-20 no-print overflow-hidden">
          <div className="max-w-[1800px] mx-auto px-6 text-center space-y-10">
            <div className="flex justify-center">
              <img 
                src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" 
                alt="Logo Footer" 
                className="w-20 h-20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer"
              />
            </div>
            <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.8em]">TRIBUTOPRIME RADAR &copy; 2025</p>
            <p className="text-[13px] text-slate-400 max-w-3xl mx-auto leading-relaxed font-bold uppercase tracking-widest px-6">
              SIMULADOR ESTRATÉGICO ALIMENTADO PELA PEC 45/2019. TODOS OS CÁLCULOS TÊM CARÁTER CONSULTIVO PARA APOIO À DECISÃO EXECUTIVA.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
