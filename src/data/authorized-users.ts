// Authorized users for the admin dashboard
// role: 'admin' = full access, 'employee' = limited access (for future use)

export type UserRole = 'admin' | 'employee'

export interface AuthorizedUser {
  email: string
  name: string
  role: UserRole
}

export const authorizedUsers: AuthorizedUser[] = [
  { email: 'trevor@mountaintimeutah.com', name: 'Trevor', role: 'admin' },
  { email: 'kenady@mountaintimeutah.com', name: 'Kenady', role: 'admin' },
  { email: 'info@mountaintimeutah.com', name: 'Trevor', role: 'admin' },
  // Add employees here later with role: 'employee'
]

export function isAuthorizedEmail(email: string): boolean {
  return authorizedUsers.some(u => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserByEmail(email: string): AuthorizedUser | undefined {
  return authorizedUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function isAdmin(email: string): boolean {
  const user = getUserByEmail(email)
  return user?.role === 'admin'
}
