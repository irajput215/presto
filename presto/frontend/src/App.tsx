import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { StoreProvider } from './context/StoreContext';
import { ErrorPopup } from './components/ErrorPopup';

// Layout & Pages
import { MainLayout } from './layouts/MainLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EditPresentation } from './pages/EditPresentation';
import { PreviewPresentation } from './pages/PreviewPresentation';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  // Send guests to login before they can edit or view private pages.
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    // Providers stay at the top so every page can use auth, store, and errors.
    <ErrorProvider>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <ErrorPopup />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/presentation/:id/preview" element={<PreviewPresentation />} />

              {/* Protected Routes inside MainLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              <Route path="/presentation/:id" element={<ProtectedRoute><EditPresentation /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </StoreProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}

export default App;
