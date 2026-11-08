import React, { useRef, useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Trash2,
  AlertTriangle,
  Download,
  Share2,
  Sparkles,
  MapPin,
  Sliders,
} from 'lucide-react';
import type {
  ScheduleActivity,
  DayOfWeek,
  Course,
} from '../types/schedule';
import { DAYS_CONFIG } from '../types/schedule';
import {
  findScheduleClashes,
  calculateScheduleMetrics,
  computeDayActivitiesLayout,
  normalizeTimeString,
  getSlotMinutes,
} from '../utils/time';
import { downloadICSFile } from '../utils/icsExport';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

interface WeeklyTimetableProps {
  activities: ScheduleActivity[];
  onAddActivity: (defaultDay?: DayOfWeek, defaultStartTime?: string) => void;
  onEditActivity: (activity: ScheduleActivity) => void;
  onDeleteActivity: (activityId: string, groupKey?: string) => void;
  planName: string;
  courses: Course[];
  onOpenSimulator: () => void;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  planName,
  courses: _courses,
  onOpenSimulator,
}) => {
  const timetableRef = useRef<HTMLDivElement>(null);
  const [startHour, setStartHour] = useState(7);
  const [endHour, setEndHour] = useState(20);
  const [includeSunday, setIncludeSunday] = useState(false);
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayOfWeek | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const effectiveStartHour = useMemo(() => {
    let minH = startHour;
    activities.forEach((act) => {
      const { startMin } = getSlotMinutes(act.startTime, act.endTime);
      const h = Math.floor(startMin / 60);
      if (h < minH) minH = Math.max(0, h);
    });
    return minH;
  }, [activities, startHour]);

  const effectiveEndHour = useMemo(() => {
    let maxH = endHour;
    activities.forEach((act) => {
      const { endMin } = getSlotMinutes(act.startTime, act.endTime);
      const h = Math.ceil(endMin / 60);
      if (h > maxH) maxH = Math.min(23, h);
    });
    return maxH;
  }, [activities, endHour]);

  const visibleDays = DAYS_CONFIG.filter((d) => (d.id === 'domingo' ? includeSunday : true));
  const clashMap = findScheduleClashes(activities);

  const activeDayIds = visibleDays.map((d) => d.id);
  const metrics = calculateScheduleMetrics(activities, activeDayIds);

  const hoursRange: number[] = useMemo(() => {
    const range: number[] = [];
    for (let h = effectiveStartHour; h <= effectiveEndHour; h++) {
      range.push(h);
    }
    return range;
  }, [effectiveStartHour, effectiveEndHour]);

  const hourRowHeight = 60;

  const handleExportImage = async () => {
    if (!timetableRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(timetableRef.current, {
        quality: 0.95,
        backgroundColor: '#0c0f17',
      });
      const link = document.createElement('a');
      link.download = `${planName.replace(/\s+/g, '_')}_horario.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportICS = () => {
    downloadICSFile(activities, `${planName.replace(/\s+/g, '_')}.ics`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Metrics bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131826] border border-slate-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{planName}</h2>
              {clashMap.size === 0 ? (
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ✓ Sin Choques
                </span>
              ) : (
                <span className="text-[11px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  {Math.ceil(clashMap.size / 2)} Choque(s) detectado(s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {metrics.totalHours} horas semanales • {metrics.daysWithClassCount} días con clases • {metrics.gapHours}h de huecos
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/50 transition hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Simulador de Combinaciones</span>
          </button>

          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b2238] hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
            title="Descargar como imagen PNG para WhatsApp o fondo de pantalla"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isExporting ? 'Generando...' : 'Descargar Foto'}</span>
          </button>

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b2238] hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
            title="Descargar archivo para Google Calendar"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={() => onAddActivity()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 transition hover:scale-102"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Programar Actividad</span>
          </button>
        </div>
      </div>

      {/* Main Timetable Card */}
      <div
        ref={timetableRef}
        className="bg-[#0f131f] border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl relative"
      >
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-[#131826]/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Mi Horario Semanal
              </h3>
              <p className="text-xs text-slate-400">
                De {startHour}:00 a {endHour}:00. Las materias multidía se gestionan como un solo bloque. Si chocan, se superponen con tono oscuro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#1a2035] border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Rango:</span>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                {[6, 7, 8, 9].map((h) => (
                  <option key={h} value={h} className="bg-slate-900 text-slate-200">
                    {h}:00
                  </option>
                ))}
              </select>
              <span>a</span>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                {[18, 19, 20, 21, 22, 23].map((h) => (
                  <option key={h} value={h} className="bg-slate-900 text-slate-200">
                    {h}:00
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIncludeSunday(!includeSunday)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                includeSunday
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-[#1a2035] border-slate-700/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              + Domingo
            </button>
          </div>
        </div>

        {/* Mobile Day Selector Tabs */}
        <div className="lg:hidden p-2 bg-[#121626] border-b border-slate-800 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedMobileDay('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedMobileDay === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Todos los Días
          </button>
          {visibleDays.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedMobileDay(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedMobileDay === d.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto">
          <div
            className="min-w-[760px] select-none"
            style={{ minHeight: `${(effectiveEndHour - effectiveStartHour) * hourRowHeight + 50}px` }}
          >
            {/* Header row with Days */}
            <div className="grid grid-cols-[70px_repeat(auto-fit,minmax(110px,1fr))] border-b border-slate-800 sticky top-0 z-20 bg-[#121625]">
              <div className="py-3 px-2 text-center text-xs font-medium text-slate-500 border-r border-slate-800/80">
                Hora
              </div>

              {visibleDays
                .filter((d) => (selectedMobileDay === 'all' ? true : d.id === selectedMobileDay))
                .map((day) => (
                  <div
                    key={day.id}
                    className="py-3 text-center text-xs font-bold tracking-wider uppercase text-slate-300 border-r border-slate-800/80 last:border-r-0"
                  >
                    {day.label}
                  </div>
                ))}
            </div>

            <div className="relative grid grid-cols-[70px_repeat(auto-fit,minmax(110px,1fr))]">
              {/* Left Column: Hours */}
              <div className="border-r border-slate-800/80 bg-[#0e121d] relative select-none">
                {hoursRange.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${hourRowHeight}px` }}
                    className="border-b border-slate-800/50 flex items-start justify-center pt-1"
                  >
                    <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {visibleDays
                .filter((d) => (selectedMobileDay === 'all' ? true : d.id === selectedMobileDay))
                .map((day) => {
                  const dayActivities = activities.filter((act) => act.day === day.id);
                  const dayLayouts = computeDayActivitiesLayout(
                    dayActivities,
                    effectiveStartHour,
                    hourRowHeight
                  );

                  return (
                    <div
                      key={day.id}
                      className="relative border-r border-slate-800/80 last:border-r-0 hover:bg-slate-900/10 transition"
                      style={{
                        height: `${(effectiveEndHour - effectiveStartHour + 1) * hourRowHeight}px`,
                      }}
                    >
                      {/* Grid guidelines */}
                      {hoursRange.map((hour) => (
                        <div
                          key={hour}
                          onClick={() => {
                            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                            onAddActivity(day.id, timeStr);
                          }}
                          style={{ height: `${hourRowHeight}px` }}
                          title={`Clic para programar clase el ${day.label} a las ${hour}:00`}
                          className="border-b border-slate-800/40 hover:bg-emerald-500/5 cursor-pointer transition flex items-center justify-center group"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-500/0 group-hover:text-emerald-500/40 transition" />
                        </div>
                      ))}

                      {/* Render superposed activity blocks */}
                      {dayLayouts.map((layout) => {
                        const act = layout.activity;

                        return (
                          <div
                            key={act.id}
                            onClick={() => onEditActivity(act)}
                            style={{
                              top: `${layout.topPx}px`,
                              height: `${layout.heightPx}px`,
                              left: `${layout.leftPercent}%`,
                              width: `${layout.widthPercent}%`,
                              zIndex: layout.zIndex,
                              backgroundColor: act.color,
                              filter: layout.isDarkened
                                ? 'brightness(0.68) saturate(1.15)'
                                : undefined,
                            }}
                            title={
                              layout.hasClash
                                ? `⚠️ Conflicto de horario: Superpuesto con ${layout.clashingWith.map((c) => c.title).join(', ')}`
                                : `${act.title} (${act.startTime} - ${act.endTime})`
                            }
                            className={`absolute rounded-xl p-2.5 text-white shadow-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.04] hover:z-50 hover:filter-none overflow-hidden flex flex-col justify-between group ${
                              layout.hasClash
                                ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-[#0f131f] shadow-rose-950/60'
                                : 'hover:ring-2 hover:ring-white/40'
                            }`}
                          >
                            {/* Subtle dark tint overlay for the superposed block */}
                            {layout.isDarkened && (
                              <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-xl" />
                            )}

                            <div className="space-y-1 relative z-10">
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-bold text-xs leading-tight line-clamp-2 drop-shadow-sm">
                                  {act.title}
                                </h4>
                                {layout.hasClash && (
                                  <span
                                    title={`¡Conflicto con ${layout.clashingWith.map((c) => c.title).join(', ')}!`}
                                    className="bg-rose-950/90 text-rose-300 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 shadow flex-shrink-0"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                    <span>Choque</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 drop-shadow-sm">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  {normalizeTimeString(act.startTime)} - {normalizeTimeString(act.endTime, act.startTime)}
                                </span>
                              </div>

                              {act.classroom && (
                                <div className="flex items-center gap-1 text-[10px] text-white/80 truncate">
                                  <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="truncate">{act.classroom}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end pt-1 relative z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteActivity(act.id, act.groupKey);
                                }}
                                title="Eliminar clase"
                                className="text-white/70 hover:text-white hover:bg-black/20 p-1 rounded transition opacity-80 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
