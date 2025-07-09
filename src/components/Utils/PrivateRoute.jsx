import { Navigate } from 'react-router-dom';
import { userAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { session, loading } = userAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#202020]"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return children;
};

export default PrivateRoute;
