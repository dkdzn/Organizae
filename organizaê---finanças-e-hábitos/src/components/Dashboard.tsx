import { useState } from 'react';
import { AppData, Goal, Transaction } from '../types';
import { Card, MotionCard, Button, Modal, Input } from './ui/Common';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

interface DashboardProps {
  appData: AppData;
  setAppData: (data: AppData) => void;
}

export default function Dashboard({ appData, setAppData }: DashboardProps) {
  const { transactions, goals, initialBalance = 0 } = appData;
  
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempBalance, setTempBalance] = useState((initialBalance ?? 0).toString());
  const [tempGoal, setTempGoal] = useState({
    title: goals[0]?.title || '',
    current: (goals[0]?.currentAmount || 0).toString(),
    target: (goals[0]?.targetAmount || 0).toString()
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = (initialBalance ?? 0) + totalIncome - totalExpense;

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const income = transactions
      .filter(t => t.date === dateStr && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.date === dateStr && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: format(d, 'EEE', { locale: ptBR }),
      income,
      expense: -expense,
      net: income - expense
    };
  });

  const handleUpdateBalance = () => {
    setAppData({
      ...appData,
      initialBalance: parseFloat(tempBalance) || 0
    });
    setShowBalanceModal(false);
  };

  const handleUpdateGoal = () => {
    const newGoals = [...appData.goals];
    if (newGoals.length > 0) {
      newGoals[0] = {
        ...newGoals[0],
        title: tempGoal.title,
        currentAmount: parseFloat(tempGoal.current) || 0,
        targetAmount: parseFloat(tempGoal.target) || 0
      };
    }
    setAppData({ ...appData, goals: newGoals });
    setShowGoalModal(false);
  };

  const mainGoal = goals[0];
  const goalProgress = mainGoal ? (mainGoal.currentAmount / mainGoal.targetAmount) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Organizaê</h1>
        <p className="text-slate-400 font-medium tracking-wide">Seu controle financeiro e pessoal inteligente</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
        {/* Main Balance Card */}
      <MotionCard 
        whileHover={{ y: -4 }}
        className="lg:col-span-4 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-slate-400 text-sm font-medium">Saldo Disponível</p>
              <button 
                onClick={() => setShowBalanceModal(true)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                title="Editar saldo inicial"
              >
                <Edit2 size={12} />
              </button>
            </div>
            <h3 className="text-5xl font-black tracking-tight text-white">{formatCurrency(currentBalance)}</h3>
            <div className="mt-8 flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-12">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Entradas</p>
                  <p className="text-emerald-400 font-bold text-lg">+{formatCurrency(totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black">Saídas</p>
                  <p className="text-red-400 font-bold text-lg">-{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500 opacity-20 blur-[100px]"></div>
        <div className="absolute left-1/4 top-0 w-48 h-48 bg-emerald-500 opacity-10 blur-[80px]"></div>
      </MotionCard>

      {/* Weekly Goal Card */}
      <Card className="lg:col-span-2 bg-indigo-600 border-indigo-400 flex flex-col justify-center relative overflow-hidden text-white min-h-[220px]">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-indigo-200" />
              <h2 className="font-bold text-white">Meta Financeira</h2>
            </div>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="p-2 hover:bg-white/10 rounded-xl text-indigo-200 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </div>
          
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">{mainGoal?.title || 'Defina uma meta'}</p>
          <div className="text-3xl font-black text-white">
            {formatCurrency(mainGoal?.currentAmount || 0)}
            <span className="text-sm font-bold text-indigo-200 block mt-1">Meta: {formatCurrency(mainGoal?.targetAmount || 0)}</span>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">
              <span>Progresso</span>
              <span>{Math.round(goalProgress)}%</span>
            </div>
            <div className="w-full bg-indigo-800/50 h-3 rounded-full overflow-hidden border border-indigo-500/30">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                className="bg-white h-full rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
      </Card>

      {/* Main Chart Card */}
      <Card className="lg:col-span-3 flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">Fluxo Financeiro</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Análise dos últimos 7 dias</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase text-slate-400">Ganhos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-black uppercase text-slate-400">Gastos</span>
            </div>
          </div>
        </div>
        <div className="h-[280px] w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 700 }}
                dy={12}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  padding: '16px'
                }}
                formatter={(value: number) => [formatCurrency(Math.abs(value)), value >= 0 ? "Ganho" : "Gasto"]}
              />
              <Bar dataKey="income" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" stackId="a" fill="#EF4444" radius={[0, 0, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Purchases */}
      <Card className="lg:col-span-3 flex flex-col overflow-hidden max-h-[420px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900">Gastos Recentes</h2>
          <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 px-4">Ver Tudo</Button>
        </div>
        <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2 pb-4">
          {transactions.filter(t => t.type === 'EXPENSE').length > 0 ? (
            transactions.filter(t => t.type === 'EXPENSE').slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-slate-100 rounded-[1.5rem] transition-all group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-xl shadow-sm">
                    {t.category === 'Moradia' ? '🏠' : t.category === 'Alimentação' ? '🍔' : t.category === 'Lazer' ? '🍿' : '💳'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.category} • {format(new Date(t.date), 'dd MMM', { locale: ptBR })}</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900 group-hover:text-red-500 transition-colors">-{formatCurrency(t.amount)}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <Clock size={32} strokeWidth={1} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum gasto registrado</p>
            </div>
          )}
        </div>
      </Card>
    </div>

      {/* Modals */}
      <Modal isOpen={showBalanceModal} onClose={() => setShowBalanceModal(false)} title="Editar Saldo Disponível">
        <div className="space-y-6">
          <Input 
            label="Novo Saldo Inicial" 
            type="number" 
            value={tempBalance}
            onChange={(e) => setTempBalance(e.target.value)}
            placeholder="Ex: 5000"
          />
          <p className="text-xs text-slate-400">Este valor será somado às suas entradas e subtraído das saídas para calcular o saldo atual.</p>
          <Button className="w-full h-14 bg-slate-900 rounded-2xl" onClick={handleUpdateBalance}>Salvar Alterações</Button>
        </div>
      </Modal>

      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="Editar Meta Financeira">
        <div className="space-y-6">
          <Input 
            label="Nome da Meta" 
            value={tempGoal.title}
            onChange={(e) => setTempGoal({ ...tempGoal, title: e.target.value })}
            placeholder="Ex: Reserva de Emergência"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor Atual" 
              type="number"
              value={tempGoal.current}
              onChange={(e) => setTempGoal({ ...tempGoal, current: e.target.value })}
            />
            <Input 
              label="Valor Final (Meta)" 
              type="number"
              value={tempGoal.target}
              onChange={(e) => setTempGoal({ ...tempGoal, target: e.target.value })}
            />
          </div>
          <Button className="w-full h-14 bg-indigo-600 rounded-2xl" onClick={handleUpdateGoal}>Atualizar Meta</Button>
        </div>
      </Modal>
    </div>
  );
}
