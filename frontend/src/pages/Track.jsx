import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, FileSearch, Search, ShieldAlert, ShieldCheck, UploadCloud } from 'lucide-react'
import { api, formatDate, formatTime } from '../api'
import { Spinner, Toast } from '../components/Layout'
import { useLanguage } from '../i18n'

const statusInfo = {
  PENDING_PAYMENT: ['Awaiting payment proof', 'Your appointment request has been created. Complete payment and upload the screenshot to continue.', 'pending'],
  PAYMENT_SUBMITTED: ['Payment under verification', 'The clinic has received your payment screenshot. Your appointment will be confirmed after manual verification.', 'pending'],
  CONFIRMED: ['Appointment confirmed', 'Your payment has been verified. Please arrive at the clinic on your selected date and time.', 'confirmed'],
  REJECTED: ['Payment request rejected', 'The clinic could not verify this payment. Please contact the clinic for assistance.', 'rejected'],
  CANCELLED: ['Appointment cancelled', 'This appointment is no longer active. Please make a new booking if needed.', 'rejected'],
}

export default function Track() {
  const { t, language } = useLanguage()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [proof, setProof] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => { api('/api/public/settings').then(setSettings).catch(() => {}) }, [])
  useEffect(() => { const initial = params.get('code'); if (initial) lookup(initial) }, [])

  async function lookup(value = code) {
    if (!value.trim()) return setError(t('Enter your booking ID first.'))
    setLoading(true); setError(''); setBooking(null); setNotice('')
    try { setBooking(await api(`/api/public/bookings/${encodeURIComponent(value.trim().toUpperCase())}`)) }
    catch (e) { setError(t(e.message)) }
    finally { setLoading(false) }
  }

  async function uploadProof(e) {
    e.preventDefault(); if (!booking || !proof) return
    setUploading(true); setError(''); setNotice('')
    const body = new FormData(); body.append('file', proof); body.append('transactionId', transactionId)
    try {
      const updated = await api(`/api/patient/bookings/${booking.bookingCode}/payment-proof`, { method: 'POST', body })
      setBooking(updated); setNotice(t('Payment proof submitted. The clinic will verify your payment shortly.'))
      setProof(null); setTransactionId('')
    } catch (e) { setError(t(e.message)) } finally { setUploading(false) }
  }

  const status = booking ? statusInfo[booking.status] : null
  const info = status ? { title: t(status[0]), body: t(status[1]), kind: status[2] } : null
  return <section className="section track-page"><div className="container track-container"><div className="track-heading"><div className="eyebrow">{t('BOOKING ASSISTANT')}</div><h1>{t('Track your')} <em>{t('appointment.')}</em></h1><p>{t('Enter the booking ID shown after you submit your appointment request.')}</p></div><div className="track-card"><form className="track-search" onSubmit={e => { e.preventDefault(); lookup() }}><label className="field-label">{t('Booking ID')}<input className="input" placeholder={t('Example: SDC-1234567')} value={code} onChange={e => setCode(e.target.value.toUpperCase())} required /></label><button className="btn btn-primary" disabled={loading}>{loading ? t('Checking…') : <><Search size={17} /> {t('Check status')}</>}</button></form>
    {loading && <Spinner label={t('Finding your appointment…')} />}
    {notice && <div className="toast success track-notice">{notice}</div>}
    {booking && info && <div className="track-result"><div className={`status-banner ${info.kind}`}><span className="status-symbol">{info.kind === 'confirmed' ? <CheckCircle2 /> : info.kind === 'rejected' ? <ShieldAlert /> : <Clock3 />}</span><div><strong>{info.title}</strong><p>{info.body}</p></div></div><div className="track-details"><div><span>{t('Patient')}</span><strong>{booking.patientName}</strong></div><div><span>{t('Booking ID')}</span><strong>{booking.bookingCode}</strong></div><div><span>{t('Date')}</span><strong>{formatDate(booking.date, language)}</strong></div><div><span>{t('Time')}</span><strong>{formatTime(booking.time, language)}</strong></div><div><span>{t('Booking fee')}</span><strong>₹{booking.amount}</strong></div><div><span>{t('Payment reference')}</span><strong>{booking.upiTransactionId || t('Not submitted')}</strong></div></div>{booking.status === 'PENDING_PAYMENT' && <div className="resume-payment">
      <div className="resume-payment-heading"><strong>{t('Complete your booking payment')}</strong><span>{t('Pay exactly')} ₹{booking.amount}</span></div>
      {settings?.qrUploaded ? <div className="resume-qr"><img src="/api/public/qr" alt={`${settings?.clinicName || 'Clinic'} UPI payment QR code`} /><p>{t('Scan this clinic QR using any UPI app. Save the payment screenshot after successful payment.')}</p></div> : <div className="no-qr"><ShieldAlert size={24} /><div><strong>{t('Clinic QR not available')}</strong><p>{t('Please contact the clinic before making payment.')}</p></div></div>}
      {localStorage.getItem('sdc_patient_token') ? <form className="payment-form" onSubmit={uploadProof}>
        <label className="field-label">{t('UPI transaction / reference ID')}<input className="input" value={transactionId} onChange={e => setTransactionId(e.target.value)} minLength={6} maxLength={100} placeholder={t('Enter UPI transaction ID')} required /></label>
        <label className="field-label">{t('Payment screenshot')} <span className="optional">{t('(JPG, PNG or WEBP · max 5 MB)')}</span><span className="file-drop"><UploadCloud size={21} /><strong>{proof ? proof.name : t('Choose payment screenshot')}</strong><small>{t('Tap to upload from your device')}</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setProof(e.target.files?.[0] || null)} required /></span></label>
        <button className="btn btn-primary btn-block" disabled={uploading || !proof || !settings?.qrUploaded}>{uploading ? t('Submitting proof…') : t('Submit payment for verification')}</button>
      </form> : <div className="auth-security-note"><ShieldCheck size={17} /><span>{t('Log in or create the patient account registered with this appointment to submit payment proof. Only the account that owns this booking can upload payment details.')}</span><div><Link className="btn btn-primary" to="/login" state={{ from: `/track?code=${encodeURIComponent(booking.bookingCode)}` }}>{t('Patient login')}</Link> <Link className="btn btn-outline" to="/register" state={{ from: `/track?code=${encodeURIComponent(booking.bookingCode)}` }}>{t('Create account')}</Link></div></div>}
    </div>}</div>}
    {!booking && !loading && <div className="track-hint"><FileSearch size={25} /><span>{t('Your appointment status and visit details will appear here.')}</span></div>}
    <Toast message={error} onClose={() => setError('')} />
    </div><div className="track-footnote">{t('Having trouble finding your booking? Contact Sonpur Dental Clinic and share the mobile number used at booking.')}</div></div></section>
}
