export type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export interface TimeSlot {
  day: DayOfWeek;
  startTime: string; // "09:00" (HH:mm)
  endTime: string;   // "11:00"
  classroom?: string;
}

export interface CourseSection {
  id: string;
  name: string; // e.g. "Comisión A", "Turno Mañana"
  professor?: string;
  slots: TimeSlot[];
}

export interface Course {
  id: string;
  code?: string;
  name: string;
  color: string;
  required?: boolean; // if required for simulation
  sections: CourseSection[];
}

// An activity or enrolled class on the schedule
export interface ScheduleActivity {
  id: string;
  courseId?: string;
  sectionId?: string;
  title: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  color: string;
  classroom?: string;
  professor?: string;
  groupKey?: string; // Links multi-day blocks of the same activity
}

export interface SchedulePlan {
  id: string;
  name: string; // "Opción A - Mañanas", "Opción B - Tardes"
  createdAt: number;
  activities: ScheduleActivity[];
  color?: string;
}

export interface ScheduleCombination {
  id: string;
  name: string;
  sections: { course: Course; section: CourseSection }[];
  clashesCount: number;
  totalHours: number;
  freeDaysCount: number;
  gapHours: number; // dead hours between classes
  activities: ScheduleActivity[];
}

export const DAYS_CONFIG: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'lunes', label: 'Lunes', short: 'LUN' },
  { id: 'martes', label: 'Martes', short: 'MAR' },
  { id: 'miercoles', label: 'Miércoles', short: 'MIÉ' },
  { id: 'jueves', label: 'Jueves', short: 'JUE' },
  { id: 'viernes', label: 'Viernes', short: 'VIE' },
  { id: 'sabado', label: 'Sábado', short: 'SÁB' },
  { id: 'domingo', label: 'Domingo', short: 'DOM' },
];

export const PRESET_COLORS = [
  '#d946ef', // Magenta / Fuchsia (like screenshot: Administración de bases de datos)
  '#06b6d4', // Cyan (like screenshot: Deporte)
  '#ef4444', // Coral / Red (like screenshot: Lenguajes de Programación)
  '#6366f1', // Indigo / Purple (like screenshot: Divulgación científica)
  '#8b5cf6', // Violet (like screenshot: Diseño y prototipado)
  '#10b981', // Emerald
  '#f59e0b', // Amber / Orange
  '#3b82f6', // Sky Blue
  '#ec4899', // Pink
  '#14b8a6', // Teal
];
