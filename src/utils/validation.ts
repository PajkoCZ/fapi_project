export function validateName(name: string): boolean {
  return !!name && name.trim().length >= 2
}

export function validateEmail(email: string): boolean {
  const re = /^\S+@\S+\.\S+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  const re = /^\+?[0-9 \-(\)]{6,}$/
  return re.test(phone)
}