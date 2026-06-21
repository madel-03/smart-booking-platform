const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');

const app = express();

app.use(helmet());
app.use(mongoSanitize());

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 200
}));

app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'طلبات كثيرة جداً من هذا الجهاز، يرجى المحاولة لاحقاً بعد 15 دقيقة.' }
});
app.use('/api/', limiter);

const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!'))
    .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

const appointmentSchema = new mongoose.Schema({
    customerName: String,
    phone: String,
    service: String,
    date: String,
    time: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Cancelled'],
        default: 'Pending'
    }
}, { versionKey: false });

const Appointment = mongoose.model('Appointment', appointmentSchema);

const validateAppointment = [
    body('customerName').trim().notEmpty().escape().withMessage('الاسم مطلوب وبدون رموز خاصة'),
    body('phone').trim().isNumeric().withMessage('رقم الهاتف يجب أن يحتوي على أرقام فقط'),
    body('service').trim().notEmpty().escape().withMessage('الخدمة مطلوبة'),
    body('date').trim().notEmpty().escape().withMessage('التاريخ مطلوب'),
    body('time').trim().notEmpty().escape().withMessage('الوقت مطلوب'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const isAdmin = (req, res, next) => {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret === process.env.ADMIN_SECRET_KEY) {
        next();
    } else {
        return res.status(403).json({ error: 'غير مصرح لك بالوصول لهذه البيانات.' });
    }
};

app.get('/api/appointments', isAdmin, async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في السيرفر' });
    }
});

app.post('/api/appointments', validateAppointment, async (req, res) => {
    try {
        const { customerName, phone, service, date, time } = req.body;
        const newAppointment = new Appointment({ customerName, phone, service, date, time });
        const savedAppointment = await newAppointment.save();
        res.status(201).json({
            message: '🎉 تم تسجيل الحجز بنجاح!',
            appointment: savedAppointment
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء حفظ الحجز' });
    }
});

app.patch('/api/appointments/:id', isAdmin, [
    body('status').isIn(['Pending', 'Approved', 'Cancelled']).withMessage('الحالة المرسلة غير صالحة')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { status } = req.body;
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'الحجز غير موجود' });
        }
        res.json(updatedAppointment);
    } catch (err) {
        res.status(500).json({ error: 'فشل تعديل الحجز' });
    }
});

app.delete('/api/appointments/:id', isAdmin, async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) {
            return res.status(404).json({ message: 'الحجز غير موجود' });
        }
        res.json({ message: 'تم حذف الموعد بنجاح' });
    } catch (err) {
        res.status(500).json({ error: 'فشل حذف الحجز' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🔥 Server running securely on port ${PORT}`);
});