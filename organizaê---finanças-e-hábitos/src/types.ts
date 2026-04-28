export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export type GoalType = 'FINANCIAL' | 'HABIT';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  frequency: Frequency;
  completedDates: string[]; // ISO Strings of completion dates
  deadline?: string;
  category: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  daysOfWeek: number[]; // 0-6
  active: boolean;
}

export interface AppData {
  initialBalance: number;
  transactions: Transaction[];
  goals: Goal[];
  reminders: Reminder[];
}
