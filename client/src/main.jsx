import { createRoot } from 'react-dom/client';
import './index.css';
import Routes from './routes/index.jsx';
import AuthProvider from './contexts/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Routes />
  </AuthProvider>
);
