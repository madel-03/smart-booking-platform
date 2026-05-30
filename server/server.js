
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
 
const app = express();
 
app.use(cors({
  origin: 'https://smart-booking-platform-lilac.vercel.app'
}));
app.use(express.json());
 
// رابط MongoDB من البيئة
const MONGO_URI = process.env.MONGODB_URI;
 
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));
 
// إنشاء Schema
const appointmentSchema = new mongoose.Schema({
    customerName: String,
    phone: String,
    service: String,
    date: String,
    time: String,
    status: {
        type: String,
        default: 'Pending'
    }
}, { versionKey: false });
 
// إنشاء Model
const Appointment = mongoose.model('Appointment', appointmentSchema);
 
// جلب جميع الحجوزات
app.get('/api/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// إضافة حجز جديد
app.post('/api/appointments', async (req, res) => {
    try {
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        res.status(201).json({
            message: '🎉 تم تسجيل الحجز بنجاح!',
            appointment: savedAppointment
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});
 