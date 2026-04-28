import React, { useState } from 'react';
import { AppData, Goal, Frequency } from '../types';
import { Card, Button, MotionCard, Modal, Input, Select } from './ui/Common';
import { 
  Plus, 
  CheckCircle2, 
  Zap,
  Target,
  Bell,
  Trash2,
  X as CloseIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface RoutineProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
}

export default function Routine({ appData, setAppData }: RoutineProps) {
  const [activeFrequency, setActiveFrequency] = useState<Frequency>('DAILY');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Saúde',
    frequency: 'DAILY' as Frequency
  });
  const [reminderData, setReminderData] = useState({
    title: '',
    time: '09:00'
  });

  const filteredGoals = appData.goals.filter(g => g.frequency === activeFrequency && g.type === 'HABIT');
  const financialGoals = appData.goals.filter(g => g.type === 'FINANCIAL');
  const reminders = appData.reminders;

  const toggleHabit = (goalId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setAppData(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          const isCompleted = g.completedDates.includes(today);
          return {
            ...g,
            completedDates: isCompleted 
              ? g.completedDates.filter(d => d !== today)
              : [...g.completedDates, today]
          };
        }
        return g;
      })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabit: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      category: formData.category,
      frequency: formData.frequency,
      type: 'HABIT',
      currentAmount: 0,
      targetAmount: 0,
      completedDates: []
    };

    setAppData(prev => ({
      ...prev,
      goals: [...prev.goals, newHabit]
    }));

    setShowAddModal(false);
    setFormData({ title: '', category: 'Saúde', frequency: activeFrequency });
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReminderId) {
      setAppData(prev => ({
        ...prev,
        reminders: prev.reminders.map(r => 
          r.id === editingReminderId 
            ? { ...r, title: reminderData.title, time: reminderData.time } 
            : r
        )
      }));
    } else {
      const newReminder = {
        id: Math.random().toString(36).substr(2, 9),
        title: reminderData.title,
        time: reminderData.time,
        active: true,
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // default to all days
      };

      setAppData(prev => ({
        ...prev,
        reminders: [...prev.reminders, newReminder]
      }));
    }

    setShowReminderModal(false);
    setEditingReminderId(null);
    setReminderData({ title: '', time: '09:00' });
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminderId(reminder.id);
    setReminderData({ title: reminder.title, time: reminder.time });
    setShowReminderModal(true);
  };

  const handleDeleteHabit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setAppData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const handleDeleteReminder = (id: string) => {
    setAppData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));
  };

  const toggleReminder = (id: string) => {
    setAppData(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, active: !r.active } : r)
    }));
  };

  const isCompletedToday = (goal: Goal) => {
    return goal.completedDates.includes(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Habits and Goals */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex rounded-2xl bg-white border border-slate-100 p-1 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as Frequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFrequency(f)}
                className={cn(
                  "rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  activeFrequency === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
                )}
              >
                {f === 'DAILY' ? 'Diário' : f === 'WEEKLY' ? 'Semanal' : 'Mensal'}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowAddModal(true)} variant="indigo" className="gap-2 rounded-2xl h-11">
            <Plus size={18} />
            Novo Hábito
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filteredGoals.map((goal) => (
            <MotionCard 
              key={goal.id}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "cursor-pointer transition-all border-slate-100 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-200",
                isCompletedToday(goal) ? "bg-indigo-50/50 border-indigo-200" : ""
              )}
              onClick={() => toggleHabit(goal.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all shadow-sm",
                    isCompletedToday(goal) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-lg font-bold transition-all text-slate-900",
                      isCompletedToday(goal) && "text-slate-400 line-through"
                    )}>
                      {goal.title}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{goal.category}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteHabit(e, goal.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Progresso este mês
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {goal.completedDates.length} registros
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (goal.completedDates.length / 30) * 100)}%` }}
                    className="h-full bg-indigo-600 transition-all rounded-full" 
                  />
                </div>
              </div>
            </MotionCard>
          ))}
          {filteredGoals.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-100 p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                 <Zap size={40} />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Nenhum hábito cadastrado</p>
              <Button onClick={() => setShowAddModal(true)} variant="ghost" className="mt-6 text-indigo-600 font-bold">Adicionar o primeiro</Button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Reminders */}
      <div className="space-y-8">
        <Card className="border-slate-100 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Lembretes</h3>
            <Button onClick={() => setShowReminderModal(true)} variant="ghost" size="sm" className="p-1 text-indigo-600">
              <Plus size={20} />
            </Button>
          </div>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </div>
                  <div 
                    onClick={() => handleEditReminder(reminder)}
                    className="cursor-pointer group-hover:translate-x-1 transition-transform"
                  >
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-indigo-600">{reminder.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{reminder.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => toggleReminder(reminder.id)}
                    className={cn(
                      "h-5 w-9 rounded-full relative transition-colors cursor-pointer p-1",
                      reminder.active ? "bg-slate-900" : "bg-slate-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: reminder.active ? 16 : 0 }}
                      className="h-3 w-3 rounded-full bg-white shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-black mb-2">Dica do Dia</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Acompanhe seu progresso e mantenha o foco nos seus objetivos financeiros e pessoais!
            </p>
            <Button className="mt-8 w-full bg-indigo-600 text-white rounded-2xl h-12 font-bold shadow-lg shadow-indigo-900/40">
              Ver Dicas
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/20 blur-3xl opacity-50 rounded-full"></div>
        </Card>
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Novo Hábito">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nome do Hábito" 
            placeholder="Ex: Beber 2L de água, Estudar 30min..."
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Frequência" 
              options={[
                { value: 'DAILY', label: 'Diário' },
                { value: 'WEEKLY', label: 'Semanal' },
                { value: 'MONTHLY', label: 'Mensal' }
              ]}
              value={formData.frequency}
              onChange={e => setFormData({ ...formData, frequency: e.target.value as Frequency })}
            />
            <Select 
              label="Categoria" 
              options={['Saúde', 'Estudos', 'Trabalho', 'Pessoal', 'Financeiro']}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full h-14 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
            Criar Hábito
          </Button>
        </form>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal 
        isOpen={showReminderModal} 
        onClose={() => {
          setShowReminderModal(false);
          setEditingReminderId(null);
          setReminderData({ title: '', time: '09:00' });
        }} 
        title={editingReminderId ? "Editar Lembrete" : "Novo Lembrete"}
      >
        <form onSubmit={handleReminderSubmit} className="space-y-6">
          <Input 
            label="Título" 
            placeholder="Ex: Tomar remédio, Academia..."
            value={reminderData.title}
            onChange={e => setReminderData({ ...reminderData, title: e.target.value })}
            required
          />
          <Input 
            label="Horário" 
            type="time"
            value={reminderData.time}
            onChange={e => setReminderData({ ...reminderData, time: e.target.value })}
            required
          />
          <Button type="submit" className="w-full h-14 bg-slate-900 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200">
            {editingReminderId ? "Salvar Alterações" : "Adicionar Lembrete"}
          </Button>
        </form>
      </Modal>

    </div>
  );
}


// End of file cleanup
