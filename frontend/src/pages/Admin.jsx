import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Check, CheckCircle2, Clock3, CreditCard, Image, LogOut, Plus, RefreshCw, Settings, ShieldCheck, Trash2, Users, Wallet, X, Eye, LayoutDashboard, UploadCloud, UserRound, Save } from 'lucide-react'
import { api, apiBlob, formatDate, formatTime, todayString } from '../api'
import { Spinner, Toast } from '../components/Layout'
import TimePicker from '../components/TimePicker'

function nextDate(days) { const date = new Date(); date.setDate(date.getDate() + days); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10) }

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('sdc_admin_token') || '')
  const [username, setUsername] = useState(localStorage.getItem('sdc_admin_username') || 'admin')
  const [adminProfile, setAdminProfile] = useState(null)
  const [adminProfileForm, setAdminProfileForm] = useState({ username: '', fullName: '', email: '', phone: '' })
  const [adminCurrentPassword, setAdminCurrentPassword] = useState('')
  const [adminNewPassword, setAdminNewPassword] = useState('')
  const [savingAdminProfile, setSavingAdminProfile] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [bookings, setBookings] = useState([])
  const [patients, setPatients] = useState([])
  const [settings, setSettings] = useState(null)
  const [slots, setSlots] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [slotDate, setSlotDate] = useState(todayString())
  const [slotTime, setSlotTime] = useState('10:00')
  const [proofUrl, setProofUrl] = useState('')
  const [proofBooking, setProofBooking] = useState(null)
  const [qrFile, setQrFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const logout = useCallback(() => { localStorage.removeItem('sdc_admin_token'); setToken(''); setAdminProfile(null); setSummary(null); setBookings([]); setPatients([]); setSettings(null); setSlots([]) }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      const [sum, list, config, slotList, patientList, profile] = await Promise.all([
        api('/api/admin/summary'), api(`/api/admin/bookings?status=${filter}`), api('/api/admin/settings'),
        api(`/api/admin/slots?from=${todayString()}&to=${nextDate(45)}`), api('/api/admin/patients'), api('/api/admin/me'),
      ])
      setSummary(sum); setBookings(list); setSettings(config); setSlots(slotList); setPatients(patientList); setAdminProfile(profile); setUsername(profile.username); localStorage.setItem('sdc_admin_username', profile.username)
    } catch (e) {
      if (e.message.toLowerCase().includes('login') || e.message.toLowerCase().includes('session') || e.message.toLowerCase().includes('unauthorized')) logout()
      setError(e.message)
    }
  }, [token, filter, logout])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => () => { if (proofUrl) URL.revokeObjectURL(proofUrl) }, [proofUrl])

  async function login(e) {
    e.preventDefault(); setLoginBusy(true); setError('')
    try {
      const result = await api('/api/admin/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      localStorage.setItem('sdc_admin_token', result.token); localStorage.setItem('sdc_admin_username', result.username); setToken(result.token); setUsername(result.username); setAdminProfile(result.profile); setPassword(''); setMessage('Welcome to your clinic dashboard.')
    } catch (e) { setError(e.message) } finally { setLoginBusy(false) }
  }

  function openAdminProfile() {
    setAdminProfileForm({ username: adminProfile?.username || username, fullName: adminProfile?.fullName || '', email: adminProfile?.email || '', phone: adminProfile?.phone || '' })
    setAdminCurrentPassword(''); setAdminNewPassword(''); setError(''); setTab('profile')
  }

  async function saveAdminProfile(e) {
    e.preventDefault(); setSavingAdminProfile(true); setError(''); setMessage('')
    try {
      const result = await api('/api/admin/me', { method: 'PUT', body: JSON.stringify({ ...adminProfileForm, currentPassword: adminCurrentPassword, newPassword: adminNewPassword || null }) })
      localStorage.setItem('sdc_admin_token', result.token); localStorage.setItem('sdc_admin_username', result.username)
      setToken(result.token); setUsername(result.username); setAdminProfile(result.profile)
      setAdminCurrentPassword(''); setAdminNewPassword(''); setMessage('Administrator profile updated successfully.')
    } catch (e) { setError(e.message) }
    finally { setSavingAdminProfile(false) }
  }

  async function changeStatus(booking, status) {
    const action = status === 'CONFIRMED' ? 'approve this payment and confirm the appointment' : status.toLowerCase() + ' this appointment'
    if (!window.confirm(`Are you sure you want to ${action}?`)) return
    setBusy(true); setError('')
    try { await api(`/api/admin/bookings/${booking.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); setMessage(status === 'CONFIRMED' ? 'Payment verified. Appointment confirmed.' : 'Appointment updated.'); await refresh() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function viewProof(booking) {
    setProofBooking(booking); setError('')
    try { const blob = await apiBlob(`/api/admin/bookings/${booking.id}/payment-proof`); setProofUrl(URL.createObjectURL(blob)) }
    catch (e) { setError(e.message); setProofBooking(null) }
  }

  async function addSlot(e) {
    e.preventDefault(); setBusy(true); setError('')
    try { await api('/api/admin/slots', { method: 'POST', body: JSON.stringify({ date: slotDate, time: slotTime }) }); setMessage('Availability slot added.'); await refresh() }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function deleteSlot(slot) {
    if (!window.confirm(`Remove ${formatDate(slot.date)} at ${formatTime(slot.time)}?`)) return
    try { await api(`/api/admin/slots/${slot.id}`, { method: 'DELETE' }); setMessage('Availability slot removed.'); await refresh() }
    catch (e) { setError(e.message) }
  }

  async function saveSettings(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const payload = { clinicName: settings.clinicName, bookingFee: Number(settings.bookingFee), address: settings.address || '', phone: settings.phone || '', email: settings.email || '', workingHours: settings.workingHours || '', description: settings.description || '' }
      const updated = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(payload) })
      setSettings(updated); setMessage('Clinic settings saved.')
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function uploadQr(e) {
    e.preventDefault(); if (!qrFile) return
    setBusy(true); setError('')
    const form = new FormData(); form.append('file', qrFile)
    try { const updated = await api('/api/admin/settings/qr', { method: 'POST', body: form }); setSettings(updated); setQrFile(null); e.target.reset(); setMessage('Clinic payment QR uploaded.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  async function uploadLogo(e) {
    e.preventDefault(); if (!logoFile) return
    setBusy(true); setError('')
    const form = new FormData(); form.append('file', logoFile)
    try { const updated = await api('/api/admin/settings/logo', { method: 'POST', body: form }); setSettings(updated); setLogoFile(null); e.target.reset(); setMessage('Clinic logo uploaded successfully.') }
    catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  if (!token) return <div className="admin-login-page"><div className="admin-login-card"><div className="admin-login-mark">✳</div><div className="eyebrow">SONPUR DENTAL CLINIC</div><h1>Admin <em>sign in.</em></h1><p>Manage appointments, payment verification and clinic availability.</p><form onSubmit={login}><label className="field-label">Username<input className="input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required /></label><label className="field-label">Password<input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></label><button className="btn btn-primary btn-block btn-lg" disabled={loginBusy}>{loginBusy ? 'Signing in…' : 'Sign in to dashboard'}</button></form><a className="back-link" href="/">← Back to clinic website</a><Toast message={error} onClose={() => setError('')} /></div></div>

  const submitted = bookings.filter(b => b.status === 'PAYMENT_SUBMITTED')
  return <div className="admin-page"><aside className="admin-sidebar"><a className="admin-brand" href="/">{settings?.logoUploaded ? <img className="admin-brand-logo" src={`/api/public/logo?v=${encodeURIComponent(settings.logoUrl || '1')}`} alt="Clinic logo" /> : <span className="brand-mark">✳</span>}<span><strong>{settings?.clinicName || 'Sonpur'}</strong><small>Clinic admin</small></span></a><div className="sidebar-label">WORKSPACE</div><nav className="admin-nav">
    {[['overview','Overview',LayoutDashboard],['bookings','Appointments',CalendarDays],['patients','Patients',Users],['availability','Availability',Clock3],['settings','Clinic settings',Settings],['profile','Update my details',UserRound]].map(([key,label,Icon]) => <button key={key} className={tab === key ? 'selected' : ''} onClick={() => key === 'profile' ? openAdminProfile() : setTab(key)}><Icon size={18} />{label}{key === 'bookings' && summary?.paymentSubmitted > 0 && <span className="nav-count">{summary.paymentSubmitted}</span>}</button>)}
  </nav><div className="sidebar-bottom"><div className="admin-user"><div className="admin-avatar">{(adminProfile?.fullName || username).slice(0,1).toUpperCase()}</div><span><strong>{adminProfile?.fullName || username}</strong><small>{username}</small></span></div><button className="logout-btn" onClick={logout}><LogOut size={17} /> Sign out</button><a className="view-site-link" href="/">← View public website</a></div></aside>
  <main className="admin-main"><header className="admin-topbar"><div><span className="admin-top-eyebrow">CLINIC MANAGEMENT</span><strong>{tab === 'overview' ? 'Overview' : tab === 'bookings' ? 'Appointments' : tab === 'patients' ? 'Registered patients' : tab === 'availability' ? 'Availability calendar' : tab === 'profile' ? 'Update my details' : 'Clinic settings'}</strong></div><div className="admin-top-actions"><span className="admin-secure"><ShieldCheck size={15} /> Secure admin session</span><button className="icon-button" onClick={refresh} title="Refresh data"><RefreshCw size={17} /></button></div></header>
  <div className="admin-content"><Toast message={error} onClose={() => setError('')} /><Toast message={message} type="success" onClose={() => setMessage('')} />
    {tab === 'overview' && <>
      <div className="admin-welcome"><div><div className="eyebrow">WELCOME BACK</div><h1>Good day, {username}.</h1><p>Here's what's happening at your clinic. You can update your own details from ‘Update my details’.</p></div><button className="btn btn-outline" onClick={() => setTab('bookings')}>View appointments <ArrowRightIcon /></button></div>
      {!summary ? <Spinner label="Loading dashboard…" /> : <div className="stats-grid"><Stat icon={CreditCard} label="Payment review" value={summary.paymentSubmitted} sub="Awaiting your verification" accent="amber" /><Stat icon={CalendarDays} label="Confirmed visits" value={summary.confirmed} sub="Approved appointments" accent="green" /><Stat icon={Clock3} label="Awaiting payment" value={summary.pendingPayment} sub="Proof not submitted yet" accent="blue" /><Stat icon={X} label="Rejected / closed" value={summary.rejected} sub="Requests not approved" accent="gray" /><Stat icon={X} label="Patient cancellations" value={summary.cancelled || 0} sub="Appointments cancelled by patients or clinic" accent="gray" /><Stat icon={Users} label="Patient accounts" value={summary.patientAccounts || 0} sub="Registered patient logins" accent="green" /></div>}
      <div className="admin-section-head"><div><span className="card-kicker">ACTION NEEDED</span><h2>Payment verification</h2><p>Review uploaded screenshots before confirming appointments.</p></div><button className="quiet-link" onClick={() => { setFilter('PAYMENT_SUBMITTED'); setTab('bookings') }}>View all <ArrowRightIcon /></button></div>
      {submitted.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Patient</th><th>Visit date</th><th>Amount</th><th>UPI reference</th><th>Proof</th><th>Action</th></tr></thead><tbody>{submitted.slice(0, 6).map(b => <tr key={b.id}><td><strong>{b.patientName}</strong><small>{b.phone} · {b.bookingCode}</small></td><td>{formatDate(b.date)}<small>{formatTime(b.time)}</small></td><td className="table-amount">₹{b.amount}</td><td>{b.upiTransactionId || '—'}</td><td><button className="table-link" onClick={() => viewProof(b)}><Eye size={15} /> View</button></td><td><div className="table-actions"><button className="approve-btn" disabled={busy} onClick={() => changeStatus(b, 'CONFIRMED')}><Check size={14} /> Approve</button><button className="reject-btn" disabled={busy} onClick={() => changeStatus(b, 'REJECTED')}>Reject</button></div></td></tr>)}</tbody></table></div> : <div className="admin-empty"><CheckCircle2 size={28} /><strong>You're all caught up</strong><span>No payment screenshots are waiting for review.</span></div>}
    </>}

    {tab === 'bookings' && <><div className="admin-page-heading"><div><h1>Appointments</h1><p>View requests and verify patient payments.</p></div><div className="filter-select"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All appointments</option><option value="PAYMENT_SUBMITTED">Payment submitted</option><option value="PENDING_PAYMENT">Awaiting payment</option><option value="CONFIRMED">Confirmed</option><option value="REJECTED">Rejected</option><option value="CANCELLED">Cancelled</option></select></div></div>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Patient</th><th>Appointment</th><th>Booking fee</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>{bookings.map(b => <tr key={b.id}><td><strong>{b.patientName}</strong><small>{b.phone} · {b.bookingCode}</small>{b.patientAccountLinked && <small className="patient-account-tag">Patient account linked</small>}{b.problem && <small className="problem-cell">{b.problem}</small>}{b.cancellationReason && <small className="cancellation-reason">Cancellation reason: {b.cancellationReason}</small>}</td><td>{formatDate(b.date)}<small>{formatTime(b.time)}</small></td><td className="table-amount">₹{b.amount}</td><td>{b.upiTransactionId || '—'}{b.paymentProofUploaded && <small><button className="table-link" onClick={() => viewProof(b)}><Image size={14} /> View screenshot</button></small>}</td><td><StatusPill status={b.status} /></td><td>{b.status === 'PAYMENT_SUBMITTED' ? <div className="table-actions"><button className="approve-btn" disabled={busy} onClick={() => changeStatus(b, 'CONFIRMED')}><Check size={14} /> Approve</button><button className="reject-btn" disabled={busy} onClick={() => changeStatus(b, 'REJECTED')}>Reject</button></div> : ['PENDING_PAYMENT','CONFIRMED'].includes(b.status) ? <button className="reject-btn" onClick={() => changeStatus(b, 'CANCELLED')}>Cancel</button> : <span className="muted-dash">—</span>}</td></tr>)}</tbody></table>{!bookings.length && <div className="admin-empty"><Users size={28} /><strong>No appointments found</strong><span>There are no bookings in this category yet.</span></div>}</div></>}


    {tab === 'patients' && <><div className="admin-page-heading"><div><h1>Registered patients</h1><p>View registered patient account details. Patient profiles are not editable from the admin panel.</p></div><span className="slot-count">{patients.length} accounts</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Patient name</th><th>Mobile number</th><th>Email</th><th>Account created</th><th>Status</th></tr></thead><tbody>{patients.map(patient => <tr key={patient.id}><td><strong>{patient.fullName}</strong><small>Patient ID #{patient.id}</small></td><td>{patient.phone}</td><td>{patient.email || '—'}</td><td>{patient.createdAt ? new Date(patient.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td><td><span className="status-pill confirmed">Active</span></td></tr>)}</tbody></table>{!patients.length && <div className="admin-empty"><Users size={28} /><strong>No registered patients yet</strong><span>Patient accounts will appear here after registration.</span></div>}</div></>}

    {tab === 'profile' && <><div className="admin-page-heading"><div><h1>Update my admin details</h1><p>Manage your own administrator account. Patient account details remain view-only here.</p></div><span className="slot-count">Protected account</span></div><form className="admin-panel admin-profile-form" onSubmit={saveAdminProfile}><div className="panel-heading"><div><span className="card-kicker">ACCOUNT SECURITY</span><h2>My administrator account</h2><p>Update your admin username, contact information or password. Your current password is required to save changes.</p></div><span className="panel-icon"><UserRound /></span></div><div className="form-grid"><label className="field-label">Username<input className="input" value={adminProfileForm.username} onChange={e => setAdminProfileForm({ ...adminProfileForm, username: e.target.value })} minLength={3} maxLength={60} pattern="[A-Za-z0-9._-]+" required /></label><label className="field-label">Full name<input className="input" value={adminProfileForm.fullName} onChange={e => setAdminProfileForm({ ...adminProfileForm, fullName: e.target.value })} maxLength={100} required /></label></div><div className="form-grid"><label className="field-label">Email address<input className="input" type="email" value={adminProfileForm.email} onChange={e => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })} maxLength={150} placeholder="admin@example.com" /></label><label className="field-label">Mobile number<input className="input" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" minLength={10} maxLength={10} value={adminProfileForm.phone || ''} onChange={e => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile number" /></label></div><div className="form-divider"/><div className="form-grid"><label className="field-label">Current password<input className="input" type="password" autoComplete="current-password" value={adminCurrentPassword} onChange={e => setAdminCurrentPassword(e.target.value)} required /></label><label className="field-label">New password (optional)<input className="input" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={adminNewPassword} onChange={e => setAdminNewPassword(e.target.value)} placeholder="Leave blank to keep current password" /></label></div><p className="field-hint">Changing your username or password refreshes this browser's administrator session. Use at least 8 characters for a new password.</p><button className="btn btn-primary" disabled={savingAdminProfile}><Save size={16}/>{savingAdminProfile ? 'Saving…' : 'Save my admin details'}</button></form></>}


    {tab === 'availability' && <><div className="admin-page-heading"><div><h1>Manage availability</h1><p>Add appointment dates and time slots for patients to choose.</p></div></div><div className="availability-grid"><section className="admin-panel"><div className="panel-heading"><div><span className="card-kicker">ADD NEW SLOT</span><h2>Open an appointment time</h2></div><span className="panel-icon"><Plus /></span></div><form className="admin-form" onSubmit={addSlot}><label className="field-label">Date<input className="input" type="date" min={todayString()} value={slotDate} onChange={e => setSlotDate(e.target.value)} required /></label><div className="field-label">Time <TimePicker value={slotTime} onChange={setSlotTime} labels={{ hour: 'Hour', minute: 'Minute', period: 'AM / PM', group: 'Slot time' }} /></div><button className="btn btn-primary btn-block" disabled={busy}><Plus size={17} /> Add available slot</button></form><p className="panel-footnote">Each slot can be booked by one patient. Active bookings automatically block that time.</p></section><section className="admin-panel slots-panel"><div className="panel-heading"><div><span className="card-kicker">NEXT 45 DAYS</span><h2>Published time slots</h2></div><span className="slot-count">{slots.length} total</span></div>{slots.length ? <div className="slot-list">{slots.map(slot => <div className="slot-row" key={slot.id}><div className="slot-calendar"><strong>{new Date(`${slot.date}T00:00:00`).getDate()}</strong><small>{new Date(`${slot.date}T00:00:00`).toLocaleDateString('en-IN',{month:'short'})}</small></div><div className="slot-row-info"><strong>{formatDate(slot.date)}</strong><small>{formatTime(slot.time)}</small></div><span className={`slot-status ${slot.available ? 'open' : 'busy'}`}>{slot.available ? 'Available' : 'Booked'}</span><button className="delete-slot" onClick={() => deleteSlot(slot)} title="Remove slot" disabled={!slot.available}><Trash2 size={16} /></button></div>)}</div> : <div className="admin-empty"><CalendarDays size={26} /><strong>No slots added yet</strong><span>Add a date and time to open booking.</span></div>}</section></div></>}

    {tab === 'settings' && settings && <><div className="admin-page-heading"><div><h1>Clinic settings</h1><p>Update the public clinic details and booking payment options.</p></div></div>
      <section className="admin-panel brand-settings-panel"><div className="panel-heading"><div><span className="card-kicker">BRAND IDENTITY</span><h2>Clinic name and logo</h2><p>These details appear on the patient-facing website.</p></div><span className="panel-icon"><Image /></span></div><div className="brand-settings-grid"><form className="brand-name-form" onSubmit={saveSettings}><label className="field-label">Public clinic name<input className="input" value={settings.clinicName || ''} onChange={e => setSettings({ ...settings, clinicName: e.target.value })} required maxLength={120} placeholder="Enter clinic name" /></label><button className="btn btn-primary" disabled={busy}>Save clinic name</button></form><div className="brand-logo-settings"><div className="brand-logo-preview">{settings.logoUploaded ? <img src={`/api/public/logo?v=${Date.now()}`} alt="Current clinic logo" /> : <div className="qr-placeholder"><Image size={30} /><strong>No logo uploaded</strong><span>Upload a square or horizontal clinic logo.</span></div>}</div><form onSubmit={uploadLogo} className="qr-upload-form"><label className="file-drop compact"><UploadCloud size={20} /><strong>{logoFile ? logoFile.name : 'Choose clinic logo'}</strong><small>JPG, PNG or WEBP · max 5 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setLogoFile(e.target.files?.[0] || null)} required /></label><button className="btn btn-primary btn-block" disabled={!logoFile || busy}>Upload clinic logo</button></form></div></div></section>
      <div className="settings-layout"><form className="admin-panel settings-form" onSubmit={saveSettings}><div className="panel-heading"><div><span className="card-kicker">PUBLIC PROFILE</span><h2>Clinic information</h2></div><span className="panel-icon"><Settings /></span></div><label className="field-label">Address<textarea className="input textarea" rows="2" value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} placeholder="Enter full clinic address" /></label><div className="form-grid"><label className="field-label">Contact phone<input className="input" value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="Clinic phone number" /></label><label className="field-label">Email<input className="input" type="email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} placeholder="Clinic email" /></label></div><label className="field-label">Working hours<input className="input" value={settings.workingHours || ''} onChange={e => setSettings({ ...settings, workingHours: e.target.value })} placeholder="e.g. Mon–Sat, 10 AM–7 PM" /></label><label className="field-label">Short description<textarea className="input textarea" rows="3" value={settings.description || ''} onChange={e => setSettings({ ...settings, description: e.target.value })} maxLength={1000} /></label><div className="form-divider" /><div className="fee-setting"><div><strong>Appointment booking fee</strong><small>Patients will be asked to pay this amount before their appointment is confirmed.</small></div><div className="fee-input-wrap"><span>₹</span><select value={settings.bookingFee} onChange={e => setSettings({ ...settings, bookingFee: Number(e.target.value) })}>{Array.from({ length: 51 }, (_, i) => i + 50).map(n => <option key={n} value={n}>{n}</option>)}</select></div></div><p className="field-hint">Allowed range: ₹50 to ₹100. Existing bookings keep the fee that was set when they were created.</p><button className="btn btn-primary" disabled={busy}>Save clinic settings</button></form>
      <div className="admin-panel qr-settings"><div className="panel-heading"><div><span className="card-kicker">UPI PAYMENT</span><h2>Clinic payment QR</h2></div><span className="panel-icon"><Wallet /></span></div><div className="qr-preview">{settings.qrUploaded ? <img src={`/api/public/qr?v=${Date.now()}`} alt="Current clinic payment QR" /> : <div className="qr-placeholder"><Image size={32} /><strong>No QR uploaded</strong><span>Upload your clinic's UPI QR code.</span></div>}</div><div className="qr-copy"><strong>Patients will see this QR during booking.</strong><p>Make sure the QR belongs to the clinic's official payment account. JPG, PNG or WEBP, up to 5 MB.</p></div><form onSubmit={uploadQr} className="qr-upload-form"><label className="file-drop compact"><Plus size={20} /><strong>{qrFile ? qrFile.name : 'Choose QR image'}</strong><small>Browse files</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setQrFile(e.target.files?.[0] || null)} required /></label><button className="btn btn-primary btn-block" disabled={!qrFile || busy}>Upload payment QR</button></form><div className="security-note"><ShieldCheck size={17} /><span>Payment screenshots are stored privately and can only be viewed after admin sign-in.</span></div></div></div></>}
  </div></main>
  {proofBooking && <div className="modal-backdrop" onClick={() => { setProofBooking(null); setProofUrl('') }}><div className="proof-modal" onClick={e => e.stopPropagation()}><div className="proof-modal-head"><div><span className="card-kicker">PAYMENT REVIEW</span><h3>{proofBooking.patientName}</h3><small>{proofBooking.bookingCode} · ₹{proofBooking.amount}</small></div><button className="icon-button" onClick={() => { setProofBooking(null); setProofUrl('') }}><X /></button></div>{proofUrl ? <img src={proofUrl} alt="Patient payment proof screenshot" className="proof-image" /> : <Spinner label="Loading screenshot…" />}<div className="proof-modal-actions"><button className="btn btn-outline" onClick={() => { setProofBooking(null); setProofUrl('') }}>Close</button>{proofBooking.status === 'PAYMENT_SUBMITTED' && <button className="btn btn-primary" onClick={() => { setProofBooking(null); setProofUrl(''); changeStatus(proofBooking, 'CONFIRMED') }}><Check size={16} /> Approve & confirm</button>}</div></div></div>}
  </div>
}

function Stat({ icon: Icon, label, value, sub, accent }) { return <div className="stat-card"><div className={`stat-icon ${accent}`}><Icon size={19} /></div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div> }
function StatusPill({ status }) { const map = { PAYMENT_SUBMITTED: ['review','Payment review'], PENDING_PAYMENT: ['pending','Awaiting payment'], CONFIRMED: ['confirmed','Confirmed'], REJECTED: ['rejected','Rejected'], CANCELLED: ['rejected','Cancelled'] }; const [kind, label] = map[status] || ['pending', status]; return <span className={`status-pill ${kind}`}>{label}</span> }
function ArrowRightIcon() { return <span aria-hidden="true">→</span> }
