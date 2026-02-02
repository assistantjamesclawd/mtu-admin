// Format phone number to (XXX) XXX-XXXX
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Handle different lengths
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits[0] === '1') {
    // US number with country code
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // Return original if we can't format
  return phone
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
