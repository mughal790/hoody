import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { requireAuth, type AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*, products(*)')
      .eq('user_id', req.userId!)
    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { product_id } = req.body
    const { data, error } = await supabase
      .from('wishlist_items')
      .upsert({ user_id: req.userId!, product_id }, { onConflict: 'user_id,product_id' })
      .select()
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.delete('/:productId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await supabase.from('wishlist_items').delete().eq('user_id', req.userId!).eq('product_id', req.params.productId)
    res.status(204).end()
  } catch (err) { next(err) }
})

export default router
