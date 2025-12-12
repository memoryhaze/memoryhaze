import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
    children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but not admin → redirect to dashboard/home
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Admin → render children
    return <>{children}</>;
};
