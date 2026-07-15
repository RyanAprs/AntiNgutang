import type { Item } from '../types'
import { formatCurrency } from '../utils/formatter'

interface ItemListProps {
  items: Item[]
  currency?: string
  onAssign: (itemId: string) => void
}

export default function ItemList({ items, currency, onAssign }: ItemListProps) {
  if (!items.length) return null

  return (
    <div className="item-list">
      <h3>Daftar Item</h3>
      <p className="hint">Tap item untuk assign ke peserta</p>
      <div className="items">
        {items.map((item) => (
          <button
            key={item.id}
            className={`item-card ${item.assignedTo.length > 0 ? 'assigned' : ''}`}
            onClick={() => onAssign(item.id)}
          >
            <span className="item-name">{item.name}</span>
            <span className="item-price">{formatCurrency(item.price, currency)}</span>
            {item.assignedTo.length > 0 && (
              <span className="item-assignees">
                {item.assignedTo.length} orang
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
