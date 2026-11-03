import type { ScheduleActivity, DayOfWeek } from '../types/schedule';

function getNextDayOfWeekDate(day: DayOfWeek): Date {
  const dayIndexMap: Record<DayOfWeek, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  const targetDay = dayIndexMap[day];
  const now = new Date();
  const currentDay = now.getDay();
  let distance = targetDay - currentDay;
  if (distance < 0) {
    distance += 7;
  }
  const result = new Date(now);
  result.setDate(now.getDate() + distance);
  return result;
}

function formatICSDate(date: Date, timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = h.toString().padStart(2, '0');
  const minutes = m.toString().padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}00`;
}

export function generateICS(activities: ScheduleActivity[], planName: string = 'Mi Horario'): string {
  const dayToRRULE: Record<DayOfWeek, string> = {
    lunes: 'MO',
    martes: 'TU',
    miercoles: 'WE',
    jueves: 'TH',
    viernes: 'FR',
    sabado: 'SA',
    domingo: 'SU',
  };

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniHorario Planner//ES',
    `X-WR-CALNAME:${planName}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  activities.forEach((act, idx) => {
    const baseDate = getNextDayOfWeekDate(act.day);
    const dtStart = formatICSDate(baseDate, act.startTime);
    const dtEnd = formatICSDate(baseDate, act.endTime);
    const rruleDay = dayToRRULE[act.day] || 'MO';

    ics.push(
      'BEGIN:VEVENT',
      `UID:unihorario-${idx}-${Date.now()}@unihorario.app`,
      `DTSTAMP:${formatICSDate(new Date(), '00:00')}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}`,
      `SUMMARY:${act.title}`,
      `DESCRIPTION:${act.professor ? `Profesor: ${act.professor}` : 'Clase universitaria'}`,
      `LOCATION:${act.classroom || 'Universidad'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadICSFile(activities: ScheduleActivity[], filename = 'mi_horario_universitario.ics') {
  const icsData = generateICS(activities);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
