import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Clock3, LogOut, RefreshCw, XCircle, AlertCircle, ArrowRight, ShieldCheck, UserRoundPen, Mail, Phone, LockKeyhole, Save } from 'lucide-react'
import { api, formatDate, formatTime } from '../api'
import { Spinner, Toast } from '../components/Layout'
import { useLanguage } from '../i18n'

const steps = ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED']
const statusText = {
  PENDING_PAYMENT: ['Awaiting payment', 'Your appointment request is saved. Submit the booking fee to move ahead.', 'pending'],
  PAYMENT_SUBMITTED: ['Payment under review', 'The clinic has received your payment proof and will verify it.', 'pending'],
  CONFIRMED: ['Appointment confirmed', 'Your payment has been verified. Please visit at the selected date and time.', 'confirmed'],
  REJECTED: ['Payment rejected', 'The clinic could not verify the submitted payment. Please contact the clinic.', 'rejected'],
  CANCELLED: ['Appointment cancelled', 'This booking was cancelled and its slot is available again.', 'rejected'],
}

export default function PatientDashboard() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [cancelId, setCancelId] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', email: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem('sdc_patient_token')
    localStorage.removeItem('sdc_patient')
    navigate('/login', { replace: true })
  }, [navigate])

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('sdc_patient_token')) return logout()
    setLoading(true); setError('')
    try {
      const [me, list] = await Promise.all([api('/api/patient/me'), api('/api/patient/appointments')])
      setProfile(me); setAppointments(list)
      localStorage.setItem('sdc_patient', JSON.stringify(me))
    } catch (e) {
      setError(e.message)
      if (e.status === 401) logout()
    } finally { setLoading(false) }
  }, [logout])

  useEffect(() => { refresh() }, [refresh])

  const counts = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter(a => ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED'].includes(a.status) && new Date(`${a.date}T${a.time}`) > new Date()).length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
  }), [appointments])

  function canCancel(appointment) {
    return ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED'].includes(appointment.status)
      && new Date(`${appointment.date}T${appointment.time}`) > new Date()
  }

  async function cancelAppointment(appointment) {
    if (!reason.trim()) return setError(t('Please enter a cancellation reason.'))
    setBusyId(appointment.id); setError(''); setMessage('')
    try {
      await api(`/api/patient/appointments/${appointment.id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })
      setCancelId(null); setReason(''); setMessage(t('Appointment cancelled. The time slot has been released.'))
      await refresh()
    } catch (e) { setError(e.message) }
    finally { setBusyId(null) }
  }

  function openProfileEditor() {
    setProfileForm({ fullName: profile?.fullName || '', phone: profile?.phone || '', email: profile?.email || '' })
    setCurrentPassword(''); setNewPassword(''); setError(''); setShowProfileEditor(true)
  }

  async function saveProfile(e) {
    e.preventDefault(); setSavingProfile(true); setError(''); setMessage('')
    try {
      const result = await api('/api/patient/me', {
        method: 'PUT',
        body: JSON.stringify({ ...profileForm, currentPassword, newPassword: newPassword || null })
      })
      localStorage.setItem('sdc_patient_token', result.token)
      localStorage.setItem('sdc_patient', JSON.stringify(result.patient))
      setProfile(result.patient); setShowProfileEditor(false)
      setMessage(t('Profile details updated successfully.'))
    } catch (e) { setError(e.message) }
    finally { setSavingProfile(false) }
  }

  function payOrTrack(a) { navigate(`/track?code=${encodeURIComponent(a.bookingCode)}`) }

  if (loading && !profile) return <section className="patient-dashboard section"><div className="container"><Spinner label={t('Loading your patient dashboard…')} /></div></section>

  return <section className="patient-dashboard section"><div className="container">
    <div className="patient-dashboard-head"><div><span className="eyebrow">{t('PATIENT PORTAL')}</span><h1>{t('Hello')}{profile?.fullName ? `, ${profile.fullName}` : ''}.</h1><p>{t('Your appointments, payment progress and visit details in one place.')}</p></div><div className="patient-dashboard-actions"><button className="btn btn-outline" onClick={refresh} disabled={loading}><RefreshCw size={16} /> {t('Refresh')}</button><button className="btn btn-outline" onClick={logout}><LogOut size={16} /> {t('Log out')}</button></div></div>
    <div className="patient-profile-strip"><span className="patient-profile-avatar">{(profile?.fullName || 'P').slice(0, 1).toUpperCase()}</span><div><strong>{profile?.fullName || t('Patient account')}</strong><small>{profile?.phone || ''}{profile?.email ? ` · ${profile.email}` : ''}</small></div><span className="patient-verified"><ShieldCheck size={14} /> {t('Patient account')}</span><button className="btn btn-outline profile-edit-button" onClick={openProfileEditor}><UserRoundPen size={15} /> {t('Edit profile')}</button></div>
    {showProfileEditor && <form className="patient-profile-editor" onSubmit={saveProfile}>
      <div className="profile-editor-heading"><div><span className="card-kicker">{t('ACCOUNT SETTINGS')}</span><h2>{t('Update your details')}</h2><p>{t('Changes to your mobile number will also update your linked appointment records.')}</p></div><button type="button" className="icon-button" onClick={() => setShowProfileEditor(false)} aria-label={t('Close')}><XCircle size={18} /></button></div>
      <div className="form-grid"><label className="field-label">{t('Full name')}<span className="profile-input-wrap"><UserRoundPen size={16} /><input className="input" value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} maxLength={100} required /></span></label>
      <label className="field-label">{t('Mobile number')}<span className="profile-input-wrap"><Phone size={16} /><input className="input" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" minLength={10} maxLength={10} value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} required /></span></label></div>
      <label className="field-label">{t('Email address (optional)')}<span className="profile-input-wrap"><Mail size={16} /><input className="input" type="email" maxLength={150} value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder={t('Enter your email address')} /></span></label>
      <div className="form-grid"><label className="field-label">{t('Current password')}<span className="profile-input-wrap"><LockKeyhole size={16} /><input className="input" type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></span></label>
      <label className="field-label">{t('New password (optional)')}<span className="profile-input-wrap"><LockKeyhole size={16} /><input className="input" type="password" minLength={8} maxLength={72} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('Leave blank to keep current password')} /></span></label></div>
      <div className="profile-editor-actions"><button className="btn btn-primary" disabled={savingProfile}><Save size={16} /> {savingProfile ? t('Saving…') : t('Save profile')}</button><button type="button" className="btn btn-outline" onClick={() => setShowProfileEditor(false)}>{t('Cancel')}</button></div>
    </form>}
    <div className="patient-stat-grid">
      <div className="patient-stat-card"><span>{t('Total appointments')}</span><strong>{counts.total}</strong><CalendarDays /></div>
      <div className="patient-stat-card"><span>{t('Upcoming visits')}</span><strong>{counts.upcoming}</strong><Clock3 /></div>
      <div className="patient-stat-card"><span>{t('Confirmed')}</span><strong>{counts.confirmed}</strong><CheckCircle2 /></div>
      <div className="patient-stat-card"><span>{t('Cancelled')}</span><strong>{counts.cancelled}</strong><XCircle /></div>
    </div>
    <div className="patient-list-heading"><div><span className="card-kicker">{t('YOUR RECORD')}</span><h2>{t('Appointment history')}</h2><p>{t('Track progress or manage an upcoming appointment.')}</p></div><Link to="/book" className="btn btn-primary"><CalendarDays size={16} /> {t('Book appointment')}</Link></div>
    {message && <div className="patient-inline-success"><CheckCircle2 size={17} />{message}</div>}
    {error && <Toast message={error} onClose={() => setError('')} />}
    {loading ? <Spinner label={t('Refreshing appointments…')} /> : appointments.length ? <div className="patient-appointment-list">{appointments.map(a => {
      const info = statusText[a.status] || statusText.PENDING_PAYMENT
      const currentStep = steps.indexOf(a.status)
      const active = currentStep >= 0
      return <article className="patient-appointment-card" key={a.id}>
        <div className="patient-appointment-top"><div><span className="card-kicker">{t('BOOKING ID')}</span><strong className="patient-booking-code">{a.bookingCode}</strong></div><span className={`patient-status ${info[2]}`}>{t(info[0])}</span></div>
        <div className="patient-appointment-details"><div><small>{t('Appointment date')}</small><strong>{formatDate(a.date, language)}</strong></div><div><small>{t('Time')}</small><strong>{formatTime(a.time, language)}</strong></div><div><small>{t('Booking fee')}</small><strong>₹{a.amount}</strong></div><div><small>{t('Payment reference')}</small><strong>{a.upiTransactionId || t('Not submitted')}</strong></div></div>
        <div className={`patient-progress ${active ? '' : 'terminal'}`}>
          {active ? steps.map((s, index) => <div className={`patient-progress-step ${index <= currentStep ? 'done' : ''}`} key={s}><span>{index < currentStep ? <CheckCircle2 size={15} /> : index + 1}</span><small>{t(s === 'PENDING_PAYMENT' ? 'Request created' : s === 'PAYMENT_SUBMITTED' ? 'Payment submitted' : 'Confirmed')}</small></div>) : <div className="patient-terminal-status"><AlertCircle size={17} /><div><strong>{t(info[0])}</strong><small>{t(info[1])}</small>{a.cancellationReason && <small>{t('Reason')}: {a.cancellationReason}</small>}</div></div>}
        </div>
        {active && <p className="patient-status-description">{t(info[1])}</p>}
        <div className="patient-card-actions"><button className="btn btn-outline" onClick={() => payOrTrack(a)}>{a.status === 'PENDING_PAYMENT' ? t('Continue payment') : t('View booking details')} <ArrowRight size={15} /></button>{canCancel(a) && <button className="btn btn-danger-outline" onClick={() => { setCancelId(cancelId === a.id ? null : a.id); setReason(''); setError('') }}><XCircle size={15} /> {t('Cancel appointment')}</button>}</div>
        {cancelId === a.id && <div className="patient-cancel-panel"><strong>{t('Why are you cancelling this appointment?')}</strong><textarea className="input textarea" rows="3" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} placeholder={t('Enter your reason')} /><div><button className="btn btn-danger" disabled={busyId === a.id || !reason.trim()} onClick={() => cancelAppointment(a)}>{busyId === a.id ? t('Cancelling…') : t('Confirm cancellation')}</button><button className="btn btn-outline" onClick={() => setCancelId(null)}>{t('Keep appointment')}</button></div><small>{t('Any payment refund, if applicable, is handled by the clinic separately.')}</small></div>}
      </article>
    })}</div> : <div className="patient-empty"><CalendarDays size={34} /><h3>{t('No appointments yet')}</h3><p>{t('Once you book an appointment using this mobile number, it will appear here.')}</p><Link to="/book" className="btn btn-primary">{t('Book your first appointment')} <ArrowRight size={16} /></Link></div>}
  </div></section>
}
