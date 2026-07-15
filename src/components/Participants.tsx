import { useState } from 'react'
import type { Participant } from '../types'

interface ParticipantsProps {
  participants: Participant[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

export default function Participants({ participants, onAdd, onRemove }: ParticipantsProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setName('')
  }

  return (
    <div className="participants">
      <h3>Peserta</h3>
      <form onSubmit={handleSubmit} className="add-participant">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama peserta..."
          maxLength={30}
        />
        <button type="submit" className="btn btn-small btn-primary" disabled={!name.trim()}>
          Tambah
        </button>
      </form>
      <div className="participant-tags">
        {participants.map((p) => (
          <span key={p.id} className="participant-tag">
            {p.name}
            <button
              className="tag-remove"
              onClick={() => onRemove(p.id)}
              aria-label={`Hapus ${p.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
