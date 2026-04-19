import { connectDB } from './mongodb'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'
import User from '@/models/User'
import Employee from '@/models/Employee'
import nodemailer from 'nodemailer'
import { sendSMS, formatWorkOrderAssignedSMS } from './smsService'

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'maintenance' | 'work_order' | 'inventory' | 'system' | 'alert'
  link?: string
  metadata?: Record<string, unknown>
}

interface WorkOrderData {
  _id: string
  title: string
  type?: string
  priority?: string
  description?: string
  [key: string]: unknown
}

interface MaintenanceRequestData {
  _id: string
  title: string
  [key: string]: unknown
}

interface EmployeeData {
  _id: string
  fullName: string
  email?: string
  phone?: string
}

// ==================== إعداد الإيميل ====================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// التحقق من إعدادات الإيميل عند البدء
async function verifyEmailConfig(): Promise<boolean> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ متغيرات الإيميل غير مضبوطة في .env.local (EMAIL_USER, EMAIL_PASS)')
    return false
  }
  try {
    await transporter.verify()
    console.log('✅ إعدادات الإيميل صحيحة')
    return true
  } catch (error) {
    console.error('❌ خطأ في إعدادات الإيميل:', error)
    return false
  }
}

// دالة إرسال إيميل
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ تم تخطي إرسال الإيميل — EMAIL_USER أو EMAIL_PASS غير مضبوطين في .env.local')
    return { success: false, error: 'Email not configured' }
  }
  try {
    const info = await transporter.sendMail({
      from: `"Indusphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`✅ تم إرسال الإيميل إلى ${to} — ID: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ خطأ في إرسال الإيميل:', error)
    return { success: false, error }
  }
}

// ==================== قوالب الإيميل ====================
function getWorkOrderAssignedEmailTemplate(
  workOrder: WorkOrderData,
  employee: { name: string; email?: string }
) {
  const priorityMap: Record<string, string> = {
    low: 'منخفضة', medium: 'متوسطة', high: 'عالية', critical: 'حرجة'
  }
  const typeMap: Record<string, string> = {
    corrective: 'تصحيحية', preventive: 'وقائية'
  }

  // استخدام NEXTAUTH_URL بدون لغة ثابتة
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const workOrderUrl = `${baseUrl}/ar/cmms/work-orders`

  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0f1e; color: #f1f5f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e2d4a;">
        <h1 style="color: #f59e0b;">Indusphere</h1>
        <p style="color: #94a3b8;">نظام إدارة مصانع الأسمنت</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #f59e0b;">📋 تكليف بمهمة جديدة</h2>
        <p>السلام عليكم <strong>${employee.name}</strong>،</p>
        <p>تم تكليفك بمهمة صيانة جديدة:</p>
        <div style="background-color: #0d1425; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>📌 المهمة:</strong> ${workOrder.title}</p>
          <p><strong>🔧 النوع:</strong> ${typeMap[workOrder.type || ''] || workOrder.type || '—'}</p>
          <p><strong>⚠️ الأولوية:</strong> ${priorityMap[workOrder.priority || ''] || workOrder.priority || '—'}</p>
          <p><strong>📝 الوصف:</strong> ${workOrder.description || 'لا يوجد وصف'}</p>
        </div>
        <p>يرجى الدخول إلى النظام لتأكيد استلام المهمة والبدء في العمل.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${workOrderUrl}"
             style="background-color: #f59e0b; color: #0a0f1e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            عرض أوامر العمل
          </a>
        </div>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #1e2d4a; text-align: center; color: #475569; font-size: 12px;">
        <p>هذا بريد آلي، يرجى عدم الرد عليه.</p>
        <p>© 2024 Indusphere - جميع الحقوق محفوظة</p>
      </div>
    </div>
  `
}

// ==================== إنشاء إشعار ====================
export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB()

    let userId: mongoose.Types.ObjectId
    let tenantId: mongoose.Types.ObjectId

    // محاولة 1: البحث مباشرة كـ User
    const user = await User.findById(params.userId).catch(() => null)

    if (user) {
      userId   = user._id
      tenantId = user.tenantId
    } else {
      // محاولة 2: البحث كـ Employee ثم ربطه بـ User
      const employee = await Employee.findById(params.userId).catch(() => null)
      if (employee?.email) {
        const linkedUser = await User.findOne({ email: employee.email })
        if (linkedUser) {
          userId   = linkedUser._id
          tenantId = linkedUser.tenantId
          console.log('✅ تم ربط الموظف بالمستخدم:', linkedUser.name)
        } else {
          // لا يوجد مستخدم مرتبط — نستخدم معرف الموظف
          userId   = new mongoose.Types.ObjectId(params.userId)
          tenantId = employee.tenantId || new mongoose.Types.ObjectId(params.userId)
          console.warn('⚠️ لا يوجد مستخدم مرتبط بالموظف:', employee.email)
        }
      } else {
        userId   = new mongoose.Types.ObjectId(params.userId)
        tenantId = new mongoose.Types.ObjectId(params.userId)
        console.warn('⚠️ لم يُعثر على مستخدم أو موظف بهذا المعرف:', params.userId)
      }
    }

    const notification = await Notification.create({
      tenantId,
      userId,
      title:    params.title,
      message:  params.message,
      type:     params.type,
      category: params.category,
      link:     params.link,
      metadata: params.metadata,
      isRead:   false,
    })

    console.log('✅ إشعار جديد:', notification._id, '—', notification.title)
    return notification
  } catch (error) {
    console.error('❌ خطأ في createNotification:', error)
    return null
  }
}

// ==================== أمر عمل: تم الإنشاء ====================
export async function notifyWorkOrderCreated(workOrder: WorkOrderData, userId: string) {
  return createNotification({
    userId,
    title:    '📋 أمر عمل جديد',
    message:  `تم إنشاء أمر عمل: ${workOrder.title}`,
    type:     'info',
    category: 'work_order',
    link:     `/cmms/work-orders/${workOrder._id}`,
    metadata: { workOrderId: workOrder._id },
  })
}

// ==================== أمر عمل: تم التكليف ====================
export async function notifyWorkOrderAssigned(workOrder: WorkOrderData, employeeId: string) {
  try {
    await connectDB()

    const EmployeeModel = mongoose.models.Employee
    if (!EmployeeModel) {
      console.error('❌ نموذج Employee غير موجود')
      return false
    }

    const employee = await EmployeeModel.findById(employeeId) as EmployeeData | null
    if (!employee) {
      console.error('❌ الموظف غير موجود:', employeeId)
      return false
    }

    console.log('👤 الموظف:', employee.fullName, '| البريد:', employee.email, '| الهاتف:', employee.phone)

    // تحديد userId للإشعار الداخلي
    let userId = employeeId
    if (employee.email) {
      const linkedUser = await User.findOne({ email: employee.email })
      if (linkedUser) {
        userId = linkedUser._id.toString()
        console.log('✅ مستخدم مرتبط:', linkedUser.name)
      } else {
        console.warn('⚠️ لا يوجد حساب مرتبط بالبريد:', employee.email)
      }
    }

    // إشعار داخل النظام
    await createNotification({
      userId,
      title:    '👷 تكليف بمهمة جديدة',
      message:  `تم تكليفك بمهمة: ${workOrder.title}`,
      type:     'warning',
      category: 'work_order',
      link:     `/cmms/work-orders/${workOrder._id}`,
      metadata: { workOrderId: workOrder._id, assignedAt: new Date() },
    })

    // إيميل للموظف
    if (employee.email?.trim()) {
      const emailHtml = getWorkOrderAssignedEmailTemplate(workOrder, {
        name:  employee.fullName,
        email: employee.email,
      })
      await sendEmail(
        employee.email,
        `📋 تكليف بمهمة جديدة: ${workOrder.title}`,
        emailHtml
      )
    } else {
      console.warn('⚠️ لا يوجد بريد إلكتروني للموظف:', employee.fullName)
    }

    // SMS
    if (employee.phone?.trim()) {
      const smsMessage = formatWorkOrderAssignedSMS(workOrder, {
        name:        employee.fullName,
        phoneNumber: employee.phone,
        _id:         employee._id,
      })
      await sendSMS({ to: employee.phone, message: smsMessage })
    } else {
      console.warn('⚠️ لا يوجد رقم هاتف للموظف:', employee.fullName)
    }

    return true
  } catch (error) {
    console.error('❌ خطأ في notifyWorkOrderAssigned:', error)
    return false
  }
}

// ==================== طلب صيانة: تم الإنشاء ====================
export async function notifyMaintenanceRequestCreated(
  request: MaintenanceRequestData,
  userId: string
) {
  return createNotification({
    userId,
    title:    '🔧 طلب صيانة جديد',
    message:  `تم إنشاء طلب صيانة: ${request.title}`,
    type:     'warning',
    category: 'maintenance',
    link:     `/cmms/maintenance-requests/${request._id}`,
    metadata: { requestId: request._id },
  })
}

// ==================== أمر عمل: تم التأكيد ====================
export async function notifyWorkOrderAcknowledged(workOrder: WorkOrderData, userId: string) {
  return createNotification({
    userId,
    title:    '✅ تأكيد استلام مهمة',
    message:  `تم تأكيد استلام المهمة: ${workOrder.title}`,
    type:     'success',
    category: 'work_order',
    link:     `/cmms/work-orders/${workOrder._id}`,
    metadata: { workOrderId: workOrder._id, acknowledgedAt: new Date() },
  })
}

// ==================== إيميل ترحيب لمستخدم جديد ====================
export async function sendWelcomeEmail(params: {
  email: string
  name: string
  password: string
  role: string
  isRandomPassword: boolean
}) {
  const { email, name, password, role, isRandomPassword } = params
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0f1e; color: #f1f5f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e2d4a;">
        <h1 style="color: #f59e0b;">Indusphere</h1>
        <p style="color: #94a3b8;">نظام إدارة مصانع الأسمنت</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #f59e0b;">🎉 مرحباً بك في Indusphere</h2>
        <p>السلام عليكم <strong>${name}</strong>،</p>
        <p>تم إنشاء حساب لك في نظام Indusphere لإدارة مصنع الأسمنت.</p>
        <div style="background-color: #0d1425; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📧 البريد الإلكتروني:</strong> ${email}</p>
          <p><strong>🔑 كلمة المرور:</strong> <code style="background-color: #1e2d4a; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          <p><strong>👤 الدور:</strong> ${role}</p>
        </div>
        ${isRandomPassword ? `
          <div style="background-color: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); padding: 12px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #f59e0b; margin: 0;">⚠️ هذه كلمة مرور مؤقتة. يرجى تغييرها بعد تسجيل الدخول.</p>
          </div>
        ` : ''}
        <div style="text-align: center; margin: 25px 0;">
          <a href="${baseUrl}/ar/login"
             style="background-color: #f59e0b; color: #0a0f1e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            تسجيل الدخول إلى النظام
          </a>
        </div>
      </div>
      <div style="padding-top: 20px; border-top: 1px solid #1e2d4a; text-align: center; color: #475569; font-size: 12px;">
        <p>هذا بريد آلي، يرجى عدم الرد عليه.</p>
        <p>© 2024 Indusphere - جميع الحقوق محفوظة</p>
      </div>
    </div>
  `

  return sendEmail(email, '🎉 مرحباً بك في Indusphere - بيانات حسابك', html)
}