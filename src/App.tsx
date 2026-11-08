import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WeeklyTimetable } from './components/WeeklyTimetable';
import { SemesterSimulator } from './components/SemesterSimulator';
import { CourseCatalog } from './components/CourseCatalog';
import { PlanComparator } from './components/PlanComparator';
import { ExportAndMobileGuide } from './components/ExportAndMobileGuide';
import { ActivityModal } from './components/ActivityModal';
import type {
  SchedulePlan,
  Course,
  ScheduleActivity,
  DayOfWeek,
  ScheduleCombination,
} from './types/schedule';
import { INITIAL_COURSES, createDefaultInitialPlan } from './utils/initialData';
import { findScheduleClashes, normalizeTimeString } from './utils/time';

const LOCAL_STORAGE_KEY_PLANS = 'unihorario_plans_v1';
const LOCAL_STORAGE_KEY_COURSES = 'unihorario_courses_v1';
const LOCAL_STORAGE_KEY_ACTIVE_PLAN = 'unihorario_active_plan_v1';
const LOCAL_STORAGE_KEY_USER = 'unihorario_username_v1';
const LOCAL_STORAGE_KEY_THEME = 'unihorario_theme_v1';

// Helper to sanitize and normalize times (e.g. converting 11:00 - 01:00 to 11:00 - 13:00)
function sanitizeCourseSlots(coursesList: Course[]): Course[] {
  return coursesList.map((course) => ({
    ...course,
    sections: course.sections.map((sec) => ({
      ...sec,
      slots: sec.slots.map((slot) => {
        const normStart = normalizeTimeString(slot.startTime);
        const normEnd = normalizeTimeString(slot.endTime, normStart);
        return {
          ...slot,
          startTime: normStart,
          endTime: normEnd,
        };
      }),
    })),
  }));
}

function sanitizePlanActivities(plansList: SchedulePlan[]): SchedulePlan[] {
  return plansList.map((plan) => ({
    ...plan,
    activities: plan.activities.map((act) => {
      const normStart = normalizeTimeString(act.startTime);
      const normEnd = normalizeTimeString(act.endTime, normStart);
      return {
        ...act,
        startTime: normStart,
        endTime: normEnd,
      };
    }),
  }));
}

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return saved !== null ? saved === 'dark' : true;
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_USER) || 'Andrea Rivera';
  });

  const [activeTab, setActiveTab] = useState<string>('horario');

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COURSES);
      if (saved) {
        return sanitizeCourseSlots(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return sanitizeCourseSlots(INITIAL_COURSES);
  });

  const [plans, setPlans] = useState<SchedulePlan[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PLANS);
      if (saved) {
        return sanitizePlanActivities(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
    return sanitizePlanActivities([createDefaultInitialPlan()]);
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_PLAN);
    return saved || 'plan-default';
  });

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ScheduleActivity | null>(null);
  const [defaultModalDay, setDefaultModalDay] = useState<DayOfWeek>('lunes');
  const [defaultModalStartTime, setDefaultModalStartTime] = useState<string>('09:00');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PLANS, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_PLAN, activePlanId);
  }, [activePlanId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const currentPlan =
    plans.find((p) => p.id === activePlanId) || plans[0] || createDefaultInitialPlan();

  const currentClashes = findScheduleClashes(currentPlan.activities);

  const handleSaveActivity = (newActivitiesData: Omit<ScheduleActivity, 'id'>[]) => {
    const newActivities: ScheduleActivity[] = newActivitiesData.map((data, index) => {
      const normStart = normalizeTimeString(data.startTime);
      const normEnd = normalizeTimeString(data.endTime, normStart);
      return {
        ...data,
        startTime: normStart,
        endTime: normEnd,
        id: `act-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      };
    });

    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id === currentPlan.id) {
          if (editingActivity) {
            const filtered = editingActivity.groupKey
              ? p.activities.filter((a) => a.groupKey !== editingActivity.groupKey)
              : p.activities.filter((a) => a.id !== editingActivity.id);
            return {
              ...p,
              activities: [...filtered, ...newActivities],
            };
          }
          return {
            ...p,
            activities: [...p.activities, ...newActivities],
          };
        }
        return p;
      })
    );
  };

  const handleDeleteActivity = (activityId: string, groupKey?: string) => {
    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id === currentPlan.id) {
          if (groupKey) {
            return {
              ...p,
              activities: p.activities.filter((a) => a.groupKey !== groupKey),
            };
          }
          return {
            ...p,
            activities: p.activities.filter((a) => a.id !== activityId),
          };
        }
        return p;
      })
    );
    setIsActivityModalOpen(false);
  };

  const handleOpenAddModal = (day: DayOfWeek = 'lunes', startTime: string = '09:00') => {
    setEditingActivity(null);
    setDefaultModalDay(day);
    setDefaultModalStartTime(startTime);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditModal = (activity: ScheduleActivity) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleApplyCombination = (
    combo: ScheduleCombination,
    createNewPlan = false
  ) => {
    const sanitizedActs = combo.activities.map((act) => {
      const normStart = normalizeTimeString(act.startTime);
      const normEnd = normalizeTimeString(act.endTime, normStart);
      return {
        ...act,
        startTime: normStart,
        endTime: normEnd,
      };
    });

    if (createNewPlan) {
      const newPlan: SchedulePlan = {
        id: `plan-${Date.now()}`,
        name: `${combo.name} (Generado)`,
        createdAt: Date.now(),
        activities: sanitizedActs,
        color: '#8b5cf6',
      };
      setPlans((prev) => [...prev, newPlan]);
      setActivePlanId(newPlan.id);
    } else {
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id === currentPlan.id) {
            return {
              ...p,
              activities: sanitizedActs,
            };
          }
          return p;
        })
      );
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#0b0e14] text-slate-100'
          : 'bg-slate-100 text-slate-800'
      }`}
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        userName={userName}
        setUserName={setUserName}
        clashesCount={Math.ceil(currentClashes.size / 2)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {activeTab === 'horario' && (
          <WeeklyTimetable
            activities={currentPlan.activities}
            planName={currentPlan.name}
            courses={courses}
            onAddActivity={handleOpenAddModal}
            onEditActivity={handleOpenEditModal}
            onDeleteActivity={handleDeleteActivity}
            onOpenSimulator={() => setActiveTab('simulador')}
          />
        )}

        {activeTab === 'simulador' && (
          <SemesterSimulator
            courses={courses}
            onApplyCombination={handleApplyCombination}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'materias' && (
          <CourseCatalog
            courses={courses}
            setCourses={setCourses}
            onOpenSimulator={() => setActiveTab('simulador')}
          />
        )}

        {activeTab === 'planes' && (
          <PlanComparator
            plans={plans}
            activePlanId={activePlanId}
            setActivePlanId={setActivePlanId}
            setPlans={setPlans}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'exportar' && (
          <ExportAndMobileGuide
            currentPlan={currentPlan}
            plans={plans}
            courses={courses}
            setPlans={setPlans}
            setCourses={setCourses}
          />
        )}
      </main>

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        initialData={editingActivity}
        courses={courses}
        defaultDay={defaultModalDay}
        defaultStartTime={defaultModalStartTime}
      />
    </div>
  );
}

export default App;
