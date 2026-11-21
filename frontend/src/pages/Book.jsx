import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, Info, LockKeyhole, QrCode, UploadCloud } from 'lucide-react'
import { api, formatDate, formatTime, todayString } from '../api'
import { Spinner, Toast } from '../components/Layout'
import TimePicker from '../components/TimePicker'
import { useLanguage } from '../i18n'

export default function Book() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [patient, setPatient] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [date, setDate] = useState(todayString())
  const [slots, setSlots] = useState([])
  const [slotId, setSlotId] = useState('')
  const [timeMode, setTimeMode] = useState('custom')
  const [customTime, setCustomTime] = useState('')
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState(null)
  const [age, setAge] = useState('')
  const [problem, setProblem] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [proof, setProof] = useState(null)
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeSuggestion, setTimeSuggestion] = useState(null)

  useEffect(() => { api('/api/public/settings').then(setSettings).catch(() => setError(t('Unable to load clinic settings. Please refresh the page.'))) }, [t])
  useEffect(() => {
    if (!localStorage.getItem('sdc_patient_token')) {
      navigate('/login', { replace: true, state: { from: '/book', requirePatientLogin: true } })
      return
    }
    api('/api/patient/me')
      .then(profile => {
        setPatient(profile)
        localStorage.setItem('sdc_patient', JSON.stringify(profile))
      })
      .catch(error => {
        if (error.status === 401) {
          localStorage.removeItem('sdc_patient_token')
          localStorage.removeItem('sdc_patient')
          navigate('/login', { replace: true, state: { from: '/book', requirePatientLogin: true } })
        } else {
          setError(t(error.message))
        }
      })
      .finally(() => setProfileLoading(false))
  }, [navigate, t])
  useEffect(() => {
    setSlotsLoading(true); setSlotId('')
    api(`/api/public/slots?date=${date}`).then(setSlots).catch(e => setError(t(e.message))).finally(() => setSlotsLoading(false))
  }, [date])

  async function createBooking(e) {
    e.preventDefault()
    setError('')
    setTimeSuggestion(null)
    setLoading(true)

    const selectedDate = timeMode === 'custom' ? date : pickedSlot?.date
    const selectedTime = timeMode === 'custom' ? customTime : pickedSlot?.time

    try {
      if (!selectedDate || !selectedTime) {
        setError(t('Please select an appointment date and time.'))
        return
      }

      const getSuggestion = () => api(
        `/api/public/booking-time-suggestion?date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
      )

      const suggestion = await getSuggestion()
      if (!suggestion.requestedTimeAvailable) {
        setTimeSuggestion(suggestion)
        if (!suggestion.suggestedDate || !suggestion.suggestedTime) {
          setError(t(suggestion.message))
        }
        return
      }

      const timeSelection = timeMode === 'custom'
        ? { slotId: null, date, time: customTime }
        : { slotId: Number(slotId), date: null, time: null }

      if (!patient || !localStorage.getItem('sdc_patient_token')) {
        navigate('/login', { replace: true, state: { from: '/book', requirePatientLogin: true } })
        return
      }
      const result = await api('/api/patient/bookings', {
        method: 'POST',
        body: JSON.stringify({
          patientName: patient.fullName,
          phone: patient.phone,
          age: age ? Number(age) : null,
          problem,
          ...timeSelection
        })
      })

      setBooking(result)
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      if (e.status === 409 && selectedDate && selectedTime) {
        try {
          const freshSuggestion = await api(
            `/api/public/booking-time-suggestion?date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(selectedTime)}`
          )
          if (!freshSuggestion.requestedTimeAvailable) {
            setTimeSuggestion(freshSuggestion)
            if (!freshSuggestion.suggestedDate || !freshSuggestion.suggestedTime) {
              setError(t(freshSuggestion.message))
            }
          } else {
            setError(t(e.message))
          }
        } catch (suggestionError) {
          setError(t(e.message))
        }
      } else {
        setError(t(e.message))
      }
    } finally {
      setLoading(false)
    }
  }

  async function uploadPayment(e) {
    e.preventDefault(); setError(''); setLoading(true)
    const body = new FormData(); body.append('file', proof); body.append('transactionId', transactionId)
    try {
      const result = await api(`/api/patient/bookings/${booking.bookingCode}/payment-proof`, { method: 'POST', body })
      setBooking(result); setStep(3); setSuccess(t('Payment proof has been submitted. The clinic will verify it shortly.'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) { setError(t(e.message)) } finally { setLoading(false) }
  }

  const pickedSlot = slots.find(s => String(s.id) === String(slotId))
  const hasTimeSelection = timeMode === 'custom' ? Boolean(customTime) : Boolean(slotId)
  if (!settings || profileLoading) return <div className="page-loader"><Spinner label={t('Preparing your secure appointment booking…')} /></div>
  if (!patient) return <section className="section"><div className="container"><div className="patient-auth-card"><h2>{t('Unable to load your patient account')}</h2><p>{error || t('Please log in again before booking an appointment.')}</p><Link className="btn btn-primary" to="/login" state={{ from: '/book', requirePatientLogin: true }}>{t('Patient login')}</Link></div></div></section>

  return <div className="booking-page section"><div className="container booking-layout">
    <div className="booking-intro"><div className="eyebrow">{settings.clinicName || t('SONPUR DENTAL CLINIC')}</div><h1>{t('Your smile deserves')}<br /><em>{t('time and care.')}</em></h1><p>{t('Reserve a convenient appointment in just a few steps. The clinic will confirm your booking after checking your payment.')}</p><div className="booking-note"><LockKeyhole size={18} /><span>{t('Your personal details are used only to manage this appointment request.')}</span></div><div className="mini-help"><strong>{t('Need help?')}</strong><span>{settings.phone || t('Contact the clinic for assistance.')}</span></div></div>
    <div className="booking-card">
      <div className="booking-card-top"><div><span className="card-kicker">{t('ONLINE APPOINTMENT')}</span><h2>{step === 1 ? t('Choose your visit') : step === 2 ? t('Complete your payment') : t('Request submitted')}</h2></div><div className="step-indicator"><span className={step >= 1 ? 'done' : ''}>1</span><i /><span className={step >= 2 ? 'done' : ''}>2</span><i /><span className={step >= 3 ? 'done' : ''}>3</span></div></div>
      {step === 1 && <form onSubmit={createBooking} className="booking-form">
        <div className="form-section-title"><CalendarDays size={18} /><strong>{t('Appointment date and time')}</strong></div>
        <label className="field-label">{t('Select a date')}<input className="input" type="date" min={todayString()} value={date} onChange={e => setDate(e.target.value)} required /></label>
        <div className="time-mode-heading">{t('Choose how to select your time')}</div>
        <div className="time-mode-picker" role="group" aria-label={t('Choose how to select your time')}>
          <button type="button" className={`time-mode-option ${timeMode === 'available' ? 'active' : ''}`} aria-pressed={timeMode === 'available'} onClick={() => setTimeMode('available')}>
            <Clock3 size={17} /><span><strong>{t('Choose from available slots')}</strong><small>{t('Use a time published by the clinic')}</small></span>
          </button>
          <button type="button" className={`time-mode-option ${timeMode === 'custom' ? 'active' : ''}`} aria-pressed={timeMode === 'custom'} onClick={() => setTimeMode('custom')}>
            <CalendarDays size={17} /><span><strong>{t('Choose my own time')}</strong><small>{t('Enter a time that suits you')}</small></span>
          </button>
        </div>
        {timeMode === 'available' ? <>
          <div className="field-label slot-label"><span>{t('Available time slots')}</span><small>{slots.length} {t('available')}</small></div>
          <p className="slot-choice-hint">{t('Choose your preferred available time slot.')}</p>
          {slotsLoading ? <Spinner label={t('Checking availability…')} /> : slots.length ? <div className="slot-grid">{slots.map(slot => <button type="button" key={slot.id} className={`slot-option ${String(slotId) === String(slot.id) ? 'selected' : ''}`} aria-pressed={String(slotId) === String(slot.id)} onClick={() => setSlotId(String(slot.id))}><Clock3 size={15} />{formatTime(slot.time, language)}</button>)}</div> : <div className="empty-slots"><CalendarDays size={22} /><strong>{t('No slots available on this date')}</strong><span>{t('You can choose your own time using the option above.')}</span></div>}
          {pickedSlot && <div className="selected-slot-note"><CheckCircle2 size={16} /><span>{t('Your selected time')}: <strong>{formatDate(pickedSlot.date, language)} · {formatTime(pickedSlot.time, language)}</strong></span></div>}
        </> : <>
          <div className="field-label custom-time-field">{t('Select your preferred time')}<TimePicker value={customTime} onChange={setCustomTime} labels={{ hour: t('Hour'), minute: t('Minute'), period: 'AM / PM', group: t('Select your preferred time') }} /><small className="custom-time-help">{t('You can request a time even if it is not listed above. The clinic will check and confirm availability.')}</small></div>
          {customTime && <div className="selected-slot-note"><CheckCircle2 size={16} /><span>{t('Your requested time')}: <strong>{formatDate(date, language)} · {formatTime(customTime, language)}</strong></span></div>}
        </>}
        {timeSuggestion && timeSuggestion.suggestedDate && timeSuggestion.suggestedTime && (
          <div className="selected-slot-note" style={{ marginTop: 16, padding: 16, display: 'block' }}>
            <strong>{t('Your selected time is unavailable.')}</strong>
            <p>
              {timeSuggestion.suggestionType === 'TWENTY_MINUTES'
                ? t('A time 20 minutes later is available:')
                : t('The next available clinic slot is:')}
            </p>
            <strong>
              {formatDate(timeSuggestion.suggestedDate, language)}
              {' · '}
              {formatTime(timeSuggestion.suggestedTime, language)}
            </strong>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setDate(timeSuggestion.suggestedDate)
                  setCustomTime(String(timeSuggestion.suggestedTime).slice(0, 5))
                  setTimeMode('custom')
                  setSlotId('')
                  setTimeSuggestion(null)
                  setError('')
                }}
              >
                {t('Accept suggested time')}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setTimeSuggestion(null)
                  setError('')
                }}
              >
                {t('Choose another time')}
              </button>
            </div>
          </div>
        )}
        <div className="form-divider" />
        <div className="form-section-title"><Info size={18} /><strong>{t('Booking with your patient account')}</strong></div>
        <div className="patient-booking-identity">
          <div><small>{t('Patient name')}</small><strong>{patient.fullName}</strong></div>
          <div><small>{t('Registered mobile number')}</small><strong>{patient.phone}</strong></div>
          <Link to="/account">{t('Update account details')}</Link>
        </div>
        <label className="field-label">{t('Age')} <span className="optional">{t('(optional)')}</span><input className="input" type="number" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} placeholder={t('Patient age')} /></label>
        <label className="field-label full">{t('What would you like help with?')} <span className="optional">{t('(optional)')}</span><textarea className="input textarea" rows="3" maxLength={1000} value={problem} onChange={e => setProblem(e.target.value)} placeholder={t('Briefly describe your dental concern')} /></label>
        <div className="fee-summary"><div><span>{t('Appointment booking fee')}</span><small>{t('Pay by scanning the clinic QR')}</small></div><strong>₹{settings.bookingFee}</strong></div>
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={!hasTimeSelection || loading || (timeMode === 'available' && (slotsLoading || !slots.length))}>{loading ? t('Creating request…') : t('Continue to payment')} <ArrowRight size={18} /></button>
        <p className="form-footnote">{t('Your appointment is not confirmed until the clinic verifies your payment.')}</p>
      </form>}

      {step === 2 && booking && <div className="payment-content">
        <div className="booking-reference"><span>{t('YOUR BOOKING ID')}</span><strong>{booking.bookingCode}</strong><small>{formatDate(booking.date, language)} · {formatTime(booking.time, language)}</small></div>
        <div className="payment-amount"><span>{t('Amount to pay')}</span><strong>₹{booking.amount}</strong></div>
        {settings.qrUploaded ? <div className="qr-panel"><div className="qr-frame"><img src="/api/public/qr" alt={`${settings.clinicName || 'Clinic'} UPI payment QR code`} /></div><div><strong>{t('Scan & pay using any UPI app')}</strong><p>{t('Pay exactly')} ₹{booking.amount} {t('to the clinic QR code. Save a screenshot after successful payment.')}</p></div></div> : <div className="no-qr"><QrCode size={30} /><div><strong>{t('Clinic QR is not uploaded yet')}</strong><p>{t('Please contact the clinic before making payment. An administrator needs to add the QR code first.')}</p></div></div>}
        <form onSubmit={uploadPayment} className="payment-form">
          <label className="field-label">{t('UPI transaction / reference ID')}<input className="input" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder={t('Enter UPI transaction ID')} minLength={6} maxLength={100} required /></label>
          <label className="field-label">{t('Payment screenshot')} <span className="optional">{t('(JPG, PNG or WEBP · max 5 MB)')}</span><span className="file-drop"><UploadCloud size={23} /><strong>{proof ? proof.name : t('Choose payment screenshot')}</strong><small>{proof ? t('Selected file') : t('Tap to upload from your device')}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setProof(e.target.files?.[0] || null)} required /></span></label>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading || !proof || !transactionId.trim() || !settings.qrUploaded}>{loading ? t('Submitting proof…') : t('Submit payment for verification')} <ArrowRight size={18} /></button>
        </form>
        <button className="back-button" onClick={() => setStep(1)}><ArrowLeft size={16} /> {t('Back to appointment details')}</button>
      </div>}

      {step === 3 && booking && <div className="submitted-content"><div className="success-icon"><CheckCircle2 size={40} /></div><h3>{t('Payment proof submitted!')}</h3><p>{t('Your booking request is now waiting for manual verification by Sonpur Dental Clinic.')}</p><div className="submitted-summary"><div><span>{t('Booking ID')}</span><strong>{booking.bookingCode}</strong></div><div><span>{t('Appointment')}</span><strong>{formatDate(booking.date, language)} · {formatTime(booking.time, language)}</strong></div><div><span>{t('Payment')}</span><strong>₹{booking.amount} · {t('Under review')}</strong></div></div><Link className="btn btn-primary btn-block" to="/account">{t('Open patient dashboard')} <ArrowRight size={17} /></Link><p className="form-footnote">{t('Please keep your booking ID for future reference.')}</p></div>}
      <Toast message={error} onClose={() => setError('')} />
    </div>
  </div></div>
}
