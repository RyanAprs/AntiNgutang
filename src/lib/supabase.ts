import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SessionParticipant {
  id: string
  name: string
  assignedItems: string[]
  done: boolean
}

export interface Session {
  id: string
  items: { id: string; name: string; price: number }[]
  tax: number
  service_charge: number
  currency: string
  participants: SessionParticipant[]
  locked: boolean
  created_at: string
}
