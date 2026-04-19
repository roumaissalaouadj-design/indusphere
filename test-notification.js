// test-notification.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/Indusphere';

// تعريف نموذج Notification مؤقتاً
const NotificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  category: { type: String, enum: ['maintenance', 'work_order', 'inventory', 'system', 'alert'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);

async function createNotification() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');
    
    // الحصول على أول مستخدم
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const firstUser = await User.findOne();
    
    if (!firstUser) {
      console.log('❌ لا يوجد مستخدمين في قاعدة البيانات');
      console.log('الرجاء تسجيل الدخول أولاً أو إنشاء مستخدم');
      return;
    }
    
    console.log('📝 المستخدم:', firstUser.email);
    console.log('🏭 tenantId:', firstUser.tenantId);
    
    // إنشاء إشعار تجريبي
    const notification = await Notification.create({
      tenantId: firstUser.tenantId,
      userId: firstUser._id,
      title: '🎉 نظام الإشعارات جاهز',
      message: 'تم إنشاء نظام الإشعارات بنجاح! هذه أول إشعار لك.',
      type: 'success',
      category: 'system'
    });
    
    console.log('✅ تم إنشاء الإشعار:', notification);
    console.log('📊 مجموعات قاعدة البيانات:');
    
    // عرض جميع المجموعات
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

createNotification();