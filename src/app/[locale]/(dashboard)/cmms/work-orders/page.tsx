'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import TableActions from '@/components/TableActions'
import styles from '@/styles/pages/work-orders.module.css'

interface WorkOrder {
  _id: string
  title: string
  type: 'corrective' | 'preventive'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'acknowledged' | 'in-progress' | 'done' | 'cancelled'
  assetId: { name: string; assetCode: string } | null
  assignedTo?: { fullName: string; email: string }
  createdAt: string
}

interface Employee {
  _id: string
  fullName: string
  position: string
  department: string
  phone?: string
  status: string
}

const priorityConfig: Record<string, { label: string }> = {
  low:      { label: 'منخفض' },
  medium:   { label: 'متوسط' },
  high:     { label: 'عالي' },
  critical: { label: 'حرج' },
}

const statusConfig: Record<string, { label: string }> = {
  open:          { label: 'مفتوح' },
  assigned:      { label: 'مكلف' },
  acknowledged:  { label: 'تم الاستلام' },
  'in-progress': { label: 'جاري' },
  done:          { label: 'منتهي' },
  cancelled:     { label: 'ملغي' },
}

const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case 'low':      return styles.priorityLow
    case 'medium':   return styles.priorityMedium
    case 'high':     return styles.priorityHigh
    case 'critical': return styles.priorityCritical
    default:         return ''
  }
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'open':          return styles.statusOpen
    case 'assigned':      return styles.statusAssigned
    case 'acknowledged':  return styles.statusAcknowledged
    case 'in-progress':   return styles.statusInProgress
    case 'done':          return styles.statusDone
    case 'cancelled':     return styles.statusCancelled
    default:              return ''
  }
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const locale = useLocale()
  const t   = useTranslations('Common')
  const tWo = useTranslations('WorkOrder')

  const [workOrders, setWorkOrders]           = useState<WorkOrder[]>([])
  const [loading, setLoading]                 = useState(true)
  const [showForm, setShowForm]               = useState(false)
  const [assets, setAssets]                   = useState<{ _id: string; name: string; assetCode: string }[]>([])
  const [employees, setEmployees]             = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [positions, setPositions]             = useState<string[]>([])
  const [filteredPositions, setFilteredPositions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    assetId: '',
    type: 'corrective',
    priority: 'medium',
    assignmentMethod: 'auto',
    specialization: '',
    assignedTo: '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    fetchWorkOrders()
    fetchAssets()
    fetchPositions()
  }, [])

  useEffect(() => {
    if (form.assignmentMethod === 'manual') {
      fetchAllEmployees()
    }
  }, [form.assignmentMethod])

  useEffect(() => {
    if (form.assignmentMethod === 'auto' && form.specialization) {
      fetchEmployeesBySpecialization(form.specialization)
    }
  }, [form.specialization, form.assignmentMethod])

  const fetchWorkOrders = async () => {
    try {
      setError(null)
      const res  = await fetch('/api/work-orders')
      const data = await res.json()
      if (data.success) setWorkOrders(data.data)
      else setError(data.message)
    } catch {
      setError(t('fetchError') || 'فشل في تحميل أوامر العمل')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const res  = await fetch('/api/assets')
      const data = await res.json()
      if (data.success) setAssets(data.data)
    } catch (err) {
      console.error('Fetch assets error:', err)
    }
  }

  const fetchPositions = async () => {
    try {
      const res  = await fetch('/api/employees/positions')
      const data = await res.json()
      if (data.success) setPositions(data.data)
    } catch (err) {
      console.error('Fetch positions error:', err)
    }
  }

  const fetchAllEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const res  = await fetch('/api/employees')
      const data = await res.json()
      if (data.success) {
        setEmployees(data.data.filter((emp: Employee) => emp.status === 'active'))
      }
    } catch (err) {
      console.error('Fetch employees error:', err)
    } finally {
      setLoadingEmployees(false)
    }
  }

  const fetchEmployeesBySpecialization = async (specialization: string) => {
    if (!specialization) return
    try {
      const res  = await fetch(`/api/employees?position=${encodeURIComponent(specialization)}`)
      const data = await res.json()
      if (data.success) {
        setEmployees(data.data.filter((emp: Employee) => emp.status === 'active'))
      }
    } catch (err) {
      console.error('Fetch employees by specialization error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    const res  = await fetch(`/api/work-orders/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      await fetchWorkOrders()
      alert(t('deleteSuccess') || 'تم حذف أمر العمل بنجاح')
    } else {
      alert(data.message || t('deleteFailed') || 'فشل الحذف')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      interface SubmitData {
        title: string
        description: string
        assetId: string
        type: string
        priority: string
        autoAssign?: boolean
        specialization?: string
        assignedTo?: string
      }

      const submitData: SubmitData = {
        title:       form.title,
        description: form.description,
        assetId:     form.assetId,
        type:        form.type,
        priority:    form.priority,
      }

      if (form.assignmentMethod === 'auto') {
        submitData.autoAssign      = true
        submitData.specialization  = form.specialization
      } else {
        submitData.assignedTo = form.assignedTo
      }

      const res  = await fetch('/api/work-orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(submitData),
      })
      const data = await res.json()

      if (data.success) {
        await fetchWorkOrders()
        setShowForm(false)
        setForm({
          title: '', description: '', assetId: '',
          type: 'corrective', priority: 'medium',
          assignmentMethod: 'auto', specialization: '', assignedTo: '',
        })
        alert(t('addSuccess') || 'تم إضافة أمر العمل بنجاح')
      } else {
        setError(data.message)
        alert(`${t('error') || 'خطأ'}: ${data.message}`)
      }
    } catch {
      setError(t('serverError') || 'حدث خطأ في الاتصال بالخادم')
      alert(t('serverError') || 'حدث خطأ في الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{tWo('title') || 'أوامر العمل'}</h1>
            <p className={styles.subtitle}>{tWo('subtitle') || 'متابعة وإدارة طلبات الصيانة'}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className={styles.addButton}>
            + {tWo('new') || 'أمر عمل جديد'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>{tWo('new') || 'أمر عمل جديد'}</h2>
            <form onSubmit={handleSubmit} className={styles.formGrid}>

              {/* العنوان */}
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('title') || 'العنوان'} *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={t('titlePlaceholder') || 'صيانة مضخة الماء'}
                  className={styles.formInput}
                />
              </div>

              {/* الأصل */}
              <div>
                <label className={styles.formLabel}>{t('asset') || 'الأصل'} *</label>
                <select
                  required
                  value={form.assetId}
                  onChange={e => setForm({ ...form, assetId: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="">{t('selectAsset') || 'اختر أصلاً'}</option>
                  {assets.map(a => (
                    <option key={a._id} value={a._id}>{a.name} ({a.assetCode})</option>
                  ))}
                </select>
              </div>

              {/* النوع */}
              <div>
                <label className={styles.formLabel}>{tWo('type') || 'النوع'}</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="corrective">{tWo('corrective') || 'تصحيحية'}</option>
                  <option value="preventive">{tWo('preventive') || 'وقائية'}</option>
                </select>
              </div>

              {/* الأولوية */}
              <div>
                <label className={styles.formLabel}>{tWo('priority') || 'الأولوية'}</label>
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className={styles.formSelect}
                >
                  <option value="low">{tWo('low') || 'منخفض'}</option>
                  <option value="medium">{tWo('medium') || 'متوسط'}</option>
                  <option value="high">{tWo('high') || 'عالي'}</option>
                  <option value="critical">{tWo('critical') || 'حرج'}</option>
                </select>
              </div>

              {/* طريقة التوزيع */}
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('assignmentMethod') || 'طريقة التوزيع'}</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="auto"
                      checked={form.assignmentMethod === 'auto'}
                      onChange={e => setForm({ ...form, assignmentMethod: e.target.value, assignedTo: '' })}
                    />
                    <span>{t('autoAssign') || 'توزيع تلقائي حسب المنصب'}</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="manual"
                      checked={form.assignmentMethod === 'manual'}
                      onChange={e => setForm({ ...form, assignmentMethod: e.target.value, specialization: '' })}
                    />
                    <span>{t('manualAssign') || 'اختيار يدوي'}</span>
                  </label>
                </div>
              </div>

              {/* حقل التخصص مع Autocomplete */}
              <div style={{ position: 'relative' }}>
                <label className={styles.formLabel}>
                  {form.assignmentMethod === 'auto'
                    ? (t('requiredPosition') || 'المنصب المطلوب *')
                    : (t('positionSearch')   || 'المنصب (للبحث)')}
                </label>
                <input
                  value={form.specialization}
                  onChange={e => {
                    const val = e.target.value
                    setForm({ ...form, specialization: val })
                    if (val.trim()) {
                      const filtered = positions.filter(p =>
                        p.toLowerCase().includes(val.toLowerCase())
                      )
                      setFilteredPositions(filtered)
                      setShowSuggestions(filtered.length > 0)
                    } else {
                      setShowSuggestions(false)
                      if (form.assignmentMethod === 'manual') fetchAllEmployees()
                    }
                  }}
                  onFocus={() => {
                    if (!form.specialization && positions.length > 0) {
                      setFilteredPositions(positions)
                      setShowSuggestions(true)
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder={t('positionPlaceholder') || 'اكتب للبحث عن تخصص...'}
                  className={styles.formInput}
                  autoComplete="off"
                />

                {/* قائمة الاقتراحات */}
                {showSuggestions && (
                  <div className={styles.suggestions}>
                    {filteredPositions.map((pos, i) => (
                      <div
                        key={i}
                        className={styles.suggestionItem}
                        onMouseDown={() => {
                          setForm({ ...form, specialization: pos })
                          setShowSuggestions(false)
                          if (form.assignmentMethod === 'manual') {
                            fetchEmployeesBySpecialization(pos)
                          }
                        }}
                      >
                        {pos}
                      </div>
                    ))}
                  </div>
                )}

                {form.assignmentMethod === 'auto' && !form.specialization && (
                  <p className={styles.warningText}>
                    {t('positionRequired') || 'المنصب مطلوب للتوزيع التلقائي'}
                  </p>
                )}
              </div>

              {/* اختيار موظف يدوي */}
              {form.assignmentMethod === 'manual' && (
                <div>
                  <label className={styles.formLabel}>{t('assignTo') || 'الموظف المكلف'} *</label>
                  <select
                    value={form.assignedTo}
                    onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                    className={styles.formSelect}
                    disabled={loadingEmployees}
                  >
                    <option value="">{t('selectEmployee') || 'اختر موظفاً'}</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.fullName} — {emp.position} ({emp.department})
                      </option>
                    ))}
                  </select>
                  {loadingEmployees && (
                    <p className={styles.warningText}>{t('loading') || 'جاري تحميل الموظفين...'}</p>
                  )}
                  {!loadingEmployees && employees.length === 0 && (
                    <p className={styles.warningText}>{t('noEmployees') || 'لا يوجد موظفين'}</p>
                  )}
                </div>
              )}

              {/* الوصف */}
              <div className={styles.formFieldFull}>
                <label className={styles.formLabel}>{t('description') || 'الوصف'}</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={t('descriptionPlaceholder') || 'تفاصيل إضافية...'}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              {/* أزرار */}
              <div className={`${styles.formActions} ${styles.formFieldFull}`}>
                <button type="submit" disabled={saving} className={styles.saveButton}>
                  {saving ? (t('saving') || 'جاري الحفظ...') : (t('save') || 'حفظ')}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>
                  {t('cancel') || 'إلغاء'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.tableHeaderCell}>{t('title')    || 'العنوان'}</th>
                  <th className={styles.tableHeaderCell}>{t('asset')    || 'الأصل'}</th>
                  <th className={styles.tableHeaderCell}>{t('assignedTo') || 'المكلف'}</th>
                  <th className={styles.tableHeaderCell}>{tWo('priority') || 'الأولوية'}</th>
                  <th className={styles.tableHeaderCell}>{t('status')   || 'الحالة'}</th>
                  <th className={styles.tableHeaderCell}>{t('actions')  || 'الإجراءات'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className={styles.loadingState}>{t('loading') || 'جاري التحميل...'}</td>
                  </tr>
                ) : workOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>{t('noData') || 'لا توجد أوامر عمل'}</td>
                  </tr>
                ) : (
                  workOrders.map(wo => (
                    <tr
                      key={wo._id}
                      onClick={() => router.push(`/${locale}/cmms/work-orders/${wo._id}`)}
                      className={styles.tableRow}
                    >
                      <td className={`${styles.tableCell} ${styles.cellTitle}`}>{wo.title}</td>
                      <td className={styles.tableCell}>{wo.assetId?.name || '—'}</td>
                      <td className={styles.tableCell}>{wo.assignedTo?.fullName || '—'}</td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.priorityBadge} ${getPriorityClass(wo.priority)}`}>
                          {priorityConfig[wo.priority]?.label || wo.priority}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${getStatusClass(wo.status)}`}>
                          {statusConfig[wo.status]?.label || wo.status}
                        </span>
                      </td>
                      <td className={styles.actionsCell} onClick={e => e.stopPropagation()}>
                        <TableActions
                          id={wo._id}
                          editUrl={`/${locale}/cmms/work-orders/${wo._id}/edit`}
                          onDelete={() => handleDelete(wo._id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}