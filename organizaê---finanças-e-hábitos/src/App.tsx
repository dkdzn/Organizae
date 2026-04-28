/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CheckCircle2, 
  Bell,
  Search,
  X,
  Bot,
  AlarmClock
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { INITIAL_APP_DATA } from './lib/constants';
import { AppData, Transaction, Goal, Reminder } from './types';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Routine from './components/Routine';
import ChatAi from './components/ChatAi';
import { cn } from './lib/utils';
import { Button, Modal } from './components/ui/Common';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'finance' | 'routine' | 'chat';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<AppData>(INITIAL_APP_DATA);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [lastNotified, setLastNotified] = useState<Record<string, string>>({}); // reminderId: lastNotifiedDate (YYYY-MM-DD-HH:MM)

  // Initialization from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('organiza-app-data');
    if (savedData) {
      try {
        setAppData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    setLoading(false);
  }, []);

  // Persistent Update Wrapper
  const updateAppData = useCallback((updater: any) => {
    setAppData(prev => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem('organiza-app-data', JSON.stringify(nextState));
      return nextState;
    });
  }, []);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Reminder Logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday
      const currentTime = format(now, 'HH:mm');
      const todayStr = format(now, 'yyyy-MM-dd');
      const minuteKey = `${todayStr}-${currentTime}`;

      appData.reminders.forEach(reminder => {
        if (!reminder.active) return;
        
        // Check if already notified this minute
        if (lastNotified[reminder.id] === minuteKey) return;

        // Check time and day
        if (reminder.time === currentTime && reminder.daysOfWeek.includes(currentDay)) {
          // Trigger Notification
          triggerNotification(reminder);
          setLastNotified(prev => ({ ...prev, [reminder.id]: minuteKey }));
        }
      });
    };

    const triggerNotification = (reminder: Reminder) => {
      // Browser Notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Organizaê: Lembrete!", {
          body: reminder.title,
          icon: "/pwa-192x192.png" // Using a generic icon path or app logo if available
        });
      }

      // App Popup
      setActiveReminder(reminder);
      
      // If mobile, try to vibrate
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    };

    const interval = setInterval(checkReminders, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [appData.reminders, lastNotified]);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'finance', label: 'Finanças', icon: Wallet },
    { id: 'routine', label: 'Rotina', icon: CheckCircle2 },
    { id: 'chat', label: 'Conversar com Zé', icon: Bot },
  ];

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const totalIncome = appData.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = appData.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = (appData.initialBalance ?? 0) + totalIncome - totalExpense;

  const getFinanceStatus = () => {
    // BOM: Saldo > 50 ou receitas superando despesas significativamente
    if (currentBalance > 50 || (totalIncome > totalExpense * 1.2 && currentBalance > 0)) {
      return { label: 'Bom', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    }
    // RUIM: Saldo < 0 ou despesas superando receitas significativamente
    if (currentBalance < 0 || (totalExpense > totalIncome * 1.2)) {
      return { label: 'Ruim', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
    }
    // INSTÁVEL: Saldo entre 0 e 50 ou equilíbrio
    return { label: 'Instável', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
  };

  const status = getFinanceStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-surface-bg)] text-slate-800">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {(isMobileMenuOpen || (isSidebarOpen && window.innerWidth < 1024)) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSidebarOpen(false);
            }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white transition-all duration-300 shadow-xl lg:relative lg:shadow-sm",
          isMobileMenuOpen ? "w-80" : (isSidebarOpen ? "w-72" : "w-24"),
          !isMobileMenuOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-24 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
              title="Alternar Barra Lateral"
            >
              <CheckCircle2 size={26} />
            </button>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="font-display text-2xl font-black tracking-tight text-slate-900 overflow-hidden whitespace-nowrap">Organizaê</span>
            )}
          </div>
          {isMobileMenuOpen && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-all">
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-4 transition-all",
                activeTab === item.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200 font-bold" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900",
                (!isSidebarOpen && !isMobileMenuOpen) && "justify-center px-0"
              )}
            >
              <item.icon size={22} className="shrink-0" />
              {(isSidebarOpen || isMobileMenuOpen) && (
                <span className="text-sm tracking-wide overflow-hidden whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className={cn(
            "flex items-center bg-slate-50 rounded-2xl p-3",
            (!isSidebarOpen && !isMobileMenuOpen) && "justify-center"
          )}>
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-slate-900">Usuário</p>
                <p className="truncate text-[10px] uppercase font-black text-slate-400 tracking-widest">Premium</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-24 items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 lg:hidden hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCircle2 size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="font-display text-xl lg:text-2xl font-black text-slate-900">
                {navItems.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative hidden xl:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="w-64 rounded-2xl bg-white border border-slate-100 py-3 pl-12 pr-6 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn("hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500", status.bg, status.color.replace('bg-', 'border-').replace('500', '100'))}>
                <div className="relative flex h-2 w-2">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", status.color)}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", status.color)}></span>
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-wider", status.text)}>{status.label}</span>
              </div>
              <button className="relative rounded-2xl bg-white border border-slate-100 p-3 text-slate-500 hover:text-slate-900 hover:shadow-md transition-all">
                <Bell size={20} />
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-10 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <div className="flex flex-col gap-6">
                {activeTab === 'dashboard' && <Dashboard appData={appData} setAppData={updateAppData} />}
                {activeTab === 'finance' && <Finance appData={appData} setAppData={updateAppData} />}
                {activeTab === 'routine' && <Routine appData={appData} setAppData={updateAppData} />}
                {activeTab === 'chat' && <ChatAi />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Reminder Popup */}
      <Modal 
        isOpen={!!activeReminder} 
        onClose={() => setActiveReminder(null)} 
        title="Lembrete Ativo!"
      >
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 animate-bounce">
            <AlarmClock size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">{activeReminder?.title}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Horário programado: {activeReminder?.time}</p>
          
          <div className="grid grid-cols-1 gap-4 w-full">
            <Button 
              onClick={() => setActiveReminder(null)} 
              className="h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200"
            >
              Entendido!
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setActiveReminder(null);
                setActiveTab('routine');
              }}
              className="h-14 rounded-2xl font-bold border-slate-100"
            >
              Ver Rotina
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
