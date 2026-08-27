require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { body, param, validationResult } = require('express-validator');

const app = express();

// ✅ الحماية من الهجمات الشائعة
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ⚠️ معطّل مؤقتاً بسبب عدم التوافق مع الإصدار الحالي
// TODO: حدّث express-mongo-sanitize أو استبدله بحل آخر
// app.use(mongoSanitize({ replaceWith: '_' }));

const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    ar: { error: 'طلبات كثيرة جداً من هذا الجهاز، يرجى المحاولة لاحقاً بعد 15 دقيقة.' },
    en: { error: 'Too many requests from this device, please try again after 15 minutes.' }
  }
});
app.use('/api/', limiter);

// ✅ الاتصال بقاعدة البيانات
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

// ✅ Schema محسّن مع قيود على مستوى قاعدة البيانات
const appointmentSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    maxlength: [100, 'الاسم طويل جداً'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'رقم الهاتف مطلوب'],
    maxlength: [20, 'رقم الهاتف طويل جداً'],
    trim: true
  },
  service: {
    type: String,
    required: [true, 'الخدمة مطلوبة'],
    maxlength: [200, 'اسم الخدمة طويل جداً'],
    trim: true
  },
  date: {
    type: String,
    required: [true, 'التاريخ مطلوب'],
    trim: true
  },
  time: {
    type: String,
    required: [true, 'الوقت مطلوب'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Cancelled'],
    default: 'Pending'
  }
}, {
  versionKey: false,
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// ✅ Middleware للتحقق من صحة الـ ObjectId
const validateObjectId = [
  param('id').custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('معرّف الحجز غير صالح');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ✅ Middleware التحقق من بيانات الحجز
const validateAppointment = [
  body('customerName').trim().notEmpty().escape().isLength({ max: 100 })
    .withMessage('الاسم مطلوب وبدون رموز خاصة ولا يتجاوز 100 حرف'),
  body('phone').trim().isNumeric().isLength({ min: 7, max: 20 })
    .withMessage('رقم الهاتف يجب أن يحتوي على أرقام فقط (7-20 رقم)'),
  body('service').trim().notEmpty().escape().isLength({ max: 200 })
    .withMessage('الخدمة مطلوبة ولا تتجاوز 200 حرف'),
  body('date').trim().notEmpty().escape()
    .withMessage('التاريخ مطلوب'),
  body('time').trim().notEmpty().escape()
    .withMessage('الوقت مطلوب'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ✅ Middleware التحقق من صلاحية الأدمن
const isAdmin = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret) {
    return res.status(401).json({ error: 'مطلوب مفتاح المصادقة.' });
  }
  if (adminSecret === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    return res.status(403).json({ error: 'غير مصرح لك بالوصول لهذه البيانات.' });
  }
};

// ✅ GET - جلب كل المواعيد (أدمن فقط)
app.get('/api/appointments', isAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('خطأ في جلب المواعيد:', err);
    res.status(500).json({ error: 'حدث خطأ في السيرفر' });
  }
});

// ✅ POST - إضافة موعد جديد (رسالة نجاح مترجمة حسب لغة العميل)
app.post('/api/appointments', validateAppointment, async (req, res) => {
  try {
    const { customerName, phone, service, date, time } = req.body;
    const newAppointment = new Appointment({ customerName, phone, service, date, time });
    const savedAppointment = await newAppointment.save();
    
    // استقبال لغة العميل من الـ Header (اختياري)
    const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'ar';
    const successMessage = lang === 'en'
      ? '🎉 Booking registered successfully!'
      : '🎉 تم تسجيل الحجز بنجاح!';
    
    res.status(201).json({
      message: successMessage,
      appointment: savedAppointment
    });
  } catch (err) {
    console.error('خطأ في حفظ الموعد:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حفظ الحجز' });
  }
});

// ✅ PATCH - تعديل حالة موعد (أدمن فقط) مع التحقق من الـ ID
app.patch('/api/appointments/:id', isAdmin, validateObjectId, [
  body('status').isIn(['Pending', 'Approved', 'Cancelled'])
    .withMessage('الحالة المرسلة غير صالحة'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
], async (req, res) => {
  try {
    const { status } = req.body;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }
    res.json(updatedAppointment);
  } catch (err) {
    console.error('خطأ في تعديل الموعد:', err);
    res.status(500).json({ error: 'فشل تعديل الحجز' });
  }
});

// ✅ DELETE - حذف موعد (أدمن فقط) مع التحقق من الـ ID
app.delete('/api/appointments/:id', isAdmin, validateObjectId, async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'الحجز غير موجود' });
    }
    res.json({ message: 'تم حذف الموعد بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف الموعد:', err);
    res.status(500).json({ error: 'فشل حذف الحجز' });
  }
});

// ✅ معالجة المسارات غير الموجودة
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running securely on port ${PORT}`);
});