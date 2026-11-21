import { useEffect, useState } from 'react'

function toParts(value) {
  if (!value || !/^\d{1,2}:\d{2}/.test(String(value))) return { hour: '', minute: '', period: '' }
  const [hourText, minuteText] = String(value).split(':')
  const hour24 = Number(hourText)
  if (!Number.isInteger(hour24) || hour24 < 0 || hour24 > 23) return { hour: '', minute: '', period: '' }
  return {
    hour: String(hour24 % 12 || 12).padStart(2, '0'),
    minute: String(minuteText).slice(0, 2).padStart(2, '0'),
    period: hour24 >= 12 ? 'PM' : 'AM',
  }
}

function to24Hour(parts) {
  let hour = Number(parts.hour) % 12
  if (parts.period === 'PM') hour += 12
  return `${String(hour).padStart(2, '0')}:${parts.minute}`
}

export default function TimePicker({ value, onChange, labels = {} }) {
  const [parts, setParts] = useState(() => toParts(value))

  useEffect(() => {
    setParts(toParts(value))
  }, [value])

  function update(field, nextValue) {
    const next = { ...parts, [field]: nextValue }
    setParts(next)
    onChange(next.hour && next.minute && next.period ? to24Hour(next) : '')
  }

  return <div className="time-picker" role="group" aria-label={labels.group || 'Select appointment time'}>
    <label className="time-picker-field">
      <span>{labels.hour || 'Hour'}</span>
      <select className="input time-picker-select" value={parts.hour} onChange={event => update('hour', event.target.value)} required>
        <option value="">HH</option>
        {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map(hour => <option key={hour} value={hour}>{hour}</option>)}
      </select>
    </label>
    <label className="time-picker-field">
      <span>{labels.minute || 'Minute'}</span>
      <select className="input time-picker-select" value={parts.minute} onChange={event => update('minute', event.target.value)} required>
        <option value="">MM</option>
        {Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0')).map(minute => <option key={minute} value={minute}>{minute}</option>)}
      </select>
    </label>
    <label className="time-picker-field">
      <span>{labels.period || 'AM / PM'}</span>
      <select className="input time-picker-select time-picker-period" value={parts.period} onChange={event => update('period', event.target.value)} required>
        <option value="">AM/PM</option>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </label>
  </div>
}
