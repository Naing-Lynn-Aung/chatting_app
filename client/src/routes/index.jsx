import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import App from "../App";
import ChatRoom from "../pages/ChatRoom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFound from "../pages/NotFound";

export default function Index() {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingSpinner />;
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "/",
          element: !user ? <Navigate to='/login' /> : <ChatRoom />
        },
        {
          path: "/login",
          element: !user ? <Login /> : <Navigate to='/' />
        },
        {
          path: "/register",
          element: !user ? <Register /> : <Navigate to='/' />
        },
        {
          path: '*',
          element: <NotFound />
        }
      ]
    }
  ]);
  return (
    <RouterProvider router={router} />
  );
}
