import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const ADMIN_PASSWORD = 'sherlock221b';

function AdminPage() {
  const [entered, setEntered] = useState(false);
  const [password, setPassword] = useState('');
  const [wrongPass, setWrongPass] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setEntered(true);
      setWrongPass(false);
    } else {
      setWrongPass(true);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('خطأ في جلب المواعيد:', err);
    }
  };

  useEffect(() => {
    if (entered) fetchAppointments();
  }, [entered]);

  if (!entered) {
    return (
      <div className="sherlock-theme" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="case-file-card" style={{ maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div className="magnifier-icon" style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
          <h2 style={{ marginBottom: '20px' }}>دخول المحقق</h2>

          <div className="form-group">
            <input
              type="password"
              placeholder="أدخل كلمة السر..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', textAlign: 'center' }}
            />
          </div>

          {wrongPass && (
            <p style={{ color: '#f44336', marginBottom: '10px', fontWeight: 'bold' }}>
              كلمة السر غلط، حاول مرة ثانية
            </p>
          )}

          <button
            onClick={handleLogin}
            className="sherlock-btn"
            style={{ width: '100%', cursor: 'pointer', marginTop: '10px' }}
          >
            🔑 دخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sherlock-theme">
      <header className="sherlock-header">
        <div className="magnifier-icon">🔍</div>
        <h1>221B Booking Agency</h1>
        <p>لوحة تحكم المحقق</p>
        <button
          onClick={() => setEntered(false)}
          style={{ marginTop: '10px', padding: '6px 16px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#444', color: '#fff' }}
        >
          تسجيل خروج
        </button>
      </header>

      <main className="sherlock-main">
        <div className="dashboard-card">
          <h2>📊 لوحة تحكم القضايا (Dashboard)</h2>

          <div className="stats-container">
            <div className="stat-box">
              <span className="stat-title">إجمالي الحجوزات</span>
              <span className="stat-number">{appointments.length}</span>
            </div>
            <div className="stat-box highlight">
              <span className="stat-title">الحالة الأمنية</span>
              <span className="stat-number">مستقر</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="sherlock-table">
              <thead>
                <tr>
                  <th>المستنتج</th>
                  <th>المهمة</th>
                  <th>التاريخ</th>
                  <th>التوقيت</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      لا توجد قضايا مجدولة حالياً...
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => (
                    <tr key={app._id || app.id}>
                      <td>{app.customerName}</td>
                      <td>{app.service}</td>
                      <td>{app.date}</td>
                      <td>{app.time}</td>
                      <td><span className="status-badge">{app.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
