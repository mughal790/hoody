import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120),
  body: z.string().max(2000),
})

router.get('/product/:productId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = reviewSchema.parse(req.body)
    const existing = await supabase.from('reviews').select('id').eq('product_id', body.product_id).eq('user_id', req.userId!).single()
    if (existing.data) throw createError('You have already reviewed this product', 409)

    const { data, error } = await supabase
      .from('reviews')
      .insert({ ...body, user_id: req.userId! })
      .select()
      .single()

    if (error) throw createError(error.message, 400)

    const { data: reviews } = await supabase.from('reviews').select('rating').eq('product_id', body.product_id)
    if (reviews) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      await supabase.from('products').update({ rating: avg, review_count: reviews.length }).eq('id', body.product_id)
    }

    res.status(201).json(data)
  } catch (err) { next(err) }
})

export default router
