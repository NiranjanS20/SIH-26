import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';

export interface ActivityEvent {
  id: string;
  day: string; // e.g. "12", "18", "25"
  month: string; // e.g. "June", "September", "Today"
  time: string; // e.g. "11:00", "09:14"
  title: string;
  location: string; // e.g. "Zone 14 • Pit Bench", "Main Beneficiation Plant"
  isLive?: boolean;
  details?: string;
  metrics?: {
    label: string;
    value: string;
  };
}

interface RecentActivityCardProps {
  themeMode?: 'dark' | 'light';
  onNavigateStream?: () => void;
  mineName?: string;
}

const DEFAULT_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    day: '12',
    month: 'September',
    time: '09:14',
    title: 'High-risk shortfall detected',
    location: 'Zone 14 • East Bench Pit',
    isLive: true,
    details: 'Shortfall probability raised to 78% based on real-time excavation and fleet cycle rate.',
    metrics: {
      label: 'Shortfall Risk',
      value: '78%',
    },
  },
  {
    id: 'act-2',
    day: '18',
    month: 'September',
    time: '08:42',
    title: 'Production forecast updated',
    location: 'Main Beneficiation Plant',
    isLive: false,
    details: 'Predicted monthly output adjusted by -4.2 kT due to primary crusher maintenance.',
    metrics: {
      label: 'Variance',
      value: '-4.2 kT',
    },
  },
  {
    id: 'act-3',
    day: '25',
    month: 'September',
    time: '16:30',
    title: 'Zone 09 moved to Medium Risk',
    location: 'North Incline Ramp 09',
    isLive: false,
    details: 'Precipitation inflow affecting bench road access; drainage pumps deployed.',
    metrics: {
      label: 'Sensor Inflow',
      value: '14.2 mm/hr',
    },
  },
];

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  themeMode = 'dark',
  onNavigateStream,
}) => {
  const isDark = themeMode === 'dark';
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  return (
    <>
      <div
        className={`p-6 sm:p-7 rounded-3xl border-[3px] transition-all duration-300 flex flex-col justify-between ${
          isDark
            ? 'bg-[#181B20] border-blue-500/60 shadow-xl text-white'
            : 'bg-white border-[#002452] shadow-md text-[#1B1B1C]'
        }`}
      >
        {/* 1. Header with Title on Left & Clean Blue Link on Right */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className={`font-headline font-bold text-lg sm:text-xl tracking-tight ${
              isDark ? 'text-white' : 'text-[#002452]'
            }`}
          >
            Recent Activity
          </h2>

          <button
            onClick={() => (onNavigateStream ? onNavigateStream() : setShowAllModal(true))}
            className={`group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-[#002452] hover:text-[#1B3A6B]'
            }`}
          >
            <span>Live Log Stream</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* 2. Structured Rows (Clean Cards matching reference composition) */}
        <div className="space-y-3.5 flex-1 flex flex-col justify-center">
          {DEFAULT_ACTIVITIES.map((event, idx) => {
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.06 }}
                whileHover={{ y: -1 }}
                onClick={() => setSelectedEvent(event)}
                className={`cursor-pointer rounded-2xl border-2 px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-200 flex items-center justify-between gap-4 ${
                  isDark
                    ? 'bg-[#1E232B] hover:bg-[#242A35] border-blue-500/30 hover:border-blue-400/60 shadow-md'
                    : 'bg-[#FFFFFF] hover:bg-slate-50/70 border-[#002452]/25 hover:border-[#002452]/60 shadow-[0_2px_10px_rgba(0,36,82,0.04)] hover:shadow-[0_4px_14px_rgba(0,36,82,0.08)]'
                }`}
              >
                {/* Left Date Block */}
                <div
                  className={`shrink-0 pr-4 sm:pr-5 border-r-2 flex flex-col items-center justify-center min-w-[62px] sm:min-w-[70px] ${
                    isDark ? 'border-blue-500/20' : 'border-[#002452]/20'
                  }`}
                >
                  <span
                    className={`font-headline font-bold text-2xl sm:text-3xl leading-none tracking-tight ${
                      isDark ? 'text-blue-400' : 'text-[#002452]'
                    }`}
                  >
                    {event.day}
                  </span>
                  <span
                    className={`text-[11px] sm:text-xs font-medium tracking-normal mt-1 leading-none ${
                      isDark ? 'text-blue-300/80' : 'text-[#002452]/80'
                    }`}
                  >
                    {event.month}
                  </span>
                </div>

                {/* Middle Content */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium block leading-none mb-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {event.time}
                  </span>

                  <h3
                    className={`font-headline font-bold text-sm sm:text-base leading-snug truncate ${
                      isDark ? 'text-white' : 'text-[#002452]'
                    }`}
                  >
                    {event.title}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm truncate mt-0.5 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {event.location}
                  </p>
                </div>

                {/* Right LIVE Badge */}
                <div className="shrink-0 flex items-center pl-2">
                  {event.isLive && (
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-red-600 tracking-wide">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                      <span>LIVE</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal for Selected Event */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full max-w-lg rounded-3xl border p-6 sm:p-7 shadow-2xl relative ${
                isDark
                  ? 'bg-[#181B20] border-white/10 text-white'
                  : 'bg-white border-slate-200 text-[#1B1B1C]'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className={`absolute top-5 right-5 p-1.5 rounded-full transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Content */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`px-3 py-2 rounded-xl flex flex-col items-center justify-center border ${
                    isDark
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : 'bg-blue-50 border-blue-100 text-[#002452]'
                  }`}
                >
                  <span className="font-headline font-bold text-xl sm:text-2xl leading-none">
                    {selectedEvent.day}
                  </span>
                  <span className="text-[10px] font-medium leading-none mt-1">
                    {selectedEvent.month}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{selectedEvent.time}</span>
                    {selectedEvent.isLive && (
                      <span className="text-xs font-bold text-red-600">((•)) LIVE</span>
                    )}
                  </div>
                  <h3
                    className={`font-headline font-bold text-base sm:text-lg mt-0.5 ${
                      isDark ? 'text-white' : 'text-[#002452]'
                    }`}
                  >
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">{selectedEvent.location}</p>
                </div>
              </div>

              {selectedEvent.details && (
                <div
                  className={`p-4 rounded-2xl border text-sm mb-5 ${
                    isDark
                      ? 'bg-[#1E232B] border-white/5 text-slate-300'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <p className="leading-relaxed">{selectedEvent.details}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit/10">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    if (onNavigateStream) onNavigateStream();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-[#002452] hover:bg-[#1B3A6B] text-white'
                  }`}
                >
                  <span>Open Workspace Stream</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stream Drawer / Modal */}
      <AnimatePresence>
        {showAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full max-w-xl rounded-3xl border p-6 sm:p-7 shadow-2xl relative max-h-[85vh] flex flex-col ${
                isDark
                  ? 'bg-[#181B20] border-white/10 text-white'
                  : 'bg-white border-slate-200 text-[#1B1B1C]'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-inherit/10">
                <h2
                  className={`font-headline font-bold text-lg ${
                    isDark ? 'text-white' : 'text-[#002452]'
                  }`}
                >
                  Live Log Stream
                </h2>
                <button
                  onClick={() => setShowAllModal(false)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-400'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {DEFAULT_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      setShowAllModal(false);
                      setSelectedEvent(act);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isDark
                        ? 'bg-[#1E232B] hover:bg-[#242A35] border-white/5'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-headline font-bold text-sm shrink-0 ${
                          isDark
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-blue-50 text-[#002452]'
                        }`}
                      >
                        <span>{act.day}</span>
                        <span className="text-[9px] font-medium leading-none">{act.month.slice(0, 3)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{act.time}</span>
                        <h4
                          className={`font-bold text-sm ${
                            isDark ? 'text-white' : 'text-[#002452]'
                          }`}
                        >
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-500">{act.location}</p>
                      </div>
                    </div>
                    {act.isLive && (
                      <span className="text-xs font-bold text-red-600">((•)) LIVE</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-inherit/10 flex justify-end">
                <button
                  onClick={() => setShowAllModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-[#002452] text-white hover:bg-[#1B3A6B]'
                  }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
