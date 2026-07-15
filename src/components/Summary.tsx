import { useState } from 'react'
import type { Item } from '../types'
import { calculateSplit, buildSummaryText } from '../utils/split'
import { formatRupiah } from '../utils/formatter'

interface SummaryProps {
  items: Item[]
  participants: import('../types').Participant[]
  tax: number
  serviceCharge: number
}

export default function Summary({ items, participants, tax, serviceCharge }: SummaryProps) {
  const [copied, setCopied] = useState(false)

  const hasData = items.some((i) => i.assignedTo.length > 0) && participants.length > 0
  if (!hasData) return null

  const totals = calculateSplit(items, participants, tax, serviceCharge)

  async function handleCopy() {
    const text = buildSummaryText(totals, items, tax, serviceCharge)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Gagal copy. Salin manual ya.')
    }
  }

  return (
    <div className="summary">
      <h3>Ringkasan Pembayaran</h3>

      <div className="totals">
        {totals.map((t) => (
          <div key={t.id} className="person-total">
            <div className="person-total-header">
              <span className="person-name">{t.name}</span>
              <span className="person-amount">{formatRupiah(Math.round(t.total))}</span>
            </div>
            <div className="person-detail">
              <span>Subtotal: {formatRupiah(Math.round(t.subtotal))}</span>
              {tax > 0 && <span>Pajak: {formatRupiah(Math.round(t.taxShare))}</span>}
              {serviceCharge > 0 && <span>Service: {formatRupiah(Math.round(t.serviceShare))}</span>}
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary copy-btn" onClick={handleCopy}>
        {copied ? '✓ Tercopy!' : 'Copy Ringkasan'}
      </button>
    </div>
  )
}
