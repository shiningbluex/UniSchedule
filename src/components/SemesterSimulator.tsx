import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Filter,
  BookmarkPlus,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import type {
  Course,
  ScheduleCombination,
  DayOfWeek,
} from '../types/schedule';
import { DAYS_CONFIG } from '../types/schedule';
import type { SimulationOptions } from '../utils/simulator';
import { generateCombinations } from '../utils/simulator';
import { timeToMinutes } from '../utils/time';
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

  // Simulation calculation state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedComboIndex, setSelectedComboIndex] = useState(0);

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

  // All calculated combinations
  const combinations = useMemo(() => {
    if (!hasCalculated && selectedCoursesList.length === 0) return [];
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
  }, [hasCalculated, selectedCoursesList, freeDayPreference, timePreference, onlyZeroClashes]);

  // Active combo currently being inspected
  const activeCombo = useMemo(() => {
    if (!combinations.length) return null;
    const safeIndex = Math.min(Math.max(0, selectedComboIndex), combinations.length - 1);
    return combinations[safeIndex];
  }, [combinations, selectedComboIndex]);

  // Trigger automatic calculation button
  const handleCalculateCombinations = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setSelectedComboIndex(0);
      setIsCalculating(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }, 400);
  };

  // Set as definitive schedule
  const handleSetAsDefinitive = (combo: ScheduleCombination) => {
    onApplyCombination(combo, false);
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 } });
    onSelectTab('horario');
  };

  // Save as alternate option
  const handleSaveAsDraft = (combo: ScheduleCombination) => {
    onApplyCombination(combo, true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    onSelectTab('planes');
  };

  // Days visible in mini calendar
  const visibleDays = DAYS_CONFIG.filter((d) => d.id !== 'domingo');
  const startHour = 7;
  const endHour = 20;
  const hourRowHeight = 36;
  const hoursRange: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hoursRange.push(h);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-purple-950/50 via-[#131826] to-emerald-950/40 border border-purple-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/40 px-3 py-1 rounded-full text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Simulador Inteligente de Semestre</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Calcula y prueba todas las combinaciones de horarios
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Selecciona las materias que deseas cursar y presiona el botón para calcular automáticamente todas las opciones posibles de comisiones sin choques. Luego podrás verlas en el calendario y decidir cuál dejar como tu horario definitivo.
            </p>
          </div>

          {/* Big Action Button in Header */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCalculateCombinations}
              disabled={isCalculating || selectedCoursesList.length === 0}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl flex items-center gap-2.5 transition-all transform active:scale-95 ${
                selectedCoursesList.length === 0
                  ? 'bg-slate-700 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-950/60 hover:shadow-emerald-500/25 hover:scale-102 cursor-pointer'
              }`}
            >
              <Zap className={`w-5 h-5 text-amber-300 ${isCalculating ? 'animate-spin' : 'animate-bounce'}`} />
              <span>
                {isCalculating
                  ? 'Calculando Combinaciones...'
                  : '⚡ Calcular Todas las Combinaciones'}
              </span>
            </button>

            {hasCalculated && (
              <div className="bg-[#1b2238] border border-slate-700/80 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
                <span className="text-2xl font-black text-emerald-400 block">
                  {combinations.length}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Opciones sin choques
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters and Course Selection */}
        <div className="lg:col-span-4 space-y-5">
          {/* Materias a Simular */}
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
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
              >
                {selectedCourseIds.length === courses.length ? 'Deseleccionar' : 'Marcar Todas'}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                        <div className="font-semibold text-xs text-white truncate">
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

          {/* Preferences */}
          <div className="bg-[#111622] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              Preferencias de Simulación
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
                {DAYS_CONFIG.filter((d) => d.id !== 'domingo').map((d) => (
                  <option key={d.id} value={d.id}>
                    Tener libre el {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-300">Solo combinaciones con 0 choques</span>
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

            <button
              onClick={handleCalculateCombinations}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recalcular con Nuevos Filtros</span>
            </button>
          </div>
        </div>

        {/* Right Column: Combinations & Live Calendar Preview */}
        <div className="lg:col-span-8 space-y-5">
          {!hasCalculated ? (
            <div className="bg-[#111622] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-lg">
                <Zap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Listo para calcular combinaciones
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Seleccionaste {selectedCoursesList.length} materias. Haz clic en el botón para que el algoritmo pruebe todas las comisiones y te muestre los horarios sin choques.
                </p>
              </div>
              <button
                onClick={handleCalculateCombinations}
                disabled={selectedCoursesList.length === 0}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 inline-flex items-center gap-2 transition hover:scale-102"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ Calcular Combinaciones Ahora</span>
              </button>
            </div>
          ) : combinations.length === 0 ? (
            <div className="bg-[#111622] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                No se encontraron combinaciones con estos filtros
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Prueba a desactivar el día libre preferido o permitir cualquier turno para ver más opciones disponibles.
              </p>
            </div>
          ) : (
            <>
              {/* Combinations Navigator Carousel */}
              <div className="bg-[#111622] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      Combinación {selectedComboIndex + 1} de {combinations.length}
                    </span>
                    {activeCombo?.clashesCount === 0 ? (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        0 Choques
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {activeCombo?.clashesCount} Choque
                      </span>
                    )}
                    {selectedComboIndex === 0 && (
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        ⭐ MEJOR BALANCE
                      </span>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setSelectedComboIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={selectedComboIndex === 0}
                      className="p-1.5 rounded-lg bg-[#181f33] hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
                      title="Opción anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setSelectedComboIndex((prev) =>
                          Math.min(combinations.length - 1, prev + 1)
                        )
                      }
                      disabled={selectedComboIndex >= combinations.length - 1}
                      className="p-1.5 rounded-lg bg-[#181f33] hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
                      title="Siguiente opción"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick pills of combinations to click */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {combinations.slice(0, 15).map((combo, idx) => {
                    const isSelected = selectedComboIndex === idx;
                    return (
                      <button
                        key={combo.id}
                        onClick={() => setSelectedComboIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                          isSelected
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-950/50'
                            : 'bg-[#151a2d] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {idx === 0 ? '⭐ Opción 1' : `Opción ${idx + 1}`}
                      </button>
                    );
                  })}
                </div>

                {/* Metrics bar of active combination */}
                {activeCombo && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                    <div className="bg-[#151a2d] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Horas semanales</span>
                      <span className="font-bold text-white">{activeCombo.totalHours}h / sem</span>
                    </div>
                    <div className="bg-[#151a2d] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Días libres</span>
                      <span className="font-bold text-emerald-400">{activeCombo.freeDaysCount} día(s)</span>
                    </div>
                    <div className="bg-[#151a2d] p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Huecos libres</span>
                      <span className="font-bold text-white">
                        {activeCombo.gapHours === 0 ? 'Sin huecos ✓' : `${activeCombo.gapHours}h`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CALENDAR VISUAL PREVIEW OF ACTIVE COMBINATION */}
              {activeCombo && (
                <div className="bg-[#0f131f] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4">
                  {/* Calendar Header with Definitive Button */}
                  <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#131826] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Horario de la {activeCombo.name}</span>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                          Previsualización
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Así se verá tu semana si eliges esta opción.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveAsDraft(activeCombo)}
                        className="px-3.5 py-2 rounded-xl bg-[#1c243c] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Guardar como borrador para comparar después"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />
                        <span>Guardar en Borradores</span>
                      </button>

                      <button
                        onClick={() => handleSetAsDefinitive(activeCombo)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition hover:scale-102 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>⭐ Dejar como Mi Horario Definitivo</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Visual Timetable Grid */}
                  <div className="overflow-x-auto px-4 pb-4">
                    <div className="min-w-[620px] select-none border border-slate-800/80 rounded-xl overflow-hidden">
                      {/* Days Header */}
                      <div className="grid grid-cols-[60px_repeat(6,1fr)] bg-[#121625] border-b border-slate-800">
                        <div className="py-2.5 text-center text-[11px] font-semibold text-slate-500 border-r border-slate-800">
                          Hora
                        </div>
                        {visibleDays.map((d) => (
                          <div
                            key={d.id}
                            className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-300 border-r border-slate-800 last:border-r-0"
                          >
                            {d.label}
                          </div>
                        ))}
                      </div>

                      {/* Timetable Body */}
                      <div className="relative grid grid-cols-[60px_repeat(6,1fr)] bg-[#0d101a]">
                        {/* Hours column */}
                        <div className="border-r border-slate-800/80 bg-[#0c0e18]">
                          {hoursRange.map((hour) => (
                            <div
                              key={hour}
                              style={{ height: `${hourRowHeight}px` }}
                              className="border-b border-slate-800/40 flex items-start justify-center pt-1 text-[10px] text-slate-500 font-mono"
                            >
                              {hour.toString().padStart(2, '0')}:00
                            </div>
                          ))}
                        </div>

                        {/* Day columns with blocks */}
                        {visibleDays.map((day) => {
                          const dayActs = activeCombo.activities.filter(
                            (a) => a.day === day.id
                          );

                          return (
                            <div
                              key={day.id}
                              style={{ height: `${hoursRange.length * hourRowHeight}px` }}
                              className="relative border-r border-slate-800/60 last:border-r-0"
                            >
                              {/* Guidelines */}
                              {hoursRange.map((hour) => (
                                <div
                                  key={hour}
                                  style={{ height: `${hourRowHeight}px` }}
                                  className="border-b border-slate-800/30"
                                />
                              ))}

                              {/* Activity Cards */}
                              {dayActs.map((act) => {
                                const startMin = timeToMinutes(act.startTime);
                                const endMin = timeToMinutes(act.endTime);
                                const dayStartMin = startHour * 60;

                                const topPx =
                                  ((startMin - dayStartMin) / 60) * hourRowHeight;
                                const heightPx = Math.max(
                                  28,
                                  ((endMin - startMin) / 60) * hourRowHeight
                                );

                                return (
                                  <div
                                    key={act.id}
                                    style={{
                                      top: `${topPx}px`,
                                      height: `${heightPx}px`,
                                      backgroundColor: act.color,
                                    }}
                                    className="absolute left-1 right-1 rounded-lg p-1.5 text-white shadow-md overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition"
                                  >
                                    <div>
                                      <div className="font-bold text-[11px] leading-tight line-clamp-2 drop-shadow-sm">
                                        {act.title}
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] text-white/90 font-mono mt-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>
                                          {act.startTime} - {act.endTime}
                                        </span>
                                      </div>
                                    </div>
                                    {act.classroom && (
                                      <div className="text-[9px] text-white/80 truncate">
                                        {act.classroom}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* List of sections in active combination */}
                  <div className="px-5 pb-5 space-y-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Comisiones asignadas en esta opción:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeCombo.sections.map(({ course, section }) => (
                        <div
                          key={`${course.id}-${section.id}`}
                          className="bg-[#141a2c] border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: course.color }}
                              />
                              <span className="font-bold text-xs text-white truncate">
                                {course.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-purple-300 font-medium mt-0.5 truncate">
                              {section.name} {section.professor ? `• ${section.professor}` : ''}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {section.slots.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded"
                              >
                                {s.day.slice(0, 3).toUpperCase()} {s.startTime}-{s.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={() => handleSetAsDefinitive(activeCombo)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition hover:scale-102 cursor-pointer"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>⭐ Dejar como Mi Horario Definitivo y Ver en Calendario</span>
                      </button>
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
