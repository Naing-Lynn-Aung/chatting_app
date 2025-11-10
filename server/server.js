import express from 'express';
import http from 'http';
import cors from 'cors';
import startServer from './config/db.js';
import usersRoutes from './routes/users.js';
import chatsRoutes from './routes/chats.js';
import messagesRoutes from './routes/messages.js';
import cookieParser from 'cookie-parser';
import path from 'path'
import { fileURLToPath } from "url";
import  setupSocket  from "./socket.js"

const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));
const server = http.createServer(app);

setupSocket(server)

app.use(cookieParser())
app.use(express.json());

app.use('/api/users', usersRoutes)
app.use("/api/chats", chatsRoutes);
app.use("/api/messages", messagesRoutes);

startServer(server);