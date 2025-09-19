import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ActaForm from './pages/ActaForm'
import ActaResumenTable from './pages/ActaResumenTabla'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'

function App() {

  return (
    <>
      <SnackbarProvider>
        <SnackbarUtilitiesConfigurator />
          <Routes>
            <Route path="/auth" element={<Login />} />
            <Route path='/dashboard/nueva_acta' element={<ActaForm />} />
            <Route path='/dashboard/actas' element={<ActaResumenTable />} />
          </Routes>
      </SnackbarProvider>
    </>
  )
}

export default App
