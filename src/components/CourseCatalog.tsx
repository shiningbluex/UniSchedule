import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  User,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  Course,
  CourseSection,
  TimeSlot,
  DayOfWeek,
} from '../types/schedule';
import {
  DAYS_CONFIG,
  PRESET_COLORS,
} from '../types/schedule';

interface CourseCatalogProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onOpenSimulator: () => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  setCourses,
  onOpenSimulator: _onOpenSimulator,
}) => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseColor, setCourseColor] = useState(PRESET_COLORS[0]);

  const [selectedCourseForSection, setSelectedCourseForSection] = useState<Course | null>(null);
  const [sectionName, setSectionName] = useState('Comisión 1 (Mañana)');
  const [sectionProfessor, setSectionProfessor] = useState('');
  const [sectionSlots, setSectionSlots] = useState<TimeSlot[]>([
    { day: 'lunes', startTime: '09:00', endTime: '11:00', classroom: 'Aula 101' },
  ]);

  const [expandedCourseIds, setExpandedCourseIds] = useState<string[]>(
    courses.map((c) => c.id)
  );

  const toggleExpand = (id: string) => {
    if (expandedCourseIds.includes(id)) {
      setExpandedCourseIds(expandedCourseIds.filter((cId) => cId !== id));
    } else {
      setExpandedCourseIds([...expandedCourseIds, id]);
    }
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: courseName.trim(),
      code: courseCode.trim() || undefined,
      color: courseColor,
      required: true,
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          name: 'Comisión 1',
          slots: [
            { day: 'lunes', startTime: '08:00', endTime: '10:00', classroom: 'Aula Magna' },
          ],
        },
      ],
    };

    setCourses([...courses, newCourse]);
    setCourseName('');
    setCourseCode('');
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta materia y todas sus comisiones?')) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const handleOpenAddSection = (course: Course) => {
    setSelectedCourseForSection(course);
    setSectionName(`Comisión ${course.sections.length + 1}`);
    setSectionProfessor('');
    setSectionSlots([
      { day: 'martes', startTime: '10:00', endTime: '12:00', classroom: 'Aula 201' },
    ]);
  };

  const handleAddSlotToSection = () => {
    setSectionSlots([
      ...sectionSlots,
      { day: 'jueves', startTime: '10:00', endTime: '12:00', classroom: 'Aula 201' },
    ]);
  };

  const handleRemoveSlotFromSection = (index: number) => {
    if (sectionSlots.length > 1) {
      setSectionSlots(sectionSlots.filter((_, i) => i !== index));
    }
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForSection) return;

    const newSection: CourseSection = {
      id: `sec-${Date.now()}`,
      name: sectionName.trim() || `Comisión ${selectedCourseForSection.sections.length + 1}`,
      professor: sectionProfessor.trim() || undefined,
      slots: sectionSlots,
    };

    setCourses(
      courses.map((c) => {
        if (c.id === selectedCourseForSection.id) {
          return {
            ...c,
            sections: [...c.sections, newSection],
          };
        }
        return c;
      })
    );

    setSelectedCourseForSection(null);
  };

  const handleDeleteSection = (courseId: string, sectionId: string) => {
    setCourses(
      courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            sections: c.sections.filter((s) => s.id !== sectionId),
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111622] border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Catálogo de Materias y Comisiones
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Registra aquí las asignaturas y los diferentes horarios o comisiones (mañana, tarde, noche) que ofrece tu universidad. El simulador usará estas comisiones para armar combinaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Nueva Materia</span>
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseIds.includes(course.id);

          return (
            <div
              key={course.id}
              className="bg-[#111622] border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
            >
              <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-[#131929]">
                <div
                  onClick={() => toggleExpand(course.id)}
                  className="flex items-center gap-3 cursor-pointer select-none min-w-0"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate">
                        {course.name}
                      </h3>
                      {course.code && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                          {course.code}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {course.sections.length} comisión(es) registradas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddSection(course)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1c243c] hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Comisión</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    title="Eliminar materia"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleExpand(course.id)}
                    className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#0e121d] space-y-3">
                  {course.sections.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No hay comisiones registradas para esta materia.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {course.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="bg-[#141a2c] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-xs text-white">{sec.name}</h4>
                              {sec.professor && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                                  <User className="w-3 h-3 text-slate-500" />
                                  <span>{sec.professor}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteSection(course.id, sec.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                              title="Eliminar comisión"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-slate-800">
                            {sec.slots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-[11px] bg-slate-900/80 px-2 py-1 rounded border border-slate-800"
                              >
                                <span className="font-semibold text-emerald-400 capitalize">
                                  {slot.day}
                                </span>
                                <span className="text-slate-300">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.classroom && (
                                  <span className="text-[10px] text-slate-500 max-w-[80px] truncate">
                                    {slot.classroom}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121624] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Agregar Nueva Materia</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cálculo Diferencial e Integral"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Código de Materia (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: MAT-201"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Color Identificador
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCourseColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                        courseColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121624] scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {courseColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60"
                >
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCourseForSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#121624] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">
              Nueva Comisión para {selectedCourseForSection.name}
            </h3>

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nombre de la Comisión / Turno
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Comisión 2 (Turno Tarde)"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Profesor Asignado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Roberto Gómez"
                  value={sectionProfessor}
                  onChange={(e) => setSectionProfessor(e.target.value)}
                  className="w-full bg-[#1b2238] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Días y Horarios de Cursada
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSlotToSection}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar otro día</span>
                  </button>
                </div>

                {sectionSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#171d31] border border-slate-700/80 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Bloque #{idx + 1}
                      </span>
                      {sectionSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlotFromSection(idx)}
                          className="text-slate-500 hover:text-rose-400 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Día</label>
                        <select
                          value={slot.day}
                          onChange={(e) => {
                            const updated = [...sectionSlots];
                            updated[idx].day = e.target.value as DayOfWeek;
                            setSectionSlots(updated);
                          }}
                          className="w-full bg-[#1b2238] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200"
                        >
                          {DAYS_CONFIG.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Inicio</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const updated = [...sectionSlots];
                            updated[idx].startTime = e.target.value;
                            setSectionSlots(updated);
                          }}
                          className="w-full bg-[#1b2238] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Fin</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => {
                            const updated = [...sectionSlots];
                            updated[idx].endTime = e.target.value;
                            setSectionSlots(updated);
                          }}
                          className="w-full bg-[#1b2238] border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCourseForSection(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60"
                >
                  Guardar Comisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
