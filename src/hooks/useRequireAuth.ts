import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../stores/useAuthStore'

export function useRequireAuth() {
  const { session, initialized } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (initialized && !session) {
      navigate('/', { replace: true })
    }
  }, [initialized, session, navigate])

  return { isAuthenticated: !!session, initialized }
}