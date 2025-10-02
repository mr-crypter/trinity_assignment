'use client'

import Link from 'next/link'
import { Badge } from '../components/ui/badge'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <header className="border-b border-gray-100">
        <div className="container flex h-16 items-center justify-between">
          <div className="text-xl font-bold">Idea Board</div>
          <nav className="text-sm">
            <Link href="/app" className="text-brand hover:text-brand-dark">Open App</Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(91,127,255,0.18),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(91,127,255,0.15),transparent_40%)]" />
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Share sparks of genius. Upvote what matters.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A lightweight, real-time idea board for rapid brainstorming and team alignment. No
            accounts. Just ideas, momentum, and focus.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/app" className="inline-flex h-12 items-center justify-center rounded-md bg-brand px-6 text-white shadow hover:bg-brand-dark">
              Try the Idea Board
            </Link>
            <span className="text-sm text-gray-500">Works instantly. No signup.</span>
          </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Anonymous</Badge>
              <Badge>Blazingly Fast</Badge>
              <Badge>No Setup Required</Badge>
            </div>
        </div>
          <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map((n) => (
                <div key={n} className="h-20 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100" />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container">
          <h2 className="text-center text-2xl font-semibold">Built for momentum</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Feature title="Frictionless" desc="Open, type, submit. Ideas flow without logins or blockers." />
            <Feature title="Signal-first" desc="Upvotes push the best ideas to the top—quickly find consensus." />
            <Feature title="Made for teams" desc="Fast enough for standups, simple enough for brainstorms." />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container text-center">
          <h3 className="text-xl font-semibold">Ready to capture great ideas?</h3>
          <Link href="/app" className="mt-4 inline-flex h-12 items-center justify-center rounded-md bg-brand px-8 text-white shadow hover:bg-brand-dark">
            Launch the App
          </Link>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Testimonial name="Ava" quote="We turned chaos into clarity in our standup." />
            <Testimonial name="Rohan" quote="Perfect for quick brainstorms with the team." />
            <Testimonial name="Mia" quote="Simple, fast, and everyone participates." />
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Idea Board
        </div>
      </footer>
    </main>
  )
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <div className="text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  )
}

function Testimonial({ name, quote }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-card">
      <div className="text-sm text-gray-600">“{quote}”</div>
      <div className="mt-3 text-sm font-semibold">— {name}</div>
    </div>
  )
}

