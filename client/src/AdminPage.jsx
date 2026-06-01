import React, { useEffect, useState } from 'react';
import axios from 'axios';

// جلب الرابط من متغيرات البيئة في Vercel، وإذا مش موجود يستخدم المحلي كاحتياط
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. جلب المواعيد من السيرفر عند تحميل الصفحة
    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/appointments`);
            setAppointments(response.data);
            setError(null);
        } catch (err) {
            console.error('خطأ في جلب المواعيد:', err);
            setError('فشل في جلب البيانات من السيرفر. تأكد من اتصال الشبكة ورابط الـ API.');
        } finally {
            setLoading(false);
        }
    };

    // 2. تحديث حالة الحجز (PATCH)
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.patch(`${API_URL}/api/appointments/${id}`, { status: newStatus });
            if (response.status === 200) {
                // تحديث الحالة في الواجهة فوراً بدون إعادة تحميل الصفحة كاملة
                setAppointments(appointments.map(app => app._id === id ? { ...app, status: newStatus } : app));
                alert('🎉 تم تحديث حالة القضية بنجاح!');
            }
        } catch (err) {
            console.error('خطأ في تحديث الحالة:', err);
            alert('❌ فشل في تحديث الحالة، جرب مرة أخرى.');
        }
    };

    // 3. حذف الحجز نهائياً (DELETE)
    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من إغلاق وحذف ملف هذه القضية نهائياً؟')) {
            try {
                const response = await axios.delete(`${API_URL}/api/appointments/${id}`);
                if (response.status === 200) {
                    // إزالة الحجز من القائمة في الواجهة فوراً
                    setAppointments(appointments.filter(app => app._id !== id));
                    alert('🗑️ تم مسح سجل القضية بنجاح!');
                }
            } catch (err) {
                console.error('خطأ في حذف الحجز:', err);
                alert('❌ فشل في حذف القضية.');
            }
        }
    };

    return (
        <div style={{ backgroundColor: '#1e1610', color: '#f1e4d3', minHeight: '100vh', padding: '40px', fontFamily: 'Courier New, monospace' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '50px' }}>🔍</span>
                <h1 style={{ color: '#d4af37', margin: '10px 0' }}>221B Booking Agency</h1>
                <p style={{ letterSpacing: '2px', textTransform: 'uppercase', color: '#a09080' }}>لوحة تحكم المحقق</p>
                <hr style={{ width: '150px', borderColor: '#d4af37', margin: '20px auto' }} />
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#2c2017', padding: '30px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', border: '1px solid #3d2f24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px dashed #524132', paddingBottom: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px' }}>📊 لوحة تحكم القضايا (Dashboard)</h2>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ padding: '10px 20px', backgroundColor: '#1e1610', borderRadius: '4px', border: '1px solid #524132', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#a09080', marginBottom: '5px' }}>إجمالي الحجوزات</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>{appointments.length}</div>
                        </div>
                        <div style={{ padding: '10px 20px', backgroundColor: '#1e1610', borderRadius: '4px', border: '1px solid #524132', textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: '#a09080', marginBottom: '5px' }}>الحالة الأمنية</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>مستقر</div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: '#a09080', fontStyle: 'italic' }}>🕵️‍♂️ جاري البحث وجمع الأدلة المجدولة...</p>
                ) : error ? (
                    <div style={{ textAlign: 'center', color: '#e74c3c', padding: '20px', border: '1px solid #e74c3c', borderRadius: '4px' }}>{error}</div>
                ) : appointments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#a09080', fontStyle: 'italic' }}>...لا توجد قضايا مجدولة حالياً</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }} dir="rtl">
                            <thead>
                                <tr style={{ borderBottom: '2px solid #d4af37', color: '#d4af37' }}>
                                    <th style={{ padding: '12px' }}>المستنتج (العميل)</th>
                                    <th style={{ padding: '12px' }}>رقم التواصل</th>
                                    <th style={{ padding: '12px' }}>المهمة (الخدمة)</th>
                                    <th style={{ padding: '12px' }}>التاريخ</th>
                                    <th style={{ padding: '12px' }}>التوقيت</th>
                                    <th style={{ padding: '12px' }}>الحالة</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((app) => (
                                    <tr key={app._id} style={{ borderBottom: '1px solid #3d2f24', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '15px 12px', fontWeight: 'bold' }}>{app.customerName}</td>
                                        <td style={{ padding: '15px 12px', color: '#a09080' }}>{app.phone}</td>
                                        <td style={{ padding: '15px 12px' }}>{app.service}</td>
                                        <td style={{ padding: '15px 12px', color: '#a09080' }}>{app.date}</td>
                                        <td style={{ padding: '15px 12px', color: '#a09080' }}>{app.time}</td>
                                        <td style={{ padding: '15px 12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backgroundColor: app.status === 'Pending' ? '#d35400' : '#27ae60',
                                                color: '#fff'
                                            }}>
                                                {app.status === 'Pending' ? 'قيد الانتظار ⏳' : 'حُلّت القضية ✅'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                                            {app.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleStatusChange(app._id, 'Resolved')}
                                                    style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                                >
                                                    حل القضية
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(app._id)}
                                                style={{ backgroundColor: '#c0392b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                            >
                                                حذف Record
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;