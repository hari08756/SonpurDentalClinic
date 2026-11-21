import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { PageShell } from './components/Layout'
import Home from './pages/Home'
import Book from './pages/Book'
import Track from './pages/Track'
import Admin from './pages/Admin'
import PatientAuth from './pages/PatientAuth'
import PatientDashboard from './pages/PatientDashboard'

function PatientBookingRoute() {
  const location = useLocation()
  const token = localStorage.getItem('sdc_patient_token')
  return token
    ? <PageShell><Book /></PageShell>
    : <Navigate to="/login" replace state={{ from: location.pathname, requirePatientLogin: true }} />
}

export default function App() {
  return <Routes>
    <Route path="/" element={<PageShell><Home /></PageShell>} />
    <Route path="/book" element={<PatientBookingRoute />} />
    <Route path="/track" element={<PageShell><Track /></PageShell>} />
    <Route path="/login" element={<PageShell><PatientAuth mode="login" /></PageShell>} />
    <Route path="/register" element={<PageShell><PatientAuth mode="register" /></PageShell>} />
    <Route path="/account" element={<PageShell><PatientDashboard /></PageShell>} />
    <Route path="/admin" element={<Admin />} />
    <Route path="*" element={<PageShell><Home /></PageShell>} />
  </Routes>
}
