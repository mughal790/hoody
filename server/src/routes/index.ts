import { Router } from 'express'
import productsRouter from './products'
import categoriesRouter from './categories'
import cartRouter from './cart'
import ordersRouter from './orders'
import wishlistRouter from './wishlist'
import reviewsRouter from './reviews'

const router = Router()

router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

router.use('/products', productsRouter)
router.use('/categories', categoriesRouter)
router.use('/cart', cartRouter)
router.use('/orders', ordersRouter)
router.use('/wishlist', wishlistRouter)
router.use('/reviews', reviewsRouter)

export default router
