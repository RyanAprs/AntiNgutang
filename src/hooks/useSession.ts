import { useEffect, useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { supabase } from '../lib/supabase'
import type { Session, SessionParticipant } from '../lib/supabase'
import type { Item } from '../types'

export async function createSession(
  items: Item[],
  tax: number,
  serviceCharge: number,
  currency: string,
): Promise<string> {
  const id = nanoid(8)
  const { error } = await supabase.from('sessions').insert({
    id,
    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price })),
    tax,
    service_charge: serviceCharge,
    currency: currency || 'IDR',
    participants: [],
    locked: false,
  })
  if (error) throw new Error(error.message)
  return id
}

export function useSessionSync(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
      .then(({ data, error }) => {
        if (error) setError('Sesi tidak ditemukan')
        else setSession(data as Session)
        setLoading(false)
      })

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => setSession(payload.new as Session),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  const addParticipant = useCallback(
    async (name: string): Promise<SessionParticipant> => {
      if (!session) throw new Error('No session')
      const participant: SessionParticipant = {
        id: nanoid(6),
        name,
        assignedItems: [],
        done: false,
      }
      const updated = [...session.participants, participant]
      const { error } = await supabase
        .from('sessions')
        .update({ participants: updated })
        .eq('id', session.id)
      if (error) throw new Error(error.message)
      return participant
    },
    [session],
  )

  const updateAssignedItems = useCallback(
    async (participantId: string, assignedItems: string[]) => {
      if (!session) return
      const updated = session.participants.map((p) =>
        p.id === participantId ? { ...p, assignedItems } : p,
      )
      await supabase.from('sessions').update({ participants: updated }).eq('id', session.id)
    },
    [session],
  )

  const markDone = useCallback(
    async (participantId: string) => {
      if (!session) return
      const updated = session.participants.map((p) =>
        p.id === participantId ? { ...p, done: true } : p,
      )
      await supabase.from('sessions').update({ participants: updated }).eq('id', session.id)
    },
    [session],
  )

  const lockSession = useCallback(async () => {
    if (!session) return
    await supabase.from('sessions').update({ locked: true }).eq('id', session.id)
  }, [session])

  return { session, loading, error, addParticipant, updateAssignedItems, markDone, lockSession }
}
