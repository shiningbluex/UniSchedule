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
    if (a.clashesCount !== b.clashesCount) {
      return a.clashesCount - b.clashesCount;
    }

    if (options.freeDayPreference && options.freeDayPreference !== 'none') {
      const aHasFree = !a.activities.some((act) => act.day === options.freeDayPreference);
      const bHasFree = !b.activities.some((act) => act.day === options.freeDayPreference);
      if (aHasFree !== bHasFree) return aHasFree ? -1 : 1;
    }

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

    if (a.gapHours !== b.gapHours) {
      return a.gapHours - b.gapHours;
    }

    return b.freeDaysCount - a.freeDaysCount;
  };

  validNoClash.sort(sortFn);
  withClashes.sort(sortFn);

  const sorted = [...validNoClash, ...withClashes];
  const limit = options.maxCombinations || 50;
  return sorted.slice(0, limit);
}
