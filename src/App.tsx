import './App.css'
import { Route, Routes } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'
import { ArticuloProvider } from './context/ArticuloContext'
import { RequireAuth } from './guards/RequireGuard'
import Navbar from './components/Navbar'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { ActaProvider } from './context/ActaResumenContext'
import ReloadPrompt from './components/ui/modal/ReloadPrompt'
import { HechoVialProvider } from './context/HechoVialContext'
//import ActaSalienteDetalle from './pages/RegistrosActaSaliente'
import { ActaSalienteProvider } from './context/ActaSalienteContext'
import { protectedRoutes } from './routes/ProtectedRoutes'

// 1. Carga diferida de componentes (Lazy Imports)
const Login = lazy(() => import('./pages/Login'));
const ForbiddenPage = lazy(() => import('./pages/Forbidden'));
/*const ActaResumenTable = lazy(() => import('./pages/ActaResumenTabla'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Talonario = lazy(() => import('./pages/Talonario'));
const RegistroTalonario = lazy(() => import('./pages/RegistroTalonario'));
const Reporte = lazy(() => import('./pages/Reporte'));
const ActaForm = lazy(() => import('./pages/ActaForm'));
const FormularioHechoVial = lazy(() => import('./pages/HechoVialForm'));
const HechosVialesTable = lazy(() => import('./pages/HechosVialesTable'));
const MapaJujuySource = lazy(() => import('./components/containers/MapaJujuySource'));
const ActaSalienteTable = lazy(() => import('./pages/ActaSalienteTable'));*/

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  // useMemo para evitar recrear el tema en cada render
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // 🎨 colores personalizados para modo claro
                primary: { main: "#66682E" },
                background: { default: "#f5f5f5", paper: "#fff" },
              }
            : {
                // 🌙 colores personalizados para modo oscuro
                primary: { main: "#8D926A" },
                background: { default: "#0B0A06", paper: "#1e1e1e" },
              }),
        },
      }),
    [mode]
  );

  const PageLoader = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  // Agrupa rutas por conjunto de roles
  const groupedRoutes = protectedRoutes.reduce<Record<string, typeof protectedRoutes>>(
    (acc, route) => {
      const key = route.allowedRoles.slice().sort().join(",");
      if (!acc[key]) acc[key] = [];
      acc[key].push(route);
      return acc;
    },
    {}
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <ReloadPrompt />
      <SnackbarProvider>
        <SnackbarUtilitiesConfigurator />
        <ArticuloProvider>
          <Navbar />
          <CssBaseline />

          <div style={{ padding: 20 }}>
            <h2>Modo {mode === "light" ? "Claro ☀️" : "Oscuro 🌙"}</h2>
            <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>
              Cambiar modo
            </button>
          </div>

          <ActaProvider>
            <HechoVialProvider>
              <ActaSalienteProvider>
            {/* 2. Suspense envuelve las rutas que se cargan de forma perezosa */}
            <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/forbidden" element={<ForbiddenPage />} />

                  {Object.entries(groupedRoutes).map(([key, routes]) => (
                    <Route
                      key={key}
                      element={<RequireAuth allowedRoles={routes[0].allowedRoles} />}
                    >
                      {routes.map(({ path, component: Component }) => (
                        <Route key={path} path={path} element={<Component />} />
                      ))}
                    </Route>
                  ))}
                </Routes>
              </Suspense>
            </ActaSalienteProvider>
            </HechoVialProvider>
          </ActaProvider>
        </ArticuloProvider>
      </SnackbarProvider>
    </ThemeProvider>
    </>
  )
}

export default App

