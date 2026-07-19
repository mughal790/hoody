import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sizes, colors, sort = 'created_at', order = 'desc', page = '1', limit = '24', search, isNew, onSale } = req.query

    let query = supabase
      .from('products')
      .select('*, categories(id, name, slug)', { count: 'exact' })

    if (category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
      if (cat) query = query.eq('category_id', cat.id)
    }
    if (minPrice) query = query.gte('price', Number(minPrice))
    if (maxPrice) query = query.lte('price', Number(maxPrice))
    if (search) query = query.ilike('name', `%${search}%`)
    if (isNew === 'true') query = query.eq('is_new', true)
    if (onSale === 'true') query = query.eq('is_sale', true)

    const pageNum = parseInt(page as string) || 1
    const limitNum = parseInt(limit as string) || 24
    query = query.range((pageNum - 1) * limitNum, pageNum * limitNum - 1)

    const validSorts: Record<string, string> = {
      newest: 'created_at',
      'price-asc': 'price',
      'price-desc': 'price',
      rating: 'rating',
      popular: 'review_count',
    }
    const sortCol = validSorts[sort as string] || 'created_at'
    const asc = sort === 'price-asc'
    query = query.order(sortCol, { ascending: asc })

    const { data, error, count } = await query
    if (error) throw createError(error.message, 500)

    res.json({ data, total: count || 0, page: pageNum, limit: limitNum, totalPages: Math.ceil((count || 0) / limitNum) })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('slug', req.params.slug)
      .single()

    if (error || !data) throw createError('Product not found', 404)
    res.json(data)
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id/related
router.get('/:id/related', async (req, res, next) => {
  try {
    const { data: product } = await supabase.from('products').select('category_id').eq('id', req.params.id).single()
    if (!product) throw createError('Product not found', 404)

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .neq('id', req.params.id)
      .limit(8)

    res.json(data || [])
  } catch (err) {
    next(err)
  }
})

export default router
