import { supabase } from '@/lib/supabase'
import type { User, UserRole } from '@sar-school/shared'

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpData extends SignInCredentials {
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
}

export interface AuthUser extends User {
  email: string
}

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(credentials: SignInCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'No user data returned' }
      }

      // Get user profile with role
      const profile = await this.getUserProfile(data.user.id)
      
      if (!profile) {
        return { user: null, error: 'User profile not found' }
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: profile.role,
          profile_id: profile.id,
        },
        error: null,
      }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign out failed',
      }
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      const profile = await this.getUserProfile(user.id)
      
      if (!profile) {
        return null
      }

      return {
        id: user.id,
        email: user.email!,
        role: profile.role,
        profile_id: profile.id,
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get user role
   */
  async getUserRole(): Promise<UserRole | null> {
    try {
      const user = await this.getCurrentUser()
      return user?.role || null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return { error: error.message }
      }

      return { error: null, session: data.session }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Session refresh failed',
      }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Password update failed',
      }
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Password reset failed',
      }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.getUserProfile(session.user.id)
        
        if (profile) {
          callback({
            id: session.user.id,
            email: session.user.email!,
            role: profile.role,
            profile_id: profile.id,
          })
        } else {
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
