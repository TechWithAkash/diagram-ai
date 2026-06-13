import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt, schema } = body

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const pendingFilePath = '/tmp/pending-requests.json'

    let currentRequests = []
    if (fs.existsSync(pendingFilePath)) {
      try {
        const fileContent = fs.readFileSync(pendingFilePath, 'utf8')
        currentRequests = JSON.parse(fileContent)
      } catch (e) {
        console.error('Failed to parse pending-requests.json, resetting list:', e)
      }
    }

    const newRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      prompt: prompt.trim(),
      schema: schema || null,
      timestamp: new Date().toISOString()
    }

    currentRequests.push(newRequest)

    // Ensure directory exists
    const dir = path.dirname(pendingFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(pendingFilePath, JSON.stringify(currentRequests, null, 2), 'utf8')

    return Response.json({ success: true, message: 'Request submitted successfully' })
  } catch (err) {
    console.error('Verification request handler error:', err)
    return Response.json({ error: err.message || 'Something went wrong.' }, { status: 500 })
  }
}
