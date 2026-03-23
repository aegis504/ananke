// Input validation & sanitization library
// Prevents XSS, SQL injection, command injection, and unsafe file uploads

// ── Text Sanitization ──

/** Strip HTML tags and dangerous characters from user text input */
export function sanitizeText(input: string, maxLength = 10000): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
    .replace(/data:text\/html/gi, '') // Remove data:text/html
    .trim()
}

/** Sanitize text but preserve basic formatting (for note content) */
export function sanitizeContent(input: string, maxLength = 100000): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
}

/** Sanitize for use as a title (single line, no HTML) */
export function sanitizeTitle(input: string, maxLength = 200): string {
  return sanitizeText(input, maxLength).replace(/[\r\n]/g, ' ')
}

// ── Email Validation ──

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false
  return EMAIL_RE.test(email)
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254)
}

// ── Tag Validation ──

export function sanitizeTag(tag: string): string {
  return tag
    .slice(0, 50)
    .replace(/[<>"'&;{}()\[\]\\\/]/g, '') // No special chars
    .replace(/\s+/g, '-') // Spaces to hyphens
    .toLowerCase()
    .trim()
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(sanitizeTag)
    .filter(t => t.length > 0 && t.length <= 50)
    .slice(0, 20) // Max 20 tags
}

// ── File Upload Validation ──

// Dangerous file extensions that should never be uploaded
const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif', 'hta', 'cpl', 'msc', 'inf',
  'reg', 'ws', 'wsf', 'wsc', 'wsh', 'ps1', 'ps2', 'psc1', 'psc2',
  'vbs', 'vbe', 'js', 'jse', 'lnk', 'url',
  'dll', 'sys', 'drv', 'ocx',
  'sh', 'bash', 'csh', 'ksh', 'zsh',
  'php', 'php3', 'php4', 'php5', 'phtml', 'asp', 'aspx', 'jsp', 'cgi', 'pl',
  'py', 'rb', 'jar', 'class', 'war',
  'swf', 'fla',
  'iso', 'img', 'dmg', 'app', 'deb', 'rpm',
  'htaccess', 'htpasswd',
])

// Allowed MIME type prefixes
const ALLOWED_MIME_PREFIXES = [
  'text/', 'image/', 'audio/', 'video/', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats',
  'application/vnd.ms-', 'application/zip', 'application/x-zip',
  'application/json', 'application/xml', 'application/csv',
  'font/',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export interface FileValidationResult {
  valid: boolean
  error?: string
  safeName: string
}

export function validateFile(file: File): FileValidationResult {
  const name = file.name || 'unnamed'

  // Check size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`, safeName: '' }
  }
  if (file.size === 0) {
    return { valid: false, error: 'Empty file', safeName: '' }
  }

  // Check extension
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type .${ext} is not allowed for security reasons`, safeName: '' }
  }

  // Double extension check (e.g., file.php.txt, file.exe.pdf)
  const parts = name.split('.')
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      if (BLOCKED_EXTENSIONS.has(parts[i].toLowerCase())) {
        return { valid: false, error: `Suspicious double extension detected`, safeName: '' }
      }
    }
  }

  // Check MIME type
  if (file.type) {
    const isAllowedMime = ALLOWED_MIME_PREFIXES.some(p => file.type.startsWith(p))
    if (!isAllowedMime && file.type !== 'application/octet-stream') {
      return { valid: false, error: `File type ${file.type} is not allowed`, safeName: '' }
    }
  }

  // Sanitize filename: only keep safe characters
  const safeName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)}`

  return { valid: true, safeName }
}

// ── URL/Query Parameter Sanitization ──

export function sanitizeSearchQuery(query: string): string {
  return query.slice(0, 200).replace(/[<>"']/g, '').trim()
}

// ── Date Validation ──

export function isValidISODate(dateStr: string): boolean {
  if (!dateStr || dateStr.length > 30) return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime())
}

// ── ID Validation (UUID) ──

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id)
}

// ── Color Validation ──

const COLOR_RE = /^#[0-9a-fA-F]{6}$/

export function isValidColor(color: string): boolean {
  return COLOR_RE.test(color)
}

export function sanitizeColor(color: string): string {
  return isValidColor(color) ? color : '#4f46e5'
}
