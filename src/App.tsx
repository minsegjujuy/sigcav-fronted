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

function App() {

  return (
    <>
        <SnackbarProvider>
          <SnackbarUtilitiesConfigurator />
          <ArticuloProvider>
            <Navbar></Navbar>
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
    </>
  )
}

export default App
