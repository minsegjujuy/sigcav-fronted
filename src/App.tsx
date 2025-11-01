import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ActaForm from './pages/ActaForm'
import ActaResumenTable from './pages/ActaResumenTabla'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'
import Dashboard from './pages/Dashboard'
import { ArticuloProvider } from './context/ArticuloContext'
import { RequireAuth } from './guards/RequireGuard'
import Navbar from './components/Navbar'
import Reporte from './pages/Reporte'
import { useMemo, useState } from 'react'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'

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
                primary: { main: "#1976d2" },
                background: { default: "#f5f5f5", paper: "#fff" },
              }
            : {
                // 🌙 colores personalizados para modo oscuro
                primary: { main: "#90caf9" },
                background: { default: "#121212", paper: "#1e1e1e" },
              }),
        },
      }),
    [mode]
  );

  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
            <SnackbarUtilitiesConfigurator />
            <ArticuloProvider>
              <Navbar></Navbar>
              {/* CssBaseline aplica estilos globales del tema */}
              <CssBaseline />

              <div style={{ padding: 20 }}>
                <h2>Modo {mode === "light" ? "Claro ☀️" : "Oscuro 🌙"}</h2>
                <button onClick={() => setMode(mode === "light" ? "dark" : "light")}>
                  Cambiar modo
                </button>
              </div>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard/informes" element={<Reporte />} />
                <Route path='/dashboard/nueva-acta' element={
                  <RequireAuth allowedRoles={["ADMIN", "PERSONAL"]}>
                    <ActaForm />
                  </RequireAuth>
                  } />
                <Route path='/dashboard/mis-actas' element={
                  <RequireAuth allowedRoles={["ADMIN", "PERSONAL"]}>
                    <ActaResumenTable />
                  </RequireAuth>
                  } />
                <Route path='/dashboard' element={
                  <RequireAuth allowedRoles={["ADMIN", "PERSONAL"]}>
                    <Dashboard />
                  </RequireAuth>
                  } />
                
              </Routes>
            </ArticuloProvider>
          </SnackbarProvider>
      </ThemeProvider>
    </>
  )
}

export default App
