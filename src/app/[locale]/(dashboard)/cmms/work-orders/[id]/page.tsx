'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import styles from '@/styles/pages/work-order-detail.module.css'

interface WorkOrder {
  _id: string
  title: string
  description: string
  type: 'corrective' | 'preventive'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'acknowledged' | 'in-progress' | 'done' | 'cancelled'
  assetId: { name: string; assetCode: string; _id?: string }
  assignedTo?: { 
    _id?: string
    fullName: string
    email: string
    phone?: string
  }
  assignedBy?: { name: string; email: string; _id?: string }
  assignedAt?: string
  acknowledgedAt?: string
  startDate?: string
  endDate?: string
  completedAt?: string
  notes?: string
  createdAt: string
}

// دوال للحصول على الكلاسات
const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'low': return styles.priorityLow
    case 'medium': return styles.priorityMedium
    case 'high': return styles.priorityHigh
    case 'critical': return styles.priorityCritical
    default: return ''
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'open': return styles.statusOpen
    case 'assigned': return styles.statusAssigned
    case 'acknowledged': return styles.statusAcknowledged
    case 'in-progress': return styles.statusInProgress
    case 'done': return styles.statusDone
    case 'cancelled': return styles.statusCancelled
    default: return ''
  }
}

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'low': return 'منخفض'
    case 'medium': return 'متوسط'
    case 'high': return 'عالي'
    case 'critical': return 'حرج'
    default: return priority
  }
}

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'open': return 'مفتوح'
    case 'assigned': return 'مكلف'
    case 'acknowledged': return 'تم الاستلام'
    case 'in-progress': return 'جاري'
    case 'done': return 'منتهي'
    case 'cancelled': return 'ملغي'
    default: return status
  }
}

export default function WorkOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const t = useTranslations('Common')
  const tWo = useTranslations('WorkOrder')
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const id = params?.id as string

  useEffect(() => {
    if (id) {
      fetchWorkOrder()
    }
  }, [id])

  const fetchWorkOrder = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/work-orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setWorkOrder(data.data)
      } else {
        setError(data.message || 'فشل في تحميل أمر العمل')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeTask = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/work-orders/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success) {
        setWorkOrder(data.data)
        alert('✅ تم تأكيد استلام المهمة بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (err) {
      alert('حدث خطأ في تأكيد الاستلام')
    } finally {
      setUpdating(false)
    }
  }

  const completeTask = async () => {
    if (!confirm('هل أنت متأكد من إكمال هذه المهمة؟')) return
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'done', 
          completedAt: new Date(),
          endDate: new Date()
        })
      })
      const data = await res.json()
      if (data.success) {
        setWorkOrder(data.data)
        alert('✅ تم إكمال المهمة بنجاح!')
      } else {
        alert(data.message || 'حدث خطأ')
      }
    } catch (err) {
      alert('حدث خطأ في إكمال المهمة')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>{t('loading') || 'جاري التحميل...'}</div>
        </div>
      </div>
    )
  }

  if (error || !workOrder) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{error || 'أمر العمل غير موجود'}</p>
            <button
              onClick={() => router.push('/fr/cmms/work-orders')}
              className={styles.backButton}
            >
              العودة إلى القائمة
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentUserEmail = session?.user?.email
  const assignedUserEmail = workOrder.assignedTo?.email
  const isAssignedToMe = assignedUserEmail === currentUserEmail
  const canAcknowledge = workOrder.status === 'assigned' && isAssignedToMe
  const canComplete = (workOrder.status === 'acknowledged' || workOrder.status === 'in-progress') && isAssignedToMe

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{workOrder.title}</h1>
            <p className={styles.subtitle}>{tWo('details') || 'تفاصيل أمر العمل'}</p>
          </div>
          <button
            onClick={() => router.push('/fr/cmms/work-orders')}
            className={styles.backButton}
          >
            ← العودة
          </button>
        </div>

        {/* زر تأكيد استلام المهمة */}
        {canAcknowledge && (
          <div className={`${styles.actionCard} ${styles.actionCardAmber}`}>
            <p className={`${styles.actionText} ${styles.actionTextAmber}`}>
              📋 تم تكليفك بهذه المهمة. يرجى تأكيد الاستلام للبدء في العمل.
            </p>
            <button
              onClick={acknowledgeTask}
              disabled={updating}
              className={`${styles.actionButton} ${styles.actionButtonAmber}`}
            >
              {updating ? 'جاري...' : '✓ تأكيد استلام المهمة'}
            </button>
          </div>
        )}

        {/* زر إكمال المهمة */}
        {canComplete && (
          <div className={`${styles.actionCard} ${styles.actionCardGreen}`}>
            <p className={`${styles.actionText} ${styles.actionTextGreen}`}>
              ✅ تم إنجاز المهمة؟ يمكنك تغيير حالتها إلى &quot;منتهي&quot;.
            </p>
            <button
              onClick={completeTask}
              disabled={updating}
              className={`${styles.actionButton} ${styles.actionButtonGreen}`}
            >
              {updating ? 'جاري...' : '✓ إكمال المهمة'}
            </button>
          </div>
        )}

        {/* ❌ تم حذف زر تقييم جودة العمل */}

        {/* Main Content */}
        <div className={styles.mainCard}>
          {/* Status Badge */}
          <div className={styles.statusSection}>
            <div className={styles.statusGroup}>
              <span className={styles.statusLabel}>الحالة:</span>
              <span className={`${styles.statusBadge} ${getStatusClass(workOrder.status)}`}>
                {getStatusLabel(workOrder.status)}
              </span>
            </div>
            <div className={styles.statusGroup}>
              <span className={styles.statusLabel}>الأولوية:</span>
              <span className={`${styles.statusBadge} ${getPriorityClass(workOrder.priority)}`}>
                {getPriorityLabel(workOrder.priority)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className={styles.detailsSection}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>الأصل</span>
              <p className={styles.detailValue}>{workOrder.assetId?.name} ({workOrder.assetId?.assetCode})</p>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>نوع العمل</span>
              <p className={styles.detailValue}>{workOrder.type === 'corrective' ? 'تصحيحية' : 'وقائية'}</p>
            </div>

            {workOrder.description && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>الوصف</span>
                <p className={styles.detailValue}>{workOrder.description}</p>
              </div>
            )}

            {workOrder.assignedTo && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>المكلف بالتنفيذ</span>
                <p className={`${styles.detailValue} ${styles.detailValueWithIcon}`}>
                  {workOrder.assignedTo.fullName}
                  {workOrder.assignedTo.phone && ` - 📞 ${workOrder.assignedTo.phone}`}
                </p>
              </div>
            )}

            {workOrder.assignedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>تاريخ التكليف</span>
                <p className={styles.detailValue}>{new Date(workOrder.assignedAt).toLocaleString('ar')}</p>
              </div>
            )}

            {workOrder.acknowledgedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>تاريخ تأكيد الاستلام</span>
                <p className={styles.detailValue}>{new Date(workOrder.acknowledgedAt).toLocaleString('ar')}</p>
              </div>
            )}

            {workOrder.completedAt && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>تاريخ الإنجاز</span>
                <p className={styles.detailValue}>{new Date(workOrder.completedAt).toLocaleString('ar')}</p>
              </div>
            )}

            {workOrder.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ملاحظات</span>
                <p className={styles.detailValue}>{workOrder.notes}</p>
              </div>
            )}

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>تاريخ الإنشاء</span>
              <p className={styles.detailValue}>{new Date(workOrder.createdAt).toLocaleString('ar')}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}