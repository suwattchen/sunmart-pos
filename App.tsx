
import React from 'react';
import { SystemProvider, useSystem } from './contexts/SystemContext';
import { LoginScreen } from './features/auth/LoginScreen';
import { POSScreen } from './features/pos/POSScreen';
import { BackOfficeScreen } from './features/admin/BackOfficeScreen';
import { DockerDashboard } from './features/admin/DockerDashboard';

// The Main Router Component
const AppRouter = () => {
  const { currentUser } = useSystem();

  if (!currentUser) {
    return <LoginScreen />;
  }

  // Routing Logic
  switch (currentUser.role) {
    case 'SUPER_ADMIN':
      return <DockerDashboard />;
    case 'TENANT_ADMIN':
      // Tenant Admin sees the App Launcher (BackOffice), which can then launch POS
      return <BackOfficeScreen />;
    case 'CASHIER':
      // Cashier goes straight to POS (restricted view)
      return <POSScreen />;
    default:
      return <LoginScreen />;
  }
};

// Root App Component wrapped in Logic Provider
export default function App() {
  return (
    <SystemProvider>
      <AppRouter />
    </SystemProvider>
  );
}
