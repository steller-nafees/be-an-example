import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ProductColor {
  name: string
  value: string
}

export interface Product {
  id: string
  name: string
  price: number
  image: string
  images: string[]
  category: string
  sizes: string[]
  colors: ProductColor[]
  description: string
  rating: number
  reviews: number
  stock: number
  published?: boolean
  created_at?: string
}

const TABLE = 'products'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as Product[]
    },
  })
}

export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      if (!id) return null
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as Product | null
    },
    enabled: !!id,
  })
}

export type ProductInput = Omit<Product, 'created_at'>

export const useUpsertProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: ProductInput) => {
      const { data, error } = await supabase
        .from(TABLE)
        .upsert(p, { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}

export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

/** Upload an image to the product-images bucket and return its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
