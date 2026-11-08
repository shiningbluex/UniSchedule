import type { Course, CourseSection, SchedulePlan, ScheduleActivity, TimeSlot } from '../types/schedule';
import { normalizeTimeString } from './time';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    code: 'INF-301',
    name: 'Administración de bases de datos',
    color: '#d946ef',
    required: true,
    sections: [
      {
        id: 'sec-1-a',
        name: 'Comisión 1 (Mañana)',
        professor: 'Ing. Carlos Mendoza',
        slots: [
          { day: 'martes', startTime: '09:00', endTime: '11:00', classroom: 'Lab Sistemas 2' },
          { day: 'jueves', startTime: '09:00', endTime: '11:00', classroom: 'Lab Sistemas 2' },
          { day: 'viernes', startTime: '09:00', endTime: '11:00', classroom: 'Lab Sistemas 2' },
        ],
      },
      {
        id: 'sec-1-b',
        name: 'Comisión 2 (Tarde)',
        professor: 'Lic. Laura Ortiz',
        slots: [
          { day: 'lunes', startTime: '15:00', endTime: '17:00', classroom: 'Aula 204' },
          { day: 'miercoles', startTime: '15:00', endTime: '17:00', classroom: 'Aula 204' },
          { day: 'viernes', startTime: '15:00', endTime: '17:00', classroom: 'Aula 204' },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    code: 'DEP-101',
    name: 'Deporte',
    color: '#06b6d4',
    required: true,
    sections: [
      {
        id: 'sec-2-a',
        name: 'Comisión 1 (Mediodía)',
        professor: 'Prof. Marcos Vera',
        slots: [
          { day: 'martes', startTime: '11:00', endTime: '13:00', classroom: 'Gimnasio Techado' },
          { day: 'jueves', startTime: '11:00', endTime: '13:00', classroom: 'Gimnasio Techado' },
        ],
      },
      {
        id: 'sec-2-b',
        name: 'Comisión 2 (Tarde)',
        professor: 'Prof. Sofia Morales',
        slots: [
          { day: 'miercoles', startTime: '14:00', endTime: '16:00', classroom: 'Cancha Polideportivo' },
          { day: 'viernes', startTime: '11:00', endTime: '13:00', classroom: 'Cancha Polideportivo' },
        ],
      },
      {
        id: 'sec-2-c',
        name: 'Comisión 3 (Sábado Mañana)',
        professor: 'Prof. Martín Gómez',
        slots: [
          { day: 'sabado', startTime: '09:00', endTime: '13:00', classroom: 'Gimnasio Techado' },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    code: 'INF-204',
    name: 'Lenguajes de Programación',
    color: '#ef4444',
    required: true,
    sections: [
      {
        id: 'sec-3-a',
        name: 'Comisión A (Vespertino)',
        professor: 'Dr. Alejandro Peña',
        slots: [
          { day: 'lunes', startTime: '17:00', endTime: '19:00', classroom: 'Aula Magna 3' },
          { day: 'miercoles', startTime: '17:00', endTime: '19:00', classroom: 'Aula Magna 3' },
          { day: 'viernes', startTime: '17:00', endTime: '19:00', classroom: 'Aula Magna 3' },
        ],
      },
      {
        id: 'sec-3-b',
        name: 'Comisión B (Mañana)',
        professor: 'Dra. Patricia Reyes',
        slots: [
          { day: 'lunes', startTime: '08:00', endTime: '10:00', classroom: 'Lab Computación 1' },
          { day: 'miercoles', startTime: '08:00', endTime: '10:00', classroom: 'Lab Computación 1' },
          { day: 'jueves', startTime: '08:00', endTime: '10:00', classroom: 'Lab Computación 1' },
        ],
      },
    ],
  },
  {
    id: 'course-4',
    code: 'HUM-102',
    name: 'Divulgación científica',
    color: '#6366f1',
    required: true,
    sections: [
      {
        id: 'sec-4-a',
        name: 'Comisión 1 (Martes Tarde)',
        professor: 'Dra. Elena Vasquez',
        slots: [
          { day: 'martes', startTime: '17:00', endTime: '19:00', classroom: 'Aula 108' },
        ],
      },
      {
        id: 'sec-4-b',
        name: 'Comisión 2 (Jueves Tarde)',
        professor: 'Lic. Fernando Cruz',
        slots: [
          { day: 'jueves', startTime: '15:00', endTime: '17:00', classroom: 'Aula 108' },
        ],
      },
    ],
  },
  {
    id: 'course-5',
    code: 'EDU-401',
    name: 'Diseño y prototipado de recursos educativos digitales',
    color: '#8b5cf6',
    required: true,
    sections: [
      {
        id: 'sec-5-a',
        name: 'Comisión Única (Jueves)',
        professor: 'MSc. Gabriela Romero',
        slots: [
          { day: 'jueves', startTime: '17:00', endTime: '19:00', classroom: 'Taller Multimedia' },
        ],
      },
      {
        id: 'sec-5-b',
        name: 'Comisión 2 (Sábado)',
        professor: 'MSc. Roberto Cano',
        slots: [
          { day: 'sabado', startTime: '10:00', endTime: '12:00', classroom: 'Taller Multimedia' },
        ],
      },
    ],
  },
];

// Helper to convert course sections to activities with robust time normalization
export function createActivitiesFromCourseSections(
  selections: { course: Course; section: CourseSection }[]
): ScheduleActivity[] {
  const activities: ScheduleActivity[] = [];

  selections.forEach(({ course, section }) => {
    const groupKey = `${course.id}-${section.id}`;
    section.slots.forEach((slot: TimeSlot, idx: number) => {
      const normStart = normalizeTimeString(slot.startTime);
      const normEnd = normalizeTimeString(slot.endTime, normStart);
      activities.push({
        id: `act-${groupKey}-${idx}-${Date.now()}`,
        courseId: course.id,
        sectionId: section.id,
        title: course.name,
        day: slot.day,
        startTime: normStart,
        endTime: normEnd,
        color: course.color,
        classroom: slot.classroom,
        professor: section.professor,
        groupKey,
      });
    });
  });

  return activities;
}

// Initial default plan matching the uploaded image perfectly
export function createDefaultInitialPlan(): SchedulePlan {
  const selections = [
    { course: INITIAL_COURSES[0], section: INITIAL_COURSES[0].sections[0] }, // BD Mañana
    { course: INITIAL_COURSES[1], section: INITIAL_COURSES[1].sections[0] }, // Deporte 11-13
    { course: INITIAL_COURSES[2], section: INITIAL_COURSES[2].sections[0] }, // Lenguajes 17-19
    { course: INITIAL_COURSES[3], section: INITIAL_COURSES[3].sections[0] }, // Divulgacion Mar 17-19
    { course: INITIAL_COURSES[4], section: INITIAL_COURSES[4].sections[0] }, // Diseño Jue 17-19
  ];

  return {
    id: 'plan-default',
    name: 'Horario Oficial (Semestre 2026)',
    createdAt: Date.now(),
    activities: createActivitiesFromCourseSections(selections),
    color: '#10b981',
  };
}
