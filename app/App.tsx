import { RouterProvider } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { router } from './routes';
import { GlobalGuards } from './components/GlobalGuards';

export default function App() {
  return (
    <AppProvider>
      <GlobalGuards />
      <RouterProvider router={router} />
    </AppProvider>
  );
}