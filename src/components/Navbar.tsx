import React from 'react';
import {
  Calendar,
  Sparkles,
  BookOpen,
  Layers,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  userName: string;
  setUserName: (name: string) => void;
  clashesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  userName,
  setUserName,
  clashesCount,
}) => {
  const [isEditingUser, setIsEditingUser] = React.useState(false);
  const [tempName, setTempName] = React.useState(userName);

  const tabs = [
    { id: 'horario', label: 'Mi Horario', icon: Calendar },
    { id: 'simulador', label: 'Simulador de Semestre', icon: Sparkles, badge: 'IA' },
    { id: 'materias', label: 'Materias Disponibles', icon: BookOpen },
    { id: 'planes', label: 'Comparar Opciones', icon: Layers },
    { id: 'exportar', label: 'Exportar & Google Play', icon: Smartphone },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0c101b]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold text-slate-200">UniHorario</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">Portal y Planificador de Asignaturas</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
            {isEditingUser ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (tempName.trim()) setUserName(tempName.trim());
                  setIsEditingUser(false);
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-800 text-slate-100 px-1.5 py-0.5 rounded text-xs outline-none"
                  autoFocus
                  onBlur={() => {
                    if (tempName.trim()) setUserName(tempName.trim());
                    setIsEditingUser(false);
                  }}
                />
              </form>
            ) : (
              <button
                onClick={() => setIsEditingUser(true)}
                title="Haz clic para cambiar nombre"
                className="text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <span>({userName})</span>
                <span className="text-slate-400 text-[11px] underline">Editar</span>
              </button>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1 rounded-full transition"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'horario' && clashesCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                    {clashesCount} choque{clashesCount > 1 ? 's' : ''}
                  </span>
                )}
                {tab.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
