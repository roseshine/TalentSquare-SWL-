const { useState, useEffect, useMemo, useRef } = React;
const LOCAL_API_HOST = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
const DJANGO_API_ORIGIN = document.documentElement.dataset.sameOriginApi === 'true'
  ? '' : 'http://' + LOCAL_API_HOST + ':8001';
const COMPETITIONS_API = DJANGO_API_ORIGIN + '/api/competitions/';

function mapCompetitionRecord(record) {
  const category = (window.TALENTSPHERE_DATA?.categories || []).find(item => item.id === record.category);
  const modeLabels = { online: 'Online', in_person: 'On-site', hybrid: 'Hybrid' };
  const date = value => value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    organizer: record.organizer,
    hostOrganization: record.host_organization,
    hostType: record.host_type,
    university: record.university_name,
    institutionAffiliation: record.institution_affiliation,
    type: category?.name || 'CSE Competition',
    category: record.category,
    mode: modeLabels[record.mode] || record.mode,
    location: record.location,
    targetDate: record.event_start_date,
    eventEndDate: record.event_end_date,
    date: date(record.event_start_date),
    deadline: record.registration_deadline,
    registrationUrl: record.registration_url,
    registrationMode: record.registration_mode || 'external',
    sourceUrl: record.source_url,
    submissionSource: record.submission_source,
    sourceName: record.source_name,
    importedAt: record.imported_at,
    sourceCheckedAt: record.source_checked_at,
    sourceFreshness: record.source_freshness || [],
    eligibility: record.eligibility,
    teamSize: record.team_size,
    prizePool: record.prize_pool,
    registrationFee: record.registration_fee === null ? '' : `${record.registration_fee_currency} ${record.registration_fee}`,
    tags: Array.isArray(record.tags) ? record.tags : [],
    status: record.registration_status,
    publicationStatus: 'published',
    isSample: false,
    publishedAt: record.published_at
  };
}

async function getCompetitionPage(params, signal) {
  const response = await fetch(COMPETITIONS_API + '?' + params.toString(), { signal, headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'The competition service could not load published listings.');
  return body;
}

// ==========================================
// 1. SVG ICON SYSTEM
// ==========================================
const SVG_ICONS = {
  smartphone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="5" y="2" width="14" height="20" rx="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
  gamepad2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M6 12h4m-2-2v4"></path><path d="M15 11h.01M18 13h.01"></path><path d="M7 6h10a4 4 0 0 1 3.9 3.1l1 4.5A3 3 0 0 1 17 17l-2-2H9l-2 2a3 3 0 0 1-4.9-3.4l1-4.5A4 4 0 0 1 7 6Z"></path></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="5" y="5" width="14" height="14" rx="2"></rect><path d="M9 9h6v6H9zM9 1v4m6-4v4m-6 14v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"></path></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7v2h10v-2h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path></svg>`,
  graduationcap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  user: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"></path></svg>`,
  code2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path><path d="M12 3v18"></path></svg>`,
  briefcase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  building2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  eyehide: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="m2 2 20 20"></path><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path></svg>`,
  arrowright: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  arrowleft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  checkcircle2: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  mappin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  layoutgrid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`,
  trendingup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
  palette: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z"></path></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
  sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
  shieldcheck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="m9 12 2 2 4-4"></path></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`
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

  return (
    <span className={`inline-flex items-center justify-center shrink-0 text-cyan-400 ${className}`} {...props}>
      ●
    </span>
  );
};

const Navbar = ({ onOpenAuth, onOpenSubmit, onNavigateSection, currentPath = '/', isAuthenticated, canAccessAdmin, Link }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled 
        ? "bg-[#060911]/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3" 
        : "bg-[#060911]/70 backdrop-blur-sm py-4 border-b border-white/5"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigateSection('hero')}
            id="nav-logo" role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onNavigateSection("hero"); }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d18] rounded-[10px] flex items-center justify-center">
                <Icon name="zap" className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight text-white flex items-center gap-1">
                Talent{' '}<span className="text-cyan-400">Square</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider uppercase font-semibold">
                Compete &middot; Recruit &middot; Rank
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 text-sm font-medium text-slate-300">
            <button onClick={() => onNavigateSection('hero')} className="hover:text-cyan-400 transition-colors cursor-pointer" aria-current={currentPath === '/' ? 'page' : undefined}>Home</button>
            <button 
              onClick={() => onNavigateSection('competitions')} 
              className={`hover:text-cyan-400 transition-colors cursor-pointer ${currentPath.startsWith('/competitions') ? 'text-cyan-300' : ''}`}
              id="nav-link-explore"
              aria-current={currentPath.startsWith('/competitions') ? 'page' : undefined}
            >
              Competitions
            </button>
            <button onClick={() => onNavigateSection('participant')} className="hover:text-cyan-400 transition-colors cursor-pointer" aria-current={currentPath === '/workspace' ? 'page' : undefined}>Participants</button>
            <button 
              onClick={() => onNavigateSection('jobfairs')} 
              className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5"
              id="nav-link-jobfair"
              aria-current={currentPath.startsWith('/job-fairs') ? 'page' : undefined}
            >
              Job Fair
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                Hiring
              </span>
            </button>
            <button 
              onClick={() => onNavigateSection('rankings')} 
              className="hover:text-cyan-400 transition-colors cursor-pointer"
              id="nav-link-rankings"
              aria-current={currentPath === '/rankings' ? 'page' : undefined}
            >
              Rankings
            </button>
            <button 
              onClick={onOpenSubmit} 
              className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 text-slate-200"
              id="nav-link-submit"
              aria-current={currentPath === '/organizer/competitions/new' ? 'page' : undefined}
            >
              <Icon name="rocket" className="w-3.5 h-3.5 text-cyan-400" />
              Submit Competition
            </button>
            <button onClick={() => onNavigateSection('workspace')} className="hover:text-cyan-400 transition-colors" aria-current={currentPath === '/workspace' ? 'page' : undefined}>My workspace</button>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {canAccessAdmin && <Link to="/admin" id="nav-admin-workspace" className="whitespace-nowrap text-sm font-semibold text-cyan-300 hover:text-white transition-colors" aria-current={currentPath === '/admin' ? 'page' : undefined}>Admin workspace</Link>}
            {!isAuthenticated && <>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/60 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              id="nav-btn-login"
              aria-current={currentPath === '/login' ? 'page' : undefined}
            >
              Login
            </button>
            <button
              onClick={() => onOpenAuth('role-select')}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all cursor-pointer"
              id="nav-btn-register"
              aria-current={currentPath === '/signup' ? 'page' : undefined}
            >
              Register
            </button>
            </>}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden items-center gap-2">
            {!isAuthenticated && <button
              onClick={() => onOpenAuth('login')}
                className="sm:hidden px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg"
            >
              Login
            </button>}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 border border-slate-700/60"
              id="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}
            >
              <Icon name={mobileMenuOpen ? "x" : "menu"} className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-slate-800 space-y-2 animate-fade-in-scale">
            <button onClick={() => { onNavigateSection('hero'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 rounded-lg">Home</button>
            <button onClick={() => { onNavigateSection('competitions'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 rounded-lg">Competitions</button>
            <button onClick={() => { onNavigateSection('participant'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-slate-200 rounded-lg">Participants</button>
            <button onClick={() => { onNavigateSection('workspace'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-cyan-300 rounded-lg">My workspace</button>
            {canAccessAdmin && <Link to="/admin" id="mobile-admin-workspace" className="block w-full px-3 py-2 text-xs text-cyan-300 rounded-lg" aria-current={currentPath === '/admin' ? 'page' : undefined}>Admin workspace</Link>}
            {!isAuthenticated && <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-lg bg-slate-800 text-white border border-slate-700"
              >
                Login
              </button>
              <button
                onClick={() => { onOpenAuth('role-select'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
              >
                Register
              </button>
            </div>}
            <button
              onClick={() => { onOpenSubmit(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center gap-2"
            >
              <Icon name="rocket" className="w-4 h-4 text-cyan-400" />
              Submit Competition
            </button>
            <button
              onClick={() => { onNavigateSection('jobfairs'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center gap-2"
            >
              <Icon name="briefcase" className="w-4 h-4 text-purple-400" />
              Job Fair
            </button>
            <button
              onClick={() => { onNavigateSection('rankings'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800/60 rounded-lg flex items-center gap-2"
            >
              <Icon name="trendingup" className="w-4 h-4 text-emerald-400" />
              Rankings
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// ==========================================
// 5. HERO SECTION WITH 6 PRIMARY ACTION BUTTONS
// ==========================================
const HeroSection = ({ onOpenAuth, onOpenSubmit, onNavigateSection }) => {
  return (
    <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-radial-gradient">
      
      {/* Background ambient glowing circles */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute top-48 right-10 w-[400px] h-[250px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Tagline Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Talent, Competitions & Job Fair Platform</span>
            <span className="text-slate-500">&middot;</span>
            <span className="text-slate-300">Frontend Preview</span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15]">
            Where Champions Compete,{' '}
            <span className="gradient-text-hero">Talents Shine</span> &amp; Companies Hire.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The premier unified hub for discovering engineering hackathons, submitting contests, accelerating careers in virtual job fairs, and climbing verified global rankings.
          </p>
        </div>

        {/* ========================================================= */}
        {/* THE SIX PRIMARY ACTION BUTTONS (MANDATORY REQUIREMENT)   */}
        {/* ========================================================= */}
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Select an action to get started immediately
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="six-primary-actions-grid">
            
            {/* 1. Login */}
            <div
              onClick={() => onOpenAuth('login')}
              id="action-btn-login"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-cyan-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                  <Icon name="user" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-800/80 text-cyan-300 rounded-md border border-cyan-500/20">
                  Action 1
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                Login
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Access your participant portfolio, organizer events, or recruiter candidate dashboard.
              </p>
            </div>

            {/* 2. Register */}
            <div
              onClick={() => onOpenAuth('role-select')}
              id="action-btn-register"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-blue-500/50 bg-gradient-to-b from-blue-950/20 to-transparent"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Icon name="sparkles" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                  Action 2
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-blue-300 transition-colors">
                Register
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Create your account as a Participant, Organizer, or Recruiter with customized onboarding.
              </p>
            </div>

            {/* 3. Submit Competition */}
            <div
              onClick={onOpenSubmit}
              id="action-btn-submit-competition"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-emerald-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <Icon name="rocket" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                  Action 3
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                Submit Competition
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Publish your university hackathon, coding contest, or design sprint to thousands of contestants.
              </p>
            </div>

            {/* 4. Explore Competitions */}
            <div
              onClick={() => onNavigateSection('competitions')}
              id="action-btn-explore-competitions"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-purple-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Icon name="trophy" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">
                  Action 4
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-purple-300 transition-colors">
                Explore Competitions
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Browse active hackathons, algorithms cups, and design challenges filtered by prize pool &amp; tags.
              </p>
            </div>

            {/* 5. Job Fair */}
            <div
              onClick={() => onNavigateSection('jobfairs')}
              id="action-btn-job-fair"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-pink-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
                  <Icon name="briefcase" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30">
                  Action 5
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-pink-300 transition-colors">
                Job Fair
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-pink-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Meet recruiters from Google, Microsoft, Meta &amp; high-growth startups offering fast-track hiring.
              </p>
            </div>

            {/* 6. Rankings */}
            <div
              onClick={() => onNavigateSection('rankings')}
              id="action-btn-rankings"
              role="button"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}
              tabIndex={0}
              className="action-btn-card group p-5 rounded-2xl glass-card cursor-pointer border border-slate-800 hover:border-amber-500/50"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <Icon name="trendingup" className="w-6 h-6" />
                </div>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
                  Action 6
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-white mt-4 flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                Rankings
                <Icon name="arrowright" className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Check the global leaderboard, university standings, and talent ratings verified across contests.
              </p>
            </div>

          </div>
        </div>

        {/* Live Platform Stats */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {(window.TALENTSPHERE_DATA?.stats || []).map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="text-xl sm:text-2xl font-heading font-black text-white">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-cyan-400 mt-1 font-mono-code">{stat.change}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

// =========================================================================
// 6. DYNAMIC AUTHENTICATION MODAL (LOGIN, ROLE-SELECTION, 3 REGISTRATIONS)
// =========================================================================
const ExploreCompetitionsSection = ({ onSelectContest }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categories = window.TALENTSPHERE_DATA?.categories || [];
  const [allCompetitions, setAllCompetitions] = useState([]);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page_size: '3', ordering: 'recent', registration_status: 'Upcoming' });
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    getCompetitionPage(params, controller.signal).then(result => {
      setAllCompetitions((result.results || []).map(mapCompetitionRecord));
      setLoadState('ready');
    }).catch(error => {
      if (error.name !== 'AbortError') setLoadState('error');
    });
    return () => controller.abort();
  }, [activeCategory, searchQuery]);

  const filteredCompetitions = useMemo(() => {
    return allCompetitions.filter(comp => {
      const matchCat = activeCategory === 'all' || comp.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || [comp.title, comp.organizer, comp.university, comp.hostOrganization, comp.type,
        ...(Array.isArray(comp.tags) ? comp.tags : [])].filter(Boolean).join(' ').toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery, allCompetitions]);

  return (
    <section id="competitions" className="py-20 bg-[#070a13] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 mb-2">
              <Icon name="trophy" className="w-3.5 h-3.5" />
              <span>Published CSE Competitions</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              Explore CSE Competitions
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Browse administrator-approved programming, AI, hackathon, and other CSE challenges.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icon name="search" className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search hackathons, algorithms, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-9 text-xs"
              id="competition-search-input"
              aria-label="Search competitions"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                aria-label="Clear competition search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Icon name={cat.icon || 'trophy'} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Competitions Grid */}
        {loadState === 'loading' ? <div className="text-center py-12" role="status">Loading published competitions…</div> :
        loadState === 'error' ? <div className="text-center py-12" role="alert">Published competitions could not be loaded. Please try again later.</div> :
        filteredCompetitions.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl glass-card border border-slate-800">
            <Icon name="trophy" className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-white">No published competitions yet</h3>
            <p className="text-xs text-slate-400 mt-1">Approved competitions will appear here after administrator review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map(comp => (
              <div
                key={comp.id}
                className="glass-card rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {comp.type}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                      Django published
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {comp.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    By {comp.organizer}
                  </p>

                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Prize Pool:</span>
                      <span className="font-bold text-emerald-400 font-mono-code">{comp.prizePool || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Format:</span>
                    <span className="text-slate-300">{comp.mode || 'Mode not provided'} &middot; {comp.location || 'Location not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Team Size:</span>
                    <span className="text-slate-300">{comp.teamSize || 'Not provided'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(comp.tags || []).slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 rounded border border-slate-700/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onSelectContest(comp)}
                    className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700/90 border border-slate-700 transition-all cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onSelectContest(comp)}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    Details
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </section>
  );
};

const ExploreCompetitionsPage = ({ onSelectContest, onOpenSubmit }) => {
  const data = window.TALENTSPHERE_DATA;
  const [competitions, setCompetitions] = useState([]);
  const categories = (data?.categories || []).filter(category => category.id !== 'all');
  const [loadState, setLoadState] = useState('loading');
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [source, setSource] = useState('all');
  const [university, setUniversity] = useState('all');
  const [mode, setMode] = useState('all');
  const [status, setStatus] = useState('Upcoming');
  const [fee, setFee] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  function changeFilter(setter, value) { setter(value); setPage(1); }

  useEffect(() => {
    const controller = new AbortController();
    const sortMap = { deadline: 'deadline', 'competition-date': 'event_date', recent: 'recent', name: 'title' };
    const params = new URLSearchParams({ page: String(page), page_size: '12', ordering: sortMap[sortBy] || 'deadline' });
    if (query.trim()) params.set('search', query.trim());
    if (category !== 'all') params.set('category', category);
    if (source === 'university') params.set('host_type', 'university');
    if (source === 'external') params.set('host_type', 'outside_university');
    if (university === 'not-university') params.set('host_type', 'outside_university');
    else if (university !== 'all') params.set('university', university);
    if (mode !== 'all') params.set('event_mode', mode === 'offline' ? 'in_person' : mode);
    if (status !== 'all') params.set('registration_status', status);
    if (fee !== 'all') params.set('registration_fee', fee);

    const today = new Date();
    const isoDate = value => [value.getFullYear(), String(value.getMonth()+1).padStart(2,'0'), String(value.getDate()).padStart(2,'0')].join('-');
    params.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    if (dateRange === 'custom') {
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
    } else if (dateRange === 'week') {
      const start = new Date(today); start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      const end = new Date(start); end.setDate(end.getDate() + 6);
      params.set('date_from', isoDate(start)); params.set('date_to', isoDate(end));
    } else if (dateRange === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      params.set('date_from', isoDate(start)); params.set('date_to', isoDate(end));
    }

    setLoadState('loading');
    getCompetitionPage(params, controller.signal).then(result => {
      setCompetitions((result.results || []).map(mapCompetitionRecord));
      setTotalCount(result.count || 0);
      setTotalPages(Math.max(1, Math.ceil((result.count || 0) / 12)));
      setUniversities(result.universities || []);
      setLoadState('ready');
    }).catch(error => {
      if (error.name !== 'AbortError') setLoadState('error');
    });
    return () => controller.abort();
  }, [query, category, source, university, mode, status, fee, dateRange, dateFrom, dateTo, sortBy, page]);

  function hostClass(comp) {
    return comp.hostType === 'university' ? 'university' : comp.hostType === 'outside_university' ? 'external' : 'unknown';
  }
  const hasUniversityHosts = universities.length > 0;
  const hasOutsideUniversityHosts = true;

  function dateValue(value) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  function eventDate(comp) { return dateValue(comp.targetDate) || dateValue(comp.date); }
  function formatDate(value) {
    const parsed = dateValue(value);
    return parsed ? parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : (value || 'Date not provided');
  }
  function registrationStatus(comp) {
    return comp.status || 'Status not provided';
  }
  function modeValue(comp) {
    const value = [comp.mode, comp.location].filter(Boolean).join(' ').toLowerCase();
    if (value.includes('hybrid') || (/(online|virtual|remote)/.test(value) && /(onsite|on-site|offline|in person)/.test(value))) return 'hybrid';
    if (/(online|virtual|remote|sandbox)/.test(value)) return 'online';
    if (/(offline|onsite|on-site|in person)/.test(value)) return 'offline';
    return 'unknown';
  }
  function feeValue(comp) {
    const value = comp.registrationFee;
    if (value === undefined || value === null || value === '') return 'unknown';
    if (typeof value === 'number') return value <= 0 ? 'free' : 'paid';
    const normalized = String(value).trim().toLowerCase();
    if (/^(free|no fee|0|0\.00)$/.test(normalized)) return 'free';
    if (/paid|\$|৳|€|£|\d/.test(normalized)) return 'paid';
    return 'unknown';
  }
  function dateMatches(comp) {
    if (dateRange === 'all') return true;
    const starts = eventDate(comp);
    if (!starts) return false;
    const now = new Date();
    if (dateRange === 'week') {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
      const end = new Date(start); end.setDate(end.getDate() + 7);
      return starts >= start && starts < end;
    }
    if (dateRange === 'month') return starts.getMonth() === now.getMonth() && starts.getFullYear() === now.getFullYear();
    const min = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
    const max = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    return (!min || starts >= min) && (!max || starts <= max);
  }

  const filteredCompetitions = competitions;

  function clearFilters() {
    setQuery(''); setCategory('all'); setSource('all'); setUniversity('all'); setMode('all');
    setStatus('Upcoming'); setFee('all'); setDateRange('all'); setDateFrom(''); setDateTo(''); setSortBy('deadline'); setPage(1);
  }
  const activeChips = [];
  if (query.trim()) activeChips.push({ label: `Search: ${query.trim()}`, clear: () => changeFilter(setQuery, '') });
  if (category !== 'all') activeChips.push({ label: categories.find(item => item.id === category)?.name || category, clear: () => changeFilter(setCategory, 'all') });
  if (source !== 'all') activeChips.push({ label: source === 'university' ? 'University competitions' : 'Outside-university competitions', clear: () => changeFilter(setSource, 'all') });
  if (university !== 'all') activeChips.push({ label: university === 'not-university' ? 'Not university-hosted' : university, clear: () => changeFilter(setUniversity, 'all') });
  if (mode !== 'all') activeChips.push({ label: `Mode: ${mode[0].toUpperCase() + mode.slice(1)}`, clear: () => changeFilter(setMode, 'all') });
  if (status !== 'all') activeChips.push({ label: status, clear: () => changeFilter(setStatus, 'all') });
  if (fee !== 'all') activeChips.push({ label: fee === 'unknown' ? 'Fee not provided' : fee === 'free' ? 'Free' : 'Paid', clear: () => changeFilter(setFee, 'all') });
  if (dateRange !== 'all') activeChips.push({ label: dateRange === 'week' ? 'This week' : dateRange === 'month' ? 'This month' : `Custom dates${dateFrom || dateTo ? `: ${dateFrom || 'any'} – ${dateTo || 'any'}` : ''}`, clear: () => { setDateRange('all'); setDateFrom(''); setDateTo(''); } });

  function FilterControls() {
    return <div className="competition-filter-controls">
      <label><span>University</span><select className="form-input form-select" value={university} onChange={event => changeFilter(setUniversity, event.target.value)}>
        <option value="all">All Universities</option>{universities.map(name => <option key={name} value={name}>{name}</option>)}
        {hasOutsideUniversityHosts && <option value="not-university">Not University-Hosted</option>}
      </select></label>
      <label><span>Competition category</span><select className="form-input form-select" value={category} onChange={event => changeFilter(setCategory, event.target.value)}>
        <option value="all">All Categories</option>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      <label><span>Competition mode</span><select className="form-input form-select" value={mode} onChange={event => changeFilter(setMode, event.target.value)}>
        <option value="all">All Modes</option><option value="online">Online</option><option value="offline">Offline</option><option value="hybrid">Hybrid</option>
      </select></label>
      <label><span>Registration status</span><select className="form-input form-select" value={status} onChange={event => changeFilter(setStatus, event.target.value)}>
        <option value="all">All Statuses</option><option>Registration Open</option><option>Registration Closed</option><option>In progress</option><option>Completed</option><option>Status not provided</option>
      </select></label>
      <label><span>Registration fee</span><select className="form-input form-select" value={fee} onChange={event => changeFilter(setFee, event.target.value)}>
        <option value="all">All Fees</option><option value="free">Free</option><option value="paid">Paid</option><option value="unknown">Not provided</option>
      </select></label>
      <label><span>Competition date</span><select className="form-input form-select" value={dateRange} onChange={event => changeFilter(setDateRange, event.target.value)}>
        <option value="all">All Dates</option><option value="week">This Week</option><option value="month">This Month</option><option value="custom">Custom Date Range</option>
      </select></label>
      {dateRange === 'custom' && <div className="competition-date-inputs">
        <label><span>From</span><input className="form-input" type="date" value={dateFrom} onChange={event => changeFilter(setDateFrom, event.target.value)} /></label>
        <label><span>To</span><input className="form-input" type="date" value={dateTo} onChange={event => changeFilter(setDateTo, event.target.value)} /></label>
      </div>}
      <button type="button" className="competition-clear-button" onClick={clearFilters}>Clear All Filters</button>
    </div>;
  }

  return <>
    <section className="competition-explore-hero bg-radial-gradient">
      <div className="page-container competition-hero-inner">
        <div className="competition-hero-copy">
          <span className="eyebrow"><Icon name="code2" className="w-4 h-4" />Talent Square · Computer Science & Engineering</span>
          <h1>Explore <span className="gradient-text-hero">CSE Competitions</span></h1>
          <p>Discover programming contests, hackathons, datathons, AI challenges, cybersecurity competitions, and more — all in one place.</p>
          <button type="button" className="competition-host-button" onClick={onOpenSubmit}><Icon name="rocket" className="w-4 h-4" />Host a competition</button>
        </div>
        <label className="competition-search-box">
          <Icon name="search" className="w-5 h-5" />
          <input type="search" aria-label="Search competitions, universities, organizers, categories, and tags" value={query} onChange={event => changeFilter(setQuery, event.target.value)} placeholder="Search competitions, universities, organizers..." />
          {query && <button type="button" aria-label="Clear search" onClick={() => changeFilter(setQuery, '')}><Icon name="x" className="w-4 h-4" /></button>}
        </label>
      </div>
    </section>

    <section className="competition-discovery page-container" aria-labelledby="competition-types-title">
      <div className="competition-section-heading"><div><span className="eyebrow">FIND YOUR NEXT CHALLENGE</span><h2 id="competition-types-title">Browse by Competition Type</h2></div>
        <span className="competition-scope-note">CSE competitions only</span></div>
      <div className="competition-category-grid">
        <button type="button" className={`competition-category-card ${category === 'all' ? 'is-active' : ''}`} aria-pressed={category === 'all'} onClick={() => changeFilter(setCategory, 'all')}>
          <span className="competition-category-icon"><Icon name="layoutgrid" className="w-5 h-5" /></span><strong>All Competitions</strong>
        </button>
          {categories.map(item => <button type="button" key={item.id} className={`competition-category-card ${category === item.id ? 'is-active' : ''}`} aria-pressed={category === item.id} onClick={() => changeFilter(setCategory, item.id)}>
          <span className="competition-category-icon"><Icon name={item.icon} className="w-5 h-5" /></span><strong>{item.name}</strong>
        </button>)}
      </div>
    </section>

    <section className="competition-listing-section" aria-labelledby="available-competitions-title">
      <div className="page-container">
        <div className="competition-source-tabs" role="group" aria-label="Competition host type">
          {[['all', 'All Competitions'], ['university', 'University Competitions'], ['external', 'Outside-University Competitions']].map(([id, label]) =>
            <button type="button" key={id} aria-pressed={source === id} className={source === id ? 'is-active' : ''} onClick={() => changeFilter(setSource, id)}>{label}</button>)}
        </div>
        <div className="competition-results-layout">
          <aside className="competition-filter-sidebar" aria-label="Competition filters"><div className="competition-filter-heading"><h2>Filters</h2><span>Combine any options</span></div><FilterControls /></aside>
          <details className="competition-mobile-filters"><summary><Icon name="layoutgrid" className="w-4 h-4" /> Filters{activeChips.length ? ` (${activeChips.length})` : ''}</summary><FilterControls /></details>
          <div className="competition-results">
            <div className="competition-results-header">
              <div><span className="eyebrow">APPROVED LISTINGS</span><h2 id="available-competitions-title">Available Competitions</h2>
                <p aria-live="polite">{loadState === 'ready' ? `${totalCount} published ${totalCount === 1 ? 'competition' : 'competitions'}` : 'Loading published competitions'}</p></div>
              <label className="competition-sort"><span>Sort by</span><select className="form-input form-select" value={sortBy} onChange={event => changeFilter(setSortBy, event.target.value)}>
                <option value="deadline">Registration Deadline: Soonest</option><option value="recent">Recently Added</option><option value="competition-date">Competition Date: Soonest</option><option value="name">Competition Name: A–Z</option>
              </select></label>
            </div>
            <div className="competition-active-filters" aria-label="Active filters">
              {activeChips.map((chip, index) => <button type="button" key={`${chip.label}-${index}`} onClick={chip.clear} aria-label={`Remove ${chip.label} filter`}>{chip.label}<Icon name="x" className="w-3 h-3" /></button>)}
              {activeChips.length > 0 && <button type="button" className="competition-clear-inline" onClick={clearFilters}>Clear all</button>}
            </div>

            {loadState === 'loading' && <div className="competition-state" role="status"><span className="loading-ring" /><h3>Loading competitions</h3><p>Checking administrator-approved listings.</p></div>}
            {loadState === 'error' && <div className="competition-state" role="alert"><Icon name="info" className="w-8 h-8" /><h3>Competitions could not be loaded</h3><p>The Django competition service did not respond. Try again when the backend is running.</p><button className="button-secondary" onClick={() => window.location.reload()}>Retry</button></div>}
            {loadState === 'ready' && totalCount === 0 && <div className="competition-state"><Icon name="trophy" className="w-8 h-8" /><h3>No published competitions match these filters</h3><p>Only approved CSE competitions appear here. Try another filter or check back after an administrator approves a submission.</p><button type="button" className="button-secondary" onClick={clearFilters}>Clear Filters</button></div>}
            {loadState === 'ready' && filteredCompetitions.length > 0 && <div className="competition-card-grid">
              {filteredCompetitions.map(comp => {
                const compCategory = categories.find(item => item.id === comp.category);
                const currentStatus = registrationStatus(comp);
                const hostName = comp.hostOrganization || comp.university || 'Host affiliation not provided';
                const displayMode = comp.mode || (modeValue(comp) === 'unknown' ? 'Mode not provided' : modeValue(comp));
                return <article className="competition-list-card" key={comp.id}>
                  <div className="competition-card-topline"><span className="competition-category-badge">{compCategory?.name || comp.type || 'CSE Competition'}</span><span className={`competition-status-badge status-${currentStatus.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{currentStatus}</span></div>
                  <span className="competition-sample-label"><Icon name={comp.submissionSource==='imported'?'layoutgrid':'users'} className="w-3 h-3" /> {comp.submissionSource==='imported'?'Imported from '+(comp.sourceName||'external source'):'Organizer listing'}</span>
                  {comp.submissionSource==='imported'&&comp.sourceCheckedAt&&<span className="competition-source-checked">Source checked {new Date(comp.sourceCheckedAt).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}</span>}
                  {comp.sourceFreshness?.map(label=><span className="competition-source-checked" key={label}>{label}</span>)}
                  <h3>{comp.title || 'Competition title not provided'}</h3>
                  <dl className="competition-card-details">
                    <div><dt>Organizer</dt><dd>{comp.organizer || 'Organizer not provided'}</dd></div>
                    <div><dt>Host</dt><dd>{hostName}</dd></div>
                    <div><dt>Mode</dt><dd>{displayMode}</dd></div>
                    <div><dt>Competition date</dt><dd>{comp.date || formatDate(comp.targetDate)}</dd></div>
                    <div><dt>Registration deadline</dt><dd>{formatDate(comp.deadline)}</dd></div>
                    <div><dt>Prize pool</dt><dd>{comp.prizePool || 'Prize not provided'}</dd></div>
                  </dl>
                  {Array.isArray(comp.tags) && comp.tags.length > 0 && <div className="competition-card-tags">{comp.tags.slice(0, 3).map((tag, index) => <span key={`${tag}-${index}`}>#{tag}</span>)}</div>}
                  <div className="competition-card-actions"><button type="button" className="competition-details-button" onClick={() => onSelectContest(comp)}>View Details</button>
                    {window.TalentSquareActivity && React.createElement(window.TalentSquareActivity.BookmarkButton,{id:comp.id,title:comp.title,compact:true})}</div>
                </article>;
              })}
            </div>}
            {loadState === 'ready' && totalPages > 1 && <nav className="competition-pagination" aria-label="Competition pages">
              <button type="button" className="button-secondary" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button type="button" className="button-secondary" disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next</button>
            </nav>}
          </div>
        </div>
      </div>
    </section>
  </>;
};

// =========================================================================
// 9. JOB FAIR SECTION (EVENT CARDS, RECRUITER BOOTHS, HIRING TRACKS)
// =========================================================================
const JobFairSection = ({ onSelectFair, onOpenAuth, items }) => {
  const jobFairs = items || window.TALENTSPHERE_DATA?.jobFairs || [];

  return (
    <section id="jobfairs" className="py-20 bg-[#060911] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-3">
            <Icon name="briefcase" className="w-3.5 h-3.5" />
            <span>Fast-Track Career Pipelines</span>
          </div>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Attend Premier Tech Job Fairs
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Top contest performers get direct access to tech titans and fast-growing unicorns. Schedule virtual 1-on-1 interviews, showcase your ranking badges, and land your dream offer.
          </p>
        </div>

        {/* Job Fair Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {jobFairs.map(fair => (
            <div
              key={fair.id}
              className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between hover:border-purple-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {fair.badge}
                  </span>
                  <span className="text-xs font-mono-code text-cyan-400">
                    {fair.dates}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
                  {fair.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {fair.organizer} &middot; {fair.mode}
                </p>

                <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                  {fair.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Talent</span>
                    <span className="font-bold text-white text-xs">{fair.attendeesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Companies</span>
                    <span className="font-bold text-purple-400 text-xs">{fair.companiesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Open Roles</span>
                    <span className="font-bold text-emerald-400 text-xs">{fair.openPositions}</span>
                  </div>
                </div>

                {/* Featured Participating Companies */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Featured Hiring Partners
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fair.participatingCompanies.slice(0, 4).map((comp, cIdx) => (
                      <span key={cIdx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700">
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Action */}
              <div className="pt-6 mt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => onSelectFair(fair)}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Icon name="briefcase" className="w-4 h-4" />
                  <span>View Fair Details</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Recruiter Callout */}
        <div className="mt-12 p-6 rounded-2xl glass-card border border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-slate-900 to-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-heading font-bold text-lg text-white">
              Are you hiring top software engineers, AI researchers, or product designers?
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              Host a hiring booth, sponsor prize tracks, and evaluate pre-vetted contestants ranked across ICPC contests and hackathons.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth('role-select')}
            className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-500/20 whitespace-nowrap cursor-pointer transition-colors"
          >
            Create Recruiter Account
          </button>
        </div>

      </div>
    </section>
  );
};

// =========================================================================
// 10. RANKINGS & LEADERBOARD SECTION
// =========================================================================
const RankingsSection = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [rankingSearch, setRankingSearch] = useState('');

  const rankingData = window.TALENTSPHERE_DATA?.rankings || { categories: [], topTalent: [], universityRankings: [] };

  const filteredTalent = useMemo(() => {
    return rankingData.topTalent.filter(item => {
      const matchCat = activeTab === 'global' || item.category === activeTab;
      const q = rankingSearch.toLowerCase().trim();
      const matchSearch = !q || (
        item.name.toLowerCase().includes(q) ||
        item.handle.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q)
      );
      return matchCat && matchSearch;
    });
  }, [activeTab, rankingSearch, rankingData]);

  const filteredUniversities = rankingData.universityRankings.filter(uni =>
    uni.name.toLowerCase().includes(rankingSearch.toLowerCase().trim()));

  return (
    <section id="rankings" className="py-20 bg-[#070a13] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 mb-2">
              <Icon name="trendingup" className="w-3.5 h-3.5" />
              <span>Verified Skill Standing</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              Platform Rankings &amp; Leaderboards
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Live ratings earned through verified contest podiums, algorithm battles, and evaluated project submissions.
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icon name="search" className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search contestants, handles, unis..."
              aria-label="Search rankings"
              value={rankingSearch}
              onChange={(e) => setRankingSearch(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {rankingData.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              aria-pressed={activeTab === cat.id}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Table / Rankings Display */}
        {activeTab === 'university' ? (
          /* University Standings Table */
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Rank</th>
                    <th className="py-3.5 px-4">University / Institution</th>
                    <th className="py-3.5 px-4 text-center">Active Participants</th>
                    <th className="py-3.5 px-4 text-center">Podium Finishes</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                  {!filteredUniversities.length && <tr><td colSpan={5} className="text-center p-10 text-slate-400">No universities found. Try another name.</td></tr>}
                  {filteredUniversities.map((uni, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold font-mono-code text-xs ${
                          uni.rank === 1 ? 'bg-amber-500 text-black' :
                          uni.rank === 2 ? 'bg-slate-300 text-black' :
                          uni.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          #{uni.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-heading font-bold text-white flex items-center gap-2">
                          <Icon name="graduationcap" className="w-4 h-4 text-cyan-400" />
                          <span>{uni.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono-code text-slate-300">
                        {uni.participants}
                      </td>
                      <td className="py-4 px-4 text-center font-mono-code text-emerald-400 font-bold">
                        {uni.podiums}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-mono-code font-bold text-cyan-400">
                        {uni.points.toLocaleString()} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Participant Talent Standings Table */
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Rank</th>
                    <th className="py-3.5 px-4">Participant</th>
                    <th className="py-3.5 px-4">Institution / Org</th>
                    <th className="py-3.5 px-4">Badges &amp; Status</th>
                    <th className="py-3.5 px-4 text-center">Contests Won</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Rating Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                  {!filteredTalent.length && <tr><td colSpan={6} className="text-center p-10 text-slate-400">No participants found. Try another name or category.</td></tr>}
                  {filteredTalent.map((person, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold font-mono-code text-xs ${
                          person.rank === 1 ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' :
                          person.rank === 2 ? 'bg-slate-300 text-black' :
                          person.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          #{person.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-heading font-bold text-white flex items-center gap-1.5">
                          <span>{person.name}</span>
                          <span className="text-[11px] text-cyan-400 font-mono-code font-normal">{person.handle}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{person.title}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {person.institution}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {person.badges.map((b, bIdx) => (
                            <span key={bIdx} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono-code text-emerald-400 font-bold">
                        {person.contestsWon}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right font-mono-code font-bold text-cyan-300">
                        {person.rating} / {person.points} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

// =========================================================================
// 11. FOOTER
// =========================================================================
const Footer = ({ onOpenAuth, onOpenSubmit, onNavigateSection, canAccessAdmin, Link }) => {
  return (
    <footer className="bg-[#04060b] border-t border-slate-800/80 py-12 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-bold">
                <Icon name="zap" className="w-5 h-5 text-black" />
              </div>
              <span className="font-heading font-black text-lg text-white">
                Talent{' '}<span className="text-cyan-400">Square</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier ecosystem for collegiate hackathons, talent verification, job fairs, and verified engineering ratings.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-3 text-sm">Primary Actions</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onOpenAuth('login')} className="hover:text-cyan-400">1. Login</button></li>
              <li><button onClick={() => onOpenAuth('role-select')} className="hover:text-cyan-400">2. Register</button></li>
              <li><button onClick={onOpenSubmit} className="hover:text-cyan-400">3. Submit Competition</button></li>
              <li><button onClick={() => onNavigateSection('competitions')} className="hover:text-cyan-400">4. Explore Competitions</button></li>
              <li><button onClick={() => onNavigateSection('jobfairs')} className="hover:text-cyan-400">5. Job Fair</button></li>
              <li><button onClick={() => onNavigateSection('rankings')} className="hover:text-cyan-400">6. Platform Rankings</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-3 text-sm">Account Roles</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigateSection('participant')} className="hover:text-cyan-400">Participant workspace</button></li>
              <li><button onClick={() => onNavigateSection('organizer')} className="hover:text-cyan-400">Organizer workspace</button></li>
              <li><button onClick={() => onNavigateSection('recruiter')} className="hover:text-cyan-400">Recruiter workspace</button></li>
              {canAccessAdmin && <li><Link to="/admin" className="hover:text-cyan-400">Admin workspace</Link></li>}
              <li><button onClick={() => onOpenAuth('forgot-password')} className="hover:text-cyan-400">Password Recovery</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-3 text-sm">Your next chapter starts here</h4>
            <p className="text-xs leading-relaxed text-slate-400">Discover your next challenge, connect with ambitious people, and turn your skills into opportunities.</p>
            <a href="/help" className="inline-flex items-center gap-2 mt-4 text-cyan-300 hover:text-white">Help & contact <span aria-hidden="true">→</span></a>
            <p className="text-xs text-cyan-400 mt-4">Frontend preview · Sample events and rankings</p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Talent Square. All rights reserved.</p>
          <nav aria-label="Support and policies" className="flex flex-wrap justify-center items-center gap-4 text-slate-400">
            <a href="/help" className="hover:text-cyan-300">Help & contact</a>
            <a href="/privacy" className="hover:text-cyan-300">Privacy policy</a>
            <a href="/terms" className="hover:text-cyan-300">Terms of use</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};


window.TalentSphereUI = { Icon, Navbar, HeroSection, ExploreCompetitionsSection, ExploreCompetitionsPage, JobFairSection, RankingsSection, Footer, apiOrigin: DJANGO_API_ORIGIN };
