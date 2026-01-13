
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { 
  Calculator, BarChart3, ShieldCheck, AlertTriangle, FileText, ChevronRight, 
  PieChart, TrendingDown, Calendar, Users, Briefcase, Download, 
  Percent, TrendingUp, Settings2, HeartPulse, Target, ArrowUpRight, 
  Activity, Zap, Landmark, Award
} from 'lucide-react';
import { calculateTaxComparison } from './services/geminiService';
import { TaxData, ComparisonResult, BusinessSector } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

const Header: React.FC = () => (
  <header className="bg-slate-900 text-white py-6 px-4 shadow-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <img 
          src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" 
          alt="TributoPrime Radar Logo" 
          className="w-12 h-12 rounded-lg object-cover shadow-lg border border-slate-700"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight">TributoPrime <span className="text-emerald-400">Radar</span></h1>
          <p className="text-xs text-slate-400 font-medium">Arquitetura de Crescimento IBS / CBS</p>
        </div>
      </div>
      <nav className="flex gap-6 text-sm font-bold">
        <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Zap className="w-4 h-4"/> Análise</Link>
        <Link to="/sobre" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Landmark className="w-4 h-4"/> Sobre a reforma</Link>
      </nav>
    </div>
  </header>
);

const TaxForm: React.FC<{ onCalculate: (data: TaxData) => void, loading: boolean }> = ({ onCalculate, loading }) => {
  const [isExpert, setIsExpert] = useState(false);
  const [formData, setFormData] = useState<TaxData>({
    monthlyRevenue: 208000,
    monthlyPurchases: 120000,
    payroll: 50000,
    otherInputs: 15000,
    accumulatedRevenue: 2500000,
    sector: BusinessSector.COMMERCE,
    simplesAnnex: 1,
    customSimplesRate: 4.0 // Padrão Anexo I
  });

  // Atualiza a alíquota padrão quando o anexo muda
  useEffect(() => {
    const defaultRates: Record<number, number> = { 1: 4.0, 2: 4.5, 3: 6.0, 4: 4.5, 5: 15.5 };
    setFormData(prev => ({ ...prev, customSimplesRate: defaultRates[formData.simplesAnnex] }));
  }, [formData.simplesAnnex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const annexInfo = [
    { n: 1, label: "Anexo I: Comércio", desc: "Lojas, varejo e comércio em geral." },
    { n: 2, label: "Anexo II: Indústria", desc: "Fábricas e atividades industriais." },
    { n: 3, label: "Anexo III: Serviços (A)", desc: "Locação, academias, TI, contabilidade." },
    { n: 4, label: "Anexo IV: Serviços (B)", desc: "Limpeza, vigilância, obras, advocacia." },
    { n: 5, label: "Anexo V: Serviços (C)", desc: "Auditoria, engenharia, medicina, tecnologia." }
  ];

  const currentAnnexDesc = annexInfo.find(a => a.n === formData.simplesAnnex)?.desc;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shadow-inner">
          <Settings2 className={`w-6 h-6 transition-all duration-500 ${isExpert ? 'text-emerald-500 rotate-90' : 'text-slate-300'}`} />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">ANÁLISE</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure as variáveis reais da sua operação.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Faturamento Médio</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="number"
                required
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({...formData, monthlyRevenue: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compras Diretas</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="number"
                required
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                value={formData.monthlyPurchases}
                onChange={(e) => setFormData({...formData, monthlyPurchases: Number(e.target.value)})}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-5 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
          <button 
            type="button"
            onClick={() => setIsExpert(!isExpert)}
            className={`w-14 h-7 rounded-full transition-all relative ${isExpert ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isExpert ? 'left-8' : 'left-1'}`} />
          </button>
          <div className="flex-1">
            <p className="text-xs font-black text-emerald-900 uppercase">MODO DE PRECISÃO EXPERT</p>
            <p className="text-[10px] text-emerald-700/70 font-bold leading-tight">Habilite para incluir Folha e Alíquota Efetiva.</p>
          </div>
        </div>

        {isExpert && (
          <div className="space-y-4 p-5 border-2 border-dashed border-slate-200 rounded-[2rem] animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/50">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alíquota Efetiva Simples Atual (%)</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-6 py-4 bg-white border-2 border-emerald-100 rounded-3xl focus:border-emerald-500 outline-none font-bold text-slate-800 shadow-sm"
                  value={formData.customSimplesRate}
                  onChange={(e) => setFormData({...formData, customSimplesRate: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Folha de Pagamento</label>
                <input
                  type="number"
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-bold text-sm"
                  value={formData.payroll}
                  onChange={(e) => setFormData({...formData, payroll: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Custos Fixos</label>
                <input
                  type="number"
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-bold text-sm"
                  value={formData.otherInputs}
                  onChange={(e) => setFormData({...formData, otherInputs: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Setor Estratégico</label>
            <div className="relative">
              <select
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-emerald-500 outline-none appearance-none font-bold text-slate-700 cursor-pointer"
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value as BusinessSector})}
              >
                <option value={BusinessSector.COMMERCE}>Comércio</option>
                <option value={BusinessSector.SERVICES}>Serviços</option>
                <option value={BusinessSector.INDUSTRY}>Indústria</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enquadramento Simples</label>
            <div className="relative">
              <select
                className="w-full px-6 py-4 bg-amber-50 border-2 border-amber-100 rounded-3xl focus:border-amber-500 outline-none font-bold text-amber-900 cursor-pointer appearance-none"
                value={formData.simplesAnnex}
                onChange={(e) => setFormData({...formData, simplesAnnex: Number(e.target.value)})}
              >
                {annexInfo.map(info => (
                  <option key={info.n} value={info.n}>{info.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic px-2">{currentAnnexDesc}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#111827] text-white py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(17,24,39,0.3)] active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              GERAR DIAGNÓSTICO DE SAÚDE
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const ReportView: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const chartData = [
    { name: 'Simples Nacional', value: result.simplesTotal },
    { name: 'Novo IBS / CBS', value: result.reformTotal }
  ];

  const projectionData = Array.from({ length: 5 }, (_, i) => ({
    name: `Ano ${i + 1}`,
    economia: result.annualSavings * (i + 1)
  }));

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const isSimplesBetter = result.recommendation === 'SIMPLES';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="text-emerald-500 w-8 h-8" />
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Diagnóstico Executivo</h2>
          </div>
          <p className="text-slate-500 text-sm font-bold tracking-wide">Análise consolidada para alíquota Simples de {result.effectiveRateSimples.toFixed(2)}%.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</p>
            <p className="text-2xl font-black text-slate-900">{result.healthScore}/100</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray={`${(result.healthScore / 100) * 176} 176`} />
            </svg>
            <Activity className="absolute text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </div>

      <div className={`relative p-12 rounded-[3.5rem] border-2 flex flex-col md:flex-row items-center gap-12 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-1000 ${isSimplesBetter ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className={`p-8 rounded-[2rem] shadow-xl ${isSimplesBetter ? 'bg-white text-emerald-600' : 'bg-white text-amber-600'}`}>
          {isSimplesBetter ? <ShieldCheck className="w-16 h-16" /> : <AlertTriangle className="w-16 h-16" />}
        </div>
        <div className="flex-1 z-10">
          <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest inline-block mb-4 shadow-sm ${isSimplesBetter ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'}`}>
            Direcionamento Recomendado
          </span>
          <h3 className="text-4xl font-black text-slate-900 mb-5 tracking-tighter uppercase leading-[0.9]">
            {isSimplesBetter ? 'Manutenção no Simples' : 'Migração Estratégica IBS/CBS'}
          </h3>
          <p className="text-slate-700 font-bold leading-relaxed text-xl max-w-2xl italic">"{result.analysis}"</p>
          
          <div className="mt-10 flex flex-wrap gap-6">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-md border border-white min-w-[200px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Diferença Mensal</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatBRL(result.savings)}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl border border-slate-800 min-w-[200px]">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Impacto Anual de Caixa</p>
              <p className="text-3xl font-black text-white tracking-tighter">{formatBRL(result.annualSavings)}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 opacity-[0.03] -mr-20 -mt-20 pointer-events-none scale-150">
          <Landmark size={400} />
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
        <h4 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <ArrowUpRight className="text-emerald-500 w-7 h-7" />
          </div>
          Roteiro de Expansão Estratégica
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {result.strategicRoadmap?.map((point, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-50 border-2 border-transparent hover:border-emerald-100 hover:bg-white transition-all duration-500 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-inner ${point.impactLevel === 'ALTO' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                  Prioridade {point.impactLevel}
                </span>
                <Target className="w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h5 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{point.title}</h5>
              <p className="text-sm text-slate-600 font-bold leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col">
          <h4 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <Percent className="text-emerald-500 w-6 h-6" />
            Estrutura da Carga Tributária
          </h4>
          <div className="space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex-1 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Simples Nacional</p>
                <p className="text-5xl font-black mb-1 tracking-tighter">{result.effectiveRateSimples.toFixed(2)}%</p>
                <p className="text-[10px] font-bold text-slate-500">Alíquota Efetiva Vigente</p>
              </div>
              <div className="flex-1 p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <p className="text-[10px] font-black text-emerald-200 uppercase mb-4 tracking-widest">Reforma (IBS/CBS)</p>
                <p className="text-5xl font-black mb-1 tracking-tighter">{result.effectiveRateReform.toFixed(2)}%</p>
                <p className="text-[10px] font-bold text-emerald-200">Líquido após créditos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
          <h4 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <TrendingUp className="text-emerald-500 w-6 h-6" />
            Economia Projetada em 5 Anos
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  formatter={(v) => [formatBRL(v as number), 'Capital Acumulado']} 
                />
                <Line 
                  type="monotone" 
                  dataKey="economia" 
                  stroke="#10b981" 
                  strokeWidth={10} 
                  dot={{ r: 8, fill: '#10b981', strokeWidth: 5, stroke: '#fff' }} 
                  activeDot={{ r: 12, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
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
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8 no-print">
          <section className="bg-emerald-600 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4 leading-none tracking-tighter uppercase">A REFORMA NÃO ESPERA.</h2>
              <p className="text-emerald-50 leading-relaxed mb-8 font-bold text-lg">
                Sua empresa está preparada para a maior mudança tributária dos últimos 50 anos? Simule agora e descubra se o Simples Nacional ainda é o melhor caminho.
              </p>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-emerald-700/40 w-fit px-5 py-2.5 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                <HeartPulse className="w-5 h-5 text-rose-300" /> PEC 45/2019
              </div>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 group-hover:scale-110 transition-all duration-1000">
              <Landmark size={350} />
            </div>
          </section>
          
          <TaxForm onCalculate={handleCalculate} loading={loading} />
        </div>

        <div className="lg:col-span-8">
          {result ? (
            <ReportView result={result} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 border-4 border-dashed border-slate-200 rounded-[4rem] bg-white/40 backdrop-blur-sm relative overflow-hidden">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl mb-8 border border-slate-800 animate-pulse">
                <Zap className="w-16 h-16 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-4 leading-none">AGUARDANDO PARÂMETROS</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-bold text-lg leading-tight">
                Insira as variáveis de sua operação à esquerda para que nosso Consultor IA inicie o processamento estratégico.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

const AboutPage: React.FC = () => (
  <main className="max-w-4xl mx-auto px-4 py-20 text-slate-800 space-y-24">
    <div className="text-center space-y-6">
      <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] bg-emerald-50 px-6 py-2.5 rounded-full shadow-inner">Base de Conhecimento</span>
      <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">ARQUITETURA DE TRANSIÇÃO</h1>
      <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">Tudo o que você precisa saber para proteger o patrimônio e garantir a saúde financeira na transição tributária.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-8 relative overflow-hidden group">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Landmark className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">O FIM DA CUMULATIVIDADE</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-bold">
            Diferente do Simples hoje, onde o imposto é um custo final, no IBS/CBS o imposto pago em compras vira crédito imediato. Isso exige uma gestão de fornecedores muito mais estratégica.
          </p>
        </div>
      </div>
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-8 relative overflow-hidden group">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Activity className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">SAÚDE DA FOLHA</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-bold">
            Para empresas de serviços, o "Fator R" ainda é o regulador no Simples. Na Reforma, a folha gera benefícios indiretos através da manutenção da competitividade em cadeias B2B.
          </p>
        </div>
      </div>
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 flex flex-col gap-8 relative overflow-hidden group">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
          <Target className="w-10 h-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">CAMINHO DO CRESCIMENTO</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-bold">
            Empresas que miram clientes grandes (B2B) serão obrigadas a repensar o Simples, pois o crédito gerado pelo regime regular é um imenso atrativo comercial.
          </p>
        </div>
      </div>
    </div>
  </main>
);

const App: React.FC = () => {
  return (
    <HashRouter basename="/">
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<SimulatorPage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>
        </div>
        <footer className="bg-white border-t border-slate-200 py-20 no-print">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-10">
              <img 
                src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" 
                alt="Logo Footer" 
                className="w-14 h-14 grayscale opacity-30"
              />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.5em] mb-6">
              TRIBUTOPRIME RADAR &copy; {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-loose font-bold italic uppercase tracking-widest">
              DIAGNÓSTICO ESTRATÉGICO DE ALTA FIDELIDADE. AS ESTIMATIVAS BASEIAM-SE EM MODELOS PROJETADOS DA REFORMA TRIBUTÁRIA E SÃO ORIENTAÇÕES DE APOIO À DECISÃO. CONSULTE SEMPRE UM CONTADOR SÊNIOR PARA PLANEJAMENTO FORMAL.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
