import express from 'express';
import http from 'http';
import cors from 'cors';
import startServer from './config/db.js';
import usersRoutes from './routes/users.js';
import chatsRoutes from './routes/chats.js';
import messagesRoutes from './routes/messages.js';
import cookieParser from 'cookie-parser';
import  setupSocket  from "./socket.js"

const app = express();

app.use(cors(
    {
        origin: 'https://chatting-app-six-woad.vercel.app',
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