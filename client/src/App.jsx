import { Outlet } from 'react-router-dom';
import './App.css';
import { NotificationProvider } from './contexts/NotificationProvider';
function App() {

  return (
    <>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </>
  );
}

export default App;
