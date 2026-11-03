import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  BookmarkPlus,
  Eye,
  Check,
  Zap,
} from 'lucide-react';
import type {
  Course,
  ScheduleCombination,
  DayOfWeek,
} from '../types/schedule';
import { DAYS_CONFIG } from '../types/schedule';
import type { SimulationOptions } from '../utils/simulator';
import { generateCombinations } from '../utils/simulator';
import confetti from 'canvas-confetti';

interface SemesterSimulatorProps {
  courses: Course[];
  onApplyCombination: (combo: ScheduleCombination, createNewPlan?: boolean) => void;
  onSelectTab: (tab: string) => void;
}

export const SemesterSimulator: React.FC<SemesterSimulatorProps> = ({
  courses,
  onApplyCombination,
  onSelectTab,
}) => {
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    courses.map((c) => c.id)
  );

  const [timePreference, setTimePreference] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [freeDayPreference, setFreeDayPreference] = useState<DayOfWeek | 'none'>('none');
  const [onlyZeroClashes, setOnlyZeroClashes] = useState(true);

  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);

  const toggleCourseSelection = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter((cId) => cId !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const selectedCoursesList = useMemo(() => {
    return courses.filter((c) => selectedCourseIds.includes(c.id));
  }, [courses, selectedCourseIds]);

  const combinations = useMemo(() => {
    const options: SimulationOptions = {
      freeDayPreference,
      timePreference,
      maxCombinations: 60,
    };
    const list = generateCombinations(selectedCoursesList, options);
    if (onlyZeroClashes) {
      return list.filter((c) => c.clashesCount === 0);
    }
    return list;
  }, [selectedCoursesList, freeDayPreference, timePreference, onlyZeroClashes]);

  const activeCombo = useMemo(() => {
    if (!combinations.length) return null;
    return combinations.find((c) => c.id === selectedComboId) || combinations[0];
  }, [combinations, selectedComboId]);

  const handleApply = (combo: ScheduleCombination, asNewPlan = false) => {
    onApplyCombination(combo, asNewPlan);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    onSelectTab('horario');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#131826] to-indigo-950/40 border border-purple-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulador Inteligente de Horarios Universitarios</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Encuentra la combinación perfecta sin choques de materias
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selecciona las materias que deseas cursar y tus preferencias (como tener los viernes libres o cursar solo de mañana). El simulador evaluará todas las comisiones disponibles y te mostrará las mejores alternativas.
            </p>
          </div>

          <div className="bg-[#1b2238] border border-slate-700/80 p-4 rounded-xl text-center min-w-[150px]">
            <span className="text-3xl font-extrabold text-emerald-400 block">
              {combinations.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Combinaciones {onlyZeroClashes ? 'Sin Choques' : 'Totales'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters and Course Selection */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Materias a Simular ({selectedCoursesList.length}/{courses.length})
              </h3>
              <button
                onClick={() =>
                  setSelectedCourseIds(
                    selectedCourseIds.length === courses.length ? [] : courses.map((c) => c.id)
                  )
                }
                className="text-xs text-emerald-400 hover:text-emerald-300 underline"
              >
                {selectedCourseIds.length === courses.length ? 'Deseleccionar' : 'Todas'}
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => toggleCourseSelection(course.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800/80 border-slate-700 shadow-sm'
                        : 'bg-[#151a2d]/50 border-slate-800/80 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="truncate">
                        <div className="font-medium text-xs text-white truncate">
                          {course.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {course.sections.length} comisión(es) disponible(s)
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences Filter Card */}
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Tus Preferencias
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Turno Preferido:
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Cualquiera' },
                  { id: 'morning', label: 'Mañanas' },
                  { id: 'afternoon', label: 'Tardes' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTimePreference(opt.id as any)}
                    className={`py-2 px-1 text-center rounded-lg font-medium transition border ${
                      timePreference === opt.id
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-[#181f33] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Día que prefieres Libre:
              </label>
              <select
                value={freeDayPreference}
                onChange={(e) => setFreeDayPreference(e.target.value as any)}
                className="w-full bg-[#181f33] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="none">Sin preferencia de día libre</option>
                {DAYS_CONFIG.map((d) => (
                  <option key={d.id} value={d.id}>
                    Tener libre el {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-300">Solo horarios sin choque (0 conflictos)</span>
              <button
                type="button"
                onClick={() => setOnlyZeroClashes(!onlyZeroClashes)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  onlyZeroClashes ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    onlyZeroClashes ? 'translate-x-4' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Combinations */}
        <div className="lg:col-span-8 space-y-5">
          {combinations.length === 0 ? (
            <div className="bg-[#111622] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                No hay combinaciones con los filtros seleccionados
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Prueba a desactivar el filtro de "Solo sin choque" o desmarcar el día libre preferido para ver más opciones disponibles.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Opciones Encontradas (Ordenadas por mejor balance)
                  </h3>
                  <span className="text-xs text-slate-400">
                    Mostrando {combinations.length} opciones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {combinations.slice(0, 6).map((combo, idx) => {
                    const isSelected = activeCombo?.id === combo.id;
                    const hasZeroClashes = combo.clashesCount === 0;

                    return (
                      <div
                        key={combo.id}
                        onClick={() => setSelectedComboId(combo.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#182036] border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500'
                            : 'bg-[#111622] border-slate-800 hover:border-slate-700 hover:bg-[#141b2c]'
                        }`}
                      >
                        {idx === 0 && (
                          <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                            ⭐ MEJOR OPCIÓN
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">
                              {combo.name}
                            </span>
                            {hasZeroClashes ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                0 Choques
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {combo.clashesCount} Choque
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] space-y-1 text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Horas cursada:</span>
                              <span className="font-semibold">{combo.totalHours}h / sem</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Días libres:</span>
                              <span className="font-semibold text-emerald-400">
                                {combo.freeDaysCount} día(s) libre(s)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Huecos muertos:</span>
                              <span className="font-semibold">
                                {combo.gapHours === 0 ? 'Sin huecos ✓' : `${combo.gapHours}h`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className={isSelected ? 'text-purple-300 font-medium' : 'text-slate-400'}>
                            {isSelected ? '● Previsualizando' : 'Clic para previsualizar'}
                          </span>
                          <Eye className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeCombo && (
                <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Detalle de {activeCombo.name}</span>
                        {activeCombo.clashesCount === 0 ? (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
                            Horario 100% Compatible
                          </span>
                        ) : (
                          <span className="text-xs bg-rose-500/20 text-rose-400 px-2.5 py-0.5 rounded-full font-semibold">
                            {activeCombo.clashesCount} Superposición
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeCombo.sections.length} materias incluidas • {activeCombo.totalHours} horas semanales • {activeCombo.freeDaysCount} días libres
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApply(activeCombo, true)}
                        className="px-3.5 py-2 rounded-xl bg-[#1b2238] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />
                        <span>Guardar como Nueva Opción</span>
                      </button>

                      <button
                        onClick={() => handleApply(activeCombo, false)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition hover:scale-102"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Aplicar a Mi Horario</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Comisiones asignadas en esta combinación:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeCombo.sections.map(({ course, section }) => (
                        <div
                          key={`${course.id}-${section.id}`}
                          className="bg-[#151a2d] border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: course.color }}
                              />
                              <span className="font-semibold text-xs text-white truncate">
                                {course.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-purple-300 font-medium mt-1">
                              {section.name} {section.professor ? `• ${section.professor}` : ''}
                            </div>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                            {section.slots.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-900 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded"
                              >
                                {s.day.slice(0, 3).toUpperCase()} {s.startTime}-{s.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
