'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Input } from '../components/ui/input'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function IdeaApp() {
  const [ideas, setIdeas] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [sort, setSort] = useState('newest') // 'newest' | 'popular'
  const canSubmit = useMemo(() => text.trim().length > 0 && text.trim().length <= 280, [text])

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/ideas?sort=${sort}`)
      const json = await res.json()
      if (json.success) {
        setIdeas(json.data)
        setError('')
      } else {
        setError(json.error || 'Failed to load ideas')
      }
    } catch (e) {
      setError('Cannot reach server')
    } finally {
      setInitialLoading(false)
    }
  }, [sort])

  useEffect(() => {
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [load])

  async function submitIdea(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    // optimistic add
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, text: text.trim(), upvotes: 0, created_at: new Date().toISOString() }
    setIdeas((prev) => [optimistic, ...prev])
    try {
      const res = await fetch(`${API}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        // rollback
        setIdeas((prev) => prev.filter((i) => i.id !== tempId))
        setError(json.error || 'Failed to submit idea')
      } else {
        // replace temp with server row
        setIdeas((prev) => prev.map((i) => (i.id === tempId ? json.data : i)))
        setError('')
      }
    } catch (_) {
      setIdeas((prev) => prev.filter((i) => i.id !== tempId))
      setError('Cannot reach server')
    } finally {
      setLoading(false)
      setText('')
    }
  }

  async function upvote(id) {
    // optimistic increment
    let previous
    setIdeas((prev) => {
      previous = prev
      return prev.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i))
    })
    try {
      const res = await fetch(`${API}/ideas/${id}/upvote`, { method: 'POST' })
      if (!res.ok) throw new Error('failed')
      // reconcile
      const json = await res.json().catch(() => ({}))
      if (json?.success && json?.data) {
        setIdeas((curr) => curr.map((i) => (i.id === id ? { ...i, upvotes: json.data.upvotes } : i)))
      } else {
        throw new Error('invalid')
      }
    } catch (_) {
      // rollback on failure
      setIdeas(previous)
      setError('Failed to upvote')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-100">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold">Idea Board</div>
        </div>
      </header>

      <section className="container py-8">
        <Card>
          <CardHeader>
            <div className="text-lg font-semibold">Share an idea</div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitIdea} className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your idea (max 280 chars)"
                maxLength={280}
                className="h-12"
              />
              <Button disabled={!canSubmit || loading} type="submit" className="h-12">Submit</Button>
            </form>
            <div className="mt-1 text-right text-xs text-gray-500">{text.trim().length}/280</div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-500">Sort:</span>
          <button
            className={`rounded-md px-3 py-1 ${sort === 'newest' ? 'bg-brand text-white' : 'bg-white ring-1 ring-gray-200'}`}
            onClick={() => setSort('newest')}
          >Newest</button>
          <button
            className={`rounded-md px-3 py-1 ${sort === 'popular' ? 'bg-brand text-white' : 'bg-white ring-1 ring-gray-200'}`}
            onClick={() => setSort('popular')}
          >Popular</button>
        </div>

        {initialLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : ideas.length === 0 ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            No ideas yet. Be the first to share! Here are some examples:
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {["Dark mode for dashboard","Keyboard shortcuts for quick actions"].map((s, i) => (
                <Card key={i}><CardContent>{s}</CardContent></Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {ideas.map((i) => (
              <Card key={i.id}>
                <CardContent>
                  <div className="whitespace-pre-wrap text-gray-800">{i.text}</div>
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(i.created_at).toLocaleString()}</span>
                    <Button onClick={() => upvote(i.id)} variant="outline" size="sm">▲ {i.upvotes}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}