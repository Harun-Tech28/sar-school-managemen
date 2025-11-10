export interface User {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  createdAt: number
  lastLogin: number
  sessionExpiry?: number
}

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export function saveSession(user: User): void {
  if (typeof window === 'undefined') return

  const sessionData = {
    ...user,
    sessionExpiry: Date.now() + SESSION_DURATION
  }

  localStorage.setItem('user', JSON.stringify(sessionData))
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    const user: User = JSON.parse(userStr)

    // Check if session has expired
    if (user.sessionExpiry && user.sessionExpiry < Date.now()) {
      clearSession()
      return null
    }

    return user
  } catch (error) {
    console.error('Error reading session:', error)
    return null
  }
}

export function updateSession(updates: Partial<User>): void {
  const currentUser = getSession()
  if (!currentUser) return

  const updatedUser = {
    ...currentUser,
    ...updates,
    lastLogin: Date.now(),
    sessionExpiry: Date.now() + SESSION_DURATION
  }

  saveSession(updatedUser)
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
}

export function isSessionValid(): boolean {
  const user = getSession()
  return user !== null
}

export function requireAuth(redirectTo: string = '/auth/login'): User | null {
  const user = getSession()
  
  if (!user && typeof window !== 'undefined') {
    window.location.href = redirectTo
    return null
  }

  return user
}

export function logout(redirectTo: string = '/'): void {
  clearSession()
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo
  }
}
