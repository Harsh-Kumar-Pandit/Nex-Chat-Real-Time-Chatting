import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/AuthRoutes.js'
import contactRoutes from './routes/ContactsRoutes.js'
import setupSocket from './socket.js'
import messagesRoutes from './routes/MessagesRoutes.js'
import channelRoutes from './routes/ChannelRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

dotenv.config({ path: path.join(__dirname, ".env") })
dotenv.config({ path: path.join(repoRoot, ".env"), override: false })

const app = express()
const port = process.env.PORT || 7000
const databaseURL = process.env.MONGODB_URI || process.env.DATABASE_URL
const allowedOrigins = (process.env.ORIGIN || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
const isAllowedOrigin = (requestOrigin) => {
    if (!requestOrigin) return true
    if (allowedOrigins.includes(requestOrigin)) return true
    return /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin)
}

app.use(cors({
    origin: (requestOrigin, callback) => {
        if (isAllowedOrigin(requestOrigin)) {
            callback(null, true)
            return
        }

        callback(new Error(`CORS blocked for origin: ${requestOrigin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(cookieParser())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/channel', channelRoutes)

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

// ✅ Pass app so socket.js can attach io and userSocketMap to it
setupSocket(server, app)

if (!databaseURL) {
    console.error('Missing MongoDB connection string. Set `MONGODB_URI` in `server/.env` or the project root `.env`.')
    process.exit(1)
}

mongoose.connect(databaseURL).then(() => {
    console.log('Connected to MongoDB')
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
})
