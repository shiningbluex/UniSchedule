import type { ScheduleActivity, DayOfWeek, CourseSection } from '../types/schedule';

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

export interface ActivityLayout {
  activity: ScheduleActivity;
  topPx: number;
  heightPx: number;
  leftPercent: number;
  widthPercent: number;
  zIndex: number;
  hasClash: boolean;
  isDarkened: boolean;
  clashIndex: number;
  clashingWith: ScheduleActivity[];
}

// Computes geometric layout for activities on a given day,
// superposing overlapping blocks and making subsequent ones darker.
export function computeDayActivitiesLayout(
  activities: ScheduleActivity[],
  startHour: number,
  hourRowHeight: number
): ActivityLayout[] {
  if (activities.length === 0) return [];

  // Sort activities by start time
  const sorted = [...activities].sort((a, b) => {
    const sA = timeToMinutes(a.startTime);
    const sB = timeToMinutes(b.startTime);
    if (sA !== sB) return sA - sB;
    return timeToMinutes(b.endTime) - timeToMinutes(a.endTime);
  });

  // Find all pairwise overlaps
  const overlaps: Map<number, number[]> = new Map();
  for (let i = 0; i < sorted.length; i++) {
    overlaps.set(i, []);
  }

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (doSlotsOverlap(sorted[i].startTime, sorted[i].endTime, sorted[j].startTime, sorted[j].endTime)) {
        overlaps.get(i)!.push(j);
        overlaps.get(j)!.push(i);
      }
    }
  }

  // Group into connected components (overlap clusters)
  const visited = new Set<number>();
  const clusters: number[][] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (!visited.has(i)) {
      const cluster: number[] = [];
      const queue = [i];
      visited.add(i);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        cluster.push(curr);
        const neighbors = overlaps.get(curr) || [];
        for (const n of neighbors) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      clusters.push(cluster);
    }
  }

  const results: ActivityLayout[] = [];

  // Assign column index and superposition geometry
  for (const cluster of clusters) {
    // Greedy coloring for columns inside cluster
    const colAssigned = new Map<number, number>();
    for (const idx of cluster) {
      const usedCols = new Set<number>();
      for (const neighbor of overlaps.get(idx) || []) {
        if (colAssigned.has(neighbor)) {
          usedCols.add(colAssigned.get(neighbor)!);
        }
      }
      let c = 0;
      while (usedCols.has(c)) {
        c++;
      }
      colAssigned.set(idx, c);
    }

    const maxCol = Math.max(...cluster.map((idx) => colAssigned.get(idx) || 0));
    const totalCols = maxCol + 1;

    for (const idx of cluster) {
      const act = sorted[idx];
      const col = colAssigned.get(idx) || 0;
      const clashingNeighbors = (overlaps.get(idx) || []).map((n) => sorted[n]);
      const hasClash = clashingNeighbors.length > 0;

      const startMin = timeToMinutes(act.startTime);
      const endMin = timeToMinutes(act.endTime);
      const dayStartMin = startHour * 60;
      const topPx = ((startMin - dayStartMin) / 60) * hourRowHeight;
      const heightPx = Math.max(28, ((endMin - startMin) / 60) * hourRowHeight);

      let leftPercent = 2;
      let widthPercent = 96;
      let zIndex = 10;
      let isDarkened = false;

      if (hasClash && totalCols > 1) {
        // Superpose blocks: col 0 starts at left, col 1 is shifted right and superposed
        if (totalCols === 2) {
          if (col === 0) {
            leftPercent = 2;
            widthPercent = 68;
            zIndex = 10;
            isDarkened = false;
          } else {
            leftPercent = 30; // overlaps with col 0
            widthPercent = 68;
            zIndex = 20; // superposed over col 0
            isDarkened = true; // darkened to notice the superposition
          }
        } else {
          // 3 or more overlaps
          const step = 85 / totalCols;
          leftPercent = Math.min(60, 2 + col * step * 0.7);
          widthPercent = Math.max(50, 96 - (totalCols - 1) * 15);
          zIndex = 10 + col * 5;
          isDarkened = col > 0;
        }
      }

      results.push({
        activity: act,
        topPx,
        heightPx,
        leftPercent,
        widthPercent,
        zIndex,
        hasClash,
        isDarkened,
        clashIndex: col,
        clashingWith: clashingNeighbors,
      });
    }
  }

  return results;
}

// Format section full days and hours nicely
export function formatSectionDaysSummary(section: CourseSection): string {
  if (!section.slots || section.slots.length === 0) return 'Sin horarios';

  const dayCapitalize: Record<DayOfWeek, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo',
  };

  // Group by time range
  const timeGroups: Record<string, string[]> = {};
  section.slots.forEach((slot) => {
    const range = `${slot.startTime} - ${slot.endTime}`;
    if (!timeGroups[range]) {
      timeGroups[range] = [];
    }
    timeGroups[range].push(dayCapitalize[slot.day]);
  });

  return Object.entries(timeGroups)
    .map(([range, days]) => `${days.join(', ')} (${range})`)
    .join(' • ');
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
