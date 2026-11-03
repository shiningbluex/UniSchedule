import React, { useRef, useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  FileCode,
  ExternalLink,
  Copy,
  Terminal,
  Upload,
  RefreshCw,
} from 'lucide-react';
import type { SchedulePlan, Course } from '../types/schedule';
import { downloadICSFile } from '../utils/icsExport';
import { INITIAL_COURSES, createDefaultInitialPlan } from '../utils/initialData';
import confetti from 'canvas-confetti';

interface ExportAndMobileGuideProps {
  currentPlan: SchedulePlan;
  plans: SchedulePlan[];
  courses: Course[];
  setPlans: React.Dispatch<React.SetStateAction<SchedulePlan[]>>;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export const ExportAndMobileGuide: React.FC<ExportAndMobileGuideProps> = ({
  currentPlan,
  plans,
  courses,
  setPlans,
  setCourses,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      plans,
      courses,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `unihorario_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.plans && json.courses) {
          setPlans(json.plans);
          setCourses(json.courses);
          alert('¡Datos importados con éxito!');
          confetti({ particleCount: 50 });
        } else {
          alert('El archivo no tiene el formato esperado.');
        }
      } catch (err) {
        console.error(err);
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (confirm('¿Deseas restaurar las materias y el horario del ejemplo original?')) {
      setCourses(INITIAL_COURSES);
      setPlans([createDefaultInitialPlan()]);
      confetti({ particleCount: 50 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950/40 via-[#131826] to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Listo para Google Play Store & Android</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Exportación y Publicación en Google Play
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Esta aplicación está desarrollada con tecnología web moderna y empaquetada con <strong>Capacitor Native</strong>. El proyecto nativo de Android ya está generado en la carpeta <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">android/</code>, listo para abrirse en Android Studio y generar el archivo instalable (.aab o .apk).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Herramientas de Exportación
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => downloadICSFile(currentPlan.activities, `${currentPlan.name}.ics`)}
                className="w-full p-3 rounded-xl bg-[#171e33] hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-between text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                    Exportar a Google Calendar (.ics)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sincroniza tus clases con la app de calendario en tu celular
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full p-3 rounded-xl bg-[#171e33] hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-between text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    Copia de Seguridad (JSON)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Guarda tus materias y opciones para abrirlas en otro dispositivo
                  </div>
                </div>
                <FileCode className="w-4 h-4 text-cyan-400" />
              </button>

              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center justify-center gap-2 text-xs font-semibold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Copia de Seguridad JSON</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleResetToDemo}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900 text-slate-400 hover:text-rose-300 transition flex items-center justify-center gap-2 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar Ejemplo del Screenshot</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Guía Paso a Paso para Publicar en Google Play
                </h3>
                <p className="text-xs text-slate-400">
                  Sigue estos 4 pasos sencillos para generar tu App y subirla
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#151c2f] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300">
                      1
                    </span>
                    Compilar la Web y sincronizar con Android
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'npm run build && npx cap sync android',
                        'step1'
                      )
                    }
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'step1' ? (
                      <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-800">
                  <code>npm run build && npx cap sync android</code>
                </div>
                <p className="text-[11px] text-slate-400">
                  Empaqueta el código optimizado dentro de la carpeta nativa de Android de tu proyecto.
                </p>
              </div>

              <div className="bg-[#151c2f] border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300">
                      2
                    </span>
                    Abrir en Android Studio
                  </span>
                  <button
                    onClick={() => copyToClipboard('npx cap open android', 'step2')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === 'step2' ? (
                      <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-slate-200 border border-slate-800">
                  <code>npx cap open android</code>
                </div>
                <p className="text-[11px] text-slate-400">
                  Esto abrirá el proyecto directamente en <strong>Android Studio</strong>.
                </p>
              </div>

              <div className="bg-[#151c2f] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300">
                    3
                  </span>
                  Generar el App Bundle firmado (.aab)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  En Android Studio ve a:
                  <br />
                  <strong className="text-white">Build</strong> →{' '}
                  <strong className="text-white">Generate Signed Bundle / APK...</strong> → Elige{' '}
                  <strong className="text-white">Android App Bundle (.aab)</strong>.
                  <br />
                  Crea tu clave de firma (Keystore) y Android Studio generará el archivo <code className="text-emerald-400">app-release.aab</code>.
                </p>
              </div>

              <div className="bg-[#151c2f] border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-300">
                    4
                  </span>
                  Subir a Google Play Console
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Ingresa a{' '}
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline inline-flex items-center gap-0.5"
                  >
                    Google Play Console <ExternalLink className="w-3 h-3" />
                  </a>
                  , crea tu aplicación, llena la ficha de la tienda (nombre, capturas de pantalla, descripción) y sube el archivo <code className="text-emerald-400">app-release.aab</code> en la sección de Producción o Pruebas Internas. ¡Listo!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
