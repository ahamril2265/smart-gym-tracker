import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Decode token payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;

        // If allowedRoles is provided, check if user has permission
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            // User is logged in but unauthorized for this route
            // Redirect to their appropriate dashboard
            if (userRole === 'admin') return <Navigate to="/admin" replace />;
            if (userRole === 'trainer') return <Navigate to="/trainer" replace />;
            return <Navigate to="/dashboard" replace />;
        }

        // Authorized
        return children;

    } catch (e) {
        console.error("Invalid token", e);
        localStorage.removeItem("token");
        return <Navigate to="/login" replace />;
    }
}
