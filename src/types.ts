export interface Item {
  id: string
  name: string
  price: number
  assignedTo: string[]
}

export interface Participant {
  id: string
  name: string
}

export interface ReceiptData {
  items: Item[]
  tax: number
  serviceCharge: number
  currency?: string
}

export interface PersonTotal {
  id: string
  name: string
  subtotal: number
  taxShare: number
  serviceShare: number
  total: number
}
