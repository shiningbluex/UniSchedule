import type { ScheduleActivity, DayOfWeek } from '../types/schedule';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function doSlotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

// Detect clashes among schedule activities
export function findScheduleClashes(activities: ScheduleActivity[]): Map<string, string[]> {
  const clashMap = new Map<string, string[]>();

  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      const actA = activities[i];
      const actB = activities[j];

      if (actA.day === actB.day) {
        if (doSlotsOverlap(actA.startTime, actA.endTime, actB.startTime, actB.endTime)) {
          const listA = clashMap.get(actA.id) || [];
          listA.push(actB.id);
          clashMap.set(actA.id, listA);

          const listB = clashMap.get(actB.id) || [];
          listB.push(actA.id);
          clashMap.set(actB.id, listB);
        }
      }
    }
  }

  return clashMap;
}

// Calculate schedule metrics
export function calculateScheduleMetrics(activities: ScheduleActivity[], activeDays: DayOfWeek[]) {
  let totalMinutes = 0;
  const daysWithClass = new Set<DayOfWeek>();
  const dayBuckets: Record<DayOfWeek, { start: number; end: number }[]> = {
    lunes: [],
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
    domingo: [],
  };

  activities.forEach((act) => {
    const s = timeToMinutes(act.startTime);
    const e = timeToMinutes(act.endTime);
    if (e > s) {
      totalMinutes += (e - s);
      daysWithClass.add(act.day);
      if (dayBuckets[act.day]) {
        dayBuckets[act.day].push({ start: s, end: e });
      }
    }
  });

  // Calculate dead hours (gaps) between classes on each day
  let gapMinutes = 0;
  Object.keys(dayBuckets).forEach((d) => {
    const slots = dayBuckets[d as DayOfWeek].sort((a, b) => a.start - b.start);
    for (let i = 0; i < slots.length - 1; i++) {
      const gap = slots[i + 1].start - slots[i].end;
      if (gap > 0) {
        gapMinutes += gap;
      }
    }
  });

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const gapHours = Math.round((gapMinutes / 60) * 10) / 10;
  const freeDaysCount = Math.max(0, activeDays.length - daysWithClass.size);

  return {
    totalHours,
    gapHours,
    freeDaysCount,
    daysWithClassCount: daysWithClass.size,
  };
}
