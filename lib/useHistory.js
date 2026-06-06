'use client'

import { useState, useCallback } from 'react'

const MAX_HISTORY = 8

export function useHistory() {
  const [history, setHistory] = useState([])

  const addToHistory = useCallback((prompt, data) => {
    setHistory(prev => {
      const newEntry = { id: Date.now(), prompt, data, createdAt: new Date() }
      const filtered = prev.filter(h => h.prompt !== prompt)
      return [newEntry, ...filtered].slice(0, MAX_HISTORY)
    })
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  return { history, addToHistory, clearHistory }
}
