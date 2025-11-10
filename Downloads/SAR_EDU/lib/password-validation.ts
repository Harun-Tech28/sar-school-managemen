export interface PasswordValidationRules {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecial: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

const DEFAULT_RULES: PasswordValidationRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
}

export function validatePassword(
  password: string,
  rules: PasswordValidationRules = DEFAULT_RULES
): PasswordValidationResult {
  const errors: string[] = []
  let strengthScore = 0

  // Check minimum length
  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters long`)
  } else {
    strengthScore += 1
    if (password.length >= 12) strengthScore += 1
  }

  // Check for uppercase letters
  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (/[A-Z]/.test(password)) {
    strengthScore += 1
  }

  // Check for lowercase letters
  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (/[a-z]/.test(password)) {
    strengthScore += 1
  }

  // Check for numbers
  if (rules.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (/\d/.test(password)) {
    strengthScore += 1
  }

  // Check for special characters
  if (rules.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strengthScore += 1
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (strengthScore >= 5) {
    strength = 'strong'
  } else if (strengthScore >= 3) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-destructive'
    case 'medium':
      return 'text-yellow-600'
    case 'strong':
      return 'text-accent'
  }
}

export function getPasswordStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'medium':
      return 'Medium'
    case 'strong':
      return 'Strong'
  }
}
