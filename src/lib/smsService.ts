// خدمة إرسال الرسائل النصية (SMS) - وضع المحاكاة
// الرسائل تظهر في Terminal فقط، ولا يتم إرسالها فعلياً

interface SendSMSParams {
  to: string
  message: string
}

interface WorkOrderData {
  _id: string
  title: string
  type?: string
  priority?: string
  description?: string
}

interface UserData {
  _id: string
  name: string
  phoneNumber?: string
  email?: string
}

/**
 * إرسال رسالة SMS (وضع المحاكاة)
 */
export async function sendSMS({ to, message }: SendSMSParams) {
  try {
    // التحقق من وجود رقم الهاتف
    if (!to || to.length < 10) {
      console.log('⚠️ رقم الهاتف غير صالح:', to)
      return { success: false, error: 'رقم الهاتف غير صالح' }
    }

    // تنظيف رقم الهاتف للعرض
    const cleanNumber = to.replace(/\s/g, '')
    
    console.log(`📱 [SMS - محاكاة] إلى ${cleanNumber}: ${message}`)
    console.log(`✅ تم تسجيل رسالة SMS في السجل (لم يتم إرسالها فعلياً)`)
    
    return { success: true, messageId: `sms_sim_${Date.now()}`, simulated: true }
  } catch (error) {
    console.error('❌ خطأ في إرسال SMS:', error)
    return { success: false, error: 'خطأ في الإرسال' }
  }
}

/**
 * تنسيق رسالة SMS للتكليف بمهمة
 */
export function formatWorkOrderAssignedSMS(workOrder: WorkOrderData, employee: UserData): string {
  const priorityText = 
    workOrder.priority === 'low' ? 'منخفضة' : 
    workOrder.priority === 'medium' ? 'متوسطة' : 
    workOrder.priority === 'high' ? 'عالية' : 'حرجة'
  
  const typeText = workOrder.type === 'corrective' ? 'تصحيحية' : 'وقائية'
  
  let message = `Indusphere: تم تكليفك بمهمة "${workOrder.title}"`
  message += ` (${typeText}، أولوية: ${priorityText})`
  message += ` الرجاء الدخول للنظام للتأكيد: ${process.env.NEXTAUTH_URL}/fr/cmms/work-orders/${workOrder._id}`
  
  if (message.length > 160) {
    message = `Indusphere: مهمة جديدة: ${workOrder.title}. `
    message += `رابط: ${process.env.NEXTAUTH_URL}/fr/cmms/work-orders/${workOrder._id}`
  }
  
  return message
}

/**
 * تنسيق رسالة SMS لتأكيد استلام المهمة
 */
export function formatWorkOrderAcknowledgedSMS(workOrder: WorkOrderData): string {
  return `Indusphere: تم تأكيد استلام المهمة "${workOrder.title}". شكراً لك.`
}

/**
 * تنسيق رسالة SMS ترحيبية للمستخدم الجديد
 */
export function formatWelcomeSMS(user: UserData, password: string): string {
  return `Indusphere: مرحباً ${user.name}. تم إنشاء حسابك. البريد: ${user.email} | كلمة المرور المؤقتة: ${password}. يرجى تغييرها بعد تسجيل الدخول.`
}