import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  Database, 
  PieChart, 
  ShieldAlert,
  Upload,
  Clock,
  Download,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { AppState } from './types';
import { parseExcelData, generateSampleExcel } from './lib/dataService';
import { cn, formatCurrency, formatPercent } from './lib/utils';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, badgeColor }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
    )}
  >
    <Icon size={18} className={cn(active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
    {badge && (
      <span className={cn(
        "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
        badgeColor === 'red' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
      )}>
        {badge}
      </span>
    )}
  </button>
);

const KpiCard = ({ label, value, subValue, trend, color }: any) => (
  <div className={cn(
    "bg-slate-900/50 border border-slate-800 p-5 rounded-xl relative overflow-hidden",
    `before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1`,
    color === 'blue' ? "before:bg-blue-500" : 
    color === 'teal' ? "before:bg-teal-500" : 
    color === 'amber' ? "before:bg-amber-500" : 
    color === 'red' ? "before:bg-red-500" : "before:bg-emerald-500"
  )}>
    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">{label}</p>
    <h3 className="text-2xl font-bold text-slate-100 mb-1 font-mono">{value}</h3>
    <div className="flex items-center gap-2">
      {trend && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded font-bold",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}
      <span className="text-[11px] text-slate-400">{subValue}</span>
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, tag, tagColor }: any) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-lg font-bold text-slate-100 tracking-tight uppercase font-mono">{title}</h2>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
    {tag && (
      <span className={cn(
        "text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest",
        tagColor === 'blue' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
        tagColor === 'teal' ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      )}>
        {tag}
      </span>
    )}
  </div>
);

const AiSummary = ({ data, scenario, metrics }: any) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'professional' | 'simple'>('professional');

  const generateSummary = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        As a senior banking risk analyst, provide a ${style} summary of the following ALM & FTP scenario analysis results.
        
        Bank Context: ${data.metadata.bankName}
        Scenario Parameters:
        - Interest Rate Shock: ${scenario.rateShock} bps
        - Liquidity Haircut: ${scenario.liqHaircut}%
        - Deposit Run-off: ${scenario.depRunoff}%
        - Asset Yield Change: ${scenario.yieldChange} bps
        
        Projected Metrics:
        - Projected NIM: ${metrics.projectedNIM.toFixed(2)}% (Impact: ${metrics.nimImpact.toFixed(2)}%)
        - Projected LCR: ${metrics.projectedLCR.toFixed(1)}%
        - EVE Impact: ₹${metrics.eveImpact.toFixed(2)} Cr
        
        Instructions:
        - If style is 'professional', use technical banking terminology, focus on regulatory compliance (LCR/NSFR), and strategic implications.
        - If style is 'simple', explain what these numbers mean for the bank's health in plain language, using analogies if helpful.
        - Keep it concise (max 200 words).
        - Use markdown for formatting.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setSummary(response.text || "Failed to generate summary.");
    } catch (error) {
      console.error("AI Summary Error:", error);
      setSummary("Error generating AI summary. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-blue-500/30 p-6 rounded-2xl mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} className="text-blue-500" />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} />
            AI Risk Insights
          </h3>
          <p className="text-[10px] text-slate-500 uppercase mt-1">Powered by Gemini AI</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setStyle('professional')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                style === 'professional' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Professional
            </button>
            <button 
              onClick={() => setStyle('simple')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                style === 'simple' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Simple
            </button>
          </div>
          
          <button 
            onClick={generateSummary}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {summary ? 'Regenerate' : 'Analyze with AI'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-slate-500 font-mono animate-pulse">Synthesizing risk data...</p>
          </motion.div>
        ) : summary ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-invert prose-xs max-w-none relative z-10"
          >
            <div className="text-slate-300 text-xs leading-relaxed space-y-4">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-xs text-slate-600 italic">Click "Analyze with AI" to generate a smart summary of this scenario.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FullAiReport = ({ data }: { data: AppState }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<'professional' | 'simple'>('professional');

  const generateReport = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const prompt = `
        As a Chief Risk Officer (CRO), provide a comprehensive ${style} risk report for ${data.metadata.bankName}.
        
        Financial Context:
        - Total Assets: ₹${data.metadata.totalAssets} Cr
        - Total Liabilities: ₹${data.metadata.totalLiabilities} Cr
        - Equity: ₹${data.metadata.equity} Cr
        - MCLR: ${data.metadata.mclr}%
        
        Risk Data:
        - Maturity Buckets: ${JSON.stringify(data.buckets.map(b => ({ label: b.label, gap: b.gap })))}
        - Credit Watchlist: ${data.creditAccounts.filter(a => a.isWatchlist).length} accounts
        - Business Units: ${JSON.stringify(data.businessUnits.map(u => ({ name: u.name, nim: u.netFtpNim })))}
        
        Instructions:
        - If style is 'professional', focus on EVE sensitivity, NIM trends, and credit portfolio health. Use formal executive language.
        - If style is 'simple', explain the bank's overall stability and main risks in a way a non-expert board member would understand.
        - Structure the report with sections: Executive Summary, Liquidity Position, Interest Rate Risk, and Recommendations.
        - Keep it under 400 words.
        - Use markdown.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setReport(response.text || "Failed to generate report.");
    } catch (error) {
      console.error("AI Report Error:", error);
      setReport("Error generating AI report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="text-blue-400" />
            Executive AI Risk Report
          </h2>
          <p className="text-sm text-slate-500 mt-1">Comprehensive analysis of ALM, FTP, and Credit Risk</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => setStyle('professional')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all",
                style === 'professional' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Professional
            </button>
            <button 
              onClick={() => setStyle('simple')}
              className={cn(
                "px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all",
                style === 'simple' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Simple
            </button>
          </div>
          
          <button 
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-900/20"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {report ? 'Refresh Report' : 'Generate Full Report'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" size={24} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-1">AI Analyst is working...</p>
              <p className="text-sm text-slate-500 font-mono">Aggregating cross-module risk data</p>
            </div>
          </motion.div>
        ) : report ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950/50 border border-slate-800 p-8 rounded-2xl relative z-10"
          >
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Database className="text-slate-600" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No report generated yet.</p>
            <p className="text-xs text-slate-600 mt-1">Select a style and click the button above to start the analysis.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [state, setState] = useState<AppState>({
    metadata: {
      bankName: 'RiskGuard Demo Bank',
      reportDate: '2026-03-24',
      quarter: 'Q1 2026',
      totalAssets: 45000,
      totalLiabilities: 40000,
      equity: 5000,
      mclr: 8.5,
      repoRate: 6.5
    },
    buckets: [],
    ftpTransactions: [],
    creditAccounts: [],
    businessUnits: [],
    isLoaded: false
  });

  const [scenario, setScenario] = useState({
    rateShock: 100, // bps
    liqHaircut: 5, // %
    depRunoff: 10, // %
    yieldChange: 50, // bps
  });

  const calculateScenarioMetrics = () => {
    const baseNIM = state.isLoaded ? state.businessUnits.reduce((a, b) => a + b.netFtpNim, 0) / (state.businessUnits.length || 1) : 8.20;
    const gap = state.isLoaded ? state.buckets.reduce((a, b) => a + b.gap, 0) : 1600;
    const totalAssets = state.metadata.totalAssets || 45000;
    
    // Projected NIM Impact
    const nimImpact = (gap * (scenario.rateShock / 10000)) / totalAssets * 100;
    const projectedNIM = baseNIM + nimImpact;

    // Projected LCR
    const baseHQLA = 6420;
    const baseNCO = 4640;
    const projectedHQLA = baseHQLA * (1 - scenario.liqHaircut / 100);
    const projectedNCO = baseNCO * (1 + scenario.depRunoff / 100);
    const projectedLCR = (projectedHQLA / projectedNCO) * 100;

    // Projected EVE (Simplified)
    const durationGap = 1.42;
    const eveImpact = -(durationGap * totalAssets * (scenario.rateShock / 10000));
    
    return {
      projectedNIM,
      projectedLCR,
      eveImpact,
      nimImpact
    };
  };

  const scenarioMetrics = calculateScenarioMetrics();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Live Feed Simulation
    const feedInterval = setInterval(() => {
      const events = [
        "New Term Loan (₹12Cr) processed in Corporate Banking",
        "MCLR updated to 8.55% for 1Y tenor",
        "LCR buffer increased by ₹45Cr due to HQLA inflow",
        "Watchlist alert: PD for ACC003 increased to 4.2%",
        "FTP Pool Rate for 3Y tenor adjusted by +5bps",
        "Retail Savings inflow: ₹8.4Cr recorded",
        "Duration gap tightened to +1.42 Yrs"
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLiveFeed(prev => [
        `${new Date().toLocaleTimeString('en-IN', { hour12: false })}: ${randomEvent}`,
        ...prev.slice(0, 4)
      ]);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(feedInterval);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const parsed = parseExcelData(buffer);
    setState(prev => ({ ...prev, ...parsed, isLoaded: true }));
  };

  const resetData = () => {
    setState(prev => ({
      ...prev,
      isLoaded: false,
      buckets: [],
      ftpTransactions: [],
      creditAccounts: [],
      businessUnits: [],
    }));
    setActiveTab('dashboard');
  };

  const downloadSample = (risk: 'low' | 'moderate' | 'high') => {
    const buffer = generateSampleExcel(risk);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Data_${risk.toUpperCase()}_RISK.xlsx`;
    a.click();
  };

  const COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#10b981', '#ef4444'];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 border-b border-slate-800">
          <div className="text-[10px] font-bold text-teal-500 uppercase tracking-[0.2em] mb-1">Banking Suite</div>
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
            <ShieldAlert className="text-blue-500" size={24} />
            RISKGUARD
          </h1>
          <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Enterprise v3.0</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2">Main</div>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2 mt-4">ALM Module</div>
          <SidebarItem 
            icon={ArrowLeftRight} 
            label="Gap Analysis" 
            active={activeTab === 'gap'} 
            onClick={() => setActiveTab('gap')} 
          />
          <SidebarItem 
            icon={Droplets} 
            label="Liquidity Risk" 
            active={activeTab === 'liquidity'} 
            onClick={() => setActiveTab('liquidity')} 
            badge={state.isLoaded ? "!" : ""}
            badgeColor="amber"
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="Interest Rate Risk" 
            active={activeTab === 'irr'} 
            onClick={() => setActiveTab('irr')} 
          />
          <SidebarItem 
            icon={Calculator} 
            label="Scenario Analysis" 
            active={activeTab === 'scenario'} 
            onClick={() => setActiveTab('scenario')} 
            badge="New"
            badgeColor="blue"
          />

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2 mt-4">FTP Module</div>
          <SidebarItem 
            icon={Calculator} 
            label="FTP Calculator" 
            active={activeTab === 'ftp'} 
            onClick={() => setActiveTab('ftp')} 
          />
          <SidebarItem 
            icon={Database} 
            label="Pool Rates" 
            active={activeTab === 'pool'} 
            onClick={() => setActiveTab('pool')} 
          />
          <SidebarItem 
            icon={PieChart} 
            label="Unit Profitability" 
            active={activeTab === 'profit'} 
            onClick={() => setActiveTab('profit')} 
          />

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-4 py-2 mt-4">Credit Risk</div>
          <SidebarItem 
            icon={ShieldAlert} 
            label="Risk Analyzer" 
            active={activeTab === 'credit'} 
            onClick={() => setActiveTab('credit')} 
            badge={state.creditAccounts.filter(a => a.isWatchlist).length || ""}
            badgeColor="red"
          />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Live</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mb-4">
            {state.isLoaded ? `Synced: ${state.metadata.bankName}` : "Awaiting Data Upload"}
          </div>
          {state.isLoaded && (
            <button
              onClick={resetData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider"
            >
              <Upload size={12} />
              Re-upload Data
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.toUpperCase()}
            </div>
            <h2 className="text-sm font-bold text-slate-200">
              {state.metadata.bankName} — {state.metadata.quarter}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 font-mono text-xs">
              <Clock size={14} className="text-blue-500" />
              {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Risk Level:</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                state.isLoaded ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
              )}>
                {state.isLoaded ? "Normal" : "Pending"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-[1600px] mx-auto w-full">
          {/* Upload Banner */}
          {!state.isLoaded && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-blue-600/5 border border-blue-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                <Upload size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2">Initialize Your Risk Dashboard</h3>
                <p className="text-slate-400 text-sm max-w-xl">
                  Upload your bank's ALM & FTP data in Excel format to unlock real-time analytics, 
                  gap analysis, and credit risk modeling.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                  <button 
                    onClick={() => downloadSample('low')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download size={14} /> Low Risk Sample
                  </button>
                  <button 
                    onClick={() => downloadSample('moderate')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download size={14} /> Moderate Risk Sample
                  </button>
                  <button 
                    onClick={() => downloadSample('high')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Download size={14} /> High Risk Sample
                  </button>
                </div>
              </div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <Upload size={20} />
                Upload Excel
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx" />
              </label>
            </motion.div>
          )}

          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Live Feed Banner */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4 overflow-hidden relative">
                <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Feed</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={liveFeed[0]}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-xs text-slate-300 font-mono truncate"
                    >
                      {liveFeed[0] || "Awaiting system events..."}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="text-[10px] text-slate-500 font-mono shrink-0">
                  {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard 
                  label="Net Interest Margin" 
                  value={state.isLoaded ? formatPercent(state.businessUnits.reduce((a, b) => a + b.netFtpNim, 0) / (state.businessUnits.length || 1)) : "8.20%"} 
                  subValue="Asset Yield - Liab Cost"
                  trend="up"
                  color="blue"
                />
                <KpiCard 
                  label="Liquidity Coverage" 
                  value={state.isLoaded ? "138.4%" : "124.0%"} 
                  subValue="Min Requirement: 100%"
                  trend="up"
                  color="teal"
                />
                <KpiCard 
                  label="Net Stable Funding" 
                  value={state.isLoaded ? "112.1%" : "108.5%"} 
                  subValue="Basel III Compliance"
                  trend="up"
                  color="amber"
                />
                <KpiCard 
                  label="FTP Spread" 
                  value={state.isLoaded ? "1.42%" : "1.25%"} 
                  subValue="Avg Net Transfer"
                  trend="up"
                  color="emerald"
                />
                <KpiCard 
                  label="IR Sensitivity" 
                  value={state.isLoaded ? `+₹${(state.buckets.reduce((a, b) => a + b.niiImpact, 0)).toFixed(1)}Cr` : "+₹12.0Cr"} 
                  subValue="@100bps Rate Shock"
                  trend="down"
                  color="red"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="NII Sensitivity — Rate Shocks" 
                    subtitle="Impact on Net Interest Income (₹ Crore)" 
                    tag="ALM" 
                    tagColor="blue"
                  />
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={state.isLoaded ? [
                        { name: '-200bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 2) },
                        { name: '-100bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0)) },
                        { name: '-50bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 0.5) },
                        { name: '0bps', value: 0 },
                        { name: '+50bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 0.5) },
                        { name: '+100bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0)) },
                        { name: '+200bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 2) },
                      ] : [
                        { name: '-200bps', value: -32 },
                        { name: '-100bps', value: -16 },
                        { name: '-50bps', value: -8 },
                        { name: '0bps', value: 0 },
                        { name: '+50bps', value: 8 },
                        { name: '+100bps', value: 16 },
                        { name: '+200bps', value: 32 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          itemStyle={{ color: '#3b82f6' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {(state.isLoaded ? [
                            { name: '-200bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 2) },
                            { name: '-100bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0)) },
                            { name: '-50bps', value: -(state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 0.5) },
                            { name: '0bps', value: 0 },
                            { name: '+50bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 0.5) },
                            { name: '+100bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0)) },
                            { name: '+200bps', value: (state.buckets.reduce((a, b) => a + b.niiImpact, 0) * 2) },
                          ] : [
                            { name: '-200bps', value: -32 },
                            { name: '-100bps', value: -16 },
                            { name: '-50bps', value: -8 },
                            { name: '0bps', value: 0 },
                            { name: '+50bps', value: 8 },
                            { name: '+100bps', value: 16 },
                            { name: '+200bps', value: 32 },
                          ]).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="FTP Contribution by Unit" 
                    subtitle="Transfer pricing spread allocation" 
                    tag="FTP" 
                    tagColor="teal"
                  />
                  <div className="h-[300px] w-full mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={state.isLoaded ? state.businessUnits.map(u => ({ name: u.name, value: u.loans + u.deposits })) : [
                            { name: 'Retail', value: 45 },
                            { name: 'Corporate', value: 30 },
                            { name: 'SME', value: 15 },
                            { name: 'Treasury', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 ml-4">
                      {(state.isLoaded ? state.businessUnits : [{name:'Retail'},{name:'Corporate'},{name:'SME'},{name:'Treasury'}]).map((u, i) => (
                        <div key={u.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] uppercase font-bold text-slate-400">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">Portfolio Summary — Maturity Buckets</h3>
                  <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    View Full Report <ChevronRight size={12} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-500 font-mono uppercase tracking-widest">
                        <th className="px-6 py-4 font-bold">Bucket</th>
                        <th className="px-6 py-4 font-bold text-right">Assets (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">Liabilities (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">Gap</th>
                        <th className="px-6 py-4 font-bold text-right">Cumul. Gap</th>
                        <th className="px-6 py-4 font-bold text-right">FTP Rate</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(state.isLoaded ? state.buckets : []).map((b, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-300">{b.label}</td>
                          <td className="px-6 py-4 text-right font-mono">{b.assets.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono">{b.liabilities.toLocaleString()}</td>
                          <td className={cn(
                            "px-6 py-4 text-right font-mono font-bold",
                            b.gap >= 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {b.gap >= 0 ? '+' : ''}{b.gap.toLocaleString()}
                          </td>
                          <td className={cn(
                            "px-6 py-4 text-right font-mono",
                            b.cumulativeGap >= 0 ? "text-emerald-500/70" : "text-red-500/70"
                          )}>
                            {b.cumulativeGap.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-blue-400">{b.ftpRate}%</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                              b.gap >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {b.gap >= 0 ? 'Surplus' : 'Deficit'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!state.isLoaded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-600 italic">
                            No data loaded. Please upload an Excel file to view the portfolio summary.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <FullAiReport data={state} />
            </div>
          )}

          {/* Gap Analysis View */}
          {activeTab === 'gap' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="Gap Analysis Chart" 
                    subtitle="Asset vs Liability Maturity Profile" 
                    tag="ALM" 
                    tagColor="blue"
                  />
                  <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={state.buckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        />
                        <Bar dataKey="assets" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Assets" />
                        <Bar dataKey="liabilities" fill="#ef4444" radius={[4, 4, 0, 0]} name="Liabilities" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader title="Gap Summary" subtitle="Key ALM Metrics" />
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total RSA</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">
                        {formatCurrency(state.buckets.reduce((a, b) => a + b.assets, 0))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total RSL</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">
                        {formatCurrency(state.buckets.reduce((a, b) => a + b.liabilities, 0))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Net Gap</div>
                      <div className={cn(
                        "text-xl font-bold font-mono",
                        (state.buckets.reduce((a, b) => a + b.gap, 0)) >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {formatCurrency(state.buckets.reduce((a, b) => a + b.gap, 0))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Duration Gap</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">1.42 Yrs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FTP View */}
          {activeTab === 'ftp' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="FTP Calculator" 
                    subtitle="Calculate transfer pricing for new transactions" 
                    tag="FTP" 
                    tagColor="teal"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Product Type</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-blue-500">
                        <option>Term Loan</option>
                        <option>Mortgage</option>
                        <option>Savings Deposit</option>
                        <option>Fixed Deposit</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Amount (₹Cr)</label>
                      <input type="number" defaultValue="100" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Maturity (Months)</label>
                      <input type="number" defaultValue="36" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Contract Rate (%)</label>
                      <input type="number" defaultValue="9.5" step="0.1" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all">
                    Calculate FTP Rate
                  </button>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader title="Calculation Result" subtitle="FTP Breakdown" />
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-center p-3 border-b border-slate-800">
                      <span className="text-xs text-slate-500">Base Pool Rate</span>
                      <span className="text-sm font-bold text-slate-200 font-mono">7.40%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border-b border-slate-800">
                      <span className="text-xs text-slate-500">Liquidity Premium</span>
                      <span className="text-sm font-bold text-slate-200 font-mono">+0.25%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border-b border-slate-800">
                      <span className="text-xs text-slate-500">Credit Spread</span>
                      <span className="text-sm font-bold text-slate-200 font-mono">+0.45%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-600/10 rounded-lg">
                      <span className="text-xs font-bold text-blue-400">All-In FTP Rate</span>
                      <span className="text-lg font-bold text-blue-400 font-mono">8.10%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-emerald-600/10 rounded-lg">
                      <span className="text-xs font-bold text-emerald-400">Net Spread (Profit)</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">1.40%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">FTP Transaction Log</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-500 font-mono uppercase tracking-widest">
                        <th className="px-6 py-4 font-bold">Txn ID</th>
                        <th className="px-6 py-4 font-bold">Product</th>
                        <th className="px-6 py-4 font-bold">Unit</th>
                        <th className="px-6 py-4 font-bold text-right">Amount (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">Maturity</th>
                        <th className="px-6 py-4 font-bold text-right">Contract Rate</th>
                        <th className="px-6 py-4 font-bold text-right">FTP Pool Rate</th>
                        <th className="px-6 py-4 font-bold text-right">Net Spread</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {state.ftpTransactions.map((t, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-300">{t.id}</td>
                          <td className="px-6 py-4 text-slate-500">{t.product}</td>
                          <td className="px-6 py-4 text-slate-500">{t.unit}</td>
                          <td className="px-6 py-4 text-right font-mono">{t.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono">{t.maturity}mo</td>
                          <td className="px-6 py-4 text-right font-mono">{t.contractRate.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono text-blue-400">{t.poolRate.toFixed(2)}%</td>
                          <td className={cn(
                            "px-6 py-4 text-right font-mono font-bold",
                            t.netSpread >= 0 ? "text-emerald-500" : "text-red-500"
                          )}>
                            {t.netSpread.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Credit Risk View */}
          {activeTab === 'credit' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KpiCard 
                  label="Gross NPA" 
                  value={state.isLoaded ? "3.84%" : "4.20%"} 
                  subValue="Portfolio Non-Performing"
                  trend="down"
                  color="red"
                />
                <KpiCard 
                  label="Avg Portfolio PD" 
                  value={state.isLoaded ? "2.10%" : "2.50%"} 
                  subValue="Weighted Avg PD"
                  trend="down"
                  color="amber"
                />
                <KpiCard 
                  label="Total Expected Loss" 
                  value={state.isLoaded ? "₹142.5Cr" : "₹185.0Cr"} 
                  subValue="Provisioning Requirement"
                  trend="down"
                  color="blue"
                />
                <KpiCard 
                  label="Watchlist Accounts" 
                  value={state.isLoaded ? state.creditAccounts.filter(a => a.isWatchlist).length : "0"} 
                  subValue="Requires Immediate Review"
                  trend="up"
                  color="red"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="Portfolio Credit Quality" 
                    subtitle="Distribution by Internal Rating" 
                    tag="Credit Risk" 
                    tagColor="red"
                  />
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'AAA', value: 400 },
                        { name: 'AA', value: 300 },
                        { name: 'A', value: 200 },
                        { name: 'BBB', value: 150 },
                        { name: 'BB', value: 80 },
                        { name: 'B', value: 40 },
                        { name: 'CCC', value: 10 },
                      ]}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="Risk Alerts" 
                    subtitle="Critical accounts & breaches" 
                  />
                  <div className="space-y-4">
                    {state.creditAccounts.filter(a => a.isWatchlist).map(a => (
                      <div key={a.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-red-500 shrink-0" size={18} />
                        <div>
                          <div className="text-xs font-bold text-red-400 uppercase tracking-wider">{a.borrower}</div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Rating downgraded to {a.rating}. PD increased to {(a.pd * 100).toFixed(2)}%.
                          </p>
                        </div>
                      </div>
                    ))}
                    {state.creditAccounts.filter(a => a.isWatchlist).length === 0 && (
                      <div className="p-12 text-center text-slate-600 italic text-xs">
                        No critical risk alerts at this time.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">Borrower Level Expected Loss</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-500 font-mono uppercase tracking-widest">
                        <th className="px-6 py-4 font-bold">Borrower</th>
                        <th className="px-6 py-4 font-bold">Sector</th>
                        <th className="px-6 py-4 font-bold text-right">EAD (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">PD (%)</th>
                        <th className="px-6 py-4 font-bold text-right">LGD (%)</th>
                        <th className="px-6 py-4 font-bold text-right">EL (₹Cr)</th>
                        <th className="px-6 py-4 font-bold">Rating</th>
                        <th className="px-6 py-4">Watchlist</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {state.creditAccounts.map((a, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-300">{a.borrower}</td>
                          <td className="px-6 py-4 text-slate-500">{a.sector}</td>
                          <td className="px-6 py-4 text-right font-mono">{a.ead.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono text-amber-500">{(a.pd * 100).toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono text-slate-400">{(a.lgd * 100).toFixed(0)}%</td>
                          <td className="px-6 py-4 text-right font-mono text-red-500 font-bold">{a.el.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                              {a.rating}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {a.isWatchlist ? (
                              <span className="text-red-500 font-bold uppercase text-[10px]">Yes</span>
                            ) : (
                              <span className="text-slate-600 uppercase text-[10px]">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Analysis View */}
          {activeTab === 'scenario' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <SectionHeader 
                    title="Scenario Inputs" 
                    subtitle="Adjust parameters to simulate stress" 
                    tag="Simulation" 
                    tagColor="blue"
                  />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Interest Rate Shock (bps)</label>
                        <span className="text-xs font-mono text-blue-400">{scenario.rateShock} bps</span>
                      </div>
                      <input 
                        type="range" min="-500" max="500" step="10"
                        value={scenario.rateShock}
                        onChange={(e) => setScenario(prev => ({ ...prev, rateShock: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Liquidity Haircut (%)</label>
                        <span className="text-xs font-mono text-teal-400">{scenario.liqHaircut}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" step="1"
                        value={scenario.liqHaircut}
                        onChange={(e) => setScenario(prev => ({ ...prev, liqHaircut: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Deposit Run-off (%)</label>
                        <span className="text-xs font-mono text-amber-400">{scenario.depRunoff}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" step="1"
                        value={scenario.depRunoff}
                        onChange={(e) => setScenario(prev => ({ ...prev, depRunoff: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Asset Yield Change (bps)</label>
                        <span className="text-xs font-mono text-emerald-400">{scenario.yieldChange} bps</span>
                      </div>
                      <input 
                        type="range" min="-200" max="200" step="5"
                        value={scenario.yieldChange}
                        onChange={(e) => setScenario(prev => ({ ...prev, yieldChange: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => setScenario({ rateShock: 0, liqHaircut: 0, depRunoff: 0, yieldChange: 0 })}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                    >
                      Reset to Baseline
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-4">Projected NIM Impact</div>
                      <div className="flex items-end gap-3">
                        <div className="text-3xl font-bold text-white font-mono">{scenarioMetrics.projectedNIM.toFixed(2)}%</div>
                        <div className={cn(
                          "text-xs font-bold mb-1",
                          scenarioMetrics.nimImpact >= 0 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {scenarioMetrics.nimImpact >= 0 ? '+' : ''}{scenarioMetrics.nimImpact.toFixed(2)}%
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500", scenarioMetrics.nimImpact >= 0 ? "bg-emerald-500" : "bg-red-500")}
                          style={{ width: `${Math.min(Math.abs(scenarioMetrics.projectedNIM) * 10, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-4">Projected LCR</div>
                      <div className="flex items-end gap-3">
                        <div className="text-3xl font-bold text-white font-mono">{scenarioMetrics.projectedLCR.toFixed(1)}%</div>
                        <div className={cn(
                          "text-xs font-bold mb-1",
                          scenarioMetrics.projectedLCR >= 100 ? "text-emerald-500" : "text-red-500"
                        )}>
                          {scenarioMetrics.projectedLCR >= 100 ? 'Compliant' : 'Breach'}
                        </div>
                      </div>
                      <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-500", scenarioMetrics.projectedLCR >= 100 ? "bg-teal-500" : "bg-red-500")}
                          style={{ width: `${Math.min(scenarioMetrics.projectedLCR / 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <SectionHeader 
                      title="Scenario Comparison" 
                      subtitle="Base vs Projected Metrics" 
                    />
                    <div className="h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'NIM (%)', base: 8.20, projected: scenarioMetrics.projectedNIM },
                          { name: 'LCR (%)', base: 138.4, projected: scenarioMetrics.projectedLCR },
                          { name: 'NSFR (%)', base: 112.1, projected: 112.1 - (scenario.depRunoff * 0.5) },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                          />
                          <Bar dataKey="base" fill="#334155" radius={[4, 4, 0, 0]} name="Baseline" />
                          <Bar dataKey="projected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Scenario" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <ShieldAlert className="text-red-500 shrink-0" size={24} />
                      <div>
                        <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Stress Impact Analysis</h4>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Under the current scenario ({scenario.rateShock}bps rate shock and {scenario.depRunoff}% deposit run-off), 
                          the bank's EVE would decrease by <span className="text-red-400 font-bold">₹{Math.abs(scenarioMetrics.eveImpact).toFixed(1)}Cr</span>. 
                          {scenarioMetrics.projectedLCR < 100 ? " LCR falls below regulatory minimums, requiring immediate liquidity injection." : " Liquidity remains within acceptable bounds."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <AiSummary 
                    data={state} 
                    scenario={scenario} 
                    metrics={scenarioMetrics} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Risk View */}
          {activeTab === 'liquidity' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard 
                  label="LCR" 
                  value="138.4%" 
                  subValue="Liquidity Coverage Ratio"
                  trend="up"
                  color="teal"
                />
                <KpiCard 
                  label="HQLA Buffer" 
                  value="₹6,420 Cr" 
                  subValue="High Quality Liquid Assets"
                  trend="up"
                  color="blue"
                />
                <KpiCard 
                  label="Net Cash Outflow" 
                  value="₹4,640 Cr" 
                  subValue="30-Day Stress Window"
                  trend="down"
                  color="amber"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="Liquidity Gap Analysis" 
                    subtitle="Cumulative Mismatch by Bucket" 
                    tag="Liquidity" 
                    tagColor="teal"
                  />
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={state.buckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="label" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="cumulativeGap" stroke="#0d9488" fill="#0d9488" fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader title="Regulatory Compliance" subtitle="Basel III Ratios" />
                  <div className="space-y-6 mt-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                        <span className="text-slate-400">LCR (Liquidity Coverage Ratio)</span>
                        <span className="text-emerald-500">138.4% / 100% Min</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '86%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                        <span className="text-slate-400">NSFR (Net Stable Funding Ratio)</span>
                        <span className="text-emerald-500">112.1% / 100% Min</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '75%' }} />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs text-emerald-400 font-medium">
                        ✓ Bank maintains adequate liquidity buffers above regulatory minimums for the current reporting period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interest Rate Risk View */}
          {activeTab === 'irr' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader 
                    title="EVE Sensitivity" 
                    subtitle="Economic Value of Equity Impact" 
                    tag="IRR" 
                    tagColor="amber"
                  />
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: '-200', value: 420 },
                        { name: '-100', value: 210 },
                        { name: '0', value: 0 },
                        { name: '+100', value: -210 },
                        { name: '+200', value: -420 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={3} dot={{ fill: '#d97706' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                  <SectionHeader title="Duration Gap Analysis" subtitle="Interest Rate Risk Metrics" />
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Asset Duration</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">4.25 Yrs</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Liab Duration</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">2.80 Yrs</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Duration Gap</div>
                      <div className="text-xl font-bold text-emerald-500 font-mono">+1.45 Yrs</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Convexity</div>
                      <div className="text-xl font-bold text-slate-100 font-mono">0.12</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pool Rates View */}
          {activeTab === 'pool' && (
            <div className="space-y-8">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <SectionHeader 
                  title="FTP Pool Rate Curve" 
                  subtitle="Base rates for transfer pricing by tenor" 
                  tag="Pool" 
                  tagColor="blue"
                />
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'O/N', rate: 6.25, mclr: 8.35 },
                      { name: '1M', rate: 6.60, mclr: 8.40 },
                      { name: '3M', rate: 6.95, mclr: 8.45 },
                      { name: '6M', rate: 7.30, mclr: 8.50 },
                      { name: '1Y', rate: 7.65, mclr: 8.60 },
                      { name: '3Y', rate: 8.20, mclr: 8.80 },
                      { name: '5Y', rate: 8.55, mclr: 8.95 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} name="FTP Pool Rate" />
                      <Line type="monotone" dataKey="mclr" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" name="MCLR" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Unit Profitability View */}
          {activeTab === 'profit' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {state.businessUnits.map((u, i) => (
                  <KpiCard 
                    key={u.name}
                    label={u.name} 
                    value={formatPercent(u.netFtpNim)} 
                    subValue={`RAROC: ${u.raroc}%`}
                    trend={u.raroc > 15 ? "up" : "down"}
                    color={i === 0 ? "blue" : i === 1 ? "teal" : "amber"}
                  />
                ))}
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">Business Unit P&L — FTP Adjusted</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-500 font-mono uppercase tracking-widest">
                        <th className="px-6 py-4 font-bold">Business Unit</th>
                        <th className="px-6 py-4 font-bold text-right">Loans (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">Deposits (₹Cr)</th>
                        <th className="px-6 py-4 font-bold text-right">FTP Charge</th>
                        <th className="px-6 py-4 font-bold text-right">FTP Credit</th>
                        <th className="px-6 py-4 font-bold text-right">Lending Spread</th>
                        <th className="px-6 py-4 font-bold text-right">Deposit Spread</th>
                        <th className="px-6 py-4 font-bold text-right">Net FTP NIM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {state.businessUnits.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-300">{u.name}</td>
                          <td className="px-6 py-4 text-right font-mono">{u.loans.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono">{u.deposits.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono text-red-400">{u.ftpCharge.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono text-emerald-400">{u.ftpCredit.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono">{u.lendingSpread.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono">{u.depositSpread.toFixed(2)}%</td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-blue-400">{u.netFtpNim.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
