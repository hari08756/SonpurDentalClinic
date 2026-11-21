import { Link, NavLink, useLocation } from 'react-router-dom'
import { CalendarDays, Menu, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { LanguageSwitcher, useLanguage } from '../i18n'

function useClinicBrand() {
  const [settings, setSettings] = useState(null)
  useEffect(() => { api('/api/public/settings').then(setSettings).catch(() => setSettings({ clinicName: 'Sonpur Dental Clinic' })) }, [])
  return settings
}

function BrandMark({ settings }) {
  return settings?.logoUploaded
    ? <img className="brand-logo-image" src={`/api/public/logo?v=${encodeURIComponent(settings.logoUrl || '1')}`} alt={`${settings.clinicName || 'Clinic'} logo`} />
    : <span className="brand-mark">✳</span>
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [hasPatientSession, setHasPatientSession] = useState(() => Boolean(localStorage.getItem('sdc_patient_token')))
  const location = useLocation()
  const settings = useClinicBrand()
  const { t } = useLanguage()
  const close = () => setOpen(false)
  useEffect(() => { setHasPatientSession(Boolean(localStorage.getItem('sdc_patient_token'))) }, [location.pathname])
  useEffect(() => {
    if (!settings) return
    const name = settings.clinicName || 'Sonpur Dental Clinic'
    document.title = `${name} | Appointment Booking`
    const icon = document.querySelector('link[rel="icon"]')
    if (settings.logoUploaded) {
      const logoIcon = icon || document.createElement('link')
      logoIcon.rel = 'icon'
      logoIcon.href = `/api/public/logo?v=${encodeURIComponent(settings.logoUrl || '1')}`
      if (!logoIcon.parentNode) document.head.appendChild(logoIcon)
    } else if (icon?.href.includes('/api/public/logo')) {
      icon.remove()
    }
    const description = document.querySelector('meta[name="description"]')
    if (description && settings.description) description.content = settings.description
  }, [settings])
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={close}>
          <BrandMark settings={settings} />
          <span><strong>{settings?.clinicName || 'Sonpur Dental Clinic'}</strong><small>{t('Care for every smile.')}</small></span>
        </Link>
        <button className="mobile-menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/" onClick={close} className={({ isActive }) => isActive ? 'active' : ''}>{t('Home')}</NavLink>
          <a href={location.pathname === '/' ? '#care' : '/#care'} onClick={close}>{t('Our care')}</a>
          <NavLink to="/track" onClick={close}>{t('Track booking')}</NavLink>
          <NavLink to={hasPatientSession ? '/account' : '/login'} onClick={close}>{hasPatientSession ? t('My account') : t('Patient login')}</NavLink>
          <LanguageSwitcher compact />
          <Link className="nav-cta" to="/book" onClick={close}><CalendarDays size={16} /> {t('Book appointment')}</Link>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  const settings = useClinicBrand()
  const { t } = useLanguage()
  const clinicName = settings?.clinicName || 'Sonpur Dental Clinic'
  return <footer className="footer"><div className="container footer-inner"><div className="footer-brand"><BrandMark settings={settings} /><div><strong>{clinicName}</strong><p>{t('Care for every smile.')}</p></div></div><div className="footer-right"><span><ShieldCheck size={15} /> {t('Secure appointment requests')}</span><Link to="/admin">{t('Clinic admin')}</Link></div></div><div className="container copyright">© {new Date().getFullYear()} {clinicName}. {t('All rights reserved.')}</div></footer>
}

export function PageShell({ children }) {
  return <><Header /><main>{children}</main><Footer /></>
}

export function Toast({ message, type = 'error', onClose }) {
  if (!message) return null
  return <div className={`toast ${type}`} role="alert"><span>{message}</span><button onClick={onClose} aria-label="Close message"><X size={16} /></button></div>
}

export function Spinner({ label = 'Loading…' }) { return <div className="spinner-wrap"><span className="spinner" /><span>{label}</span></div> }
