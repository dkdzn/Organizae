import React, { useState } from 'react';
import { AppData, Transaction } from '../types';
import { Card, Button, Modal, Input, Select } from './ui/Common';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Edit2,
  Trash2,
  Wallet
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceProps {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
}

export default function Finance({ appData, setAppData }: FinanceProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: 'Lazer',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const filteredTransactions = appData.transactions
    .filter(t => filter === 'ALL' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      type: formData.type,
      category: formData.category,
      date: formData.date
    };
    
    setAppData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
    
    setShowAddModal(false);
    setFormData({
      description: '',
      amount: '',
      type: 'EXPENSE',
      category: 'Lazer',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const categories = formData.type === 'EXPENSE' 
    ? ['Alimentação', 'Moradia', 'Lazer', 'Saúde', 'Transporte', 'Outros']
    : ['Salário', 'Freelance', 'Investimento', 'Outros'];

  const handleDeleteTransaction = (id: string) => {
    setAppData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransactionId) return;

    setAppData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => 
        t.id === editingTransactionId 
          ? {
              ...t,
              description: formData.description,
              amount: parseFloat(formData.amount) || 0,
              type: formData.type,
              category: formData.category,
              date: formData.date
            }
          : t
      )
    }));

    setShowEditModal(false);
    setEditingTransactionId(null);
    setFormData({
      description: '',
      amount: '',
      type: 'EXPENSE',
      category: 'Lazer',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  return (
    <div className="space-y-8">
      {/* Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <div className="flex rounded-xl bg-white border border-slate-100 p-1 shadow-sm shrink-0">
              <button 
                onClick={() => setFilter('ALL')}
                className={cn(
                  "rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === 'ALL' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900"
                )}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('INCOME')}
                className={cn(
                  "rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === 'INCOME' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900"
                )}
              >
                Receitas
              </button>
              <button 
                onClick={() => setFilter('EXPENSE')}
                className={cn(
                  "rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === 'EXPENSE' ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-900"
                )}
              >
                Despesas
              </button>
            </div>
        </div>

        <Button 
          onClick={() => setShowAddModal(true)} 
          className="gap-2 rounded-2xl h-14 sm:h-12 bg-indigo-600 px-6 font-bold shadow-xl shadow-indigo-100/50 w-full sm:w-auto"
        >
          <Plus size={18} />
          Registrar Transação
        </Button>
      </div>

      <Card className="overflow-hidden p-0 border-slate-100 shadow-xl shadow-slate-100/50">
        <div className="border-b border-slate-50 p-8">
          <h3 className="text-xl font-bold">Histórico de Transações</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas movimentações</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5 text-center">Categoria</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5 text-right">Valor</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="whitespace-nowrap px-8 py-5 text-sm font-medium text-slate-400">
                    {format(new Date(t.date), 'dd MMM yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900">{t.description}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {t.type === 'INCOME' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <ArrowUpCircle size={16} />
                        <span className="text-[10px] uppercase tracking-widest text-emerald-500">Entrada</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 font-bold">
                        <ArrowDownCircle size={16} />
                        <span className="text-[10px] uppercase tracking-widest text-red-400">Saída</span>
                      </div>
                    )}
                  </td>
                  <td className={`whitespace-nowrap px-8 py-5 text-right text-sm font-black ${
                    t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(t)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Wallet size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Registrar Transação">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Descrição" 
            placeholder="Ex: Aluguel, Supermercado..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor (R$)" 
              type="number" 
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input 
              label="Data" 
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo</label>
              <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    formData.type === 'INCOME' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    formData.type === 'EXPENSE' ? "bg-white text-red-500 shadow-sm" : "text-slate-400"
                  )}
                >
                  Saída
                </button>
              </div>
            </div>
            <Select 
              label="Categoria" 
              options={categories}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full h-14 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
            Confirmar Registro
          </Button>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingTransactionId(null);
          setFormData({
            description: '',
            amount: '',
            type: 'EXPENSE',
            category: 'Lazer',
            date: format(new Date(), 'yyyy-MM-dd')
          });
        }} 
        title="Editar Transação"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <Input 
            label="Descrição" 
            placeholder="Ex: Aluguel, Supermercado..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Valor (R$)" 
              type="number" 
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input 
              label="Data" 
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo</label>
              <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    formData.type === 'INCOME' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    formData.type === 'EXPENSE' ? "bg-white text-red-500 shadow-sm" : "text-slate-400"
                  )}
                >
                  Saída
                </button>
              </div>
            </div>
            <Select 
              label="Categoria" 
              options={categories}
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full h-14 bg-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
            Salvar Alterações
          </Button>
        </form>
      </Modal>

    </div>
  );
}

// End of file cleanup
