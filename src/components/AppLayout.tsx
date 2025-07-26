import { TaskProvider } from '@/contexts/TaskContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ToastProvider } from '@/components/ui/toast';

// Wrap your app content with TaskProvider
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <WorkspaceProvider>
      <TaskProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TaskProvider>
    </WorkspaceProvider>
  );
};

export default AppLayout;
