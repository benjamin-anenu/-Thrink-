
import React from 'react';

interface EmailTemplateProps {
  reportType: string;
  reportData: any;
  format: string;
  timestamp: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ reportType, reportData, format, timestamp }) => {
  const formatReportType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h2 style={{ color: '#2563eb' }}>📊 {formatReportType(reportType)} Report</h2>
      <p><strong>Generated on:</strong> {timestamp}</p>
      <p><strong>Format:</strong> {format.toUpperCase()}</p>
      
      <h3 style={{ color: '#374151', marginTop: '20px' }}>Report Summary</h3>
      {reportData?.summary && (
        <ul style={{ paddingLeft: '20px' }}>
          <li>Total Projects: {reportData.summary.totalProjects || 0}</li>
          <li>Active Projects: {reportData.summary.activeProjects || 0}</li>
          <li>Completed Projects: {reportData.summary.completedProjects || 0}</li>
          <li>Total Resources: {reportData.summary.totalResources || 0}</li>
        </ul>
      )}
      
      <h3 style={{ color: '#374151', marginTop: '20px' }}>Report Details</h3>
      <p>This report was generated automatically and contains the latest project and resource information.</p>
      
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        This email was sent from your Project Management System. 
        If you have any questions, please contact your system administrator.
      </p>
    </div>
  );
};

export default EmailTemplate;
