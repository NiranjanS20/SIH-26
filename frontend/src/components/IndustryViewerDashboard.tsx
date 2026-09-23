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

interface GeochemicalProfile {
  mn: string;
  fe: string;
  sio2: string;
  p: string;
  mnFeRatio: string;
  mineralogy: string;
}

interface ProductGradeItem {
  grade: string;
  form: string;
  tier: 'High' | 'Medium-High' | 'Medium' | 'Standard';
  geochemical: GeochemicalProfile;
  mines: Array<{
    name: string;
    type: 'Open Cast' | 'Underground';
    location: string;
    specificGrade: string;
    isFlagship?: boolean;
  }>;
  applications: string;
  bisStandard: string;
}

const PRODUCT_CATALOGUE: ProductGradeItem[] = [
  {
    grade: 'MOIL High Grade (Mn > 46%)',
    form: 'Lump & Fines (10–75mm)',
    tier: 'High',
    geochemical: {
      mn: '46.0% – 50.5%',
      fe: '5.0% – 8.5%',
      sio2: '4.0% – 6.5%',
      p: '< 0.12% (Ultra-Low)',
      mnFeRatio: '6.5 : 1 – 8.0 : 1',
      mineralogy: 'Pyrolusite, Cryptomelane & Braunite',
    },
    mines: [
      { name: 'Dongri Buzurg', type: 'Open Cast', location: 'Bhandara, MH', specificGrade: '46.5% – 49.0% Mn', isFlagship: true },
      { name: 'Balaghat (Bharweli)', type: 'Underground', location: 'Balaghat, MP', specificGrade: '46.0% – 52.0% Mn', isFlagship: true },
      { name: 'Kandri', type: 'Underground', location: 'Nagpur, MH', specificGrade: '45.8% – 48.0% Mn' },
    ],
    applications: 'Electrolytic Manganese Dioxide (EMD), Li-ion battery cathode precursors, high-grade superalloys, defence steel.',
    bisStandard: 'IS 1837: Class A Dioxide Grade',
  },
  {
    grade: 'MOIL Grade A (Mn 44–46%)',
    form: 'Lump (25–75mm)',
    tier: 'Medium-High',
    geochemical: {
      mn: '44.0% – 46.0%',
      fe: '9.0% – 12.0%',
      sio2: '6.0% – 8.5%',
      p: '0.10% – 0.16%',
      mnFeRatio: '4.0 : 1 – 5.0 : 1',
      mineralogy: 'Braunite, Bixbyite & Hollandite (Gondite Horizon)',
    },
    mines: [
      { name: 'Tirodi', type: 'Open Cast', location: 'Balaghat, MP', specificGrade: '43.0% – 45.5% Mn', isFlagship: true },
      { name: 'Chikla', type: 'Underground', location: 'Bhandara, MH', specificGrade: '42.0% – 44.5% Mn' },
      { name: 'Gumgaon', type: 'Underground', location: 'Nagpur, MH', specificGrade: '42.0% – 44.0% Mn' },
    ],
    applications: 'High-carbon Ferromanganese (HC-FeMn), Medium-carbon Silicomanganese (SiMn), structural automotive steel.',
    bisStandard: 'IS 1837: Metallurgical Grade A',
  },
  {
    grade: 'MOIL Grade B (Mn 40–44%)',
    form: 'Lump & Fines (0–25mm)',
    tier: 'Medium',
    geochemical: {
      mn: '40.0% – 44.0%',
      fe: '12.0% – 15.5%',
      sio2: '8.0% – 11.0%',
      p: '0.15% – 0.22%',
      mnFeRatio: '3.0 : 1 – 3.5 : 1',
      mineralogy: 'Braunite-Silicate Quartzite & Jacobsite',
    },
    mines: [
      { name: 'Ukwa', type: 'Underground', location: 'Balaghat, MP', specificGrade: '40.0% – 42.5% Mn' },
      { name: 'Mansar', type: 'Underground', location: 'Nagpur, MH', specificGrade: '39.5% – 42.0% Mn' },
      { name: 'Sukli', type: 'Underground', location: 'Balaghat, MP', specificGrade: '39.0% – 41.5% Mn' },
    ],
    applications: 'Standard blast furnace ferroalloys, commercial construction rebar, foundry casting alloys.',
    bisStandard: 'IS 1837: Metallurgical Grade B',
  },
  {
    grade: 'MOIL Grade C (Mn 35–40%)',
    form: 'Fines & ROM Feed (< 10mm)',
    tier: 'Standard',
    geochemical: {
      mn: '35.0% – 40.0%',
      fe: '15.0% – 19.0%',
      sio2: '11.0% – 15.0%',
      p: '0.20% – 0.28%',
      mnFeRatio: '2.0 : 1 – 2.5 : 1',
      mineralogy: 'Manganese Silicate-Oxide Mix with Quartz & Rhodonite',
    },
    mines: [
      { name: 'Sitapatore', type: 'Open Cast', location: 'Balaghat, MP', specificGrade: '36.0% – 39.0% Mn' },
      { name: 'Beldongri', type: 'Underground', location: 'Nagpur, MH', specificGrade: '35.0% – 38.5% Mn' },
    ],
    applications: 'Sintering plants, Direct Reduced Iron (DRI) pelletization blend, low-grade blending feedstock.',
    bisStandard: 'IS 1837: Siliceous / Sinter Feed Grade',
  },
];

interface MineMonthlyForecast {
  mineName: string;
  type: string;
  location: string;
  grade: string;
  planned: number; // MT
  forecast: number; // MT
  fulfillmentPct: number;
  status: 'OPTIMAL' | 'NORMAL' | 'MAINTENANCE';
}

interface MonthlyOutlookItem {
  month: string;
  planned: number;
  forecast: number;
  confidence: 'HIGH' | 'MEDIUM';
  note: string;
  mineBreakdown: MineMonthlyForecast[];
}

const THREE_MONTH_OUTLOOK: MonthlyOutlookItem[] = [
  {
    month: 'Oct 2025',
    planned: 245000,
    forecast: 238000,
    confidence: 'HIGH',
    note: 'Post-monsoon pit dewatering complete across all opencast benches; full haulage ramp-up initiated.',
    mineBreakdown: [
      { mineName: 'Balaghat (Bharweli)', type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 46–52%', planned: 68000, forecast: 66500, fulfillmentPct: 98, status: 'OPTIMAL' },
      { mineName: 'Dongri Buzurg',       type: 'Open Cast',   location: 'Bhandara, MH', grade: 'Mn 46.5–49%', planned: 45000, forecast: 44200, fulfillmentPct: 98, status: 'OPTIMAL' },
      { mineName: 'Tirodi',              type: 'Open Cast',   location: 'Balaghat, MP', grade: 'Mn 43–45.5%', planned: 28000, forecast: 27200, fulfillmentPct: 97, status: 'NORMAL' },
      { mineName: 'Kandri',              type: 'Underground', location: 'Nagpur, MH',   grade: 'Mn 44–48%',   planned: 26000, forecast: 25500, fulfillmentPct: 98, status: 'NORMAL' },
      { mineName: 'Chikla',              type: 'Underground', location: 'Bhandara, MH', grade: 'Mn 42–45%',   planned: 22000, forecast: 21600, fulfillmentPct: 98, status: 'NORMAL' },
      { mineName: 'Ukwa',                type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 40–43%',   planned: 18000, forecast: 17500, fulfillmentPct: 97, status: 'NORMAL' },
      { mineName: 'Mansar & Others',     type: 'Blended',     location: 'Nagpur / MP',  grade: 'Mn 36–42%',   planned: 38000, forecast: 35500, fulfillmentPct: 93, status: 'NORMAL' },
    ]
  },
  {
    month: 'Nov 2025',
    planned: 260000,
    forecast: 252000,
    confidence: 'HIGH',
    note: 'Peak dry-season operational efficiency; automated optical ore sorting circuits active at Balaghat & Dongri.',
    mineBreakdown: [
      { mineName: 'Balaghat (Bharweli)', type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 46–52%', planned: 72000, forecast: 70800, fulfillmentPct: 98, status: 'OPTIMAL' },
      { mineName: 'Dongri Buzurg',       type: 'Open Cast',   location: 'Bhandara, MH', grade: 'Mn 46.5–49%', planned: 48000, forecast: 47100, fulfillmentPct: 98, status: 'OPTIMAL' },
      { mineName: 'Tirodi',              type: 'Open Cast',   location: 'Balaghat, MP', grade: 'Mn 43–45.5%', planned: 30000, forecast: 29300, fulfillmentPct: 98, status: 'NORMAL' },
      { mineName: 'Kandri',              type: 'Underground', location: 'Nagpur, MH',   grade: 'Mn 44–48%',   planned: 28000, forecast: 27400, fulfillmentPct: 98, status: 'NORMAL' },
      { mineName: 'Chikla',              type: 'Underground', location: 'Bhandara, MH', grade: 'Mn 42–45%',   planned: 24000, forecast: 23400, fulfillmentPct: 98, status: 'NORMAL' },
      { mineName: 'Ukwa',                type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 40–43%',   planned: 19000, forecast: 18500, fulfillmentPct: 97, status: 'NORMAL' },
      { mineName: 'Mansar & Others',     type: 'Blended',     location: 'Nagpur / MP',  grade: 'Mn 36–42%',   planned: 39000, forecast: 35500, fulfillmentPct: 91, status: 'NORMAL' },
    ]
  },
  {
    month: 'Dec 2025',
    planned: 255000,
    forecast: 240000,
    confidence: 'MEDIUM',
    note: 'Scheduled bi-annual winder overhaul on Balaghat auxiliary shaft; offset by buffer stockpiles.',
    mineBreakdown: [
      { mineName: 'Balaghat (Bharweli)', type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 46–52%', planned: 70000, forecast: 67200, fulfillmentPct: 96, status: 'MAINTENANCE' },
      { mineName: 'Dongri Buzurg',       type: 'Open Cast',   location: 'Bhandara, MH', grade: 'Mn 46.5–49%', planned: 46000, forecast: 44500, fulfillmentPct: 97, status: 'OPTIMAL' },
      { mineName: 'Tirodi',              type: 'Open Cast',   location: 'Balaghat, MP', grade: 'Mn 43–45.5%', planned: 29000, forecast: 27500, fulfillmentPct: 95, status: 'NORMAL' },
      { mineName: 'Kandri',              type: 'Underground', location: 'Nagpur, MH',   grade: 'Mn 44–48%',   planned: 27000, forecast: 25800, fulfillmentPct: 96, status: 'NORMAL' },
      { mineName: 'Chikla',              type: 'Underground', location: 'Bhandara, MH', grade: 'Mn 42–45%',   planned: 23000, forecast: 22000, fulfillmentPct: 96, status: 'MAINTENANCE' },
      { mineName: 'Ukwa',                type: 'Underground', location: 'Balaghat, MP', grade: 'Mn 40–43%',   planned: 18000, forecast: 17200, fulfillmentPct: 96, status: 'NORMAL' },
      { mineName: 'Mansar & Others',     type: 'Blended',     location: 'Nagpur / MP',  grade: 'Mn 36–42%',   planned: 42000, forecast: 35800, fulfillmentPct: 85, status: 'NORMAL' },
    ]
  },
];

const MINE_STYLING: Record<string, { color: string; icon: string; text: string; bg: string; border: string }> = {
  'Balaghat (Bharweli)': { color: 'bg-[#1F3864]', icon: 'swap_vert',              text: 'text-[#1F3864] dark:text-[#93C5FD]', bg: 'bg-[#EDF2FA] dark:bg-[#1F3864]/20', border: 'border-[#1F3864]/30' },
  'Dongri Buzurg':       { color: 'bg-[#0E7C7B]', icon: 'diamond',                text: 'text-[#0E7C7B] dark:text-[#2DD4BF]', bg: 'bg-[#EBF7F6] dark:bg-[#0E7C7B]/20', border: 'border-[#0E7C7B]/30' },
  'Tirodi':              { color: 'bg-[#2563EB]', icon: 'terrain',                text: 'text-[#2563EB] dark:text-[#60A5FA]', bg: 'bg-[#EFF6FF] dark:bg-[#2563EB]/20', border: 'border-[#2563EB]/30' },
  'Kandri':              { color: 'bg-[#4F46E5]', icon: 'layers',                 text: 'text-[#4F46E5] dark:text-[#A5B4FC]', bg: 'bg-[#EEF2FF] dark:bg-[#4F46E5]/20', border: 'border-[#4F46E5]/30' },
  'Chikla':              { color: 'bg-[#059669]', icon: 'construction',           text: 'text-[#059669] dark:text-[#6EE7B7]', bg: 'bg-[#ECFDF5] dark:bg-[#059669]/20', border: 'border-[#059669]/30' },
  'Ukwa':                { color: 'bg-[#0284C7]', icon: 'precision_manufacturing',text: 'text-[#0284C7] dark:text-[#7DD3FC]', bg: 'bg-[#F0F9FF] dark:bg-[#0284C7]/20', border: 'border-[#0284C7]/30' },
  'Mansar & Others':     { color: 'bg-[#D97706]', icon: 'build_circle',           text: 'text-[#D97706] dark:text-[#FCD34D]', bg: 'bg-[#FEF8EC] dark:bg-[#D97706]/20', border: 'border-[#D97706]/30' },
};

interface SdgItem {
  id: number;
  number: string;
  name: string;
  subtitle: string;
  icon: string;
  accentIcon: string;
  watermarkIcon: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  titleColor: string;
  kpiColor: string;
  kpiBg: string;
  sliceBg: string;
  iconBg: string;
  iconColor: string;
  kpi: string;
  description?: string;
  targetAchievement?: string;
}

const SDG_ALIGNMENT: SdgItem[] = [
  {
    id: 3,
    number: 'SDG 3',
    name: 'Good Health & Well-Being',
    subtitle: 'Zero-harm safety & health clinics',
    icon: 'health_and_safety',
    accentIcon: 'ecg_heart',
    watermarkIcon: 'medical_services',
    cardBg: 'bg-[#EFF8F2] dark:bg-[#064E3B]/25',
    cardBorder: 'border-[#A3E6B4] dark:border-[#059669]/50',
    badgeBg: 'bg-[#15803D] text-white',
    titleColor: 'text-[#14532D] dark:text-[#86EFAC]',
    kpiColor: 'text-[#15803D] dark:text-[#86EFAC]',
    kpiBg: 'bg-white/85 dark:bg-[#064E3B]/60 border border-[#A3E6B4]/60 dark:border-[#059669]/40',
    sliceBg: 'bg-emerald-200/40 dark:bg-emerald-500/15',
    iconBg: 'bg-white dark:bg-[#064E3B]',
    iconColor: 'text-[#15803D] dark:text-[#86EFAC]',
    kpi: '0 Occupational Cases'
  },
  {
    id: 6,
    number: 'SDG 6',
    name: 'Clean Water & Sanitation',
    subtitle: 'Zero discharge & full water recycling',
    icon: 'water_drop',
    accentIcon: 'waves',
    watermarkIcon: 'water_lux',
    cardBg: 'bg-[#EFF8FF] dark:bg-[#0C4A6E]/25',
    cardBorder: 'border-[#A0D4FA] dark:border-[#0284C7]/50',
    badgeBg: 'bg-[#0284C7] text-white',
    titleColor: 'text-[#075985] dark:text-[#7DD3FC]',
    kpiColor: 'text-[#0284C7] dark:text-[#7DD3FC]',
    kpiBg: 'bg-white/85 dark:bg-[#0C4A6E]/60 border border-[#A0D4FA]/60 dark:border-[#0284C7]/40',
    sliceBg: 'bg-sky-200/40 dark:bg-sky-500/15',
    iconBg: 'bg-white dark:bg-[#0C4A6E]',
    iconColor: 'text-[#0284C7] dark:text-[#7DD3FC]',
    kpi: '82.4% Recycled Water'
  },
  {
    id: 7,
    number: 'SDG 7',
    name: 'Affordable & Clean Energy',
    subtitle: '14.5 MW solar & wind capacity',
    icon: 'bolt',
    accentIcon: 'solar_power',
    watermarkIcon: 'wb_sunny',
    cardBg: 'bg-[#FFF9EB] dark:bg-[#78350F]/25',
    cardBorder: 'border-[#FDE0A6] dark:border-[#D97706]/50',
    badgeBg: 'bg-[#D97706] text-white',
    titleColor: 'text-[#78350F] dark:text-[#FCD34D]',
    kpiColor: 'text-[#B45309] dark:text-[#FCD34D]',
    kpiBg: 'bg-white/85 dark:bg-[#78350F]/60 border border-[#FDE0A6]/60 dark:border-[#D97706]/40',
    sliceBg: 'bg-amber-200/40 dark:bg-amber-500/15',
    iconBg: 'bg-white dark:bg-[#78350F]',
    iconColor: 'text-[#D97706] dark:text-[#FCD34D]',
    kpi: '34.8% Clean Energy'
  },
  {
    id: 8,
    number: 'SDG 8',
    name: 'Decent Work & Growth',
    subtitle: '528 LTI-free days & worker welfare',
    icon: 'engineering',
    accentIcon: 'shield',
    watermarkIcon: 'construction',
    cardBg: 'bg-[#FFF0F3] dark:bg-[#881337]/25',
    cardBorder: 'border-[#FCA5B9] dark:border-[#E11D48]/50',
    badgeBg: 'bg-[#E11D48] text-white',
    titleColor: 'text-[#881337] dark:text-[#FDA4AF]',
    kpiColor: 'text-[#BE123C] dark:text-[#FDA4AF]',
    kpiBg: 'bg-white/85 dark:bg-[#881337]/60 border border-[#FCA5B9]/60 dark:border-[#E11D48]/40',
    sliceBg: 'bg-rose-200/40 dark:bg-rose-500/15',
    iconBg: 'bg-white dark:bg-[#881337]',
    iconColor: 'text-[#E11D48] dark:text-[#FDA4AF]',
    kpi: '528 LTI-Free Days'
  },
  {
    id: 9,
    number: 'SDG 9',
    name: 'Industry & Innovation',
    subtitle: 'Automated extraction & smart tech',
    icon: 'precision_manufacturing',
    accentIcon: 'settings_suggest',
    watermarkIcon: 'hub',
    cardBg: 'bg-[#FFF4EC] dark:bg-[#7C2D12]/25',
    cardBorder: 'border-[#FDBA8C] dark:border-[#EA580C]/50',
    badgeBg: 'bg-[#EA580C] text-white',
    titleColor: 'text-[#7C2D12] dark:text-[#FDBA74]',
    kpiColor: 'text-[#C2410C] dark:text-[#FDBA74]',
    kpiBg: 'bg-white/85 dark:bg-[#7C2D12]/60 border border-[#FDBA8C]/60 dark:border-[#EA580C]/40',
    sliceBg: 'bg-orange-200/40 dark:bg-orange-500/15',
    iconBg: 'bg-white dark:bg-[#7C2D12]',
    iconColor: 'text-[#EA580C] dark:text-[#FDBA74]',
    kpi: '+14% Recovery Yield'
  },
  {
    id: 12,
    number: 'SDG 12',
    name: 'Responsible Production',
    subtitle: 'Circular beneficiation & high ore use',
    icon: 'autorenew',
    accentIcon: 'recycling',
    watermarkIcon: 'inventory_2',
    cardBg: 'bg-[#FEFCE8] dark:bg-[#713F12]/25',
    cardBorder: 'border-[#FDE047] dark:border-[#CA8A04]/50',
    badgeBg: 'bg-[#CA8A04] text-white',
    titleColor: 'text-[#713F12] dark:text-[#FEF08A]',
    kpiColor: 'text-[#854D0E] dark:text-[#FEF08A]',
    kpiBg: 'bg-white/85 dark:bg-[#713F12]/60 border border-[#FDE047]/60 dark:border-[#CA8A04]/40',
    sliceBg: 'bg-yellow-200/40 dark:bg-yellow-500/15',
    iconBg: 'bg-white dark:bg-[#713F12]',
    iconColor: 'text-[#CA8A04] dark:text-[#FEF08A]',
    kpi: '98.5% Ore Utilization'
  },
  {
    id: 13,
    number: 'SDG 13',
    name: 'Climate Action',
    subtitle: 'Scope 1 & 2 carbon abatement',
    icon: 'nest_eco_leaf',
    accentIcon: 'public',
    watermarkIcon: 'cloud_done',
    cardBg: 'bg-[#EDFAF7] dark:bg-[#134E4A]/25',
    cardBorder: 'border-[#94EADB] dark:border-[#0D9488]/50',
    badgeBg: 'bg-[#0D9488] text-white',
    titleColor: 'text-[#115E59] dark:text-[#5EEAD4]',
    kpiColor: 'text-[#0F766E] dark:text-[#5EEAD4]',
    kpiBg: 'bg-white/85 dark:bg-[#134E4A]/60 border border-[#94EADB]/60 dark:border-[#0D9488]/40',
    sliceBg: 'bg-teal-200/40 dark:bg-teal-500/15',
    iconBg: 'bg-white dark:bg-[#134E4A]',
    iconColor: 'text-[#0D9488] dark:text-[#5EEAD4]',
    kpi: '20.8 kg CO₂/t'
  },
  {
    id: 15,
    number: 'SDG 15',
    name: 'Life on Land',
    subtitle: 'Mass afforestation & green belt',
    icon: 'forest',
    accentIcon: 'yard',
    watermarkIcon: 'park',
    cardBg: 'bg-[#F4FBEB] dark:bg-[#365314]/25',
    cardBorder: 'border-[#C8F28A] dark:border-[#65A30D]/50',
    badgeBg: 'bg-[#65A30D] text-white',
    titleColor: 'text-[#365314] dark:text-[#BEF264]',
    kpiColor: 'text-[#4D7C0F] dark:text-[#BEF264]',
    kpiBg: 'bg-white/85 dark:bg-[#365314]/60 border border-[#C8F28A]/60 dark:border-[#65A30D]/40',
    sliceBg: 'bg-lime-200/40 dark:bg-lime-500/15',
    iconBg: 'bg-white dark:bg-[#365314]',
    iconColor: 'text-[#65A30D] dark:text-[#BEF264]',
    kpi: '1.46M+ Planted'
  }
];

interface ComplianceFramework {
  authority: string;
  category: string;
  actTitle: string;
  statusText: string;
  validity: string;
  verifiedBy: string;
  status: 'COMPLIANT' | 'ACTIVE' | 'REVIEW';
}

const STATUTORY_COMPLIANCES: ComplianceFramework[] = [
  {
    authority: 'DGMS',
    category: 'Mines Safety',
    actTitle: 'Mines Act 1952 & MMR 1961',
    statusText: 'Statutory Mine Managers & Certified Safety Officers deputed per active pit.',
    validity: 'Annual Audit 2025-26',
    verifiedBy: 'DGMS India',
    status: 'COMPLIANT'
  },
  {
    authority: 'MoEFCC',
    category: 'Environment',
    actTitle: 'Environment (Protection) Act 1986',
    statusText: 'Stage-II Forest Clearances and Environmental Clearances active across all units.',
    validity: 'Valid through 2028–2030',
    verifiedBy: 'MoEFCC Govt of India',
    status: 'ACTIVE'
  },
  {
    authority: 'MPPCB / MPCB',
    category: 'Pollution Control',
    actTitle: 'Water & Air Acts (1974 / 1981)',
    statusText: 'Consents to Operate (CTO) valid; Zero Liquid Discharge (ZLD) certified at washing circuits.',
    validity: 'Form-V Annual Audit',
    verifiedBy: 'State Pollution Control Boards',
    status: 'COMPLIANT'
  },
  {
    authority: 'ISO System',
    category: 'Quality & Safety',
    actTitle: 'ISO 14001, 45001 & 9001',
    statusText: 'Integrated Management System (IMS) accredited across lab and operational mines.',
    validity: 'Certified through Q3 2027',
    verifiedBy: 'Bureau Veritas / TUV',
    status: 'COMPLIANT'
  },
  {
    authority: 'Govt. of India',
    category: 'DMFT / NMET',
    actTitle: 'District Mineral Foundation Trust',
    statusText: '₹4.20 Cr DMFT and 2% NMET deposited for local tribal health, education & infra.',
    validity: 'FY25-26 Full Deposit',
    verifiedBy: 'District Collectorates',
    status: 'COMPLIANT'
  },
  {
    authority: 'SEBI / BRSR',
    category: 'BRSR Reporting',
    actTitle: 'BRSR Core Framework',
    statusText: 'Scope 1 & 2 emissions and ESG materiality indicators published in Annual Report.',
    validity: 'FY25 Audited / FY26 Live',
    verifiedBy: 'Independent ESG Auditor',
    status: 'ACTIVE'
  }
];

interface MineEsgMetric {
  mineName: string;
  type: string;
  location: string;
  ecValidity: string;
  forestClearance: string;
  waterRecycledPct: number;
  renewablePowerPct: number;
  carbonIntensity: number; // kg CO2 / t
  saplingsPlanted: number;
  ltiFreeDays: number;
  complianceScore: number;
  status: 'EXCELLENT' | 'COMPLIANT';
}

const MINE_ESG_METRICS: MineEsgMetric[] = [
  {
    mineName: 'Balaghat (Bharweli)',
    type: 'Underground',
    location: 'Balaghat, Madhya Pradesh',
    ecValidity: 'Oct 2029 (10 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 86.5,
    renewablePowerPct: 42.0,
    carbonIntensity: 18.2,
    saplingsPlanted: 385000,
    ltiFreeDays: 420,
    complianceScore: 99,
    status: 'EXCELLENT'
  },
  {
    mineName: 'Dongri Buzurg',
    type: 'Open Cast',
    location: 'Bhandara, Maharashtra',
    ecValidity: 'Dec 2028 (6.5 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 84.0,
    renewablePowerPct: 38.5,
    carbonIntensity: 22.5,
    saplingsPlanted: 412000,
    ltiFreeDays: 610,
    complianceScore: 98,
    status: 'EXCELLENT'
  },
  {
    mineName: 'Tirodi',
    type: 'Open Cast',
    location: 'Balaghat, Madhya Pradesh',
    ecValidity: 'Aug 2027 (3.5 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 80.2,
    renewablePowerPct: 30.0,
    carbonIntensity: 24.1,
    saplingsPlanted: 235000,
    ltiFreeDays: 350,
    complianceScore: 97,
    status: 'COMPLIANT'
  },
  {
    mineName: 'Kandri',
    type: 'Underground',
    location: 'Nagpur, Maharashtra',
    ecValidity: 'Nov 2028 (3.0 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 82.8,
    renewablePowerPct: 35.2,
    carbonIntensity: 19.8,
    saplingsPlanted: 192000,
    ltiFreeDays: 580,
    complianceScore: 98,
    status: 'EXCELLENT'
  },
  {
    mineName: 'Chikla',
    type: 'Underground',
    location: 'Bhandara, Maharashtra',
    ecValidity: 'May 2027 (2.8 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 79.5,
    renewablePowerPct: 32.0,
    carbonIntensity: 20.4,
    saplingsPlanted: 145000,
    ltiFreeDays: 490,
    complianceScore: 96,
    status: 'COMPLIANT'
  },
  {
    mineName: 'Ukwa',
    type: 'Underground',
    location: 'Balaghat, Madhya Pradesh',
    ecValidity: 'Sep 2028 (2.5 Lakh MTPA)',
    forestClearance: 'Stage-II MoEFCC (Active)',
    waterRecycledPct: 81.0,
    renewablePowerPct: 28.5,
    carbonIntensity: 21.0,
    saplingsPlanted: 115000,
    ltiFreeDays: 720,
    complianceScore: 97,
    status: 'COMPLIANT'
  }
];

const PUBLIC_UPDATES = [
  { date: 'Sep 2025', headline: 'Q2 FY26 Production Report Released',    detail: 'MOIL reports 18.4 lakh MT production in H1 FY26, 6% ahead of FY25.' },
  { date: 'Aug 2025', headline: 'New Ore-processing Facility at Balaghat', detail: 'Capacity expansion to 10 lakh MTPA announced; commissioning Q1 FY27.' },
  { date: 'Jul 2025', headline: 'MOIL Wins CII Sustainability Award',     detail: 'Recognised for best practices in mine reclamation and water conservation.' },
];

interface SourceComparisonItem {
  supplier: string;
  origin: string;
  grade: string;
  reliability: string;
  leadTimeDays: string;
  logistics: string;
  freightCostEst: string;
  customsDuty: string;
  currencyRisk: string;
  minLotSize: string;
  workingCapitalDays: string;
  esg: number;
  note: string;
  financialDelta: string;
  timeDelta: string;
  recommended: boolean;
}

const ALT_SOURCES: SourceComparisonItem[] = [
  {
    supplier: 'MOIL Limited (India)',
    origin: 'Domestic (MP & Maharashtra)',
    grade: 'Mn 36–52%',
    reliability: 'Very High (Sovereign PSU)',
    leadTimeDays: '3 – 5 Days',
    logistics: 'Direct Indian Railway Rake / Road',
    freightCostEst: '₹1,200 – ₹1,800 / MT',
    customsDuty: '0% (Exempt + 100% GST ITC)',
    currencyRisk: '0% (INR Billed)',
    minLotSize: '1 Rake (~3,800 MT)',
    workingCapitalDays: '10 – 14 Days',
    esg: 5,
    financialDelta: 'Base Benchmark (Saves 18–26%)',
    timeDelta: '30+ Days Faster',
    note: 'PSU Priority Rakes • No Port Congestion',
    recommended: true
  },
  {
    supplier: 'Assmang / South32 (South Africa)',
    origin: 'Kalahari Basin, South Africa',
    grade: 'Mn 36–48%',
    reliability: 'High',
    leadTimeDays: '28 – 35 Days',
    logistics: 'Maritime Handymax Vessel + Port Siding',
    freightCostEst: '$26–$34/MT + Port Handling',
    customsDuty: '2.5% BCD + Surcharges',
    currencyRisk: 'High (USD Volatility)',
    minLotSize: '35,000 – 50,000 MT Vessel',
    workingCapitalDays: '60 – 75 Days',
    esg: 4,
    financialDelta: '+₹3,200/MT higher landed cost',
    timeDelta: '25-30 days slower',
    note: 'Subject to ocean freight & demurrage risks',
    recommended: false
  },
  {
    supplier: 'Consolidated Minerals (Australia)',
    origin: 'Woodie Woodie, Australia',
    grade: 'Mn 44–50%',
    reliability: 'High',
    leadTimeDays: '18 – 24 Days',
    logistics: 'Panamax Vessel from Port Hedland',
    freightCostEst: '$22–$28/MT + Port Handling',
    customsDuty: '2.5% BCD + Port Cess',
    currencyRisk: 'High (USD Denominated)',
    minLotSize: '40,000 – 60,000 MT',
    workingCapitalDays: '50 – 65 Days',
    esg: 4,
    financialDelta: '+₹2,850/MT higher landed cost',
    timeDelta: '15-20 days slower',
    note: 'High minimum order commitment locks capital',
    recommended: false
  },
  {
    supplier: 'Eramet (Gabon)',
    origin: 'Moanda Mine, Gabon',
    grade: 'Mn 44–48%',
    reliability: 'Medium-High',
    leadTimeDays: '35 – 42 Days',
    logistics: 'Trans-Ocean Bulk Voyage',
    freightCostEst: '$32–$40/MT + Port Handling',
    customsDuty: '2.5% BCD + Surcharges',
    currencyRisk: 'High (USD / EUR Pegged)',
    minLotSize: '30,000 – 45,000 MT',
    workingCapitalDays: '70 – 85 Days',
    esg: 4,
    financialDelta: '+₹3,900/MT higher landed cost',
    timeDelta: '32-37 days slower',
    note: 'Vulnerable to maritime & canal bottlenecks',
    recommended: false
  }
];

const RECOMMENDATION_PILLARS = [
  {
    title: 'Financial & Cost Arbitrage',
    icon: 'payments',
    badge: '18%–26% Cost Savings',
    headline: '₹2,800–₹4,200 Saved / MT',
    stat: '₹3,450/MT',
    statSub: 'Avg Landed Savings',
    cardBg: 'bg-gradient-to-br from-[#CEF2F0] via-[#E1F9F8] to-[#BFECE9]',
    borderColor: 'border-2 border-[#0E7C7B]/60 hover:border-[#0E7C7B]',
    dotColor: 'bg-[#0E7C7B]',
    iconTileColor: 'bg-white text-[#0E7C7B] border border-[#0E7C7B]/30 shadow-xs',
    badgeBg: 'bg-[#0E7C7B]/20 text-[#074F4E] border border-[#0E7C7B]/40',
    headlineColor: 'text-[#0E7C7B]',
    statColor: 'text-[#043332]',
    checkColor: 'text-[#0E7C7B]',
    statBoxBg: 'bg-white/95 border border-[#0E7C7B]/30 shadow-2xs',
    dividerColor: 'border-[#0E7C7B]/25',
    titleColor: 'text-[#043332]',
    textColor: 'text-[#085250]',
    points: [
      '0% customs duty & zero port demurrage fees',
      '100% INR billed — zero USD forex risk',
      'Full GST Input Tax Credit (ITC) pass-through'
    ]
  },
  {
    title: 'Speed & Working Capital',
    icon: 'speed',
    badge: '85% Faster Dispatch',
    headline: '3–5 Days vs 35+ Days Sea Transit',
    stat: '3–5 Days',
    statSub: 'Mine Siding to Furnace Gate',
    cardBg: 'bg-gradient-to-br from-[#BAE6FD] via-[#D6EEFE] to-[#A3D9FB]',
    borderColor: 'border-2 border-[#0284C7]/60 hover:border-[#0284C7]',
    dotColor: 'bg-[#0284C7]',
    iconTileColor: 'bg-white text-[#0284C7] border border-[#0284C7]/30 shadow-xs',
    badgeBg: 'bg-[#0284C7]/20 text-[#035684] border border-[#0284C7]/40',
    headlineColor: 'text-[#0284C7]',
    statColor: 'text-[#05324E]',
    checkColor: 'text-[#0284C7]',
    statBoxBg: 'bg-white/95 border border-[#0284C7]/30 shadow-2xs',
    dividerColor: 'border-[#0284C7]/25',
    titleColor: 'text-[#05324E]',
    textColor: 'text-[#074E79]',
    points: [
      'Direct railway rake loading to factory in 120 hrs',
      'Buffer inventory slashed from 70 to 12 days',
      'Unlocks ₹6.5–12 Cr working capital per 20k MT'
    ]
  },
  {
    title: 'Quality & Assay Assurance',
    icon: 'verified',
    badge: 'Dual Certified',
    headline: 'BIS IS 1837 Dual Assay',
    stat: '100%',
    statSub: 'Pithead Joint Sampling Certified',
    cardBg: 'bg-gradient-to-br from-[#C7D9FE] via-[#DEE8FE] to-[#B3CBFD]',
    borderColor: 'border-2 border-[#2563EB]/60 hover:border-[#2563EB]',
    dotColor: 'bg-[#2563EB]',
    iconTileColor: 'bg-white text-[#2563EB] border border-[#2563EB]/30 shadow-xs',
    badgeBg: 'bg-[#2563EB]/20 text-[#1E40AF] border border-[#2563EB]/40',
    headlineColor: 'text-[#2563EB]',
    statColor: 'text-[#12224A]',
    checkColor: 'text-[#2563EB]',
    statBoxBg: 'bg-white/95 border border-[#2563EB]/30 shadow-2xs',
    dividerColor: 'border-[#2563EB]/25',
    titleColor: 'text-[#12224A]',
    textColor: 'text-[#1E3A8A]',
    points: [
      'Joint sampling & NABL lab testing at mine site',
      'Zero moisture absorption during short rail hauls',
      'Low phosphorus (<0.07%–0.20%) furnace grades'
    ]
  },
  {
    title: 'Supply Security & Reliability',
    icon: 'shield',
    badge: 'PSU Continuity',
    headline: 'Zero Sea-Lane Risk',
    stat: '50%+',
    statSub: 'National Market Share (Miniratna-I)',
    cardBg: 'bg-gradient-to-br from-[#DDD6FE] via-[#EAE6FE] to-[#CEC4FD]',
    borderColor: 'border-2 border-[#6366F1]/60 hover:border-[#6366F1]',
    dotColor: 'bg-[#6366F1]',
    iconTileColor: 'bg-white text-[#6366F1] border border-[#6366F1]/30 shadow-xs',
    badgeBg: 'bg-[#6366F1]/20 text-[#3730A3] border border-[#6366F1]/40',
    headlineColor: 'text-[#6366F1]',
    statColor: 'text-[#1E1B4B]',
    checkColor: 'text-[#6366F1]',
    statBoxBg: 'bg-white/95 border border-[#6366F1]/30 shadow-2xs',
    dividerColor: 'border-[#6366F1]/25',
    titleColor: 'text-[#1E1B4B]',
    textColor: 'text-[#312E81]',
    points: [
      'Miniratna-I PSU reliability across market cycles',
      'Zero maritime congestion or canal bottlenecks',
      'Priority Indian Railways rake allotment'
    ]
  }
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
  const [calcMonthlyMt, setCalcMonthlyMt] = useState<number>(5000);
  const [coverageTimeframe, setCoverageTimeframe] = useState<'annual' | 'q3' | 'multi'>('annual');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  const toggleMonthBreakdown = (monthName: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthName]: !prev[monthName]
    }));
  };

  const totalForecast    = SUPPLY_MINES.reduce((s, m) => s + m.currentForecast, 0);
  const totalCapacity    = SUPPLY_MINES.reduce((s, m) => s + m.annualCapacity, 0);
  const coveragePct      = Math.round((totalForecast / totalCapacity) * 100);
  const operationalCount = SUPPLY_MINES.filter(m => m.status === 'OPERATIONAL').length;

  // Theme tokens
  const pageBg     = isDark ? 'bg-[#12151B] text-slate-100' : 'bg-[#F0F5FA] text-slate-900';
  const cardBg     = isDark ? 'bg-[#1C2028] border-white/10' : 'bg-[#DCEBFA] border-2 border-[#162D52] shadow-md';
  const nestedBg   = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#C8DCF0]';
  const textPrimary= isDark ? 'text-white' : 'text-slate-900';
  const textMuted  = isDark ? 'text-slate-400' : 'text-slate-600';
  const divider    = isDark ? 'border-white/10' : 'border-[#162D52]/25';

  const TABS: { id: DashTab; label: string; icon: string }[] = [
    { id: 'supply',    label: 'Supply Overview', icon: 'inventory_2' },
    { id: 'catalogue', label: 'Product & Grade', icon: 'category' },
    { id: 'outlook',   label: '3-Month Outlook', icon: 'calendar_month' },
    { id: 'esg',       label: 'ESG & Compliance', icon: 'eco' },
    { id: 'compare',   label: 'Source Comparison', icon: 'compare_arrows' },
  ];

  // ESG Download Handlers
  const downloadMineEsgMetrics = (mine: MineEsgMetric) => {
    const csvContent = "data:text/csv;charset=utf-8," + [
      ["MOIL LIMITED - MINE ESG & STATUTORY COMPLIANCE CERTIFICATE"],
      ["Report Date", new Date().toISOString().split('T')[0]],
      ["Mine Leasehold", mine.mineName],
      ["Mining Type", mine.type],
      ["Location", mine.location],
      ["Environmental Clearance (EC) Validity", mine.ecValidity],
      ["Forest Clearance Status", mine.forestClearance],
      ["Water Recycling Rate", `${mine.waterRecycledPct}%`],
      ["Renewable Energy Share", `${mine.renewablePowerPct}%`],
      ["Carbon Intensity", `${mine.carbonIntensity} kg CO2/t ROM`],
      ["Afforestation Saplings Planted", `${mine.saplingsPlanted}`],
      ["LTI-Free Safe Working Days", `${mine.ltiFreeDays}`],
      ["Compliance & Safety Audit Score", `${mine.complianceScore}/100`],
      ["Operating Health Tier", mine.status]
    ].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MOIL_ESG_Report_${mine.mineName.replace(/[^a-zA-Z0-9]/g, '_')}_FY25.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadConsolidatedEsgReport = () => {
    const rows: string[][] = [
      ["MOIL LIMITED - CONSOLIDATED ESG, SDG & STATUTORY COMPLIANCE DOSSIER (FY 2025-26)"],
      ["Generated On", new Date().toISOString()],
      ["Entity", "MOIL Limited (A Government of India Enterprise - Miniratna-I)"],
      ["Registered Office", "MOIL Bhawan, 1A Katol Road, Nagpur - 440013"],
      [""],
      ["=== SECTION 1: UN SUSTAINABLE DEVELOPMENT GOALS (SDGs) ALIGNMENT ==="],
      ["SDG Code", "Goal Title", "Strategic Action & Operational Alignment", "Target / Result KPI"],
      ...SDG_ALIGNMENT.map(s => [s.number, s.name, s.subtitle || s.description || s.name, s.kpi]),
      [""],
      ["=== SECTION 2: STATUTORY & REGULATORY COMPLIANCE FRAMEWORKS ==="],
      ["Authority", "Category", "Act / Regulation Title", "Status & Coverage", "Validity / Audit Cycle", "Verifying Body"],
      ...STATUTORY_COMPLIANCES.map(c => [c.authority, c.category, c.actTitle, c.statusText, c.validity, c.verifiedBy]),
      [""],
      ["=== SECTION 3: MINE-WISE ESG PERFORMANCE & STATUTORY AUDIT METRICS ==="],
      ["Mine Leasehold", "Type", "District & State", "EC Validity", "Forest Clearance", "Water Recycled %", "Renewable Energy %", "Carbon Intensity (kg CO2/t)", "Saplings Planted", "LTI-Free Days", "Audit Score (/100)", "Status"],
      ...MINE_ESG_METRICS.map(m => [
        m.mineName, m.type, m.location, m.ecValidity, m.forestClearance, `${m.waterRecycledPct}%`, `${m.renewablePowerPct}%`, `${m.carbonIntensity}`, `${m.saplingsPlanted}`, `${m.ltiFreeDays}`, `${m.complianceScore}/100`, m.status
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MOIL_Consolidated_ESG_Compliance_Report_FY25_26.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* ── SUPPLY OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'supply' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* HIGH-END BENTO KPI CARDS (Inspired by modern enterprise UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* CARD 1: Annual Forecast (Teal / Ocean Theme) */}
              <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg group ${
                isDark 
                  ? 'bg-gradient-to-br from-[#0F2229] to-[#0A161A] border-teal-500/30 hover:border-teal-400' 
                  : 'bg-gradient-to-br from-[#EDF9F8] via-[#F4FBFA] to-[#E2F5F4] border-2 border-[#0E7C7B]/40 hover:border-[#0E7C7B] shadow-xs'
              }`}>
                {/* Background Decorative SVG Artwork */}
                <svg className="absolute -right-3 -bottom-3 w-28 h-28 opacity-15 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" viewBox="0 0 100 100" fill="none">
                  <rect x="25" y="10" width="35" height="35" rx="8" transform="rotate(45 25 10)" fill="url(#teal-grad)" />
                  <rect x="55" y="40" width="35" height="35" rx="8" transform="rotate(45 55 40)" fill="url(#teal-grad)" />
                  <rect x="20" y="65" width="25" height="25" rx="6" transform="rotate(45 20 65)" fill="url(#teal-grad)" />
                  <defs>
                    <linearGradient id="teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0E7C7B" />
                      <stop offset="100%" stopColor="#2DD4BF" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  {/* Top Row: Pill Tag + Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isDark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-[#0E7C7B]/15 text-[#0A5857] border border-[#0E7C7B]/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C7B] animate-pulse" />
                      FY 2025–26 Target
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' : 'bg-white text-[#0E7C7B] border border-[#0E7C7B]/30 shadow-xs'
                    }`}>
                      <span className="material-symbols-outlined text-lg">inventory_2</span>
                    </div>
                  </div>

                  {/* Middle Row: Large Value */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-headline font-black text-2xl sm:text-3xl tracking-tight leading-none ${
                        isDark ? 'text-white' : 'text-[#062D2C]'
                      }`}>
                        {(totalForecast / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs font-black uppercase text-[#0E7C7B]">MT / Year</span>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Annual Supply Forecast
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      of {(totalCapacity / 1000).toFixed(0)}k MT installed mining capacity
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-black ${
                    isDark ? 'border-teal-500/20 text-teal-300' : 'border-[#0E7C7B]/20 text-[#0E7C7B]'
                  }`}>
                    <span>Offtake Target: 94.1%</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Supply Coverage (Emerald / Growth Theme) */}
              <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg group ${
                isDark 
                  ? 'bg-gradient-to-br from-[#0D2419] to-[#081710] border-emerald-500/30 hover:border-emerald-400' 
                  : 'bg-gradient-to-br from-[#EDFBF2] via-[#F4FDF7] to-[#E3F8EB] border-2 border-emerald-500/40 hover:border-emerald-600 shadow-xs'
              }`}>
                {/* Background Decorative SVG Artwork (Concentric Rings) */}
                <svg className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 pointer-events-none transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
                  <circle cx="65" cy="65" r="45" stroke="url(#em-grad)" strokeWidth="8" />
                  <circle cx="65" cy="65" r="30" stroke="url(#em-grad)" strokeWidth="6" />
                  <circle cx="65" cy="65" r="16" fill="url(#em-grad)" />
                  <defs>
                    <linearGradient id="em-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  {/* Top Row: Pill Tag + Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      High Fulfillment
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white text-emerald-600 border border-emerald-500/30 shadow-xs'
                    }`}>
                      <span className="material-symbols-outlined text-lg">donut_large</span>
                    </div>
                  </div>

                  {/* Middle Row: Large Value */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-headline font-black text-2xl sm:text-3xl tracking-tight leading-none ${
                        isDark ? 'text-white' : 'text-[#06331E]'
                      }`}>
                        {coveragePct}%
                      </span>
                      <span className="text-xs font-black uppercase text-emerald-600">Coverage</span>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Requirement Headroom
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Forecast volume vs. plant consumption capacity
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-black ${
                    isDark ? 'border-emerald-500/20 text-emerald-300' : 'border-emerald-500/20 text-emerald-700'
                  }`}>
                    <span>+3.8% YoY Efficiency</span>
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: Active Mines (Amber / Mineral Ore Theme) */}
              <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg group ${
                isDark 
                  ? 'bg-gradient-to-br from-[#261A08] to-[#171004] border-amber-500/30 hover:border-amber-400' 
                  : 'bg-gradient-to-br from-[#FEF8EC] via-[#FFFDF5] to-[#FDF3DE] border-2 border-amber-500/40 hover:border-amber-600 shadow-xs'
              }`}>
                {/* Background Decorative SVG Artwork (Isometric Cubes) */}
                <svg className="absolute -right-3 -bottom-3 w-28 h-28 opacity-15 pointer-events-none transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
                  <path d="M50 15 L80 32 L50 49 L20 32 Z" fill="url(#amb-grad)" />
                  <path d="M20 34 L50 51 L50 85 L20 68 Z" fill="url(#amb-grad)" opacity="0.8" />
                  <path d="M80 34 L50 51 L50 85 L80 68 Z" fill="url(#amb-grad)" opacity="0.6" />
                  <defs>
                    <linearGradient id="amb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  {/* Top Row: Pill Tag + Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-500/15 text-amber-900 border border-amber-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pit Operations
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-white text-amber-600 border border-amber-500/30 shadow-xs'
                    }`}>
                      <span className="material-symbols-outlined text-lg">factory</span>
                    </div>
                  </div>

                  {/* Middle Row: Large Value */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-headline font-black text-2xl sm:text-3xl tracking-tight leading-none ${
                        isDark ? 'text-white' : 'text-[#3D2505]'
                      }`}>
                        {operationalCount} / {SUPPLY_MINES.length}
                      </span>
                      <span className="text-xs font-black uppercase text-amber-600">Active</span>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Online Mining Leases
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Dongri, Balaghat & Tirodi active; 1 in maintenance
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-black ${
                    isDark ? 'border-amber-500/20 text-amber-300' : 'border-amber-500/20 text-amber-800'
                  }`}>
                    <span>Balaghat & Dongri Peak</span>
                    <span className="material-symbols-outlined text-xs">bolt</span>
                  </div>
                </div>
              </div>

              {/* CARD 4: Grade Spectrum (Indigo / Sapphire Theme) */}
              <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg group ${
                isDark 
                  ? 'bg-gradient-to-br from-[#121B2F] to-[#0A101C] border-indigo-500/30 hover:border-indigo-400' 
                  : 'bg-gradient-to-br from-[#EEF4FF] via-[#F6F9FF] to-[#E4EDFF] border-2 border-indigo-500/40 hover:border-indigo-600 shadow-xs'
              }`}>
                {/* Background Decorative SVG Artwork (Crystal Facets) */}
                <svg className="absolute -right-3 -bottom-3 w-28 h-28 opacity-15 pointer-events-none transition-transform duration-500 group-hover:scale-110" viewBox="0 0 100 100" fill="none">
                  <polygon points="50,10 90,40 75,90 25,90 10,40" stroke="url(#ind-grad)" strokeWidth="5" fill="none" />
                  <polygon points="50,25 75,45 65,75 35,75 25,45" fill="url(#ind-grad)" opacity="0.5" />
                  <defs>
                    <linearGradient id="ind-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                  {/* Top Row: Pill Tag + Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-indigo-500/15 text-indigo-900 border border-indigo-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      BIS IS:1837 Standard
                    </span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-white text-indigo-600 border border-indigo-500/30 shadow-xs'
                    }`}>
                      <span className="material-symbols-outlined text-lg">verified</span>
                    </div>
                  </div>

                  {/* Middle Row: Large Value */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-headline font-black text-2xl sm:text-3xl tracking-tight leading-none ${
                        isDark ? 'text-white' : 'text-[#121E3D]'
                      }`}>
                        Mn 36–50%
                      </span>
                    </div>
                    <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Metallurgical Grade Range
                    </p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      4 certified grades (Ultra-Low Phos &lt;0.12% P)
                    </p>
                  </div>

                  {/* Bottom Indicator */}
                  <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-black ${
                    isDark ? 'border-indigo-500/20 text-indigo-300' : 'border-indigo-500/20 text-indigo-700'
                  }`}>
                    <span>NABL Lab Assayed</span>
                    <span className="material-symbols-outlined text-xs">science</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ENHANCED FORECAST SUPPLY VS REQUIREMENT COVERAGE GRAPH */}
            <div className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 space-y-6 ${
              isDark ? 'bg-[#181E27] border-white/10' : 'bg-[#CBD5E1] border-2 border-[#64748B] shadow-sm'
            }`}>
              
              {/* Header: Title + Timeframe Selector (Inspired by Modern FinTech/Bento UI) */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
                isDark ? 'border-white/10' : 'border-slate-400'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0E7C7B]/15 text-[#0E7C7B] flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">bar_chart</span>
                    </div>
                    <h2 className={`font-headline font-black text-lg uppercase tracking-wide ${textPrimary}`}>
                      Forecast Supply vs. Requirement Coverage
                    </h2>
                  </div>
                  <p className={`text-xs mt-1 ${textMuted}`}>
                    Mine-wise dispatch volume versus certified annual nameplate capacity across MOIL production clusters
                  </p>
                </div>

                {/* Interactive Timeframe Pill Controls */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                }`}>
                  {[
                    { id: 'annual', label: 'Annual FY26', icon: 'calendar_today' },
                    { id: 'q3',     label: 'Q3 Run-Rate', icon: 'timelapse' },
                    { id: 'multi',  label: '3-Year Horizon', icon: 'insights' },
                  ].map(tf => (
                    <button
                      key={tf.id}
                      onClick={() => setCoverageTimeframe(tf.id as 'annual' | 'q3' | 'multi')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        coverageTimeframe === tf.id
                          ? 'bg-[#0E7C7B] text-white shadow-xs'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">{tf.icon}</span>
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aggregate High-Level Stats Strip */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border text-xs ${
                isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200/90 shadow-2xs'
              }`}>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Selected Horizon</span>
                  <span className={`font-black ${textPrimary}`}>
                    {coverageTimeframe === 'annual' ? 'FY 2025–26 Plan' : coverageTimeframe === 'q3' ? 'Q3 Active Quarter' : '3-Year Cumulative'}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Total Forecast</span>
                  <span className="font-black text-[#0E7C7B]">
                    {coverageTimeframe === 'annual' 
                      ? `${(totalForecast / 1000).toFixed(0)}k MT` 
                      : coverageTimeframe === 'q3'
                      ? `${(totalForecast * 0.25 / 1000).toFixed(0)}k MT`
                      : `${(totalForecast * 3 / 1000).toFixed(0)}k MT`}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Net Fulfillment</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{coveragePct}% Coverage</span>
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${textMuted}`}>Reserve Headroom</span>
                  <span className="font-black text-amber-600 dark:text-amber-400">
                    {coverageTimeframe === 'annual' 
                      ? `${((totalCapacity - totalForecast) / 1000).toFixed(0)}k MT Buffer` 
                      : coverageTimeframe === 'q3'
                      ? `${((totalCapacity - totalForecast) * 0.25 / 1000).toFixed(0)}k MT Buffer`
                      : `${((totalCapacity - totalForecast) * 3 / 1000).toFixed(0)}k MT Buffer`}
                  </span>
                </div>
              </div>

              {/* Progress Bars with Detailed Metadata & Subtly Themed Gradients */}
              <div className="space-y-6 pt-2">
                {SUPPLY_MINES.map(mine => {
                  const factor = coverageTimeframe === 'annual' ? 1 : coverageTimeframe === 'q3' ? 0.25 : 3;
                  const forecast = mine.currentForecast * factor;
                  const capacity = mine.annualCapacity * factor;
                  const pct = Math.round((forecast / capacity) * 100);

                  const mineTheme = mine.id === 'dongri-buzurg'
                    ? {
                        grad: 'from-[#0E7C7B] via-[#14B8A6] to-[#2DD4BF]',
                        badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
                        pctBadge: isDark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-teal-50 text-teal-800 border border-teal-200',
                        note: '4 Active Pit Benches • Optical Sorting Active'
                      }
                    : mine.id === 'balaghat'
                    ? {
                        grad: 'from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA]',
                        badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
                        pctBadge: isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-800 border border-blue-200',
                        note: 'High-speed Vertical Sinking • 95.2% Yield'
                      }
                    : mine.id === 'tirodi'
                    ? {
                        grad: 'from-[#4338CA] via-[#6366F1] to-[#818CF8]',
                        badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
                        pctBadge: isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-800 border border-indigo-200',
                        note: 'Opencast Haulage Ramp-up • Sinter Blend'
                      }
                    : {
                        grad: 'from-[#D97706] via-[#F59E0B] to-[#FCD34D]',
                        badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
                        pctBadge: isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-800 border border-amber-200',
                        note: 'Scheduled Pit Overhaul • Capacity Reserve'
                      };

                  return (
                    <div key={mine.id} className="space-y-2 group">
                      {/* Mine Title & Metrics Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`font-headline font-black text-sm ${textPrimary}`}>
                            {mine.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${mineTheme.badge}`}>
                            {mine.grade}
                          </span>
                          <span className={`text-[10px] hidden sm:inline ${textMuted}`}>
                            {mine.district}
                          </span>
                          {mine.status === 'MAINTENANCE' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                              Maintenance
                            </span>
                          )}
                        </div>

                        {/* Right Value & Percent Pill */}
                        <div className="flex items-center gap-2.5">
                          <span className={`font-mono text-xs font-semibold ${textMuted}`}>
                            <strong className={`font-bold ${textPrimary}`}>{(forecast / 1000).toFixed(0)}k</strong> / {(capacity / 1000).toFixed(0)}k MT
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${mineTheme.pctBadge}`}>
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* The Bar Track */}
                      <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 relative transition-all duration-300 ${
                        isDark ? 'bg-slate-800/80 border border-white/5' : 'bg-slate-200/90 border border-slate-300/40'
                      }`}>
                        {/* Target 100% capacity guide line */}
                        <div className="absolute top-0 bottom-0 right-0 w-0.5 bg-slate-400/40 z-10" title="100% Nameplate Capacity" />
                        
                        {/* Progress Fill */}
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${mineTheme.grad} transition-all duration-700 ease-out shadow-xs`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Micro Note Under Bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                        <span>{mineTheme.note}</span>
                        <span className="font-mono">Cap: {(capacity / 1000).toFixed(0)}k MT</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Scale Grid Lines & Labels (0%, 25%, 50%, 75%, 100%) */}
              <div className={`pt-4 border-t ${divider} space-y-2`}>
                <div className="relative w-full h-3">
                  <div className="absolute left-0 text-[9px] font-mono text-slate-400">0%</div>
                  <div className="absolute left-1/4 -translate-x-1/2 text-[9px] font-mono text-slate-400">25%</div>
                  <div className="absolute left-2/4 -translate-x-1/2 text-[9px] font-mono text-slate-400">50%</div>
                  <div className="absolute left-3/4 -translate-x-1/2 text-[9px] font-mono text-slate-400">75%</div>
                  <div className="absolute right-0 text-[9px] font-mono font-bold text-[#0E7C7B]">100% Nameplate Cap</div>
                </div>

                {/* Legend Strip */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-[#0E7C7B] to-[#14B8A6] inline-block" />
                      Dongri (Teal Oxide)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-[#1D4ED8] to-[#60A5FA] inline-block" />
                      Balaghat (Sapphire Underground)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-[#4338CA] to-[#818CF8] inline-block" />
                      Tirodi (Cobalt Gondite)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-[#D97706] to-[#FCD34D] inline-block" />
                      Sitapatore (Maintenance Reserve)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">
                    All Figures in Metric Tonnes (MT)
                  </span>
                </div>
              </div>

            </div>

            {/* MINE / SOURCE BREAKDOWN (Solid Brand Colors Layered Infographic Layout) */}
            <div className={`p-6 sm:p-7 rounded-2xl border space-y-5 transition-all duration-300 ${
              isDark ? 'bg-[#181E27] border-white/10' : 'bg-[#FEF9E7] border-2 border-[#D97706]/35 shadow-sm'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${
                isDark ? 'border-white/10' : 'border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-base">location_on</span>
                  </div>
                  <div>
                    <h2 className={`font-headline font-black text-lg uppercase tracking-wide ${textPrimary}`}>
                      Mine / Source Breakdown
                    </h2>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>
                      Primary operational clusters, extraction configurations, and certified dispatch capacities
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-amber-100/90 border-amber-200 text-amber-900'
                }`}>
                  4 Active Leaseholds
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                {SUPPLY_MINES.map((mine, index) => {
                  const seq = `0${index + 1}`;
                  const config = mine.id === 'dongri-buzurg'
                    ? {
                        solidBg: 'bg-[#0E7C7B]',
                        textAccent: 'text-[#0E7C7B] dark:text-[#2DD4BF]',
                        lightBg: 'bg-[#E6F5F4] dark:bg-[#0E7C7B]/20',
                        borderAccent: 'border-[#0E7C7B]',
                        icon: 'diamond',
                        type: 'Open Cast Bench Quarry',
                        leaseId: 'ML-04/MH (Dongri Central)',
                        statusColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      }
                    : mine.id === 'balaghat'
                    ? {
                        solidBg: 'bg-[#1F3864]',
                        textAccent: 'text-[#1F3864] dark:text-[#93C5FD]',
                        lightBg: 'bg-[#EAF1FB] dark:bg-[#1F3864]/20',
                        borderAccent: 'border-[#1F3864]',
                        icon: 'swap_vert',
                        type: 'Underground Deep Shaft',
                        leaseId: 'ML-01/MP (Bharweli Mine)',
                        statusColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      }
                    : mine.id === 'tirodi'
                    ? {
                        solidBg: 'bg-[#2563EB]',
                        textAccent: 'text-[#2563EB] dark:text-[#60A5FA]',
                        lightBg: 'bg-[#EFF6FF] dark:bg-[#2563EB]/20',
                        borderAccent: 'border-[#2563EB]',
                        icon: 'terrain',
                        type: 'Opencast Bench Operation',
                        leaseId: 'ML-02/MP (Tirodi West)',
                        statusColor: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      }
                    : {
                        solidBg: 'bg-[#D97706]',
                        textAccent: 'text-[#D97706] dark:text-[#FCD34D]',
                        lightBg: 'bg-[#FEF8EC] dark:bg-[#D97706]/20',
                        borderAccent: 'border-[#D97706]',
                        icon: 'build_circle',
                        type: 'Siliceous Feed Quarry',
                        leaseId: 'ML-07/MP (Sitapatore South)',
                        statusColor: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40'
                      };

                  const pct = Math.round((mine.currentForecast / mine.annualCapacity) * 100);

                  return (
                    <div
                      key={mine.id}
                      className={`rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        isDark ? 'bg-[#161C24] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'
                      } p-5 flex flex-col justify-between space-y-4`}
                    >
                      {/* Top Row: Left Brand Color Notch + Identity + Right Status & Seq */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Solid Accent Icon Badge */}
                          <div className={`w-10 h-10 rounded-xl ${config.solidBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                            <span className="material-symbols-outlined text-lg">{config.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-headline font-black text-base ${textPrimary}`}>
                                {mine.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${config.statusColor}`}>
                                {mine.status}
                              </span>
                            </div>
                            <p className={`text-xs mt-0.5 ${textMuted}`}>
                              {mine.district} • <span className="font-semibold text-slate-700 dark:text-slate-300">{config.type}</span>
                            </p>
                          </div>
                        </div>

                        {/* Top Right Sequence ID */}
                        <div className="flex flex-col items-end shrink-0">
                          <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-md ${config.lightBg} ${config.textAccent}`}>
                            {seq} / 04
                          </span>
                          <span className={`text-[9px] font-mono mt-1 ${textMuted}`}>
                            {config.leaseId.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Middle Tabular Metrics Grid */}
                      <div className={`grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg border text-xs ${
                        isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50/80 border-slate-200/80'
                      }`}>
                        <div>
                          <span className={`block text-[9px] uppercase font-bold tracking-wider ${textMuted}`}>
                            Assay Grade
                          </span>
                          <span className={`font-black text-xs block mt-0.5 ${textPrimary}`}>
                            {mine.grade}
                          </span>
                        </div>

                        <div>
                          <span className={`block text-[9px] uppercase font-bold tracking-wider ${textMuted}`}>
                            Annual Target
                          </span>
                          <span className={`font-black text-xs block mt-0.5 ${config.textAccent}`}>
                            {(mine.currentForecast / 1000).toFixed(0)}k MT
                          </span>
                        </div>

                        <div>
                          <span className={`block text-[9px] uppercase font-bold tracking-wider ${textMuted}`}>
                            Nameplate Cap
                          </span>
                          <span className={`font-black text-xs block mt-0.5 ${textPrimary}`}>
                            {(mine.annualCapacity / 1000).toFixed(0)}k MT
                          </span>
                        </div>
                      </div>

                      {/* Bottom Utilization Progress Bar & Lease Info */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className={textMuted}>Capacity Allocation</span>
                          <span className={`font-mono ${config.textAccent}`}>{pct}% Fulfillment</span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDark ? 'bg-slate-800' : 'bg-slate-200'
                        }`}>
                          <div
                            className={`h-full rounded-full ${config.solidBg} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
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
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
              <div className={`flex items-center justify-between border-b pb-4 flex-wrap gap-2 ${divider}`}>
                <div>
                  <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-[#0E7C7B]">category</span>
                    Product & Grade Catalogue
                  </h2>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Standardized metallurgical specifications, certified geochemical assay ranges, and source leasehold allocations
                  </p>
                </div>
                <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-md border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                  IS 1837 Certified • FY 2025–26
                </span>
              </div>

              <div className="space-y-6">
                {PRODUCT_CATALOGUE.map((product, idx) => {
                  const cardBgClass = isDark
                    ? idx === 0
                      ? 'bg-[#152238] border-white/10'
                      : idx === 1
                      ? 'bg-[#1A2D49] border-white/10'
                      : idx === 2
                      ? 'bg-[#20395C] border-white/10'
                      : 'bg-[#274872] border-white/10'
                    : idx === 0
                    ? 'bg-[#18365D] border-[#10243E] shadow-md'
                    : idx === 1
                    ? 'bg-[#1E4A7D] border-[#163962] shadow-md'
                    : idx === 2
                    ? 'bg-[#295D94] border-[#1F4A77] shadow-sm'
                    : 'bg-[#3874AC] border-[#2C5F90] shadow-sm';

                  return (
                    <div
                      key={product.grade}
                      className={`rounded-2xl border p-5 sm:p-6 space-y-5 transition-all text-white ${cardBgClass}`}
                    >
                    {/* Header Row */}
                    <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-headline font-black text-xl text-white tracking-tight">
                            {product.grade}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.08] text-white/90 border border-white/15">
                            {product.tier} Tier
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10">
                            {product.form}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300/90 flex-wrap">
                          <span>Standard: <strong className="text-white">{product.bisStandard}</strong></span>
                          <span className="text-white/30">•</span>
                          <span>Mineralogy: <strong className="text-white/90 font-medium">{product.geochemical.mineralogy}</strong></span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-medium text-slate-300">
                        <span className="material-symbols-outlined text-xs text-emerald-400/80">verified</span>
                        NABL Assayed
                      </div>
                    </div>

                    {/* Geochemical Matrix - Subtle 5-Column Grid */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-300/80">
                        Geochemical Assay Specifications
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {/* Mn Content */}
                        <div className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border-2 border-sky-300/60 hover:border-sky-300 transition-all flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between text-sky-200/90">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mn Content</span>
                            <span className="material-symbols-outlined text-xs text-sky-300/70">analytics</span>
                          </div>
                          <p className="font-headline font-black text-lg text-white tracking-tight">
                            {product.geochemical.mn}
                          </p>
                        </div>

                        {/* Fe (Iron) */}
                        <div className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border-2 border-sky-300/60 hover:border-sky-300 transition-all flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between text-sky-200/90">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Fe (Iron)</span>
                            <span className="material-symbols-outlined text-xs text-sky-300/70">science</span>
                          </div>
                          <p className="font-headline font-black text-lg text-white tracking-tight">
                            {product.geochemical.fe}
                          </p>
                        </div>

                        {/* SiO2 (Silica) */}
                        <div className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border-2 border-sky-300/60 hover:border-sky-300 transition-all flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between text-sky-200/90">
                            <span className="text-[10px] font-bold uppercase tracking-wider">SiO₂ (Silica)</span>
                            <span className="material-symbols-outlined text-xs text-sky-300/70">grain</span>
                          </div>
                          <p className="font-headline font-black text-lg text-white tracking-tight">
                            {product.geochemical.sio2}
                          </p>
                        </div>

                        {/* Phosphorus */}
                        <div className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border-2 border-sky-300/60 hover:border-sky-300 transition-all flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between text-sky-200/90">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Phosphorus (P)</span>
                            <span className="material-symbols-outlined text-xs text-sky-300/70">water_drop</span>
                          </div>
                          <p className="font-headline font-black text-lg text-white tracking-tight">
                            {product.geochemical.p}
                          </p>
                        </div>

                        {/* Mn:Fe Ratio */}
                        <div className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border-2 border-sky-300/60 hover:border-sky-300 transition-all flex flex-col justify-between space-y-1 col-span-2 sm:col-span-1">
                          <div className="flex items-center justify-between text-sky-200/90">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Mn:Fe Ratio</span>
                            <span className="material-symbols-outlined text-xs text-sky-300/70">balance</span>
                          </div>
                          <p className="font-headline font-black text-lg text-emerald-300 tracking-tight">
                            {product.geochemical.mnFeRatio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Split: Producing MOIL Mines & Industrial Applications */}
                    <div className="pt-3 border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Source Mines (Light Blue with Dark Blue Border) */}
                      <div className="lg:col-span-7 space-y-2">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-sky-200">
                          Source Mines & Active Leases
                        </span>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {product.mines.map(mine => (
                            <div
                              key={mine.name}
                              className="px-3.5 py-2 rounded-xl bg-[#93C5FD] hover:bg-[#7DB5FA] border-2 border-[#0B1E38] text-slate-900 flex items-center gap-2.5 transition-all shadow-xs"
                            >
                              <span className="material-symbols-outlined text-base text-[#0B1E38] shrink-0">location_on</span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-[#04142D] text-xs">{mine.name}</span>
                                  {mine.isFlagship && (
                                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-400/35 text-amber-950 border border-amber-600/50 uppercase">
                                      Flagship
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#0F2942] font-semibold block mt-0.5">
                                  {mine.location} • {mine.type} • <strong className="text-[#022C22] font-black">{mine.specificGrade}</strong>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Industrial Applications (Deep Grey Styling) */}
                      <div className="lg:col-span-5 space-y-1.5 p-3.5 rounded-xl bg-[#94A3B8] border-2 border-[#1E293B] text-slate-950 shadow-sm">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-[#0F172A]">
                          Industrial Applications
                        </span>
                        <p className="text-xs text-[#020617] font-bold leading-relaxed">
                          {product.applications}
                        </p>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-start gap-3 ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
              <span className="material-symbols-outlined text-blue-500 text-xl shrink-0 mt-0.5">info</span>
              <div className={`text-sm ${textPrimary}`}>
                <p className="font-bold">Quality & Assaying Protocol</p>
                <p className={`mt-1 ${textMuted}`}>All grades conform to Bureau of Indian Standards (BIS IS 1837). Third-party assay certificates available for contracted buyers. Moisture typically &lt;= 8% at dispatch. Contact MOIL commercial desk for lot-specific data.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3-MONTH OUTLOOK TAB ─────────────────────────────────────────── */}
        {activeTab === 'outlook' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <div>
                  <h2 className={`font-headline font-black text-lg uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-amber-500">calendar_month</span>
                    Three-Month Supply Outlook
                  </h2>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Consolidated production schedules and mine-wise AI volume forecasts across MOIL leaseholds
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${isDark ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  OCT – DEC 2025
                </span>
              </div>

              <div className="space-y-6">
                {THREE_MONTH_OUTLOOK.map(month => {
                  const coverPct = Math.round((month.forecast / month.planned) * 100);
                  return (
                    <div key={month.month} className={`p-5 rounded-2xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 space-y-4 ${nestedBg}`}>
                        {/* Month Header & Macro Stats */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`font-headline font-black text-2xl tracking-tight ${textPrimary}`}>{month.month}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              month.confidence === 'HIGH'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}>
                              {month.confidence} CONFIDENCE
                            </span>
                          </div>
                          <span className={`text-xs italic ${textMuted}`}>{month.note}</span>
                        </div>

                        {/* Macro Metrics (Inner Block with Dark Blue Border) */}
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 ${isDark ? 'bg-black/20' : 'bg-white shadow-xs'}`}>
                          <div>
                            <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Consolidated Planned</span>
                            <span className="font-headline font-black text-2xl text-blue-600 dark:text-blue-400">
                              {(month.planned / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">MT</span>
                            </span>
                          </div>
                          <div>
                            <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Consolidated AI Forecast</span>
                            <span className="font-headline font-black text-2xl text-[#0E7C7B] dark:text-[#2DD4BF]">
                              {(month.forecast / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">MT</span>
                            </span>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                              <span className={textMuted}>Forecast Coverage</span>
                              <span className="text-[#0E7C7B] dark:text-[#2DD4BF] font-black">{coverPct}%</span>
                            </div>
                            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                              <div className="h-full rounded-full bg-[#0E7C7B]" style={{ width: `${coverPct}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Mine-wise Breakdown Grid (Inner Accordion Block with Dark Blue Border) */}
                        <div className="space-y-3 pt-1">
                          <button
                            type="button"
                            onClick={() => toggleMonthBreakdown(month.month)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 transition-all cursor-pointer ${
                              expandedMonths[month.month]
                                ? 'bg-[#0B1E38]/10 dark:bg-white/10 shadow-xs'
                                : isDark
                                ? 'bg-white/[0.03] hover:bg-white/[0.06]'
                                : 'bg-white hover:bg-slate-50 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#0B1E38] text-white flex items-center justify-center shadow-2xs">
                                <span className="material-symbols-outlined text-base">tune</span>
                              </div>
                              <div className="text-left">
                                <span className={`text-xs font-black uppercase tracking-wider block ${textPrimary}`}>
                                  Mine-Wise Allocation & Forecast Breakdown
                                </span>
                                <span className={`text-[10px] ${textMuted}`}>
                                  7 MOIL mining assets contributing to this cycle
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                                expandedMonths[month.month]
                                  ? 'bg-[#0B1E38] text-white border-[#0B1E38]'
                                  : isDark
                                  ? 'bg-white/5 border-white/10 text-slate-300'
                                  : 'bg-slate-100 border-[#0B1E38]/30 text-slate-800'
                              }`}>
                                {expandedMonths[month.month] ? 'Hide Breakdown' : 'View Breakdown'}
                              </span>
                              <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                                expandedMonths[month.month] ? 'rotate-180 text-[#0B1E38] dark:text-[#60A5FA]' : textMuted
                              }`}>
                                expand_more
                              </span>
                            </div>
                          </button>

                          {expandedMonths[month.month] && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 animate-in fade-in duration-300">
                              {month.mineBreakdown.map((mine) => {
                                const mStyle = MINE_STYLING[mine.mineName] || {
                                  color: 'bg-[#1F3864]',
                                  icon: 'layers',
                                  text: 'text-[#1F3864] dark:text-[#93C5FD]',
                                  bg: 'bg-[#EDF2FA] dark:bg-[#1F3864]/20',
                                  border: 'border-[#1F3864]/30'
                                };

                                return (
                                  <div
                                    key={mine.mineName}
                                    className={`p-4 rounded-2xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 transition-all duration-200 flex flex-col justify-between space-y-3.5 hover:shadow-md ${
                                      isDark
                                        ? 'bg-slate-900/80 hover:border-[#60A5FA]'
                                        : 'bg-white hover:border-[#0B1E38]'
                                    }`}
                                  >
                                    {/* Card Top: Solid Color Avatar + Mine Header + Status Badge */}
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                          <div className={`w-9 h-9 rounded-xl ${mStyle.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                                            <span className="material-symbols-outlined text-lg">{mStyle.icon}</span>
                                          </div>
                                          <div>
                                            <h4 className={`font-headline font-black text-xs leading-snug tracking-tight ${textPrimary}`}>
                                              {mine.mineName}
                                            </h4>
                                            <span className={`text-[10px] font-medium flex items-center gap-1 mt-0.5 ${textMuted}`}>
                                              <span className="material-symbols-outlined text-[12px] opacity-75">location_on</span>
                                              {mine.location}
                                            </span>
                                          </div>
                                        </div>

                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${
                                          mine.status === 'OPTIMAL'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                            : mine.status === 'MAINTENANCE'
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                        }`}>
                                          {mine.status}
                                        </span>
                                      </div>

                                      {/* Grade & Type Badges */}
                                      <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                          isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                                        }`}>
                                          {mine.type}
                                        </span>
                                        <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md ${mStyle.bg} ${mStyle.text} border ${mStyle.border}`}>
                                          {mine.grade}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Card Middle: 2-Column Comparative Numbers (Inner Block with Dark Blue Border) */}
                                    <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border-2 border-[#0B1E38]/30 dark:border-[#3B82F6]/30 ${
                                      isDark ? 'bg-black/30' : 'bg-slate-50/90'
                                    }`}>
                                      <div className="space-y-0.5">
                                        <span className={`block text-[9px] uppercase font-bold tracking-wider ${textMuted}`}>Planned</span>
                                        <div className="font-headline font-black text-sm tracking-tight text-slate-800 dark:text-slate-100">
                                          {(mine.planned / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-slate-500">MT</span>
                                        </div>
                                      </div>
                                      <div className="space-y-0.5 text-right">
                                        <span className={`block text-[9px] uppercase font-bold tracking-wider ${textMuted}`}>AI Forecast</span>
                                        <div className={`font-headline font-black text-sm tracking-tight ${mStyle.text}`}>
                                          {(mine.forecast / 1000).toFixed(1)}k <span className="text-[10px] font-normal text-slate-500">MT</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Card Bottom: Solid Progress Bar & Fulfillment Rate */}
                                    <div className="space-y-1 pt-0.5">
                                      <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className={`uppercase tracking-wider text-[9px] ${textMuted}`}>Fulfillment Target</span>
                                        <span className={`font-black ${
                                          mine.fulfillmentPct >= 97 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                          {mine.fulfillmentPct}%
                                        </span>
                                      </div>
                                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                                        <div
                                          className={`h-full rounded-full ${mStyle.color}`}
                                          style={{ width: `${mine.fulfillmentPct}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
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
            
            {/* TOP HEADER & ACTION BANNER */}
            <div className={`p-6 rounded-2xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 flex-wrap gap-4 ${divider}`}>
                <div>
                  <h2 className={`font-headline font-black text-xl uppercase tracking-wide flex items-center gap-2.5 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">eco</span>
                    Sustainable Mining, SDGs & Statutory Compliance
                  </h2>
                  <p className={`text-xs mt-1 ${textMuted}`}>
                    Verified environmental standards, UN SDG alignment, statutory certifications, and leasehold-wise ESG indicators
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadConsolidatedEsgReport}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download Consolidated ESG Dossier (.CSV)
                </button>
              </div>

              {/* ESG KPI Highlights Banner (Dark Blue Background with Subtle Colored Typography) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl border-2 border-[#1E3A8A] dark:border-[#3B82F6]/40 bg-[#0B1E38] shadow-xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-200/80">UN SDGs Aligned</span>
                  <span className="font-headline font-black text-xl text-emerald-300 mt-0.5 block">
                    8 Core Goals
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-300">UN 2030 Agenda</span>
                </div>
                <div className="p-3.5 rounded-xl border-2 border-[#1E3A8A] dark:border-[#3B82F6]/40 bg-[#0B1E38] shadow-xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-200/80">Statutory Clearances</span>
                  <span className="font-headline font-black text-xl text-blue-300 mt-0.5 block">
                    100% Active
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-300">MoEFCC / DGMS</span>
                </div>
                <div className="p-3.5 rounded-xl border-2 border-[#1E3A8A] dark:border-[#3B82F6]/40 bg-[#0B1E38] shadow-xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-200/80">Water Recycled</span>
                  <span className="font-headline font-black text-xl text-cyan-300 mt-0.5 block">
                    82.4% Avg
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-300">Zero Liquid Discharge</span>
                </div>
                <div className="p-3.5 rounded-xl border-2 border-[#1E3A8A] dark:border-[#3B82F6]/40 bg-[#0B1E38] shadow-xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-200/80">Afforestation</span>
                  <span className="font-headline font-black text-xl text-teal-300 mt-0.5 block">
                    1.46M+ Planted
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-300">88%+ Survival Rate</span>
                </div>
                <div className="p-3.5 rounded-xl border-2 border-[#1E3A8A] dark:border-[#3B82F6]/40 bg-[#0B1E38] shadow-xs col-span-2 sm:col-span-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-sky-200/80">Carbon Intensity</span>
                  <span className="font-headline font-black text-xl text-amber-200 mt-0.5 block">
                    20.8 kg/t
                  </span>
                  <span className="text-[10px] block mt-0.5 text-slate-300">CO₂ per ROM tonne</span>
                </div>
              </div>
            </div>

            {/* ── 1. UN SUSTAINABLE DEVELOPMENT GOALS (SDGs) COVERED ── */}
            <div className={`p-6 rounded-2xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <div>
                  <h3 className={`font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">public</span>
                    United Nations Sustainable Development Goals (SDGs) Covered
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Directly mapped institutional targets and verified sustainability commitments under Agenda 2030
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border-2 border-[#0B1E38] ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-emerald-50 text-emerald-800'}`}>
                  8 UN SDGs Embedded
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {SDG_ALIGNMENT.map(sdg => (
                  <div
                    key={sdg.id}
                    className={`relative overflow-hidden p-3.5 sm:p-4 rounded-2xl border-2 ${sdg.cardBorder} ${sdg.cardBg} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-[134px] shadow-2xs group select-none`}
                  >
                    {/* Angled background light highlight slice (like Shop by Category reference) */}
                    <div
                      className={`absolute -right-3 -top-6 -bottom-6 w-32 sm:w-36 pointer-events-none rounded-2xl ${sdg.sliceBg} -skew-x-12 transform origin-top-right transition-transform duration-300 group-hover:scale-105`}
                    />

                    {/* Subtle illustrative watermark icon in background (like Weather widget reference) */}
                    <span
                      className={`material-symbols-outlined absolute right-1 -bottom-1 text-7xl select-none pointer-events-none opacity-15 dark:opacity-20 ${sdg.iconColor}`}
                    >
                      {sdg.watermarkIcon}
                    </span>

                    {/* Top Row: SDG Tag & KPI Pill */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-2xs ${sdg.badgeBg}`}>
                        {sdg.number}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs truncate max-w-[145px] shadow-2xs ${sdg.kpiBg} ${sdg.kpiColor}`}>
                        {sdg.kpi}
                      </span>
                    </div>

                    {/* Bottom Row: Informative Title & Subtitle + Thematic Visual Element */}
                    <div className="relative z-10 flex items-end justify-between gap-2 mt-auto">
                      <div className="space-y-0.5 min-w-0 pr-1 flex-1">
                        <h4 className={`font-headline font-black text-xs leading-tight tracking-tight ${sdg.titleColor}`}>
                          {sdg.name}
                        </h4>
                        <p className={`text-[10px] font-medium leading-tight opacity-75 truncate ${sdg.titleColor}`}>
                          {sdg.subtitle}
                        </p>
                      </div>

                      {/* Floating Communicative Thematic Badge */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <div className={`w-11 h-11 rounded-xl ${sdg.iconBg} ${sdg.iconColor} border ${sdg.cardBorder} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          <span className="material-symbols-outlined text-2xl">{sdg.icon}</span>
                        </div>
                        {/* Mini floating accent symbol */}
                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${sdg.badgeBg} flex items-center justify-center shadow-xs`}>
                          <span className="material-symbols-outlined text-[11px] text-white">{sdg.accentIcon}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. STATUTORY & REGULATORY COMPLIANCES FOLLOWED ── */}
            <div className="p-6 rounded-2xl border-2 border-[#454954] bg-[#2D3037] space-y-5 shadow-md">
              <div className="flex items-center justify-between border-b pb-4 border-white/15">
                <div>
                  <h3 className="font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-amber-400">gavel</span>
                    Statutory & Regulatory Compliances Followed
                  </h3>
                  <p className="text-xs mt-0.5 text-slate-200">
                    Mines safety, environmental protection, pollution control, ISO standards, and DMFT contributions
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border border-white/25 bg-white/10 text-white">
                  100% Certified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {STATUTORY_COMPLIANCES.map(comp => (
                  <div
                    key={comp.actTitle}
                    className="p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-2.5 shadow-2xs bg-gradient-to-br from-[#FEF8EC] via-[#FFFDF5] to-[#FDF3DE] border-amber-500/40 hover:border-amber-600"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {comp.authority}
                          </span>
                          <span className="text-[10px] font-bold ml-1.5 text-amber-900/80">{comp.category}</span>
                        </div>
                        <span className="flex items-center gap-0.5 text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 shrink-0">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          {comp.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-2 leading-snug text-[#3D2505]">{comp.actTitle}</h4>
                      <p className="text-[11px] mt-1 leading-relaxed text-slate-700">{comp.statusText}</p>
                    </div>

                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] flex-wrap gap-1">
                      <div>
                        <span className="block text-[8px] uppercase font-black text-amber-900/70">Validity</span>
                        <span className="font-bold text-slate-900">{comp.validity}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] uppercase font-black text-amber-900/70">Verifier</span>
                        <span className="font-bold text-slate-900">{comp.verifiedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 3. MINE-WISE ESG PERFORMANCE & DOWNLOADABLE METRICS ── */}
            <div className="p-6 rounded-2xl border-2 border-[#1E3A8A] bg-[#0B1E38] space-y-5 shadow-lg">
              <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-3 border-white/15">
                <div>
                  <h3 className="font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-[#2DD4BF]">analytics</span>
                    Mine-Wise ESG Scorecard & Downloadable Metrics
                  </h3>
                  <p className="text-xs mt-0.5 text-slate-300">
                    Granular leasehold sustainability indicators, water recycling rates, afforestation counts, and direct certificate downloads
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border border-sky-400/30 bg-sky-500/15 text-sky-200">
                  6 Producing Leaseholds
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MINE_ESG_METRICS.map(mine => (
                  <div
                    key={mine.mineName}
                    className="p-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-[#132238] flex flex-col justify-between space-y-3 transition-all hover:shadow-md"
                  >
                    <div>
                      {/* Mine Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-headline font-black text-xs tracking-tight text-slate-900 dark:text-white">{mine.mineName}</h4>
                          <span className="text-[10px] block mt-0.5 text-slate-500 dark:text-slate-400">{mine.location} • {mine.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {mine.complianceScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Statutory Clearances */}
                      <div className="mt-2.5 p-2 rounded-lg border border-slate-200 dark:border-white/10 space-y-0.5 text-[10px] bg-slate-50 dark:bg-white/[0.04]">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">EC Validity:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{mine.ecValidity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Forest Clearance:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{mine.forestClearance}</span>
                        </div>
                      </div>

                      {/* ESG KPIs */}
                      <div className="grid grid-cols-2 gap-2 mt-2.5 text-[10px]">
                        <div className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                          <span className="block text-[8px] uppercase font-black text-slate-500 dark:text-slate-400">Water Recycled</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400 text-xs">{mine.waterRecycledPct}%</span>
                          <div className="w-full h-1.5 rounded-full overflow-hidden mt-1 bg-slate-200 dark:bg-white/10">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${mine.waterRecycledPct}%` }} />
                          </div>
                        </div>

                        <div className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                          <span className="block text-[8px] uppercase font-black text-slate-500 dark:text-slate-400">Renewable Share</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">{mine.renewablePowerPct}%</span>
                          <div className="w-full h-1.5 rounded-full overflow-hidden mt-1 bg-slate-200 dark:bg-white/10">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${mine.renewablePowerPct}%` }} />
                          </div>
                        </div>

                        <div className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                          <span className="block text-[8px] uppercase font-black text-slate-500 dark:text-slate-400">Carbon Intensity</span>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{mine.carbonIntensity} <span className="text-[9px] font-normal text-slate-500">kg/t</span></span>
                        </div>

                        <div className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04]">
                          <span className="block text-[8px] uppercase font-black text-slate-500 dark:text-slate-400">LTI-Free Days</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{mine.ltiFreeDays} Days</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] mt-2 px-1">
                        <span className="text-slate-500 dark:text-slate-400">Afforestation:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{mine.saplingsPlanted.toLocaleString('en-IN')} Saplings</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => downloadMineEsgMetrics(mine)}
                        className="w-full py-2 rounded-lg border-2 border-[#0B1E38] dark:border-sky-500/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-sm text-[#0E7C7B] dark:text-teal-400">download</span>
                        Download Mine ESG Sheet (.CSV)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. PUBLIC PRODUCTION & SUSTAINABILITY UPDATES ── */}
            <div className={`p-6 rounded-2xl border-2 border-[#0B1E38] dark:border-[#3B82F6]/60 ${cardBg} space-y-4`}>
              <h3 className={`font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">newspaper</span>
                Public Sustainability & Operational Disclosures
              </h3>
              <div className="space-y-2.5">
                {PUBLIC_UPDATES.map(update => (
                  <div key={update.headline} className={`p-3.5 rounded-xl border-2 border-[#0B1E38]/30 dark:border-[#3B82F6]/30 ${nestedBg}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded border border-[#0B1E38]/20 shrink-0 mt-0.5 ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-700'}`}>
                        {update.date}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${textPrimary}`}>{update.headline}</p>
                        <p className={`text-[11px] mt-0.5 ${textMuted}`}>{update.detail}</p>
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
            
            {/* EXECUTIVE RECOMMENDATION BANNER */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
              <div className={`flex items-center justify-between border-b pb-4 flex-wrap gap-4 ${divider}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0E7C7B] text-white tracking-wider">
                      Sourcing Recommendation
                    </span>
                    <span className={`text-xs font-mono ${textMuted}`}>Benchmark: Indian Smelters & Foundries</span>
                  </div>
                  <h2 className={`font-headline font-black text-lg sm:text-xl uppercase tracking-wide mt-1.5 flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-[#0E7C7B]">verified_user</span>
                    MOIL vs. Global Imports Advantage
                  </h2>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Direct domestic pithead railway supply vs. seaborne maritime imports from South Africa, Australia & Gabon.
                  </p>
                </div>
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#0E7C7B] hover:bg-[#0C6A69] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-sm">request_quote</span>
                  Request Contract Allocation
                </button>
              </div>

              {/* Top Macro Stats Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                  <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Landed Savings</span>
                  <span className="font-headline font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    18% – 26%
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${textMuted}`}>₹2,800–₹4,200/MT Saved</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                  <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Lead Time</span>
                  <span className="font-headline font-black text-xl sm:text-2xl text-blue-600 dark:text-blue-400 mt-0.5 block">
                    3 – 5 Days
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${textMuted}`}>vs. 35+ Days Sea Transit</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                  <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Forex & Duty</span>
                  <span className="font-headline font-black text-xl sm:text-2xl text-[#0E7C7B] dark:text-[#2DD4BF] mt-0.5 block">
                    0% Risk
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${textMuted}`}>INR Billed + 100% GST ITC</span>
                </div>
                <div className={`p-3.5 rounded-xl border ${nestedBg}`}>
                  <span className={`block text-[10px] uppercase font-black tracking-wider ${textMuted}`}>Buffer Inventory</span>
                  <span className="font-headline font-black text-xl sm:text-2xl text-amber-600 dark:text-amber-400 mt-0.5 block">
                    10 – 14 Days
                  </span>
                  <span className={`text-[10px] block mt-0.5 ${textMuted}`}>vs. 65–75 Days for Imports</span>
                </div>
              </div>
            </div>

            {/* ── 1. STRATEGIC REASONING: 4 QUANTIFIED DATA PILLARS ── */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
                <div>
                  <h3 className={`font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-amber-500">insights</span>
                    4 Strategic Sourcing Pillars
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Financial, operational, quality, and supply continuity justifications
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${isDark ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  Data-Backed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RECOMMENDATION_PILLARS.map((pillar) => (
                  <div
                    key={pillar.title}
                    className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:shadow-lg group shadow-2xs ${pillar.cardBg} ${pillar.borderColor}`}
                  >
                    <div>
                      {/* Top Row: Pill Tag with dot + Icon Tile on Right */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${pillar.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pillar.dotColor} animate-pulse`} />
                          {pillar.badge}
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${pillar.iconTileColor}`}>
                          <span className="material-symbols-outlined text-lg">{pillar.icon}</span>
                        </div>
                      </div>

                      {/* Middle Row: Title & Headline */}
                      <div className="mt-2.5">
                        <h4 className={`font-headline font-black text-sm tracking-tight ${pillar.titleColor}`}>{pillar.title}</h4>
                        <span className={`text-[10px] font-black uppercase ${pillar.headlineColor}`}>{pillar.headline}</span>
                      </div>

                      {/* Stat Highlight Box */}
                      <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center justify-between ${pillar.statBoxBg}`}>
                        <span className="text-xs font-semibold text-slate-700">{pillar.statSub}</span>
                        <span className={`font-headline font-black text-xl ${pillar.statColor}`}>{pillar.stat}</span>
                      </div>

                      {/* Bulleted Points with Themed Checkmarks */}
                      <ul className={`mt-3 pt-2.5 border-t space-y-1.5 ${pillar.dividerColor}`}>
                        {pillar.points.map((pt, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs">
                            <span className={`material-symbols-outlined text-sm shrink-0 ${pillar.checkColor}`}>check_circle</span>
                            <span className={`leading-snug font-medium ${pillar.textColor}`}>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. INTERACTIVE SOURCING SAVINGS & WORKING CAPITAL CALCULATOR ── */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#063327]/90 border-emerald-500/50 shadow-md' : 'bg-[#CBEADB] border-[#6AC798] shadow-sm'} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 flex-wrap gap-2 ${isDark ? 'border-emerald-500/30' : 'border-[#6AC798]/50'}`}>
                <div>
                  <h3 className={`font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-[#0E7C7B]">calculate</span>
                    Interactive Cost & Working Capital Simulator
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Estimate financial savings and unlocked capital by switching to domestic MOIL supply
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 rounded bg-[#0E7C7B] text-white">
                  Live Calculator
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
                {/* Input Controls */}
                <div className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${nestedBg}`}>
                  <label className={`block text-xs font-black uppercase tracking-wider ${textPrimary}`}>
                    Monthly Ore Consumption (MT)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1000}
                      max={30000}
                      step={500}
                      value={calcMonthlyMt}
                      onChange={(e) => setCalcMonthlyMt(Number(e.target.value))}
                      className="w-full accent-[#0E7C7B] cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={textMuted}>1,000 MT</span>
                    <span className="font-headline font-black text-lg text-blue-600 dark:text-blue-400">
                      {calcMonthlyMt.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">MT/mo</span>
                    </span>
                    <span className={textMuted}>30,000 MT</span>
                  </div>
                  <p className={`text-[10px] ${textMuted} pt-1 border-t border-black/5 dark:border-white/5`}>
                    Annual volume: <strong>{(calcMonthlyMt * 12).toLocaleString('en-IN')} MT/year</strong>
                  </p>
                </div>

                {/* Calculation Outputs */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white border-slate-200'}`}>
                    <span className={`block text-[10px] uppercase font-black ${textMuted}`}>Annual Cost Savings</span>
                    <span className="font-headline font-black text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 mt-1 block">
                      ₹ {((calcMonthlyMt * 3450 * 12) / 10000000).toFixed(2)} Cr
                    </span>
                    <span className={`text-[10px] mt-0.5 block ${textMuted}`}>@ ₹3,450/MT net savings</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white border-slate-200'}`}>
                    <span className={`block text-[10px] uppercase font-black ${textMuted}`}>Working Capital Freed</span>
                    <span className="font-headline font-black text-xl sm:text-2xl text-blue-600 dark:text-blue-400 mt-1 block">
                      ₹ {((calcMonthlyMt * 14000 * 35) / 365 / 10000000).toFixed(2)} Cr
                    </span>
                    <span className={`text-[10px] mt-0.5 block ${textMuted}`}>35 days less buffer inventory</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white border-slate-200'}`}>
                    <span className={`block text-[10px] uppercase font-black ${textMuted}`}>Logistics CO₂ Avoided</span>
                    <span className="font-headline font-black text-xl sm:text-2xl text-[#0E7C7B] dark:text-[#2DD4BF] mt-1 block">
                      {Math.round((calcMonthlyMt * 12 * 46) / 1000).toLocaleString('en-IN')} t
                    </span>
                    <span className={`text-[10px] mt-0.5 block ${textMuted}`}>vs ocean freight</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. DETAILED MULTI-PARAMETER BENCHMARK MATRIX ── */}
            <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
              <div className={`flex items-center justify-between border-b pb-4 flex-wrap gap-2 ${divider}`}>
                <div>
                  <h3 className={`font-headline font-black text-base uppercase tracking-wide flex items-center gap-2 ${textPrimary}`}>
                    <span className="material-symbols-outlined text-[#0E7C7B]">compare_arrows</span>
                    Global Sourcing Benchmark Matrix
                  </h3>
                  <p className={`text-xs mt-0.5 ${textMuted}`}>
                    Head-to-head comparison across lead time, cost, forex, and commitment limits
                  </p>
                </div>
                <span className={`text-[10px] font-mono uppercase ${textMuted}`}>FY 2025-26 Trade Terms</span>
              </div>

              <div className="space-y-3.5">
                {ALT_SOURCES.map(src => (
                  <div key={src.supplier} className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
                    src.recommended
                      ? isDark ? 'bg-[#063327]/90 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40' : 'bg-[#CBEADB] border-[#6AC798] shadow-sm ring-1 ring-emerald-500/20'
                      : isDark ? 'bg-[#0F1B2C] border-sky-700/60' : 'bg-[#B8D7F7] border-[#6BA7EB] shadow-xs'
                  }`}>
                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-headline font-black text-base sm:text-lg ${textPrimary}`}>{src.supplier}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/90 border-[#6BA7EB] text-slate-800'} font-semibold`}>
                          {src.origin}
                        </span>
                      </div>
                      {src.recommended ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-[#0E7C7B] text-white rounded-full flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-xs">thumb_up</span>
                          Recommended Primary Sourcing
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">
                          {src.financialDelta}
                        </span>
                      )}
                    </div>

                    {/* Detailed Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Grade Range</span>
                        <span className={`font-bold mt-0.5 block ${textPrimary}`}>{src.grade}</span>
                      </div>

                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Lead Time</span>
                        <span className={`font-bold mt-0.5 block ${src.recommended ? 'text-emerald-600 dark:text-emerald-400 font-black' : textPrimary}`}>
                          {src.leadTimeDays}
                        </span>
                      </div>

                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Customs / Duty</span>
                        <span className={`font-bold mt-0.5 block ${src.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {src.customsDuty}
                        </span>
                      </div>

                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Currency Risk</span>
                        <span className={`font-bold mt-0.5 block ${src.recommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {src.currencyRisk}
                        </span>
                      </div>

                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Min Order Lot</span>
                        <span className={`font-bold mt-0.5 block ${textPrimary}`}>{src.minLotSize}</span>
                      </div>

                      <div className={`p-2 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-[#6BA7EB]/60 shadow-2xs'}`}>
                        <span className={`block text-[9px] uppercase font-black ${textMuted}`}>Buffer Stock</span>
                        <span className={`font-bold mt-0.5 block ${src.recommended ? 'text-emerald-600 dark:text-emerald-400' : textPrimary}`}>
                          {src.workingCapitalDays}
                        </span>
                      </div>
                    </div>

                    {/* Logistics & Key Note Row */}
                    <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2 border-t border-black/5 dark:border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase ${textMuted}`}>Logistics:</span>
                        <span className={`font-semibold ${textPrimary}`}>{src.logistics}</span>
                        <span className={textMuted}>•</span>
                        <span className={`text-[10px] ${textMuted}`}>Freight: <strong>{src.freightCostEst}</strong></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${src.recommended ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isDark ? 'bg-white/5 text-slate-400' : 'bg-white/90 border border-[#6BA7EB] text-slate-800'}`}>
                          {src.note}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] uppercase font-bold ${textMuted}`}>ESG:</span>
                          <span className="text-amber-500 font-bold">{'★'.repeat(src.esg)}{'☆'.repeat(5 - src.esg)}</span>
                        </div>
                      </div>
                    </div>
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
