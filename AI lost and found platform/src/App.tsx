import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Browse from "@/pages/Browse";
import Submit from "@/pages/Submit";
import Matches from "@/pages/Matches";
import AdminDashboard from "@/pages/AdminDashboard";
import Auth from "@/pages/Auth";
import EmailConfirmed from "@/pages/EmailConfirmed";
import { useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.AUTH} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Routes>
      <Route path={ROUTE_PATHS.HOME} element={<Home />} />
      <Route path={ROUTE_PATHS.AUTH} element={<Auth />} />

      {/* Email confirmation landing page */}
      <Route path="/email-confirmed" element={<EmailConfirmed />} />

      <Route
        path={ROUTE_PATHS.DASHBOARD}
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_PATHS.BROWSE}
        element={
          <ProtectedRoute>
            <Layout>
              <Browse />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_PATHS.SUBMIT}
        element={
          <ProtectedRoute>
            <Layout>
              <Submit />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTE_PATHS.MATCHES}
        element={
          <ProtectedRoute>
            <Layout>
              <Matches />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin — NO Layout wrapper, has its own full UI */}
      <Route
        path={ROUTE_PATHS.ADMIN}
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <p className="text-xl text-muted-foreground">Page not found</p>
              <a
                href={isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.HOME}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppContent />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
