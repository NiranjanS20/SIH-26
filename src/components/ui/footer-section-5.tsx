const companyName = "MOIL DIGITAL MINE";

const MOILLogo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-[#D97706] text-[#181B20] flex items-center justify-center font-black text-xl shadow-md tracking-tighter">
        M
      </div>
      <div>
        <span className="font-headline font-extrabold text-white text-lg tracking-wide uppercase block leading-none">
          MOIL PORTAL
        </span>
        <span className="font-body text-[10px] text-[#D97706] tracking-[0.2em] uppercase font-bold block mt-1">
          Digital Mine Intelligence
        </span>
      </div>
    </div>
  );
};

const footerLinks = [
  {
    title: "Portal Services",
    links: [
      { name: "Mine Overview", href: "#services" },
      { name: "Production Intelligence", href: "#services" },
      { name: "Mine Intelligence", href: "#services" },
      { name: "Decision Support", href: "#services" },
      { name: "Executive Reports", href: "#services" },
    ],
  },
  {
    title: "Data Layers",
    links: [
      { name: "Geological Data", href: "#value-prop" },
      { name: "Production Data", href: "#value-prop" },
      { name: "Operational Data", href: "#value-prop" },
      { name: "Space & Environment", href: "#value-prop" },
      { name: "Pit Telemetry", href: "#mines" },
    ],
  },
  {
    title: "Company & Compliance",
    links: [
      { name: "About MOIL", href: "#" },
      { name: "Dongri Buzurg Mine", href: "#mines" },
      { name: "DGMS Compliance", href: "#solving" },
      { name: "Security Architecture", href: "#" },
      { name: "Contact Support", href: "#" },
    ],
  },
];

interface FooterSection5Props {
  themeMode?: 'dark' | 'light';
}

export default function FooterSection5({ themeMode = 'dark' }: FooterSection5Props) {
  const isDark = themeMode === 'dark';

  return (
    <footer
      className={`w-full relative overflow-hidden antialiased transition-colors ${
        isDark ? 'bg-[#181B20] border-t border-white/10' : 'bg-[#FCF9F8] border-t border-[#C4C6D0]/40'
      }`}
    >
      {/* Large Stroke Text Section */}
      <div className="relative w-full flex justify-center items-end pt-16 md:pt-24 pb-0 z-0 overflow-hidden">
        <h1
          className={`text-[60px] sm:text-[100px] md:text-[140px] lg:text-[170px] font-display font-black leading-[0.75] select-none -mb-3 md:-mb-6 opacity-90 tracking-tighter uppercase text-center whitespace-nowrap drop-shadow-2xs ${
            isDark
              ? 'bg-gradient-to-b from-[#D97706]/35 via-[#CBD5E1]/20 to-white/5 bg-clip-text text-transparent [-webkit-text-stroke:1px_rgba(217,119,6,0.4)]'
              : 'bg-gradient-to-b from-[#002452]/10 via-[#1B3A6B]/15 to-[#D4A359]/20 bg-clip-text text-transparent [-webkit-text-stroke:1.2px_rgba(0,36,82,0.18)]'
          }`}
        >
          {companyName}
        </h1>
      </div>

      {/* Deep MOIL Panel Section with Muted Gold Top Border */}
      <div
        className={`relative w-full z-10 min-h-[380px] border-t-4 border-[#D97706] transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#14171C] via-[#181B20] to-[#0F1115]'
            : 'bg-gradient-to-b from-[#001636] via-[#002452] to-[#00122B]'
        }`}
      >
        {/* Subtle Background Pattern Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-20 flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          {/* Left Side */}
          <div className="flex flex-col justify-between max-w-md w-full">
            <div className="flex flex-col space-y-4">
              <MOILLogo />
              <p className="text-white/80 font-body text-xs sm:text-sm leading-relaxed max-w-sm">
                Heritage in Mining, Digital in Precision. Unified spatial, geological, and operational intelligence platform for MOIL manganese mines.
              </p>
            </div>

            {/* Copyright & Live Status Indicator */}
            <div className="flex flex-col gap-2 mt-10 lg:mt-auto pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-body text-[11px] font-bold text-white/90 uppercase tracking-wider">
                  Operational Systems Online
                </span>
              </div>
              <p className="font-body text-xs text-white/60">
                © 2026 MOIL Digital Mine Portal. All rights reserved.
              </p>
            </div>
          </div>

          {/* Right Side - Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="text-[#D97706] font-headline font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith('#')) {
                            e.preventDefault();
                            const target = document.querySelector(link.href);
                            if (target) {
                              target.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                        className="text-white/70 hover:text-white transition-colors text-xs md:text-sm font-body font-medium inline-flex items-center gap-1.5 group cursor-pointer"
                      >
                        <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-[#D97706] transition-colors" />
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
