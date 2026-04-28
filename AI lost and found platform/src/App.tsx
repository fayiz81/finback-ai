import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";

// ── Code splitting: lazy-load heavy pages ─────────────────────────────────────
const Home           = lazy(() => import("@/pages/Home"));
const Dashboard      = lazy(() => import("@/pages/Dashboard"));
const Browse         = lazy(() => import("@/pages/Browse"));
const Submit         = lazy(() => import("@/pages/Submit"));
const Matches        = lazy(() => import("@/pages/Matches"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Auth           = lazy(() => import("@/pages/Auth"));
const EmailConfirmed = lazy(() => import("@/pages/EmailConfirmed"));

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Loading...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

function ProtectedRoute({ children, requireAuth = true, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <PageLoader />;
  if (requireAuth && !isAuthenticated) return <Navigate to={ROUTE_PATHS.AUTH} replace />;
  if (requireAdmin && !isAdmin()) return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;

  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path={ROUTE_PATHS.HOME} element={<Home />} />
        <Route path={ROUTE_PATHS.AUTH} element={<Auth />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />

        <Route path={ROUTE_PATHS.DASHBOARD} element={
          <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTE_PATHS.BROWSE} element={
          <ProtectedRoute><Layout><Browse /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTE_PATHS.SUBMIT} element={
          <ProtectedRoute><Layout><Submit /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTE_PATHS.MATCHES} element={
          <ProtectedRoute><Layout><Matches /></Layout></ProtectedRoute>
        } />
        <Route path={ROUTE_PATHS.ADMIN} element={
          <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#08080f' }}>
            <div style={{ textAlign:'center', padding: 32 }}>
              <div style={{ fontSize: 72, fontWeight: 900, background:'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>404</div>
              <p style={{ fontSize: 18, color:'rgba(255,255,255,0.5)', marginBottom: 24 }}>Page not found</p>
              <a href={isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.HOME}
                style={{ display:'inline-block', padding:'12px 28px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', borderRadius:12, fontWeight:600, textDecoration:'none' }}>
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AppContent />
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
