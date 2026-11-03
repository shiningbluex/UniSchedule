import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  User,
  Trash2,
  Calendar,
  Check,
  Palette,
} from 'lucide-react';
import type {
  ScheduleActivity,
  DayOfWeek,
  Course,
} from '../types/schedule';
import {
  DAYS_CONFIG,
  PRESET_COLORS,
} from '../types/schedule';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activities: Omit<ScheduleActivity, 'id'>[]) => void;
  onDelete?: (activityId: string, groupKey?: string) => void;
  initialData?: ScheduleActivity | null;
  courses: Course[];
  defaultDay?: DayOfWeek;
  defaultStartTime?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  courses,
  defaultDay = 'lunes',
  defaultStartTime = '09:00',
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([defaultDay]);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState('11:00');
  const [classroom, setClassroom] = useState('');
  const [professor, setProfessor] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSelectedDays([initialData.day]);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setClassroom(initialData.classroom || '');
      setProfessor(initialData.professor || '');
      setColor(initialData.color);
      setSelectedCourseId(initialData.courseId || '');
    } else {
      setTitle('');
      setSelectedDays([defaultDay]);
      setStartTime(defaultStartTime);
      const [h] = defaultStartTime.split(':').map(Number);
      const endH = Math.min(23, (h || 9) + 2);
      setEndTime(`${endH.toString().padStart(2, '0')}:00`);
      setClassroom('');
      setProfessor('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setSelectedCourseId('');
    }
    setErrorMessage('');
  }, [initialData, defaultDay, defaultStartTime, isOpen]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const found = courses.find((c) => c.id === courseId);
    if (found) {
      setTitle(found.name);
      setColor(found.color);
      if (found.sections.length > 0 && found.sections[0].slots.length > 0) {
        const sec = found.sections[0];
        setProfessor(sec.professor || '');
        const slot = sec.slots[0];
        setStartTime(slot.startTime);
        setEndTime(slot.endTime);
        setClassroom(slot.classroom || '');
        setSelectedDays(sec.slots.map((s) => s.day));
      }
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa el nombre de la materia o actividad.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    if (selectedDays.length === 0) {
      setErrorMessage('Selecciona al menos un día.');
      return;
    }

    const groupKey = selectedDays.length > 1 ? `grp-${Date.now()}` : undefined;

    const activitiesToSave: Omit<ScheduleActivity, 'id'>[] = selectedDays.map((day) => ({
      title: title.trim(),
      day,
      startTime,
      endTime,
      color,
      classroom: classroom.trim() || undefined,
      professor: professor.trim() || undefined,
      courseId: selectedCourseId || undefined,
      groupKey: initialData?.groupKey || groupKey,
    }));

    onSave(activitiesToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#151a2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">
                {initialData ? 'Editar Actividad / Materia' : 'Programar Nueva Actividad'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialData
                  ? 'Modifica los datos o elimina la actividad'
                  : 'Agrega una clase o actividad a tu horario semanal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 px-3 py-2 rounded-lg text-xs">
              {errorMessage}
            </div>
          )}

          {courses.length > 0 && !initialData && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Elegir desde Materias Disponibles (Opcional):
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleSelectCourse(e.target.value)}
                className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Materia personalizada o libre --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.sections.length} comisiones disponibles)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nombre de la Materia o Actividad <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Administración de bases de datos, Deporte..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Día(s) de la semana:
              <span className="text-slate-500 font-normal ml-1">
                (Puedes marcar varios días si es una materia multidía)
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS_CONFIG.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-[#1b2238] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Hora Inicio
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Hora Fin
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Aula / Ubicación (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Aula 204, Lab 2"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profesor (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Lic. Gómez"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Color del Bloque:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121624] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-800 bg-[#151a2d] flex items-center justify-between gap-3">
          {initialData && onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(initialData.id, initialData.groupKey)}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/50"
            >
              {initialData ? 'Guardar Cambios' : '+ Agregar Actividad'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
