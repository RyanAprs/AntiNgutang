import { useState, useEffect } from 'react'
import { useSessionSync } from '../hooks/useSession'
import { formatCurrency } from '../utils/formatter'
import { calculateSplit } from '../utils/split'
import type { Item, Participant } from '../types'

interface GuestViewProps {
  sessionId: string
}

export default function GuestView({ sessionId }: GuestViewProps) {
  const { session, loading, error, addParticipant, updateAssignedItems, markDone } =
    useSessionSync(sessionId)

  const [myId, setMyId] = useState<string | null>(() =>
    sessionStorage.getItem(`session-${sessionId}-participantId`),
  )
  const [nameInput, setNameInput] = useState('')
  const [joining, setJoining] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const me = session?.participants.find((p) => p.id === myId) ?? null

  useEffect(() => {
    if (myId) sessionStorage.setItem(`session-${sessionId}-participantId`, myId)
  }, [myId, sessionId])

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    setJoining(true)
    try {
      const p = await addParticipant(name)
      setMyId(p.id)
    } catch {
      alert('Gagal bergabung, coba lagi.')
    } finally {
      setJoining(false)
    }
  }

  function toggleItem(itemId: string) {
    if (!me || session?.locked) return
    const current = me.assignedItems
    const next = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId]
    updateAssignedItems(me.id, next)
  }

  async function handleDone() {
    if (!me) return
    setSubmitting(true)
    await markDone(me.id)
    setSubmitting(false)
  }

  if (loading) {
    return <div className="guest-loading">Memuat sesi...</div>
  }

  if (error || !session) {
    return (
      <div className="guest-error">
        <h2>Sesi tidak ditemukan</h2>
        <p>Link sudah expired atau tidak valid.</p>
      </div>
    )
  }

  if (!myId || !me) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>AntiNgutang</h1>
          <p className="tagline">Pilih item yang kamu pesan</p>
        </header>
        <div className="guest-join">
          <h2>Siapa kamu?</h2>
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Masukkan namamu..."
              maxLength={30}
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!nameInput.trim() || joining}
            >
              {joining ? 'Bergabung...' : 'Bergabung'}
            </button>
          </form>
        </div>
        <footer className="app-footer">
          <p>AntiNgutang — nggak perlu jadi bendahara dadakan</p>
        </footer>
      </div>
    )
  }

  if (session.locked) {
    const items: Item[] = session.items.map((i) => ({
      ...i,
      assignedTo: session.participants
        .filter((p) => p.assignedItems.includes(i.id))
        .map((p) => p.id),
    }))
    const participants: Participant[] = session.participants.map((p) => ({
      id: p.id,
      name: p.name,
    }))
    const splits = calculateSplit(items, participants, session.tax, session.service_charge)
    const mySplit = splits.find((s) => s.id === myId)
    const myItems = items.filter((i) => i.assignedTo.includes(myId))

    return (
      <div className="app">
        <header className="app-header">
          <h1>AntiNgutang</h1>
        </header>
        <div className="guest-summary">
          <h2>Tagihan kamu, {me.name}</h2>
          <div className="my-items">
            {myItems.map((item) => {
              const sharers = item.assignedTo.length
              const share = item.price / sharers
              return (
                <div key={item.id} className="summary-item">
                  <span>{item.name}{sharers > 1 ? ` (/${sharers})` : ''}</span>
                  <span>{formatCurrency(share, session.currency)}</span>
                </div>
              )
            })}
          </div>
          {mySplit && (
            <div className="my-total">
              {session.tax > 0 && (
                <div className="summary-item">
                  <span>Pajak</span>
                  <span>{formatCurrency(mySplit.taxShare, session.currency)}</span>
                </div>
              )}
              {session.service_charge > 0 && (
                <div className="summary-item">
                  <span>Service</span>
                  <span>{formatCurrency(mySplit.serviceShare, session.currency)}</span>
                </div>
              )}
              <div className="summary-item total-row">
                <span>Total kamu</span>
                <span>{formatCurrency(mySplit.total, session.currency)}</span>
              </div>
            </div>
          )}
        </div>
        <footer className="app-footer">
          <p>AntiNgutang — nggak perlu jadi bendahara dadakan</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AntiNgutang</h1>
        <p className="tagline">Halo, {me.name}! Tap item yang kamu pesan.</p>
      </header>

      {me.done ? (
        <div className="guest-done-banner">
          ✓ Kamu sudah selesai memilih. Menunggu host mengunci sesi...
        </div>
      ) : (
        <div className="guest-item-list">
          {session.items.map((item) => {
            const selected = me.assignedItems.includes(item.id)
            const otherPickers = session.participants.filter(
              (p) => p.id !== myId && p.assignedItems.includes(item.id),
            )
            const totalPickers = otherPickers.length + (selected ? 1 : 0)
            const pricePerPerson = item.price / Math.max(totalPickers, 1)

            return (
              <button
                key={item.id}
                className={`guest-item-btn ${selected ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="guest-item-main">
                  <span className="item-name">{item.name}</span>
                  {otherPickers.length > 0 && (
                    <span className="item-other-pickers">
                      {otherPickers.map((p) => p.name).join(', ')} juga pesan
                    </span>
                  )}
                </div>
                <div className="guest-item-price-col">
                  {totalPickers > 1 ? (
                    <>
                      <span className="item-price-per">{formatCurrency(pricePerPerson, session.currency)}/org</span>
                      <span className="item-price-full">{formatCurrency(item.price, session.currency)}</span>
                    </>
                  ) : (
                    <span className="item-price">{formatCurrency(item.price, session.currency)}</span>
                  )}
                  {selected && <span className="item-check">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {!me.done && (
        <div className="guest-actions">
          <p className="selected-count">
            {me.assignedItems.length} item dipilih
          </p>
          <button
            className="btn btn-primary"
            onClick={handleDone}
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : 'Selesai Pilih'}
          </button>
        </div>
      )}

      <footer className="app-footer">
        <p>AntiNgutang — nggak perlu jadi bendahara dadakan</p>
      </footer>
    </div>
  )
}
