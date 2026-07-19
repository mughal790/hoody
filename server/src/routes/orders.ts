import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { createError } from '../middleware/errorHandler'

const router = Router()

const orderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    size: z.string().optional(),
    color: z.string().optional(),
  })),
  shipping_address: z.object({
    full_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
  payment_method: z.string().default('card'),
})

router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, slug))')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

router.get('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, slug))')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single()
    if (error || !data) throw createError('Order not found', 404)
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const body = orderSchema.parse(req.body)
    const total = body.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: req.userId!,
        total_amount: total,
        shipping_address: body.shipping_address,
        payment_method: body.payment_method,
        status: 'confirmed',
        payment_status: 'paid',
      })
      .select()
      .single()

    if (error) throw createError(error.message, 400)

    const orderItems = body.items.map((item) => ({ ...item, order_id: order.id }))
    await supabase.from('order_items').insert(orderItems)

    res.status(201).json(order)
  } catch (err) { next(err) }
})

export default router
