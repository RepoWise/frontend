import { useState, useMemo, useEffect, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, ExternalLink, ChevronDown, X, Sun, Moon, Sparkles, TrendingUp, Shield, ArrowLeft, GitBranch, GitCommit, GitMerge, Code2, Braces, Terminal } from 'lucide-react';

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

const projects = [
  { name: 'erplab', url: 'https://github.com/ucdavis/erplab', description: 'ERP data analysis toolbox for MATLAB' },
  { name: 'wayfinding', url: 'https://github.com/ucdavis/wayfinding', description: 'Campus navigation and mapping' },
  { name: 'sitefarm_seed', url: 'https://github.com/ucdavis/sitefarm_seed', description: 'Drupal distribution for UC Davis sites' },
  { name: 'FairMLCourse', url: 'https://github.com/ucdavis/FairMLCourse', description: 'Fairness in Machine Learning course' },
  { name: 'ecs132', url: 'https://github.com/ucdavis/ecs132', description: 'Probability & statistics for CS' },
  { name: 'UCDArch', url: 'https://github.com/ucdavis/UCDArch', description: 'Architecture framework library' },
  { name: 'Walter', url: 'https://github.com/ucdavis/Walter', description: 'Water management application' },
  { name: 'VIPER', url: 'https://github.com/ucdavis/VIPER', description: 'Veterinary education platform' },
  { name: 'PolicyWonk', url: 'https://github.com/ucdavis/PolicyWonk', description: 'Policy analysis tool' },
  { name: 'app-template', url: 'https://github.com/ucdavis/app-template', description: 'Application starter template' },
  { name: 'CRU', url: 'https://github.com/ucdavis/CRU', description: 'Campus resource utility' },
  { name: 'serodynamics', url: 'https://github.com/ucdavis/serodynamics', description: 'Serological dynamics analysis' },
  { name: 'hpccf-docs', url: 'https://github.com/ucdavis/hpccf-docs', description: 'HPC cluster documentation' },
  { name: 'finjector', url: 'https://github.com/ucdavis/finjector', description: 'Financial data injection tool' },
  { name: 'payments', url: 'https://github.com/ucdavis/payments', description: 'Payment processing system' },
  { name: 'ipa-client-angular', url: 'https://github.com/ucdavis/ipa-client-angular', description: 'IPA client Angular app' },
  { name: 'software-catalog', url: 'https://github.com/ucdavis/software-catalog', description: 'Software inventory catalog' },
  { name: 'harvest-mobile', url: 'https://github.com/ucdavis/harvest-mobile', description: 'Mobile harvest tracking' },
  { name: 'lplus-lab.github.io', url: 'https://github.com/ucdavis/lplus-lab.github.io', description: 'L+ Lab website' },
  { name: 'ArgusVision', url: 'https://github.com/ucdavis/ArgusVision', description: 'Computer vision platform' },
  { name: 'readable', url: 'https://github.com/ucdavis/readable', description: 'Text readability analyzer' },
  { name: 'win', url: 'https://github.com/ucdavis/win', description: 'WIN project' },
  { name: 'CRP', url: 'https://github.com/ucdavis/CRP', description: 'Campus resource planning' },
  { name: 'gunrock-tailwind', url: 'https://github.com/ucdavis/gunrock-tailwind', description: 'Tailwind CSS for UC Davis' },
  { name: 'ANNA-AnimalHealthAnalytics', url: 'https://github.com/ucdavis/ANNA-AnimalHealthAnalytics', description: 'Animal health analytics' },
  { name: 'iwfm', url: 'https://github.com/ucdavis/iwfm', description: 'Integrated water flow model' },
  { name: 'Peaks', url: 'https://github.com/ucdavis/Peaks', description: 'Peak detection algorithms' },
  { name: 'hippo', url: 'https://github.com/ucdavis/hippo', description: 'Hippo application' },
  { name: 'ad419-charts', url: 'https://github.com/ucdavis/ad419-charts', description: 'AD419 charting tools' },
  { name: 'ECS272-Fall2022', url: 'https://github.com/ucdavis/ECS272-Fall2022', description: 'Information Visualization course' },
  { name: 'Intro-to-Desktop-GIS-with-QGIS', url: 'https://github.com/ucdavis/Intro-to-Desktop-GIS-with-QGIS', description: 'GIS workshop materials' },
  { name: 'Spatial_SQL', url: 'https://github.com/ucdavis/Spatial_SQL', description: 'Spatial SQL tutorials' },
  { name: 'workshop_intro_to_sql', url: 'https://github.com/ucdavis/workshop_intro_to_sql', description: 'SQL workshop materials' },
  { name: 'workshop_python_basics', url: 'https://github.com/ucdavis/workshop_python_basics', description: 'Python basics workshop' },
  { name: 'workshop_introduction_to_version_control', url: 'https://github.com/ucdavis/workshop_introduction_to_version_control', description: 'Version control workshop' },
  { name: 'workshop_web_maps', url: 'https://github.com/ucdavis/workshop_web_maps', description: 'Web mapping workshop' },
  { name: 'adventures_in_data_science', url: 'https://github.com/ucdavis/adventures_in_data_science', description: 'Data science learning resources' },
  { name: 'aggie-experts', url: 'https://github.com/ucdavis/aggie-experts', description: 'UC Davis expertise database' },
  { name: 'aggie-experts-deployment', url: 'https://github.com/ucdavis/aggie-experts-deployment', description: 'Aggie Experts deployment' },
  { name: 'postgres', url: 'https://github.com/ucdavis/postgres', description: 'PostgreSQL configurations' },
  { name: 'dams-deployment', url: 'https://github.com/ucdavis/dams-deployment', description: 'DAMS deployment configs' },
  { name: 'clonalvdjseq', url: 'https://github.com/ucdavis/clonalvdjseq', description: 'VDJ sequencing analysis' },
  { name: 'scRNA_shiny', url: 'https://github.com/ucdavis/scRNA_shiny', description: 'Single-cell RNA Shiny app' },
  { name: 'assemblathon2-analysis', url: 'https://github.com/ucdavis/assemblathon2-analysis', description: 'Genome assembly analysis' },
  { name: 'proc10xG', url: 'https://github.com/ucdavis/proc10xG', description: '10x Genomics processing' },
  { name: 'sickle', url: 'https://github.com/ucdavis/sickle', description: 'Quality trimming tool' },
  { name: 'sabre', url: 'https://github.com/ucdavis/sabre', description: 'Barcode demultiplexing' },
  { name: 'NeuroMabSeq', url: 'https://github.com/ucdavis/NeuroMabSeq', description: 'Neuromab sequencing pipeline' },
  { name: 'module_counter', url: 'https://github.com/ucdavis/module_counter', description: 'Module counting utility' },
  { name: 'biocore-tools', url: 'https://github.com/ucdavis/biocore-tools', description: 'Bioinformatics core tools' },
];

// Tool configurations
const tools = [
  {
    id: 'repowise',
    name: 'RepoWise',
    tagline: 'Conversational AI for Code',
    color: 'emerald',
    icon: Sparkles,
    website: 'https://repowise.github.io/RepoWise-website/',
    getUrl: (name) => `${window.location.origin}/?repo=https://github.com/ucdavis/${name}`,
    logo: 'https://raw.githubusercontent.com/RepoWise/RepoWise-website/main/static/images/repowise-icon.png',
  },
  {
    id: 'ossprey',
    name: 'OSSPREY',
    tagline: 'Sustainability Forecasting',
    color: 'violet',
    icon: TrendingUp,
    website: 'https://oss-prey.github.io/OSSPREY-Website/',
    getUrl: (name) => `https://oss-prey.github.io/OSSPREY-Website/?repo=https://github.com/ucdavis/${name}`,
    logo: 'https://oss-prey.github.io/OSSPREY-Website/static/images/favicon.ico',
  },
  {
    id: 'evidencebot',
    name: 'EvidenceBot',
    tagline: 'Privacy-Preserving RAG',
    color: 'amber',
    icon: Shield,
    website: 'https://nafiz43.github.io/EvidenceBot/',
    getUrl: (name) => `https://nafiz43.github.io/EvidenceBot/?repo=https://github.com/ucdavis/${name}`,
    logo: '/evidencebot-icon.webp',
  },
];

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

// Project Card
function ProjectCard({ project }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden ${
        isHovered
          ? isDark
            ? 'border-cyan-500/30 bg-slate-800/80 shadow-xl shadow-cyan-500/5 -translate-y-1'
            : 'border-cyan-400/50 bg-white shadow-xl shadow-cyan-500/10 -translate-y-1'
          : isDark
            ? 'border-white/[0.08] bg-slate-900/50'
            : 'border-slate-200 bg-white/80'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <Github className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
            <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.name}</h3>
          </div>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            title="View on GitHub"
          >
            <ExternalLink className={`h-3.5 w-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </a>
        </div>

        {/* Description */}
        <p className={`text-xs mb-3 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {project.description}
        </p>

        {/* Tool Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.getUrl(project.name)}
              target="_blank"
              rel="noreferrer"
              title={`Try ${tool.name}`}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 truncate ${
                tool.id === 'repowise'
                  ? isDark
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : tool.id === 'ossprey'
                  ? isDark
                    ? 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
                    : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
                  : isDark
                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
              }`}
            >
              <img src={tool.logo} alt="" className="w-3 h-3 rounded flex-shrink-0 object-contain" />
              <span className="truncate">{tool.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
function OssProjectsPageContent() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 12);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <AnimatedBackground />

      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${isDark ? 'border-white/[0.06] bg-slate-950/80' : 'border-slate-200/80 bg-white/80'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/oss-sustainability"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Tools</span>
            </Link>
            <div className={`hidden sm:block h-6 w-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <a href="https://decallab.cs.ucdavis.edu/" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>DECAL Lab</span>
              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>UC Davis</span>
            </a>
          </div>

          <div className="flex items-center gap-1">
            {/* Tool Links - Desktop */}
            <nav className="hidden md:flex items-center mr-1">
              {tools.map((tool) => (
                <a
                  key={tool.id}
                  href={tool.website}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    tool.id === 'repowise'
                      ? isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'
                      : tool.id === 'ossprey'
                      ? isDark ? 'text-violet-400 hover:bg-violet-500/10' : 'text-violet-600 hover:bg-violet-50'
                      : isDark ? 'text-amber-400 hover:bg-amber-500/10' : 'text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <img src={tool.logo} alt={tool.name} className="w-5 h-5 rounded object-contain" />
                  <span className="hidden lg:inline">{tool.name}</span>
                </a>
              ))}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Projects Section */}
        <section className={`${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            {/* Page Header */}
            <div className="mb-8 sm:mb-10">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                UC Davis Open Source Projects
              </h1>
              <p className={`text-sm sm:text-base lg:text-lg max-w-3xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Explore and analyze 50+ UC Davis open source repositories using our research tools.
                Click on any tool button to instantly analyze that project.
              </p>
            </div>

            {/* Search and Count Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 lg:w-80">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl pl-10 pr-9 py-2.5 outline-none transition-all text-sm ${
                    isDark
                      ? 'bg-slate-800/80 border border-white/[0.08] text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                  >
                    <X className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </button>
                )}
              </div>

              {/* Projects Count */}
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {displayedProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>

            {filteredProjects.length > 12 && !showAllProjects && (
              <div className="mt-8 sm:mt-10 text-center">
                <button
                  onClick={() => setShowAllProjects(true)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isDark
                      ? 'bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Show all {filteredProjects.length} projects
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>No projects found for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className={`mt-3 text-sm font-medium transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}
                >
                  Clear search
                </button>
              </div>
            )}
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
                {tools.map((tool) => (
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
function OssProjectsPage() {
  return (
    <ThemeProvider>
      <OssProjectsPageContent />
    </ThemeProvider>
  );
}

export default OssProjectsPage;
