import { useState, useCallback } from 'react'
import type { Item, Participant } from './types'
import { useGemini } from './hooks/useGemini'
import CameraCapture from './components/CameraCapture'
import ItemList from './components/ItemList'
import Participants from './components/Participants'
import AssignModal from './components/AssignModal'
import Summary from './components/Summary'

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [tax, setTax] = useState(0)
  const [serviceCharge, setServiceCharge] = useState(0)
  const [currency, setCurrency] = useState<string | undefined>()
  const [assigningItem, setAssigningItem] = useState<string | null>(null)
  const [step, setStep] = useState<'scan' | 'assign'>('scan')

  const { analyzeImage, loading, error, clearError } = useGemini()

  const handleImageCapture = useCallback(async (base64: string) => {
    if (!base64) {
      setItems([])
      setTax(0)
      setServiceCharge(0)
      setCurrency(undefined)
      setStep('scan')
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

  const selectedItem = items.find((i) => i.id === assigningItem) || null

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

      {step === 'assign' && items.length > 0 && (
        <>
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

      <footer className="app-footer">
        <p>AntiNgutang — nggak perlu jadi bendahara dadakan</p>
      </footer>
    </div>
  )
}
