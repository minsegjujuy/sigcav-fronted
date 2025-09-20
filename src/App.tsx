import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ActaForm from './pages/ActaForm'
import ActaResumenTable from './pages/ActaResumenTabla'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'
import Dashboard from './pages/Dashboard'

function App() {

  return (
    <>
      <SnackbarProvider>
        <SnackbarUtilitiesConfigurator />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path='/dashboard/nueva_acta' element={<ActaForm />} />
            <Route path='/dashboard/actas' element={<ActaResumenTable />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Routes>
      </SnackbarProvider>
    </>
  )
}

export default App
