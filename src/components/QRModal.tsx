import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import type { Session } from '../lib/supabase'
import { formatCurrency } from '../utils/formatter'

interface QRModalProps {
  sessionId: string
  session: Session | null
  onClose: () => void
}

function calcParticipantTotal(session: Session, assignedItems: string[]) {
  const totalSubtotal = session.participants.reduce((sum, p) => {
    return sum + p.assignedItems.reduce((s, itemId) => {
      const item = session.items.find((i) => i.id === itemId)
      if (!item) return s
      const sharers = session.participants.filter((pp) => pp.assignedItems.includes(itemId)).length
      return s + item.price / sharers
    }, 0)
  }, 0)

  let subtotal = 0
  for (const itemId of assignedItems) {
    const item = session.items.find((i) => i.id === itemId)
    if (!item) continue
    const sharers = session.participants.filter((p) => p.assignedItems.includes(itemId)).length
    subtotal += item.price / Math.max(sharers, 1)
  }

  const ratio = totalSubtotal > 0 ? subtotal / totalSubtotal : 0
  return {
    subtotal,
    tax: session.tax * ratio,
    service: session.service_charge * ratio,
    total: subtotal + session.tax * ratio + session.service_charge * ratio,
  }
}

export default function QRModal({ sessionId, session, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
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

        {total === 0 && (
          <p className="waiting-hint">Menunggu peserta bergabung...</p>
        )}

        {total > 0 && session && (
          <div className="participant-progress">
            <div className="progress-header">
              <p className="progress-label">
                {done} dari {total} selesai pilih
              </p>
              <button
                className="toggle-breakdown"
                onClick={() => setShowBreakdown((v) => !v)}
              >
                {showBreakdown ? 'Sembunyikan' : 'Lihat Detail'}
              </button>
            </div>

            {!showBreakdown && (
              <div className="progress-list">
                {session.participants.map((p) => (
                  <span key={p.id} className={`progress-tag ${p.done ? 'done' : 'pending'}`}>
                    {p.done ? '✓' : '⏳'} {p.name}
                  </span>
                ))}
              </div>
            )}

            {showBreakdown && (
              <div className="breakdown-list">
                {session.participants.map((p) => {
                  const calc = calcParticipantTotal(session, p.assignedItems)
                  const myItems = p.assignedItems
                    .map((id) => session.items.find((i) => i.id === id))
                    .filter(Boolean)

                  return (
                    <div key={p.id} className={`breakdown-card ${p.done ? 'done' : 'pending'}`}>
                      <div className="breakdown-header">
                        <span className="breakdown-name">
                          {p.done ? '✓' : '⏳'} {p.name}
                        </span>
                        <span className="breakdown-total">
                          {formatCurrency(calc.total, session.currency)}
                        </span>
                      </div>

                      {myItems.length > 0 ? (
                        <div className="breakdown-items">
                          {myItems.map((item) => {
                            if (!item) return null
                            const sharers = session.participants.filter((pp) =>
                              pp.assignedItems.includes(item.id),
                            ).length
                            return (
                              <div key={item.id} className="breakdown-item">
                                <span>
                                  {item.name}
                                  {sharers > 1 && (
                                    <span className="breakdown-shared"> (/{sharers})</span>
                                  )}
                                </span>
                                <span>{formatCurrency(item.price / sharers, session.currency)}</span>
                              </div>
                            )
                          })}
                          {(session.tax > 0 || session.service_charge > 0) && (
                            <div className="breakdown-item breakdown-extra">
                              <span>Pajak + Service</span>
                              <span>{formatCurrency(calc.tax + calc.service, session.currency)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="breakdown-empty">Belum memilih item</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <button className="btn btn-outline close-qr-btn" onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  )
}
