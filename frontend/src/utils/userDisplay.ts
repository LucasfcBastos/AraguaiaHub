/**
 * Shared helpers for displaying the authenticated user consistently across
 * the app (sidebar avatar, "created by" / "edited by" records, etc).
 */
export type DisplayUser = {
  fullName?: string | null
  email?: string | null
} | null

export function getDisplayName(user: DisplayUser): string {
  const name = user?.fullName?.trim()
  if (name) return name
  const email = user?.email?.trim()
  if (email) return email
  return 'Usuário'
}

export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}
