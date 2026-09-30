import { useCallback, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useCurrentUser } from '../useCurrentUser'

export type AppUserRole = {
  role: string
  full_name: string
} | null

// Equivalente ao getMyRole.ts: papel do usuário atual em app_users (ou null).
export function useGetMyRole() {
  const { user } = useCurrentUser()
  const email = user?.email ?? ''
  const [data, setData] = useState<AppUserRole>(null)

  const trigger = useCallback(async () => {
    try {
      const role = await apiFetch<AppUserRole>('/me/role', {
        headers: { 'X-User-Email': email },
      })
      setData(role)
      return role
    } catch {
      setData(null)
      return null
    }
  }, [email])

  return { data, trigger }
}
