# 💬 Real-Time Chat App

A full-stack real-time chat application built with **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **React**. It supports live messaging, image uploads via Cloudinary, message delivery/read status, and soft-delete logic.

---

## 🚀 Features

- 🔄 Real-time messaging with Socket.IO
- ✅ Message status: sent → delivered → read
- 🖼️ Image uploads via Cloudinary
- 🗑️ Soft delete with auto-purge when both users delete
- 📬 Chat summaries with unread count and latest message
- 🟢 Online presence tracking
- 💡 Responsive UI with auto-scroll and sender/receiver alignment

---

## 🛠️ Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Frontend     | React, Socket.IO Client     |
| Backend      | Node.js, Express, Socket.IO |
| Database     | MongoDB + Mongoose          |
| Image Upload | Cloudinary                  |
| Auth         | JWT or session-based        |

---

## ⚙️ Environment Variables
```env
PORT=your_port
MONGO_URL=your_mongo_url
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

### **Frontend (`.env`)**
```env
VITE_BACKEND_URL=your_backend_url
```

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Naing-Lynn-Aung/chatting_app.git
cd chatting-app
```

### 2. Install dependencies
```
Backend
  cd server
  npm install
Frontend
  cd ../client
  npm install
```

### 3. Set up environment variables
```
Backend
  cd server
  npm run dev
Frontend
  cd client
  npm run dev
```
