'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import styles from '@/styles/components/NotificationBell.module.css'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
  isRead: boolean
  createdAt: string
  link?: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  // دالة للحصول على اللغة الحالية
  const getLocale = () => {
    if (typeof window === 'undefined') return 'ar';
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/(ar|fr|en)/);
    return match ? match[1] : 'ar';
  };

  // دالة لتصحيح الرابط
  const getCorrectLink = (link: string) => {
    const locale = getLocale();
    if (!link.startsWith(`/${locale}`) && !link.startsWith(`/${locale}/`)) {
      // إزالة أي لغة موجودة مسبقاً
      let cleanLink = link.replace(/^\/(ar|fr|en)/, '');
      if (!cleanLink.startsWith('/')) cleanLink = '/' + cleanLink;
      return `/${locale}${cleanLink}`;
    }
    return link;
  };

  const fetchNotifications = async () => {
    if (!session) return
    
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/notifications?limit=20')
      const data = await res.json()
      
      if (data.success) {
        const allNotifications: Notification[] = data.data || []
        setNotifications(allNotifications)
        const unread = allNotifications.filter((n: Notification) => !n.isRead).length
        setUnreadCount(unread)
      } else {
        setError(data.message || 'فشل في جلب الإشعارات')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })
      if (res.ok) {
        setNotifications((prev: Notification[]) =>
          prev.map((n: Notification) => n._id === id ? { ...n, isRead: true } : n)
        )
        setUnreadCount((prev: number) => prev - 1)
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead)
      for (const notif of unreadNotifications) {
        await fetch(`/api/notifications/${notif._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        })
      }
      setNotifications((prev: Notification[]) =>
        prev.map((n: Notification) => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTime = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'الآن'
    if (minutes < 60) return `${minutes} دقيقة`
    if (hours < 24) return `${hours} ساعة`
    return `${days} يوم`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '🔔'
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (session) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        className={styles.bellButton}
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={styles.markAllBtn}
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.loading}>جاري التحميل...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📭</span>
                <p className={styles.emptyText}>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notif: Notification) => (
                <div
                  key={notif._id}
                  className={`${styles.notification} ${!notif.isRead ? styles.notificationUnread : ''}`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id)
                    if (notif.link) {
                      // ✅ استخدام دالة تصحيح الرابط
                      const correctLink = getCorrectLink(notif.link);
                      window.location.href = correctLink;
                    }
                  }}
                >
                  <div className={styles.icon}>{getTypeIcon(notif.type)}</div>
                  <div className={styles.content}>
                    <p className={`${styles.title} ${!notif.isRead ? styles.titleUnread : styles.titleRead}`}>
                      {notif.title}
                    </p>
                    <p className={styles.message}>{notif.message}</p>
                    <p className={styles.time}>{formatTime(notif.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}