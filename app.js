/* ============================================================
   FOLIO — Portfolio Builder (Updated)
   ============================================================ */

const STORAGE_KEY = 'folio_app_state_v1';

const defaultPortfolio = {
  profile: { picture: null, fullName: '', jobTitle: '', bio: '', about: '', location: '', email: '', phone: '', website: '', availability: 'open' },
  skills: [], projects: [], experience: [], education: [], certificates: [],
  social: { github: '', linkedin: '', twitter: '', dribbble: '', behance: '', instagram: '' },
  resume: null, theme: 'dark',
  customization: { accent: '#ff6b4a', layout: 'modern' }
};

const samplePortfolioData = {
  profile: {
    picture: null,
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Product Designer',
    bio: 'Designing thoughtful digital products at the intersection of craft, technology, and human needs.',
    about: "I'm a product designer with 8+ years of experience crafting digital products people love to use. I work at the intersection of design, engineering, and strategy — turning ambiguous problems into elegant, scalable solutions. Currently leading design for a B2B SaaS platform serving 200k+ users.",
    location: 'San Francisco, CA',
    email: 'alex@morgan.design',
    phone: '+1 (555) 246-8101',
    website: 'alexmorgan.design',
    availability: 'open'
  },
  skills: [
    { name: 'Product Design', level: 95 }, { name: 'Figma', level: 98 }, { name: 'Design Systems', level: 90 },
    { name: 'Prototyping', level: 88 }, { name: 'User Research', level: 82 }, { name: 'Frontend (React)', level: 75 }
  ],
  projects: [
    { title: 'Helio Analytics', description: 'Redesigned a complex analytics dashboard, reducing time-to-insight by 40%. Led end-to-end design from research to handoff.', image: 'https://picsum.photos/seed/helio/800/500.jpg', link: '#', tags: ['Product Design', 'SaaS', 'Data Viz'] },
    { title: 'Northwind Mobile', description: 'A native mobile banking app focused on accessibility and trust. Shipped to 500k+ users with a 4.8 rating.', image: 'https://picsum.photos/seed/northwind/800/500.jpg', link: '#', tags: ['Mobile', 'Fintech', 'iOS'] },
    { title: 'Atlas Design System', description: 'Built a cross-platform design system adopted by 14 product teams. Reduced design debt by 60%.', image: 'https://picsum.photos/seed/atlas/800/500.jpg', link: '#', tags: ['Design Systems', 'Tokens', 'Docs'] }
  ],
  experience: [
    { company: 'Linear', role: 'Senior Product Designer', startDate: '2022-01', endDate: 'Present', description: 'Leading design for the planning suite. Drove a redesign that improved activation by 28%.' },
    { company: 'Stripe', role: 'Product Designer', startDate: '2019-06', endDate: '2021-12', description: 'Designed billing and invoicing flows used by millions of businesses worldwide.' },
    { company: 'Airbnb', role: 'Design Intern', startDate: '2018-05', endDate: '2018-08', description: 'Contributed to the host onboarding experience redesign.' }
  ],
  education: [
    { school: 'Rhode Island School of Design', degree: 'BFA, Graphic Design', startDate: '2014', endDate: '2018', description: 'Graduated with honors. President of the Design Club.' }
  ],
  certificates: [
    { name: 'Nielsen Norman UX Certification', issuer: 'NN/g', date: '2021-04', link: '#' },
    { name: 'Interaction Design Foundation Member', issuer: 'IxDF', date: '2020-02', link: '#' }
  ],
  social: { github: 'alexmorgan', linkedin: 'alexmorgan', twitter: 'alexmorgan', dribbble: 'alexmorgan', behance: '', instagram: '' },
  resume: null, theme: 'dark', customization: { accent: '#ff6b4a', layout: 'modern' }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: [], session: null, portfolios: {}, theme: 'dark' };
    return JSON.parse(raw);
  } catch (e) { return { users: [], session: null, portfolios: {}, theme: 'dark' }; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(appState)); }

let appState = loadState();

/* ---------- Auth Helpers ---------- */
function currentUser() { return appState.session ? appState.users.find(u => u.id === appState.session.userId) || null : null; }
function currentPortfolio() {
  const user = currentUser();
  if (!user) return null;
  if (!appState.portfolios[user.id]) {
    appState.portfolios[user.id] = JSON.parse(JSON.stringify(defaultPortfolio));
    saveState();
  }
  return appState.portfolios[user.id];
}
function generateToken(userId) { return btoa(JSON.stringify({ userId, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })); }
function register(data) {
  if (appState.users.find(u => u.email === data.email)) return { ok: false, error: 'An account with this email already exists' };
  if (appState.users.find(u => u.username === data.username)) return { ok: false, error: 'This username is already taken' };
  const user = { id: 'u_' + Math.random().toString(36).slice(2, 11), ...data, password: btoa(data.password), createdAt: new Date().toISOString() };
  appState.users.push(user);
  appState.portfolios[user.id] = JSON.parse(JSON.stringify({ ...samplePortfolioData, profile: { ...samplePortfolioData.profile, fullName: `${data.firstName} ${data.lastName}`, email: data.email } }));
  appState.session = { userId: user.id, token: generateToken(user.id) };
  saveState();
  return { ok: true, user };
}
function login(email, password) {
  const user = appState.users.find(u => u.email === email);
  if (!user || user.password !== btoa(password)) return { ok: false, error: 'Invalid email or password' };
  appState.session = { userId: user.id, token: generateToken(user.id) };
  saveState();
  return { ok: true, user };
}
function logout() { appState.session = null; saveState(); }
function requireAuth() { if (!appState.session || !currentUser()) { window.location.hash = '#/login'; return false; } return true; }

/* ---------- UI Helpers ---------- */
function toast(type, title, message) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'fa-check', error: 'fa-xmark', info: 'fa-circle-info' };
  el.innerHTML = `<div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div><div style="flex:1;"><div class="toast-title">${title}</div>${message ? `<div class="toast-msg">${message}</div>` : ''}</div><button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;padding:0 4px;"><i class="fas fa-xmark" style="font-size:12px;"></i></button>`;
  container.appendChild(el);
  setTimeout(() => { el.style.transition = 'all .3s ease'; el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 300); }, 4000);
}
function openModal(html) { document.getElementById('modal-root').innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)closeModal()">${html}</div>`; }
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
function applyTheme(theme) { document.documentElement.classList.toggle('light', theme === 'light'); document.documentElement.classList.toggle('dark', theme !== 'light'); appState.theme = theme; saveState(); }
function toggleTheme() { applyTheme(appState.theme === 'dark' ? 'light' : 'dark'); }
applyTheme(appState.theme || 'dark');

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => obs.observe(el));
}
function escapeAttr(s) { return String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function btn(label, opts = {}) {
  const { variant = 'primary', size = 'md', icon = '', iconRight = '', onClick = '', type = 'button', id = '', disabled = false, extraClass = '' } = opts;
  const sz = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return `<button type="${type}" ${id ? `id="${id}"` : ''} ${onClick ? `onclick="${onClick}"` : ''} ${disabled ? 'disabled' : ''} class="btn btn-${variant} ${sz} ${extraClass}">${icon ? `<i class="${icon}"></i>` : ''}${label}${iconRight ? `<i class="${iconRight}"></i>` : ''}</button>`;
}

/* ============================================================
   ROUTER
   ============================================================ */
const routes = [];
function route(path, handler, guard) { routes.push({ path, handler, guard }); }
function matchRoute() {
  const hash = window.location.hash.slice(1) || '/';
  if (hash.startsWith('/u/')) { renderPublicPortfolio(document.getElementById('app'), hash.slice(3)); return; }
  for (const r of [...routes].sort((a, b) => b.path.length - a.path.length)) {
    if (r.path === hash || (r.path !== '/' && hash.startsWith(r.path))) {
      if (r.guard && !r.guard()) return;
      const app = document.getElementById('app');
      app.innerHTML = ''; app.classList.remove('page-transition'); void app.offsetWidth; app.classList.add('page-transition');
      r.handler(app); window.scrollTo(0, 0); return;
    }
  }
  document.getElementById('app').innerHTML = `<div class="min-h-screen flex items-center justify-center flex-col gap-4"><div class="font-serif text-6xl">404</div><p class="text-[color:var(--text-muted)]">This page wandered off.</p><a href="#/" class="btn btn-primary">Back home</a></div>`;
}
window.addEventListener('hashchange', matchRoute);

/* ============================================================
   SHARED LAYOUTS
   ============================================================ */
function topNav(active = '') {
  const links = [{ href: '#/', label: 'Home', key: 'home' }, { href: '#/demo', label: 'Demo', key: 'demo' }, { href: '#/login', label: 'Sign in', key: 'login' }];
  return `<header class="sticky top-0 z-40" style="backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:color-mix(in srgb, var(--bg) 80%, transparent);border-bottom:1px solid var(--border);"><div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"><a href="#/" class="flex items-center gap-2.5"><div class="logo-mark">F</div><span class="font-semibold text-[15px] tracking-tight">Folio</span></a><nav class="hidden md:flex items-center gap-1">${links.map(l => `<a href="${l.href}" class="nav-item ${active === l.key ? 'active' : ''}">${l.label}</a>`).join('')}</nav><div class="flex items-center gap-2"><button onclick="toggleTheme()" class="btn btn-ghost btn-icon" title="Toggle theme"><i class="fas ${appState.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i></button>${currentUser() ? btn('Dashboard', { variant: 'primary', size: 'sm', onClick: "location.hash='#/dashboard'" }) : btn('Get started', { variant: 'primary', size: 'sm', onClick: "location.hash='#/register'" })}</div></div></header>`;
}
function footer() {
  return `<footer class="border-t mt-32" style="border-color:var(--border);"><div class="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6"><div class="flex items-center gap-2.5"><div class="logo-mark" style="width:24px;height:24px;font-size:13px;border-radius:7px;">F</div><span class="text-sm text-[color:var(--text-muted)]">Folio — Crafted for makers.</span></div><div class="flex items-center gap-6 text-sm text-[color:var(--text-muted)]"><a href="#/" class="hover:text-[color:var(--text)] transition-colors">Home</a><a href="#/demo" class="hover:text-[color:var(--text)] transition-colors">Demo</a><a href="#/register" class="hover:text-[color:var(--text)] transition-colors">Sign up</a><a href="#/login" class="hover:text-[color:var(--text)] transition-colors">Sign in</a></div></div></footer>`;
}

function dashboardLayout(activeKey, contentHtml) {
  const user = currentUser(); const portfolio = currentPortfolio(); const completion = calcCompletion(portfolio);
  return `<div class="min-h-screen flex"><aside class="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-r p-4" style="border-color:var(--border);background:var(--bg);"><a href="#/dashboard" class="flex items-center gap-2.5 px-2 py-2 mb-6"><div class="logo-mark">F</div><span class="font-semibold tracking-tight">Folio</span></a><nav class="flex-1 space-y-1"><a href="#/dashboard" class="nav-item ${activeKey === 'dashboard' ? 'active' : ''}"><i class="fas fa-gauge-high"></i> Dashboard</a><a href="#/portfolio" class="nav-item ${activeKey === 'portfolio' ? 'active' : ''}"><i class="fas fa-globe"></i> My Portfolio</a><a href="#/edit" class="nav-item ${activeKey === 'edit' ? 'active' : ''}"><i class="fas fa-pen-to-square"></i> Edit Portfolio</a><a href="#/settings" class="nav-item ${activeKey === 'settings' ? 'active' : ''}"><i class="fas fa-gear"></i> Settings</a></nav><div class="card p-4 mb-3"><div class="flex items-center gap-3"><div class="relative w-12 h-12"><svg class="absolute inset-0 -rotate-90" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg-2)" stroke-width="4"/><circle cx="24" cy="24" r="20" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="${125.66 * (1 - completion / 100)}"/></svg><div class="absolute inset-0 flex items-center justify-center text-xs font-bold">${completion}%</div></div><div><div class="text-xs font-semibold">Profile strength</div><div class="text-[11px]" style="color:var(--text-muted);">${completion < 50 ? 'Keep going' : completion < 100 ? 'Almost there' : 'Complete'}</div></div></div></div><div class="card p-3 flex items-center gap-3"><div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style="background:var(--accent-soft);color:var(--accent);">${user.firstName.charAt(0)}${user.lastName.charAt(0)}</div><div class="flex-1 min-w-0"><div class="text-sm font-semibold truncate">${user.firstName} ${user.lastName}</div><div class="text-[11px] truncate" style="color:var(--text-muted);">@${user.username}</div></div></div><button onclick="confirmLogout()" class="nav-item mt-1" style="color:var(--danger);"><i class="fas fa-arrow-right-from-bracket"></i> Logout</button></aside><div class="md:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 border-b" style="border-color:var(--border);background:var(--bg);"><a href="#/dashboard" class="flex items-center gap-2"><div class="logo-mark" style="width:24px;height:24px;font-size:13px;">F</div><span class="font-semibold text-sm">Folio</span></a><button onclick="toggleMobileNav()" class="btn btn-ghost btn-icon"><i class="fas fa-bars"></i></button></div><div id="mobile-nav" class="hidden md:hidden fixed inset-0 z-40" style="background:rgba(0,0,0,.6);backdrop-filter:blur(8px);" onclick="if(event.target===this)toggleMobileNav()"><div class="absolute right-0 top-0 bottom-0 w-72 p-4 card rounded-none rounded-l-2xl" style="background:var(--bg);"><div class="flex items-center justify-between mb-6"><span class="font-semibold">Menu</span><button onclick="toggleMobileNav()" class="btn btn-ghost btn-icon"><i class="fas fa-xmark"></i></button></div><nav class="space-y-1"><a href="#/dashboard" class="nav-item ${activeKey === 'dashboard' ? 'active' : ''}" onclick="toggleMobileNav()"><i class="fas fa-gauge-high"></i> Dashboard</a><a href="#/portfolio" class="nav-item ${activeKey === 'portfolio' ? 'active' : ''}" onclick="toggleMobileNav()"><i class="fas fa-globe"></i> My Portfolio</a><a href="#/edit" class="nav-item ${activeKey === 'edit' ? 'active' : ''}" onclick="toggleMobileNav()"><i class="fas fa-pen-to-square"></i> Edit Portfolio</a><a href="#/settings" class="nav-item ${activeKey === 'settings' ? 'active' : ''}" onclick="toggleMobileNav()"><i class="fas fa-gear"></i> Settings</a><button onclick="confirmLogout()" class="nav-item w-full" style="color:var(--danger);"><i class="fas fa-arrow-right-from-bracket"></i> Logout</button></nav></div></div><main class="flex-1 md:ml-64 pt-14 md:pt-0"><div class="max-w-5xl mx-auto px-6 py-10">${contentHtml}</div></main></div>`;
}
function toggleMobileNav() { document.getElementById('mobile-nav').classList.toggle('hidden'); }
function confirmLogout() { openModal(`<div class="card p-8 max-w-sm w-full animate-scale-in"><div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(248,113,113,.1);color:var(--danger);"><i class="fas fa-arrow-right-from-bracket"></i></div><h3 class="text-lg font-bold mb-1">Sign out?</h3><p class="text-sm mb-6" style="color:var(--text-muted);">You'll need to sign in again to access your portfolio.</p><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="btn btn-ghost">Cancel</button><button onclick="doLogout()" class="btn btn-danger">Sign out</button></div></div>`); }
function doLogout() { logout(); closeModal(); toast('info', 'Signed out', 'See you soon'); location.hash = '#/'; }
function calcCompletion(p) {
  if (!p) return 0;
  const checks = [p.profile.picture, p.profile.fullName, p.profile.jobTitle, p.profile.bio, p.profile.about, p.profile.location, p.profile.email, p.skills.length > 0, p.projects.length > 0, p.experience.length > 0, p.education.length > 0, p.certificates.length > 0, p.social.github || p.social.linkedin || p.social.twitter, p.resume];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ============================================================
   PAGES
   ============================================================ */

// 1. Landing Page
function renderLanding(app) {
  app.innerHTML = `<div class="min-h-screen relative overflow-x-hidden">${topNav('home')}<section class="relative pt-32 pb-24 px-6 overflow-hidden"><div class="hero-grid"></div><div class="orb" style="width:500px;height:500px;background:#ff6b4a;top:-100px;right:-100px;"></div><div class="orb" style="width:400px;height:400px;background:#4a90ff;bottom:-100px;left:-100px;animation-delay:-7s;opacity:.25"></div><div class="max-w-5xl mx-auto relative text-center"><div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium animate-fade-in" style="background:var(--card);border:1px solid var(--border);"><span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:var(--success);"></span><span style="color:var(--text-muted);">v1.0 — now in public beta</span></div><h1 class="mt-8 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] animate-fade-in" style="animation-delay:.1s;">Build a portfolio that<br/><span class="font-serif italic font-normal" style="color:var(--accent);">opens doors.</span></h1><p class="mt-6 text-lg md:text-xl max-w-2xl mx-auto animate-fade-in" style="color:var(--text-muted);animation-delay:.2s;">Folio turns your work, experience, and story into a polished personal site — without touching code or a template. Designed for developers, designers, and creatives who care about craft.</p><div class="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style="animation-delay:.3s;">${btn('Start building — free', { variant: 'primary', size: 'lg', iconRight: 'fa-arrow-right', onClick: "location.hash='#/register'" })}${btn('View live demo', { variant: 'secondary', size: 'lg', icon: 'fa-play', onClick: "location.hash='#/demo'" })}</div><p class="mt-4 text-xs animate-fade-in" style="color:var(--text-dim);animation-delay:.4s;">No credit card · 2-minute setup · Export-ready</p></div><div class="max-w-5xl mx-auto mt-20 relative animate-scale-in" style="animation-delay:.5s;"><div class="card p-2 rounded-2xl" style="box-shadow:0 40px 80px -20px rgba(0,0,0,.7);"><div class="rounded-xl overflow-hidden" style="background:var(--bg-2);"><div class="h-9 flex items-center gap-2 px-4" style="border-bottom:1px solid var(--border);"><span class="w-2.5 h-2.5 rounded-full" style="background:#ff5f56;"></span><span class="w-2.5 h-2.5 rounded-full" style="background:#ffbd2e;"></span><span class="w-2.5 h-2.5 rounded-full" style="background:#27c93f;"></span><span class="ml-3 text-xs font-mono" style="color:var(--text-dim);">alex.folio.app</span></div><div class="p-8 md:p-12 text-left"><div class="flex items-start justify-between flex-wrap gap-4"><div><div class="text-xs font-mono mb-2" style="color:var(--accent);">// PORTFOLIO</div><h2 class="text-3xl md:text-4xl font-bold tracking-tight">Alex Morgan</h2><p class="mt-1 text-[color:var(--text-muted)]">Senior Product Designer · San Francisco</p></div><div class="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl" style="background:linear-gradient(135deg,var(--accent),#ff8569);color:#fff;">AM</div></div><p class="mt-6 max-w-xl text-[15px] leading-relaxed text-[color:var(--text-muted)]">Designing thoughtful digital products at the intersection of craft, technology, and human needs.</p><div class="mt-6 flex flex-wrap gap-2"><span class="tag">Product Design</span><span class="tag">Figma</span><span class="tag">Design Systems</span><span class="tag">Prototyping</span></div><div class="mt-8 grid md:grid-cols-3 gap-4">${['Helio Analytics', 'Northwind Mobile', 'Atlas Design System'].map((t, i) => `<div class="card card-hover p-4"><div class="h-24 rounded-lg mb-3" style="background:linear-gradient(135deg,hsl(${i * 60 + 10},70%,55%),hsl(${i * 60 + 40},70%,45%));"></div><div class="text-sm font-semibold">${t}</div><div class="text-xs mt-1" style="color:var(--text-dim);">2024</div></div>`).join('')}</div></div></div></div></div></section><section class="border-y py-12 px-6 reveal" style="border-color:var(--border);"><div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">${[{ n: '12k+', l: 'Portfolios built' }, { n: '3 min', l: 'Average setup time' }, { n: '98%', l: 'Would recommend' }, { n: '0$', l: 'To get started' }].map(s => `<div><div class="font-serif text-4xl md:text-5xl" style="color:var(--accent);">${s.n}</div><div class="mt-1 text-sm" style="color:var(--text-muted);">${s.l}</div></div>`).join('')}</div></section><section class="py-24 px-6 reveal"><div class="max-w-5xl mx-auto"><div class="text-center max-w-2xl mx-auto mb-16"><div class="text-xs font-mono mb-3" style="color:var(--accent);">// FEATURES</div><h2 class="text-4xl md:text-5xl font-bold tracking-tight">Everything you need.<br/><span style="color:var(--text-muted);">Nothing you don't.</span></h2></div><div class="grid md:grid-cols-3 gap-4">${[{ icon: 'fa-pen-to-square', title: 'Editor that gets out of the way', body: 'A focused editor with smart fields, drag-and-drop ordering, and live preview. No fighting with templates.' }, { icon: 'fa-wand-magic-sparkles', title: 'Beautiful by default', body: 'Every portfolio ships with thoughtful typography, spacing, motion, and dark mode — automatically.' }, { icon: 'fa-bolt', title: 'Live in minutes', body: 'Save once, share instantly. Your portfolio lives at a clean URL ready to send to recruiters and clients.' }, { icon: 'fa-shield-halved', title: 'Yours, signed in', body: 'Secure JWT auth keeps your data private. Edit anywhere, on any device, with auto-save.' }, { icon: 'fa-palette', title: 'Theme controls', body: 'Pick your accent, switch layouts, and toggle dark/light. Make it feel unmistakably yours.' }, { icon: 'fa-code', title: 'Clean, semantic output', body: 'The generated portfolio is fast, accessible, and SEO-friendly. No trackers, no bloat.' }].map(f => `<div class="card card-hover p-6"><div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style="background:var(--accent-soft);color:var(--accent);"><i class="fas ${f.icon}"></i></div><h3 class="font-semibold text-[15px] mb-2">${f.title}</h3><p class="text-sm leading-relaxed" style="color:var(--text-muted);">${f.body}</p></div>`).join('')}</div></div></section><section class="py-24 px-6 reveal"><div class="max-w-5xl mx-auto"><div class="text-center mb-16"><div class="text-xs font-mono mb-3" style="color:var(--accent);">// HOW IT WORKS</div><h2 class="text-4xl md:text-5xl font-bold tracking-tight">From zero to portfolio<br/><span class="font-serif italic" style="color:var(--accent);">in three steps.</span></h2></div><div class="grid md:grid-cols-3 gap-8">${[{ n: '01', t: 'Create your account', b: 'Sign up in seconds. No credit card, no setup wizard.' }, { n: '02', t: 'Fill in your details', b: 'Use our editor to add projects, skills, experience — everything.' }, { n: '03', t: 'Share your link', b: 'Get a polished portfolio at folio.app/u/yourname. Update anytime.' }].map(s => `<div class="relative"><div class="font-serif text-6xl mb-4" style="color:var(--accent);opacity:.3;">${s.n}</div><h3 class="font-semibold text-lg mb-2">${s.t}</h3><p class="text-sm leading-relaxed" style="color:var(--text-muted);">${s.b}</p></div>`).join('')}</div></div></section><section class="py-24 px-6 reveal"><div class="max-w-4xl mx-auto text-center card p-12 md:p-16 relative overflow-hidden" style="background:linear-gradient(135deg,var(--card),var(--bg-2));"><div class="orb" style="width:300px;height:300px;background:var(--accent);top:-100px;right:-100px;opacity:.2;"></div><h2 class="text-4xl md:text-5xl font-bold tracking-tight relative">Your work deserves<br/>a <span class="font-serif italic" style="color:var(--accent);">proper home.</span></h2><p class="mt-4 text-[color:var(--text-muted)] max-w-md mx-auto relative">Join 12,000+ makers who built their portfolio with Folio this month.</p><div class="mt-8 flex justify-center gap-3 relative">${btn('Get started — free', { variant: 'primary', size: 'lg', iconRight: 'fa-arrow-right', onClick: "location.hash='#/register'" })}${btn('Sign in', { variant: 'secondary', size: 'lg', onClick: "location.hash='#/login'" })}</div></div></section>${footer()}</div>`;
  initReveal();
}

// 2. Login Page
function renderLogin(app) {
  if (currentUser()) { location.hash = '#/dashboard'; return; }
  app.innerHTML = `<div class="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"><div class="hero-grid"></div><div class="orb" style="width:400px;height:400px;background:var(--accent);top:-150px;left:-150px;opacity:.25;"></div><div class="w-full max-w-md relative animate-scale-in"><a href="#/" class="flex items-center gap-2.5 justify-center mb-8"><div class="logo-mark">F</div><span class="font-semibold text-lg tracking-tight">Folio</span></a><div class="card p-8"><h1 class="text-2xl font-bold tracking-tight text-center">Welcome back</h1><p class="text-sm text-center mt-1" style="color:var(--text-muted);">Sign in to continue to your dashboard</p><form id="login-form" class="mt-8 space-y-4"><div><label class="label">Email</label><input type="email" name="email" class="input" placeholder="you@example.com" autocomplete="email" required/><div class="error-text hidden" data-error="email"></div></div><div><div class="flex items-center justify-between mb-1.5"><label class="label mb-0">Password</label><button type="button" onclick="openForgotPassword()" class="text-xs font-medium hover:underline" style="color:var(--accent);">Forgot?</button></div><div class="relative"><input type="password" name="password" id="password-input" class="input pr-11" placeholder="••••••••" autocomplete="current-password" required/><button type="button" onclick="togglePassword('password-input', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-dim)] hover:text-[color:var(--text)] transition-colors" aria-label="Toggle password"><i class="fas fa-eye"></i></button></div><div class="error-text hidden" data-error="password"></div></div><label class="flex items-center gap-2.5 cursor-pointer select-none"><div class="checkbox" id="remember-checkbox" onclick="this.classList.toggle('checked')"></div><span class="text-sm" style="color:var(--text-muted);">Remember me for 30 days</span></label><div id="login-error" class="hidden p-3 rounded-lg text-sm flex items-center gap-2" style="background:rgba(248,113,113,.1);color:var(--danger);border:1px solid rgba(248,113,113,.2);"><i class="fas fa-circle-exclamation"></i><span></span></div><button type="submit" id="login-btn" class="btn btn-primary w-full btn-lg"><span class="btn-label">Sign in</span></button></form><div class="my-6 flex items-center gap-3"><div class="h-px flex-1" style="background:var(--border);"></div><span class="text-xs" style="color:var(--text-dim);">OR</span><div class="h-px flex-1" style="background:var(--border);"></div></div><button onclick="loginDemo()" class="btn btn-secondary w-full"><i class="fas fa-bolt"></i> Continue with demo account</button><p class="mt-6 text-center text-sm" style="color:var(--text-muted);">Don't have an account? <a href="#/register" class="font-semibold hover:underline" style="color:var(--accent);">Sign up</a></p></div><p class="mt-6 text-center text-xs" style="color:var(--text-dim);">By continuing, you agree to our Terms and Privacy Policy.</p></div></div>`;
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-btn'); const label = btn.querySelector('.btn-label');
    const email = e.target.email.value.trim(); const password = e.target.password.value; const errorBox = document.getElementById('login-error');
    if (!email || !password) { errorBox.querySelector('span').textContent = 'Please fill in all fields'; errorBox.classList.remove('hidden'); return; }
    errorBox.classList.add('hidden');
    btn.disabled = true; label.innerHTML = `<span class="dot-loader"><span></span><span></span><span></span></span> Signing in...`;
    setTimeout(() => {
      const result = login(email, password);
      if (!result.ok) { btn.disabled = false; label.textContent = 'Sign in'; errorBox.querySelector('span').textContent = result.error; errorBox.classList.remove('hidden'); toast('error', 'Sign in failed', result.error); return; }
      toast('success', 'Welcome back', `Signed in as ${result.user.email}`); location.hash = '#/dashboard';
    }, 900);
  });
}

// 3. Register Page
function renderRegister(app) {
  if (currentUser()) { location.hash = '#/dashboard'; return; }
  app.innerHTML = `<div class="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"><div class="hero-grid"></div><div class="orb" style="width:400px;height:400px;background:var(--accent);bottom:-150px;right:-150px;opacity:.25;"></div><div class="w-full max-w-md relative animate-scale-in"><a href="#/" class="flex items-center gap-2.5 justify-center mb-8"><div class="logo-mark">F</div><span class="font-semibold text-lg tracking-tight">Folio</span></a><div class="card p-8"><h1 class="text-2xl font-bold tracking-tight text-center">Create your account</h1><p class="text-sm text-center mt-1" style="color:var(--text-muted);">Start building your portfolio in minutes</p><form id="register-form" class="mt-7 space-y-4"><div class="grid grid-cols-2 gap-3"><div><label class="label">First name</label><input type="text" name="firstName" class="input" placeholder="Jane" autocomplete="given-name" required/><div class="error-text hidden" data-error="firstName"></div></div><div><label class="label">Last name</label><input type="text" name="lastName" class="input" placeholder="Chen" autocomplete="family-name" required/><div class="error-text hidden" data-error="lastName"></div></div></div><div><label class="label">Username</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono" style="color:var(--text-dim);">folio.app/u/</span><input type="text" name="username" class="input pl-[110px] font-mono" placeholder="jane" autocomplete="username" required pattern="[a-zA-Z0-9_]{3,20}"/></div><div class="helper">Letters, numbers, underscores. 3–20 characters.</div><div class="error-text hidden" data-error="username"></div></div><div><label class="label">Email</label><input type="email" name="email" class="input" placeholder="you@example.com" autocomplete="email" required/><div class="error-text hidden" data-error="email"></div></div><div><label class="label">Password</label><div class="relative"><input type="password" name="password" id="reg-password" class="input pr-11" placeholder="At least 8 characters" autocomplete="new-password" required/><button type="button" onclick="togglePassword('reg-password', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-dim)] hover:text-[color:var(--text)] transition-colors" aria-label="Toggle password"><i class="fas fa-eye"></i></button></div><div class="helper" id="password-strength"></div><div class="error-text hidden" data-error="password"></div></div><div><label class="label">Confirm password</label><div class="relative"><input type="password" name="confirmPassword" id="reg-confirm" class="input pr-11" placeholder="Re-enter your password" autocomplete="new-password" required/><button type="button" onclick="togglePassword('reg-confirm', this)" class="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-dim)] hover:text-[color:var(--text)] transition-colors" aria-label="Toggle password"><i class="fas fa-eye"></i></button></div><div class="error-text hidden" data-error="confirmPassword"></div></div><div id="register-error" class="hidden p-3 rounded-lg text-sm flex items-center gap-2" style="background:rgba(248,113,113,.1);color:var(--danger);border:1px solid rgba(248,113,113,.2);"><i class="fas fa-circle-exclamation"></i><span></span></div><button type="submit" id="register-btn" class="btn btn-primary w-full btn-lg"><span class="btn-label">Create account</span></button></form><p class="mt-6 text-center text-sm" style="color:var(--text-muted);">Already have an account? <a href="#/login" class="font-semibold hover:underline" style="color:var(--accent);">Sign in</a></p></div></div></div>`;
  const pwdInput = document.querySelector('input[name="password"]');
  pwdInput.addEventListener('input', (e) => {
    const v = e.target.value; const el = document.getElementById('password-strength');
    if (!v) { el.textContent = ''; return; }
    let score = 0; if (v.length >= 8) score++; if (/[A-Z]/.test(v)) score++; if (/[0-9]/.test(v)) score++; if (/[^A-Za-z0-9]/.test(v)) score++;
    const labels = ['Weak', 'Fair', 'Good', 'Strong']; const colors = ['var(--danger)', 'var(--warning)', 'var(--accent)', 'var(--success)'];
    el.innerHTML = `<span style="color:${colors[score - 1]};font-weight:600;">${labels[score - 1]}</span> password`;
  });
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.target)); const errBox = document.getElementById('register-error'); const btn = document.getElementById('register-btn'); const label = btn.querySelector('.btn-label');
    document.querySelectorAll('[data-error]').forEach(el => { el.classList.add('hidden'); el.textContent = ''; }); document.querySelectorAll('.input').forEach(i => i.classList.remove('error')); errBox.classList.add('hidden');
    let hasError = false; const showErr = (name, msg) => { const el = document.querySelector(`[data-error="${name}"]`); if (el) { el.textContent = msg; el.classList.remove('hidden'); } const input = document.querySelector(`[name="${name}"]`); if (input) input.classList.add('error'); hasError = true; };
    if (data.firstName.trim().length < 1) showErr('firstName', 'First name is required');
    if (data.lastName.trim().length < 1) showErr('lastName', 'Last name is required');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) showErr('username', '3–20 letters, numbers, or underscores');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) showErr('email', 'Enter a valid email');
    if (data.password.length < 8) showErr('password', 'At least 8 characters');
    if (data.password !== data.confirmPassword) showErr('confirmPassword', 'Passwords do not match');
    if (hasError) return;
    btn.disabled = true; label.innerHTML = `<span class="dot-loader"><span></span><span></span><span></span></span> Creating account...`;
    setTimeout(() => {
      const result = register(data);
      if (!result.ok) { btn.disabled = false; label.textContent = 'Create account'; errBox.querySelector('span').textContent = result.error; errBox.classList.remove('hidden'); toast('error', 'Registration failed', result.error); return; }
      toast('success', 'Welcome to Folio', 'Your account is ready'); location.hash = '#/dashboard';
    }, 900);
  });
}

// 4. Dashboard Home
function renderDashboard(app) {
  const user = currentUser(); const portfolio = currentPortfolio(); const completion = calcCompletion(portfolio);
  app.innerHTML = dashboardLayout('dashboard', `<div class="mb-8 animate-fade-in"><h1 class="text-3xl font-bold tracking-tight">Good to see you, ${user.firstName}.</h1><p class="mt-1" style="color:var(--text-muted);">Here's where your portfolio stands today.</p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">${[{ label: 'Completion', value: completion + '%', icon: 'fa-chart-pie', accent: true }, { label: 'Projects', value: portfolio.projects.length, icon: 'fa-folder-open' }, { label: 'Skills', value: portfolio.skills.length, icon: 'fa-bolt' }, { label: 'Experience', value: portfolio.experience.length, icon: 'fa-briefcase' }].map(s => `<div class="card p-5"><div class="flex items-center justify-between mb-3"><div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style="background:${s.accent ? 'var(--accent-soft)' : 'var(--bg-2)'};color:${s.accent ? 'var(--accent)' : 'var(--text-muted)'};"><i class="fas ${s.icon}"></i></div></div><div class="text-2xl font-bold">${s.value}</div><div class="text-xs mt-1" style="color:var(--text-muted);">${s.label}</div></div>`).join('')}</div><div class="grid md:grid-cols-3 gap-4 mb-8"><div class="card p-6 md:col-span-2"><div class="flex items-center gap-2 mb-3"><i class="fas fa-link text-xs" style="color:var(--accent);"></i><span class="text-xs font-mono" style="color:var(--text-muted);">YOUR PUBLIC URL</span></div><div class="flex items-center gap-2"><code class="flex-1 font-mono text-sm p-3 rounded-lg truncate" style="background:var(--bg-2);color:var(--text);">folio.app/u/${user.username}</code><button onclick="copyShareLink('${user.username}')" class="btn btn-secondary btn-icon" title="Copy link"><i class="fas fa-copy"></i></button><a href="#/u/${user.username}" class="btn btn-primary"><i class="fas fa-arrow-up-right-from-square"></i> Open</a></div><p class="text-xs mt-3" style="color:var(--text-dim);">Anyone with this link can view your portfolio. Update anytime from the editor.</p></div><div class="card p-6"><div class="text-xs font-mono mb-2" style="color:var(--text-muted);">QUICK ACTIONS</div><div class="space-y-2"><a href="#/edit" class="nav-item"><i class="fas fa-pen-to-square"></i> Edit portfolio</a><a href="#/edit#section-skills" class="nav-item"><i class="fas fa-plus"></i> Add a skill</a><a href="#/edit#section-projects" class="nav-item"><i class="fas fa-plus"></i> Add a project</a></div></div></div><div class="card p-6"><h2 class="font-semibold mb-1">Finish your portfolio</h2><p class="text-sm mb-5" style="color:var(--text-muted);">A complete portfolio gets 3x more views. Tick these off:</p><div class="space-y-2">${[{ ok: !!portfolio.profile.picture, label: 'Upload a profile picture' }, { ok: !!portfolio.profile.about, label: 'Write your about section' }, { ok: portfolio.projects.length >= 3, label: 'Add at least 3 projects' }, { ok: portfolio.skills.length >= 5, label: 'Add at least 5 skills' }, { ok: !!portfolio.resume, label: 'Upload your resume' }, { ok: !!portfolio.social.github || !!portfolio.social.linkedin, label: 'Connect a social link' }].map(c => `<div class="flex items-center gap-3 p-2.5 rounded-lg" style="background:${c.ok ? 'rgba(74,222,128,.05)' : 'var(--bg-2)'};"><div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style="background:${c.ok ? 'var(--success)' : 'var(--card)'};color:${c.ok ? '#000' : 'var(--text-dim)'};">${c.ok ? '<i class="fas fa-check"></i>' : '<i class="fas fa-circle text-[6px]"></i>'}</div><span class="text-sm ${c.ok ? 'line-through' : ''}" style="color:${c.ok ? 'var(--text-muted)' : 'var(--text)'};">${c.label}</span></div>`).join('')}</div></div>`);
}

// 5. Edit Portfolio Page
function renderEdit(app) {
  const p = currentPortfolio();
  app.innerHTML = dashboardLayout('edit', `<div class="mb-6"><h1 class="text-3xl font-bold tracking-tight">Edit your portfolio</h1><p class="mt-1" style="color:var(--text-muted);">Changes save automatically. Use the sections below to build your story.</p></div><div class="sticky top-0 z-20 -mx-6 px-6 py-3 mb-6 flex gap-1 overflow-x-auto scrollbar-hide" style="background:var(--bg);border-bottom:1px solid var(--border);">${['Profile', 'About', 'Skills', 'Projects', 'Experience', 'Education', 'Certificates', 'Social', 'Contact', 'Resume'].map((s, i) => `<a href="#section-${s.toLowerCase()}" class="tab ${i === 0 ? 'active' : ''}" onclick="setActiveTab(this)">${s}</a>`).join('')}</div><div class="space-y-6">${renderProfileSection(p)}${renderAboutSection(p)}${renderSkillsSection(p)}${renderProjectsSection(p)}${renderExperienceSection(p)}${renderEducationSection(p)}${renderCertificatesSection(p)}${renderSocialSection(p)}${renderContactSection(p)}${renderResumeSection(p)}</div><div class="mt-8 flex flex-wrap gap-3 justify-between items-center card p-4 sticky bottom-4" style="box-shadow:0 -8px 24px -8px rgba(0,0,0,.4);"><div class="text-xs" style="color:var(--text-muted);"><i class="fas fa-circle-check" style="color:var(--success);"></i> All changes saved automatically</div><div class="flex gap-2"><a href="#/portfolio" class="btn btn-secondary btn-sm"><i class="fas fa-eye"></i> Preview</a><a href="#/u/${currentUser().username}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-arrow-up-right-from-square"></i> View public</a></div></div>`);
}

// Edit Sections
function renderProfileSection(p) {
  const pic = p.profile.picture;
  return `<section id="section-profile" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-5"><div><h2 class="font-semibold">Profile</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">The headline of your portfolio</p></div><span class="badge"><i class="fas fa-circle text-[6px]" style="color:var(--success);"></i> Auto-saved</span></div><div class="flex flex-col md:flex-row gap-6"><div class="md:w-48 flex flex-col items-center"><div class="w-32 h-32 rounded-full overflow-hidden mb-3 flex items-center justify-center" style="background:var(--bg-2);border:1px solid var(--border);">${pic ? `<img src="${pic}" class="w-full h-full object-cover" alt="Profile"/>` : `<i class="fas fa-user text-3xl" style="color:var(--text-dim);"></i>`}</div><label class="upload-area w-full text-xs cursor-pointer" style="padding:10px;"><i class="fas fa-camera mb-1"></i><br/>Upload photo<input type="file" accept="image/*" class="hidden" onchange="handleProfilePicture(event)"/></label>${pic ? `<button onclick="removeProfilePicture()" class="text-xs mt-2" style="color:var(--danger);">Remove</button>` : ''}</div><div class="flex-1 grid md:grid-cols-2 gap-4"><div><label class="label">Full name</label><input class="input" data-field="profile.fullName" value="${escapeAttr(p.profile.fullName)}" oninput="updateField(this)"/></div><div><label class="label">Job title</label><input class="input" data-field="profile.jobTitle" value="${escapeAttr(p.profile.jobTitle)}" placeholder="e.g. Senior Designer" oninput="updateField(this)"/></div><div class="md:col-span-2"><label class="label">Short bio</label><input class="input" data-field="profile.bio" value="${escapeAttr(p.profile.bio)}" placeholder="One line that describes you" oninput="updateField(this)"/><div class="helper">Shown in your hero. Keep it punchy.</div></div><div><label class="label">Location</label><input class="input" data-field="profile.location" value="${escapeAttr(p.profile.location)}" placeholder="City, Country" oninput="updateField(this)"/></div><div class="md:col-span-2"><label class="label">Availability Status</label><div class="grid grid-cols-2 gap-3"><div onclick="updateAvailability('open')" class="card p-3 text-center text-sm font-medium cursor-pointer transition-all" style="border: 1px solid ${p.profile.availability === 'open' ? 'var(--accent)' : 'var(--border)'}; background: ${p.profile.availability === 'open' ? 'var(--accent-soft)' : 'transparent'};"><i class="fas fa-circle-check mr-1.5" style="color: ${p.profile.availability === 'open' ? 'var(--success)' : 'var(--text-muted)'};"></i> Available for Work</div><div onclick="updateAvailability('closed')" class="card p-3 text-center text-sm font-medium cursor-pointer transition-all" style="border: 1px solid ${p.profile.availability === 'closed' ? 'var(--accent)' : 'var(--border)'}; background: ${p.profile.availability === 'closed' ? 'var(--accent-soft)' : 'transparent'};"><i class="fas fa-circle-xmark mr-1.5" style="color: ${p.profile.availability === 'closed' ? 'var(--danger)' : 'var(--text-muted)'};"></i> Not Available</div></div></div></div></div></section>`;
}
function renderAboutSection(p) {
  return `<section id="section-about" class="card p-6 section-anchor"><h2 class="font-semibold mb-1">About</h2><p class="text-xs mb-4" style="color:var(--text-muted);">Tell your story in a paragraph or two</p><textarea class="textarea" data-field="profile.about" placeholder="I'm a ... with a passion for ..." oninput="updateField(this)" style="min-height:140px;">${escapeAttr(p.profile.about)}</textarea><div class="helper">Markdown not supported. Plain text works best.</div></section>`;
}
function renderSkillsSection(p) {
  return `<section id="section-skills" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold">Skills</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">Add up to 12 skills with proficiency</p></div><button onclick="addSkill()" class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add skill</button></div><div id="skills-list" class="space-y-2">${p.skills.length === 0 ? `<div class="text-center py-8 text-sm" style="color:var(--text-dim);">No skills yet. Add your first one.</div>` : p.skills.map((s, i) => `<div class="flex items-center gap-3 p-3 rounded-lg" style="background:var(--bg-2);"><input class="input flex-1" placeholder="Skill name" value="${escapeAttr(s.name)}" oninput="updateSkill(${i},'name',this.value)"/><div class="flex items-center gap-2 w-40"><input type="range" min="0" max="100" value="${s.level}" oninput="updateSkill(${i},'level',this.value);document.getElementById('skill-val-${i}').textContent=this.value+'%'" class="flex-1" style="accent-color:var(--accent);"/><span id="skill-val-${i}" class="text-xs font-mono w-10 text-right">${s.level}%</span></div><button onclick="removeSkill(${i})" class="btn btn-ghost btn-icon" style="color:var(--danger);"><i class="fas fa-trash"></i></button></div>`).join('')}</div></section>`;
}
function renderProjectsSection(p) {
  return `<section id="section-projects" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold">Projects</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">Showcase your best work</p></div><button onclick="addProject()" class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add project</button></div><div id="projects-list" class="space-y-4">${p.projects.length === 0 ? `<div class="text-center py-8 text-sm" style="color:var(--text-dim);">No projects yet.</div>` : p.projects.map((proj, i) => `<div class="rounded-xl p-4" style="background:var(--bg-2);border:1px solid var(--border);"><div class="flex items-center justify-between mb-3"><span class="text-xs font-mono" style="color:var(--text-muted);">PROJECT ${String(i + 1).padStart(2, '0')}</span><button onclick="removeProject(${i})" class="btn btn-ghost btn-sm" style="color:var(--danger);"><i class="fas fa-trash"></i> Remove</button></div><div class="grid md:grid-cols-2 gap-3 mb-3"><input class="input" placeholder="Project title" value="${escapeAttr(proj.title)}" oninput="updateProject(${i},'title',this.value)"/><input class="input" placeholder="External link (optional)" value="${escapeAttr(proj.link)}" oninput="updateProject(${i},'link',this.value)"/></div><textarea class="textarea mb-3" placeholder="What did you build? What was the impact?" oninput="updateProject(${i},'description',this.value)" style="min-height:70px;">${escapeAttr(proj.description)}</textarea><div class="grid md:grid-cols-2 gap-3"><div><input class="input mb-2" placeholder="Image URL (optional)" value="${escapeAttr(proj.image || '')}" oninput="updateProject(${i},'image',this.value)"/><input class="input" placeholder="Tags (comma-separated)" value="${(proj.tags || []).join(', ')}" oninput="updateProject(${i},'tags',this.value)"/></div>${proj.image ? `<div class="h-24 rounded-lg overflow-hidden" style="background:var(--bg);"><img src="${proj.image}" class="w-full h-full object-cover" onerror="this.style.display='none'"/></div>` : ''}</div></div>`).join('')}</div></section>`;
}
function renderExperienceSection(p) {
  return `<section id="section-experience" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold">Work experience</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">Your most recent roles</p></div><button onclick="addExperience()" class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add role</button></div><div class="space-y-4">${p.experience.length === 0 ? `<div class="text-center py-8 text-sm" style="color:var(--text-dim);">No experience added.</div>` : p.experience.map((e, i) => `<div class="rounded-xl p-4" style="background:var(--bg-2);border:1px solid var(--border);"><div class="flex items-center justify-between mb-3"><span class="text-xs font-mono" style="color:var(--text-muted);">ROLE ${String(i + 1).padStart(2, '0')}</span><button onclick="removeExperience(${i})" class="btn btn-ghost btn-sm" style="color:var(--danger);"><i class="fas fa-trash"></i></button></div><div class="grid md:grid-cols-2 gap-3 mb-3"><input class="input" placeholder="Company" value="${escapeAttr(e.company)}" oninput="updateExperience(${i},'company',this.value)"/><input class="input" placeholder="Role" value="${escapeAttr(e.role)}" oninput="updateExperience(${i},'role',this.value)"/></div><div class="grid md:grid-cols-2 gap-3 mb-3"><div><label class="label text-xs">Start</label><input type="month" class="input" value="${e.startDate || ''}" oninput="updateExperience(${i},'startDate',this.value)"/></div><div><label class="label text-xs">End (or "Present")</label><input type="text" class="input" placeholder="2024-12 or Present" value="${escapeAttr(e.endDate)}" oninput="updateExperience(${i},'endDate',this.value)"/></div></div><textarea class="textarea" placeholder="What did you do? What did you achieve?" oninput="updateExperience(${i},'description',this.value)" style="min-height:70px;">${escapeAttr(e.description)}</textarea></div>`).join('')}</div></section>`;
}
function renderEducationSection(p) {
  return `<section id="section-education" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold">Education</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">Schools, bootcamps, programs</p></div><button onclick="addEducation()" class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add</button></div><div class="space-y-4">${p.education.length === 0 ? `<div class="text-center py-8 text-sm" style="color:var(--text-dim);">No education added.</div>` : p.education.map((e, i) => `<div class="rounded-xl p-4" style="background:var(--bg-2);border:1px solid var(--border);"><div class="flex items-center justify-between mb-3"><span class="text-xs font-mono" style="color:var(--text-muted);">EDUCATION ${String(i + 1).padStart(2, '0')}</span><button onclick="removeEducation(${i})" class="btn btn-ghost btn-sm" style="color:var(--danger);"><i class="fas fa-trash"></i></button></div><div class="grid md:grid-cols-2 gap-3 mb-3"><input class="input" placeholder="School" value="${escapeAttr(e.school)}" oninput="updateEducation(${i},'school',this.value)"/><input class="input" placeholder="Degree / Program" value="${escapeAttr(e.degree)}" oninput="updateEducation(${i},'degree',this.value)"/></div><div class="grid md:grid-cols-2 gap-3 mb-3"><input class="input" placeholder="Start year" value="${escapeAttr(e.startDate)}" oninput="updateEducation(${i},'startDate',this.value)"/><input class="input" placeholder="End year" value="${escapeAttr(e.endDate)}" oninput="updateEducation(${i},'endDate',this.value)"/></div><textarea class="textarea" placeholder="Optional description" oninput="updateEducation(${i},'description',this.value)" style="min-height:60px;">${escapeAttr(e.description)}</textarea></div>`).join('')}</div></section>`;
}
function renderCertificatesSection(p) {
  return `<section id="section-certificates" class="card p-6 section-anchor"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold">Certificates</h2><p class="text-xs mt-0.5" style="color:var(--text-muted);">Showcase your certifications and awards</p></div><button onclick="addCertificate()" class="btn btn-secondary btn-sm"><i class="fas fa-plus"></i> Add</button></div><div class="space-y-3">${p.certificates.length === 0 ? `<div class="text-center py-8 text-sm" style="color:var(--text-dim);">No certificates added.</div>` : p.certificates.map((c, i) => `<div class="rounded-xl p-4" style="background:var(--bg-2);border:1px solid var(--border);"><div class="flex items-center justify-between mb-3"><span class="text-xs font-mono" style="color:var(--text-muted);">CERTIFICATE ${String(i + 1).padStart(2, '0')}</span><button onclick="removeCertificate(${i})" class="btn btn-ghost btn-sm" style="color:var(--danger);"><i class="fas fa-trash"></i> Remove</button></div><div class="grid md:grid-cols-2 gap-3 mb-3"><input class="input" placeholder="Certificate name" value="${escapeAttr(c.name)}" oninput="updateCertificate(${i},'name',this.value)"/><input class="input" placeholder="Issuing organization" value="${escapeAttr(c.issuer)}" oninput="updateCertificate(${i},'issuer',this.value)"/></div><div class="grid md:grid-cols-2 gap-3"><input class="input" placeholder="Date (e.g. Jan 2024)" value="${escapeAttr(c.date)}" oninput="updateCertificate(${i},'date',this.value)"/><input class="input" placeholder="Link to certificate (optional)" value="${escapeAttr(c.link === '#' ? '' : c.link)}" oninput="updateCertificate(${i},'link',this.value)"/></div></div>`).join('')}</div></section>`;
}
function renderSocialSection(p) {
  return `<section id="section-social" class="card p-6 section-anchor"><h2 class="font-semibold mb-1">Social links</h2><p class="text-xs mb-4" style="color:var(--text-muted);">Where can people find you online?</p><div class="grid md:grid-cols-2 gap-4">${[{ k: 'github', i: 'fa-github', l: 'GitHub' }, { k: 'linkedin', i: 'fa-linkedin', l: 'LinkedIn' }, { k: 'twitter', i: 'fa-twitter', l: 'Twitter' }, { k: 'dribbble', i: 'fa-dribbble', l: 'Dribbble' }, { k: 'behance', i: 'fa-behance', l: 'Behance' }, { k: 'instagram', i: 'fa-instagram', l: 'Instagram' }].map(s => `<div><label class="label"><i class="fab ${s.i} mr-1.5"></i>${s.l}</label><input class="input" data-field="social.${s.k}" value="${escapeAttr(p.social[s.k])}" placeholder="username" oninput="updateField(this)"/></div>`).join('')}</div></section>`;
}
function renderContactSection(p) {
  return `<section id="section-contact" class="card p-6 section-anchor"><h2 class="font-semibold mb-1">Contact info</h2><p class="text-xs mb-4" style="color:var(--text-muted);">How recruiters and clients can reach you</p><div class="grid md:grid-cols-2 gap-4"><div><label class="label">Email</label><input class="input" data-field="profile.email" value="${escapeAttr(p.profile.email)}" oninput="updateField(this)"/></div><div><label class="label">Phone</label><input class="input" data-field="profile.phone" value="${escapeAttr(p.profile.phone)}" oninput="updateField(this)"/></div><div class="md:col-span-2"><label class="label">Website</label><input class="input" data-field="profile.website" value="${escapeAttr(p.profile.website)}" oninput="updateField(this)"/></div></div></section>`;
}
function renderResumeSection(p) {
  return `<section id="section-resume" class="card p-6 section-anchor"><h2 class="font-semibold mb-1">Resume</h2><p class="text-xs mb-4" style="color:var(--text-muted);">Upload a PDF for recruiters to download</p><div class="upload-area"><i class="fas fa-file-arrow-up text-2xl mb-2"></i><p class="text-sm font-medium">Click to upload or drag and drop</p><p class="text-xs mt-1" style="color:var(--text-dim);">PDF up to 5MB</p><input type="file" accept="application/pdf" class="hidden" onchange="handleResumeUpload(event)"/></div>${p.resume ? `<div class="mt-4 flex items-center justify-between p-3 rounded-lg" style="background:var(--bg-2);"><div class="flex items-center gap-3"><i class="fas fa-file-pdf" style="color:var(--danger);"></i><span class="text-sm font-medium">resume.pdf</span></div><button onclick="removeResume()" class="btn btn-ghost btn-sm" style="color:var(--danger);">Remove</button></div>` : ''}</section>`;
}

// 6. Settings Page
function renderSettings(app) {
  const user = currentUser();
  app.innerHTML = dashboardLayout('settings', `<div class="mb-6"><h1 class="text-3xl font-bold tracking-tight">Settings</h1><p class="mt-1" style="color:var(--text-muted);">Manage your account and preferences</p></div><div class="card p-6 mb-6"><h2 class="font-semibold mb-4">Account</h2><div class="grid md:grid-cols-2 gap-4"><div><label class="label">First name</label><input class="input" value="${user.firstName}" disabled/></div><div><label class="label">Last name</label><input class="input" value="${user.lastName}" disabled/></div><div><label class="label">Username</label><input class="input" value="${user.username}" disabled/></div><div><label class="label">Email</label><input class="input" value="${user.email}" disabled/></div></div><p class="text-xs mt-3" style="color:var(--text-dim);">Profile fields are locked in this demo.</p></div><div class="card p-6 mb-6"><h2 class="font-semibold mb-4">Appearance</h2><div class="flex items-center justify-between p-3 rounded-lg" style="background:var(--bg-2);"><div><div class="text-sm font-medium">Theme</div><div class="text-xs" style="color:var(--text-muted);">Switch between dark and light mode</div></div><button onclick="toggleTheme()" class="btn btn-secondary btn-sm"><i class="fas ${appState.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i> ${appState.theme === 'dark' ? 'Light' : 'Dark'}</button></div></div><div class="card p-6"><h2 class="font-semibold mb-4" style="color:var(--danger);">Danger zone</h2><button onclick="confirmDeleteAccount()" class="btn btn-danger"><i class="fas fa-trash"></i> Delete my account</button></div>`);
}

// 7. My Portfolio (Dashboard Preview)
function renderMyPortfolio(app) {
  const user = currentUser();
  app.innerHTML = dashboardLayout('portfolio', `<div class="mb-6 flex items-center justify-between flex-wrap gap-4"><div><h1 class="text-3xl font-bold tracking-tight">My Portfolio</h1><p class="mt-1" style="color:var(--text-muted);">Preview how visitors see your portfolio</p></div><div class="flex gap-2"><a href="#/edit" class="btn btn-secondary"><i class="fas fa-pen"></i> Edit</a><a href="#/u/${user.username}" target="_blank" class="btn btn-primary"><i class="fas fa-arrow-up-right-from-square"></i> Open public page</a></div></div><div class="card p-0 overflow-hidden"><iframe src="#/u/${user.username}" class="w-full" style="height: 75vh; border:0; background: var(--bg-2);"></iframe></div>`);
}

// 8. Public Portfolio View (Fixed & Enhanced)
function renderPublicPortfolio(app, username) {
  const user = appState.users.find(u => u.username === username);
  if (!user) { app.innerHTML = `<div class="min-h-screen flex items-center justify-center flex-col gap-4"><div class="font-serif text-6xl">404</div><p class="text-[color:var(--text-muted)]">This portfolio doesn't exist.</p><a href="#/" class="btn btn-primary">Back home</a></div>`; return; }
  const p = appState.portfolios[user.id] || defaultPortfolio;

  // Helper to render social links array
  const socials = [
    { k: 'github', i: 'fa-github', l: 'GitHub', url: v => `https://github.com/${v}` },
    { k: 'linkedin', i: 'fa-linkedin', l: 'LinkedIn', url: v => `https://linkedin.com/in/${v}` },
    { k: 'twitter', i: 'fa-twitter', l: 'Twitter', url: v => `https://twitter.com/${v}` },
    { k: 'dribbble', i: 'fa-dribbble', l: 'Dribbble', url: v => `https://dribbble.com/${v}` },
    { k: 'behance', i: 'fa-behance', l: 'Behance', url: v => `https://behance.net/${v}` },
    { k: 'instagram', i: 'fa-instagram', l: 'Instagram', url: v => `https://instagram.com/${v}` }
  ].filter(s => p.social[s.k]);

  app.innerHTML = `<div class="min-h-screen">
    <nav class="portfolio-nav fixed top-0 inset-x-0 z-40">
      <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#/" class="flex items-center gap-2.5"><div class="logo-mark" style="width:24px;height:24px;font-size:13px;">F</div><span class="font-semibold text-sm">Folio</span></a>
        <div class="flex items-center gap-2">
          <button onclick="toggleTheme()" class="btn btn-ghost btn-icon"><i class="fas ${appState.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i></button>
          <a href="#/register" class="btn btn-primary btn-sm">Build your own</a>
        </div>
      </div>
    </nav>
    
    <div class="pt-24">
      <div class="max-w-3xl mx-auto px-6 py-12">
        
        <!-- Hero Section -->
        <div class="animate-fade-in">
          <div class="flex items-center gap-5 mb-6 flex-col sm:flex-row text-center sm:text-left">
            <div class="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center font-serif text-4xl flex-shrink-0" style="background:linear-gradient(135deg,var(--accent),#ff8569);color:#fff;">
              ${p.profile.picture ? `<img src="${p.profile.picture}" class="w-full h-full object-cover" alt="${escapeAttr(p.profile.fullName)}"/>` : escapeHtml(p.profile.fullName.charAt(0))}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-1">
                <h1 class="text-3xl md:text-4xl font-bold tracking-tight">${escapeHtml(p.profile.fullName)}</h1>
                ${p.profile.availability === 'open' ? 
                  `<span class="badge badge-accent"><span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:var(--success);"></span> Available for Work</span>` : 
                  `<span class="badge"><i class="fas fa-circle-xmark text-[10px]" style="color:var(--danger);"></i> Not Available</span>`
                }
              </div>
              <p class="text-lg text-[color:var(--text-muted)]">${escapeHtml(p.profile.jobTitle)}</p>
            </div>
          </div>
          <p class="text-lg leading-relaxed text-center sm:text-left">${escapeHtml(p.profile.bio)}</p>
          <div class="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm" style="color:var(--text-muted);">
            ${p.profile.location ? `<span><i class="fas fa-location-dot mr-1.5"></i>${escapeHtml(p.profile.location)}</span>` : ''}
            ${p.profile.email ? `<span><i class="fas fa-envelope mr-1.5"></i>${escapeHtml(p.profile.email)}</span>` : ''}
          </div>
        </div>
        
        <hr class="my-12" style="border-color:var(--border);"/>
        
        ${p.profile.about ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-4" style="color:var(--accent);">// ABOUT</h2><p class="text-base leading-relaxed" style="color:var(--text-muted);">${escapeHtml(p.profile.about)}</p></section>` : ''}
        
        ${p.skills.length ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-4" style="color:var(--accent);">// SKILLS</h2><div class="grid md:grid-cols-2 gap-x-8 gap-y-5">${p.skills.map(s => `<div><div class="flex justify-between text-sm mb-1.5"><span class="font-medium">${escapeHtml(s.name)}</span><span class="font-mono text-xs" style="color:var(--text-muted);">${s.level}%</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:${s.level}%"></div></div></div>`).join('')}</div></section>` : ''}
        
        ${p.projects.length ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-6" style="color:var(--accent);">// PROJECTS</h2><div class="grid md:grid-cols-2 gap-4">${p.projects.map(proj => `<div class="card card-hover overflow-hidden">${proj.image ? `<div class="h-40 overflow-hidden" style="background:var(--bg-2);"><img src="${proj.image}" class="w-full h-full object-cover" onerror="this.style.display='none'"/></div>` : ''}<div class="p-5"><h3 class="font-semibold mb-1">${escapeHtml(proj.title)}</h3><p class="text-sm mb-3" style="color:var(--text-muted);">${escapeHtml(proj.description)}</p>${proj.tags && proj.tags.length ? `<div class="flex flex-wrap gap-1.5">${proj.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}${proj.link && proj.link !== '#' ? `<a href="${escapeAttr(proj.link)}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-medium mt-4" style="color:var(--accent);">View project <i class="fas fa-arrow-right text-[10px]"></i></a>` : ''}</div></div>`).join('')}</div></section>` : ''}
        
        ${p.experience.length ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-6" style="color:var(--accent);">// EXPERIENCE</h2><div class="space-y-6">${p.experience.map(e => `<div class="grid md:grid-cols-3 gap-4"><div class="text-sm font-mono" style="color:var(--text-muted);">${escapeHtml(e.startDate)} — ${escapeHtml(e.endDate)}</div><div class="md:col-span-2"><h3 class="font-semibold">${escapeHtml(e.role)}</h3><div class="text-sm mb-2" style="color:var(--accent);">${escapeHtml(e.company)}</div><p class="text-sm" style="color:var(--text-muted);">${escapeHtml(e.description)}</p></div></div>`).join('')}</div></section>` : ''}
        
        ${p.education.length ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-6" style="color:var(--accent);">// EDUCATION</h2><div class="space-y-6">${p.education.map(e => `<div class="grid md:grid-cols-3 gap-4"><div class="text-sm font-mono" style="color:var(--text-muted);">${escapeHtml(e.startDate)} — ${escapeHtml(e.endDate)}</div><div class="md:col-span-2"><h3 class="font-semibold">${escapeHtml(e.degree)}</h3><div class="text-sm mb-2" style="color:var(--accent);">${escapeHtml(e.school)}</div><p class="text-sm" style="color:var(--text-muted);">${escapeHtml(e.description)}</p></div></div>`).join('')}</div></section>` : ''}
        
        ${p.certificates.length ? `<section class="mb-16 reveal"><h2 class="text-xs font-mono mb-6" style="color:var(--accent);">// CERTIFICATES</h2><div class="grid md:grid-cols-2 gap-4">${p.certificates.map(c => `<div class="card p-5 flex items-start gap-4"><div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:var(--accent-soft);color:var(--accent);"><i class="fas fa-certificate text-lg"></i></div><div class="flex-1"><h3 class="font-semibold text-[15px] mb-0.5">${escapeHtml(c.name)}</h3><div class="text-sm mb-2" style="color:var(--text-muted);">${escapeHtml(c.issuer)}</div>${c.date ? `<div class="text-xs font-mono mb-3" style="color:var(--text-dim);">Issued: ${escapeHtml(c.date)}</div>` : ''}${c.link && c.link !== '#' ? `<a href="${escapeAttr(c.link)}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-medium" style="color:var(--accent);">View Certificate <i class="fas fa-arrow-up-right-from-square text-[10px]"></i></a>` : ''}</div></div>`).join('')}</div></section>` : ''}
        
        <section class="mb-16 reveal">
          <h2 class="text-xs font-mono mb-6" style="color:var(--accent);">// CONTACT</h2>
          <div class="card p-8 text-center">
            <h3 class="text-2xl font-bold mb-2">Let's work together.</h3>
            <p class="mb-6" style="color:var(--text-muted);">${p.profile.availability === 'open' ? 'Currently open for new opportunities and collaborations.' : 'Currently not available for new opportunities.'}</p>
            <div class="flex flex-wrap justify-center gap-3 mb-6">
              ${p.profile.email ? `<a href="mailto:${escapeAttr(p.profile.email)}" class="btn btn-primary" style="width:auto;"><i class="fas fa-envelope"></i> Email Me</a>` : ''}
              ${p.profile.phone ? `<a href="tel:${escapeAttr(p.profile.phone)}" class="btn btn-secondary" style="width:auto;"><i class="fas fa-phone"></i> ${escapeHtml(p.profile.phone)}</a>` : ''}
              ${p.profile.website ? `<a href="${escapeAttr(p.profile.website.startsWith('http') ? p.profile.website : 'https://' + p.profile.website)}" target="_blank" class="btn btn-secondary" style="width:auto;"><i class="fas fa-globe"></i> Visit Website</a>` : ''}
              ${p.resume ? `<a href="${escapeAttr(p.resume)}" target="_blank" download class="btn btn-secondary" style="width:auto;"><i class="fas fa-file-arrow-down"></i> Download Resume</a>` : ''}
            </div>
            ${socials.length ? `<div class="flex justify-center gap-3 pt-6 border-t" style="border-color:var(--border);">${socials.map(s => `<a href="${s.url(p.social[s.k])}" target="_blank" class="btn btn-ghost btn-icon" title="${s.l}"><i class="fab ${s.i} text-lg"></i></a>`).join('')}</div>` : ''}
          </div>
        </section>
        
        <footer class="py-8 text-center text-sm" style="color:var(--text-dim);">Built with <a href="#/" class="font-medium hover:underline" style="color:var(--accent);">Folio</a></footer>
      </div>
    </div>
  </div>`;
  initReveal();
}

/* ============================================================
   ACTIONS & MUTATIONS
   ============================================================ */
function loginDemo() {
  const demoEmail = 'demo@folio.app';
  if (!appState.users.find(u => u.email === demoEmail)) register({ firstName: 'Demo', lastName: 'User', username: 'demo', email: demoEmail, password: 'demo1234' });
  login(demoEmail, 'demo1234'); toast('success', 'Demo ready', 'You are now signed in as Demo User'); location.hash = '#/dashboard';
}
function togglePassword(inputId, btn) { const input = document.getElementById(inputId); const icon = btn.querySelector('i'); if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; } else { input.type = 'password'; icon.className = 'fas fa-eye'; } }
function openForgotPassword() { openModal(`<div class="card p-8 max-w-md w-full animate-scale-in"><h3 class="text-xl font-bold mb-2">Reset your password</h3><p class="text-sm mb-5" style="color:var(--text-muted);">Enter your email and we'll send you a reset link.</p><input type="email" class="input mb-4" placeholder="you@example.com" id="reset-email"/><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="btn btn-ghost">Cancel</button><button onclick="submitReset()" class="btn btn-primary">Send reset link</button></div></div>`); }
function submitReset() { const email = document.getElementById('reset-email').value.trim(); if (!email) { toast('error', 'Email required'); return; } closeModal(); toast('success', 'Check your inbox', `If an account exists for ${email}, a reset link is on its way.`); }
function copyShareLink(username) { const url = `${location.origin}${location.pathname}#/u/${username}`; navigator.clipboard.writeText(url).then(() => toast('success', 'Link copied', 'Share it anywhere')).catch(() => toast('info', 'Copy failed', 'Long-press the link to copy')); }
function setActiveTab(el) { document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); el.classList.add('active'); }

// Edit Form Helpers
function updateField(el) { const path = el.dataset.field.split('.'); const p = currentPortfolio(); let obj = p; for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]]; obj[path[path.length - 1]] = el.value; saveState(); }
function updateAvailability(val) { const p = currentPortfolio(); p.profile.availability = val; saveState(); renderEdit(document.getElementById('app')); }
function handleProfilePicture(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const p = currentPortfolio(); p.profile.picture = ev.target.result; saveState(); renderEdit(document.getElementById('app')); toast('success', 'Picture updated'); }; reader.readAsDataURL(file); }
function removeProfilePicture() { const p = currentPortfolio(); p.profile.picture = null; saveState(); renderEdit(document.getElementById('app')); }
function addSkill() { const p = currentPortfolio(); p.skills.push({ name: '', level: 80 }); saveState(); renderEdit(document.getElementById('app')); document.getElementById('section-skills').scrollIntoView(); }
function updateSkill(i, key, val) { const p = currentPortfolio(); p.skills[i][key] = key === 'level' ? parseInt(val) : val; saveState(); }
function removeSkill(i) { const p = currentPortfolio(); p.skills.splice(i, 1); saveState(); renderEdit(document.getElementById('app')); }
function addProject() { const p = currentPortfolio(); p.projects.push({ title: '', description: '', image: '', link: '', tags: [] }); saveState(); renderEdit(document.getElementById('app')); document.getElementById('section-projects').scrollIntoView(); }
function updateProject(i, key, val) { const p = currentPortfolio(); if (key === 'tags') p.projects[i].tags = val.split(',').map(t => t.trim()).filter(Boolean); else p.projects[i][key] = val; saveState(); }
function removeProject(i) { const p = currentPortfolio(); p.projects.splice(i, 1); saveState(); renderEdit(document.getElementById('app')); }
function addExperience() { const p = currentPortfolio(); p.experience.push({ company: '', role: '', startDate: '', endDate: 'Present', description: '' }); saveState(); renderEdit(document.getElementById('app')); document.getElementById('section-experience').scrollIntoView(); }
function updateExperience(i, key, val) { const p = currentPortfolio(); p.experience[i][key] = val; saveState(); }
function removeExperience(i) { const p = currentPortfolio(); p.experience.splice(i, 1); saveState(); renderEdit(document.getElementById('app')); }
function addEducation() { const p = currentPortfolio(); p.education.push({ school: '', degree: '', startDate: '', endDate: '', description: '' }); saveState(); renderEdit(document.getElementById('app')); document.getElementById('section-education').scrollIntoView(); }
function updateEducation(i, key, val) { const p = currentPortfolio(); p.education[i][key] = val; saveState(); }
function removeEducation(i) { const p = currentPortfolio(); p.education.splice(i, 1); saveState(); renderEdit(document.getElementById('app')); }
function addCertificate() { const p = currentPortfolio(); p.certificates.push({ name: '', issuer: '', date: '', link: '#' }); saveState(); renderEdit(document.getElementById('app')); document.getElementById('section-certificates').scrollIntoView(); }
function updateCertificate(i, key, val) { const p = currentPortfolio(); p.certificates[i][key] = val; saveState(); }
function removeCertificate(i) { const p = currentPortfolio(); p.certificates.splice(i, 1); saveState(); renderEdit(document.getElementById('app')); }
function handleResumeUpload(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { const p = currentPortfolio(); p.resume = ev.target.result; saveState(); renderEdit(document.getElementById('app')); toast('success', 'Resume uploaded'); }; reader.readAsDataURL(file); }
function removeResume() { const p = currentPortfolio(); p.resume = null; saveState(); renderEdit(document.getElementById('app')); }
function confirmDeleteAccount() { openModal(`<div class="card p-8 max-w-sm w-full animate-scale-in"><div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(248,113,113,.1);color:var(--danger);"><i class="fas fa-triangle-exclamation"></i></div><h3 class="text-lg font-bold mb-1">Delete account?</h3><p class="text-sm mb-6" style="color:var(--text-muted);">This will permanently delete your account and portfolio. This cannot be undone.</p><div class="flex gap-2 justify-end"><button onclick="closeModal()" class="btn btn-ghost">Cancel</button><button onclick="deleteAccount()" class="btn btn-danger">Delete forever</button></div></div>`); }
function deleteAccount() { const user = currentUser(); appState.users = appState.users.filter(u => u.id !== user.id); delete appState.portfolios[user.id]; appState.session = null; saveState(); closeModal(); toast('info', 'Account deleted'); location.hash = '#/'; }

/* ============================================================
   INIT
   ============================================================ */
route('/', renderLanding);
route('/demo', (app) => { if (!currentUser()) loginDemo(); else location.hash = '#/dashboard'; });
route('/login', renderLogin);
route('/register', renderRegister);
route('/dashboard', renderDashboard, requireAuth);
route('/portfolio', renderMyPortfolio, requireAuth);
route('/edit', renderEdit, requireAuth);
route('/settings', renderSettings, requireAuth);

matchRoute();