import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const cartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
})

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.userId!)
    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = cartItemSchema.parse(req.body)
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({ ...body, user_id: req.userId! }, { onConflict: 'user_id,product_id,size,color' })
      .select()
      .single()
    if (error) throw createError(error.message, 400)
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = req.body
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single()
    if (error || !data) throw createError('Cart item not found', 404)
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
    if (error) throw error
    res.status(204).end()
  } catch (err) { next(err) }
})

router.delete('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await supabase.from('cart_items').delete().eq('user_id', req.userId!)
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
