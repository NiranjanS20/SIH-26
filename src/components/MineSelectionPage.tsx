import React, { useState } from 'react';
import { MOIL_MINES, type MineItem } from '../data/minesData';
import { OperationalFootprintMap } from './OperationalFootprintMap';
import { type PortalRoute } from './Navbar';

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
    if (mine.isImplemented) {
      onNavigate('dongri-buzurg-workspace');
    } else {
      setToastMessage(
        `Digital Telemetry for ${mine.name} is currently under Phase II onboarding. Select Dongri Buzurg for active pilot telemetry.`
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
          className={`p-6 sm:p-8 rounded-2xl border transition-colors ${
            isDark
              ? 'bg-[#242830] border-white/10 shadow-xl'
              : 'border-[#E2E8F0] border-b pb-6 bg-transparent'
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

              {/* National Geospatial Reserve Mapping CTA Button */}
              <button
                onClick={() => onNavigate('reserve-mapping')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                title="Open Interactive Geospatial Reserve Mapping Map of India"
              >
                <span className="text-sm">🗺️</span>
                <span>National Reserve Mapping</span>
              </button>

              {/* Theme Toggle Button strictly for Mine Selection Page */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                    isDark
                      ? 'bg-[#2E333E] hover:bg-[#383E4B] text-white border-white/20'
                      : 'bg-white hover:bg-[#F1F5F9] text-[#002452] border-[#CBD5E1]'
                  }`}
                  title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                  <span className="material-symbols-outlined text-base text-[#D97706]">
                    {isDark ? 'dark_mode' : 'light_mode'}
                  </span>
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FILTER BAR */}
        {/* ========================================================================= */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 md:p-4 rounded-xl border shadow-md transition-colors ${
            isDark ? 'bg-[#242830] border-[#363B46]' : 'bg-[#F1F5F9] border-[#CBD5E1]'
          }`}
        >
          {/* Left Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-black uppercase tracking-wider mr-2 hidden md:inline-block ${
                isDark ? 'text-[#D97706]' : 'text-[#002452]'
              }`}
            >
              Filter by Type:
            </span>
            {['ALL MINES', 'OPEN CAST', 'UNDERGROUND', 'ACTIVE'].map((filter) => {
              const isSelected = selectedFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-xs font-body font-bold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#D97706] text-[#181B20] font-black shadow-md border border-[#D97706]'
                        : 'bg-[#002452] text-white shadow-md border border-[#002452]'
                      : isDark
                      ? 'bg-[#2E333E] text-white hover:bg-[#383E4B] border border-white/10'
                      : 'bg-white text-[#002452] hover:bg-[#002452] hover:text-white border border-[#CBD5E1]'
                  }`}
                >
                  {filter}
                  {filter === 'ALL MINES' && ` (${totalCount})`}
                  {filter === 'OPEN CAST' && ` (${openCastCount})`}
                  {filter === 'UNDERGROUND' && ` (${undergroundCount})`}
                  {filter === 'ACTIVE' && ` (${activeCount})`}
                </button>
              );
            })}
          </div>

          {/* Right State Selector */}
          <div
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border w-full sm:w-auto overflow-x-auto ${
              isDark ? 'bg-[#181B20] border-white/15' : 'bg-white border-[#CBD5E1]'
            }`}
          >
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2 shrink-0 ${
                isDark ? 'text-[#D97706]' : 'text-[#002452]'
              }`}
            >
              State:
            </span>
            {['ALL INDIA', 'MAHARASHTRA', 'MADHYA PRADESH'].map((stateName) => {
              const isSelected = selectedState === stateName;
              return (
                <button
                  key={stateName}
                  onClick={() => setSelectedState(stateName)}
                  className={`px-3 py-1.5 rounded-md text-xs font-body font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#D97706] text-[#181B20] font-black shadow-xs'
                        : 'bg-[#002452] text-white shadow-xs'
                      : isDark
                      ? 'text-white/80 hover:bg-white/10 hover:text-white'
                      : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#002452]'
                  }`}
                >
                  {stateName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN TWO-COLUMN CONTENT LAYOUT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Large Interactive Map of India (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-3">
            <div
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isDark ? 'bg-[#242830] border-white/10' : 'bg-[#F1F5F9] border-[#CBD5E1]'
              }`}
            >
              <h2
                className={`font-headline text-base font-extrabold uppercase tracking-wide flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#002452]'
                }`}
              >
                <span className="material-symbols-outlined text-[#D97706] text-xl">map</span>
                Operational Footprint & Location Map
              </h2>
              <span className={`text-xs font-bold ${isDark ? 'text-[#CBD5E1]' : 'text-[#44474F]'}`}>
                State Focus:{' '}
                <strong className={isDark ? 'text-[#D97706]' : 'text-[#002452]'}>
                  {selectedState}
                </strong>
              </span>
            </div>

            {/* Interactive Leaflet Geospatial Map of India */}
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
              onLaunchWorkspace={() => onNavigate('dongri-buzurg-workspace')}
            />
          </div>

          {/* RIGHT COLUMN: Formally Structured Mine List (5 Cols on desktop) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between bg-[#242830] text-white px-5 py-3.5 rounded-xl shadow-md border-b-4 border-[#D97706] border-t border-x border-white/10">
              <div>
                <h3 className="font-headline font-extrabold text-lg uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D97706] text-xl">domain</span>
                  MOIL MINES
                </h3>
                <p className="text-[11px] text-[#CBD5E1] font-medium">
                  Showing {displayedMines.length} of {totalCount} operational mine leases
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D97706] text-[#181B20] font-black text-xs tracking-wider shadow-xs">
                {totalCount} {totalCount === 1 ? 'MINE' : 'MINES'}
              </span>
            </div>

            {/* Structured Table Column Header Row */}
            <div
              className={`hidden sm:flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b ${
                isDark ? 'text-[#94A3B8] border-white/10' : 'text-[#64748B] border-[#CBD5E1]'
              }`}
            >
              <span>Mine / Location</span>
              <span>Workspace Action</span>
            </div>

            {/* Mine Entries Table/Structured List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {displayedMines.length === 0 ? (
                <div
                  className={`p-8 text-center rounded-xl border ${
                    isDark
                      ? 'bg-[#242830] border-white/10 text-[#CBD5E1]'
                      : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#334155]'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2 text-[#94A3B8]">
                    search_off
                  </span>
                  <p className="font-bold text-sm">No operational leases match current filters</p>
                  <button
                    onClick={() => {
                      setSelectedState('MAHARASHTRA');
                      setSelectedFilter('ALL MINES');
                    }}
                    className={`mt-3 text-xs font-black underline cursor-pointer ${
                      isDark ? 'text-[#D97706]' : 'text-[#002452]'
                    }`}
                  >
                    Reset Filters to Maharashtra
                  </button>
                </div>
              ) : (
                displayedMines.map((mine) => {
                  const isHovered = hoveredMineId === mine.id;
                  const isDongriBuzurg = mine.isImplemented;

                  return (
                    <div
                      key={mine.id}
                      onMouseEnter={() => setHoveredMineId(mine.id)}
                      onMouseLeave={() => setHoveredMineId(null)}
                      className={`p-4 rounded-xl transition-all duration-200 flex items-center justify-between gap-4 ${
                        isDongriBuzurg
                          ? isDark
                            ? isHovered
                              ? 'bg-gradient-to-r from-[#2C323D] via-[#242830] to-[#3B3327] border-l-4 border-l-[#D97706] border-t border-r border-b border-[#D97706] shadow-xl scale-[1.01]'
                              : 'bg-gradient-to-r from-[#282D37] via-[#242830] to-[#342D24] border-l-4 border-l-[#D97706] border-t border-r border-b border-[#D97706]/40 shadow-lg'
                            : isHovered
                            ? 'bg-gradient-to-r from-[#E6F0FA] via-[#F4F8FD] to-[#FFF8EA] border-l-4 border-l-[#D97706] border-t border-r border-b border-[#002452]/40 shadow-lg scale-[1.01]'
                            : 'bg-gradient-to-r from-[#EDF5FE] via-[#F6F9FD] to-[#FFFBF2] border-l-4 border-l-[#002452] border-t border-r border-b border-[#002452]/30 shadow-md'
                          : isDark
                          ? isHovered
                            ? 'bg-[#2E333E] border-white/20 shadow-md'
                            : 'bg-[#242830] border border-white/10 hover:border-white/20'
                          : isHovered
                          ? 'bg-[#EAEFF5] border-[#94A3B8] shadow-sm'
                          : 'bg-[#F1F5F9] border border-[#CBD5E1]'
                      }`}
                    >
                      {/* Left Mine Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isDongriBuzurg ? 'bg-[#D97706] animate-pulse' : 'bg-emerald-500'
                            }`}
                          ></span>
                          <h4
                            className={`font-headline font-extrabold text-base tracking-tight uppercase ${
                              isDark ? 'text-white' : 'text-[#002452]'
                            }`}
                          >
                            {mine.name}
                          </h4>
                          {isDongriBuzurg && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D97706] text-[#181B20] uppercase tracking-wider shadow-xs">
                              PILOT WORKSPACE
                            </span>
                          )}
                        </div>

                        {/* Location & Type */}
                        <div
                          className={`flex items-center gap-3 text-xs font-body ${
                            isDark ? 'text-[#CBD5E1]' : 'text-[#1E293B]'
                          }`}
                        >
                          <span className="flex items-center gap-1 font-semibold">
                            <span
                              className={`material-symbols-outlined text-sm ${
                                isDark ? 'text-[#D97706]' : 'text-[#002452]'
                              }`}
                            >
                              location_on
                            </span>
                            {mine.location}
                          </span>
                          <span className={isDark ? 'text-white/30' : 'text-[#94A3B8]'}>|</span>
                          <span
                            className={`font-extrabold px-2 py-0.5 rounded border ${
                              isDark
                                ? 'bg-[#2E333E] text-slate-200 border-white/10'
                                : 'bg-white text-[#002452] border-[#CBD5E1]'
                            }`}
                          >
                            {mine.type}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                              isDongriBuzurg
                                ? isDark
                                  ? 'bg-amber-950/60 text-[#D97706] border-[#D97706]/40'
                                  : 'bg-amber-50 text-[#002452] border-amber-200'
                                : isDark
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : 'bg-emerald-100/90 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDongriBuzurg ? 'bg-[#D97706]' : 'bg-emerald-500'
                              }`}
                            ></span>
                            <span>
                              {isDongriBuzurg
                                ? '● Active Telemetry Hub'
                                : '● Active Operational Lease'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="shrink-0">
                        {isDongriBuzurg ? (
                          <button
                            onClick={() => handleSelectMine(mine)}
                            className={`px-4 py-2.5 rounded-lg text-xs font-body font-extrabold uppercase tracking-wider transition-all shadow-md hover:shadow-xl flex items-center gap-1.5 cursor-pointer border group ${
                              isDark
                                ? 'bg-[#D97706] hover:bg-[#B45309] text-[#181B20] border-[#D97706]'
                                : 'bg-[#002452] hover:bg-[#1B3A6B] text-white border-[#D97706]/50'
                            }`}
                          >
                            <span>Open Workspace</span>
                            <span
                              className={`material-symbols-outlined text-sm transition-transform group-hover:translate-x-1 ${
                                isDark ? 'text-[#181B20]' : 'text-[#D97706]'
                              }`}
                            >
                              arrow_forward
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectMine(mine)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-body font-bold cursor-not-allowed border flex items-center gap-1 shadow-2xs ${
                              isDark
                                ? 'bg-white/10 text-white/70 border-white/15 hover:bg-white/15'
                                : 'bg-[#CBD5E1]/90 text-[#1E293B] border-[#94A3B8]/70'
                            }`}
                            title="Telemetry integration pending for Phase II"
                          >
                            <span>Phase II Onboarding</span>
                            <span className="material-symbols-outlined text-xs">lock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM OPERATIONAL NOTE */}
        {/* ========================================================================= */}
        <div
          className={`p-5 rounded-xl border shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
            isDark
              ? 'bg-[#242830] border-white/15 text-white'
              : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#1E293B]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#181B20] flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
              <span className="material-symbols-outlined text-[#D97706]">shield_with_house</span>
            </div>
            <div>
              <p
                className={`font-extrabold uppercase tracking-wider text-xs ${
                  isDark ? 'text-[#D97706]' : 'text-[#002452]'
                }`}
              >
                MOIL Enterprise Digital Network Architecture
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${
                  isDark ? 'text-[#CBD5E1]' : 'text-[#334155]'
                }`}
              >
                Dongri Buzurg manganese mine serves as the active pilot for real-time 3D seam
                telemetry and production dispatch models.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('dongri-buzurg-workspace')}
            className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider shrink-0 cursor-pointer shadow-sm flex items-center gap-2 border ${
              isDark
                ? 'bg-[#D97706] hover:bg-[#B45309] text-[#181B20] border-[#D97706]'
                : 'bg-[#002452] hover:bg-[#1B3A6B] text-white border-[#D97706]/40'
            }`}
          >
            <span>Enter Dongri Buzurg Workspace</span>
            <span
              className={`material-symbols-outlined text-sm ${
                isDark ? 'text-[#181B20]' : 'text-[#D97706]'
              }`}
            >
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
