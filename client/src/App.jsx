import React, { useState } from 'react';
import axios from 'axios';
import { useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import './App.css';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { ar as arLocale, enUS } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ar', arLocale);
registerLocale('en', enUS);

function App() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    service: '',
    date: '',
    time: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/appointments`,
        formData
      );
      setMessage(t('booking.success'));
      setFormData({ customerName: '', phone: '', service: '', date: '', time: '' });
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(t('booking.error'));
    }
  };

  // دالة لتنسيق التسميات حسب اللغة
  const getDateLabel = () => {
    return language === 'ar' ? '📅 تاريخ الموعد:' : '📅 Appointment Date:';
  };

  const getTimeLabel = () => {
    return language === 'ar' ? '⏰ ساعة الصفر (التوقيت):' : '⏰ Zero Hour (Time):';
  };

  return (
    <div className="sherlock-theme">
      <header className="sherlock-header">
        <div className="magnifier-icon">🔍</div>
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
        <LanguageSwitcher />
      </header>

      <main className="sherlock-main">
        <div className="case-file-card">
          <div className="card-tape"></div>
          <h2 style={{ textAlign: 'center' }}>{t('booking.title')}</h2>

          {message && (
            <div style={{ color: '#4caf50', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ color: '#f44336', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="sherlock-form">
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', textAlign: 'center' }}>{t('booking.clientName')}</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder={t('booking.clientNamePlaceholder')}
                style={{ textAlign: 'center' }}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', textAlign: 'center' }}>{t('booking.phone')}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('booking.phonePlaceholder')}
                style={{ textAlign: 'center' }}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', textAlign: 'center' }}>{t('booking.service')}</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                style={{ textAlign: 'center' }}
                required
              >
                <option value="">{t('booking.servicePlaceholder')}</option>
                <option value="Medical Consultation">{t('booking.serviceMedical')}</option>
                <option value="Private Investigation">{t('booking.serviceInvestigation')}</option>
                <option value="Fitness Training">{t('booking.serviceFitness')}</option>
              </select>
            </div>

            <div className="form-group-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                <label style={{ display: 'block', textAlign: 'center' }}>{getDateLabel()}</label>
               
               <DatePicker
    selected={formData.date ? new Date(formData.date) : null}
  onChange={(selectedDate) => {
    const formatted = selectedDate.toISOString().split('T')[0];
    handleChange({ target: { name: 'date', value: formatted } });
  }}
  locale={language}
dateFormat={language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'}
  className="date-picker-input"
  wrapperClassName="date-picker-wrapper"
  required
/>
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                <label style={{ display: 'block', textAlign: 'center' }}>{getTimeLabel()}</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  style={{ textAlign: 'center' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="sherlock-btn"
              style={{ marginTop: '15px', width: '100%', cursor: 'pointer', textAlign: 'center' }}
            >
              {t('booking.submit')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;