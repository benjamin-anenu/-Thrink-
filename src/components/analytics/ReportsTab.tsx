
import React from 'react';
import ProjectSelector from '@/components/reports/ProjectSelector';
import RecipientSelector from '@/components/reports/RecipientSelector';
import ReportScheduler from '@/components/reports/ReportScheduler';

interface ReportsTabProps {
  selectedProject: string;
  onProjectChange: (project: string) => void;
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  onScheduleReport: (config: any) => void;
  onDownloadReport: (type: string, dateRange: any) => void;
  onSendReport: (type: string, dateRange: any) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
  selectedProject,
  onProjectChange,
  selectedRecipients,
  onRecipientsChange,
  onScheduleReport,
  onDownloadReport,
  onSendReport
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <ProjectSelector 
          selectedProject={selectedProject}
          onProjectChange={onProjectChange}
        />
        <RecipientSelector
          selectedRecipients={selectedRecipients}
          onRecipientsChange={onRecipientsChange}
        />
      </div>
      <div className="lg:col-span-2">
        <ReportScheduler
          onScheduleReport={onScheduleReport}
          onDownloadReport={onDownloadReport}
          onSendReport={onSendReport}
        />
      </div>
    </div>
  );
};

export default ReportsTab;
