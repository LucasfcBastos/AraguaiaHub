import type { DisplayUser } from '../utils/userDisplay'

// Provisório: no Retool o usuário vinha da sessão. Até existir login,
// o app usa este usuário fixo.
const FIXED_USER = {
  fullName: 'Lucas Furango',
  email: 'lucas@araguaiahub.com',
}

export function useCurrentUser(): { user: DisplayUser } {
  return { user: FIXED_USER }
}
