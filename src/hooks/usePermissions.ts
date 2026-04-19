'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function usePermissions() {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetchPermissions()
  }, [session])

  const fetchPermissions = async () => {
    try {
      const res = await fetch('/api/me/permissions')
      const data = await res.json()
      if (data.success) setPermissions(data.permissions)
    } finally {
      setLoading(false)
    }
  }

  const can = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const canAny = (perms: string[]): boolean => {
    return perms.some(p => permissions.includes(p))
  }

  const canAll = (perms: string[]): boolean => {
    return perms.every(p => permissions.includes(p))
  }

  return { permissions, loading, can, canAny, canAll }
}