import 'dotenv/config'
import app from './app'

const PORT = parseInt(process.env.PORT || '3001', 10)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Hoody API running on http://0.0.0.0:${PORT}`)
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`)
})
