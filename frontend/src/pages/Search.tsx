import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Header } from '../components/Layout'
import { api } from '../lib/api'
import { BIN_LABELS } from '../lib/i18n'
import { useSession } from '../lib/sessionContext'
import type { Classification, Item } from '../types'

const FEATURED = ['battery', 'plastic takeout container', 'plastic grocery bag', 'pizza box']

export function Search() {
  const { t } = useSession()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Item[]>([])
  const [guess, setGuess] = useState<Classification | null>(null)
  const [picked, setPicked] = useState<Item | null>(null)

  function changeQuery(value: string) {
    setQ(value)
    setGuess(null)
    setPicked(null)
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (q.trim()) api.searchItems(q).then(setResults)
      else setResults([])
    }, 200)
    return () => clearTimeout(handle)
  }, [q])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    if (results.length) return setPicked(results[0])
    setGuess(await api.classify(q))
  }

  return (
    <>
      <Header title={t('searchTitle')} />
      <div className="pad">
        <form onSubmit={submit} className="search">
          <SearchIcon size={18} aria-hidden />
          <input value={q} onChange={(e) => changeQuery(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchTitle')} />
        </form>

        {picked && <ItemCard item={picked} />}

        {!picked && results.length > 0 && (
          <ul className="results">
            {results.map((item) => (
              <li key={item.id}>
                <button onClick={() => setPicked(item)}>
                  <span>{item.name}</span>
                  <span className={`badge b-${item.bin}`}>{BIN_LABELS[item.bin]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!picked && q.trim() && results.length === 0 && !guess && (
          <button className="btn" onClick={submit}>
            <Sparkles size={16} aria-hidden /> Ask the model about “{q}”
          </button>
        )}

        {guess && (
          <div className="card">
            <p className="muted">{t('notFound')}</p>
            <h2 className={`bin-title b-${guess.bin}`}>{BIN_LABELS[guess.bin]}</h2>
            <p>
              {Math.round(guess.confidence * 100)}% {t('confidence')}
              {guess.alternatives.length > 0 &&
                ` · then ${guess.alternatives.map((a) => `${BIN_LABELS[a.bin]} ${Math.round(a.confidence * 100)}%`).join(', ')}`}
            </p>
            <p className="fine">
              <Sparkles size={14} aria-hidden /> {t('modelNote')}
            </p>
          </div>
        )}

        {!q && (
          <>
            <h2 className="section-title">{t('featured')}</h2>
            <div className="featured">
              {FEATURED.map((f) => (
                <button key={f} onClick={() => changeQuery(f)}>{f}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function ItemCard({ item }: { item: Item }) {
  return (
    <div className="card">
      <p className="muted">{item.category}</p>
      <h2 className="item-name">{item.name}</h2>
      <h3 className={`bin-title b-${item.bin}`}>{BIN_LABELS[item.bin]}</h3>
      <p>{item.tip}</p>
    </div>
  )
}
