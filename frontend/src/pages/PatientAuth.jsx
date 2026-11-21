import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { api } from '../api'
import { Toast } from '../components/Layout'
import { useLanguage } from '../i18n'

export default function PatientAuth({ mode = 'login' }) {
  const registering = mode === 'register'
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (registering && password !== confirmPassword) return setError(t('Passwords do not match.'))
    setBusy(true)
    try {
      const result = await api(registering ? '/api/patient/auth/register' : '/api/patient/auth/login', {
        method: 'POST',
        body: JSON.stringify(registering ? { fullName, phone, password } : { phone, password })
      })
      localStorage.setItem('sdc_patient_token', result.token)
      localStorage.setItem('sdc_patient', JSON.stringify(result.patient))
      navigate(location.state?.from || '/account', { replace: true })
    } catch (e) {
      if (registering && e.status === 409) {
        setError(t('An account already exists with this mobile number. Please log in.'))
      } else {
        setError(t(e.message))
      }
    }
    finally { setBusy(false) }
  }

  return <section className="patient-auth-page section">
    <div className="patient-auth-card">
      <div className="patient-auth-icon"><LockKeyhole size={25} /></div>
      <span className="eyebrow">{t('PATIENT PORTAL')}</span>
      <h1>{registering ? t('Create your patient account') : t('Welcome back')}</h1>
      <p className="patient-auth-subtitle">{location.state?.requirePatientLogin ? t('Please log in or create your one patient account to book an appointment.') : registering ? t('Register to keep all your clinic appointments together.') : t('Log in to track your appointments and manage upcoming visits.')}</p>
      <form className="patient-auth-form" onSubmit={submit}>
        {registering && <label className="field-label">{t('Full name')}<span className="auth-input-wrap"><UserRound size={17} /><input className="input" value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} placeholder={t('Enter patient name')} required /></span></label>}
        <label className="field-label">{t('Mobile number')}<span className="auth-input-wrap"><Phone size={17} /><input className="input" type="tel" inputMode="numeric" autoComplete="tel" pattern="[6-9][0-9]{9}" minLength={10} maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={t('10-digit number')} required /></span></label>
        <label className="field-label">{t('Password')}<span className="auth-input-wrap"><LockKeyhole size={17} /><input className="input" type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : 1} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} placeholder={registering ? t('Create a password (min. 8 characters)') : t('Enter your password')} required /></span></label>
        {registering && <label className="field-label">{t('Confirm password')}<span className="auth-input-wrap"><LockKeyhole size={17} /><input className="input" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('Re-enter your password')} required /></span></label>}
        {registering && <div className="auth-security-note"><ShieldCheck size={16} />{t('Your password is securely hashed. Only one patient account can be created for each 10-digit mobile number. If you already registered, log in instead.')}</div>}
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? t('Please wait…') : registering ? t('Create account') : t('Log in')} <ArrowRight size={17} /></button>
      </form>
      <div className="patient-auth-switch">{registering ? t('Already have an account?') : t('New to the patient portal?')} <Link to={registering ? '/login' : '/register'} state={location.state}>{registering ? t('Log in') : t('Create an account')}</Link></div>
      <Link className="auth-back-link" to="/">{t('Back to clinic website')}</Link>
      <Toast message={error} onClose={() => setError('')} />
    </div>
  </section>
}
