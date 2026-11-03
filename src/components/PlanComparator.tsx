import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  Check,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import type { SchedulePlan } from '../types/schedule';
import { DAYS_CONFIG } from '../types/schedule';
import { findScheduleClashes, calculateScheduleMetrics } from '../utils/time';

interface PlanComparatorProps {
  plans: SchedulePlan[];
  activePlanId: string;
  setActivePlanId: (id: string) => void;
  setPlans: React.Dispatch<React.SetStateAction<SchedulePlan[]>>;
  onSelectTab: (tab: string) => void;
}

export const PlanComparator: React.FC<PlanComparatorProps> = ({
  plans,
  activePlanId,
  setActivePlanId,
  setPlans,
  onSelectTab,
}) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeDays = DAYS_CONFIG.map((d) => d.id);

  const handleCreateNewPlan = () => {
    const newPlan: SchedulePlan = {
      id: `plan-${Date.now()}`,
      name: `Opción #${plans.length + 1}`,
      createdAt: Date.now(),
      activities: [],
      color: '#3b82f6',
    };
    setPlans([...plans, newPlan]);
    setActivePlanId(newPlan.id);
  };

  const handleDuplicatePlan = (plan: SchedulePlan) => {
    const duplicated: SchedulePlan = {
      id: `plan-${Date.now()}`,
      name: `${plan.name} (Copia)`,
      createdAt: Date.now(),
      activities: plan.activities.map((a) => ({
        ...a,
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      })),
      color: plan.color,
    };
    setPlans([...plans, duplicated]);
    setActivePlanId(duplicated.id);
  };

  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) {
      alert('Debes mantener al menos un plan.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta opción de horario?')) {
      const remaining = plans.filter((p) => p.id !== planId);
      setPlans(remaining);
      if (activePlanId === planId) {
        setActivePlanId(remaining[0].id);
      }
    }
  };

  const startRename = (plan: SchedulePlan) => {
    setEditingPlanId(plan.id);
    setEditingName(plan.name);
  };

  const saveRename = (planId: string) => {
    if (editingName.trim()) {
      setPlans(
        plans.map((p) => (p.id === planId ? { ...p, name: editingName.trim() } : p))
      );
    }
    setEditingPlanId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111622] border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Comparador de Opciones y Borradores
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Crea distintas alternativas de horarios (por ejemplo, "Plan A: Mañanas libres", "Plan B: Viernes libre") y compáralas para decidir con cuál inscribirte en el semestre.
          </p>
        </div>

        <button
          onClick={handleCreateNewPlan}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Crear Nuevo Horario</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isActive = plan.id === activePlanId;
          const clashes = findScheduleClashes(plan.activities);
          const metrics = calculateScheduleMetrics(plan.activities, activeDays);

          return (
            <div
              key={plan.id}
              className={`bg-[#111622] border rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-500/80 shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingPlanId === plan.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveRename(plan.id)}
                          className="bg-slate-800 text-white px-2 py-1 rounded text-sm w-full outline-none border border-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={() => saveRename(plan.id)}
                          className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white truncate">
                          {plan.name}
                        </h3>
                        <button
                          onClick={() => startRename(plan)}
                          className="text-slate-500 hover:text-slate-300 p-0.5"
                          title="Cambiar nombre"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      {isActive && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          ● Activo en Pantalla
                        </span>
                      )}
                      {clashes.size === 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-400">
                          ✓ Sin Choques
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {Math.ceil(clashes.size / 2)} conflicto(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#141b2c] border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Materias programadas:</span>
                    <span className="font-semibold text-white">{plan.activities.length} bloques</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Horas semanales:</span>
                    <span className="font-semibold text-white">{metrics.totalHours} horas</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Días con clases:</span>
                    <span className="font-semibold text-white">{metrics.daysWithClassCount} de 6 días</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Días libres en la semana:</span>
                    <span className="font-semibold text-emerald-400">
                      {metrics.freeDaysCount} día(s) libres
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Horas muertas (huecos):</span>
                    <span className="font-semibold text-white">{metrics.gapHours}h</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400">Asignaturas:</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {Array.from(new Set(plan.activities.map((a) => a.title))).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded truncate max-w-[150px]"
                      >
                        {t}
                      </span>
                    ))}
                    {plan.activities.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">
                        Sin materias agregadas aún
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicatePlan(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Duplicar para probar variantes"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {plans.length > 1 && (
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Eliminar opción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isActive ? (
                  <button
                    onClick={() => onSelectTab('horario')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                  >
                    Ver en Calendario →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActivePlanId(plan.id);
                      onSelectTab('horario');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1c243c] hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    Seleccionar como Activo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
