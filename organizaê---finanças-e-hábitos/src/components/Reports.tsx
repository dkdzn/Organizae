import { AppData } from '../types';
import { Card } from './ui/Common';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { FINANCE_CATEGORIES } from '../lib/constants';

interface ReportsProps {
  appData: AppData;
}

const COLORS = ['#000', '#2dd4bf', '#fb923c', '#818cf8', '#f87171', '#fbbf24', '#a78bfa', '#4ade80'];

export default function Reports({ appData }: ReportsProps) {
  const { transactions } = appData;

  // Expenses by Category
  const categoryData = FINANCE_CATEGORIES.map(cat => {
    const total = transactions
      .filter(t => t.category === cat && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  // Income vs Expense
  const summaryData = [
    {
      name: 'Receitas',
      valor: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
    },
    {
      name: 'Despesas',
      valor: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Pie Chart: Expenses by Category */}
        <Card className="flex flex-col border-slate-100">
          <div className="mb-8">
            <h3 className="text-xl font-bold">Gastos por Categoria</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Distribuição percentual mensal</p>
          </div>
          <div className="h-[350px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => formatCurrency(value)}
                   contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart: Income vs Expense */}
        <Card className="flex flex-col border-slate-100">
          <div className="mb-8">
            <h3 className="text-xl font-bold">Comparativo Mensal</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Entradas vs Saídas de caixa</p>
          </div>
          <div className="h-[350px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="border-slate-100">
        <h3 className="mb-10 text-xl font-bold">Destaques Financeiros</h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-[2rem] bg-slate-50 p-8 border border-slate-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maior Gasto</h4>
            <div className="mt-2 flex flex-col">
              <p className="text-2xl font-bold text-slate-900 leading-none">Moradia</p>
              <p className="text-sm font-bold text-indigo-600 mt-2">{formatCurrency(1200)}</p>
            </div>
          </div>
          <div className="rounded-[2rem] bg-emerald-50 p-8 border border-emerald-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Economia Acumulada</h4>
            <div className="mt-2 flex flex-col">
              <p className="text-2xl font-bold text-emerald-900 leading-none">{formatCurrency(2900)}</p>
              <p className="text-sm font-bold text-emerald-600 mt-2">Este Mês</p>
            </div>
          </div>
           <div className="rounded-[2rem] bg-indigo-50 p-8 border border-indigo-100">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Meta Mais Próxima</h4>
            <div className="mt-2 flex flex-col">
              <p className="text-2xl font-bold text-indigo-900 leading-none">Reserva</p>
              <p className="text-sm font-bold text-indigo-600 mt-2">35% concluído</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
