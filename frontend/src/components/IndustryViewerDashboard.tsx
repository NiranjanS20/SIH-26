import React, { useState } from 'react';
import { type PortalRoute } from './Navbar';
import { ThemeToggleSwitch } from './ui/ThemeToggleSwitch';
import { useAuth } from '../contexts/AuthContext';

interface IndustryViewerDashboardProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

// ── Static supply intelligence data ──────────────────────────────────────────
const SUPPLY_MINES = [
  { id: 'dongri-buzurg', name: 'Dongri Buzurg', district: 'Bhandara, MH', grade: 'Mn 44-46%', annualCapacity: 250000, currentForecast: 231000, status: 'OPERATIONAL' },
  { id: 'balaghat',      name: 'Balaghat',      district: 'Balaghat, MP',  grade: 'Mn 40-44%', annualCapacity: 800000, currentForecast: 762000, status: 'OPERATIONAL' },
  { id: 'tirodi',        name: 'Tirodi',         district: 'Balaghat, MP',  grade: 'Mn 38-42%', annualCapacity: 180000, currentForecast: 165000, status: 'OPERATIONAL' },
  { id: 'sitapatore',   name: 'Sitapatore',     district: 'Balaghat, MP',  grade: 'Mn 36-40%', annualCapacity: 120000, currentForecast: 112000, status: 'MAINTENANCE' },
];

const PRODUCT_CATALOGUE = [
  { grade: 'MOIL High Grade (Mn > 46%)',  form: 'Lump & Fines', typical: 'Mn: 47-50%, Fe: 9%, SiO2: 5%',   tier: 'High',        applications: 'EMD, High-grade alloys' },
  { grade: 'MOIL Grade A (Mn 44-46%)',    form: 'Lump',         typical: 'Mn: 44-46%, Fe: 12%, SiO2: 7%',  tier: 'Medium-High', applications: 'Ferro-manganese, Silicomanganese' },
  { grade: 'MOIL Grade B (Mn 40-44%)',    form: 'Lump & Fines', typical: 'Mn: 40-44%, Fe: 15%, SiO2: 9%',  tier: 'Medium',      applications: 'Steel making, Ferro-alloys' },
  { grade: 'MOIL Grade C (Mn 36-40%)',    form: 'Fines',        typical: 'Mn: 36-40%, Fe: 18%, SiO2: 12%', tier: 'Standard',    applications: 'Sintering, Blending feedstock' },
];

const THREE_MONTH_OUTLOOK = [
  { month: 'Oct 2025', planned: 245000, forecast: 238000, confidence: 'HIGH',   note: 'Post-monsoon ramp-up expected.' },
  { month: 'Nov 2025', planned: 260000, forecast: 252000, confidence: 'HIGH',   note: 'Blasting schedule optimised.' },
  { month: 'Dec 2025', planned: 255000, forecast: 240000, confidence: 'MEDIUM', note: 'Equipment maintenance window.' },
];

const COMPLIANCE_ITEMS = [
  { label: 'Forest Clearance Status',    value: 'Active — Stage II, MoEFCC',           status: 'OK' },
  { label: 'Environmental Compliance',   value: 'Valid through 2028',                   status: 'OK' },
  { label: 'Mine Plan Approval',         value: 'DGMS-approved, 2024',                  status: 'OK' },
  { label: 'Water Conservation Index',   value: '82% recycled process water',           status: 'OK' },
  { label: 'Rehabilitation Fund',        value: 'DMFT levy: Rs 4.2 Cr deposited FY25', status: 'OK' },
  { label: 'Carbon Disclosure',          value: 'Scope 1 & 2 reported annually',        status: 'PENDING' },
];

const PUBLIC_UPDATES = [
  { date: 'Sep 2025', headline: 'Q2 FY26 Production Report Released',    detail: 'MOIL reports 18.4 lakh MT production in H1 FY26, 6% ahead of FY25.' },
  { date: 'Aug 2025', headline: 'New Ore-processing Facility at Balaghat', detail: 'Capacity expansion to 10 lakh MTPA announced; commissioning Q1 FY27.' },
  { date: 'Jul 2025', headline: 'MOIL Wins CII Sustainability Award',     detail: 'Recognised for best practices in mine reclamation and water conservation.' },
];

const ALT_SOURCES = [
  { supplier: 'MOIL Limited (India)',           grade: 'Mn 40-50%', reliability: 'Very High',    logistics: 'Rail + Road, Domestic',   esg: 5, note: 'Government enterprise, long-term contracts available.', recommended: true },
  { supplier: 'Assmang (South Africa)',          grade: 'Mn 36-48%', reliability: 'High',         logistics: 'Sea freight, 28-35 days', esg: 4, note: 'Major export-oriented producer.', recommended: false },
  { supplier: 'Consolidated Minerals (AU)',      grade: 'Mn 44-50%', reliability: 'High',         logistics: 'Sea freight, 18-22 days', esg: 4, note: 'Woodie Woodie mine operations.', recommended: false },
  { supplier: 'Eramet (Gabon/Norway)',           grade: 'Mn 44-48%', reliability: 'Medium-High',  logistics: 'Sea freight, 35-42 days', esg: 4, note: 'High-grade specialty products.', recommended: false },
];

type DashTab = 'supply' | 'catalogue' | 'outlook' | 'esg' | 'compare';

export const IndustryViewerDashboard: React.FC<IndustryViewerDashboardProps> = ({
  onNavigate,
  themeMode = 'light',
  onToggleTheme,
}) => {
  const { user, logout } = useAuth();
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState<DashTab>('supply');
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ grade: '', volume: '', timeline: '', contact: '' });

  const totalForecast    = SUPPLY_MINES.reduce((s, m) => s + m.currentForecast, 0);
  const totalCapacity    = SUPPLY_MINES.reduce((s, m) => s + m.annualCapacity, 0);
  const coveragePct      = Math.round((totalForecast / totalCapacity) * 100);
  const operationalCount = SUPPLY_MINES.filter(m => m.status === 'OPERATIONAL').length;

  // Theme tokens
  const pageBg     = isDark ? 'bg-[#12151B] text-slate-100' : 'bg-[#F0F4F9] text-slate-900';
  const cardBg     = isDark ? 'bg-[#1C2028] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const nestedBg   = isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200';
  const textPrimary= isDark ? 'text-white' : 'text-slate-900';
  const textMuted  = isDark ? 'text-slate-400' : 'text-slate-500';
  const divider    = isDark ? 'border-white/10' : 'border-slate-200';

  const TABS: { id: DashTab; label: string; icon: string }[] = [
    { id: 'supply',    label: 'Supply Overview', icon: 'inventory_2' },
    { id: 'catalogue', label: 'Product & Grade', icon: 'category' },
    { id: 'outlook',   label: '3-Month Outlook', icon: 'calendar_month' },
    { id: 'esg',       label: 'ESG & Compliance', icon: 'eco' },
    { id: 'compare',   label: 'Source Comparison', icon: 'compare_arrows' },
  ];

  return (
    <div className={`min-h-screen font-body select-none transition-colors duration-300 ${pageBg}`}>

      {/* HEADER */}
      <header className={`h-14 w-full px-4 md:px-6 border-b flex items-center justify-between z-40 fixed top-0 left-0 right-0 backdrop-blur-md ${
        isDark ? 'bg-[#0D1117]/95 border-white/10' : 'bg-[#1F3864] border-[#15294A]'
      } text-white`}>
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white text-[6px] font-black leading-none shrink-0 border border-white/30">
            <span>मॉयल</span><span>MOIL</span>
          </div>
          <div>
            <span className="font-serif font-black text-sm text-white tracking-wider uppercase leading-none">MOIL Supply Intelligence</span>
            <span className="text-[10px] text-[#FEA619] font-bold block mt-0.5">Industry Viewer Portal — Read Only</span>
          </div>
        </div>

        {/* Desktop tab nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/10 rounded-xl p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow' : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {onToggleTheme && <ThemeToggleSwitch isDark={isDark} onToggle={onToggleTheme} />}
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold">
            <span className="material-symbols-outlined text-sm">visibility</span>
            {user?.display_name ?? 'Industry Viewer'}
          </span>
          <button
            id="btn-logout-industry"
            onClick={() => { logout(); onNavigate('landing'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MOBILE TAB BAR */}
      <div className={`lg:hidden fixed top-14 left-0 right-0 z-30 flex overflow-x-auto gap-1 p-2 border-b ${
        isDark ? 'bg-[#0D1117] border-white/10' : 'bg-[#1F3864] border-[#15294A]'
      }`}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id ? 'bg-white text-slate-900' : 'text-white/70 bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="pt-28 lg:pt-20 px-4 md:px-6 lg:px-8 pb-8 max-w-[1440px] mx-auto space-y-6">

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { label: 'Annual Forecast',  value: `${(totalForecast / 1000).toFixed(0)}k MT`, sub: `of ${(totalCapacity / 1000).toFixed(0)}k MT capacity`, icon: 'inventory_2', color: 'text-[#0E7C7B]' },
            { label: 'Supply Coverage',  value: `${coveragePct}%`,                           sub: 'Forecast vs. capacity',       icon: 'donut_large',    color: 'text-emerald-500' },
            { label: 'Active Mines',     value: `${operationalCount} / ${SUPPLY_MINES.length}`, sub: 'Currently operational',   icon: 'factory',        color: 'text-amber-500' },
            { label: 'Grade Range',      value: 'Mn 36–50%',                                sub: '4 product grades available',  icon: 'grade',          color: 'text-blue-500' },
          ].map(kpi => (
            <div key={kpi.label} className={`p-4 rounded-2xl border ${cardBg} flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <div className="min-w-0">
                <p className={`font-headline font-black text-xl leading-none ${textPrimary}`}>{kpi.value}</p>
                <p className={`text-[10px] font-semibold truncate mt-0.5 ${textMuted}`}>{kpi.label}</p>
                <p className={`text-[9px] truncate ${textMuted}`}>{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SUPPLY OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'supply' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* Forecast vs Coverage bars */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#0E7C7B]">bar_chart</span>
                  Forecast Supply vs. Requirement Coverage
                </h2>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>FY 2025–26 Projection</span>
              </div>
              <div className="space-y-4">
                {SUPPLY_MINES.map(mine => {
                  const pct = Math.round((mine.currentForecast / mine.annualCapacity) * 100);
                  return (
                    <div key={mine.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className={textPrimary}>{mine.name}</span>
                        <span className={`font-mono ${textMuted}`}>{(mine.currentForecast / 1000).toFixed(0)}k / {(mine.annualCapacity / 1000).toFixed(0)}k MT ({pct}%)</span>
                      </div>
                      <div className={`w-full h-4 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${mine.status === 'MAINTENANCE' ? 'bg-amber-500' : 'bg-[#0E7C7B]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 pt-1 text-[10px] font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#0E7C7B] inline-block" />Operational forecast</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-amber-500 inline-block" />Maintenance period</span>
              </div>
            </div>

            {/* Mine / source breakdown */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-amber-500">location_on</span>
                Mine / Source Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUPPLY_MINES.map(mine => (
                  <div key={mine.id} className={`p-4 rounded-xl border space-y-2 ${nestedBg}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-headline font-black text-base ${textPrimary}`}>{mine.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        mine.status === 'OPERATIONAL'
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30'
                          : 'bg-amber-500/15 text-amber-600 border-amber-400/30'
                      }`}>{mine.status}</span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>{mine.district}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Grade</span><span className={`font-bold ${textPrimary}`}>{mine.grade}</span></div>
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Annual Forecast</span><span className={`font-bold ${textPrimary}`}>{(mine.currentForecast / 1000).toFixed(0)}k MT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics context */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                Logistics Context
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: 'train',          label: 'Rail Dispatch',   value: 'Central Railway — Nagpur Division', sub: 'Direct rake loading at Balaghat & Dongri Buzurg' },
                  { icon: 'local_shipping', label: 'Road Transport',  value: 'NH-44 / NH-30 connectivity',        sub: 'Truck dispatch for short-haul buyers <= 300 km' },
                  { icon: 'anchor',         label: 'Port Access',     value: 'Paradip / Vizag Port',              sub: 'Export-grade lots; 4-6 week lead time' },
                ].map(item => (
                  <div key={item.label} className={`p-4 rounded-xl border flex items-start gap-3 ${nestedBg}`}>
                    <span className="material-symbols-outlined text-2xl text-blue-500 shrink-0">{item.icon}</span>
                    <div>
                      <span className={`block text-[10px] uppercase font-black ${textMuted}`}>{item.label}</span>
                      <span className={`block font-bold text-sm ${textPrimary}`}>{item.value}</span>
                      <span className={`block text-[11px] mt-0.5 ${textMuted}`}>{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Request supply information CTA */}
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isDark ? 'bg-[#0E7C7B]/10 border-[#0E7C7B]/30' : 'bg-teal-50 border-teal-200'
            }`}>
              <div>
                <h3 className={`font-headline font-black text-lg ${textPrimary}`}>Request Supply Information</h3>
                <p className={`text-sm mt-1 ${textMuted}`}>Submit a supply requirement inquiry to MOIL's commercial desk for grade, volume, and timeline specifics.</p>
              </div>
              <button
                id="btn-supply-inquiry"
                onClick={() => setInquiryOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#0E7C7B] hover:bg-[#0C6A69] text-white text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0"
              >
                Submit Inquiry
              </button>
            </div>
          </div>
        )}

        {/* ── PRODUCT & GRADE CATALOGUE TAB ───────────────────────────────── */}
        {activeTab === 'catalogue' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#0E7C7B]">category</span>
                  Product & Grade Catalogue
                </h2>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>FY 2025–26</span>
              </div>
              <div className="space-y-4">
                {PRODUCT_CATALOGUE.map(product => (
                  <div key={product.grade} className={`p-5 rounded-xl border space-y-3 ${nestedBg}`}>
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <span className={`font-headline font-black text-base ${textPrimary}`}>{product.grade}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        product.tier === 'High' ? 'text-red-600 bg-red-50 border-red-200' :
                        product.tier === 'Medium-High' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                        product.tier === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                        'text-blue-600 bg-blue-50 border-blue-200'
                      }`}>{product.tier} Tier</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Form</span><span className={`font-semibold ${textPrimary}`}>{product.form}</span></div>
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Quality Profile</span><span className={`font-semibold ${textPrimary}`}>{product.typical}</span></div>
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Applications</span><span className={`font-semibold ${textPrimary}`}>{product.applications}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-5 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <span className="material-symbols-outlined text-blue-500 text-xl shrink-0 mt-0.5">info</span>
              <div className={`text-sm ${textPrimary}`}>
                <p className="font-bold">Quality Note</p>
                <p className={`mt-1 ${textMuted}`}>All grades conform to BIS IS 1837. Third-party assay certificates available for contracted buyers. Moisture typically &lt;= 8% at dispatch. Contact MOIL commercial desk for lot-specific data.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3-MONTH OUTLOOK TAB ─────────────────────────────────────────── */}
        {activeTab === 'outlook' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-amber-500">calendar_month</span>
                  Three-Month Supply Outlook
                </h2>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>Oct – Dec 2025</span>
              </div>
              <div className="space-y-4">
                {THREE_MONTH_OUTLOOK.map(month => {
                  const coverPct = Math.round((month.forecast / month.planned) * 100);
                  return (
                    <div key={month.month} className={`p-5 rounded-xl border space-y-3 ${nestedBg}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className={`font-headline font-black text-xl ${textPrimary}`}>{month.month}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          month.confidence === 'HIGH'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}>{month.confidence} confidence</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Planned Volume</span><span className="font-headline font-black text-2xl text-blue-600">{(month.planned / 1000).toFixed(0)}k MT</span></div>
                        <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>AI Forecast</span><span className={`font-headline font-black text-2xl ${textPrimary}`}>{(month.forecast / 1000).toFixed(0)}k MT</span></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] font-bold mb-1">
                          <span className={textMuted}>Forecast coverage</span>
                          <span className={textMuted}>{coverPct}%</span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                          <div className="h-full rounded-full bg-[#0E7C7B]" style={{ width: `${coverPct}%` }} />
                        </div>
                      </div>
                      <p className={`text-xs italic ${textMuted}`}>{month.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`p-5 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
              <span className="material-symbols-outlined text-amber-500 text-xl shrink-0 mt-0.5">warning</span>
              <div className={`text-sm ${textPrimary}`}>
                <p className="font-bold">Disclaimer</p>
                <p className={`mt-1 ${textMuted}`}>Forecast volumes are AI-generated projections and are indicative only. For contractual supply commitments, contact the MOIL commercial desk.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── ESG & COMPLIANCE TAB ────────────────────────────────────────── */}
        {activeTab === 'esg' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-emerald-500">eco</span>
                  Responsible Supply & Public Compliance
                </h2>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>FY 2025 Status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {COMPLIANCE_ITEMS.map(item => (
                  <div key={item.label} className={`p-4 rounded-xl border flex items-start gap-3 ${nestedBg}`}>
                    <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${item.status === 'OK' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {item.status === 'OK' ? 'check_circle' : 'pending'}
                    </span>
                    <div>
                      <span className={`block text-xs font-black ${textPrimary}`}>{item.label}</span>
                      <span className={`block text-xs mt-0.5 ${textMuted}`}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-blue-500">newspaper</span>
                Public Production Updates
              </h2>
              <div className="space-y-3">
                {PUBLIC_UPDATES.map(update => (
                  <div key={update.headline} className={`p-4 rounded-xl border ${nestedBg}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded shrink-0 mt-0.5 ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>{update.date}</span>
                      <div>
                        <p className={`text-sm font-bold ${textPrimary}`}>{update.headline}</p>
                        <p className={`text-xs mt-1 ${textMuted}`}>{update.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SOURCE COMPARISON TAB ───────────────────────────────────────── */}
        {activeTab === 'compare' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                  <span className="material-symbols-outlined text-[#0E7C7B]">compare_arrows</span>
                  Alternative Source Comparison
                </h2>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>Global benchmarks</span>
              </div>
              <div className="space-y-4">
                {ALT_SOURCES.map(src => (
                  <div key={src.supplier} className={`p-5 rounded-xl border space-y-3 ${
                    src.recommended
                      ? isDark ? 'bg-[#0E7C7B]/15 border-[#0E7C7B]/40' : 'bg-teal-50 border-teal-300'
                      : nestedBg
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className={`font-headline font-black text-base ${textPrimary}`}>{src.supplier}</span>
                      {src.recommended && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#0E7C7B] text-white rounded-full">Recommended</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Grade</span><span className={`font-semibold ${textPrimary}`}>{src.grade}</span></div>
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Reliability</span><span className={`font-semibold ${textPrimary}`}>{src.reliability}</span></div>
                      <div><span className={`block text-[9px] uppercase font-black ${textMuted}`}>Logistics</span><span className={`font-semibold ${textPrimary}`}>{src.logistics}</span></div>
                      <div>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>ESG Rating</span>
                        <span className="text-amber-500">{'★'.repeat(src.esg)}{'☆'.repeat(5 - src.esg)}</span>
                      </div>
                    </div>
                    <p className={`text-xs italic ${textMuted}`}>{src.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SUPPLY INQUIRY MODAL */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-5 ${isDark ? 'bg-[#1C2028] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {inquirySubmitted ? (
              <div className="text-center space-y-4 py-4">
                <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
                <h3 className={`font-headline font-black text-xl ${textPrimary}`}>Inquiry Submitted</h3>
                <p className={`text-sm ${textMuted}`}>Your supply inquiry has been received. MOIL's commercial team will respond within 2 business days.</p>
                <button
                  onClick={() => { setInquiryOpen(false); setInquirySubmitted(false); setInquiryForm({ grade: '', volume: '', timeline: '', contact: '' }); }}
                  className="px-6 py-2.5 rounded-xl bg-[#0E7C7B] text-white font-bold text-sm cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                  <h3 className={`font-headline font-black text-lg ${textPrimary}`}>Request Supply Information</h3>
                  <button onClick={() => setInquiryOpen(false)} className={`p-1 rounded-lg hover:bg-white/10 cursor-pointer ${textMuted}`}>
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Grade Required', key: 'grade' as const, type: 'select' },
                    { label: 'Volume Required (MT/month)', key: 'volume' as const, type: 'text', placeholder: 'e.g. 5,000 MT/month' },
                    { label: 'Delivery Timeline', key: 'timeline' as const, type: 'text', placeholder: 'e.g. Q1 FY26, starting January 2026' },
                    { label: 'Contact Email / Reference', key: 'contact' as const, type: 'text', placeholder: 'your.email@company.com' },
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <label className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={inquiryForm.grade}
                          onChange={e => setInquiryForm(f => ({ ...f, grade: e.target.value }))}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0E7C7B] transition-all cursor-pointer ${isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        >
                          <option value="">Select grade...</option>
                          {PRODUCT_CATALOGUE.map(p => <option key={p.grade} value={p.grade}>{p.grade}</option>)}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={inquiryForm[field.key]}
                          onChange={e => setInquiryForm(f => ({ ...f, [field.key]: e.target.value }))}
                          className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0E7C7B] transition-all ${isDark ? 'bg-white/5 border-white/20 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setInquiryOpen(false)}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm cursor-pointer transition-all ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (inquiryForm.grade && inquiryForm.contact) setInquirySubmitted(true); }}
                    disabled={!inquiryForm.grade || !inquiryForm.contact}
                    className="flex-1 py-2.5 rounded-xl bg-[#0E7C7B] hover:bg-[#0C6A69] text-white font-bold text-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
