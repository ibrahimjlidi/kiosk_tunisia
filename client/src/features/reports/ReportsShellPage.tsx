import React from 'react';
import { ReportsNav } from '../../components/ReportsNav';
import { SalesReportPage } from './SalesReportPage';
import { CreditAgingPage } from './CreditAgingPage';
import { AuditPage } from './AuditPage';
import { AnalyticsPage } from './AnalyticsPage';

export const ReportsShellPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <ReportsNav />
      <div className="space-y-6">
        <SalesReportPage />
        <AuditPage />
        <AnalyticsPage />
        <CreditAgingPage />
      </div>
    </div>
  );
};
