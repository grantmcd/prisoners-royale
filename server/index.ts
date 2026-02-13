import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API routes
app.use('/api', apiRoutes)

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../dist/client')))

// The "catchall" handler: for any request that doesn't match above, send back React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/client/index.html'))
})

app.listen(PORT, () => {
  console.log(`PRISONER'S ROYALE SERVER RUNNING ON PORT ${PORT}`)
  console.log(`SECTOR: BUNKER-14 | STATUS: ONLINE`)
})
