import { ReactNode } from 'react';

interface BadgeProps {
  icon: ReactNode;
  text: string;
  color: 'blue' | 'teal' | 'emerald' | 'red' | 'slate';
}

const colors = {
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  teal: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
};

export function Badge({ icon, text, color }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {icon} {text}
    </span>
  );
}
