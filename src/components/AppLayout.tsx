import { TaskProvider } from '@/contexts/TaskContext';

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
