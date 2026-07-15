import type { Item, Participant, PersonTotal } from '../types'

export function calculateSplit(
  items: Item[],
  participants: Participant[],
  tax: number,
  serviceCharge: number,
): PersonTotal[] {
  const totals: Record<string, number> = {}
  for (const p of participants) totals[p.id] = 0

  for (const item of items) {
    if (item.assignedTo.length === 0) continue
    const share = item.price / item.assignedTo.length
    for (const pid of item.assignedTo) {
      totals[pid] = (totals[pid] || 0) + share
    }
  }

  const totalSubtotal = Object.values(totals).reduce((a, b) => a + b, 0)

  return participants.map((p) => {
    const subtotal = totals[p.id] || 0
    const ratio = totalSubtotal > 0 ? subtotal / totalSubtotal : 0
    const taxShare = tax * ratio
    const serviceShare = serviceCharge * ratio
    return {
      id: p.id,
      name: p.name,
      subtotal,
      taxShare,
      serviceShare,
      total: subtotal + taxShare + serviceShare,
    }
  })
}

export function buildSummaryText(
  personTotals: PersonTotal[],
  items: Item[],
  tax: number,
  serviceCharge: number,
): string {
  const lines: string[] = []
  lines.push('📋 *AntiNgutang - Bill Split*')
  lines.push('')

  for (const pt of personTotals) {
    const personItems = items.filter((i) => i.assignedTo.includes(pt.id))
    const itemNames = personItems
      .map((i) => {
        const sharers = i.assignedTo.length
        const share = i.price / sharers
        const shareText =
          sharers > 1
            ? ` (/${sharers} = ${formatAmount(share)})`
            : ''
        return `  • ${i.name}${shareText}`
      })
      .join('\n')

    lines.push(`*${pt.name}*`)
    lines.push(itemNames)
    lines.push(`  Subtotal: ${formatAmount(pt.subtotal)}`)
    if (tax > 0) lines.push(`  Pajak: ${formatAmount(pt.taxShare)}`)
    if (serviceCharge > 0)
      lines.push(`  Service: ${formatAmount(pt.serviceShare)}`)
    lines.push(`  *Total: ${formatAmount(pt.total)}*`)
    lines.push('')
  }

  lines.push(`---`)
  lines.push(`Total tagihan: ${formatAmount(personTotals.reduce((s, p) => s + p.total, 0))}`)
  lines.push(`Pajak: ${formatAmount(tax)} | Service: ${formatAmount(serviceCharge)}`)

  return lines.join('\n')
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}
