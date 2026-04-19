import nodemailer from 'nodemailer'

// تكوين إعدادات الإيميل
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

interface WorkOrderData {
  _id: string
  title: string
  type?: string
  priority?: string
  description?: string
  [key: string]: unknown
}

interface UserData {
  _id: string
  name: string
  email?: string
  phoneNumber?: string
}

// دالة إرسال إيميل
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Indusphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })
    
    console.log(`✅ تم إرسال الإيميل إلى ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ خطأ في إرسال الإيميل:', error)
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
    return { success: false, error: errorMessage }
  }
}

// قالب الإيميل للتكليف بمهمة
export function getWorkOrderAssignedEmailTemplate(workOrder: WorkOrderData, employee: UserData): string {
  const priorityText = 
    workOrder.priority === 'low' ? 'منخفضة' : 
    workOrder.priority === 'medium' ? 'متوسطة' : 
    workOrder.priority === 'high' ? 'عالية' : 'حرجة'
  
  const typeText = workOrder.type === 'corrective' ? 'تصحيحية' : 'وقائية'
  
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
          <p><strong>🔧 النوع:</strong> ${typeText}</p>
          <p><strong>⚠️ الأولوية:</strong> ${priorityText}</p>
          <p><strong>📝 الوصف:</strong> ${workOrder.description || 'لا يوجد وصف'}</p>
        </div>
        
        <p>يرجى الدخول إلى النظام لتأكيد استلام المهمة والبدء في العمل.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXTAUTH_URL}/fr/cmms/work-orders/${workOrder._id}" 
             style="background-color: #f59e0b; color: #0a0f1e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            عرض تفاصيل المهمة
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

// قالب الإيميل لتأكيد استلام المهمة
export function getWorkOrderAcknowledgedEmailTemplate(workOrder: WorkOrderData, employee: UserData): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0f1e; color: #f1f5f9;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e2d4a;">
        <h1 style="color: #f59e0b;">Indusphere</h1>
        <p style="color: #94a3b8;">نظام إدارة مصانع الأسمنت</p>
      </div>
      
      <div style="padding: 20px 0;">
        <h2 style="color: #10b981;">✅ تأكيد استلام مهمة</h2>
        <p>تم تأكيد استلام المهمة من قبل <strong>${employee.name}</strong>:</p>
        
        <div style="background-color: #0d1425; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>📌 المهمة:</strong> ${workOrder.title}</p>
          <p><strong>📅 تاريخ التأكيد:</strong> ${new Date().toLocaleString('ar')}</p>
        </div>
        
        <p>يمكنك متابعة تنفيذ المهمة من خلال النظام.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.NEXTAUTH_URL}/fr/cmms/work-orders/${workOrder._id}" 
             style="background-color: #f59e0b; color: #0a0f1e; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            متابعة المهمة
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