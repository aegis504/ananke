import { rateLimit, getClientIP } from './_rateLimit'

export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

async function getSignedUrl(path: string): Promise<string> {
  if (!SERVICE_KEY || !path) return ''
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/files/${path}`, {
    method: 'POST',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 86400 })
  })
  if (!res.ok) return ''
  const data = await res.json()
  return data.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : ''
}

export default async function handler(req: Request) {
  // Rate limit: 30 share page loads per minute per IP
  const ip = getClientIP(req)
  const limit = rateLimit(ip, 'share', { maxTokens: 30, refillRate: 5, refillMs: 10000 })
  if (!limit.allowed) {
    return new Response('<html><body><h1>Too Many Requests</h1><p>Please try again later.</p></body></html>', {
      status: 429, headers: { 'Content-Type': 'text/html', 'Retry-After': String(limit.retryAfter) }
    })
  }

  const url = new URL(req.url)
  const fileId = (url.searchParams.get('id') || '').slice(0, 200).replace(/[<>"']/g, '')
  const filePath = (url.searchParams.get('path') || '').slice(0, 500).replace(/\.\./g, '').replace(/[<>"']/g, '')
  const fileName = (url.searchParams.get('name') || 'Shared File').slice(0, 200).replace(/[<>"']/g, '')

  // Validate path doesn't traverse directories
  if (filePath && (filePath.includes('..') || filePath.startsWith('/'))) {
    return new Response(renderHTML('Invalid Request', '', 'Invalid file path.', ''), { status: 400, headers: { 'Content-Type': 'text/html' } })
  }
  
  // Generate a signed URL server-side instead of using client-provided URL
  const fileUrl = filePath ? await getSignedUrl(filePath) : ''

  if (!fileId && !filePath) {
    return new Response(renderHTML('File Not Found', '', 'This shared file could not be found or has been removed.', ''), {
      status: 404, headers: { 'Content-Type': 'text/html' }
    })
  }

  // If we have a direct URL, try to fetch and display the content
  let content = ''
  let isImage = false
  let isText = false
  const decodedName = decodeURIComponent(fileName).replace(/^\d+_/, '')

  if (fileUrl) {
    const ext = decodedName.split('.').pop()?.toLowerCase() || ''
    isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)
    isText = ['txt', 'md', 'csv', 'json', 'js', 'ts', 'html', 'css', 'xml', 'yaml', 'yml', 'log', 'py', 'sh', 'sql'].includes(ext)

    if (isText) {
      try {
        const res = await fetch(fileUrl)
        if (res.ok) {
          const text = await res.text()
          content = text.length > 100000 ? text.slice(0, 100000) + '\n\n... (truncated)' : text
        }
      } catch { /* */ }
    }
  }

  const html = renderHTML(decodedName, fileUrl, content, isImage ? fileUrl : '', isText)
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } })
}

function renderHTML(title: string, downloadUrl: string, content: string, imageUrl: string, isText = false) {
  const escapedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle} — Shared via Ananke</title>
  <meta property="og:title" content="${escapedTitle}" />
  <meta property="og:description" content="Shared file from Ananke — productivity enforcement engine" />
  <meta property="og:type" content="article" />
  ${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fbfaf8; color: #1a1a1a; min-height: 100vh; }
    .header { border-bottom: 1px solid #e5e3de; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; background: #fff; }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; color: #1a1a1a; text-decoration: none; }
    .logo-icon { width: 32px; height: 32px; border-radius: 8px; background: #00a82d; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }
    .badge { font-size: 12px; background: #f0f0ec; padding: 2px 8px; border-radius: 20px; color: #666; font-weight: 500; }
    .container { max-width: 720px; margin: 0 auto; padding: 40px 24px; }
    .file-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; }
    .file-icon { width: 56px; height: 56px; border-radius: 16px; background: #f0f0ec; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .file-icon svg { color: #666; }
    .file-title { font-size: 28px; font-weight: 700; line-height: 1.3; }
    .file-meta { font-size: 14px; color: #888; margin-top: 4px; }
    .content-box { background: #fff; border: 1px solid #e5e3de; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .content-box pre { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; color: #444; }
    .content-box img { max-width: 100%; border-radius: 12px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; border: none; }
    .btn-primary { background: #00a82d; color: #fff; }
    .btn-primary:hover { background: #009125; }
    .btn-outline { background: #fff; color: #444; border: 1px solid #e5e3de; }
    .btn-outline:hover { background: #f7f7f5; }
    .actions { display: flex; gap: 12px; margin-bottom: 32px; }
    .cta { text-align: center; margin-top: 48px; padding: 32px; background: #f7f7f5; border-radius: 16px; }
    .cta p { color: #666; font-size: 15px; margin-bottom: 16px; }
    .not-found { text-align: center; padding: 80px 24px; }
    .not-found svg { margin: 0 auto 16px; opacity: 0.3; }
    .not-found h2 { font-size: 22px; margin-bottom: 8px; }
    .not-found p { color: #888; font-size: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <a href="/" class="logo">
      <div class="logo-icon">A</div>
      Ananke
      <span class="badge">Shared File</span>
    </a>
    <a href="/" class="btn btn-outline">Go to Ananke</a>
  </div>

  <div class="container">
    ${!content && !imageUrl && !downloadUrl ? `
    <div class="not-found">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      <h2>${escapedTitle}</h2>
      <p>${escapedContent || 'This file is not available.'}</p>
    </div>
    ` : `
    <div class="file-header">
      <div class="file-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <div>
        <h1 class="file-title">${escapedTitle}</h1>
        <p class="file-meta">Shared via Ananke</p>
      </div>
    </div>

    ${downloadUrl ? `
    <div class="actions">
      <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download File
      </a>
    </div>
    ` : ''}

    ${imageUrl ? `
    <div class="content-box">
      <img src="${imageUrl}" alt="${escapedTitle}" />
    </div>
    ` : ''}

    ${isText && content ? `
    <div class="content-box">
      <pre>${escapedContent}</pre>
    </div>
    ` : ''}

    <div class="cta">
      <p>Want to create, organize, and share your own files?</p>
      <a href="/" class="btn btn-primary">Sign up for Ananke — Free</a>
    </div>
    `}
  </div>
</body>
</html>`
}
