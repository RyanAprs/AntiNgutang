import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import type { Session } from '../lib/supabase'

interface QRModalProps {
  sessionId: string
  session: Session | null
  onClose: () => void
}

export default function QRModal({ sessionId, session, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)
  const joinUrl = `${window.location.origin}/join/${sessionId}`

  const total = session?.participants.length ?? 0
  const done = session?.participants.filter((p) => p.done).length ?? 0

  function copyLink() {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Bagikan ke Peserta</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p className="qr-hint">Minta semua orang scan QR ini atau buka linknya</p>

        <div className="qr-code-wrapper">
          <QRCodeSVG value={joinUrl} size={200} />
        </div>

        <button className="btn btn-secondary copy-link-btn" onClick={copyLink}>
          {copied ? '✓ Link disalin!' : 'Salin Link'}
        </button>

        <div className="qr-join-url">{joinUrl}</div>

        {total > 0 && (
          <div className="participant-progress">
            <p className="progress-label">Status peserta:</p>
            <div className="progress-list">
              {session!.participants.map((p) => (
                <span key={p.id} className={`progress-tag ${p.done ? 'done' : 'pending'}`}>
                  {p.done ? '✓' : '⏳'} {p.name}
                </span>
              ))}
            </div>
            <p className="progress-count">{done} dari {total} sudah selesai pilih</p>
          </div>
        )}

        {total === 0 && (
          <p className="waiting-hint">Menunggu peserta bergabung...</p>
        )}

        <button className="btn btn-outline close-qr-btn" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  )
}
