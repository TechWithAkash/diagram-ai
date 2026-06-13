'use client'

import { useState, useCallback } from 'react'

export function useGenerateDiagram() {
  const [state, setState] = useState({
    status: 'idle',   // idle | loading | success | error
    data:   null,
    error:  null,
    meta:   null,
  })

  const generate = useCallback(async (prompt, options = {}) => {
    if (!prompt?.trim()) return

    setState({ status: 'loading', data: null, error: null, meta: null })

    try {
      const res = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:      prompt.trim(),
          useProModel: options.useProModel || false,
          forceAI:     options.forceAI     || false,   // skip library lookup
          department:  options.department  || null,
          semester:    options.semester    || null,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error: ${res.status}`)
      }

      setState({
        status: 'success',
        data:   json.data,
        error:  null,
        meta:   json.meta,
      })

      return json.data

    } catch (err) {
      setState({
        status: 'error',
        data:   null,
        error:  err.message || 'Generation failed. Please try again.',
        meta:   null,
      })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null, meta: null })
  }, [])

  return { ...state, generate, reset }
}
