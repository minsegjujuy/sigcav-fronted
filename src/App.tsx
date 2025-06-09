import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import ActaForm from './pages/ActaForm'

function App() {

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Login />} />
        <Route path='/dashboard/nueva_acta' element={<ActaForm />} />
      </Routes>
    </>
  )
}

export default App
