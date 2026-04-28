import { AppData, Transaction, Goal, Reminder } from '../types';

export const FINANCE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Compras',
  'Serviços',
  'Investimentos',
  'Outros',
];

export const HABIT_CATEGORIES = [
  'Saúde',
  'Produtividade',
  'Finanças',
  'Pessoal',
  'Estudo',
];

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_GOALS: Goal[] = [];

export const MOCK_REMINDERS: Reminder[] = [];

export const INITIAL_APP_DATA: AppData = {
  initialBalance: 0,
  transactions: MOCK_TRANSACTIONS,
  goals: MOCK_GOALS,
  reminders: MOCK_REMINDERS,
};
