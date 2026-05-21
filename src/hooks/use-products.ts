import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  price: number
  image: string
  images: string[]
  category: string
  sizes: string[]
  colors: { name: string; value: string }[]
  description: string
  rating: number
  reviews: number
  stock: number
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) throw error
      return data as Product[]
    }
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Product
    },
    enabled: !!id
  })
}