import type {
  Course,
  CourseSection,
  ScheduleCombination,
  DayOfWeek,
  ScheduleActivity,
} from '../types/schedule';
import { DAYS_CONFIG } from '../types/schedule';
import { findScheduleClashes, calculateScheduleMetrics, timeToMinutes } from './time';
import { createActivitiesFromCourseSections } from './initialData';

export interface SimulationOptions {
  freeDayPreference?: DayOfWeek | 'none';
  timePreference?: 'all' | 'morning' | 'afternoon' | 'compact';
  maxCombinations?: number;
}

export function generateCombinations(
  selectedCourses: Course[],
  options: SimulationOptions = {}
): ScheduleCombination[] {
  if (selectedCourses.length === 0) return [];

  const validCourses = selectedCourses.filter((c) => c.sections.length > 0);
  if (validCourses.length === 0) return [];

  const results: { course: Course; section: CourseSection }[][] = [];

  function backtrack(
    courseIndex: number,
    currentCombo: { course: Course; section: CourseSection }[]
  ) {
    if (courseIndex === validCourses.length) {
      results.push([...currentCombo]);
      return;
    }

    const course = validCourses[courseIndex];
    for (const section of course.sections) {
      currentCombo.push({ course, section });
      backtrack(courseIndex + 1, currentCombo);
      currentCombo.pop();

      if (results.length >= 500) break;
    }
  }

  backtrack(0, []);

  const activeDays = DAYS_CONFIG.map((d) => d.id);

  const evaluatedCombos: ScheduleCombination[] = results.map((combo, index) => {
    const activities: ScheduleActivity[] = createActivitiesFromCourseSections(combo);
    const clashMap = findScheduleClashes(activities);
    const clashesCount = clashMap.size / 2;
    const metrics = calculateScheduleMetrics(activities, activeDays);

    return {
      id: `combo-${index + 1}`,
      name: `Opción #${index + 1}`,
      sections: combo,
      clashesCount: Math.ceil(clashesCount),
      totalHours: metrics.totalHours,
      freeDaysCount: metrics.freeDaysCount,
      gapHours: metrics.gapHours,
      activities,
    };
  });

  const validNoClash = evaluatedCombos.filter((c) => c.clashesCount === 0);
  const withClashes = evaluatedCombos.filter((c) => c.clashesCount > 0);

  const sortFn = (a: ScheduleCombination, b: ScheduleCombination) => {
    // 1. Clashes count
    if (a.clashesCount !== b.clashesCount) {
      return a.clashesCount - b.clashesCount;
    }

    // 2. Free day preference
    if (options.freeDayPreference && options.freeDayPreference !== 'none') {
      const aHasFree = !a.activities.some((act) => act.day === options.freeDayPreference);
      const bHasFree = !b.activities.some((act) => act.day === options.freeDayPreference);
      if (aHasFree !== bHasFree) return aHasFree ? -1 : 1;
    }

    // 3. Time preference: Only filter by morning/afternoon if explicitly requested!
    // When "all" / cualquiera is selected, do NOT filter or favor morning vs afternoon
    if (options.timePreference === 'morning') {
      const aMorningCount = a.activities.filter(
        (act) => timeToMinutes(act.startTime) < 780
      ).length;
      const bMorningCount = b.activities.filter(
        (act) => timeToMinutes(act.startTime) < 780
      ).length;
      if (aMorningCount !== bMorningCount) return bMorningCount - aMorningCount;
    } else if (options.timePreference === 'afternoon') {
      const aAfternoonCount = a.activities.filter(
        (act) => timeToMinutes(act.startTime) >= 780
      ).length;
      const bAfternoonCount = b.activities.filter(
        (act) => timeToMinutes(act.startTime) >= 780
      ).length;
      if (aAfternoonCount !== bAfternoonCount) return bAfternoonCount - aAfternoonCount;
    }

    // 4. Compactness (lowest dead gap hours)
    if (a.gapHours !== b.gapHours) {
      return a.gapHours - b.gapHours;
    }

    // 5. Free days count
    return b.freeDaysCount - a.freeDaysCount;
  };

  validNoClash.sort(sortFn);
  withClashes.sort(sortFn);

  // Return non-clashing first, followed by clashing options so the user can inspect all
  const sorted = [...validNoClash, ...withClashes];
  const limit = options.maxCombinations || 60;
  return sorted.slice(0, limit);
}
