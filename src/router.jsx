import { createBrowserRouter } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/Utils/PrivateRoute';

export const router = createBrowserRouter([
    {path: '/', element: <Auth />},
    {path: '/auth', element: <Auth />},
    {path: '/dashboard', element: <PrivateRoute><Dashboard /></PrivateRoute>},
]);