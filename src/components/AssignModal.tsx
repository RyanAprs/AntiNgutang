import type { Item, Participant } from '../types'
import { formatCurrency } from '../utils/formatter'

interface AssignModalProps {
  item: Item | null
  participants: Participant[]
  onAssign: (itemId: string, participantIds: string[]) => void
  onClose: () => void
}

export default function AssignModal({ item, participants, onAssign, onClose }: AssignModalProps) {
  if (!item) return null

  function toggleParticipant(pid: string) {
    const current = item!.assignedTo
    const next = current.includes(pid)
      ? current.filter((id) => id !== pid)
      : [...current, pid]
    onAssign(item!.id, next)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item.name}</h3>
          <span className="item-price-label">{formatCurrency(item.price)}</span>
        </div>
        <p className="modal-hint">Siapa aja yang pesan ini?</p>

        {participants.length === 0 ? (
          <p className="empty-hint">Tambah peserta dulu ya</p>
        ) : (
          <div className="assign-options">
            {participants.map((p) => (
              <button
                key={p.id}
                className={`assign-btn ${item.assignedTo.includes(p.id) ? 'selected' : ''}`}
                onClick={() => toggleParticipant(p.id)}
              >
                {p.name}
                {item.assignedTo.includes(p.id) && (
                  <span className="check">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        <button className="btn btn-primary" onClick={onClose}>
          Selesai
        </button>
      </div>
    </div>
  )
}
