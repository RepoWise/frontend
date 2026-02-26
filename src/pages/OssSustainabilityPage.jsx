import { useState, useEffect, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, TrendingUp, Shield, ArrowRight, GitBranch, GitCommit, GitMerge, Code2, Braces, Terminal, Github, Users, Wrench, ExternalLink } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('oss-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// DECAL Lab Tools
const decalLabTools = [
  {
    id: 'repowise',
    name: 'RepoWise',
    tagline: 'Conversational AI for Code',
    description: 'Ask questions about any repository in natural language. RepoWise uses RAG-based retrieval to provide accurate, contextual answers about codebases.',
    color: 'emerald',
    icon: Sparkles,
    website: 'https://repowise.github.io/RepoWise-website/',
    logo: 'https://raw.githubusercontent.com/RepoWise/RepoWise-website/main/static/images/repowise-icon.png',
  },
  {
    id: 'ossprey',
    name: 'OSSPREY',
    tagline: 'Sustainability Forecasting',
    description: 'AI-driven predictions for open source project health. Analyze socio-technical networks to forecast sustainability risks before they emerge.',
    color: 'violet',
    icon: TrendingUp,
    website: 'https://oss-prey.github.io/OSSPREY-Website/',
    logo: 'https://oss-prey.github.io/OSSPREY-Website/static/images/favicon.ico',
  },
  {
    id: 'evidencebot',
    name: 'EvidenceBot',
    tagline: 'Privacy-Preserving RAG',
    description: 'Interact with LLMs while keeping your code private. EvidenceBot ensures sensitive repository data never leaves your control.',
    color: 'amber',
    icon: Shield,
    website: 'https://nafiz43.github.io/EvidenceBot/',
    logo: '/evidencebot-icon.webp',
  },
];

// Tools from Friends/Collaborators
const friendsTools = [
  {
    id: 'agentsource',
    name: 'AgentSource',
    tagline: 'AI Agents for OSS',
    description: 'Autonomous agents that help maintain and improve open source projects. Built by our collaborators to automate routine maintenance tasks.',
    color: 'cyan',
    icon: Users,
    website: 'https://www.agentsource.io/',
    logo: null, // Will use icon instead
  },
];

// Tools by Others (empty for now, placeholder for future)
const otherTools = [];

// Floating OSS Icons for background animation
const ossIcons = [
  { Icon: GitBranch, delay: 0, duration: 15, x: 8, y: 12, size: 'lg' },
  { Icon: GitCommit, delay: 2, duration: 18, x: 88, y: 20, size: 'md' },
  { Icon: GitMerge, delay: 4, duration: 16, x: 15, y: 65, size: 'lg' },
  { Icon: Code2, delay: 6, duration: 20, x: 78, y: 55, size: 'md' },
  { Icon: Braces, delay: 8, duration: 17, x: 45, y: 80, size: 'lg' },
  { Icon: Terminal, delay: 1, duration: 19, x: 92, y: 42, size: 'sm' },
  { Icon: Github, delay: 3, duration: 14, x: 25, y: 35, size: 'xl' },
  { Icon: GitBranch, delay: 5, duration: 16, x: 68, y: 75, size: 'md' },
  { Icon: Code2, delay: 7, duration: 18, x: 5, y: 45, size: 'sm' },
  { Icon: GitMerge, delay: 9, duration: 15, x: 55, y: 15, size: 'md' },
];

// Animated Background with floating OSS icons
function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/30'}`} />

      {/* Animated gradient orbs */}
      <div
        className="absolute w-[1000px] h-[1000px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 50%)',
          top: '-30%',
          left: '-20%',
          animation: 'float 30s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 50%)',
          bottom: '-20%',
          right: '-10%',
          animation: 'float 35s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, transparent 50%)',
          top: '40%',
          right: '20%',
          animation: 'float 25s ease-in-out infinite',
        }}
      />

      {/* Floating OSS Icons */}
      {ossIcons.map(({ Icon, delay, duration, x, y, size }, index) => {
        const sizeClasses = {
          sm: 'w-8 h-8 sm:w-10 sm:h-10',
          md: 'w-10 h-10 sm:w-14 sm:h-14',
          lg: 'w-14 h-14 sm:w-20 sm:h-20',
          xl: 'w-20 h-20 sm:w-28 sm:h-28',
        };
        return (
          <div
            key={index}
            className={`absolute transition-all duration-700 ${isDark ? 'text-emerald-400/[0.08]' : 'text-emerald-600/[0.08]'}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animation: `floatIcon ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <Icon className={sizeClasses[size]} strokeWidth={1} />
          </div>
        );
      })}

      {/* Subtle dot pattern */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.04]'}`}
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.02); }
          66% { transform: translate(-20px, 20px) scale(0.98); }
        }
        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-15px) rotate(3deg) scale(1.05);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-25px) rotate(-2deg) scale(1.1);
            opacity: 1;
          }
          75% {
            transform: translateY(-10px) rotate(4deg) scale(1.02);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool, index }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colorClasses = {
    emerald: {
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      text: isDark ? 'text-emerald-400' : 'text-emerald-600',
      hover: isDark ? 'hover:border-emerald-500/40 hover:bg-emerald-500/15' : 'hover:border-emerald-300 hover:bg-emerald-100/50',
    },
    violet: {
      bg: isDark ? 'bg-violet-500/10' : 'bg-violet-50',
      border: isDark ? 'border-violet-500/20' : 'border-violet-200',
      text: isDark ? 'text-violet-400' : 'text-violet-600',
      hover: isDark ? 'hover:border-violet-500/40 hover:bg-violet-500/15' : 'hover:border-violet-300 hover:bg-violet-100/50',
    },
    amber: {
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
      text: isDark ? 'text-amber-400' : 'text-amber-600',
      hover: isDark ? 'hover:border-amber-500/40 hover:bg-amber-500/15' : 'hover:border-amber-300 hover:bg-amber-100/50',
    },
    cyan: {
      bg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
      border: isDark ? 'border-cyan-500/20' : 'border-cyan-200',
      text: isDark ? 'text-cyan-400' : 'text-cyan-600',
      hover: isDark ? 'hover:border-cyan-500/40 hover:bg-cyan-500/15' : 'hover:border-cyan-300 hover:bg-cyan-100/50',
    },
    slate: {
      bg: isDark ? 'bg-slate-500/10' : 'bg-slate-50',
      border: isDark ? 'border-slate-500/20' : 'border-slate-200',
      text: isDark ? 'text-slate-400' : 'text-slate-600',
      hover: isDark ? 'hover:border-slate-500/40 hover:bg-slate-500/15' : 'hover:border-slate-300 hover:bg-slate-100/50',
    },
  };

  const colors = colorClasses[tool.color] || colorClasses.slate;
  const IconComponent = tool.icon;

  const cardContent = (
    <div className="flex items-start gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-white'} shadow-sm`}>
        {tool.logo ? (
          <img src={tool.logo} alt={tool.name} className="w-10 h-10 object-contain rounded-lg" />
        ) : (
          <IconComponent className={`w-8 h-8 ${colors.text}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{tool.name}</h3>
          {tool.comingSoon && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
              Coming Soon
            </span>
          )}
          {!tool.comingSoon && <ArrowRight className={`w-4 h-4 flex-shrink-0 ${colors.text} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all`} />}
        </div>
        <p className={`text-sm font-medium ${colors.text} mb-2`}>{tool.tagline}</p>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{tool.description}</p>
      </div>
    </div>
  );

  if (tool.comingSoon) {
    return (
      <div
        className={`group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 opacity-75 ${colors.bg} ${colors.border}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <a
      href={tool.website}
      target="_blank"
      rel="noreferrer"
      className={`group relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${colors.bg} ${colors.border} ${colors.hover}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {cardContent}
    </a>
  );
}

// Section Header Component
function SectionHeader({ icon: Icon, title, subtitle, isDark }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {Icon && (
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <Icon className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
        </div>
      )}
      <div>
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        {subtitle && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

// Main Page Component
function OssSustainabilityPageContent() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <AnimatedBackground />

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${isDark ? 'border-white/[0.06] bg-slate-950/80' : 'border-slate-200/80 bg-white/80'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="https://decallab.cs.ucdavis.edu/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>DECAL Lab</span>
            <span className={`hidden sm:inline text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>UC Davis</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-16 mb-10 sm:mb-12">
            {/* Left: Title and Description */}
            <div className="max-w-2xl">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Empowering{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Open Source
                </span>
                <br />
                Sustainability Research
              </h1>

              <p className={`text-base sm:text-lg lg:text-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Discover research tools that help developers, researchers, and organizations understand,
                analyze, and sustain open source software ecosystems through AI-powered insights.
              </p>
            </div>

            {/* Right: CTA Card */}
            <div className="lg:flex-shrink-0">
              <Link
                to="/oss-sustainability/projects"
                className={`group block p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 w-[280px] ${
                  isDark
                    ? 'bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border-white/10 hover:border-emerald-500/25'
                    : 'bg-gradient-to-br from-emerald-50/80 via-cyan-50/50 to-transparent border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <Github className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Try with UC Davis Projects
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  50+ open source repositories
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 group-hover:gap-2.5 transition-all">
                  View Projects
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* DECAL Lab Tools Section */}
        <section className={`border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            <SectionHeader
              title="DECAL Lab Tools"
              subtitle="Research tools built by our lab"
              isDark={isDark}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {decalLabTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Tools from Friends Section */}
        <section className={`border-t ${isDark ? 'border-white/[0.06] bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            <SectionHeader
              icon={Users}
              title="Tools from Our Friends"
              subtitle="Built by our collaborators and research partners"
              isDark={isDark}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {friendsTools.map((tool, index) => (
                <ToolCard key={tool.id} tool={tool} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Tools by Others Section (Placeholder) */}
        {otherTools.length > 0 && (
          <section className={`border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
              <SectionHeader
                icon={Wrench}
                title="Tools by Others"
                subtitle="Community and commercial tools for OSS sustainability"
                isDark={isDark}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {otherTools.map((tool, index) => (
                  <ToolCard key={tool.id} tool={tool} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Try with UC Davis Projects */}
        <section className={`border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
            <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 ${isDark ? 'bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-violet-500/10 border border-white/10' : 'bg-gradient-to-br from-emerald-50 via-cyan-50 to-violet-50 border border-slate-200'}`}>
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className={`inline-flex p-3 rounded-2xl mb-6 ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                  <Github className={`w-8 h-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
                </div>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Try the Tools with Real Projects
                </h2>
                <p className={`text-base sm:text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Explore 50+ UC Davis open source repositories and analyze them instantly with our research tools.
                </p>
                <Link
                  to="/oss-sustainability/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Explore UC Davis Projects
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Funding Footer */}
        <footer className={`border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            <p className={`text-xs sm:text-sm text-center mb-8 sm:mb-10 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Supported by
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-10 sm:mb-12">
              {/* NSF */}
              <a href="https://www.nsf.gov/" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img
                  src="/NSF_Logo.png"
                  alt="National Science Foundation"
                  className="h-12 sm:h-16 w-auto"
                />
              </a>

              {/* Sloan Foundation */}
              <a href="https://sloan.org/" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <img
                  src="https://sloan.org/storage/app/media/uploaded-files/Logo-2B-SMALL-Gold-Blue.png"
                  alt="Alfred P. Sloan Foundation"
                  className="h-10 sm:h-14 w-auto"
                />
              </a>

              {/* UC OSPO Network */}
              <a href="https://ucospo.net/" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800">
                  <img
                    src="https://ucospo.net/images/uc-ospo-network-logo.svg"
                    alt="UC OSPO Network"
                    className="h-8 sm:h-10 w-auto brightness-110"
                  />
                </div>
              </a>

              {/* Google */}
              <a href="https://opensource.google/" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 272 92" className="h-8 sm:h-10 w-auto">
                  <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                  <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                  <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
                  <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                  <path fill="#EA4335" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                </svg>
              </a>
            </div>

            <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm pt-6 sm:pt-8 border-t ${isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-500'}`}>
              <a href="https://decallab.cs.ucdavis.edu/" target="_blank" rel="noreferrer" className={`font-medium transition-colors ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}>
                DECAL Lab, UC Davis
              </a>
              <div className="flex items-center gap-4 sm:gap-6">
                {decalLabTools.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.website}
                    target="_blank"
                    rel="noreferrer"
                    className={`transition-colors ${
                      tool.id === 'repowise'
                        ? isDark ? 'hover:text-emerald-400' : 'hover:text-emerald-600'
                        : tool.id === 'ossprey'
                        ? isDark ? 'hover:text-violet-400' : 'hover:text-violet-600'
                        : isDark ? 'hover:text-amber-400' : 'hover:text-amber-600'
                    }`}
                  >
                    {tool.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Wrapped component with Theme Provider
function OssSustainabilityPage() {
  return (
    <ThemeProvider>
      <OssSustainabilityPageContent />
    </ThemeProvider>
  );
}

export default OssSustainabilityPage;
