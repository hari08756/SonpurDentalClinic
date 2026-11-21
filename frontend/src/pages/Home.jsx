import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Clock3, HeartPulse, MapPin, ShieldCheck, Smile, Sparkles, Stethoscope } from 'lucide-react'
import { api } from '../api'
import { Spinner } from '../components/Layout'
import { useLanguage } from '../i18n'

export default function Home() {
  const [settings, setSettings] = useState(null)
  const { t } = useLanguage()
  useEffect(() => { api('/api/public/settings').then(setSettings).catch(() => setSettings({ clinicName: 'Sonpur Dental Clinic', bookingFee: 100 })) }, [])
  if (!settings) return <div className="page-loader"><Spinner label={t('Loading clinic details…')} /></div>
  return <>
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> {t('A healthier smile starts here')}</div>
          <h1>{t('Make room for a')} <em>{t('brighter')}</em> {t('smile.')}</h1>
          <p className="hero-lead">{t('Thoughtful dental care, a comfortable clinic experience, and secure appointment booking — all in one place. Log in or create one patient account with your mobile number before booking.')}</p>
          <div className="hero-actions"><Link to="/book" className="btn btn-primary btn-lg">{t('Book an appointment')} <ArrowRight size={18} /></Link><a className="text-link" href="#care">{t('Explore our care')}</a></div>
          <div className="hero-trust"><div className="avatar-stack"><span>☺</span><span>✦</span><span>♥</span></div><div><strong>{t('Simple online booking')}</strong><small>{t('Choose a time that works for you')}</small></div></div>
        </div>
        <div className="hero-art">
          <img
            className="hero-clinic-banner"
            src="/images/sonpur-clinic-banner.png"
            alt="Sonpur Dental Clinic banner with a masked dentist, dental services, and appointment phone number 9794083112"
            fetchPriority="high"
          />
        </div>
      </div>
      <div className="hero-bottom container"><span>{t('PERSONAL CARE')}</span><span>{t('CONVENIENT APPOINTMENTS')}</span><span>{t('SMILE WITH CONFIDENCE')}</span></div>
    </section>

    <section className="info-strip"><div className="container info-grid"><div><span className="info-icon"><Clock3 /></span><span><strong>{settings.workingHours || t('Clinic timings')}</strong><small>{t('Appointment hours')}</small></span></div><div><span className="info-icon"><MapPin /></span><span><strong>{settings.address || t('Visit our clinic')}</strong><small>{t('Clinic location')}</small></span></div><div><span className="info-icon"><CalendarCheck /></span><span><strong>₹{settings.bookingFee} {t('onwards')}</strong><small>{t('Online booking fee')}</small></span></div></div></section>

    <section className="section care-section" id="care"><div className="container"><div className="section-heading"><div><div className="eyebrow">{t('CARE THAT COMES FIRST')}</div><h2>{t('Here for your')} <em>{t('everyday smile.')}</em></h2></div><p>{settings.description || t('A simple, welcoming experience for your dental care needs.')}</p></div><div className="care-grid"><article className="care-card care-main"><div className="care-art care-art-a"><Smile size={82} strokeWidth={1.15} /></div><div className="care-card-content"><span className="card-kicker">01 / {t('PREVENTIVE')}</span><h3>{t('Keep your smile healthy')}</h3><p>{t('Regular dental check-ups and guidance to help you care for your teeth.')}</p></div></article><article className="care-card"><div className="care-art care-art-b"><Sparkles size={68} strokeWidth={1.2} /></div><div className="care-card-content"><span className="card-kicker">02 / {t('RESTORATIVE')}</span><h3>{t('Care when you need it')}</h3><p>{t('Get the right attention for your dental concerns.')}</p></div></article><article className="care-card"><div className="care-art care-art-c"><HeartPulse size={68} strokeWidth={1.2} /></div><div className="care-card-content"><span className="card-kicker">03 / {t('PERSONAL')}</span><h3>{t('A visit made around you')}</h3><p>{t('Choose an available time and share your concern before you visit.')}</p></div></article></div></div></section>

    <section className="booking-band"><div className="container booking-band-inner"><div><div className="eyebrow light">{t('YOUR NEXT STEP')}</div><h2>{t('A little time for your smile')}<br />{t('can make a big difference.')}</h2><p>{t('Book online in a few simple steps.')}</p></div><Link to="/book" className="btn btn-light btn-lg">{t('Find an appointment')} <ArrowRight size={18} /></Link></div></section>
    <section className="section process-section"><div className="container"><div className="section-heading centered"><div><div className="eyebrow">{t('HOW IT WORKS')}</div><h2>{t('Booking, made')} <em>{t('simple.')}</em></h2></div></div><div className="process-grid"><div><span className="step-no">01</span><CalendarCheck /><h3>{t('Choose a slot')}</h3><p>{t('Pick an available date and appointment time.')}</p></div><div><span className="step-no">02</span><ShieldCheck /><h3>{t('Pay the booking fee')}</h3><p>{t('Scan the clinic QR and upload your payment screenshot.')}</p></div><div><span className="step-no">03</span><Stethoscope /><h3>{t('Get confirmation')}</h3><p>{t('The clinic verifies your payment and confirms your visit.')}</p></div></div></div></section>
  </>
}
