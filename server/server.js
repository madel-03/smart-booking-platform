const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// رابط MongoDB الصحيح
const MONGO_URI = 'mongodb://admin:admin10@ac-rnj5kbb-shard-00-00.5buf02i.mongodb.net:27017,ac-rnj5kbb-shard-00-01.5buf02i.mongodb.net:27017,ac-rnj5kbb-shard-00-02.5buf02i.mongodb.net:27017/?ssl=true&replicaSet=atlas-6cjcc7-shard-0&authSource=admin&appName=Cluster0';// الاتصال بقاعدة البيانات
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
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
});