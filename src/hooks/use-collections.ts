import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Collection {
  id: string
  slug: string
  name: string
  description: string
  image: string | null
  position: number
  created_at?: string
}

export type CollectionInput = Omit<Collection, 'created_at'> & { id?: string }

const TABLE = 'collections'

export const useCollections = () =>
  useQuery({
    queryKey: ['collections'],
    queryFn: async (): Promise<Collection[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as Collection[]
    },
  })

export const useUpsertCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (c: CollectionInput) => {
      const payload = { ...c }
      if (!payload.id) delete (payload as any).id
      const { data, error } = await supabase
        .from(TABLE)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data as Collection
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  })
}

export const useDeleteCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collections'] }),
  })
}
