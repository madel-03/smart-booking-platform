import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
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
      const response = await axios.post('https://smart-booking-platform.onrender.com', formData);
      setMessage(response.data.message);
      setFormData({ customerName: '', phone: '', service: '', date: '', time: '' });
    } catch (err) {
      console.error('خطأ أثناء إرسال الطلب:', err);
      setError('تعذر الاتصال بالسيرفر، تأكد من حالة الشبكة والـ Terminal');
    }
  };

  return (
    <div className="sherlock-theme">
      <header className="sherlock-header">
        <div className="magnifier-icon">🔍</div>
        <h1>221B Booking Agency</h1>
        <p>منصة الحجوزات الذكية — قيد التحقيق والجدولة الاحترافية</p>
      </header>

      <main className="sherlock-main">
        <div className="case-file-card">
          <div className="card-tape"></div>
          <h2>📋 تسجيل قضية (طلب حجز جديد)</h2>

          {message && <div style={{ color: '#4caf50', marginBottom: '15px', fontWeight: 'bold' }}>{message}</div>}
          {error && <div style={{ color: '#f44336', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="sherlock-form">
            <div className="form-group">
              <label>👤 اسم العميل (المستنتج):</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="جون واتسون..." required />
            </div>

            <div className="form-group">
              <label>📞 برقية الاتصال (رقم الجوال):</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" required />
            </div>

            <div className="form-group">
              <label>💼 نوع الخدمة (المهمة):</label>
              <select name="service" value={formData.service} onChange={handleChange} required>
                <option value="">اختر المهمة المطروحة...</option>
                <option value="Medical Consultation">عيادة طبية (د. واتسون)</option>
                <option value="Private Investigation">تحقيق واستشارة خاصة</option>
                <option value="Fitness Training">تدريب لياقة بدني مكثف</option>
              </select>
            </div>

            <div className="form-group-row" style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>📅 تاريخ الموعد:</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>⏰ ساعة الصفر (التوقيت):</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="sherlock-btn" style={{ marginTop: '15px', width: '100%', cursor: 'pointer' }}>
              🔐 تأكيد وجدولة الموعد
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
