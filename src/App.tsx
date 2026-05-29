import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell, canAccessView, getFirstAllowedView } from "./components/AppShell";
import type { AppView } from "./components/AppShell";
import { AdminConsolePage } from "./pages/AdminConsolePage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { api, getRefreshToken, setAuthToken, setRefreshToken, setSessionCallbacks } from "./services/api";
import { pathToView, viewToPath, VIEW_PATHS } from "./routes/viewRoutes";
import { useSessionStore } from "./store/sessionStore";

// ─── Componente de ruta protegida ─────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSessionStore((s) => s.session);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ─── Layout principal (sidebar + contenido) ───────────────────────────────────

function AppLayout() {
  const session    = useSessionStore((s) => s.session)!;
  const clearSession = useSessionStore((s) => s.clearSession);
  const location   = useLocation();
  const navigate   = useNavigate();

  // Derivar la vista activa del pathname actual
  const activeView: AppView = pathToView(location.pathname) ?? getFirstAllowedView(session.permissions);

  // Si la ruta no existe o el usuario no tiene acceso, redirigir a la primera permitida
  useEffect(() => {
    const view = pathToView(location.pathname);
    if (!view || !canAccessView(view, session.permissions)) {
      navigate(viewToPath(getFirstAllowedView(session.permissions)), { replace: true });
    }
  }, [location.pathname, session.permissions, navigate]);

  function handleViewChange(view: AppView) {
    navigate(viewToPath(view));
  }

  function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      api.logout(refreshToken).catch(() => undefined);
    }
    setAuthToken(null);
    setRefreshToken(null);
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <AppShell
      onLogout={handleLogout}
      activeView={activeView}
      onViewChange={handleViewChange}
      permissions={session.permissions}
    >
      <Routes>
        {/* POS / Punto de venta */}
        <Route path="/pos" element={<DashboardPage session={session} />} />

        {/* Todo lo demás va al AdminConsolePage con la vista activa */}
        {(Object.keys(VIEW_PATHS) as AppView[])
          .filter((v) => v !== "operations")
          .map((view) => (
            <Route
              key={view}
              path={VIEW_PATHS[view]}
              element={<AdminConsolePage session={session} activeView={view} />}
            />
          ))}

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={viewToPath(getFirstAllowedView(session.permissions))} replace />} />
      </Routes>
    </AppShell>
  );
}

// ─── Raíz de la app ───────────────────────────────────────────────────────────

export function App() {
  const session      = useSessionStore((s) => s.session);
  const setSession   = useSessionStore((s) => s.setSession);
  const clearSession = useSessionStore((s) => s.clearSession);
  const navigate     = useNavigate();
  const location     = useLocation();

  // ─── Registro de callbacks de refresh automático ────────────────────────────
  useEffect(() => {
    setSessionCallbacks(
      // Token renovado correctamente: actualiza el store con la nueva sesión
      (newSession) => {
        setAuthToken(newSession.accessToken);
        setRefreshToken(newSession.refreshToken);
        setSession(newSession);
      },
      // Refresh falló: cierra sesión y redirige al login
      () => {
        setAuthToken(null);
        setRefreshToken(null);
        clearSession();
        navigate("/login", { replace: true });
      }
    );
  }, [setSession, clearSession, navigate]);

  async function login(email: string, password: string) {
    const nextSession = await api.login(email, password);
    setAuthToken(nextSession.accessToken);
    setRefreshToken(nextSession.refreshToken);
    setSession(nextSession);

    // Redirigir al origen si venía de una ruta protegida, sino a la primera vista
    const from = (location.state as { from?: Location })?.from?.pathname;
    const dest = from && pathToView(from) ? from : viewToPath(getFirstAllowedView(nextSession.permissions));
    navigate(dest, { replace: true });
  }

  return (
    <Routes>
      <Route path="/login" element={
        session
          ? <Navigate to={viewToPath(getFirstAllowedView(session.permissions))} replace />
          : <LoginPage onLogin={login} />
      } />

      <Route path="/forgot-password" element={
        session
          ? <Navigate to={viewToPath(getFirstAllowedView(session.permissions))} replace />
          : <LoginPage onLogin={login} mode="forgot" />
      } />

      <Route path="/reset-password" element={
        session
          ? <Navigate to={viewToPath(getFirstAllowedView(session.permissions))} replace />
          : <LoginPage onLogin={login} mode="reset" />
      } />

      <Route path="/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />

      {/* Redirigir raíz */}
      <Route index element={
        <Navigate to={session ? viewToPath(getFirstAllowedView(session.permissions)) : "/login"} replace />
      } />
    </Routes>
  );
}
