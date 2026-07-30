import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Clock, ShieldCheck } from 'lucide-react';

const ReportLink: React.FC<{ to: string; label: string; icon: React.ReactNode }> = ({ to, label, icon }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 transition-colors ${
        active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const ReportsNav: React.FC = () => (
  <div className="flex flex-wrap gap-2 mb-4">
    <ReportLink to="/reports/sales" icon={<BarChart3 className="w-4 h-4" />} label="Sales Report" />
    <ReportLink to="/reports/credits" icon={<Clock className="w-4 h-4" />} label="Credit Aging" />
  </div>
);
