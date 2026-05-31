import { RouterProvider } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { router } from './routes';
import { GlobalGuards } from './components/GlobalGuards';
import { useImageProtection } from './hooks/useImageProtection';

export default function App() {
  // Apply image protection globally
  useImageProtection();

  return (
    <AppProvider>
      <GlobalGuards />
      <RouterProvider router={router} />
    </AppProvider>
  );
}