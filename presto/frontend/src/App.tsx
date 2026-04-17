// External dependencies
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context providers for global state
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { StoreProvider } from './context/StoreContext';

// Global components
import { ErrorPopup } from './components/ErrorPopup';

// Layout & Pages
import { MainLayout } from './layouts/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EditPresentation } from './pages/EditPresentation';
import { PreviewPresentation } from './pages/PreviewPresentation';

/**
 * Higher-order component to protect routes that require authentication.
 * Redirects to login if no token is found.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Main application component that sets up routing and global providers.
 */
function App() {
  return (
    <ErrorProvider>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <ErrorPopup />
            <Routes>
              {/* Publicly accessible pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Presentation preview (publicly viewable by link) */}
              <Route path="/presentation/:id/preview" element={<PreviewPresentation />} />

              {/* Protected dashboard route */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              {/* Protected presentation editor route */}
              <Route path="/presentation/:id" element={<ProtectedRoute><EditPresentation /></ProtectedRoute>} />

              {/* 404 Fallback - redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </StoreProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;
