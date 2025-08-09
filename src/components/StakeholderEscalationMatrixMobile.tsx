import React from 'react';
import { DesktopRecommendation } from '@/components/ui/desktop-recommendation';

const StakeholderEscalationMatrixMobile: React.FC = () => {
  return (
    <DesktopRecommendation
      title="Escalation Matrix - Desktop Required"
      description="The escalation matrix is a complex configuration tool designed for desktop use. This feature includes detailed stakeholder assignments, trigger conditions, and system monitoring that requires a larger screen for optimal experience."
      showSimplified={false}
    />
  );
};

export default StakeholderEscalationMatrixMobile;