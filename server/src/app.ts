import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import router from './routes'
import { errorHandler, notFound } from './middleware/errorHandler'

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [
    process.env.CLOUDFLARE_URL || 'http://localhost:5173',
    'http://localhost:4173',
    /\.pages\.dev$/,
    /\.hoody\.com$/,
  ],
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

// Serve built frontend in production
const distPublic = path.join(__dirname, '../../dist/public')
app.use(express.static(distPublic))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPublic, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found' })
  })
})

app.use(notFound)
app.use(errorHandler)

export default app
