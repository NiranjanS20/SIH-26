import React, { useState } from 'react';
import { MOIL_MINES, type MineItem } from '../data/minesData';
import { OperationalFootprintMap } from './OperationalFootprintMap';
import { type PortalRoute } from './Navbar';
import { ThemeToggleSwitch } from './ui/ThemeToggleSwitch';

interface MineSelectionPageProps {
  onNavigate: (route: PortalRoute) => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const MineSelectionPage: React.FC<MineSelectionPageProps> = ({
  onNavigate,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const [selectedState, setSelectedState] = useState<string>('MAHARASHTRA'); // Default Maharashtra per prompt
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL MINES');
  const [hoveredMineId, setHoveredMineId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map state names to dataset matching
  const mapStateFilter = (stateStr: string): string => {
    if (stateStr === 'MAHARASHTRA') return 'Maharashtra';
    if (stateStr === 'MADHYA PRADESH') return 'Madhya Pradesh';
    return 'ALL';
  };

  const activeStateFilter = mapStateFilter(selectedState);

  // Mines filtered by state only (used for computing dynamic category counts)
  const stateFilteredMines = MOIL_MINES.filter((mine) => {
    if (activeStateFilter !== 'ALL' && mine.state !== activeStateFilter) {
      return false;
    }
    return true;
  });

  const totalCount = stateFilteredMines.length;
  const openCastCount = stateFilteredMines.filter((m) => m.type === 'Open Cast').length;
  const undergroundCount = stateFilteredMines.filter((m) => m.type === 'Underground').length;
  const activeCount = stateFilteredMines.filter((m) => m.isImplemented).length;

  // Filter mines array based on both State Selector and Category Filter Bar
  const displayedMines = MOIL_MINES.filter((mine) => {
    // State Filter
    if (activeStateFilter !== 'ALL' && mine.state !== activeStateFilter) {
      return false;
    }
    // Category Filter
    if (selectedFilter === 'OPEN CAST' && mine.type !== 'Open Cast') return false;
    if (selectedFilter === 'UNDERGROUND' && mine.type !== 'Underground') return false;
    if (selectedFilter === 'ACTIVE' && !mine.isImplemented) return false;
    return true;
  });

  const handleSelectMine = (mine: MineItem) => {
    const id = mine.id;
    if (id === 'dongri-buzurg' || id === 'tirodi' || id === 'sitapatore' || id === 'balaghat' || id === 'ukwa' || id === 'chikla' || id === 'gumgaon') {
      onNavigate(`workspace/${id}` as PortalRoute);
    } else {
      setToastMessage(
        `Digital Telemetry for ${mine.name} is currently under Phase II onboarding. Select Dongri Buzurg, Tirodi, or Sitapatore for active pilot telemetry.`
      );
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`min-h-screen font-body pt-24 pb-16 px-4 md:px-8 lg:px-12 transition-colors duration-300 ${
        isDark
          ? 'bg-[#181B20] text-white selection:bg-[#D97706] selection:text-[#181B20]'
          : 'bg-[#FCF9F8] text-[#1B1B1C] selection:bg-[#FEA619] selection:text-[#1B1B1C]'
      }`}
    >
      {/* Toast Notification for Disabled Mines */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#242830] text-white p-4 rounded-xl shadow-2xl border border-[#D97706]/50 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-[#D97706] text-xl shrink-0 mt-0.5">
            shield_with_house
          </span>
          <div className="flex-1">
            <p className="font-bold text-xs uppercase tracking-wider text-[#D97706]">
              Phase II Integration Pending
            </p>
            <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-sm cursor-pointer ml-1"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* 1. PAGE INTRODUCTION */}
        {/* ========================================================================= */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border-2 transition-all ${
            isDark
              ? 'bg-[#242830] border-[#002452] shadow-xl'
              : 'bg-white border-[#002452] shadow-sm'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2 ${
                  isDark
                    ? 'bg-[#2E333E] text-[#D97706] border-white/15'
                    : 'bg-[#002452]/5 text-[#002452] border-[#002452]/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></span>
                <p className="font-body text-[11px] font-black tracking-[0.2em] uppercase">
                  MOIL LIMITED • ENTERPRISE MINE NETWORK
                </p>
              </div>
              <h1
                className={`font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase ${
                  isDark ? 'text-white' : 'text-[#002452]'
                }`}
              >
                EXPLORE MOIL'S MINING OPERATIONS
              </h1>
              <p
                className={`font-body text-sm md:text-base font-medium mt-1 max-w-2xl ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#44474F]'
                }`}
              >
                Explore MOIL's mining footprint across India and select a mine to access its digital workspace.
              </p>
            </div>

            {/* Enterprise Quick Metrics & Dark/Light Mode Switcher ONLY on this page */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <div
                className={`px-3.5 py-2 rounded-lg border text-center ${
                  isDark ? 'bg-[#181B20] border-white/15' : 'bg-white border-[#E2E8F0]'
                }`}
              >
                <span className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Mines Network
                </span>
                <span className="font-headline font-extrabold text-sm text-[#D97706]">
                  {totalCount} {totalCount === 1 ? 'Mine' : 'Mines'}
                </span>
              </div>

              <div
                className={`px-3.5 py-2 rounded-lg border text-center ${
                  isDark ? 'bg-[#181B20] border-white/15' : 'bg-white border-[#E2E8F0]'
                }`}
              >
                <span className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Compliance
                </span>
                <span className="font-headline font-extrabold text-sm text-emerald-400">
                  DGMS Standard
                </span>
              </div>

              {/* Sleek Theme Toggle Pill Switch */}
              {onToggleTheme && (
                <ThemeToggleSwitch
                  isDark={isDark}
                  onToggle={onToggleTheme}
                />
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED OPERATIONAL DIRECTORY PANEL (Subtle Relevant Blue Container) */}
        {/* ========================================================================= */}
        <div
          className={`p-4 sm:p-6 md:p-7 rounded-3xl border-2 sm:border-[3px] transition-all duration-300 shadow-2xl space-y-6 ${
            isDark
              ? 'bg-gradient-to-b from-[#101824] via-[#0C131D] to-[#080E16] border-[#2B3990]'
              : 'bg-gradient-to-b from-[#D4E4F5] via-[#C7DBF0] to-[#BCCEE5] border-[#002452]'
          }`}
        >
          {/* ========================================================================= */}
          {/* 2. CATEGORY & STATE FILTER BAR (Panoramic MOIL Strata Hero Banner) */}
          {/* ========================================================================= */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition-all p-7 sm:p-9 md:p-10 lg:p-12 min-h-[290px] sm:min-h-[330px] md:min-h-[360px] flex flex-col justify-between gap-8 md:gap-12"
          >
            {/* Panoramic Mining Landscape Background Image - High Visibility */}
            <img
              src="/assets/filter_bar_mining_bg.jpg"
              alt="MOIL Mining Strata"
              className="absolute inset-0 w-full h-full object-cover object-[center_42%] opacity-90 select-none pointer-events-none transition-opacity duration-300 scale-100 hover:scale-[1.02] transition-transform duration-700"
            />

            {/* Subtle Contrast Gradient Overlay (Preserves panoramic visibility in center) */}
            <div
              className={`absolute inset-0 transition-colors ${
                isDark
                  ? 'bg-gradient-to-b from-[#07172B]/85 via-[#002452]/35 to-[#051120]/90'
                  : 'bg-gradient-to-b from-[#001D42]/80 via-[#002452]/30 to-[#001428]/85'
              }`}
            />

            {/* Top Row: Enterprise Header & Sector Status */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
              <div>
                <h3 className="font-headline text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Manganese Ore Mining Sectors & Digital Telemetry
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-white/90 border border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-sm text-emerald-400">sensors</span>
                  Central Telemetry Live
                </span>
              </div>
            </div>

            {/* Bottom Row: Category Filters (Left) & State Selector (Right) */}
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
              {/* Left Category Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90 mr-1 hidden md:inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#FEA619]">tune</span>
                  Filter by Type:
                </span>
                {[
                  { id: 'ALL MINES', count: totalCount },
                  { id: 'OPEN CAST', count: openCastCount },
                  { id: 'UNDERGROUND', count: undergroundCount },
                  { id: 'ACTIVE', count: activeCount },
                ].map(({ id, count }) => {
                  const isSelected = selectedFilter === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedFilter(id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-body transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-white text-[#002452] font-black shadow-lg border border-white ring-2 ring-[#FEA619]/40'
                          : 'bg-black/40 text-white hover:bg-black/60 hover:text-white border border-white/20 backdrop-blur-md font-semibold'
                      }`}
                    >
                      <span>{id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#002452]/15 text-[#002452]'
                            : 'bg-white/25 text-white'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right State Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 w-full lg:w-auto overflow-x-auto shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 shrink-0 text-[#FEA619]">
                  State:
                </span>
                {['ALL INDIA', 'MAHARASHTRA', 'MADHYA PRADESH'].map((stateName) => {
                  const isSelected = selectedState === stateName;
                  return (
                    <button
                      key={stateName}
                      onClick={() => setSelectedState(stateName)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all duration-200 shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#002452] font-black shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/15 font-medium'
                      }`}
                    >
                      {stateName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. MAIN TWO-COLUMN CONTENT LAYOUT */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Large Interactive Map of India (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-3">
              <div
                className={`flex items-center justify-between p-3 rounded-lg border flex-wrap gap-2 ${
                  isDark ? 'bg-[#242830] border-white/10' : 'bg-[#F1F5F9] border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <h2
                    className={`font-headline text-base font-extrabold uppercase tracking-wide flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-[#002452]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#D97706] text-xl">map</span>
                    Operational Footprint & Location Map
                  </h2>
                  <span className={`text-xs font-bold hidden sm:inline ${isDark ? 'text-[#CBD5E1]' : 'text-[#44474F]'}`}>
                    State Focus:{' '}
                    <strong className={isDark ? 'text-[#D97706]' : 'text-[#002452]'}>
                      {selectedState}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Interactive Leaflet Geospatial Map of India */}
              <div className="border border-white/10 rounded-lg overflow-hidden shadow-sm">
                <OperationalFootprintMap
                  selectedState={activeStateFilter}
                  selectedFilter={selectedFilter}
                  hoveredMineId={hoveredMineId}
                  onSelectMine={(geoMine) => {
                    const match = MOIL_MINES.find((m) => m.id === geoMine.id);
                    if (match) handleSelectMine(match);
                  }}
                  onHoverMine={(id) => setHoveredMineId(id)}
                  onSelectState={(st) => setSelectedState(st.toUpperCase())}
                  themeMode={themeMode}
                  onLaunchWorkspace={(mineId) => onNavigate(`workspace/${mineId}` as PortalRoute)}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Filtered Mines Directory Cards (5 Cols on desktop) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Directory Header Bar */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg border shadow-xs ${
                  isDark
                    ? 'bg-[#242830] border-[#002452] text-white'
                    : 'bg-[#002452] border-[#001D42] text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D97706] text-xl">domain</span>
                  <div>
                    <h2 className="font-headline text-base font-extrabold uppercase tracking-wide">
                      MOIL Mines
                    </h2>
                    <p className="text-[10px] text-white/70 font-medium">
                      Showing {displayedMines.length} of {MOIL_MINES.length} operational mine leases
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#D97706] text-[#181B20]">
                  {displayedMines.length} {displayedMines.length === 1 ? 'Mine' : 'Mines'}
                </span>
              </div>

              {/* Table Column Labels */}
              <div className="flex justify-between items-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider px-2 pt-1">
                <span>Mine / Location</span>
                <span>Workspace Action</span>
              </div>

              {/* List of Mines */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {displayedMines.length === 0 ? (
                  <div
                    className={`p-8 rounded-xl border text-center ${
                      isDark ? 'bg-[#242830] border-white/10' : 'bg-white border-[#CBD5E1]'
                    }`}
                  >
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-[#002452]'}`}>
                      No mines match the selected filters.
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Try selecting "All India" or another filter category.
                    </p>
                  </div>
                ) : (
                  displayedMines.map((mine) => {
                    const isPilot = mine.isImplemented;
                    const isHovered = hoveredMineId === mine.id;

                    return (
                      <div
                        key={mine.id}
                        onMouseEnter={() => setHoveredMineId(mine.id)}
                        onMouseLeave={() => setHoveredMineId(null)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? isDark
                              ? 'bg-[#2E2417] border-[#FEA619] shadow-md -translate-y-0.5'
                              : 'bg-[#FFFDF5] border-[#2B3990] shadow-md -translate-y-0.5'
                            : isDark
                            ? 'bg-[#241E15] border-[#2B3990] hover:border-[#FEA619]'
                            : 'bg-[#FEF9EE] border-[#2B3990] hover:border-[#FEA619]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isPilot ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                              <h3
                                className={`font-headline text-sm font-black uppercase tracking-wide truncate ${
                                  isDark ? 'text-white' : 'text-[#002452]'
                                }`}
                              >
                                {mine.name}
                              </h3>
                              {isPilot && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#D97706]/20 text-[#D97706] border border-[#D97706]/40">
                                  Pilot Workspace
                                </span>
                              )}
                            </div>

                            <p
                              className={`text-xs mt-1 flex items-center gap-1 font-medium ${
                                isDark ? 'text-[#CBD5E1]' : 'text-[#44474F]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm shrink-0 text-[#FEA619]">
                                location_on
                              </span>
                              <span>
                                {mine.district}, {mine.state}
                              </span>
                              <span className="mx-1 text-[#94A3B8]">•</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  isDark
                                    ? 'bg-[#2E333E] text-white/90'
                                    : 'bg-[#E2E8F0] text-[#002452]'
                                }`}
                              >
                                {mine.type}
                              </span>
                            </p>

                            <p
                              className={`text-[11px] mt-1.5 flex items-center gap-1 font-medium ${
                                isPilot
                                  ? isDark
                                    ? 'text-[#FEA619]'
                                    : 'text-[#D97706]'
                                  : isDark
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {isPilot
                                ? 'Active Telemetry Hub'
                                : 'Active Operational Lease'}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isPilot ? (
                              <button
                                onClick={() => handleSelectMine(mine)}
                                className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 bg-[#002452] hover:bg-[#2B3990] text-white shadow-sm border border-[#002452]"
                              >
                                <span>Open Workspace</span>
                                <span className="material-symbols-outlined text-sm">
                                  arrow_forward
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectMine(mine)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-not-allowed border flex items-center gap-1.5 ${
                                  isDark
                                    ? 'border-amber-500/25 bg-[#2B2317]/60 text-amber-300/60'
                                    : 'border-amber-200/80 bg-white/70 text-slate-500'
                                }`}
                                title="Telemetry integration pending for Phase II"
                              >
                                <span>Phase II Onboarding</span>
                                <span className="material-symbols-outlined text-xs">lock</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
