// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  return { valid: true };
}

export function validateProjectTitle(title: string): { valid: boolean; error?: string } {
  if (!title.trim()) {
    return { valid: false, error: 'Project name is required' };
  }

  if (title.length > 80) {
    return { valid: false, error: 'Project name must be 80 characters or less' };
  }

  return { valid: true };
}

export function validateProjectDescription(description: string): { valid: boolean; error?: string } {
  if (description.length > 400) {
    return { valid: false, error: 'Description must be 400 characters or less' };
  }

  return { valid: true };
}
