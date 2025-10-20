import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ActaForm from './pages/ActaForm'
import ActaResumenTable from './pages/ActaResumenTabla'
import { SnackbarProvider } from 'notistack'
import { SnackbarUtilitiesConfigurator } from './utilities/SnackbarUtilities'
import Dashboard from './pages/Dashboard'
import { ArticuloProvider } from './context/ArticuloContext'
import { Provider } from 'react-redux'
import { store } from './redux/store/Store'

function App() {

  return (
    <>
    <Provider store={store}>
      <SnackbarProvider>
        <SnackbarUtilitiesConfigurator />
        <ArticuloProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path='/dashboard/nueva-acta' element={<ActaForm />} />
            <Route path='/dashboard/mis-actas' element={<ActaResumenTable />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Routes>
        </ArticuloProvider>
      </SnackbarProvider>
      </Provider>
    </>
  )
}

export default App
