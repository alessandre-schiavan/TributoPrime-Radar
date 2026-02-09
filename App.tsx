
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ChevronRight, Percent, TrendingUp, Settings2, Landmark, Award, BookOpen, CheckCircle2, Gavel, Info, BarChart3, Rocket, Clock, Gauge, ArrowRight, X, PlayCircle, InfoIcon, LayoutList,
  Sparkles, Fingerprint, Lightbulb, Mail, Lock, UserPlus, LogOut, RefreshCw, Loader2,
  Zap, Target, Scale, FileText, Globe, Eye, EyeOff, KeyRound, ExternalLink, Fingerprint as FingerIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { calculateTaxComparison } from './services/geminiService';
import { TaxData, ComparisonResult, BusinessSector, StrategicAction, StrategicPoint } from './types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { sb, APP_ID } from './services/supabaseClient';

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

const translateError = (err: string) => {
  const lowerErr = err.toLowerCase();
  if (lowerErr.includes("rate limit exceeded")) return "Limite de tentativas excedido. Aguarde 1 minuto.";
  if (lowerErr.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  return err;
};

// --- HEADER ---
const Header: React.FC<{ onLogoutRequest: () => void }> = ({ onLogoutRequest }) => (
  <header className="bg-slate-950 text-white py-4 px-6 sticky top-0 z-50 shadow-2xl">
    <div className="max-w-[1800px] mx-auto flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" className="w-10 h-10 rounded-lg shadow-emerald-500/20 shadow-lg" alt="Logo" />
        <div className="flex flex-col">
          <h1 className="text-lg font-black tracking-tighter leading-none">TRIBUTOPRIME <span className="text-emerald-400">RADAR</span></h1>
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em]">Inteligência em Transição Tributária</p>
        </div>
      </Link>
      <nav className="flex items-center gap-10">
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2"><Zap size={14}/> Análise</Link>
        <Link to="/sobre" className="text-[10px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2"><Landmark size={14}/> Base Legal</Link>
        <button onClick={onLogoutRequest} className="bg-white/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-rose-500/20">
          <LogOut size={16} /> <span className="text-[10px] font-black">SAIR</span>
        </button>
      </nav>
    </div>
  </header>
);

// --- MODAL DE LOGOUT ---
const LogoutModal: React.FC<{ isOpen: boolean, onCancel: () => void, onConfirm: () => void }> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><LogOut size={40} /></div>
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Encerrar Sessão?</h3>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">Deseja realmente sair do radar de inteligência?</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-xl transition-all">Sim, Sair</button>
          <button onClick={onCancel} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// --- ROADMAP PHASE MODAL ---
const PhaseModal: React.FC<{ phase: StrategicPoint | null, index: number | null, onClose: () => void }> = ({ phase, index, onClose }) => {
  if (!phase || index === null) return null;

  // Configuração fixa por posição
  const pos = index % 3;
  const config = [
    { label: 'ALTO', bgHeader: 'bg-red-50 border-red-100', iconBg: 'bg-red-600', actionNumBg: 'bg-red-100 text-red-600' },
    { label: 'MÉDIO', bgHeader: 'bg-yellow-50 border-yellow-100', iconBg: 'bg-yellow-500', actionNumBg: 'bg-yellow-100 text-yellow-600' },
    { label: 'BAIXO', bgHeader: 'bg-green-50 border-green-100', iconBg: 'bg-green-600', actionNumBg: 'bg-green-100 text-green-600' }
  ][pos];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-4 border-white/20">
        <div className={`p-8 flex items-center justify-between border-b shrink-0 ${config.bgHeader}`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl ${config.iconBg}`}><Rocket size={32}/></div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{phase.title}</h3>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">IMPACTO {config.label} IDENTIFICADO</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg group">
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-6">
          {phase.actions.map((action, idx) => (
            <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 flex gap-6 md:gap-8 items-start group hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner ${config.actionNumBg}`}>#{idx + 1}</div>
              <div className="space-y-4 flex-1">
                <h4 className="text-lg md:text-xl font-black text-slate-950 uppercase tracking-tighter leading-none">{action.task}</h4>
                <p className="text-slate-600 font-bold text-xs md:text-sm leading-relaxed">{action.description}</p>
                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-l-4 border-emerald-500">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-2">Plano de Execução Técnica:</span>
                  <p className="text-[12px] md:text-[13px] font-black text-emerald-600 italic leading-relaxed">{action.implementation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 bg-white border-t flex justify-center shrink-0">
          <button onClick={onClose} className="bg-slate-950 text-white w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 shadow-xl transition-all">FECHAR DIAGNÓSTICO ESTRATÉGICO</button>
        </div>
      </div>
    </div>
  );
};

// --- AUTH SCREEN ---
const AuthScreen: React.FC<{ onWaitingReset: (email: string) => void }> = ({ onWaitingReset }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isLogin) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg("Email enviado");
      }
    } catch (err: any) { setErrorMsg(translateError(err.message)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[150px]"></div>
      </div>
      <div className="w-full max-w-md z-10 animate-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 shadow-emerald-500/5">
          <div className="bg-slate-950 p-10 text-center relative border-b border-white/5">
            <div className="p-2 bg-white inline-block rounded-2xl shadow-xl mb-4"><img src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" className="w-16 h-16 rounded-xl" /></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">TRIBUTOPRIME <span className="text-emerald-400">RADAR</span></h2>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Intelligence Gateway</p>
          </div>
          <form onSubmit={handleAuth} className="p-10 space-y-6">
            {errorMsg && <div className="bg-rose-50 p-4 rounded-2xl text-rose-600 text-xs font-bold border border-rose-100 flex items-center gap-2"><AlertTriangle size={16}/> {errorMsg}</div>}
            {successMsg && <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 text-xs font-black uppercase text-center border border-emerald-100">Email enviado</div>}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  name="email"
                  autoComplete="email"
                  required 
                  placeholder="exemplo@empresa.com" 
                  className="w-full px-6 py-4 bg-slate-50 border-2 rounded-[1.2rem] font-bold outline-none focus:border-emerald-500 transition-all text-slate-700" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    autoComplete="current-password"
                    required 
                    placeholder="••••••••" 
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-[1.2rem] font-bold outline-none focus:border-emerald-500 transition-all text-slate-700" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : isLogin ? "ACESSAR RADAR" : "CRIAR CONTA"}
            </button>
            <div className="text-center pt-4 border-t border-slate-50 space-y-3">
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">{isLogin ? "Não possui conta? Cadastre-se" : "Já possui conta? Faça Login"}</button>
              {isLogin && <button type="button" onClick={() => onWaitingReset(email)} className="block w-full text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">Esqueci minha senha</button>}
            </div>
          </form>
        </div>
        <p className="text-center mt-8 text-slate-600 text-[8px] font-black uppercase tracking-[0.2em] italic leading-none">Ambiente Protegido © PEC 45/2019 Compliance</p>
      </div>
    </div>
  );
};

// --- SIMULATOR PAGE ---
const SimulatorPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCalculate = async (data: TaxData) => {
    setResult(null);
    setLoading(true);
    try { const res = await calculateTaxComparison(data); setResult(res); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <main className="max-w-[1800px] mx-auto px-6 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[400px] shrink-0 space-y-8">
          <div className="bg-emerald-600 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
            <div className="space-y-6 relative z-10">
              <h2 className="text-5xl font-black leading-[0.85] tracking-tighter uppercase italic shadow-sm">A REFORMA <br/>NÃO ESPERA.</h2>
              <p className="text-emerald-100 font-bold text-sm leading-relaxed opacity-90">Simule agora e descubra seu novo equilíbrio fiscal alimentado pela PEC 45/2019.</p>
              <div className="inline-flex items-center gap-3 bg-slate-900/30 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                <Clock size={16} className="text-emerald-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">ATUALIZADO 2025</span>
              </div>
            </div>
          </div>
          <TaxForm onCalculate={handleCalculate} loading={loading} />
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[4rem] shadow-sm border-2 border-dashed border-slate-200 animate-pulse p-10">
               <div className="w-20 h-20 border-[8px] border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
               <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Processando Diagnóstico...</h3>
               <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs">Validando com Inteligência Tributária POLLINATIONS AI</p>
             </div>
          ) : result ? <ReportView result={result} /> : (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-900/5 rounded-[4rem] border-4 border-dashed border-slate-200 text-center p-20 group transition-all hover:bg-slate-900/10">
              <div className="bg-slate-950 p-16 rounded-[3rem] shadow-2xl mb-10 group-hover:scale-105 transition-transform duration-700">
                <BookOpen size={96} className="text-emerald-400" />
              </div>
              <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">Aguardando Diagnóstico</h3>
              <p className="text-slate-500 font-bold max-w-sm uppercase text-[11px] tracking-[0.4em] leading-relaxed">Insira os dados da empresa para iniciar a análise estratégica de enquadramento.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

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

  return (
    <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 p-10 space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">CONFIGURAÇÃO OPERACIONAL</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajuste os valores para obter exatidão no diagnóstico.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onCalculate(formData); }} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Receita Bruta Mensal</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
              <input type="number" className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500" value={formData.monthlyRevenue} onChange={(e) => setFormData({...formData, monthlyRevenue: Number(e.target.value)})}/>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Compras (Insumos)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
              <input type="number" className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-700 outline-none focus:border-emerald-500" value={formData.monthlyPurchases} onChange={(e) => setFormData({...formData, monthlyPurchases: Number(e.target.value)})}/>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => setIsExpert(!isExpert)} className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700">
          <Settings2 size={14} className={isExpert ? "rotate-45" : ""} /> {isExpert ? "OCULTAR" : "MOSTRAR"} DETALHES TÉCNICOS
        </button>

        {isExpert && (
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-in fade-in space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Alíquota Efetiva (%)</label>
                <input type="number" step="0.01" className="w-full px-5 py-4 bg-white border rounded-xl font-bold text-slate-700" value={formData.customSimplesRate} onChange={(e) => setFormData({...formData, customSimplesRate: Number(e.target.value)})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Outros Custos NF-E</label>
                <input type="number" className="w-full px-5 py-4 bg-white border rounded-xl font-bold text-slate-700" value={formData.otherInputs} onChange={(e) => setFormData({...formData, otherInputs: Number(e.target.value)})}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Folha Salarial (Total)</label>
                <input type="number" className="w-full px-5 py-4 bg-white border rounded-xl font-bold text-slate-700" value={formData.payroll} onChange={(e) => setFormData({...formData, payroll: Number(e.target.value)})}/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Despesas Fixas</label>
                <input type="text" placeholder="Ex: 5000" className="w-full px-5 py-4 bg-white border rounded-xl font-bold text-slate-700" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Setor</label>
            <select className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-700 appearance-none cursor-pointer" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value as BusinessSector})}>
              <option value={BusinessSector.COMMERCE}>Comércio</option>
              <option value={BusinessSector.SERVICES}>Serviços</option>
              <option value={BusinessSector.INDUSTRY}>Indústria</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Enquadramento</label>
            <select className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-700 appearance-none cursor-pointer" value={formData.simplesAnnex} onChange={(e) => setFormData({...formData, simplesAnnex: Number(e.target.value)})}>
              <option value={1}>Anexo I: Comércio</option>
              <option value={2}>Anexo II: Indústria</option>
              <option value={3}>Anexo III: Serviços</option>
            </select>
          </div>
        </div>

        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
          <Info className="text-blue-500 shrink-0 mt-1" size={16} />
          <div className="space-y-1">
            <p className="text-[9px] font-black text-blue-800 uppercase tracking-widest leading-none">Definição Legal do Anexo</p>
            <p className="text-[10px] text-blue-700 font-bold leading-relaxed">Venda de mercadorias em geral (Lojas, Varejo, Atacado, E-commerce).</p>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : <>PROCESSAR DIAGNÓSTICO <ChevronRight size={18}/></>}
        </button>
      </form>
    </div>
  );
};

// --- REPORT VIEW (DASHBOARD) ---
const ReportView: React.FC<{ result: ComparisonResult }> = ({ result }) => {
  const isMigrate = result.recommendation === 'REFORMA';
  const [activePhaseIndex, setActivePhaseIndex] = useState<number | null>(null);
  
  // Garantir que os valores sejam numéricos antes de usar toFixed
  const safeRateSimples = Number(result.effectiveRateSimples) || 0;
  const safeRateReform = Number(result.effectiveRateReform) || 0;
  const safeAnnualSavings = Number(result.annualSavings) || 0;

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    name: `Mês ${i + 1}`,
    Simples: Number(result.simplesTotal) * (1 + (Math.random() * 0.05 - 0.025)),
    Reforma: Number(result.reformTotal) * (1 + (Math.random() * 0.05 - 0.025))
  }));

  const fiveYearData = Array.from({ length: 5 }, (_, i) => {
    const year = i + 1;
    return {
      name: `Ano ${year}`,
      Economia: safeAnnualSavings * year
    };
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* 1. RESULTADO DO DIAGNÓSTICO */}
      <div className={`p-10 md:p-14 rounded-[4rem] border-2 shadow-2xl relative overflow-hidden ${isMigrate ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-200/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10">
            <div className={`w-24 h-24 md:w-28 md:h-28 ${isMigrate ? 'bg-white text-rose-600' : 'bg-white text-emerald-600'} rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-rose-900/5 shrink-0`}><AlertTriangle size={48} /></div>
            <div className="space-y-3">
              <span className={`text-[10px] md:text-[11px] font-black uppercase px-6 md:px-8 py-2.5 rounded-full tracking-[0.3em] shadow-sm inline-block ${isMigrate ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>DIAGNÓSTICO FINAL DE ENQUADRAMENTO</span>
              <h3 className="text-4xl md:text-7xl font-black text-slate-950 uppercase tracking-tighter leading-none">{isMigrate ? 'MIGRAR PARA MODELO REFORMA' : 'MANTER NO SIMPLES NACIONAL'}</h3>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[3rem] border border-rose-200 shadow-xl space-y-6">
            <h4 className="text-lg md:text-xl font-black text-slate-950 uppercase tracking-tighter italic flex items-center gap-3"><Lightbulb className="text-rose-500" /> "POR QUE ESTA É A MELHOR ESCOLHA ESTRATÉGICA?"</h4>
            <p className="text-base md:text-lg text-slate-700 font-bold leading-relaxed italic">"{result.analysis}"</p>
          </div>
        </div>
      </div>

      {/* 2. CARGA TRIBUTÁRIA COMPARATIVA */}
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
        <div className="flex items-center gap-4 text-emerald-600">
           <Percent size={24} />
           <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">ESTRUTURA DA CARGA TRIBUTÁRIA</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="bg-slate-950 text-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="space-y-4 text-center">
               <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">SIMPLES NACIONAL</p>
               <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none">{safeRateSimples.toFixed(2)}<span className="text-2xl md:text-3xl text-slate-600">%</span></p>
               <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">ALÍQUOTA EFETIVA REAL</p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="space-y-4 text-center">
               <p className="text-[10px] md:text-[11px] font-black text-emerald-300 uppercase tracking-[0.4em]">REFORMA (IBS/CBS)</p>
               <p className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-white">{safeRateReform.toFixed(2)}<span className="text-2xl md:text-3xl text-emerald-400">%</span></p>
               <p className="text-[9px] md:text-[10px] font-black text-emerald-200 uppercase tracking-widest">LÍQUIDO ESTIMADO C/ CRÉDITOS</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OTIMIZAÇÃO LEGAL E PERFORMANCE */}
      <div className="bg-slate-950 p-6 md:p-12 lg:p-16 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-50/5 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          <div className="w-14 h-14 md:w-18 lg:w-20 bg-emerald-600 text-white rounded-[1.5rem] lg:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 shrink-0"><Gavel size={32}/></div>
          <div className="space-y-1">
            <h4 className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none">OTIMIZAÇÃO LEGAL E PERFORMANCE</h4>
            <p className="text-[8px] md:text-[10px] lg:text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em]">MAXIMIZAÇÃO DE FLUXO FINANCEIRO E TRIBUTÁRIO</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 relative z-10 items-stretch">
           {result.legalOptimizations?.map((opt, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-8 md:p-10 rounded-[3rem] hover:bg-white/10 transition-all group flex flex-col justify-between text-center min-h-[340px] shadow-emerald-500/5 shadow-2xl">
                <div className="flex flex-col items-center space-y-6 flex-1">
                  <div className="w-12 h-12 md:w-14 lg:w-16 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                    <CheckCircle2 size={24}/>
                  </div>
                  <div className="space-y-4">
                    <h5 className="text-sm md:text-base lg:text-lg font-black uppercase text-white tracking-tighter leading-tight break-words">{opt.title}</h5>
                    <div className="space-y-2">
                      <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">IMPLEMENTAÇÃO</p>
                      <p className="text-slate-300 font-bold italic leading-relaxed text-[10px] md:text-[11px] lg:text-[13px] break-words">"{opt.howToImplement}"</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 w-full">
                  <p className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2">BENEFÍCIO ESPERADO</p>
                  <p className="text-white font-black text-[11px] md:text-xs lg:text-sm uppercase tracking-tighter leading-tight break-words">{opt.benefitExpected}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* 4. ROTEIRO DE TRANSIÇÃO (15 AÇÕES) */}
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
        <div className="flex items-center gap-4 text-emerald-600">
           <Target size={24} />
           <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">ROTEIRO DE TRANSIÇÃO (15 AÇÕES)</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {result.strategicRoadmap?.map((point, i) => {
            // Configuração fixa baseada na posição (Esquerda=0, Meio=1, Direita=2)
            const pos = i % 3;
            const config = [
              { label: 'ALTO', colorClass: 'bg-rose-600', textClass: 'text-rose-600', borderClass: 'border-rose-100', dashedClass: 'border-rose-200', bgClass: 'bg-rose-50' },
              { label: 'MÉDIO', colorClass: 'bg-yellow-500', textClass: 'text-yellow-600', borderClass: 'border-yellow-100', dashedClass: 'border-yellow-200', bgClass: 'bg-yellow-50' },
              { label: 'BAIXO', colorClass: 'bg-emerald-600', textClass: 'text-emerald-600', borderClass: 'border-emerald-100', dashedClass: 'border-emerald-200', bgClass: 'bg-emerald-50' }
            ][pos];

            return (
              <button 
                key={i}
                onClick={() => setActivePhaseIndex(i)}
                className={`group relative p-10 md:p-12 rounded-[3.5rem] border shadow-sm transition-all text-left flex flex-col justify-between h-[420px] overflow-hidden hover:scale-105 active:scale-95 ${config.bgClass} ${config.borderClass}`}
              >
                <div className="space-y-4 relative z-10">
                  <span className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-white shadow-lg inline-block ${config.colorClass}`}>
                    IMPACTO
                  </span>
                  
                  <div className={`bg-white/60 backdrop-blur-sm border-2 border-dashed p-6 rounded-[2rem] min-h-[160px] flex flex-col items-center justify-center text-center ${config.dashedClass}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">NÍVEL DE IMPACTO</p>
                    <p className={`text-5xl font-black uppercase tracking-tighter leading-none ${config.textClass}`}>
                      {config.label}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-2">IDENTIFICADO NA OPERAÇÃO TRIBUTÁRIA</p>
                  </div>

                  <h5 className="text-3xl md:text-4xl font-black uppercase text-slate-900 tracking-tighter leading-[1] mt-2">{point.title}</h5>
                </div>
                
                <div className="flex items-center gap-3 text-slate-900 font-black text-[11px] uppercase tracking-widest border-t border-black/5 pt-8 relative z-10 mt-auto">
                  Abrir Painel <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all text-slate-950 pointer-events-none">
                   <Rocket size={140} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. CAPITAL ACUMULADO EM 5 ANOS */}
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
        <div className="flex items-center gap-4 text-emerald-600">
           <TrendingUp size={24} />
           <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">CAPITAL ACUMULADO EM 5 ANOS (ECONOMIA REAL)</h4>
        </div>
        <div className="h-[350px] md:h-[400px] w-full bg-emerald-50/30 p-6 md:p-8 rounded-[3rem] border border-emerald-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fiveYearData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 900}} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(val) => `R$ ${val/1000}k`} tick={{fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'rgba(16, 185, 129, 0.05)'}}
                formatter={(val) => formatBRL(Number(val))}
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#065f46' }}
              />
              <Bar dataKey="Economia" radius={[20, 20, 0, 0]}>
                {fiveYearData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? '#059669' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center">
           <h4 className="text-slate-900 font-black text-2xl md:text-3xl uppercase tracking-tighter italic">ECONOMIA TOTAL EM 5 ANOS: <span className="text-3xl md:text-4xl text-emerald-600 block sm:inline">{formatBRL(safeAnnualSavings * 5)}</span></h4>
        </div>
      </div>

      {/* 6. IMPACTO PROJETADO 12 MESES */}
      <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-xl border border-slate-100 space-y-12">
        <div className="flex items-center gap-4 text-emerald-600">
           <BarChart3 size={24} />
           <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">ESTIMATIVA DE IMPACTO PROJETADA (12 MESES)</h4>
        </div>
        <div className="h-[350px] md:h-[400px] w-full bg-slate-50/50 p-6 md:p-8 rounded-[3rem] border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSimples" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReforma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" hide />
              <YAxis tickFormatter={(val) => `R$ ${val/1000}k`} tick={{fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="Simples" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSimples)" />
              <Area type="monotone" dataKey="Reforma" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorReforma)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL ESTRATÉGICO */}
      <PhaseModal 
        phase={activePhaseIndex !== null ? result.strategicRoadmap[activePhaseIndex] : null} 
        index={activePhaseIndex}
        onClose={() => setActivePhaseIndex(null)} 
      />
    </div>
  );
};

// --- BASE LEGAL ---
const AboutPage: React.FC = () => (
  <main className="max-w-[1400px] mx-auto px-6 py-24 space-y-24 animate-in fade-in duration-1000">
    <div className="text-center space-y-10">
      <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">BASE <span className="text-emerald-500">LEGAL</span></h1>
      <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto italic leading-relaxed">
        "O sucesso na nova era tributária não depende apenas de cálculo, mas de antecipação estratégica amparada pela lei."
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
       <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 space-y-8 group hover:border-emerald-400 transition-all">
          <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center text-emerald-400 shadow-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><FileText size={40}/></div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter">PEC 45/2019</h3>
            <p className="text-slate-600 font-bold leading-relaxed text-lg">A base da Reforma Tributária. Institui o IVA Dual (CBS + IBS) para unificar a tributação sobre o consumo no Brasil.</p>
          </div>
       </div>
       <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 space-y-8 group hover:border-blue-400 transition-all">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-slate-950 transition-all"><Landmark size={40}/></div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter">LC 123/2006</h3>
            <p className="text-slate-600 font-bold leading-relaxed text-lg">Estatuto da Micro e Pequena Empresa. O Simples Nacional continua vigente, mas com novos mecanismos de crédito.</p>
          </div>
       </div>
       <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 space-y-8 group hover:border-rose-400 transition-all">
          <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-slate-950 transition-all"><ShieldCheck size={40}/></div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tighter">COMPLIANCE</h3>
            <p className="text-slate-600 font-bold leading-relaxed text-lg">Segurança jurídica. O Radar audita o enquadramento ideal para evitar passivos na transição para o novo modelo.</p>
          </div>
       </div>
    </div>

    <div className="bg-slate-950 text-white p-12 md:p-24 rounded-[6rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
      <div className="relative z-10 space-y-16 md:y-20">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center italic">CRONOGRAMA DE TRANSIÇÃO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div className="border-l-4 border-emerald-500/50 pl-10 md:pl-12 space-y-4 hover:border-emerald-500 transition-all">
            <span className="text-4xl md:text-5xl font-black text-emerald-400 italic tracking-tighter">2026</span>
            <p className="text-lg md:text-xl text-slate-300 font-bold">Fase experimental com alíquota de 1% (0,1% CBS + 0,9% IBS) para teste de sistemas.</p>
          </div>
          <div className="border-l-4 border-emerald-500/50 pl-10 md:pl-12 space-y-4 hover:border-emerald-500 transition-all">
            <span className="text-4xl md:text-5xl font-black text-emerald-400 italic tracking-tighter">2027</span>
            <p className="text-lg md:text-xl text-slate-300 font-bold">Extinção integral do PIS e da COFINS. Início da CBS em regime definitivo.</p>
          </div>
          <div className="border-l-4 border-emerald-500/50 pl-10 md:pl-12 space-y-4 hover:border-emerald-500 transition-all">
            <span className="text-4xl md:text-5xl font-black text-emerald-400 italic tracking-tighter">2029-2032</span>
            <p className="text-lg md:text-xl text-slate-300 font-bold">Redução gradual de ICMS e ISS com elevação proporcional do IBS.</p>
          </div>
          <div className="border-l-4 border-emerald-500/50 pl-10 md:pl-12 space-y-4 hover:border-emerald-500 transition-all">
            <span className="text-4xl md:text-5xl font-black text-emerald-400 italic tracking-tighter">2033</span>
            <p className="text-lg md:text-xl text-slate-300 font-bold">Vigência plena do novo sistema. Extinção definitiva do ICMS e ISS.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
);

// --- APP ---
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [waitingEmail, setWaitingEmail] = useState<string | null>(null);

  useEffect(() => {
    sb.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 size={64} className="animate-spin text-emerald-500" /></div>;
  if (!session) return <AuthScreen onWaitingReset={setWaitingEmail} />;

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#f1f5f9] overflow-x-hidden">
        <Header onLogoutRequest={() => setIsLogoutOpen(true)} />
        <Routes>
          <Route path="/" element={<SimulatorPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <footer className="bg-slate-950 text-white py-24 mt-20 text-center border-t border-white/5">
           <div className="p-2 bg-white inline-block rounded-xl mb-6 shadow-xl"><img src="https://i.postimg.cc/XNLymMpm/gemini-3-pro-image-preview-(nano-banana-pro)-a-Gere-uma-logo-1-1-pa.png" className="w-12 h-12 rounded-lg" /></div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[1em]">TRIBUTOPRIME RADAR © 2025</p>
           <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-4 italic">Sistema de Inteligência Operacional para Micro e Pequenas Empresas</p>
        </footer>
        <LogoutModal isOpen={isLogoutOpen} onCancel={() => setIsLogoutOpen(false)} onConfirm={() => sb.auth.signOut()} />
      </div>
    </Router>
  );
};

export default App;
