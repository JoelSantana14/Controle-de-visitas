import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Users, 
  Building2, 
  FileText, 
  Sparkles, 
  UserPlus, 
  Download, 
  Home,
  Palette,
  Check,
  CheckSquare,
  LogOut,
  KeyRound,
  Shield,
  User,
  ChevronDown,
  Shuffle
} from 'lucide-react';
import { ThemeMode, BorderMode, AppUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewLeadModal: () => void;
  onExportData: () => void;
  onImportData: (jsonString: string) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  borderMode: BorderMode;
  setBorderMode: (mode: BorderMode) => void;
  currentUser: AppUser | null;
  isAdmin: boolean;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
  pendingDistributionCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLeadModal,
  onExportData,
  onImportData,
  theme,
  setTheme,
  borderMode,
  setBorderMode,
  currentUser,
  isAdmin,
  onOpenChangePasswordModal,
  onLogout,
  pendingDistributionCount = 0,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Funil Kanban', icon: Kanban },
    { id: 'leads', label: 'Tabela de Leads', icon: Users },
    { 
      id: 'distribution', 
      label: 'Distribuição', 
      icon: Shuffle, 
      adminOnly: true,
      badgeCount: pendingDistributionCount 
    },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'settings', label: 'Cadastros', icon: Building2, adminOnly: true },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'ai', label: 'Corretor IA', icon: Sparkles },
  ];

  const tabs = allTabs.filter(t => !t.adminOnly || isAdmin);

  const themesList: { id: ThemeMode; name: string; color: string; badge: string }[] = [
    { id: 'bordo', name: 'Bordô Nobre (Vinho)', color: 'bg-rose-900', badge: 'text-rose-300' },
    { id: 'azul', name: 'Azul Imobiliário', color: 'bg-blue-600', badge: 'text-blue-300' },
    { id: 'esmeralda', name: 'Verde Esmeralda', color: 'bg-emerald-700', badge: 'text-emerald-300' },
    { id: 'dourado', name: 'Dourado Imperial', color: 'bg-amber-600', badge: 'text-amber-300' },
  ];

  const getThemeClasses = () => {
    switch (theme) {
      case 'bordo':
        return {
          logo: 'bg-gradient-to-tr from-rose-950 via-red-900 to-rose-800 text-white shadow-rose-950/20',
          activeTab: 'bg-rose-900 text-white shadow-sm shadow-rose-900/30',
          badge: 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300',
          button: 'bg-rose-900 hover:bg-rose-800 text-white shadow-rose-900/30',
        };
      case 'esmeralda':
        return {
          logo: 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white shadow-emerald-500/20',
          activeTab: 'bg-emerald-700 text-white shadow-sm shadow-emerald-500/30',
          badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300',
          button: 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-500/30',
        };
      case 'dourado':
        return {
          logo: 'bg-gradient-to-tr from-amber-700 to-yellow-600 text-white shadow-amber-500/20',
          activeTab: 'bg-amber-600 text-white shadow-sm shadow-amber-500/30',
          badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300',
          button: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/30',
        };
      default:
        return {
          logo: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
          activeTab: 'bg-blue-600 text-white shadow-sm shadow-blue-500/30',
          badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
          button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${themeClasses.logo}`}>
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ImmoFlow
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${themeClasses.badge}`}>
                  CRM Imobiliário
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Gestão de leads, plantão, crédito e vendas
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab: any) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasBadge = Boolean(tab.badgeCount && tab.badgeCount > 0);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? themeClasses.activeTab
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {hasBadge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons & Theme Picker */}
          <div className="flex items-center gap-2 relative">
            
            {/* Theme & Border Layout Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                title="Personalizar Cores e Bordas do Layout"
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Palette className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                <span className="hidden sm:inline">
                  {theme === 'bordo' ? 'Cor Bordô' : theme.charAt(0).toUpperCase() + theme.slice(1)}
                </span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Cores do Layout
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {themesList.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            setShowThemeMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            theme === t.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                            <span>{t.name}</span>
                          </div>
                          {theme === t.id && <Check className="w-3.5 h-3.5 text-rose-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Estilo de Bordas
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setBorderMode('destacada')}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          borderMode === 'destacada'
                            ? 'border-rose-800 bg-rose-50 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        Bordas Destacadas
                      </button>
                      <button
                        onClick={() => setBorderMode('suave')}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          borderMode === 'suave'
                            ? 'border-blue-600 bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        Bordas Suaves
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onExportData}
              title="Exportar Backup (JSON)"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <label
              title="Importar Backup (JSON)"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-xs font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4 rotate-180" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) {
                        onImportData(content);
                      }
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            <button
              onClick={onOpenNewLeadModal}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg shadow-sm transition-all cursor-pointer ${themeClasses.button}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>

            {/* User Profile & Logout Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                    isAdmin ? 'bg-gradient-to-tr from-rose-950 to-rose-700' : 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                  }`}>
                    {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                      {currentUser.displayName || currentUser.email}
                    </p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full inline-block ${
                      isAdmin ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {isAdmin ? 'Administrador' : 'Corretor'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {currentUser.displayName}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isAdmin ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {isAdmin ? 'Admin' : 'Corretor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.brokerName && !isAdmin && (
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          Corretor: <strong>{currentUser.brokerName}</strong>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenChangePasswordModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-slate-500" />
                        <span>Alterar Minha Senha</span>
                      </button>

                      <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da Conta (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Horizontally scrollable with complete readable labels) */}
      <div className="lg:hidden flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 overflow-x-auto scroll-smooth">
        {tabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasBadge = Boolean(tab.badgeCount && tab.badgeCount > 0);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? `${themeClasses.activeTab} shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
              {hasBadge && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
