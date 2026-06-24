import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ProductColor {
  name: string
  value: string
}

export type SizeChartRow = Record<string, string | number | null>

export interface Product {
  id: string
  name: string
  price: number
  image: string
  images: string[]
  archive_image?: string | null
  archive_hover_image?: string | null
  category: string
  sizes: string[]
  colors: ProductColor[]
  size_chart?: SizeChartRow[]
  description: string
  rating: number
  reviews: number
  stock: number
  published?: boolean
  scheduled_at?: string | null
  collection_id?: string | null
  printful_product_id?: string | null
  created_at?: string
  updated_at?: string
}

const TABLE = 'products'

const normalizeProduct = (product: Product): Product => ({
  ...product,
  price: Number(product.price) || 0,
  images: product.images || [],
  archive_image: product.archive_image ?? null,
  archive_hover_image: product.archive_hover_image ?? null,
  sizes: product.sizes || [],
  colors: product.colors || [],
  size_chart: Array.isArray(product.size_chart) ? product.size_chart : [],
  rating: Number(product.rating) || 0,
  reviews: Number(product.reviews) || 0,
  stock: Number(product.stock) || 0,
  scheduled_at: product.scheduled_at ?? null,
})

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return ((data || []) as Product[]).map(normalizeProduct)
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
      return data ? normalizeProduct(data as Product) : null
    },
    enabled: !!id,
  })
}

export type ProductInput = Omit<Product, 'created_at' | 'updated_at'>

const productPayload = (p: ProductInput) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image: p.image,
  images: p.images,
  archive_image: p.archive_image ?? null,
  archive_hover_image: p.archive_hover_image ?? null,
  category: p.category,
  sizes: p.sizes,
  colors: p.colors,
  size_chart: p.size_chart ?? [],
  description: p.description,
  rating: p.rating,
  reviews: p.reviews,
  stock: p.stock,
  published: p.published ?? true,
  scheduled_at: p.scheduled_at ?? null,
  collection_id: p.collection_id ?? null,
  printful_product_id: p.printful_product_id ?? null,
})

export const useUpsertProduct = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (p: ProductInput) => {
      const { data, error } = await supabase
        .from(TABLE)
        .upsert(productPayload(p), { onConflict: 'id' })
        .select()
        .single()
      if (error) throw error
      return normalizeProduct(data as Product)
    },
    onSuccess: (product) => {
      qc.setQueryData(['product', product.id], product)
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product', product.id] })
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
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: ['product', id] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
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
