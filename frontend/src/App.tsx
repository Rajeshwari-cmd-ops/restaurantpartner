import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast';
import { WorkflowProvider } from './context/WorkflowContext';
import './styles/global.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <WorkflowProvider>
          <AppRoutes />
        </WorkflowProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
