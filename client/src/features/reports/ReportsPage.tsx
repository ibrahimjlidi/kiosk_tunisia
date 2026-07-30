import React from 'react';
import { ReportsNav } from '../../components/ReportsNav';

export const ReportsPage: React.FC = () => (
  <div className="space-y-6">
    <ReportsNav />
    <div className="glass-panel p-6">
      <h2 className="text-xl font-bold text-white">Reports</h2>
      <p className="text-sm text-slate-400">Select a report from the tabs above.</p>
    </div>
  </div>
);
