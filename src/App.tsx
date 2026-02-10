import './App.css'
import { Route, Routes } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'
import { ArticuloProvider } from './context/ArticuloContext'
import { RequireAuth } from './guards/RequireGuard'
import Navbar from './components/Navbar'
import { lazy, Suspense, useMemo, useState } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { ActaProvider } from './context/ActaResumenContext'
import ReloadPrompt from './components/ui/modal/ReloadPrompt'
import { HechoVialProvider } from './context/HechoVialContext'

// 1. Carga diferida de componentes (Lazy Imports)
const Login = lazy(() => import('./pages/Login'));
const ForbiddenPage = lazy(() => import('./pages/Forbidden'));
const ActaResumenTable = lazy(() => import('./pages/ActaResumenTabla'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Talonario = lazy(() => import('./pages/Talonario'));
const RegistroTalonario = lazy(() => import('./pages/RegistroTalonario'));
const Reporte = lazy(() => import('./pages/Reporte'));
const ActaForm = lazy(() => import('./pages/ActaForm'));
const FormularioHechoVial = lazy(() => import('./pages/HechoVialForm'));
const HechosVialesTable = lazy(() => import('./pages/HechosVialesTable'));
const MapaJujuySource = lazy(() => import('./components/containers/MapaJujuySource'));

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
            {/* 2. Suspense envuelve las rutas que se cargan de forma perezosa */}
            <Suspense fallback={<div style={{ padding: 20 }}>Cargando módulo...</div>}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/forbidden" element={<ForbiddenPage />} />

                {/* Todos */}
                <Route element={<RequireAuth allowedRoles={["ADMIN", "REPAT", "SECRETARIO", "JEFE", "PERSONAL", "OFICIAL_DE_GUARDIA"]} />}>
                  <Route path="/dashboard/mis-actas" element={<ActaResumenTable />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/*<Route path="/zonas" element={<MapaZonas />} />*/}
                </Route>

                {/* Visualización */}
                <Route element={<RequireAuth allowedRoles={["ADMIN", "REPAT", "SECRETARIO", "JEFE"]} />}>
                  <Route path="/dashboard/talonarios" element={<Talonario />} />
                  <Route path="/dashboard/talonarios/registros" element={<RegistroTalonario />} />
                  <Route path="/dashboard/modificacion" element={<ActaForm />} />
                </Route>

                <Route element={<RequireAuth allowedRoles={["ADMIN", "REPAT", "SECRETARIO", "PERSONAL"]} />}>
                  <Route path="/dashboard/modificacion" element={<ActaForm />} />
                </Route>

                {/* Alta y modificación */}
                <Route element={<RequireAuth allowedRoles={["ADMIN", "SECRETARIO", "PERSONAL"]} />}>
                  <Route path="/dashboard/nueva-acta" element={<ActaForm />} />
                  <Route path="/dashboard/hechos-viales/modificacion/:id" element={<FormularioHechoVial />} />
                </Route>
                {/* Hechos viales */}
                <Route element={<RequireAuth allowedRoles={["ADMIN", "REPAT", "PERSONAL", "JEFE", "OFICIAL_DE_GUARDIA"]} />}>
                  <Route path="/dashboard/hechos-viales/mapa" element={<MapaJujuySource />} />
                  <Route path='/dashboard/hechos-viales/nuevo' element={<FormularioHechoVial />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={["ADMIN", "REPAT", "JEFE", "OFICIAL_DE_GUARDIA"]} />}>
                  <Route path="/dashboard/informes" element={<Reporte />} />
                  <Route path='/dashboard/hechos-viales' element={<HechosVialesTable />} />
                </Route>
              </Routes>
            </Suspense>
            </HechoVialProvider>
          </ActaProvider>
        </ArticuloProvider>
      </SnackbarProvider>
    </ThemeProvider>
    </>
  )
}

export default App
