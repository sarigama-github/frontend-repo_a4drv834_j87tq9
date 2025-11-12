import { useState, useEffect } from 'react'

function App() {
  const [topic, setTopic] = useState('summer beach day')
  const [tone, setTone] = useState('playful')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [variants, setVariants] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [recent, setRecent] = useState([])

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchRecent = async () => {
    try {
      const res = await fetch(`${backend}/captions?limit=12`)
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setRecent(data)
    } catch (e) {
      // ignore if backend not ready yet
    }
  }

  useEffect(() => {
    fetchRecent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${backend}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, include_hashtags: includeHashtags, include_emojis: includeEmojis, variants })
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to generate')
      }
      const data = await res.json()
      setResults(data)
      fetchRecent()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard')
    } catch {
      // fallback
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <header className="px-6 py-5 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">B</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Blink-style Caption Generator</h1>
              <p className="text-xs text-gray-500">Create catchy, on-brand captions in seconds</p>
            </div>
          </div>
          <a href="/test" className="text-sm text-indigo-600 hover:text-indigo-700">Check backend</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <section className="grid md:grid-cols-2 gap-6">
          <form onSubmit={onGenerate} className="bg-white rounded-xl shadow-sm p-5 border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Generate captions</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              className="w-full mb-4 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. product launch, fitness tips, weekend vibes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <input
              className="w-full mb-4 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="playful, professional, bold, cozy... (optional)"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} />
                Include hashtags
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} />
                Include emojis
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Variants</label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-24 mb-4 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={variants}
              onChange={(e) => setVariants(Number(e.target.value))}
            />

            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Generating…' : 'Generate'}
            </button>

            <p className="mt-3 text-xs text-gray-500">Backend: {backend}</p>
          </form>

          <div className="bg-white rounded-xl shadow-sm p-5 border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
            {results.length === 0 ? (
              <p className="text-sm text-gray-500">No captions yet. Generate some to see them here.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((c) => (
                  <li key={c.id} className="p-4 rounded-lg border bg-gray-50">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">{c.text}</pre>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => copyToClipboard(c.text)} className="text-xs px-3 py-1 rounded bg-gray-800 text-white hover:bg-black">Copy</button>
                      <span className="text-xs text-gray-500">{c.tone ? `Tone: ${c.tone}` : ''}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Recent captions</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500">No history yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((c) => (
                <div key={c.id} className="p-4 rounded-lg border bg-white">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{c.text}</pre>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{c.topic}</span>
                    <button onClick={() => copyToClipboard(c.text)} className="text-xs px-2 py-1 rounded bg-gray-800 text-white hover:bg-black">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-gray-500">
        Built for rapid content creation. Generate, copy, post.
      </footer>
    </div>
  )
}

export default App
