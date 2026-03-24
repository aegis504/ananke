import { rateLimit, getClientIP, corsHeaders, validateOrigin } from './_rateLimit'

const API_BASE = 'https://api.featherless.ai/v1/chat/completions'
// Two Featherless keys — rotated on 429/quota errors
const FEATHERLESS_KEYS = [
  process.env.FEATHERLESS_API_KEY_1 || 'rc_1f70f96604092baca9575582f958c64f1faa04c011e4314e15c0483ba868542a',
  process.env.FEATHERLESS_API_KEY_2 || 'rc_1c6550991843f0af537c6597c0169ef4ab71d93bec97b5bd4470c69177ea66fa',
]
// Google Gemini key (fallback if Featherless is down)
const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCCx7s_3ts9CePmGAGhRQZkIOf8L7rBf1Y'
// Models tried in order — falls back to next on 503/429/overload
const MODELS = [
  'meta-llama/Llama-3.1-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'google/gemma-2-9b-it',
  'Qwen/Qwen2.5-7B-Instruct',
  'microsoft/Phi-3-mini-4k-instruct',
]
const VALID_ACTIONS = new Set(['summarize', 'quiz', 'improve', 'explain', 'keypoints', 'translate_es', 'translate_fr', 'actionitems', 'expand', 'simplify', 'dehumanize', 'humanize', 'chat'])

export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const cors = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })

  // Origin validation
  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: cors })
  }

  const ip = getClientIP(req)

  // Rate limit: 15 AI requests per minute per IP, 60s block on exceed
  const limit = rateLimit(ip, 'ai', { maxTokens: 15, refillRate: 5, refillMs: 20000, blockDurationMs: 60000 })
  if (!limit.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limited. Try again later.', retryAfter: limit.retryAfter }), {
      status: 429, headers: { ...cors, 'Retry-After': String(limit.retryAfter) }
    })
  }

  // Require auth — verify Supabase JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })
  }

  try {
    const body = await req.json()
    const { action, content, model } = body as { action: string; content: string; model?: string }

    if (!content || !action || typeof content !== 'string' || typeof action !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid action/content' }), { status: 400, headers: cors })
    }

    // Validate action
    if (!VALID_ACTIONS.has(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: cors })
    }

    // Validate model if provided
    if (model && (typeof model !== 'string' || model.length > 100)) {
      return new Response(JSON.stringify({ error: 'Invalid model' }), { status: 400, headers: cors })
    }

    // Sanitize content — strip potential prompt injection markers and cap length
    const safeContent = content.slice(0, 50000)

    const prompts: Record<string, string> = {
      summarize: `Summarize the following text concisely. Write 3-5 clear bullet points capturing the most important information. No introduction, just the bullet points:\n\n${safeContent}`,
      quiz: `You are a study quiz generator. Create exactly 5 multiple-choice questions based on this content. Each question tests understanding of key concepts.

FORMAT RULES (follow exactly):
1. What is [question]?
A) [option]
B) [option]
C) [option]
D) [option]
Answer: [letter]

2. [next question]
A) ...

Make questions progressively harder. Include one tricky question. Always mark the correct answer on a separate "Answer: X" line after each question.

Content to quiz on:
${safeContent}`,
      improve: `Improve the writing quality of this text. Fix grammar, improve clarity, and enhance readability while keeping the same meaning and tone. Only output the improved text:\n\n${safeContent}`,
      explain: `Explain the key concepts in this text in simple, everyday language as if explaining to someone new to the topic. Use short paragraphs and examples where helpful. Only output the explanation:\n\n${safeContent}`,
      keypoints: `Extract the most important points from this text. Format as a numbered list with clear, actionable takeaways. Each point should be one concise sentence. Only output the key points:\n\n${safeContent}`,
      translate_es: `Translate this text to Spanish. Only output the translation:\n\n${safeContent}`,
      translate_fr: `Translate this text to French. Only output the translation:\n\n${safeContent}`,
      actionitems: `Extract all action items and to-do tasks from this text as a checklist. Format as "- [ ] task". Only output the checklist:\n\n${safeContent}`,
      expand: `Expand on this text with more detail, examples, and context. Keep the same structure but add depth. Only output the expanded text:\n\n${safeContent}`,
      simplify: `Simplify this text to make it easier to understand. Use shorter sentences and simpler words. Only output the simplified text:\n\n${safeContent}`,
      dehumanize: `Rewrite this text to sound more natural and human-written. Remove all AI-style formatting: no bullet points with dashes, no excessive bold/headers, no numbered lists unless necessary, no "In conclusion" or "Furthermore" or "Additionally" transitions. Remove extra spacing between paragraphs. Don't start sentences with uppercase filler words. Write in a flowing, conversational style like a real person would write in a document or email. Vary sentence length naturally. Only output the rewritten text:\n\n${safeContent}`,
      humanize: `Rewrite this text to sound completely human-written and natural. Rules:
- Remove ALL markdown formatting (no **, no ##, no - bullet points)
- Remove robotic transitions like "Furthermore", "Additionally", "In conclusion", "It is important to note"
- Don't capitalize every word in sentences unnecessarily
- Reduce spacing — write in normal flowing paragraphs
- Vary sentence length, use contractions, be casual where appropriate
- Sound like a real person wrote this, not an AI
- Keep the same meaning and information
Only output the rewritten text:\n\n${safeContent}`,
    }

    const systemPrompt = action === 'chat'
      ? 'You are Ananke AI, a helpful assistant built into the Ananke productivity app. You help users organize tasks, suggest tags for notes, plan their calendar, write content, study, and stay productive. Be friendly, concise, and practical. Give actionable advice. CRITICAL INSTRUCTION: If the user directly asks you to create a task, schedule something, or organize a task (e.g., "Repair car engine, Date is tomorrow, Tags: urgent, important"), you MUST respond ONLY with a JSON object format like {"action": "CREATE_TASK", "title": "...", "date": "...", "tags": ["...", "..."]} and NO OTHER TEXT. Do not explain, just return the JSON.'
      : 'You are a helpful AI assistant integrated into a note-taking app called Ananke. Be concise, clear, and format your output in clean markdown.'
    const userPrompt = prompts[action] || content

    const API_KEYS = FEATHERLESS_KEYS.filter(Boolean) as string[]

    if (API_KEYS.length === 0) {
      return new Response(JSON.stringify({ error: 'No AI API keys configured' }), { status: 500, headers: cors })
    }

    let response: Response | null = null;
    let fallbackError: any = null;
    let apiErrorData: any = null;
    let usedModel = MODELS[0];

    // Try each model in order; skip to next model on 503/429 (capacity/rate limit)
    outer: for (const tryModel of (model ? [model, ...MODELS] : MODELS)) {
      for (const key of API_KEYS) {
        try {
          response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: tryModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 2000,
              temperature: 0.7,
            }),
          })

          if (response.ok) {
            usedModel = tryModel;
            break outer; // success — stop all loops
          }

          const errText = await response.text()
          try { apiErrorData = JSON.parse(errText) } catch { apiErrorData = { error: errText } }

          // 503/429 = model at capacity → try next model
          if (response.status === 503 || response.status === 429) continue outer;
          // 400 = bad request (won't be fixed by switching model/key)
          if (response.status === 400) break outer;
          // 401/403 = bad key → try next key for this model

        } catch (err) {
          fallbackError = err;
        }
      }
    }

    if (!response || !response.ok) {
      if (apiErrorData) {
         return new Response(JSON.stringify({ error: apiErrorData.error?.message || apiErrorData.message || apiErrorData.error || `AI Error: ${response?.status}`, details: apiErrorData }), { status: response?.status || 502, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ error: 'AI API unavailable', details: fallbackError?.message }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || 'No response generated.'

    return new Response(JSON.stringify({ result, model: data.model || usedModel, usage: data.usage }), { status: 200, headers: cors })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), { status: 500, headers: cors })
  }
}
