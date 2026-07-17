import { useState, useCallback, useEffect } from 'react'
import { useRoute } from 'wouter'
import type { Item, Participant } from './types'
import { useAnalyzeReceipt } from './hooks/useAnalyzeReceipt'
import { createSession, useSessionSync } from './hooks/useSession'
import CameraCapture from './components/CameraCapture'
import ItemList from './components/ItemList'
import Participants from './components/Participants'
import AssignModal from './components/AssignModal'
import Summary from './components/Summary'
import QRModal from './components/QRModal'
import GuestView from './components/GuestView'

const SESSION_STORAGE_KEY = 'antingutang-host-session'

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function HostApp() {
  const [items, setItems] = useState<Item[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [tax, setTax] = useState(0)
  const [serviceCharge, setServiceCharge] = useState(0)
  const [currency, setCurrency] = useState<string | undefined>()
  const [assigningItem, setAssigningItem] = useState<string | null>(null)
  const [step, setStep] = useState<'scan' | 'assign'>('scan')
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem(SESSION_STORAGE_KEY),
  )
  const [showQR, setShowQR] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)
  const [locked, setLocked] = useState(false)

  const { analyzeImage, loading, error, clearError } = useAnalyzeReceipt()
  const { session, lockSession } = useSessionSync(sessionId)

  // Persist sessionId across refreshes
  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    else localStorage.removeItem(SESSION_STORAGE_KEY)
  }, [sessionId])

  // Sync locked state from Supabase
  useEffect(() => {
    if (session?.locked) setLocked(true)
  }, [session?.locked])

  const handleImageCapture = useCallback(async (base64: string) => {
    if (!base64) {
      setItems([])
      setTax(0)
      setServiceCharge(0)
      setCurrency(undefined)
      setStep('scan')
      setSessionId(null)
      setShowQR(false)
      setLocked(false)
      return
    }

    const result = await analyzeImage(base64)
    if (!result) return

    setItems(
      result.items.map((item) => ({
        id: generateId(),
        name: item.name,
        price: item.price,
        assignedTo: [],
      })),
    )
    setTax(result.tax || 0)
    setServiceCharge(result.serviceCharge || 0)
    setCurrency(result.currency || undefined)
    setStep('assign')
    setSessionId(null)
    setLocked(false)
  }, [analyzeImage])

  function addParticipant(name: string) {
    setParticipants((prev) => [...prev, { id: generateId(), name }])
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id))
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((pid) => pid !== id),
      })),
    )
  }

  function assignItem(itemId: string, participantIds: string[]) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, assignedTo: participantIds } : item,
      ),
    )
  }

  async function handleShare() {
    if (sessionId) {
      setShowQR(true)
      return
    }
    setCreatingSession(true)
    try {
      const id = await createSession(items, tax, serviceCharge, currency || 'IDR')
      setSessionId(id)
      setShowQR(true)
    } catch {
      alert('Gagal membuat sesi, coba lagi.')
    } finally {
      setCreatingSession(false)
    }
  }

  async function handleLock() {
    await lockSession()
    setLocked(true)
    setShowQR(false)
  }

  const selectedItem = items.find((i) => i.id === assigningItem) || null
  const participantCount = session?.participants.length ?? 0
  const doneCount = session?.participants.filter((p) => p.done).length ?? 0

  return (
    <div className="app">
      <header className="app-header">
        <h1>AntiNgutang</h1>
        <p className="tagline">Foto struk. Tap siapa pesen apa. Selesai.</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError}>×</button>
        </div>
      )}

      <CameraCapture onImageCapture={handleImageCapture} loading={loading} />

      {loading && step === 'scan' && (
        <div className="item-list">
          <h3>Daftar Item</h3>
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" style={{ width: '70%' }} />
        </div>
      )}

      {step === 'assign' && items.length > 0 && (
        <>
          <div className="session-bar">
            <button
              className="btn btn-secondary share-btn"
              onClick={handleShare}
              disabled={creatingSession || locked}
            >
              {creatingSession
                ? 'Membuat sesi...'
                : sessionId
                  ? 'Lihat QR'
                  : 'Bagikan ke Peserta'}
            </button>

            {sessionId && !locked && (
              <div className="session-status">
                <span className="status-dot" />
                <span className="status-text">
                  {participantCount === 0
                    ? 'Menunggu peserta...'
                    : `${doneCount}/${participantCount} selesai`}
                </span>
                <button
                  className="btn btn-primary lock-inline-btn"
                  onClick={handleLock}
                  disabled={participantCount === 0}
                >
                  Kunci Sesi
                </button>
              </div>
            )}

            {locked && (
              <div className="session-locked">
                Sesi dikunci
              </div>
            )}
          </div>

          <Participants
            participants={participants}
            onAdd={addParticipant}
            onRemove={removeParticipant}
          />
          <ItemList items={items} currency={currency} onAssign={setAssigningItem} />
          <Summary
            items={items}
            participants={participants}
            tax={tax}
            serviceCharge={serviceCharge}
          />
        </>
      )}

      <AssignModal
        item={selectedItem}
        participants={participants}
        onAssign={assignItem}
        onClose={() => setAssigningItem(null)}
      />

      {showQR && sessionId && (
        <QRModal
          sessionId={sessionId}
          session={session}
          onClose={() => setShowQR(false)}
        />
      )}

      <footer className="app-footer">
        <p>AntiNgutang — nggak perlu jadi bendahara dadakan</p>
      </footer>
    </div>
  )
}

export default function App() {
  const [matchJoin, paramsJoin] = useRoute('/join/:id')

  if (matchJoin && paramsJoin?.id) {
    return <GuestView sessionId={paramsJoin.id} />
  }

  return <HostApp />
}
