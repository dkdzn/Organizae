import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';
import { X } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <div
    className={cn(
      "bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-600",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-500",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-700",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs font-semibold uppercase tracking-wider",
    md: "px-6 py-2.5 text-sm font-bold",
    lg: "px-8 py-3 text-base font-bold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const MotionCard = motion.create(Card);

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  title: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 text-slate-400">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
    <input 
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100",
        props.className
      )}
    />
  </div>
);

export const Select = ({ 
  label, 
  options, 
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { 
  label?: string; 
  options: string[] | { value: string; label: string }[];
}) => (
  <div className="space-y-1.5">
    {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
    <div className="relative">
      <select 
        {...props}
        className={cn(
          "w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-indigo-50 focus:border-indigo-100 appearance-none",
          props.className
        )}
      >
        {options.map(opt => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
        <X size={16} className="rotate-45" />
      </div>
    </div>
  </div>
);
