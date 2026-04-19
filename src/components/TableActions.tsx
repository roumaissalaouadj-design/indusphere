'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/styles/components/TableActions.module.css'

interface TableActionsProps {
  id: string
  editUrl?: string
  onEdit?: () => void
  onDelete: () => Promise<void>
  deleteMessage?: string
}

export default function TableActions({ 
  id, 
  editUrl, 
  onEdit, 
  onDelete, 
  deleteMessage = 'هل أنت متأكد من حذف هذا العنصر؟'
}: TableActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else if (editUrl) {
      router.push(editUrl)
    }
  }

  const handleDelete = async () => {
    if (!confirm(deleteMessage)) return
    
    setDeleting(true)
    try {
      await onDelete()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('حدث خطأ في الحذف')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.actions}>
      {/* زر التعديل */}
      <button
        onClick={handleEdit}
        className={`${styles.actionBtn} ${styles.editBtn}`}
        title="تعديل"
      >
        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* زر الحذف */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`${styles.actionBtn} ${styles.deleteBtn}`}
        title="حذف"
      >
        {deleting ? (
          <svg className={`${styles.icon} ${styles.spin}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth={2} stroke="currentColor" fill="none" />
            <path d="M12 6v6l4 2" strokeWidth={2} stroke="currentColor" fill="none" />
          </svg>
        ) : (
          <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>
    </div>
  )
}