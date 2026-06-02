import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ProductColor {
  id: string
  product_id: string
  name: string
  value: string
  images: string[]
  position: number
}

export interface ProductVariant {
  id: string
  product_id: string
  color_id: string | null
  size: string
  sku: string | null
  stock: number
  price: number | null
}

export const useProductColors = (productId: string | undefined) =>
  useQuery({
    queryKey: ['product_colors', productId],
    queryFn: async (): Promise<ProductColor[]> => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', productId)
        .order('position', { ascending: true })
      if (error) throw error
      return (data || []) as ProductColor[]
    },
    enabled: !!productId,
  })

export const useProductVariants = (productId: string | undefined) =>
  useQuery({
    queryKey: ['product_variants', productId],
    queryFn: async (): Promise<ProductVariant[]> => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
      if (error) throw error
      return (data || []) as ProductVariant[]
    },
    enabled: !!productId,
  })

/**
 * Replace all colors + variants for a product in a single transactional-ish flow.
 * Strategy: delete missing rows, upsert the rest. Acceptable for admin use.
 */
export interface SaveColorInput {
  id?: string
  name: string
  value: string
  images: string[]
  position: number
  variants: { size: string; stock: number; sku?: string | null; price?: number | null; id?: string }[]
}

export const useSaveProductVariants = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productId,
      colors,
    }: {
      productId: string
      colors: SaveColorInput[]
    }) => {
      // Fetch existing
      const [{ data: existingColors }, { data: existingVariants }] = await Promise.all([
        supabase.from('product_colors').select('id').eq('product_id', productId),
        supabase.from('product_variants').select('id').eq('product_id', productId),
      ])
      const keepColorIds = new Set(colors.filter((c) => c.id).map((c) => c.id!))
      const colorsToDelete = (existingColors || [])
        .map((c: any) => c.id)
        .filter((id: string) => !keepColorIds.has(id))
      if (colorsToDelete.length) {
        await supabase.from('product_colors').delete().in('id', colorsToDelete)
      }

      // Upsert colors and collect ids
      const colorIdMap: Record<number, string> = {}
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i]
        const payload: any = {
          product_id: productId,
          name: c.name,
          value: c.value,
          images: c.images,
          position: c.position,
        }
        if (c.id) payload.id = c.id
        const { data, error } = await supabase
          .from('product_colors')
          .upsert(payload)
          .select()
          .single()
        if (error) throw error
        colorIdMap[i] = (data as any).id
      }

      // Build variants
      const keepVariantIds = new Set<string>()
      const variantRows: any[] = []
      colors.forEach((c, i) => {
        c.variants.forEach((v) => {
          if (v.id) keepVariantIds.add(v.id)
          variantRows.push({
            ...(v.id ? { id: v.id } : {}),
            product_id: productId,
            color_id: colorIdMap[i],
            size: v.size,
            sku: v.sku ?? null,
            stock: v.stock ?? 0,
            price: v.price ?? null,
          })
        })
      })

      const variantsToDelete = (existingVariants || [])
        .map((v: any) => v.id)
        .filter((id: string) => !keepVariantIds.has(id))
      if (variantsToDelete.length) {
        await supabase.from('product_variants').delete().in('id', variantsToDelete)
      }

      if (variantRows.length) {
        const { error } = await supabase
          .from('product_variants')
          .upsert(variantRows, { onConflict: 'product_id,color_id,size' })
        if (error) throw error
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['product_colors', vars.productId] })
      qc.invalidateQueries({ queryKey: ['product_variants', vars.productId] })
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
