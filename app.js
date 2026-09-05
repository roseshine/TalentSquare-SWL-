const { useState, useEffect, useMemo, useRef } = React;

// SVG Icon set for instant, rock-solid rendering without external dependency delay
const SVG_ICONS = {
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v2h10v-2h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path></svg>`,
  graduationcap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"></path></svg>`,
  code2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M12 3v18"></path></svg>`,
  globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  bot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="18" height="12" x="3" y="6" rx="2"></rect><circle cx="9" cy="12" r="1"></circle><circle cx="15" cy="12" r="1"></circle><path d="M12 2v4"></path><path d="M2 14h1"></path><path d="M21 14h1"></path><path d="M15 18v2"></path><path d="M9 18v2"></path></svg>`,
  smartphone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>`,
  shieldalert: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  coins: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="8" cy="8" r="6"></circle><path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path><path d="M7 6h1v4"></path><path d="m16.71 13.88.7.71-2.82 2.82"></path></svg>`,
  userplus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
  pluscircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
  arrowright: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  checkcircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  checkcircle2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
  terminal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  mappin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>`,
  layoutgrid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`,
  chevronright: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  usercheck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>`,
  radio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
  facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`
};

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
  const normalizedKey = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const svgHtml = SVG_ICONS[normalizedKey];

  if (svgHtml) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        {...props}
      />
    );
  }

  // Fallback generic icon
  return (
    <span className={`inline-flex items-center justify-center shrink-0 text-cyan-400 ${className}`} {...props}>
      ●
    </span>
  );
};

// Countdown Timer Component with live ticking
const CountdownTimer = ({ targetDate, initialDays }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: initialDays || 12,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!targetDate) return;
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5 font-mono-code text-xs">
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded px-1.5 py-1 text-cyan-300 font-bold">
        {String(timeLeft.days).padStart(2, '0')}d
      </div>
      <span className="text-cyan-500/50">:</span>
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded px-1.5 py-1 text-cyan-300 font-bold">
        {String(timeLeft.hours).padStart(2, '0')}h
      </div>
      <span className="text-cyan-500/50">:</span>
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded px-1.5 py-1 text-cyan-300 font-bold">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </div>
      <span className="text-cyan-500/50">:</span>
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded px-1.5 py-1 text-cyan-300 font-bold text-amber-400">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ onOpenAuth, onOpenSubmit, onOpenSearch, onNavigateSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "Competitions", href: "#competitions" },
    { label: "Categories", href: "#categories" },
    { label: "Universities", href: "#universities" },
    { label: "Leaderboard", href: "#hero" },
    { label: "Resources", href: "#competitions" }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3" 
        : "bg-[#07090e]/60 backdrop-blur-sm py-4 border-b border-white/5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo with Bangladesh-inspired motif */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigateSection('hero')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full blur-[1px] opacity-80"></div>
                <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-emerald-500/50 rounded-full blur-[2px]"></div>
                <span className="font-mono-code font-extrabold text-cyan-400 text-lg">&lt;/&gt;</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-2xl tracking-tight text-white">
                  Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">BD</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                  BD 🇧🇩
                </span>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold -mt-1 hidden sm:block">
                National CSE Contest Hub
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateSection(item.href.replace('#', ''));
                }}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 text-xs transition-all"
              title="Quick search competitions (Ctrl+K)"
            >
              <Icon name="Search" className="w-3.5 h-3.5" />
              <span>Search contests...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-code text-slate-400 border border-slate-700">⌘K</kbd>
            </button>

            <button
              onClick={onOpenSubmit}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 text-xs font-semibold hover:border-slate-600 transition-all flex items-center gap-1.5"
            >
              <Icon name="PlusCircle" className="w-3.5 h-3.5 text-cyan-400" />
              <span>Host Contest</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-1.5 transition-colors"
            >
              Login
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="relative group overflow-hidden px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon name="UserPlus" className="w-3.5 h-3.5" />
                <span>Register</span>
              </span>
            </button>
          </div>

          {/* Mobile Menu & Search Icon */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
            >
              <Icon name="Search" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 mt-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  onNavigateSection(item.href.replace('#', ''));
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold text-center"
            >
              Login
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold text-center"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section Component
const Hero = ({ onExplore, onSubmitContest, onSelectContest }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('code');

  const copySnippet = () => {
    navigator.clipboard.writeText(window.CODEBD_DATA.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Bangladesh Flag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bd-accent-pill backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-semibold shadow-inner animate-pulse-glow">
              <span className="text-base">🇧🇩</span>
              <span>Bangladesh's Competitive Programming Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              Every Coding Competition.{" "}
              <span className="gradient-text-hero block sm:inline">
                One Place.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover programming contests, hackathons, ICPC events, university competitions, and CSE challenges happening across Bangladesh.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExplore}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Competitions</span>
                <Icon name="ArrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onSubmitContest}
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 hover:border-slate-500 font-semibold text-sm sm:text-base transition-all flex items-center gap-2 group shadow-lg cursor-pointer"
              >
                <Icon name="PlusCircle" className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
                <span>Submit a Competition</span>
              </button>
            </div>

            {/* Quick Trending Tags */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mr-1">Trending:</span>
              {["#BUET_IUPC", "#ICPC_Dhaka_Regional", "#DU_Hackathon", "#SUST_Battle", "#KUET_CP"].map((tag, i) => (
                <span
                  key={i}
                  onClick={onExplore}
                  className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 cursor-pointer transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

          {/* Right Column: Interactive Tech CP Dashboard */}
          <div className="lg:col-span-5 relative">
            
            <div className="relative rounded-2xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/50 to-indigo-500/30 shadow-2xl glow-box-blue">
              <div className="bg-[#0b101d] rounded-[15px] p-5 border border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="ml-2 font-mono-code text-xs text-slate-400 flex items-center gap-1.5">
                      <Icon name="Terminal" className="w-3.5 h-3.5 text-cyan-400" />
                      icpc_dhaka_arena.cpp
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        activeTab === 'code' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      IDE
                    </button>
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        activeTab === 'leaderboard' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Rank
                    </button>
                  </div>
                </div>

                {/* Upcoming Next Major Contest Countdown Banner */}
                <div className="my-4 p-3 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                      <Icon name="Trophy" className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>BUET IUPC 2026</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/30">Open</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Dhaka • Preliminary Round</div>
                    </div>
                  </div>
                  <CountdownTimer targetDate="2026-09-20T09:00:00" initialDays={16} />
                </div>

                {/* Main Content: IDE or Leaderboard */}
                {activeTab === 'code' ? (
                  <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-mono-code text-cyan-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Fast I/O BD CP Template
                      </span>
                      <button
                        onClick={copySnippet}
                        className="text-[10px] font-mono-code flex items-center gap-1 text-slate-400 hover:text-cyan-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Icon name={copiedCode ? "Check" : "Copy"} className="w-3 h-3 text-cyan-400" />
                        {copiedCode ? "Copied!" : "Copy Code"}
                      </button>
                    </div>

                    <pre className="bg-[#060911] p-3.5 rounded-xl border border-slate-800/90 text-xs font-mono-code text-slate-300 overflow-x-auto leading-relaxed shadow-inner">
                      <code>{`// BUET / ICPC Dhaka Warmup
#include <bits/stdc++.h>
using namespace std;

void solve() {
    int n; cin >> n;
    // Fast BD Contest Logic
    cout << "AC: 🇧🇩 Rank #1\\n";
}

int main() {
    ios_base::sync_with_stdio(0);
    solve();
}`}</code>
                    </pre>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Icon name="CheckCircle2" className="w-3.5 h-3.5 text-emerald-400" />
                        Compiler: GCC 14.2 (C++20)
                      </span>
                      <span className="text-emerald-400 font-mono-code font-bold">Passed 14/14 Tests (0.012s)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span>National Collegiate Standings</span>
                      <span className="text-[10px] text-cyan-400 font-mono-code">Live Sync</span>
                    </div>
                    {window.CODEBD_DATA.leaderboardSnippet.map((item) => (
                      <div
                        key={item.rank}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/90 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            item.rank === 1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' :
                            item.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                            'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          }`}>
                            {item.rank}
                          </span>
                          <div>
                            <div className="font-bold text-white text-xs">{item.team}</div>
                            <div className="text-[10px] text-slate-400">{item.uni}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-mono-code font-bold">{item.solved}</div>
                          <div className="text-[10px] text-slate-500">{item.penalty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bangladesh Tech Ecosystem Map Nodes */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>Hubs: <strong>Dhaka • Sylhet • Khulna • Rajshahi • CTG</strong></span>
                  </div>
                  <span className="font-mono-code text-cyan-400">45+ Universities</span>
                </div>

              </div>
            </div>

            {/* Floating UI Badges */}
            <div className="absolute -top-4 -right-4 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2 animate-float">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Icon name="CheckCircle" className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Accepted (AC)</div>
                <div className="text-[10px] text-emerald-400 font-mono-code">100% Correct Solution</div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 bg-slate-900/95 border border-purple-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Icon name="Coins" className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">৳2,00,000 Total Prizes</div>
                <div className="text-[10px] text-slate-400">Autumn 2026 Season</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

// Quick Statistics Component
const QuickStatistics = () => {
  return (
    <section className="relative -mt-6 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800/90">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
          {window.CODEBD_DATA.stats.map((stat, index) => (
            <div key={index} className={`flex flex-col items-center text-center group ${index !== 0 ? 'sm:pl-6 pt-4 sm:pt-0' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 group-hover:border-cyan-400/50 transition-all shadow-inner">
                <Icon name={stat.icon} className="w-6 h-6" />
              </div>
              <div className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Upcoming Competitions Section
const UpcomingCompetitions = ({ onSelectContest, onBookmarkToggle, bookmarks }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const competitions = window.CODEBD_DATA.upcomingCompetitions;

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeCategory === 'all') return matchSearch;
      if (activeCategory === 'icpc') return matchSearch && (item.category === 'ICPC' || item.tags.includes('ICPC Style'));
      if (activeCategory === 'hackathon') return matchSearch && item.type.toLowerCase().includes('hackathon');
      if (activeCategory === 'cp') return matchSearch && (item.type.toLowerCase().includes('programming') || item.type.toLowerCase().includes('competitive'));
      return matchSearch;
    });
  }, [competitions, activeCategory, searchTerm]);

  return (
    <section id="competitions" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Icon name="Calendar" className="w-3.5 h-3.5" />
              <span>National Contest Calendar</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Upcoming Competitions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Don't miss your next challenge. Register before deadlines close.
            </p>
          </div>

          {/* Quick Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by university, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-64 transition-all"
              />
              <Icon name="Search" className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs">
                  ✕
                </button>
              )}
            </div>

            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'all', label: 'All Contests' },
                { id: 'icpc', label: 'ICPC / IUPC' },
                { id: 'hackathon', label: 'Hackathons' },
                { id: 'cp', label: 'Speed CP' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeCategory === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Competition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompetitions.map((contest) => {
            const isBookmarked = bookmarks && bookmarks.includes(contest.id);
            const isClosingSoon = contest.status === "Closing Soon";

            return (
              <div
                key={contest.id}
                className="glass-card rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  contest.university === 'BUET' ? 'from-red-500 via-amber-500 to-blue-500' :
                  contest.university === 'KUET' ? 'from-teal-400 to-cyan-500' :
                  contest.university === 'DU' ? 'from-blue-500 to-indigo-600' :
                  'from-purple-500 to-pink-500'
                }`}></div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-base shadow-lg ${
                        contest.university === 'BUET' ? 'bg-red-950/80 text-red-300 border border-red-500/40' :
                        contest.university === 'KUET' ? 'bg-teal-950/80 text-teal-300 border border-teal-500/40' :
                        contest.university === 'DU' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40' :
                        'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                      }`}>
                        {contest.university}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <span>{contest.organizer}</span>
                        </div>
                        <span className="text-[11px] font-mono-code text-cyan-400 font-medium">
                          {contest.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                        isClosingSoon
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-500/20 shadow-sm'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20 shadow-sm'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isClosingSoon ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`}></span>
                        {contest.status}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookmarkToggle(contest.id);
                        }}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          isBookmarked 
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title={isBookmarked ? "Remove Bookmark" : "Save Competition"}
                      >
                        <Icon name="Bookmark" className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectContest(contest)}
                    className="font-heading font-extrabold text-xl text-white group-hover:text-cyan-300 transition-colors cursor-pointer mb-2 leading-snug"
                  >
                    {contest.title}
                  </h3>

                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {contest.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <Icon name="Calendar" className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Date</span>
                        <span className="font-semibold text-slate-200">{contest.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <Icon name="MapPin" className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Location</span>
                        <span className="font-semibold text-slate-200">{contest.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <Icon name="Trophy" className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Prize Pool</span>
                        <span className="font-semibold text-amber-300 font-mono-code">{contest.prizePool}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <Icon name="Users" className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-500 block">Team Format</span>
                        <span className="font-semibold text-slate-200">{contest.teamSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {contest.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 text-[11px] font-mono-code text-slate-300 border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Icon name="Clock" className="w-3.5 h-3.5 text-cyan-400" />
                      Countdown:
                    </span>
                    <CountdownTimer targetDate={contest.targetDate} initialDays={contest.daysLeft} />
                  </div>

                  <button
                    onClick={() => onSelectContest(contest)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                  >
                    <span>View Details</span>
                    <Icon name="ArrowRight" className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

// Browse By Category Component
const BrowseByCategory = ({ onSelectCategory }) => {
  const categories = window.CODEBD_DATA.categories;

  return (
    <section id="categories" className="py-20 relative bg-gradient-to-b from-transparent via-slate-950/60 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Icon name="LayoutGrid" className="w-3.5 h-3.5" />
            <span>Discover Domains</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
            What Are You Looking For?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Explore diverse arenas from algorithmic battles to product hackathons and cybersecurity CTFs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="glass-card rounded-2xl p-5 cursor-pointer relative group overflow-hidden transition-all duration-300"
            >
              <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${cat.gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>

              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${cat.accent} shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon name={cat.icon} className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono-code font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-800 group-hover:border-slate-700">
                  {cat.count}
                </span>
              </div>

              <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors mb-1">
                {cat.name}
              </h3>
              
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                {cat.description}
              </p>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Explore contests</span>
                <Icon name="ChevronRight" className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// Featured Competition Section
const FeaturedCompetition = ({ onRegister, onSelectContest }) => {
  const featured = window.CODEBD_DATA.featuredCompetition;

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl p-1 bg-gradient-to-r from-amber-500/40 via-cyan-500/40 to-purple-600/40 shadow-2xl glow-box-purple shimmer-border">
          <div className="bg-[#080d19] rounded-[22px] p-6 sm:p-10 border border-slate-800/80 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
                    <Icon name="Flame" className="w-3.5 h-3.5 text-amber-400" />
                    {featured.statusBadge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                    {featured.format}
                  </span>
                </div>

                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  {featured.title}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {featured.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {featured.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium text-slate-200">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        ✓
                      </div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Icon name="Coins" className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Prize Pool</div>
                      <div className="font-heading font-black text-xl text-amber-300 font-mono-code">{featured.prizePool}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Icon name="Users" className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected Teams</div>
                      <div className="font-heading font-black text-xl text-cyan-300">{featured.participants}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Icon name="UserCheck" className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Team Size</div>
                      <div className="font-heading font-black text-lg text-purple-300">{featured.teamSize}</div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="lg:col-span-5 bg-[#0d1424] rounded-2xl p-6 border border-slate-700/80 shadow-2xl space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-mono-code text-cyan-400 uppercase tracking-wider font-bold">
                    Official Contest Countdown
                  </span>
                  <h4 className="text-white font-heading font-bold text-lg">
                    Registration Deadline Approaching
                  </h4>
                </div>

                <div className="p-4 rounded-xl bg-[#060911] border border-cyan-500/30 shadow-inner flex justify-center">
                  <CountdownTimer targetDate={featured.targetDate} initialDays={45} />
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Key Milestones</div>
                  {featured.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="font-bold text-slate-300">{item.event}</span>
                      <span className="font-mono-code text-cyan-400 font-semibold">{item.date}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onRegister(featured)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Icon name="Zap" className="w-4 h-4" />
                    <span>Register for National Championship</span>
                  </button>

                  <button
                    onClick={() => onSelectContest(featured)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all text-center cursor-pointer"
                  >
                    View Official Rulebook & Syllabus
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

// Browse By University Section
const BrowseByUniversity = ({ onSelectUni }) => {
  const universities = window.CODEBD_DATA.universities;

  return (
    <section id="universities" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Icon name="GraduationCap" className="w-3.5 h-3.5" />
              <span>Campus Ecosystem</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Browse By University
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Explore contests organized by leading engineering and tech departments across Bangladesh.
            </p>
          </div>

          <button
            onClick={() => onSelectUni({ short: "All", fullName: "All Bangladeshi Universities" })}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs sm:text-sm flex items-center gap-1 group cursor-pointer"
          >
            <span>View All Universities (45+)</span>
            <Icon name="ArrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {universities.map((uni) => (
            <div
              key={uni.id}
              onClick={() => onSelectUni(uni)}
              className="glass-card rounded-2xl p-4 text-center cursor-pointer group flex flex-col items-center justify-between h-44 hover:border-cyan-500/50"
            >
              <div className="w-full flex justify-between items-center text-[10px] text-slate-500">
                <span>{uni.city}</span>
                <span className="text-cyan-400 font-mono-code font-bold">{uni.contestsCount} Contests</span>
              </div>

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${uni.color} p-0.5 shadow-lg group-hover:scale-110 transition-transform my-auto`}>
                <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center font-heading font-black text-lg text-white">
                  {uni.short}
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  {uni.short}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {uni.fullName}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// Call To Action (Host/Submit a Competition)
const CtaSection = ({ onSubmitContest }) => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-slate-900/40 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-panel rounded-3xl p-8 sm:p-14 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 bg-dots-pattern opacity-30 pointer-events-none"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Icon name="Radio" className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>For University Clubs & Tech Organizers</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Organizing a Coding Competition?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Reach thousands of CSE students across Bangladesh by listing your competition on CodeBD. Get maximum participation, automated reminders, and instant national visibility.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-300 pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Icon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                100% Free Listing
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                Reach 45+ Universities
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="CheckCircle2" className="w-4 h-4 text-emerald-400" />
                Toph / VJudge / Codeforces Sync
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={onSubmitContest}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Icon name="Send" className="w-4 h-4" />
                <span>Submit Your Competition</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = ({ onNavigateSection, onOpenSubmit, onOpenAuth, onShowToast }) => {
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      onShowToast("Subscribed! You'll receive Bangladesh contest alerts.");
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-[#05070c] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5">
                <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center font-mono-code font-bold text-cyan-400 text-sm">
                  &lt;/&gt;
                </div>
              </div>
              <span className="font-heading font-black text-2xl text-white">
                Code<span className="text-cyan-400">BD</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CodeBD is a centralized platform for discovering coding competitions and programming events across Bangladesh.
            </p>

            <div className="pt-2">
              <span className="text-[11px] text-slate-500 block mb-2 font-semibold uppercase tracking-wider">
                Get Weekly Contest Alerts
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="your.email@buet.ac.bd"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#competitions" onClick={(e) => { e.preventDefault(); onNavigateSection('competitions'); }} className="hover:text-cyan-400 transition-colors">Competitions</a></li>
              <li><a href="#universities" onClick={(e) => { e.preventDefault(); onNavigateSection('universities'); }} className="hover:text-cyan-400 transition-colors">Universities</a></li>
              <li><a href="#categories" onClick={(e) => { e.preventDefault(); onNavigateSection('categories'); }} className="hover:text-cyan-400 transition-colors">Categories</a></li>
              <li><a href="#hero" onClick={(e) => { e.preventDefault(); onNavigateSection('hero'); }} className="hover:text-cyan-400 transition-colors">National Leaderboard</a></li>
              <li><a href="#competitions" onClick={(e) => { e.preventDefault(); onNavigateSection('competitions'); }} className="hover:text-cyan-400 transition-colors">CP Resources</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">For Students</h4>
            <ul className="space-y-2">
              <li><a href="#competitions" onClick={(e) => { e.preventDefault(); onNavigateSection('competitions'); }} className="hover:text-cyan-400 transition-colors">Find Competitions</a></li>
              <li><a href="#competitions" onClick={(e) => { e.preventDefault(); onNavigateSection('competitions'); }} className="hover:text-cyan-400 transition-colors">Track Contests</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenAuth('register'); }} className="hover:text-cyan-400 transition-colors">Build Your Profile</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onShowToast("ICPC Syllabus 2026 coming soon!"); }} className="hover:text-cyan-400 transition-colors">ICPC Preparation Guide</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onShowToast("Practice Arena in Beta."); }} className="hover:text-cyan-400 transition-colors">Practice Virtual Contests</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">For Organizers</h4>
            <ul className="space-y-2">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenSubmit(); }} className="hover:text-cyan-400 transition-colors font-semibold text-cyan-300">Submit Competition</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenSubmit(); }} className="hover:text-cyan-400 transition-colors">Promote Event</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onShowToast("Partner with CodeBD: partner@codebd.org"); }} className="hover:text-cyan-400 transition-colors">Sponsorships</a></li>
            </ul>

            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider pt-2">Contact</h4>
            <div className="flex gap-3 text-slate-400">
              <a href="mailto:hello@codebd.org" className="hover:text-cyan-400" title="Email"><Icon name="Mail" className="w-4 h-4" /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400" title="Facebook"><Icon name="Facebook" className="w-4 h-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400" title="LinkedIn"><Icon name="Linkedin" className="w-4 h-4" /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400" title="GitHub"><Icon name="Github" className="w-4 h-4" /></a>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 CodeBD. All rights reserved. Built with ❤️ for Bangladesh's CSE community.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <span>•</span>
            <span className="text-emerald-400 font-mono-code font-bold">Server: Dhaka (BD-IX)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Competition Details Modal
const CompetitionModal = ({ contest, onClose, onRegister, onBookmarkToggle, isBookmarked }) => {
  if (!contest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b111e] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
        >
          <Icon name="X" className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-heading font-black text-xl flex items-center justify-center shrink-0">
            {contest.university || "BD"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {contest.status || "Open"}
              </span>
              <span className="text-xs text-slate-400">{contest.organizer}</span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-white mt-1">
              {contest.title}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Date</span>
            <span className="font-bold text-white">{contest.date}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Prize Pool</span>
            <span className="font-bold text-amber-300 font-mono-code">{contest.prizePool}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Team Size</span>
            <span className="font-bold text-cyan-300">{contest.teamSize}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Format</span>
            <span className="font-bold text-purple-300">{contest.type}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <div>
            <h4 className="font-bold text-sm text-white mb-1">About the Contest</h4>
            <p>{contest.description}</p>
          </div>

          {contest.eligibility && (
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <h4 className="font-bold text-white mb-1">Eligibility</h4>
              <p className="text-slate-400">{contest.eligibility}</p>
            </div>
          )}

          {contest.platform && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Contest Platform:</span>
              <span className="font-mono-code text-cyan-400 font-semibold">{contest.platform}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => onBookmarkToggle(contest.id)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="Bookmark" className={`w-4 h-4 ${isBookmarked ? 'fill-cyan-400 text-cyan-400' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onRegister(contest);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
          >
            Register Now
          </button>
        </div>

      </div>
    </div>
  );
};

// Submit Competition Modal
const SubmitModal = ({ onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    university: 'BUET',
    type: 'Programming Contest',
    date: '',
    location: '',
    prizePool: '৳50,000',
    contactEmail: '',
    link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSuccess(formData.title || 'New Competition');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b111e] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
        >
          <Icon name="X" className="w-4 h-4" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Icon name="PlusCircle" className="w-3.5 h-3.5" />
            <span>Organizer Portal</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-white">
            List Your Competition
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Post your university or community contest to reach 10,000+ Bangladeshi CSE students.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Competition Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. RUET IUPC 2026 / CSE National Hackathon"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Organizer / Club *</label>
              <input
                type="text"
                required
                placeholder="e.g. BUET Computer Club"
                value={formData.organizer}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">University / Host *</label>
              <select
                value={formData.university}
                onChange={e => setFormData({ ...formData, university: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="BUET">BUET</option>
                <option value="DU">University of Dhaka</option>
                <option value="KUET">KUET</option>
                <option value="SUST">SUST</option>
                <option value="RUET">RUET</option>
                <option value="CUET">CUET</option>
                <option value="IUT">IUT</option>
                <option value="NSU">North South University</option>
                <option value="BRACU">BRAC University</option>
                <option value="Other">Other / Tech Community</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Competition Type *</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Programming Contest">Programming Contest (ICPC/IUPC)</option>
                <option value="Online Contest">Online Speed Contest</option>
                <option value="Hackathon">Hackathon</option>
                <option value="AI Challenge">AI / Machine Learning</option>
                <option value="CTF / Cyber">Cybersecurity CTF</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Contest *</label>
              <input
                type="text"
                required
                placeholder="e.g. October 15, 2026"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location / Venue *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dhaka (Onsite) or Online"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prize Pool (৳)</label>
              <input
                type="text"
                placeholder="e.g. ৳1,00,000"
                value={formData.prizePool}
                onChange={e => setFormData({ ...formData, prizePool: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Registration Link or Website</label>
            <input
              type="url"
              placeholder="https://contest.your-university.edu.bd"
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Auth Modal (Login / Register)
const AuthModal = ({ mode = 'login', onClose, onAuthSuccess }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    onAuthSuccess(currentMode === 'login' ? 'Logged in successfully!' : 'Account registered successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b111e] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
        >
          <Icon name="X" className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-black font-mono-code font-bold mb-2">
            &lt;/&gt;
          </div>
          <h3 className="font-heading font-black text-2xl text-white">
            {currentMode === 'login' ? 'Welcome Back to CodeBD' : 'Create Student Account'}
          </h3>
          <p className="text-xs text-slate-400">
            {currentMode === 'login' 
              ? 'Sign in to track bookmark contests and rankings' 
              : 'Join Bangladesh’s largest competitive coding community'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
          {currentMode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Tanvir Ahmed"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">University / College Email</label>
            <input
              type="email"
              required
              placeholder="student@buet.ac.bd"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {currentMode === 'register' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Codeforces / VJudge Handle</label>
              <input
                type="text"
                placeholder="e.g. tourist_bd"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 mt-2 cursor-pointer"
          >
            {currentMode === 'login' ? 'Sign In to CodeBD' : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          {currentMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentMode('register')}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => setCurrentMode('login')}
                className="text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Global Command Palette / Search Modal
const SearchModal = ({ onClose, onSelectContest, onSelectUni, onSelectCategory }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { contests: window.CODEBD_DATA.upcomingCompetitions, unis: window.CODEBD_DATA.universities.slice(0, 4) };
    const q = query.toLowerCase();
    return {
      contests: window.CODEBD_DATA.upcomingCompetitions.filter(c => 
        c.title.toLowerCase().includes(q) || c.university.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
      ),
      unis: window.CODEBD_DATA.universities.filter(u => 
        u.short.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q) || u.city.toLowerCase().includes(q)
      ),
      categories: window.CODEBD_DATA.categories.filter(cat => 
        cat.name.toLowerCase().includes(q)
      )
    };
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0c1220] border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Icon name="Search" className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search contests, BUET, ICPC, hackathons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono-code text-slate-400 border border-slate-700">ESC</kbd>
          <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer">✕</button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Competitions ({results.contests.length})
            </div>
            <div className="space-y-1.5">
              {results.contests.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { onClose(); onSelectContest(c); }}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                      {c.university}
                    </span>
                    <div>
                      <div className="font-bold text-white group-hover:text-cyan-300">{c.title}</div>
                      <div className="text-[10px] text-slate-400">{c.date} • {c.location}</div>
                    </div>
                  </div>
                  <span className="text-cyan-400 font-mono-code font-bold">{c.prizePool}</span>
                </div>
              ))}
            </div>
          </div>

          {results.unis && results.unis.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Universities ({results.unis.length})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {results.unis.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => { onClose(); onSelectUni(u); }}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="font-bold text-cyan-300">{u.short}</span>
                    <span className="text-[11px] text-slate-400 truncate">{u.fullName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] border border-cyan-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
        ✓
      </div>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2 cursor-pointer">✕</button>
    </div>
  );
};

// Main App Root
const App = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [bookmarks, setBookmarks] = useState(['buet-iupc-2026']);

  // Global keydown for ⌘K search and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
        setSelectedContest(null);
        setSubmitModalOpen(false);
        setAuthModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBookmarkToggle = (contestId) => {
    if (bookmarks.includes(contestId)) {
      setBookmarks(bookmarks.filter(id => id !== contestId));
      setToastMessage("Removed from bookmarked competitions");
    } else {
      setBookmarks([...bookmarks, contestId]);
      setToastMessage("Competition saved to your bookmarks! 🔖");
    }
  };

  const handleNavigateSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Sticky Navbar */}
      <Navbar
        onOpenAuth={(mode) => setAuthModal(mode)}
        onOpenSubmit={() => setSubmitModalOpen(true)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Content Area */}
      <main>
        {/* Hero Section */}
        <Hero
          onExplore={() => handleNavigateSection('competitions')}
          onSubmitContest={() => setSubmitModalOpen(true)}
          onSelectContest={(contest) => setSelectedContest(contest)}
        />

        {/* Quick Statistics */}
        <QuickStatistics />

        {/* Upcoming Competitions */}
        <UpcomingCompetitions
          onSelectContest={(contest) => setSelectedContest(contest)}
          onBookmarkToggle={handleBookmarkToggle}
          bookmarks={bookmarks}
        />

        {/* Featured Competition Banner */}
        <FeaturedCompetition
          onRegister={(contest) => {
            setSelectedContest(contest);
            setToastMessage("Registration portal opened for BNPC 2026!");
          }}
          onSelectContest={(contest) => setSelectedContest(contest)}
        />

        {/* Browse By Category */}
        <BrowseByCategory
          onSelectCategory={(cat) => {
            handleNavigateSection('competitions');
            setToastMessage(`Filtering competitions by category: ${cat.name}`);
          }}
        />

        {/* Browse By University */}
        <BrowseByUniversity
          onSelectUni={(uni) => {
            handleNavigateSection('competitions');
            setToastMessage(`Viewing competitions hosted by ${uni.short}`);
          }}
        />

        {/* Call To Action for Organizers */}
        <CtaSection onSubmitContest={() => setSubmitModalOpen(true)} />
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenSubmit={() => setSubmitModalOpen(true)}
        onOpenAuth={(mode) => setAuthModal(mode)}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* Interactive Modals */}
      {selectedContest && (
        <CompetitionModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onRegister={(contest) => {
            setToastMessage(`Registration form initialized for ${contest.title}!`);
          }}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={bookmarks.includes(selectedContest.id)}
        />
      )}

      {submitModalOpen && (
        <SubmitModal
          onClose={() => setSubmitModalOpen(false)}
          onSubmitSuccess={(title) => {
            setToastMessage(`"${title}" submitted successfully for CodeBD review! 🚀`);
          }}
        />
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuthSuccess={(msg) => setToastMessage(msg)}
        />
      )}

      {searchModalOpen && (
        <SearchModal
          onClose={() => setSearchModalOpen(false)}
          onSelectContest={(contest) => setSelectedContest(contest)}
          onSelectUni={(uni) => {
            handleNavigateSection('competitions');
            setToastMessage(`Browsing ${uni.short} contests`);
          }}
          onSelectCategory={(cat) => {
            handleNavigateSection('competitions');
          }}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}

    </div>
  );
};

// Render React App to Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
