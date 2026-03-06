import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/AuthRoutes.js'
import contactRoutes from './routes/ContactsRoutes.js'
import setupSocket from './socket.js'
import messagesRoutes from './routes/MessagesRoutes.js'

dotenv.config()

const app = express();
const port = process.env.PORT || 7000;
const databseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.use("/uploads/profiles", express.static("uploads/profiles"))
app.use("/uploads/files", express.static("uploads/files"))

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use('/api/auth', authRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/messages', messagesRoutes)

const server = app.listen(port, ()=>{
    console.log(`Server is running at http://localhost:${port}`);
    
})

setupSocket(server)

mongoose.connect(databseURL).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
})
